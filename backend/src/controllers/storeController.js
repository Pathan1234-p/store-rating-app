const { Op, fn, col } = require('sequelize');
const { Store, Rating } = require('../models');

exports.listStores = async (req, res) => {
  try {
    const { name, address, sortBy, sortOrder } = req.query;
    const where = {};
    if (name) where.name = { [Op.iLike]: `%${name}%` };
    if (address) where.address = { [Op.iLike]: `%${address}%` };

    const sortField = ['name', 'address'].includes(sortBy) ? sortBy : 'name';
    const orderDir = sortOrder === 'desc' ? 'DESC' : 'ASC';

    const stores = await Store.findAll({
      where,
      order: [[sortField, orderDir]],
    });

    const userRatings = await Rating.findAll({
      where: { user_id: req.user.id },
      attributes: ['store_id', 'rating', 'id'],
    });
    const ratingMap = Object.fromEntries(userRatings.map((r) => [r.store_id, r]));

    const formatted = await Promise.all(
      stores.map(async (s) => {
        const avgResult = await Rating.findOne({
          where: { store_id: s.id },
          attributes: [[fn('AVG', col('rating')), 'averageRating']],
          raw: true,
        });
        const userRating = ratingMap[s.id];
        return {
          id: s.id,
          name: s.name,
          address: s.address,
          averageRating: parseFloat(avgResult?.averageRating) || 0,
          userRating: userRating ? userRating.rating : null,
          userRatingId: userRating ? userRating.id : null,
        };
      })
    );

    res.json({ stores: formatted });
  } catch (err) {
    res.status(500).json({ message: 'Failed to list stores', error: err.message });
  }
};

exports.submitRating = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { rating } = req.body;

    const store = await Store.findByPk(storeId);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const existing = await Rating.findOne({
      where: { user_id: req.user.id, store_id: storeId },
    });
    if (existing) {
      return res.status(409).json({ message: 'Rating already exists. Use PUT to update.' });
    }

    const newRating = await Rating.create({
      user_id: req.user.id,
      store_id: storeId,
      rating,
    });
    res.status(201).json({ rating: newRating });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit rating', error: err.message });
  }
};

exports.updateRating = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { rating } = req.body;

    const existing = await Rating.findOne({
      where: { user_id: req.user.id, store_id: storeId },
    });
    if (!existing) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    existing.rating = rating;
    await existing.save();
    res.json({ rating: existing });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update rating', error: err.message });
  }
};
