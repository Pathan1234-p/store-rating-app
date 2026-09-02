const express = require('express');
const ownerController = require('../controllers/ownerController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');

const router = express.Router();

router.use(authenticate, authorize(ROLES.STORE_OWNER));

router.get('/dashboard', ownerController.getDashboard);

module.exports = router;
