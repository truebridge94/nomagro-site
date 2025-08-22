// backend/src/routes/auth.js
const express = require('express');
const auth = require('../middleware/auth');
const validation = require('../middleware/validation');
const authController = require('../controllers/authController'); // ✅ No destructuring

const router = express.Router();

// Public routes
router.post('/register', validation.validateRegister, authController.registerUser);
router.post('/login', validation.validateLogin, authController.loginUser);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', validation.validateResetPassword, authController.resetPassword);

// Protected routes
router.get('/me', auth, authController.getMe);
router.put('/profile', auth, authController.updateProfile);
router.put('/password', auth, authController.changePassword);
router.post('/logout', auth, authController.logoutUser);

// Extended update routes
router.put('/update-language', auth, authController.updateLanguage);
router.put('/update-age', auth, authController.updateAge);
router.put('/update-location', auth, authController.updateLocation);

module.exports = router;