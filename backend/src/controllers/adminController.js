const { Op, fn, col, literal } = require('sequelize');
const { User, Store, Rating } = require('../models');
const { ROLES } = require('../constants/roles');

const buildUserWhere = (query) => {
  const where = {};
  if (query.name) where.name = { [Op.iLike]: `%${query.name}%` };
  if (query.email) where.email = { [Op.iLike]: `%${query.email}%` };
  if (query.address) where.address = { [Op.iLike]: `%${query.address}%` };
  if (query.role) where.role = query.role;
  return where;
};

const buildStoreWhere = (query) => {
  const where = {};
  if (query.name) where.name = { [Op.iLike]: `%${query.name}%` };
  if (query.email) where.email = { [Op.iLike]: `%${query.email}%` };
  if (query.address) where.address = { [Op.iLike]: `%${query.address}%` };
  return where;
};

const getSort = (sortBy, sortOrder, allowedFields, defaultField = 'name') => {
  const field = allowedFields.includes(sortBy) ? sortBy : defaultField;
  const order = sortOrder === 'desc' ? 'DESC' : 'ASC';
  return [[field, order]];
};

exports.getDashboard = async (req, res) => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      User.count(),
      Store.count(),
      Rating.count(),
    ]);
    res.json({ totalUsers, totalStores, totalRatings });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch dashboard', error: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, address, password, role } = req.body;
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email, address, password, role });

    if (role === ROLES.STORE_OWNER) {
      const storeEmail = `store-${user.id}@owner.local`;
      await Store.create({
        name: `${name}'s Store`,
        email: storeEmail,
        address,
        owner_id: user.id,
      });
    }

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create user', error: err.message });
  }
};

exports.createStore = async (req, res) => {
  try {
    const { name, email, address, owner_id } = req.body;
    const existing = await Store.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Store email already exists' });
    }

    if (owner_id) {
      const owner = await User.findByPk(owner_id);
      if (!owner || owner.role !== ROLES.STORE_OWNER) {
        return res.status(400).json({ message: 'owner_id must reference a store owner user' });
      }
    }

    const store = await Store.create({ name, email, address, owner_id: owner_id || null });
    res.status(201).json({ store });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create store', error: err.message });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const { sortBy, sortOrder } = req.query;
    const where = buildUserWhere(req.query);
    const order = getSort(sortBy, sortOrder, ['name', 'email', 'address', 'role']);

    const users = await User.findAll({
      where,
      attributes: ['id', 'name', 'email', 'address', 'role', 'createdAt'],
      order,
    });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Failed to list users', error: err.message });
  }
};

exports.listStores = async (req, res) => {
  try {
    const { sortBy, sortOrder } = req.query;
    const where = buildStoreWhere(req.query);
    const sortField = ['name', 'email', 'address'].includes(sortBy) ? sortBy : 'name';
    const orderDir = sortOrder === 'desc' ? 'DESC' : 'ASC';

    const stores = await Store.findAll({
      where,
      attributes: {
        include: [
          [fn('COALESCE', fn('AVG', col('ratings.rating')), 0), 'averageRating'],
        ],
      },
      include: [{ model: Rating, as: 'ratings', attributes: [] }],
      group: [col('Store.id')],
      order: sortField === 'averageRating'
        ? [[literal('"averageRating"'), orderDir]]
        : [[sortField, orderDir]],
      subQuery: false,
    });

    const formatted = stores.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      address: s.address,
      owner_id: s.owner_id,
      averageRating: parseFloat(s.getDataValue('averageRating')) || 0,
      createdAt: s.createdAt,
    }));

    res.json({ stores: formatted });
  } catch (err) {
    res.status(500).json({ message: 'Failed to list stores', error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'name', 'email', 'address', 'role', 'createdAt'],
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const result = { ...user.toJSON() };

    if (user.role === ROLES.STORE_OWNER) {
      const store = await Store.findOne({ where: { owner_id: user.id } });
      if (store) {
        const avg = await Rating.findOne({
          where: { store_id: store.id },
          attributes: [[fn('AVG', col('rating')), 'averageRating']],
          raw: true,
        });
        result.storeAverageRating = parseFloat(avg?.averageRating) || 0;
        result.storeName = store.name;
      }
    }

    res.json({ user: result });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
};
