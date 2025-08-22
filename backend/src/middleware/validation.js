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

// ✅ Register validation
const validateRegister = [
  body('name')
    .notEmpty()
    .withMessage('Name is required'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Must be a valid email'),

  body('phone')
    .optional()
    .matches(/^\+?\d{7,15}$/)
    .withMessage('Must be a valid phone number'),

  // Custom validation to ensure at least one contact method is provided
  body()
    .custom((value, { req }) => {
      const { email, phone } = req.body;
      if (!email && !phone) {
        throw new Error('Either email or phone is required');
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

  body('country')
    .notEmpty()
    .withMessage('Country is required'),

  body('region')
    .notEmpty()
    .withMessage('State/Region is required'),

  handleValidationErrors,
];

// ✅ Login validation (supports emailOrPhone)
const validateLogin = [
  body('emailOrPhone')
    .optional()
    .custom((value) => {
      if (!value) return true; // Will be handled by the next validation
      const isEmail = /\S+@\S+\.\S+/.test(value);
      const isPhone = /^\+?\d{7,15}$/.test(value);
      if (!isEmail && !isPhone) {
        throw new Error('Must be a valid email or phone number');
      }
      return true;
    }),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Must be a valid email'),

  body('phone')
    .optional()
    .matches(/^\+?\d{7,15}$/)
    .withMessage('Must be a valid phone number'),

  // Custom validation to ensure at least one identifier is provided
  body()
    .custom((value, { req }) => {
      const { emailOrPhone, email, phone } = req.body;
      if (!emailOrPhone && !email && !phone) {
        throw new Error('Email or phone is required');
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