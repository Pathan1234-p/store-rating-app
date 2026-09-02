require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/db');
require('./models');

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    console.error('Ensure PostgreSQL is running, roxiler_rating exists, and schema.sql has been applied.');
    process.exit(1);
  }
};

start();
