import mongoose from 'mongoose';

const predictionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['flood', 'drought', 'pest', 'crop', 'price', 'yield']
  },
  location: {
    country: { type: String, required: true },
    region: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  prediction: {
    value: mongoose.Schema.Types.Mixed, // Can be number, string, or object
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: function() {
        return ['flood', 'drought', 'pest'].includes(this.type);
      }
    }
  },
  timeframe: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  modelInfo: {
    version: { type: String, required: true },
    algorithm: { type: String, required: true },
    features: [String],
    accuracy: Number
  },
  inputData: {
    weather: mongoose.Schema.Types.Mixed,
    satellite: mongoose.Schema.Types.Mixed,
    historical: mongoose.Schema.Types.Mixed,
    market: mongoose.Schema.Types.Mixed
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'validated', 'invalidated'],
    default: 'active'
  },
  validation: {
    actualValue: mongoose.Schema.Types.Mixed,
    accuracy: Number,
    validatedAt: Date,
    validatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  notifications: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sentAt: Date,
    method: {
      type: String,
      enum: ['email', 'sms', 'push', 'app']
    }
  }]
}, {
  timestamps: true
});

// Indexes
predictionSchema.index({ 'location.coordinates': '2dsphere' });
predictionSchema.index({ type: 1, 'location.country': 1, 'location.region': 1 });
predictionSchema.index({ 'timeframe.startDate': 1, 'timeframe.endDate': 1 });
predictionSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Prediction', predictionSchema);