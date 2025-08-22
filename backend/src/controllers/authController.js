// backend/src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// Helper: generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
  try {
    const {
      name,           // frontend sends "name"
      age,
      country,        // frontend sends "country"
      region,         // frontend sends "region"
      preferredLanguage,
      email,
      phone,
      password,
      farmSize,
      crops
    } = req.body;

    // Validate required fields
    if (!name || (!email && !phone) || !password || !age || !preferredLanguage || !country || !region) {
      return res.status(400).json({ 
        msg: 'Please fill all required fields: name, email/phone, password, age, language, country, region' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }] 
    }).exec();

    if (existingUser) {
      return res.status(400).json({ 
        msg: 'User with this email or phone already exists' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Build location object
    const location = {
      country,
      region,
      coordinates: { lat: 0, lng: 0 } // will be updated later via geocoding
    };

    const user = await User.create({
      name,                    // changed from fullName
      age: Number(age),
      location,                // changed from farmLocation (object)
      preferredLanguage,
      email,
      phone,
      password: hashedPassword,
      farmSize: farmSize ? parseFloat(farmSize) : undefined,
      crops: crops ? crops.split(',').map(c => c.trim()).filter(Boolean) : []
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        age: user.age,
        location: user.location,
        preferredLanguage: user.preferredLanguage,
        email: user.email,
        phone: user.phone,
        farmSize: user.farmSize,
        crops: user.crops
      },
    });
  } catch (err) {
    logger.error('Registration error:', err.message || err);
    res.status(500).json({ msg: 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });

    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        age: user.age,
        location: user.location,
        preferredLanguage: user.preferredLanguage,
        email: user.email,
        phone: user.phone,
        farmSize: user.farmSize,
        crops: user.crops
      },
    });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Get current logged-in user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    res.json(user);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, age, country, region, preferredLanguage, email, phone, farmSize, crops } = req.body;

    const location = {
      country,
      region,
      coordinates: { lat: 0, lng: 0 }
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, age, location, preferredLanguage, email, phone, farmSize, crops },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) return res.status(404).json({ msg: 'User not found' });

    res.json(updatedUser);
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Old password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ msg: 'Password updated successfully' });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
exports.logoutUser = async (req, res) => {
  try {
    res.json({ msg: 'Logged out successfully (client should clear token)' });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `You requested a password reset. Click here to reset: \n\n ${resetUrl}`;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      text: message,
    });

    res.json({ msg: 'Password reset email sent' });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const resetTokenHash = crypto.createHash('sha256').update(req.body.token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ msg: 'Invalid or expired token' });

    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ msg: 'Password reset successful' });
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ msg: 'Server error' });
  }
};