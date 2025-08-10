import * as tf from '@tensorflow/tfjs-node';
import logger from '../../utils/logger.js';

class FloodPredictionModel {
  constructor() {
    this.model = null;
    this.isLoaded = false;
    this.features = [
      'rainfall_24h', 'rainfall_7d', 'rainfall_30d',
      'temperature', 'humidity', 'pressure',
      'elevation', 'slope', 'soil_type',
      'river_distance', 'drainage_density',
      'ndvi', 'land_cover'
    ];
  }

  async loadModel() {
    try {
      // Try to load existing model
      this.model = await tf.loadLayersModel('file://./models/flood_model/model.json');
      this.isLoaded = true;
      logger.info('Flood prediction model loaded successfully');
    } catch (error) {
      logger.warn('No existing flood model found, will train new model');
      await this.trainModel();
    }
  }

  async trainModel() {
    logger.info('Training flood prediction model...');
    
    // Generate synthetic training data (in production, use real historical data)
    const trainingData = this.generateTrainingData(10000);
    
    // Prepare features and labels
    const features = trainingData.map(d => d.features);
    const labels = trainingData.map(d => d.label);
    
    // Create tensors
    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(labels, [labels.length, 1]);
    
    // Create model architecture
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [this.features.length], units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });
    
    // Compile model
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });
    
    // Train model
    const history = await this.model.fit(xs, ys, {
      epochs: 100,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 10 === 0) {
            logger.info(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
          }
        }
      }
    });
    
    // Save model
    await this.model.save('file://./models/flood_model');
    
    this.isLoaded = true;
    logger.info('Flood prediction model trained and saved successfully');
    
    // Clean up tensors
    xs.dispose();
    ys.dispose();
    
    return history;
  }

  generateTrainingData(numSamples) {
    const data = [];
    
    for (let i = 0; i < numSamples; i++) {
      const rainfall24h = Math.random() * 200; // mm
      const rainfall7d = rainfall24h + Math.random() * 300;
      const rainfall30d = rainfall7d + Math.random() * 500;
      const temperature = 20 + Math.random() * 20; // °C
      const humidity = 40 + Math.random() * 60; // %
      const pressure = 980 + Math.random() * 60; // hPa
      const elevation = Math.random() * 2000; // m
      const slope = Math.random() * 45; // degrees
      const soilType = Math.floor(Math.random() * 5); // categorical
      const riverDistance = Math.random() * 10000; // m
      const drainageDensity = Math.random() * 5; // km/km²
      const ndvi = Math.random(); // 0-1
      const landCover = Math.floor(Math.random() * 10); // categorical
      
      // Simple flood risk calculation (in reality, this would be based on historical data)
      const floodRisk = (
        (rainfall24h > 50 ? 0.3 : 0) +
        (rainfall7d > 150 ? 0.3 : 0) +
        (elevation < 100 ? 0.2 : 0) +
        (slope < 5 ? 0.1 : 0) +
        (riverDistance < 1000 ? 0.1 : 0)
      );
      
      const label = floodRisk > 0.5 ? 1 : 0;
      
      data.push({
        features: [
          rainfall24h / 200, // normalize
          rainfall7d / 500,
          rainfall30d / 1000,
          temperature / 40,
          humidity / 100,
          pressure / 1040,
          elevation / 2000,
          slope / 45,
          soilType / 5,
          riverDistance / 10000,
          drainageDensity / 5,
          ndvi,
          landCover / 10
        ],
        label
      });
    }
    
    return data;
  }

  async predict(inputData) {
    if (!this.isLoaded) {
      await this.loadModel();
    }
    
    // Normalize input data
    const normalizedInput = [
      inputData.rainfall24h / 200,
      inputData.rainfall7d / 500,
      inputData.rainfall30d / 1000,
      inputData.temperature / 40,
      inputData.humidity / 100,
      inputData.pressure / 1040,
      inputData.elevation / 2000,
      inputData.slope / 45,
      inputData.soilType / 5,
      inputData.riverDistance / 10000,
      inputData.drainageDensity / 5,
      inputData.ndvi,
      inputData.landCover / 10
    ];
    
    const prediction = this.model.predict(tf.tensor2d([normalizedInput]));
    const probability = await prediction.data();
    
    prediction.dispose();
    
    return {
      probability: probability[0],
      risk: probability[0] > 0.5 ? 'high' : probability[0] > 0.3 ? 'medium' : 'low',
      confidence: Math.abs(probability[0] - 0.5) * 2 // Convert to 0-1 confidence
    };
  }

  async evaluateModel(testData) {
    if (!this.isLoaded) {
      await this.loadModel();
    }
    
    const features = testData.map(d => d.features);
    const labels = testData.map(d => d.label);
    
    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(labels, [labels.length, 1]);
    
    const evaluation = await this.model.evaluate(xs, ys);
    const loss = await evaluation[0].data();
    const accuracy = await evaluation[1].data();
    
    xs.dispose();
    ys.dispose();
    evaluation[0].dispose();
    evaluation[1].dispose();
    
    return {
      loss: loss[0],
      accuracy: accuracy[0]
    };
  }
}

export default FloodPredictionModel;