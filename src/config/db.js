require("dotenv").config();

const { Pool } = require("pg");

const isSSL = process.env.DB_SSL === "true";

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: isSSL ? { rejectUnauthorized: false } : false,
});

module.exports = {
  pool,
  connect: () => pool.connect(),
  query: (text, params) => pool.query(text, params),
  end: () => pool.end(),
};
