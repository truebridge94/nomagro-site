// backend/src/models/Product.js
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: {
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    unit: { type: String, required: true }
  },
  quantity: {
    available: { type: Number, required: true },
    unit: { type: String, required: true }
  },
  seller: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    contact: {
      phone: { type: String, required: true },
      email: { type: String, required: true },
      whatsapp: { type: String }
    }
  },
  location: {
    country: { type: String, required: true },
    region: { type: String, required: true }
  },
  images: [{
    url: { type: String, required: true },
    alt: { type: String },
    isPrimary: { type: Boolean, default: false }
  }],
  specifications: {
    harvestDate: { type: Date },
    expiryDate: { type: Date },
    isOrganic: { type: Boolean, default: false },
    variety: { type: String },
    grade: { type: String },
    certifications: [String]
  },
  status: { type: String, default: 'active' },
  views: { type: Number, default: 0 },
  inquiries: [{
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String },
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now }
  }],
  ratings: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  averageRating: { type: Number, default: 0 }
});

// Method to recalculate average rating
ProductSchema.methods.calculateAverageRating = async function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
  } else {
    const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
    this.averageRating = sum / this.ratings.length;
  }
  await this.save();
};

module.exports = mongoose.model('Product', ProductSchema);