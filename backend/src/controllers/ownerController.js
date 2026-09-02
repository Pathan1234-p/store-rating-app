const { fn, col } = require('sequelize');
const { Store, Rating, User } = require('../models');

exports.getDashboard = async (req, res) => {
  try {
    const store = await Store.findOne({ where: { owner_id: req.user.id } });
    if (!store) {
      return res.status(404).json({ message: 'No store associated with this owner' });
    }

    const avgResult = await Rating.findOne({
      where: { store_id: store.id },
      attributes: [[fn('AVG', col('rating')), 'averageRating']],
      raw: true,
    });
    const averageRating = parseFloat(avgResult?.averageRating) || 0;

    const raters = await Rating.findAll({
      where: { store_id: store.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const formatted = raters.map((r) => ({
      name: r.user.name,
      email: r.user.email,
      rating: r.rating,
      date: r.createdAt,
    }));

    res.json({
      store: { id: store.id, name: store.name, address: store.address },
      averageRating,
      raters: formatted,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch dashboard', error: err.message });
  }
};
