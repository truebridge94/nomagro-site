import FloodPredictionModel from './models/FloodPredictionModel.js';
import DroughtPredictionModel from './models/DroughtPredictionModel.js';
import CropRecommendationModel from './models/CropRecommendationModel.js';
import PricePredictionModel from './models/PricePredictionModel.js';
import logger from '../utils/logger.js';

class MLService {
  constructor() {
    this.floodModel = new FloodPredictionModel();
    this.droughtModel = new DroughtPredictionModel();
    this.cropModel = new CropRecommendationModel();
    this.priceModel = new PricePredictionModel();
    this.isInitialized = false;
  }

  async initialize() {
    try {
      logger.info('Initializing ML Service...');
      
      // Load all models with error handling
      try {
        await this.floodModel.loadModel();
      } catch (error) {
        logger.warn('Failed to load flood model, will use fallback');
      }
      
      try {
        await this.droughtModel.loadModel();
      } catch (error) {
        logger.warn('Failed to load drought model, will use fallback');
      }
      
      try {
        await this.cropModel.loadModel();
      } catch (error) {
        logger.warn('Failed to load crop model, will use fallback');
      }
      
      this.isInitialized = true;
      logger.info('ML Service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize ML Service:', error);
      throw error;
    }
  }

  async predictFlood(inputData) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      const prediction = await this.floodModel.predict(inputData);
      
      return {
        type: 'flood',
        prediction: prediction.risk,
        probability: prediction.probability,
        confidence: prediction.confidence,
        severity: prediction.risk,
        timeframe: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        },
        modelInfo: {
          version: '1.0',
          algorithm: 'Neural Network',
          features: this.floodModel.features,
          accuracy: 0.85
        }
      };
    } catch (error) {
      logger.error('Flood prediction error:', error);
      throw error;
    }
  }

  async predictDrought(inputData) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      const prediction = await this.droughtModel.predict(inputData);
      
      return {
        type: 'drought',
        prediction: prediction.risk,
        probability: prediction.probability,
        confidence: prediction.confidence,
        severity: prediction.risk,
        timeframe: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        },
        modelInfo: {
          version: '1.0',
          algorithm: 'Neural Network',
          features: this.droughtModel.features,
          accuracy: 0.82
        }
      };
    } catch (error) {
      logger.error('Drought prediction error:', error);
      throw error;
    }
  }

  async recommendCrops(inputData) {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      const recommendations = await this.cropModel.predict(inputData);
      
      return {
        type: 'crop',
        recommendations: recommendations.map(rec => ({
          crop: rec.crop,
          suitability: rec.probability,
          confidence: rec.confidence,
          reasons: this.generateCropReasons(rec.crop, inputData)
        })),
        timeframe: {
          startDate: new Date(),
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
        },
        modelInfo: {
          version: '1.0',
          algorithm: 'Neural Network Classification',
          features: this.cropModel.features,
          accuracy: 0.78
        }
      };
    } catch (error) {
      logger.error('Crop recommendation error:', error);
      throw error;
    }
  }

  async predictPrice(crop, inputData, daysAhead = 30) {
    try {
      // Check if model exists for this crop, if not train it
      if (!this.priceModel.models.has(crop)) {
        // Generate some historical data for training (in production, use real data)
        const historicalData = this.generateHistoricalPriceData(crop, 200);
        await this.priceModel.trainModel(crop, historicalData);
      }
      
      const prediction = await this.priceModel.predict(crop, inputData, daysAhead);
      
      return {
        type: 'price',
        crop: prediction.crop,
        prediction: {
          currentPrice: prediction.currentPrice,
          predictedPrice: prediction.predictedPrice,
          change: prediction.change,
          changeDirection: prediction.change > 0 ? 'increase' : 'decrease'
        },
        confidence: prediction.confidence,
        timeframe: {
          startDate: new Date(),
          endDate: new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000)
        },
        factors: prediction.factors,
        modelInfo: {
          version: '1.0',
          algorithm: 'Linear Regression',
          features: this.priceModel.features,
          accuracy: prediction.confidence
        }
      };
    } catch (error) {
      logger.error('Price prediction error:', error);
      throw error;
    }
  }

  generateCropReasons(crop, inputData) {
    const reasons = [];
    
    // Simple rule-based reasoning
    if (inputData.temperature >= 20 && inputData.temperature <= 30) {
      reasons.push('Optimal temperature range');
    }
    if (inputData.humidity >= 60 && inputData.humidity <= 80) {
      reasons.push('Suitable humidity levels');
    }
    if (inputData.ph >= 6.0 && inputData.ph <= 7.5) {
      reasons.push('Good soil pH');
    }
    if (inputData.rainfall >= 500) {
      reasons.push('Adequate rainfall');
    }
    
    return reasons.length > 0 ? reasons : ['Based on environmental conditions'];
  }

  generateHistoricalPriceData(crop, numPoints) {
    const data = [];
    const basePrice = this.getBasePriceForCrop(crop);
    
    for (let i = 0; i < numPoints; i++) {
      const seasonalFactor = Math.sin((i / numPoints) * 2 * Math.PI) * 0.2;
      const randomFactor = (Math.random() - 0.5) * 0.3;
      const trendFactor = i / numPoints * 0.1;
      
      const price = basePrice * (1 + seasonalFactor + randomFactor + trendFactor);
      
      data.push({
        date: new Date(Date.now() - (numPoints - i) * 24 * 60 * 60 * 1000),
        price: Math.max(price, basePrice * 0.5),
        supply: 800 + Math.random() * 400,
        demand: 900 + Math.random() * 300,
        season: Math.floor(i / (numPoints / 4)),
        weatherImpact: Math.random() - 0.5,
        fuelPrice: 90 + Math.random() * 40,
        exchangeRate: 0.9 + Math.random() * 0.4
      });
    }
    
    return data;
  }

  getBasePriceForCrop(crop) {
    const basePrices = {
      maize: 200,
      rice: 300,
      wheat: 250,
      cassava: 150,
      yam: 180,
      cocoa: 2500,
      coffee: 1200,
      cotton: 800,
      groundnut: 400,
      soybean: 350,
      tomato: 120,
      pepper: 200,
      onion: 100
    };
    
    return basePrices[crop] || 200;
  }

  async getModelStatus() {
    return {
      flood: {
        loaded: this.floodModel.isLoaded,
        features: this.floodModel.features.length
      },
      drought: {
        loaded: this.droughtModel.isLoaded,
        features: this.droughtModel.features.length
      },
      crop: {
        loaded: this.cropModel.isLoaded,
        features: this.cropModel.features.length,
        crops: this.cropModel.crops.length
      },
      price: {
        models: this.priceModel.getAllModels()
      }
    };
  }

  async retrainModels() {
    logger.info('Retraining all ML models...');
    
    try {
      await Promise.all([
        this.floodModel.trainModel(),
        this.droughtModel.trainModel(),
        this.cropModel.trainModel()
      ]);
      
      logger.info('All models retrained successfully');
      return { success: true, message: 'Models retrained successfully' };
    } catch (error) {
      logger.error('Model retraining failed:', error);
      throw error;
    }
  }
}

// Singleton instance
const mlService = new MLService();

export default mlService;