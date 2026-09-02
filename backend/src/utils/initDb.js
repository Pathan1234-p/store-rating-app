require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const SCHEMA_PATH = path.join(__dirname, '../../sql/schema.sql');

const initDb = async () => {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set in .env');
    process.exit(1);
  }

  const sql = fs.readFileSync(SCHEMA_PATH, 'utf8');
  const useSsl = process.env.NODE_ENV === 'production' || process.env.DATABASE_URL.includes('render.com');
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: useSsl ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    await client.query(sql);
    console.log('Database schema applied successfully from sql/schema.sql');
  } catch (err) {
    console.error('Database initialization failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
};

initDb();
