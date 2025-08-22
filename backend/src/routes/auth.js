
// backend/src/routes/auth.js
const express = require('express');
const auth = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateResetPassword,
} = require('../middleware/validation');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  forgotPassword,
  resetPassword,
  updateLanguage,
  updateAge,
  updateLocation,
} = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);

// Protected routes
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);
router.put('/password', auth, changePassword);
router.post('/logout', auth, logout);

// Extended update routes
router.put('/update-language', auth, updateLanguage);
router.put('/update-age', auth, updateAge);
router.put('/update-location', auth, updateLocation);

module.exports = router;

