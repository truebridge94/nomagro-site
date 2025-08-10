import logger from '../../utils/logger.js';

// Simple linear regression implementation
class SimpleLinearRegression {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.slope = 0;
    this.intercept = 0;
    this.train();
  }

  train() {
    const n = this.x.length;
    const sumX = this.x.reduce((a, b) => a + b, 0);
    const sumY = this.y.reduce((a, b) => a + b, 0);
    const sumXY = this.x.reduce((sum, x, i) => sum + x * this.y[i], 0);
    const sumXX = this.x.reduce((sum, x) => sum + x * x, 0);

    this.slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    this.intercept = (sumY - this.slope * sumX) / n;
  }

  predict(x) {
    return this.slope * x + this.intercept;
  }
}

// Simple multivariate linear regression implementation
class MultivariateLinearRegression {
  constructor(features, targets) {
    this.features = features;
    this.targets = targets;
    this.weights = new Array(features[0].length + 1).fill(0);
    this.train();
  }

  train() {
    // Simple gradient descent implementation
    const learningRate = 0.01;
    const iterations = 1000;

    for (let iter = 0; iter < iterations; iter++) {
      const predictions = this.features.map(feature => this.predictSingle(feature));
      const errors = predictions.map((pred, i) => pred - this.targets[i]);

      // Update weights
      for (let j = 0; j < this.weights.length; j++) {
        let gradient = 0;
        for (let i = 0; i < this.features.length; i++) {
          const feature = j === 0 ? 1 : this.features[i][j - 1];
          gradient += errors[i] * feature;
        }
        this.weights[j] -= learningRate * gradient / this.features.length;
      }
    }
  }

  predictSingle(features) {
    let prediction = this.weights[0]; // bias
    for (let i = 0; i < features.length; i++) {
      prediction += this.weights[i + 1] * features[i];
    }
    return prediction;
  }

  predict(features) {
    return this.predictSingle(features);
  }
}

class PricePredictionModel {
  constructor() {
    this.models = new Map(); // Store models for different crops
    this.features = [
      'historical_price', 'supply', 'demand', 'season',
      'weather_impact', 'fuel_price', 'exchange_rate',
      'export_volume', 'import_volume', 'storage_cost'
    ];
  }

  async trainModel(crop, historicalData) {
    logger.info(`Training price prediction model for ${crop}...`);
    
    if (historicalData.length < 50) {
      logger.warn(`Insufficient data for ${crop}, using simple linear regression`);
      return this.trainSimpleModel(crop, historicalData);
    }
    
    // Prepare features and targets
    const features = [];
    const targets = [];
    
    for (let i = 10; i < historicalData.length; i++) {
      const dataPoint = historicalData[i];
      const pastPrices = historicalData.slice(i-10, i).map(d => d.price);
      const avgPastPrice = pastPrices.reduce((a, b) => a + b, 0) / pastPrices.length;
      
      features.push([
        avgPastPrice,
        dataPoint.supply || 1000,
        dataPoint.demand || 1000,
        dataPoint.season || 0,
        dataPoint.weatherImpact || 0,
        dataPoint.fuelPrice || 100,
        dataPoint.exchangeRate || 1,
        dataPoint.exportVolume || 0,
        dataPoint.importVolume || 0,
        dataPoint.storageCost || 50
      ]);
      
      targets.push(dataPoint.price);
    }
    
    // Train multivariate linear regression
    const model = new MultivariateLinearRegression(features, targets);
    this.models.set(crop, {
      type: 'multivariate',
      model,
      lastTrained: new Date(),
      accuracy: this.calculateAccuracy(model, features, targets)
    });
    
    logger.info(`Price prediction model for ${crop} trained with accuracy: ${this.models.get(crop).accuracy.toFixed(3)}`);
    
    return this.models.get(crop);
  }

  trainSimpleModel(crop, historicalData) {
    // Simple time series prediction
    const x = historicalData.map((_, index) => index);
    const y = historicalData.map(d => d.price);
    
    const model = new SimpleLinearRegression(x, y);
    this.models.set(crop, {
      type: 'simple',
      model,
      lastTrained: new Date(),
      accuracy: this.calculateSimpleAccuracy(model, x, y)
    });
    
    return this.models.get(crop);
  }

