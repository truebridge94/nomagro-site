import mongoose from 'mongoose';

const weatherDataSchema = new mongoose.Schema({
  location: {
    country: { type: String, required: true },
    region: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  current: {
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    pressure: { type: Number, required: true },
    windSpeed: { type: Number, required: true },
    rainfall: { type: Number, default: 0 },
    condition: { type: String, required: true },
    icon: { type: String, required: true }
  },
  forecast: [{
    date: { type: Date, required: true },
    temperature: {
      min: { type: Number, required: true },
      max: { type: Number, required: true }
    },
    humidity: { type: Number, required: true },
    rainfall: { type: Number, default: 0 },
    condition: { type: String, required: true },
    icon: { type: String, required: true }
  }],
  source: {
    type: String,
    required: true,
    enum: ['openweather', 'weatherapi', 'manual']
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for location-based queries
weatherDataSchema.index({ 'location.coordinates': '2dsphere' });
weatherDataSchema.index({ 'location.country': 1, 'location.region': 1 });
weatherDataSchema.index({ lastUpdated: -1 });

export default mongoose.model('WeatherData', weatherDataSchema);