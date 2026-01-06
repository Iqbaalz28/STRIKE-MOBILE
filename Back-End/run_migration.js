
import db from "./src/config/db.js";

async function runMigration() {
    try {
        console.log("Adding img column to community_posts...");
        // Check if column exists first to avoid error or just use try-catch
        try {
            await db.query("ALTER TABLE community_posts ADD COLUMN img VARCHAR(255) DEFAULT NULL");
            console.log("✅ Column 'img' added successfully.");
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log("ℹ️ Column 'img' already exists.");
            } else {
                throw err;
            }
        }

        console.log("\nVerifying schema...");
        const [postsColumns] = await db.query("DESCRIBE community_posts");
        const hasImg = postsColumns.some(col => col.Field === 'img');

        if (hasImg) {
            console.log("✅ Verification successful: 'img' column is present.");
        } else {
            console.error("❌ Verification failed: 'img' column is MISSING.");
        }

    } catch (error) {
        console.error("Error running migration:", error);
    } finally {
        process.exit();
    }
}

runMigration();
