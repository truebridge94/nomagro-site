// backend/src/routes/marketplace.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const Product = require('../models/Product');
const { validateProduct } = require('../utils/validation');
const logger = require('../utils/logger');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all products with filtering and pagination
router.get('/products', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      country,
      region,
      minPrice,
      maxPrice,
      isOrganic,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { status: 'active' };

    if (category) filter.category = category;
    if (country) filter['location.country'] = country;
    if (region) filter['location.region'] = region;
    if (isOrganic !== undefined) filter['specifications.isOrganic'] = isOrganic === 'true';

    if (minPrice || maxPrice) {
      filter['price.amount'] = {};
      if (minPrice) filter['price.amount'].$gte = parseFloat(minPrice);
      if (maxPrice) filter['price.amount'].$lte = parseFloat(maxPrice);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const products = await Product.find(filter)
      .populate('seller.userId', 'name')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});

// Get single product
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller.userId', 'name email')
      .populate('inquiries.buyerId', 'name')
      .populate('ratings.userId', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count
    product.views += 1;
    await product.save();

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    logger.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product'
    });
  }
});

// Create new product
router.post('/products', auth, upload.array('images', 5), async (req, res) => {
  try {
    // Validate input
    const { error } = validateProduct(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Process uploaded images
    const images = req.files ? req.files.map((file, index) => ({
      url: `/uploads/products/${file.filename}`,
      alt: `${req.body.name} image ${index + 1}`,
      isPrimary: index === 0
    })) : [];

    // Create product
    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: {
        amount: parseFloat(req.body.price),
        currency: req.body.currency || 'USD',
        unit: req.body.priceUnit
      },
      quantity: {
        available: parseInt(req.body.quantity),
        unit: req.body.quantityUnit
      },
      seller: {
        userId: req.user._id,
        name: req.user.name,
        contact: {
          phone: req.body.phone,
          email: req.body.email || req.user.email,
          whatsapp: req.body.whatsapp
        }
      },
      location: req.user.location,
      images: images,
      specifications: {
        harvestDate: req.body.harvestDate ? new Date(req.body.harvestDate) : undefined,
        expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : undefined,
        isOrganic: req.body.isOrganic === 'true',
        variety: req.body.variety,
        grade: req.body.grade,
        certifications: req.body.certifications ? req.body.certifications.split(',') : []
      },
      status: 'active'
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    logger.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product'
    });
  }
});

// Update product
router.put('/products/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user owns the product
    if (product.seller.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    // Update fields
    const allowedUpdates = [
      'name', 'description', 'category', 'price', 'quantity',
      'specifications', 'status'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'price') {
          product.price.amount = parseFloat(req.body.price);
          if (req.body.priceUnit) product.price.unit = req.body.priceUnit;
        } else if (field === 'quantity') {
          product.quantity.available = parseInt(req.body.quantity);
          if (req.body.quantityUnit) product.quantity.unit = req.body.quantityUnit;
        } else {
          product[field] = req.body[field];
        }
      }
    });

    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        url: `/uploads/products/${file.filename}`,
        alt: `${product.name} image ${index + 1}`,
        isPrimary: product.images.length === 0 && index === 0
      }));
      product.images.push(...newImages);
    }

    await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    logger.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update product'
    });
  }
});

// Delete product
router.delete('/products/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user owns the product
    if (product.seller.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    logger.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete product'
    });
  }
});

// Add inquiry to product
router.post('/products/:id/inquiries', auth, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user is not the seller
    if (product.seller.userId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot inquire about your own product'
      });
    }

    product.inquiries.push({
      buyerId: req.user._id,
      message,
      createdAt: new Date(),
      status: 'pending'
    });

    await product.save();

    res.json({
      success: true,
      message: 'Inquiry sent successfully'
    });
  } catch (error) {
    logger.error('Add inquiry error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send inquiry'
    });
  }
});

// Add rating to product
router.post('/products/:id/ratings', auth, async (req, res) => {
  try {
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already rated this product
    const existingRating = product.ratings.find(
      r => r.userId.toString() === req.user._id.toString()
    );

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'You have already rated this product'
      });
    }

    product.ratings.push({
      userId: req.user._id,
      rating: parseInt(rating),
      review,
      createdAt: new Date()
    });

    // Recalculate average rating
    await product.calculateAverageRating();

    res.json({
      success: true,
      message: 'Rating added successfully'
    });
  } catch (error) {
    logger.error('Add rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add rating'
    });
  }
});

// Get user's products
router.get('/my-products', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const filter = { 'seller.userId': req.user._id };
    if (status) filter.status = status;

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get user products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your products'
    });
  }
});

// Export using CommonJS
module.exports = router;