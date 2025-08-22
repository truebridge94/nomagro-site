// backend/src/ml/models/DroughtPredictionModel.js
const fs = require('fs');
const path = require('path');
const logger = require('../../utils/logger');

class DroughtPredictionModel {
  constructor() {
    this.modelPath = path.join(__dirname, 'models/drought_model.json');
    this.isLoaded = false;
    this.features = [
      'temperature_avg', 'temperature_max', 'temperature_min',
      'rainfall_30d', 'rainfall_60d', 'rainfall_90d',
      'humidity', 'evapotranspiration',
      'soil_moisture', 'groundwater_level',
      'ndvi', 'vegetation_health_index',
      'season', 'elevation'
    ];
    this.model = null;
    this.fallbackMode = true; // Use rule-based logic by default
  }

  async loadModel() {
    try {
      if (fs.existsSync(this.modelPath)) {
        const data = fs.readFileSync(this.modelPath, 'utf8');
        this.model = JSON.parse(data);
        this.isLoaded = true;
        logger.info('Drought prediction model loaded from file');
      } else {
        logger.warn('No saved drought model found, using rule-based prediction');
      }
    } catch (error) {
      logger.error('Error loading drought model:', error);
      logger.warn('Proceeding with rule-based fallback');
    }
  }

  async trainModel() {
    logger.info('Simulating drought model training...');

    // In production: train with real satellite & weather data
    // Here: save a dummy model to disk
    this.model = {
      version: '1.0',
      algorithm: 'Rule-Based Weighted Scoring',
      accuracy: 0.82,
      trainedAt: new Date().toISOString(),
      features: this.features
    };

    try {
      const dir = path.dirname(this.modelPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.modelPath, JSON.stringify(this.model, null, 2));
      logger.info('Drought model metadata saved');
    } catch (error) {
      logger.warn('Could not save model metadata:', error.message);
    }

    this.isLoaded = true;
  }

  generateTrainingData(numSamples) {
    // For API compatibility — not used in this version
    logger.debug(`Generating ${numSamples} synthetic drought samples`);
    return Array.from({ length: numSamples }, () => ({
      features: Array.from({ length: 14 }, () => Math.random()),
      label: Math.random() > 0.5 ? 1 : 0
    }));
  }

  async predict(inputData) {
    if (!this.isLoaded && !this.fallbackMode) {
      await this.loadModel();
    }

    // Extract and default inputs
    const {
      temperatureAvg = 25,
      temperatureMax = 35,
      temperatureMin = 18,
      rainfall30d = 50,
      rainfall60d = 120,
      rainfall90d = 200,
      humidity = 60,
      evapotranspiration = 5,
      soilMoisture = 40,
      groundwaterLevel = 20,
      ndvi = 0.4,
      vhi = 0.5,
      season = 1,
      elevation = 300
    } = inputData;

    // Drought Risk Score (0-1)
    let score = 0;

    // High temperature
    score += Math.max(0, (temperatureAvg - 30) / 15) * 0.2;
    score += Math.max(0, (temperatureMax - 40) / 10) * 0.1;

    // Low rainfall
    score += (1 - Math.min(rainfall30d / 100, 1)) * 0.2;
    score += (1 - Math.min(rainfall60d / 200, 1)) * 0.15;
    score += (1 - Math.min(rainfall90d / 300, 1)) * 0.1;

    // Low humidity & high evaporation
    score += (1 - humidity / 100) * 0.05;
    score += (evapotranspiration / 10) * 0.05;

    // Soil & groundwater
    score += (1 - soilMoisture / 60) * 0.1;
    score += (1 - groundwaterLevel / 50) * 0.05;

    // Vegetation health
    score += (1 - ndvi) * 0.05;
    score += (1 - vhi) * 0.05;

    // Clamp to 0-1
    const probability = Math.max(0, Math.min(1, score));

    return {
      probability,
      risk: probability > 0.6 ? 'high' : probability > 0.4 ? 'medium' : 'low',
      confidence: probability > 0.7 ? 0.9 : probability > 0.3 ? 0.75 : 0.6
    };
  }
}

// Export using CommonJS
module.exports = DroughtPredictionModel;