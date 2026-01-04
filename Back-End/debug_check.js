import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function check() {
    console.log("--- DEBUGGING START ---");
    
    // 1. Check Database Content
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            database: process.env.DB_NAME || 'strike_it'
        });
        console.log("✅ DB Connection: Success");

        try {
            const [locs] = await connection.execute('SELECT COUNT(*) as count FROM locations');
            console.log(`📊 Locations count in DB: ${locs[0].count}`);
        } catch (e) { console.log("❌ Error querying locations table:", e.message); }

        try {
            const [prods] = await connection.execute('SELECT COUNT(*) as count FROM products');
            console.log(`📊 Products count in DB: ${prods[0].count}`);
        } catch (e) { console.log("❌ Error querying products table:", e.message); }

        await connection.end();
    } catch (err) {
        console.error("❌ DB Connection Failed:", err.message);
    }

    // 2. Check API Accessibility
    try {
        console.log("Testing API connection to http://127.0.0.1:3000/locations ...");
        const res = await fetch('http://127.0.0.1:3000/locations');
        if (res.ok) {
            const data = await res.json();
            console.log(`✅ API /locations reachable. Returned ${Array.isArray(data) ? data.length : 'not-array'} items.`);
        } else {
            console.log(`❌ API /locations returned status: ${res.status}`);
        }
    } catch (err) {
        console.error("❌ API Connection Failed:", err.message);
        console.log("   (Make sure the server is running with 'npm start')");
    }
    console.log("--- DEBUGGING END ---");
}

check();
