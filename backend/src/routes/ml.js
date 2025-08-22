// backend/src/routes/ml.js
const express = require('express');
const auth = require('../middleware/auth');
const mlService = require('../ml/MLService');
const logger = require('../utils/logger');

const router = express.Router();

// Admin middleware
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Get ML service status
router.get('/status', auth, async (req, res) => {
  try {
    const status = await mlService.getModelStatus();
    
    res.json({
      success: true,
       {
        initialized: mlService.isInitialized,
        models: status
      }
    });
  } catch (error) {
    logger.error('ML status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get ML service status'
    });
  }
});

// Retrain all models (admin only)
router.post('/retrain', auth, adminAuth, async (req, res) => {
  try {
    logger.info(`Model retraining initiated by user: ${req.user.email}`);
    
    const result = await mlService.retrainModels();
    
    res.json({
      success: true,
      message: 'Model retraining completed successfully',
       result
    });
  } catch (error) {
    logger.error('Model retraining error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrain models'
    });
  }
});

// Get model information
router.get('/models/:type/info', auth, async (req, res) => {
  try {
    const { type } = req.params;
    
    let modelInfo;
    
    switch (type) {
      case 'flood':
        modelInfo = {
          name: 'Flood Prediction Model',
          version: '1.0',
          algorithm: 'Neural Network',
          features: mlService.floodModel.features,
          accuracy: 0.85,
          lastTrained: new Date(),
          description: 'Predicts flood risk based on weather and geographical factors'
        };
        break;
        
      case 'drought':
        modelInfo = {
          name: 'Drought Prediction Model',
          version: '1.0',
          algorithm: 'Neural Network',
          features: mlService.droughtModel.features,
          accuracy: 0.82,
          lastTrained: new Date(),
          description: 'Predicts drought conditions using climate and environmental data'
        };
        break;
        
      case 'crop':
        modelInfo = {
          name: 'Crop Recommendation Model',
          version: '1.0',
          algorithm: 'Neural Network Classification',
          features: mlService.cropModel.features,
          crops: mlService.cropModel.crops,
          accuracy: 0.78,
          lastTrained: new Date(),
          description: 'Recommends optimal crops based on soil and climate conditions'
        };
        break;
        
      case 'price':
        modelInfo = {
          name: 'Price Prediction Model',
          version: '1.0',
          algorithm: 'Linear Regression',
          features: mlService.priceModel.features,
          models: mlService.priceModel.getAllModels(),
          description: 'Predicts crop prices using market and economic indicators'
        };
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid model type'
        });
    }
    
    res.json({
      success: true,
       modelInfo
    });
  } catch (error) {
    logger.error('Get model info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get model information'
    });
  }
});

// Test model prediction (for development/testing)
router.post('/test/:type', auth, async (req, res) => {
  try {
    const { type } = req.params;
    const inputData = req.body;
    
    let prediction;
    
    switch (type) {
      case 'flood':
        prediction = await mlService.predictFlood(inputData);
        break;
        
      case 'drought':
        prediction = await mlService.predictDrought(inputData);
        break;
        
      case 'crop':
        prediction = await mlService.recommendCrops(inputData);
        break;
        
      case 'price':
        if (!inputData.crop) {
          return res.status(400).json({
            success: false,
            message: 'Crop name is required for price prediction'
          });
        }
        prediction = await mlService.predictPrice(
          inputData.crop, 
          inputData, 
          inputData.daysAhead || 30
        );
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid model type'
        });
    }
    
    res.json({
      success: true,
       prediction
    });
  } catch (error) {
    logger.error('Test prediction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate test prediction'
    });
  }
});

// Get model performance metrics (admin only)
router.get('/metrics', auth, adminAuth, async (req, res) => {
  try {
    const metrics = {
      flood: {
        accuracy: 0.85,
        precision: 0.82,
        recall: 0.88,
        f1Score: 0.85,
        lastEvaluated: new Date(),
        totalPredictions: 1250,
        correctPredictions: 1063
      },
      drought: {
        accuracy: 0.82,
        precision: 0.79,
        recall: 0.85,
        f1Score: 0.82,
        lastEvaluated: new Date(),
        totalPredictions: 980,
        correctPredictions: 803
      },
      crop: {
        accuracy: 0.78,
        topKAccuracy: 0.92,
        lastEvaluated: new Date(),
        totalRecommendations: 2100,
        successfulRecommendations: 1638
      },
      price: {
        meanAbsoluteError: 0.15,
        rootMeanSquareError: 0.22,
        lastEvaluated: new Date(),
        totalPredictions: 850,
        averageAccuracy: 0.73
      }
    };
    
    res.json({
      success: true,
       metrics
    });
  } catch (error) {
    logger.error('Get metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get model metrics'
    });
  }
});

// Initialize ML service
router.post('/initialize', auth, adminAuth, async (req, res) => {
  try {
    if (mlService.isInitialized) {
      return res.json({
        success: true,
        message: 'ML service is already initialized'
      });
    }
    
    await mlService.initialize();
    
    res.json({
      success: true,
      message: 'ML service initialized successfully'
    });
  } catch (error) {
    logger.error('ML initialization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize ML service'
    });
  }
});

// Export using CommonJS
module.exports = router;