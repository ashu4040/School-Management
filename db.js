// db.js
const mysql = require("mysql2/promise");
require("dotenv").config();

let pool;

function createPool() {
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
  console.log("✅ MySQL pool created");
}

createPool();

// Idle ping every 5 minutes to keep connection alive
setInterval(async () => {
  try {
    await pool.query("SELECT 1");
  } catch (err) {
    console.error("Ping failed, reconnecting...", err.code);
    createPool();
  }
}, 5 * 60 * 1000);

// Simple query wrapper
async function query(sql, params) {
  try {
    return await pool.execute(sql, params);
  } catch (err) {
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.log("🔄 Connection lost, reconnecting...");
      createPool();
      return await pool.execute(sql, params);
    }
    throw err;
  }
}

module.exports = { query };
