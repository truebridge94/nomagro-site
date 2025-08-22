// backend/src/routes/auth.js
const express = require('express');
const auth = require('../middleware/auth');
const { validateRegister } = require('../middleware/validation'); // ✅ Add this
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register); // ✅ Validation added
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes (require auth)
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);
router.put('/password', auth, changePassword);
router.post('/logout', auth, logout);

// Export using CommonJS
module.exports = router;