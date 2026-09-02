require('dotenv').config();
const sequelize = require('../config/db');
const { User } = require('../models');
const { ROLES } = require('../constants/roles');

const seed = async () => {
  try {
    await sequelize.authenticate();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@store.com';
    const existing = await User.findOne({ where: { email: adminEmail } });

    if (existing) {
      console.log('Admin account already exists:', adminEmail);
      await sequelize.close();
      process.exit(0);
    }

    await User.create({
      name: process.env.ADMIN_NAME || 'System Administrator',
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      address: process.env.ADMIN_ADDRESS || '123 Admin Street, City',
      role: ROLES.ADMIN,
    });

    console.log('Admin account created:', adminEmail);
    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
