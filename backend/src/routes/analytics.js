import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Prediction from '../models/Prediction.js';
import WeatherData from '../models/WeatherData.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Get system analytics (admin only)
router.get('/system', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { period = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // User statistics
    const userStats = await User.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          newUsers: [
            { $match: { createdAt: { $gte: startDate } } },
            { $count: 'count' }
          ],
          byCountry: [
            { $group: { _id: '$location.country', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ],
          byRole: [
            { $group: { _id: '$role', count: { $sum: 1 } } }
          ]
        }
      }
    ]);

    // Product statistics
    const productStats = await Product.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          active: [
            { $match: { status: 'active' } },
            { $count: 'count' }
          ],
          byCategory: [
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          totalValue: [
            { $match: { status: 'active' } },
            { $group: { _id: null, total: { $sum: '$price.amount' } } }
          ]
        }
      }
    ]);

    // Prediction statistics
    const predictionStats = await Prediction.aggregate([
      {
        $facet: {
          total: [{ $count: 'count' }],
          recent: [
            { $match: { createdAt: { $gte: startDate } } },
            { $count: 'count' }
          ],
          byType: [
            { $group: { _id: '$type', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ],
          accuracy: [
            { $match: { 'validation.accuracy': { $exists: true } } },
            { $group: { _id: '$type', avgAccuracy: { $avg: '$validation.accuracy' } } }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        period,
        users: userStats[0],
        products: productStats[0],
        predictions: predictionStats[0],
        generatedAt: new Date()
      }
    });
  } catch (error) {
    logger.error('System analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system analytics'
    });
  }
});

// Get user analytics
router.get('/user', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { period = '30d' } = req.query;
    
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // User's product analytics
    const productAnalytics = await Product.aggregate([
      { $match: { 'seller.userId': userId } },
      {
        $facet: {
          total: [{ $count: 'count' }],
          active: [
            { $match: { status: 'active' } },
            { $count: 'count' }
          ],
          views: [
            { $group: { _id: null, totalViews: { $sum: '$views' } } }
          ],
          inquiries: [
            { $unwind: '$inquiries' },
            { $count: 'count' }
          ],
          revenue: [
            { $match: { status: 'sold' } },
            { $group: { _id: null, total: { $sum: '$price.amount' } } }
          ],
          byCategory: [
            { $group: { _id: '$category', count: { $sum: 1 } } }
          ]
        }
      }
    ]);

    // User's prediction analytics (for their location)
    const predictionAnalytics = await Prediction.aggregate([
      {
        $match: {
          'location.country': req.user.location.country,
          'location.region': req.user.location.region,
          createdAt: { $gte: startDate }
        }
      },
      {
        $facet: {
          total: [{ $count: 'count' }],
          byType: [
            { $group: { _id: '$type', count: { $sum: 1 } } }
          ],
          bySeverity: [
            { $match: { 'prediction.severity': { $exists: true } } },
            { $group: { _id: '$prediction.severity', count: { $sum: 1 } } }
          ],
          avgConfidence: [
            { $group: { _id: null, avg: { $avg: '$prediction.confidence' } } }
          ]
        }
      }
    ]);

    // Activity timeline
    const activityTimeline = await Product.aggregate([
      { $match: { 'seller.userId': userId, createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        period,
        products: productAnalytics[0],
        predictions: predictionAnalytics[0],
        activity: activityTimeline,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    logger.error('User analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user analytics'
    });
  }
});

// Get regional analytics
router.get('/regional', auth, async (req, res) => {
  try {
    const { country, region } = req.query;
    const userLocation = req.user.location;
    
    // Use user's location if not specified
    const targetCountry = country || userLocation.country;
    const targetRegion = region || userLocation.region;

    // Weather trends
    const weatherTrends = await WeatherData.aggregate([
      {
        $match: {
          'location.country': targetCountry,
          'location.region': targetRegion,
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          avgTemp: { $avg: '$current.temperature' },
          avgHumidity: { $avg: '$current.humidity' },
          totalRainfall: { $sum: '$current.rainfall' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Crop distribution
    const cropDistribution = await User.aggregate([
      {
        $match: {
          'location.country': targetCountry,
          'location.region': targetRegion,
          crops: { $exists: true, $ne: [] }
        }
      },
      { $unwind: '$crops' },
      { $group: { _id: '$crops', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Market activity
    const marketActivity = await Product.aggregate([
      {
        $match: {
          'location.country': targetCountry,
          'location.region': targetRegion,
          status: 'active'
        }
      },
      {
        $facet: {
          byCategory: [
            { $group: { _id: '$category', count: { $sum: 1 }, avgPrice: { $avg: '$price.amount' } } },
            { $sort: { count: -1 } }
          ],
          priceRanges: [
            {
              $bucket: {
                groupBy: '$price.amount',
                boundaries: [0, 100, 500, 1000, 5000, 10000],
                default: 'Other',
                output: { count: { $sum: 1 } }
              }
            }
          ]
        }
      }
    ]);

    // Risk assessment
    const riskAssessment = await Prediction.aggregate([
      {
        $match: {
          'location.country': targetCountry,
          'location.region': targetRegion,
          status: 'active',
          'timeframe.endDate': { $gte: new Date() }
        }
      },
      {
        $group: {
          _id: {
            type: '$type',
            severity: '$prediction.severity'
          },
          count: { $sum: 1 },
          avgConfidence: { $avg: '$prediction.confidence' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        location: { country: targetCountry, region: targetRegion },
        weather: weatherTrends,
        crops: cropDistribution,
        market: marketActivity[0],
        risks: riskAssessment,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    logger.error('Regional analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch regional analytics'
    });
  }
});

// Get prediction accuracy analytics
router.get('/prediction-accuracy', auth, async (req, res) => {
  try {
    const { type, period = '90d' } = req.query;
    
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '180d':
        startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    }

    const matchFilter = {
      'validation.validatedAt': { $gte: startDate },
      'validation.accuracy': { $exists: true }
    };

    if (type) {
      matchFilter.type = type;
    }

    const accuracyStats = await Prediction.aggregate([
      { $match: matchFilter },
      {
        $facet: {
          overall: [
            {
              $group: {
                _id: null,
                avgAccuracy: { $avg: '$validation.accuracy' },
                totalValidated: { $sum: 1 },
                highAccuracy: {
                  $sum: { $cond: [{ $gte: ['$validation.accuracy', 0.8] }, 1, 0] }
                }
              }
            }
          ],
          byType: [
            {
              $group: {
                _id: '$type',
                avgAccuracy: { $avg: '$validation.accuracy' },
                count: { $sum: 1 }
              }
            },
            { $sort: { avgAccuracy: -1 } }
          ],
          byConfidence: [
            {
              $bucket: {
                groupBy: '$prediction.confidence',
                boundaries: [0, 0.5, 0.7, 0.8, 0.9, 1.0],
                default: 'Other',
                output: {
                  count: { $sum: 1 },
                  avgAccuracy: { $avg: '$validation.accuracy' }
                }
              }
            }
          ],
          timeline: [
            {
              $group: {
                _id: {
                  year: { $year: '$validation.validatedAt' },
                  month: { $month: '$validation.validatedAt' }
                },
                avgAccuracy: { $avg: '$validation.accuracy' },
                count: { $sum: 1 }
              }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
          ]
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        period,
        type: type || 'all',
        accuracy: accuracyStats[0],
        generatedAt: new Date()
      }
    });
  } catch (error) {
    logger.error('Prediction accuracy analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prediction accuracy analytics'
    });
  }
});

export default router;