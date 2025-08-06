import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Prediction from '../models/Prediction.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Get user dashboard data
router.get('/dashboard', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { location } = req.user;

    // Get user's recent predictions
    const predictions = await Prediction.find({
      'location.country': location.country,
      'location.region': location.region,
      status: 'active',
      'timeframe.endDate': { $gte: new Date() }
    }).sort({ createdAt: -1 }).limit(5);

    // Get user's products
    const products = await Product.find({
      'seller.userId': userId
    }).countDocuments();

    // Get user's product inquiries
    const inquiries = await Product.aggregate([
      { $match: { 'seller.userId': userId } },
      { $unwind: '$inquiries' },
      { $match: { 'inquiries.status': 'pending' } },
      { $count: 'total' }
    ]);

    // Get user's activity stats
    const stats = {
      totalProducts: products,
      pendingInquiries: inquiries[0]?.total || 0,
      activePredictions: predictions.length,
      lastLogin: req.user.lastLogin
    };

    res.json({
      success: true,
      data: {
        user: req.user,
        predictions,
        stats
      }
    });
  } catch (error) {
    logger.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

// Update user preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const { notifications, language } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          'preferences.notifications': notifications,
          'preferences.language': language
        }
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: user
    });
  } catch (error) {
    logger.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences'
    });
  }
});

// Get nearby users (for networking)
router.get('/nearby', auth, async (req, res) => {
  try {
    const { radius = 50 } = req.query; // radius in km
    const { coordinates } = req.user.location;

    const nearbyUsers = await User.find({
      _id: { $ne: req.user._id },
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [coordinates.lng, coordinates.lat]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      }
    }).select('name location.region location.country farmSize crops').limit(20);

    res.json({
      success: true,
      data: nearbyUsers
    });
  } catch (error) {
    logger.error('Get nearby users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby users'
    });
  }
});

// Get user's activity history
router.get('/activity', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const userId = req.user._id;

    let activities = [];

    // Get user's predictions
    if (!type || type === 'predictions') {
      const predictions = await Prediction.find({
        'location.country': req.user.location.country,
        'location.region': req.user.location.region
      }).sort({ createdAt: -1 }).limit(10);

      activities.push(...predictions.map(p => ({
        type: 'prediction',
        action: `${p.type} prediction generated`,
        data: p,
        createdAt: p.createdAt
      })));
    }

    // Get user's products
    if (!type || type === 'products') {
      const products = await Product.find({
        'seller.userId': userId
      }).sort({ createdAt: -1 }).limit(10);

      activities.push(...products.map(p => ({
        type: 'product',
        action: `Product "${p.name}" ${p.status}`,
        data: p,
        createdAt: p.createdAt
      })));
    }

    // Sort all activities by date
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedActivities = activities.slice(startIndex, startIndex + limit);

    res.json({
      success: true,
      data: {
        activities: paginatedActivities,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(activities.length / limit),
          total: activities.length,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    logger.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity history'
    });
  }
});

// Get user statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { location } = req.user;

    // Product statistics
    const productStats = await Product.aggregate([
      { $match: { 'seller.userId': userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$price.amount' }
        }
      }
    ]);

    // Prediction accuracy (if user has validated predictions)
    const predictionStats = await Prediction.aggregate([
      {
        $match: {
          'location.country': location.country,
          'location.region': location.region,
          'validation.validatedBy': userId
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avgAccuracy: { $avg: '$validation.accuracy' }
        }
      }
    ]);

    // Monthly activity
    const monthlyActivity = await Product.aggregate([
      { $match: { 'seller.userId': userId } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      data: {
        products: productStats,
        predictions: predictionStats,
        monthlyActivity
      }
    });
  } catch (error) {
    logger.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

// Delete user account
router.delete('/account', auth, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account'
      });
    }

    // Verify password
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Delete user's products
    await Product.deleteMany({ 'seller.userId': req.user._id });

    // Delete user account
    await User.findByIdAndDelete(req.user._id);

    logger.info(`User account deleted: ${user.email}`);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    logger.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    });
  }
});

export default router;