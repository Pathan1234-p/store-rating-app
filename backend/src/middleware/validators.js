const { body, query, validationResult } = require('express-validator');
const { ALL_ROLES } = require('../constants/roles');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const nameRules = body('name')
  .trim()
  .isLength({ min: 20, max: 60 })
  .withMessage('Name must be between 20 and 60 characters');

const addressRules = body('address')
  .trim()
  .isLength({ max: 400 })
  .withMessage('Address must be at most 400 characters');

const passwordRules = body('password')
  .isLength({ min: 8, max: 16 })
  .withMessage('Password must be between 8 and 16 characters')
  .matches(/[A-Z]/)
  .withMessage('Password must contain at least one uppercase letter')
  .matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/)
  .withMessage('Password must contain at least one special character');

const emailRules = body('email')
  .trim()
  .isEmail()
  .withMessage('Invalid email format')
  .normalizeEmail();

const loginValidation = [
  emailRules,
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];

const signupValidation = [
  nameRules,
  emailRules,
  addressRules,
  passwordRules,
  handleValidation,
];

const passwordUpdateValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be between 8 and 16 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/)
    .withMessage('Password must contain at least one special character'),
  handleValidation,
];

const createUserValidation = [
  nameRules,
  emailRules,
  addressRules,
  passwordRules,
  body('role')
    .isIn(ALL_ROLES)
    .withMessage(`Role must be one of: ${ALL_ROLES.join(', ')}`),
  handleValidation,
];

const createStoreValidation = [
  nameRules,
  emailRules,
  addressRules,
  body('owner_id').optional({ nullable: true }).isInt().withMessage('owner_id must be an integer'),
  handleValidation,
];

const ratingValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  handleValidation,
];

const listQueryValidation = [
  query('sortBy').optional().isString(),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('name').optional().isString(),
  query('email').optional().isString(),
  query('address').optional().isString(),
  query('role').optional().isIn(ALL_ROLES),
  handleValidation,
];

module.exports = {
  loginValidation,
  signupValidation,
  passwordUpdateValidation,
  createUserValidation,
  createStoreValidation,
  ratingValidation,
  listQueryValidation,
  handleValidation,
};
