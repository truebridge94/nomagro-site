import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Cash Crops', 'Cereals', 'Root Crops', 'Vegetables', 'Fruits', 'Livestock', 'Seeds', 'Equipment']
  },
  price: {
    amount: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    currency: {
      type: String,
      default: 'USD'
    },
    unit: {
      type: String,
      required: [true, 'Price unit is required'],
      enum: ['per kg', 'per ton', 'per bag', 'per crate', 'per piece', 'per liter']
    }
  },
  quantity: {
    available: {
      type: Number,
      required: [true, 'Available quantity is required'],
      min: [0, 'Quantity cannot be negative']
    },
    unit: {
      type: String,
      required: [true, 'Quantity unit is required']
    }
  },
  seller: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: { type: String, required: true },
    contact: {
      phone: { type: String, required: true },
      email: { type: String, required: true },
      whatsapp: String
    }
  },
  location: {
    country: { type: String, required: true },
    region: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    address: String
  },
  images: [{
    url: { type: String, required: true },
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  specifications: {
    harvestDate: Date,
    expiryDate: Date,
    isOrganic: { type: Boolean, default: false },
    variety: String,
    grade: {
      type: String,
      enum: ['A', 'B', 'C', 'Premium', 'Standard']
    },
    certifications: [String]
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'sold', 'expired', 'suspended'],
    default: 'draft'
  },
  views: {
    type: Number,
    default: 0
  },
  inquiries: [{
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'responded', 'closed'],
      default: 'pending'
    }
  }],
  ratings: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
productSchema.index({ 'location.coordinates': '2dsphere' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ 'seller.userId': 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'price.amount': 1 });

// Calculate average rating
productSchema.methods.calculateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
  } else {
    const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
    this.averageRating = sum / this.ratings.length;
  }
  return this.save();
};

export default mongoose.model('Product', productSchema);