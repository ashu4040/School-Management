// db.js
const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();

let connection;

function connectDB() {
  connection = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "school_management",
  });

  connection.connect((err) => {
    if (err) {
      console.error("❌ DB connection error:", err);
      setTimeout(connectDB, 2000); // retry
    } else {
      console.log("✅ MySQL connected");
    }
  });

  connection.on("error", (err) => {
    console.error("⚠️ DB error", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      connectDB(); // reconnect
    } else {
      throw err;
    }
  });
}

connectDB();

module.exports = connection;
