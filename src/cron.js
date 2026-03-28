const { createLinkedInPost } = require('./linkedin');

async function run() {
    try {
        const text = "Test auto post from Render cron";
        await createLinkedInPost(text);
        console.log("Done.");
        process.exit(0);
    } catch (err) {
        console.error("Failed:", err);
        process.exit(1);
    }
}

run();
