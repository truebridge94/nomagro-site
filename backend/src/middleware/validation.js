// backend/src/middleware/validation.js
const { body, validationResult } = require('express-validator');

// Handle validation errors middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// ✅ Register validation (email OR phone required + extra fields)
const validateRegister = [
  body('name')
    .notEmpty()
    .withMessage('Name is required'),

  body().custom((_, { req }) => {
    if (!req.body.email && !req.body.phone) {
      throw new Error('Either email or phone is required');
    }

    if (req.body.email && !/\S+@\S+\.\S+/.test(req.body.email)) {
      throw new Error('Valid email is required');
    }

    if (req.body.phone && !/^\+?\d{7,15}$/.test(req.body.phone)) {
      throw new Error('Valid phone number is required');
    }

    return true;
  }),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  body('age')
    .notEmpty()
    .withMessage('Age is required')
    .isInt({ min: 1 })
    .withMessage('Age must be a positive number'),

  body('preferredLanguage')
    .notEmpty()
    .withMessage('Preferred language is required'),

  // ✅ Replace farmLocation.state with country
  body('country')
    .notEmpty()
    .withMessage('Country is required'),

  // ✅ Replace farmLocation.lga with region
  body('region')
    .notEmpty()
    .withMessage('State/Region is required'),

  handleValidationErrors,
];

// ✅ Login validation (email OR phone + password)
const validateLogin = [
  body().custom((_, { req }) => {
    if (!req.body.email && !req.body.phone) {
      throw new Error('Either email or phone is required');
    }

    if (req.body.email && !/\S+@\S+\.\S+/.test(req.body.email)) {
      throw new Error('Valid email is required');
    }

    if (req.body.phone && !/^\+?\d{7,15}$/.test(req.body.phone)) {
      throw new Error('Valid phone number is required');
    }

    return true;
  }),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors,
];

// ✅ Reset password validation
const validateResetPassword = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  handleValidationErrors,
];

// ✅ Update profile validation
const validateUpdateProfile = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('age').optional().isInt({ min: 1 }).withMessage('Age must be a positive number'),
  body('preferredLanguage').optional().notEmpty().withMessage('Preferred language is required'),
  // ✅ Replace with country and region
  body('country').optional().notEmpty().withMessage('Country is required'),
  body('region').optional().notEmpty().withMessage('State/Region is required'),
  handleValidationErrors,
];

// ✅ Change password validation
const validateChangePassword = [
  body('oldPassword')
    .notEmpty()
    .withMessage('Old password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  handleValidationErrors,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateResetPassword,
  validateUpdateProfile,
  validateChangePassword,
};