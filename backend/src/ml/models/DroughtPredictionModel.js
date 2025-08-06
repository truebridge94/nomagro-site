import * as tf from '@tensorflow/tfjs-node';
import logger from '../../utils/logger.js';

class DroughtPredictionModel {
  constructor() {
    this.model = null;
    this.isLoaded = false;
    this.features = [
      'temperature_avg', 'temperature_max', 'temperature_min',
      'rainfall_30d', 'rainfall_60d', 'rainfall_90d',
      'humidity', 'evapotranspiration',
      'soil_moisture', 'groundwater_level',
      'ndvi', 'vegetation_health_index',
      'season', 'elevation'
    ];
  }

  async loadModel() {
    try {
      this.model = await tf.loadLayersModel('file://./models/drought_model/model.json');
      this.isLoaded = true;
      logger.info('Drought prediction model loaded successfully');
    } catch (error) {
      logger.warn('No existing drought model found, will train new model');
      await this.trainModel();
    }
  }

  async trainModel() {
    logger.info('Training drought prediction model...');
    
    const trainingData = this.generateTrainingData(8000);
    
    const features = trainingData.map(d => d.features);
    const labels = trainingData.map(d => d.label);
    
    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(labels, [labels.length, 1]);
    
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [this.features.length], units: 128, activation: 'relu' }),
        tf.layers.batchNormalization(),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.batchNormalization(),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });
    
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });
    
    await this.model.fit(xs, ys, {
      epochs: 150,
      batchSize: 64,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 20 === 0) {
            logger.info(`Drought model - Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
          }
        }
      }
    });
    
    await this.model.save('file://./models/drought_model');
    this.isLoaded = true;
    logger.info('Drought prediction model trained and saved successfully');
    
    xs.dispose();
    ys.dispose();
  }

  generateTrainingData(numSamples) {
    const data = [];
    
    for (let i = 0; i < numSamples; i++) {
      const tempAvg = 15 + Math.random() * 25; // °C
      const tempMax = tempAvg + Math.random() * 15;
      const tempMin = tempAvg - Math.random() * 10;
      const rainfall30d = Math.random() * 150; // mm
      const rainfall60d = rainfall30d + Math.random() * 200;
      const rainfall90d = rainfall60d + Math.random() * 250;
      const humidity = 20 + Math.random() * 70; // %
      const evapotranspiration = 2 + Math.random() * 8; // mm/day
      const soilMoisture = Math.random() * 100; // %
      const groundwaterLevel = Math.random() * 50; // m
      const ndvi = Math.random(); // 0-1
      const vhi = Math.random(); // 0-1
      const season = Math.floor(Math.random() * 4); // 0-3
      const elevation = Math.random() * 3000; // m
      
      // Drought risk calculation
      const droughtRisk = (
        (rainfall30d < 20 ? 0.4 : 0) +
        (rainfall60d < 50 ? 0.3 : 0) +
        (tempAvg > 35 ? 0.2 : 0) +
        (humidity < 30 ? 0.1 : 0) +
        (soilMoisture < 20 ? 0.2 : 0) +
        (ndvi < 0.3 ? 0.2 : 0)
      );
      
      const label = droughtRisk > 0.6 ? 1 : 0;
      
      data.push({
        features: [
          tempAvg / 40,
          tempMax / 50,
          tempMin / 30,
          rainfall30d / 150,
          rainfall60d / 350,
          rainfall90d / 600,
          humidity / 100,
          evapotranspiration / 10,
          soilMoisture / 100,
          groundwaterLevel / 50,
          ndvi,
          vhi,
          season / 4,
          elevation / 3000
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
    
    const normalizedInput = [
      inputData.temperatureAvg / 40,
      inputData.temperatureMax / 50,
      inputData.temperatureMin / 30,
      inputData.rainfall30d / 150,
      inputData.rainfall60d / 350,
      inputData.rainfall90d / 600,
      inputData.humidity / 100,
      inputData.evapotranspiration / 10,
      inputData.soilMoisture / 100,
      inputData.groundwaterLevel / 50,
      inputData.ndvi,
      inputData.vhi,
      inputData.season / 4,
      inputData.elevation / 3000
    ];
    
    const prediction = this.model.predict(tf.tensor2d([normalizedInput]));
    const probability = await prediction.data();
    
    prediction.dispose();
    
    return {
      probability: probability[0],
      risk: probability[0] > 0.6 ? 'high' : probability[0] > 0.4 ? 'medium' : 'low',
      confidence: Math.abs(probability[0] - 0.5) * 2
    };
  }
}

export default DroughtPredictionModel;