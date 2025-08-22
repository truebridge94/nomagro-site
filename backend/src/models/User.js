// backend/src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    unique: true,
    sparse: true, // allow multiple docs without email
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
    match: [/^\+?[0-9]{7,15}$/, 'Please enter a valid phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Never return password in queries
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [1, 'Age must be a positive number']
  },
  preferredLanguage: {
    type: String,
    required: [true, 'Preferred language is required']
  },
  location: {
    country: {
      type: String,
      required: [true, 'Country is required']
    },
    region: {
      type: String,
      required: [true, 'Region or State is required']
    },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  farmSize: {
    type: Number,
    min: [0, 'Farm size cannot be negative']
  },
  crops: [
    {
      type: String,
      trim: true
    }
  ],
  role: {
    type: String,
    enum: ['farmer', 'buyer', 'admin'],
    default: 'farmer'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium'],
      default: 'free'
    },
    expiresAt: Date
  },
  lastLogin: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date // ✅ Fixed: was resetPasswordExpires (with 's')
}, {
  timestamps: true
});

// ✅ Ensure at least email or phone is provided
userSchema.pre('validate', function(next) {
  if (!this.email && !this.phone) {
    this.invalidate('email', 'Either email or phone is required');
    this.invalidate('phone', 'Either email or phone is required');
  }
  next();
});

// ✅ Index for geospatial queries
userSchema.index({ 'location.coordinates': '2dsphere' });

// ✅ Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ✅ Generate password reset token
userSchema.methods.generatePasswordResetToken = function(expiryMinutes = 15) {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpires = Date.now() + expiryMinutes * 60 * 1000; // 15 min default

  return resetToken; // Return raw token to email to user
};

// ✅ Export using CommonJS
module.exports = mongoose.model('User', userSchema);