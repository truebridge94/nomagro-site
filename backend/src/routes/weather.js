import express from 'express';
import axios from 'axios';
import auth from '../middleware/auth.js';
import WeatherData from '../models/WeatherData.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Get weather data for user's location
router.get('/', auth, async (req, res) => {
  try {
    const { country, region, coordinates } = req.user.location;
    
    // Check if we have recent weather data (less than 1 hour old)
    const recentWeather = await WeatherData.findOne({
      'location.country': country,
      'location.region': region,
      lastUpdated: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
    });
    
    if (recentWeather) {
      return res.json({
        success: true,
        data: recentWeather,
        cached: true
      });
    }
    
    // Fetch fresh weather data
    const weatherData = await fetchWeatherData(coordinates.lat, coordinates.lng, country, region);
    
    res.json({
      success: true,
      data: weatherData,
      cached: false
    });
  } catch (error) {
    logger.error('Weather data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather data'
    });
  }
});

// Get weather data for specific location
router.get('/location/:lat/:lng', auth, async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const { country, region } = req.query;
    
    const weatherData = await fetchWeatherData(
      parseFloat(lat), 
      parseFloat(lng), 
      country || 'Unknown', 
      region || 'Unknown'
    );
    
    res.json({
      success: true,
      data: weatherData
    });
  } catch (error) {
    logger.error('Location weather error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather data for location'
    });
  }
});

// Get historical weather data
router.get('/historical', auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const { country, region } = req.user.location;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const historicalData = await WeatherData.find({
      'location.country': country,
      'location.region': region,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: historicalData
    });
  } catch (error) {
    logger.error('Historical weather error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch historical weather data'
    });
  }
});

// Fetch weather data from external API
async function fetchWeatherData(lat, lng, country, region) {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenWeather API key not configured');
    }
    
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
    
    // Process forecast data (group by day)
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
    
    // Create weather data object
    const weatherData = new WeatherData({
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
    });
    
    // Save to database
    await weatherData.save();
    
    return weatherData;
  } catch (error) {
    logger.error('External weather API error:', error);
    
    // Return mock data if API fails
    return createMockWeatherData(lat, lng, country, region);
  }
}

// Create mock weather data as fallback
function createMockWeatherData(lat, lng, country, region) {
  const mockWeather = new WeatherData({
    location: {
      country,
      region,
      coordinates: { lat, lng }
    },
    current: {
      temperature: 25 + Math.random() * 10,
      humidity: 60 + Math.random() * 30,
      pressure: 1010 + Math.random() * 20,
      windSpeed: 5 + Math.random() * 10,
      rainfall: Math.random() * 5,
      condition: 'partly cloudy',
      icon: '02d'
    },
    forecast: Array.from({ length: 5 }, (_, i) => ({
      date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000),
      temperature: {
        min: 20 + Math.random() * 5,
        max: 30 + Math.random() * 8
      },
      humidity: 50 + Math.random() * 40,
      rainfall: Math.random() * 10,
      condition: ['sunny', 'partly cloudy', 'cloudy', 'light rain'][Math.floor(Math.random() * 4)],
      icon: ['01d', '02d', '03d', '10d'][Math.floor(Math.random() * 4)]
    })),
    source: 'mock',
    lastUpdated: new Date()
  });
  
  return mockWeather;
}

export default router;