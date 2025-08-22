// backend/src/cronjobs.js
const cron = require('node-cron');
const WeatherData = require('../models/WeatherData');
const Prediction = require('../models/Prediction');
const User = require('../models/User');
const mlService = require('../ml/MLService');
const logger = require('../utils/logger');
const axios = require('axios');

// Export using CommonJS
module.exports = {
  startCronJobs
};

function startCronJobs() {
  if (process.env.NODE_ENV === 'production') {
    logger.info('Cron jobs disabled in production environment');
    return;
  }

  logger.info('Starting cron jobs...');

  // Update weather data every hour
  cron.schedule('0 * * * *', async () => {
    logger.info('Running hourly weather update...');
    await updateWeatherData();
  });

  // Generate daily predictions at 6 AM
  cron.schedule('0 6 * * *', async () => {
    logger.info('Running daily prediction generation...');
    await generateDailyPredictions();
  });

  // Clean up old data weekly (Sunday at 2 AM)
  cron.schedule('0 2 * * 0', async () => {
    logger.info('Running weekly data cleanup...');
    await cleanupOldData();
  });

  // Retrain models monthly (1st day at 3 AM)
  cron.schedule('0 3 1 * *', async () => {
    logger.info('Running monthly model retraining...');
    await retrainModels();
  });

  // Send prediction notifications daily at 7 AM
  cron.schedule('0 7 * * *', async () => {
    logger.info('Sending daily prediction notifications...');
    await sendPredictionNotifications();
  });

  logger.info('Cron jobs started successfully');
}

async function updateWeatherData() {
  try {
    // Get unique locations from users
    const locations = await User.aggregate([
      {
        $group: {
          _id: {
            country: '$location.country',
            region: '$location.region'
          },
          coordinates: { $first: '$location.coordinates' },
          count: { $sum: 1 }
        }
      },
      { $match: { count: { $gte: 1 } } }
    ]);

    logger.info(`Updating weather data for ${locations.length} locations`);

    for (const location of locations) {
      try {
        await updateLocationWeather(
          location.coordinates.lat,
          location.coordinates.lng,
          location._id.country,
          location._id.region
        );
        
        // Add delay to avoid API rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        logger.error(`Failed to update weather for ${location._id.region}, ${location._id.country}:`, error);
      }
    }

    logger.info('Weather data update completed');
  } catch (error) {
    logger.error('Weather update cron job failed:', error);
  }
}

async function updateLocationWeather(lat, lng, country, region) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  
  if (!apiKey) {
    logger.warn('OpenWeather API key not configured, skipping weather update');
    return;
  }

  try {
    // Current weather
    const currentResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`
    );

    // 5-day forecast
    const forecastResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`
    );

    const current = currentResponse.data;
    const forecast = forecastResponse.data;

    // Process forecast data
    const dailyForecast = [];
    const processedDates = new Set();

    forecast.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const dateString = date.toDateString();

      if (!processedDates.has(dateString) && dailyForecast.length < 5) {
        dailyForecast.push({
          date: date,
          temperature: {
            min: item.main.temp_min,
            max: item.main.temp_max
          },
          humidity: item.main.humidity,
          rainfall: item.rain ? item.rain['3h'] || 0 : 0,
          condition: item.weather[0].description,
          icon: item.weather[0].icon
        });
        processedDates.add(dateString);
      }
    });

    // Update or create weather data
    await WeatherData.findOneAndUpdate(
      {
        'location.country': country,
        'location.region': region
      },
      {
        location: {
          country,
          region,
          coordinates: { lat, lng }
        },
        current: {
          temperature: current.main.temp,
          humidity: current.main.humidity,
          pressure: current.main.pressure,
          windSpeed: current.wind.speed,
          rainfall: current.rain ? current.rain['1h'] || 0 : 0,
          condition: current.weather[0].description,
          icon: current.weather[0].icon
        },
        forecast: dailyForecast,
        source: 'openweather',
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );

    logger.info(`Weather updated for ${region}, ${country}`);
  } catch (error) {
    logger.error(`Failed to fetch weather for ${region}, ${country}:`, error);
  }
}

async function generateDailyPredictions() {
  try {
    // Initialize ML service if not already done
    if (!mlService.isInitialized) {
      await mlService.initialize();
    }

    // Get all users
    const users = await User.find({}).limit(100); // Limit for performance

    logger.info(`Generating predictions for ${users.length} users`);

    for (const user of users) {
      try {
        await generateUserPredictions(user);
        
        // Add delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        logger.error(`Failed to generate predictions for user ${user._id}:`, error);
      }
    }

    logger.info('Daily prediction generation completed');
  } catch (error) {
    logger.error('Daily prediction cron job failed:', error);
  }
}

