const express = require('express');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const {
  loginValidation,
  signupValidation,
  passwordUpdateValidation,
} = require('../middleware/validators');

const router = express.Router();

router.post('/login', loginValidation, authController.login);
router.post('/signup', signupValidation, authController.signup);
router.put('/password', authenticate, passwordUpdateValidation, authController.updatePassword);
router.get('/me', authenticate, authController.me);

module.exports = router;
