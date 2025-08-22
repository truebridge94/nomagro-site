// backend/src/routes/prediction.js
const express = require('express');
const auth = require('../middleware/auth');
const mlService = require('../ml/MLService');
const Prediction = require('../models/Prediction');
const WeatherData = require('../models/WeatherData');
const logger = require('../utils/logger');

const router = express.Router();

// Get predictions for user's location
router.get('/', auth, async (req, res) => {
  try {
    const { country, region } = req.user.location;

    // Get recent predictions for user's location
    const predictions = await Prediction.find({
      'location.country': country,
      'location.region': region,
      status: 'active',
      'timeframe.endDate': { $gte: new Date() }
    }).sort({ createdAt: -1 }).limit(10);

    res.json({
      success: true,
      data: predictions
    });
  } catch (error) {
    logger.error('Get predictions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch predictions'
    });
  }
});

// Generate new flood prediction
router.post('/flood', auth, async (req, res) => {
  try {
    const { location } = req.user;

    // Get latest weather data for the location
    const weatherData = await WeatherData.findOne({
      'location.country': location.country,
      'location.region': location.region
    }).sort({ lastUpdated: -1 });

    if (!weatherData) {
      return res.status(400).json({
        success: false,
        message: 'No weather data available for your location'
      });
    }

    // Prepare input data for ML model
    const inputData = {
      rainfall24h: weatherData.current.rainfall,
      rainfall7d: weatherData.forecast.slice(0, 7).reduce((sum, day) => sum + day.rainfall, 0),
      rainfall30d: req.body.rainfall30d || 100,
      temperature: weatherData.current.temperature,
      humidity: weatherData.current.humidity,
      pressure: weatherData.current.pressure,
      elevation: req.body.elevation || 200,
      slope: req.body.slope || 5,
      soilType: req.body.soilType || 2,
      riverDistance: req.body.riverDistance || 5000,
      drainageDensity: req.body.drainageDensity || 2,
      ndvi: req.body.ndvi || 0.6,
      landCover: req.body.landCover || 3
    };

    // Get prediction from ML service
    const mlPrediction = await mlService.predictFlood(inputData);

    // Save prediction to database
    const prediction = new Prediction({
      type: 'flood',
      location: location,
      prediction: {
        value: mlPrediction.prediction,
        confidence: mlPrediction.confidence,
        severity: mlPrediction.severity
      },
      timeframe: mlPrediction.timeframe,
      modelInfo: mlPrediction.modelInfo,
      inputData: inputData
    });

    await prediction.save();

    // Emit real-time update
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${req.user._id}`).emit('new-prediction', prediction);
    }

    res.json({
      success: true,
      data: prediction
    });
  } catch (error) {
    logger.error('Flood prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate flood prediction'
    });
  }
});

// Generate drought prediction
router.post('/drought', auth, async (req, res) => {
  try {
    const { location } = req.user;

    const inputData = {
      temperatureAvg: req.body.temperatureAvg || 25,
      temperatureMax: req.body.temperatureMax || 35,
      temperatureMin: req.body.temperatureMin || 15,
      rainfall30d: req.body.rainfall30d || 50,
      rainfall60d: req.body.rainfall60d || 120,
      rainfall90d: req.body.rainfall90d || 200,
      humidity: req.body.humidity || 60,
      evapotranspiration: req.body.evapotranspiration || 5,
      soilMoisture: req.body.soilMoisture || 40,
      groundwaterLevel: req.body.groundwaterLevel || 20,
      ndvi: req.body.ndvi || 0.4,
      vhi: req.body.vhi || 0.5,
      season: req.body.season || 1,
      elevation: req.body.elevation || 300
    };

    const mlPrediction = await mlService.predictDrought(inputData);

    const prediction = new Prediction({
      type: 'drought',
      location: location,
      prediction: {
        value: mlPrediction.prediction,
        confidence: mlPrediction.confidence,
        severity: mlPrediction.severity
      },
      timeframe: mlPrediction.timeframe,
      modelInfo: mlPrediction.modelInfo,
      inputData: inputData
    });

    await prediction.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`user-${req.user._id}`).emit('new-prediction', prediction);
    }

    res.json({
      success: true,
      data: prediction
    });
  } catch (error) {
    logger.error('Drought prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate drought prediction'
    });
  }
});

// Get crop recommendations
router.post('/crops', auth, async (req, res) => {
  try {
    const inputData = {
      temperature: req.body.temperature || 25,
      humidity: req.body.humidity || 70,
      ph: req.body.ph || 6.5,
      rainfall: req.body.rainfall || 800,
      nitrogen: req.body.nitrogen || 50,
      phosphorus: req.body.phosphorus || 25,
      potassium: req.body.potassium || 40,
      elevation: req.body.elevation || 200,
      slope: req.body.slope || 5,
      soilType: req.body.soilType || 2,
      season: req.body.season || 1,
      marketTrend: req.body.marketTrend || 0.1
    };

    const mlPrediction = await mlService.recommendCrops(inputData);

    const prediction = new Prediction({
      type: 'crop',
      location: req.user.location,
      prediction: {
        value: mlPrediction.recommendations,
        confidence: mlPrediction.recommendations[0]?.confidence || 0.7
      },
      timeframe: mlPrediction.timeframe,
      modelInfo: mlPrediction.modelInfo,
      inputData: inputData
    });

    await prediction.save();

    res.json({
      success: true,
      data: prediction
    });
  } catch (error) {
    logger.error('Crop recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate crop recommendations'
    });
  }
});

// Get price prediction
router.post('/price', auth, async (req, res) => {
  try {
    const { crop, daysAhead = 30 } = req.body;

    if (!crop) {
      return res.status(400).json({
        success: false,
        message: 'Crop name is required'
      });
    }

    const inputData = {
      historicalPrice: req.body.currentPrice || 200,
      supply: req.body.supply || 1000,
      demand: req.body.demand || 1000,
      season: req.body.season || 1,
      weatherImpact: req.body.weatherImpact || 0,
      fuelPrice: req.body.fuelPrice || 100,
      exchangeRate: req.body.exchangeRate || 1,
      exportVolume: req.body.exportVolume || 0,
      importVolume: req.body.importVolume || 0,
      storageCost: req.body.storageCost || 50,
      timePoint: req.body.timePoint || Date.now()
    };

    const mlPrediction = await mlService.predictPrice(crop, inputData, daysAhead);

    const prediction = new Prediction({
      type: 'price',
      location: req.user.location,
      prediction: {
        value: mlPrediction.prediction,
        confidence: mlPrediction.confidence
      },
      timeframe: mlPrediction.timeframe,
      modelInfo: mlPrediction.modelInfo,
      inputData: { ...inputData, crop }
    });

    await prediction.save();

    res.json({
      success: true,
      data: prediction
    });
  } catch (error) {
    logger.error('Price prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate price prediction'
    });
  }
});

// Validate prediction (for model improvement)
router.put('/:id/validate', auth, async (req, res) => {
  try {
    const { actualValue, accuracy } = req.body;

    const prediction = await Prediction.findById(req.params.id);

    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: 'Prediction not found'
      });
    }

    prediction.validation = {
      actualValue,
      accuracy,
      validatedAt: new Date(),
      validatedBy: req.user._id
    };

    prediction.status = accuracy > 0.7 ? 'validated' : 'invalidated';

    await prediction.save();

    res.json({
      success: true,
      data: prediction
    });
  } catch (error) {
    logger.error('Prediction validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate prediction'
    });
  }
});

// Export using CommonJS
module.exports = router;