const express = require('express');
const storeController = require('../controllers/storeController');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');
const { ratingValidation } = require('../middleware/validators');

const router = express.Router();

router.use(authenticate, authorize(ROLES.USER));

router.get('/', storeController.listStores);
router.post('/:storeId/ratings', ratingValidation, storeController.submitRating);
router.put('/:storeId/ratings', ratingValidation, storeController.updateRating);

module.exports = router;
