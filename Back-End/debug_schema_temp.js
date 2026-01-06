
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkSchema() {
    try {
        const pool = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'strike_db',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        console.log("Connected to DB...");

        console.log("\n--- Describe community_posts ---");
        const [rows] = await pool.query("DESCRIBE community_posts");
        console.log(JSON.stringify(rows, null, 2));

        console.log("\n--- Describe users ---");
        const [users] = await pool.query("DESCRIBE users");
        console.log(JSON.stringify(users, null, 2));

        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

checkSchema();