async function generateUserPredictions(user) {
  const { location } = user;

  // Get latest weather data for user's location
  const weatherData = await WeatherData.findOne({
    'location.country': location.country,
    'location.region': location.region
  }).sort({ lastUpdated: -1 });

  if (!weatherData) {
    logger.warn(`No weather data found for ${location.region}, ${location.country}`);
    return;
  }

  // Generate flood prediction
  try {
    const floodInput = {
      rainfall24h: weatherData.current.rainfall,
      rainfall7d: weatherData.forecast.slice(0, 7).reduce((sum, day) => sum + day.rainfall, 0),
      rainfall30d: 100,
      temperature: weatherData.current.temperature,
      humidity: weatherData.current.humidity,
      pressure: weatherData.current.pressure,
      elevation: 200,
      slope: 5,
      soilType: 2,
      riverDistance: 5000,
      drainageDensity: 2,
      ndvi: 0.6,
      landCover: 3
    };

    const floodPrediction = await mlService.predictFlood(floodInput);
    
    // Save prediction if confidence is above threshold
    if (floodPrediction.confidence > 0.7) {
      const prediction = new Prediction({
        type: 'flood',
        location: location,
        prediction: {
          value: floodPrediction.prediction,
          confidence: floodPrediction.confidence,
          severity: floodPrediction.severity
        },
        timeframe: floodPrediction.timeframe,
        modelInfo: floodPrediction.modelInfo,
        inputData: floodInput
      });

      await prediction.save();
    }
  } catch (error) {
    logger.error(`Flood prediction failed for user ${user._id}:`, error);
  }

  // Generate drought prediction
  try {
    const droughtInput = {
      temperatureAvg: weatherData.current.temperature,
      temperatureMax: weatherData.current.temperature + 5,
      temperatureMin: weatherData.current.temperature - 5,
      rainfall30d: 50,
      rainfall60d: 120,
      rainfall90d: 200,
      humidity: weatherData.current.humidity,
      evapotranspiration: 5,
      soilMoisture: 40,
      groundwaterLevel: 20,
      ndvi: 0.4,
      vhi: 0.5,
      season: Math.floor((new Date().getMonth()) / 3),
      elevation: 300
    };

    const droughtPrediction = await mlService.predictDrought(droughtInput);
    
    if (droughtPrediction.confidence > 0.7) {
      const prediction = new Prediction({
        type: 'drought',
        location: location,
        prediction: {
          value: droughtPrediction.prediction,
          confidence: droughtPrediction.confidence,
          severity: droughtPrediction.severity
        },
        timeframe: droughtPrediction.timeframe,
        modelInfo: droughtPrediction.modelInfo,
        inputData: droughtInput
      });

      await prediction.save();
    }
  } catch (error) {
    logger.error(`Drought prediction failed for user ${user._id}:`, error);
  }
}

async function cleanupOldData() {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);

    // Clean up old weather data (keep last 30 days)
    const weatherDeleted = await WeatherData.deleteMany({
      createdAt: { $lt: thirtyDaysAgo }
    });

    // Clean up old expired predictions (keep last 6 months)
    const predictionsDeleted = await Prediction.deleteMany({
      status: 'expired',
      createdAt: { $lt: sixMonthsAgo }
    });

    logger.info(`Cleanup completed: ${weatherDeleted.deletedCount} weather records, ${predictionsDeleted.deletedCount} predictions deleted`);
  } catch (error) {
    logger.error('Data cleanup cron job failed:', error);
  }
}

async function retrainModels() {
  try {
    logger.info('Starting monthly model retraining...');
    
    await mlService.retrainModels();
    
    logger.info('Model retraining completed successfully');
  } catch (error) {
    logger.error('Model retraining cron job failed:', error);
  }
}

async function sendPredictionNotifications() {
  try {
    // Get high-risk predictions from last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const highRiskPredictions = await Prediction.find({
      createdAt: { $gte: yesterday },
      'prediction.severity': { $in: ['high', 'medium'] },
      'prediction.confidence': { $gte: 0.7 },
      status: 'active'
    }).populate('notifications.userId', 'email name preferences');

    logger.info(`Found ${highRiskPredictions.length} high-risk predictions to notify`);

    for (const prediction of highRiskPredictions) {
      // Find users in the same location who haven't been notified
      const usersToNotify = await User.find({
        'location.country': prediction.location.country,
        'location.region': prediction.location.region,
        'preferences.notifications.email': true,
        _id: { $nin: prediction.notifications.map(n => n.userId) }
      });

      for (const user of usersToNotify) {
        try {
          // Send notification
          await sendNotificationToUser(user, prediction);
          
          // Record notification
          prediction.notifications.push({
            userId: user._id,
            sentAt: new Date(),
            method: 'email'
          });
        } catch (error) {
          logger.error(`Failed to send notification to user ${user._id}:`, error);
        }
      }

      if (prediction.notifications.length > 0) {
        await prediction.save();
      }
    }

    logger.info('Prediction notifications sent successfully');
  } catch (error) {
    logger.error('Notification cron job failed:', error);
  }
}

async function sendNotificationToUser(user, prediction) {
  logger.info(`Notification sent to ${user.email}: ${prediction.type} prediction with ${prediction.prediction.severity} severity`);
}