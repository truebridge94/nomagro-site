// backend/src/utils/validation.js
const Joi = require('joi');

// User registration validation
const validateRegistration = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    location: Joi.object({
      country: Joi.string().required(),
      region: Joi.string().required(),
      coordinates: Joi.object({
        lat: Joi.number().min(-90).max(90),
        lng: Joi.number().min(-180).max(180)
      })
    }).required(),
    farmSize: Joi.number().min(0).optional(),
    crops: Joi.string().optional()
  });

  return schema.validate(data);
};

// User login validation
const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  return schema.validate(data);
};

// Product validation
const validateProduct = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().min(10).max(1000).required(),
    category: Joi.string().valid(
      'Cash Crops', 'Cereals', 'Root Crops', 'Vegetables',
      'Fruits', 'Livestock', 'Seeds', 'Equipment'
    ).required(),
    price: Joi.object({
      amount: Joi.number().min(0).required(),
      currency: Joi.string().default('USD'),
      unit: Joi.string().valid(
        'per kg', 'per ton', 'per bag', 'per crate', 'per piece', 'per liter'
      ).required()
    }).required(),
    quantity: Joi.object({
      available: Joi.number().min(0).required(),
      unit: Joi.string().required()
    }).required(),
    contact: Joi.object({
      phone: Joi.string().required(),
      email: Joi.string().email().required(),
      whatsapp: Joi.string().optional()
    }).required(),
    specifications: Joi.object({
      harvestDate: Joi.date().optional(),
      expiryDate: Joi.date().optional(),
      isOrganic: Joi.boolean().default(false),
      variety: Joi.string().optional(),
      grade: Joi.string().valid('A', 'B', 'C', 'Premium', 'Standard').optional(),
      certifications: Joi.array().items(Joi.string()).optional()
    }).optional()
  });

  return schema.validate(data);
};

// Weather data validation
const validateWeatherInput = (data) => {
  const schema = Joi.object({
    temperature: Joi.number().min(-50).max(60).required(),
    humidity: Joi.number().min(0).max(100).required(),
    pressure: Joi.number().min(800).max(1200).required(),
    windSpeed: Joi.number().min(0).max(200).required(),
    rainfall: Joi.number().min(0).max(1000).optional().default(0)
  });

  return schema.validate(data);
};

// Prediction input validation
const validatePredictionInput = (data, type) => {
  const baseSchema = {
    location: Joi.object({
      country: Joi.string().required(),
      region: Joi.string().required(),
      coordinates: Joi.object({
        lat: Joi.number().min(-90).max(90).required(),
        lng: Joi.number().min(-180).max(180).required()
      }).required()
    }).optional()
  };

  let specificSchema = {};

  switch (type) {
    case 'flood':
      specificSchema = {
        rainfall24h: Joi.number().min(0).max(500).required(),
        rainfall7d: Joi.number().min(0).max(1000).optional(),
        temperature: Joi.number().min(-10).max(50).required(),
        humidity: Joi.number().min(0).max(100).required(),
        elevation: Joi.number().min(0).max(5000).optional(),
        slope: Joi.number().min(0).max(90).optional()
      };
      break;

    case 'drought':
      specificSchema = {
        temperatureAvg: Joi.number().min(0).max(50).required(),
        rainfall30d: Joi.number().min(0).max(500).required(),
        rainfall60d: Joi.number().min(0).max(1000).optional(),
        soilMoisture: Joi.number().min(0).max(100).optional(),
        ndvi: Joi.number().min(0).max(1).optional()
      };
      break;

    case 'crop':
      specificSchema = {
        temperature: Joi.number().min(0).max(50).required(),
        humidity: Joi.number().min(0).max(100).required(),
        ph: Joi.number().min(0).max(14).required(),
        rainfall: Joi.number().min(0).max(3000).required(),
        nitrogen: Joi.number().min(0).max(200).optional(),
        phosphorus: Joi.number().min(0).max(100).optional(),
        potassium: Joi.number().min(0).max(200).optional()
      };
      break;

    case 'price':
      specificSchema = {
        crop: Joi.string().required(),
        currentPrice: Joi.number().min(0).required(),
        supply: Joi.number().min(0).optional(),
        demand: Joi.number().min(0).optional(),
        daysAhead: Joi.number().min(1).max(365).optional().default(30)
      };
      break;
  }

  const schema = Joi.object({ ...baseSchema, ...specificSchema });
  return schema.validate(data);
};

// Export all validation functions
module.exports = {
  validateRegistration,
  validateLogin,
  validateProduct,
  validateWeatherInput,
  validatePredictionInput
};