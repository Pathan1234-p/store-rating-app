const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');
const {
  createUserValidation,
  createStoreValidation,
  listQueryValidation,
} = require('../middleware/validators');

const router = express.Router();

router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/dashboard', adminController.getDashboard);
router.post('/users', createUserValidation, adminController.createUser);
router.post('/stores', createStoreValidation, adminController.createStore);
router.get('/users', listQueryValidation, adminController.listUsers);
router.get('/stores', listQueryValidation, adminController.listStores);
router.get('/users/:id', adminController.getUserById);

module.exports = router;
