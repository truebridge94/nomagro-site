// backend/src/routes/auth.js
const express = require('express');
const auth = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateResetPassword,
} = require('../middleware/validation');

// ✅ Correct: Use the actual export names from authController
const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
  logoutUser,
  forgotPassword,
  resetPassword,
  updateLanguage,
  updateAge,
  updateLocation,
} = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);

// Protected routes
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);
router.put('/password', auth, changePassword);
router.post('/logout', auth, logoutUser);

// Extended update routes
router.put('/update-language', auth, updateLanguage);
router.put('/update-age', auth, updateAge);
router.put('/update-location', auth, updateLocation);

module.exports = router;