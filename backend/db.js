// db.js - MySQL connection pool wrapper (mysql2/promise)
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

let pool = null;

export async function connectDB() {
  if (pool) return pool;
  pool = mysql.createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  console.log("✅ MySQL pool created");
  return pool;
}

// Helper to execute queries
export default async function query(sql, params = []) {
  const p = await connectDB();
  const [rows] = await p.execute(sql, params);
  return rows;
}