  calculateAccuracy(model, features, targets) {
    let totalError = 0;
    let totalActual = 0;
    
    for (let i = 0; i < features.length; i++) {
      const predicted = model.predict(features[i]);
      const actual = targets[i];
      totalError += Math.abs(predicted - actual);
      totalActual += actual;
    }
    
    const mape = (totalError / totalActual) * 100;
    return Math.max(0, 100 - mape) / 100; // Convert to 0-1 accuracy
  }

  calculateSimpleAccuracy(model, x, y) {
    let totalError = 0;
    let totalActual = 0;
    
    for (let i = 0; i < x.length; i++) {
      const predicted = model.predict(x[i]);
      const actual = y[i];
      totalError += Math.abs(predicted - actual);
      totalActual += actual;
    }
    
    const mape = (totalError / totalActual) * 100;
    return Math.max(0, 100 - mape) / 100;
  }

  async predict(crop, inputData, daysAhead = 30) {
    const modelData = this.models.get(crop);
    
    if (!modelData) {
      throw new Error(`No model found for crop: ${crop}`);
    }
    
    const { model, type, accuracy } = modelData;
    
    if (type === 'multivariate') {
      const features = [
        inputData.historicalPrice,
        inputData.supply || 1000,
        inputData.demand || 1000,
        inputData.season || 0,
        inputData.weatherImpact || 0,
        inputData.fuelPrice || 100,
        inputData.exchangeRate || 1,
        inputData.exportVolume || 0,
        inputData.importVolume || 0,
        inputData.storageCost || 50
      ];
      
      const prediction = model.predict(features);
      
      return {
        crop,
        predictedPrice: prediction,
        currentPrice: inputData.historicalPrice,
        change: ((prediction - inputData.historicalPrice) / inputData.historicalPrice) * 100,
        confidence: accuracy,
        timeframe: `${daysAhead} days`,
        factors: this.analyzePriceFactors(features)
      };
    } else {
      // Simple linear regression prediction
      const nextTimePoint = inputData.timePoint + daysAhead;
      const prediction = model.predict(nextTimePoint);
      
      return {
        crop,
        predictedPrice: Math.max(0, prediction),
        currentPrice: inputData.historicalPrice,
        change: ((prediction - inputData.historicalPrice) / inputData.historicalPrice) * 100,
        confidence: accuracy,
        timeframe: `${daysAhead} days`,
        factors: ['time_trend']
      };
    }
  }

  analyzePriceFactors(features) {
    const factors = [];
    
    // Simple factor analysis
    if (features[1] < 800) factors.push('low_supply');
    if (features[2] > 1200) factors.push('high_demand');
    if (features[4] > 0.5) factors.push('weather_impact');
    if (features[5] > 120) factors.push('high_fuel_cost');
    if (features[6] > 1.1) factors.push('currency_devaluation');
    
    return factors.length > 0 ? factors : ['normal_conditions'];
  }

  async updateModel(crop, newData) {
    const modelData = this.models.get(crop);
    if (!modelData) {
      return this.trainModel(crop, newData);
    }
    
    // Check if model needs retraining (older than 7 days)
    const daysSinceTraining = (new Date() - modelData.lastTrained) / (1000 * 60 * 60 * 24);
    
    if (daysSinceTraining > 7) {
      logger.info(`Retraining price model for ${crop} - last trained ${daysSinceTraining.toFixed(1)} days ago`);
      return this.trainModel(crop, newData);
    }
    
    return modelData;
  }

  getModelInfo(crop) {
    const modelData = this.models.get(crop);
    if (!modelData) {
      return null;
    }
    
    return {
      crop,
      type: modelData.type,
      accuracy: modelData.accuracy,
      lastTrained: modelData.lastTrained,
      features: this.features
    };
  }

  getAllModels() {
    const models = [];
    for (const [crop, modelData] of this.models) {
      models.push(this.getModelInfo(crop));
    }
    return models;
  }
}

export default PricePredictionModel;