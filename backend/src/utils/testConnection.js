require('dotenv').config();
const sequelize = require('../config/db');

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    const [rows] = await sequelize.query('SELECT current_database() AS database');
    const [tables] = await sequelize.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('users', 'stores', 'ratings')
      ORDER BY table_name
    `);

    console.log('PostgreSQL connection successful');
    console.log('Database:', rows[0].database);
    console.log('Tables found:', tables.map((t) => t.table_name).join(', ') || '(none — run npm run db:init)');
    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('PostgreSQL connection failed:', err.message);
    process.exit(1);
  }
};

testConnection();
