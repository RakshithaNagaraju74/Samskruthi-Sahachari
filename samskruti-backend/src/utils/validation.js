const { body } = require('express-validator');

const validateRegistration = (userType) => {
  const baseValidations = [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)
      .withMessage('Password must contain at least one letter, one number, and one special character')
  ];

  const userValidations = [
    body('full_name')
      .notEmpty()
      .withMessage('Full name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Full name must be between 2 and 100 characters'),
    body('phone')
      .optional()
      .matches(/^[0-9]{10}$/)
      .withMessage('Please provide a valid 10-digit phone number')
  ];

  const enterpriseValidations = [
    body('company_name')
      .notEmpty()
      .withMessage('Company name is required')
      .isLength({ min: 2, max: 200 })
      .withMessage('Company name must be between 2 and 200 characters'),
    body('registration_number')
      .notEmpty()
      .withMessage('Registration number is required'),
    body('gst_number')
      .optional()
      .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
      .withMessage('Please provide a valid GST number'),
    body('company_phone')
      .optional()
      .matches(/^[0-9]{10}$/)
      .withMessage('Please provide a valid 10-digit phone number'),
    body('company_email')
      .optional()
      .isEmail()
      .normalizeEmail()
  ];

  const sellerValidations = [
    body('shop_name')
      .notEmpty()
      .withMessage('Shop name is required')
      .isLength({ min: 2, max: 200 })
      .withMessage('Shop name must be between 2 and 200 characters'),
    body('owner_name')
      .notEmpty()
      .withMessage('Owner name is required'),
    body('phone')
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^[0-9]{10}$/)
      .withMessage('Please provide a valid 10-digit phone number'),
    body('shop_address')
      .notEmpty()
      .withMessage('Shop address is required'),
    body('gst_number')
      .optional()
      .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
      .withMessage('Please provide a valid GST number')
  ];

  switch(userType) {
    case 'enterprise':
      return [...baseValidations, ...enterpriseValidations];
    case 'seller':
      return [...baseValidations, ...sellerValidations];
    default:
      return [...baseValidations, ...userValidations];
  }
};

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

module.exports = {
  validateRegistration,
  validateLogin
};