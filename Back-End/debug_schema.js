
import db from "./src/config/db.js";
import fs from "fs";

async function checkSchema() {
    try {
        let output = "";
        output += "--- community_posts ---\n";
        const [postsColumns] = await db.query("DESCRIBE community_posts");
        output += JSON.stringify(postsColumns, null, 2);

        output += "\n\n--- users ---\n";
        const [usersColumns] = await db.query("DESCRIBE users");
        output += JSON.stringify(usersColumns, null, 2);

        output += "\n\n--- post_likes ---\n";
        const [likesColumns] = await db.query("DESCRIBE post_likes");
        output += JSON.stringify(likesColumns, null, 2);

        output += "\n\n--- post_comments ---\n";
        const [commentsColumns] = await db.query("DESCRIBE post_comments");
        output += JSON.stringify(commentsColumns, null, 2);

        fs.writeFileSync("schema_output.txt", output);
        console.log("Schema written to schema_output.txt");

    } catch (error) {
        console.error("Error checking schema:", error);
    } finally {
        process.exit();
    }
}

checkSchema();
