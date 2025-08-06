import * as tf from '@tensorflow/tfjs-node';
import logger from '../../utils/logger.js';

class CropRecommendationModel {
  constructor() {
    this.model = null;
    this.isLoaded = false;
    this.crops = [
      'maize', 'rice', 'wheat', 'cassava', 'yam', 'cocoa', 'coffee',
      'cotton', 'groundnut', 'soybean', 'millet', 'sorghum', 'plantain',
      'tomato', 'pepper', 'onion', 'okra', 'beans'
    ];
    this.features = [
      'temperature', 'humidity', 'ph', 'rainfall',
      'nitrogen', 'phosphorus', 'potassium',
      'elevation', 'slope', 'soil_type',
      'season', 'market_price_trend'
    ];
  }

  async loadModel() {
    try {
      this.model = await tf.loadLayersModel('file://./models/crop_recommendation_model/model.json');
      this.isLoaded = true;
      logger.info('Crop recommendation model loaded successfully');
    } catch (error) {
      logger.warn('No existing crop recommendation model found, will train new model');
      await this.trainModel();
    }
  }

  async trainModel() {
    logger.info('Training crop recommendation model...');
    
    const trainingData = this.generateTrainingData(15000);
    
    const features = trainingData.map(d => d.features);
    const labels = trainingData.map(d => d.label);
    
    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(labels);
    
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [this.features.length], units: 256, activation: 'relu' }),
        tf.layers.batchNormalization(),
        tf.layers.dropout({ rate: 0.4 }),
        tf.layers.dense({ units: 128, activation: 'relu' }),
        tf.layers.batchNormalization(),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ units: 64, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: this.crops.length, activation: 'softmax' })
      ]
    });
    
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });
    
    await this.model.fit(xs, ys, {
      epochs: 200,
      batchSize: 128,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          if (epoch % 25 === 0) {
            logger.info(`Crop model - Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
          }
        }
      }
    });
    
    await this.model.save('file://./models/crop_recommendation_model');
    this.isLoaded = true;
    logger.info('Crop recommendation model trained and saved successfully');
    
    xs.dispose();
    ys.dispose();
  }

  generateTrainingData(numSamples) {
    const data = [];
    
    // Define crop requirements (simplified)
    const cropRequirements = {
      maize: { temp: [20, 30], humidity: [60, 80], ph: [6.0, 7.5], rainfall: [500, 1200] },
      rice: { temp: [20, 35], humidity: [70, 90], ph: [5.5, 7.0], rainfall: [1000, 2000] },
      wheat: { temp: [15, 25], humidity: [50, 70], ph: [6.0, 7.5], rainfall: [300, 800] },
      cassava: { temp: [25, 35], humidity: [60, 85], ph: [5.5, 7.0], rainfall: [800, 1500] },
      cocoa: { temp: [21, 32], humidity: [75, 95], ph: [6.0, 7.5], rainfall: [1200, 2000] },
      coffee: { temp: [18, 25], humidity: [70, 85], ph: [6.0, 7.0], rainfall: [1200, 1800] },
      cotton: { temp: [20, 35], humidity: [50, 80], ph: [5.8, 8.0], rainfall: [500, 1200] },
      groundnut: { temp: [25, 35], humidity: [50, 75], ph: [6.0, 7.5], rainfall: [500, 1000] },
      soybean: { temp: [20, 30], humidity: [60, 80], ph: [6.0, 7.5], rainfall: [450, 700] },
      tomato: { temp: [18, 27], humidity: [60, 80], ph: [6.0, 7.0], rainfall: [400, 800] }
    };
    
    for (let i = 0; i < numSamples; i++) {
      const temperature = 15 + Math.random() * 25; // °C
      const humidity = 40 + Math.random() * 50; // %
      const ph = 4.5 + Math.random() * 4; // pH
      const rainfall = 200 + Math.random() * 1800; // mm
      const nitrogen = Math.random() * 100; // kg/ha
      const phosphorus = Math.random() * 50; // kg/ha
      const potassium = Math.random() * 80; // kg/ha
      const elevation = Math.random() * 2000; // m
      const slope = Math.random() * 30; // degrees
      const soilType = Math.floor(Math.random() * 5); // categorical
      const season = Math.floor(Math.random() * 4); // 0-3
      const marketTrend = Math.random() * 2 - 1; // -1 to 1
      
      // Find best matching crop
      let bestCrop = 0;
      let bestScore = -1;
      
      Object.keys(cropRequirements).forEach((crop, index) => {
        if (index >= this.crops.length) return;
        
        const req = cropRequirements[crop];
        let score = 0;
        
        // Temperature suitability
        if (temperature >= req.temp[0] && temperature <= req.temp[1]) score += 0.25;
        // Humidity suitability
        if (humidity >= req.humidity[0] && humidity <= req.humidity[1]) score += 0.25;
        // pH suitability
        if (ph >= req.ph[0] && ph <= req.ph[1]) score += 0.25;
        // Rainfall suitability
        if (rainfall >= req.rainfall[0] && rainfall <= req.rainfall[1]) score += 0.25;
        
        // Add some randomness
        score += Math.random() * 0.1;
        
        if (score > bestScore) {
          bestScore = score;
          bestCrop = index;
        }
      });
      
      // Create one-hot encoded label
      const label = new Array(this.crops.length).fill(0);
      label[bestCrop] = 1;
      
      data.push({
        features: [
          temperature / 40,
          humidity / 100,
          ph / 9,
          rainfall / 2000,
          nitrogen / 100,
          phosphorus / 50,
          potassium / 80,
          elevation / 2000,
          slope / 30,
          soilType / 5,
          season / 4,
          (marketTrend + 1) / 2
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
      inputData.temperature / 40,
      inputData.humidity / 100,
      inputData.ph / 9,
      inputData.rainfall / 2000,
      inputData.nitrogen / 100,
      inputData.phosphorus / 50,
      inputData.potassium / 80,
      inputData.elevation / 2000,
      inputData.slope / 30,
      inputData.soilType / 5,
      inputData.season / 4,
      (inputData.marketTrend + 1) / 2
    ];
    
    const prediction = this.model.predict(tf.tensor2d([normalizedInput]));
    const probabilities = await prediction.data();
    
    prediction.dispose();
    
    // Get top 3 recommendations
    const recommendations = [];
    const sortedIndices = Array.from(probabilities)
      .map((prob, index) => ({ prob, index }))
      .sort((a, b) => b.prob - a.prob)
      .slice(0, 3);
    
    sortedIndices.forEach(({ prob, index }) => {
      recommendations.push({
        crop: this.crops[index],
        probability: prob,
        confidence: prob
      });
    });
    
    return recommendations;
  }
}

export default CropRecommendationModel;