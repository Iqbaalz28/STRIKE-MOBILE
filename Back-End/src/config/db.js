// src/config/db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Membuat "Pool" koneksi di sini
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Cek koneksi sekali saat server nyala (Opsional, biar tau kalau error)
// db.getConnection()
//   .then((conn) => {
//     console.log("✅ Database terhubung sukses!");
//     conn.release();
//   })
//   .catch((err) => {
//     console.error("❌ Gagal connect database:", err.message);
//   });

export default db;
