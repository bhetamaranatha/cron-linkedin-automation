const cron = require('node-cron');
const { searchAIUpdates } = require('./tavily');
const { generateLinkedInPost } = require('./openai');
const { createLinkedInPost } = require('./linkedin');
const { saveExecution } = require('./memory');
const { learnFromSuccess } = require('./learner');
require('dotenv').config();

async function runWorkflow() {
    const startTime = Date.now();
    console.log(`\n--- Starting Workflow: ${new Date().toLocaleString()} ---`);

    let rawContent = null;
    let postText = null;

    try {
        // 1. Research
        rawContent = await searchAIUpdates();

        if (!rawContent) {
            console.log('No content found. Retrying in next cycle.');
            saveExecution({
                status: 'skipped',
                reason: 'No content found from Tavily',
                topic: null,
                content: null,
                linkedinPostId: null,
                durationMs: Date.now() - startTime,
            });
            return;
        }

        // Extract a short topic summary (first 120 chars of raw content)
        const topic = rawContent.slice(0, 120).replace(/\s+/g, ' ').trim();

        // 2. Generate Content
        postText = await generateLinkedInPost(rawContent);

        if (!postText) {
            console.log('Failed to generate post text.');
            saveExecution({
                status: 'failed',
                reason: 'Gemini returned empty response',
                topic,
                content: null,
                linkedinPostId: null,
                durationMs: Date.now() - startTime,
            });
            return;
        }

        // 3. Post to LinkedIn
        const result = await createLinkedInPost(postText);

        const status = result.skipped ? 'skipped' : 'success';
        const record = saveExecution({
            status,
            reason: result.skipped ? 'LinkedIn token not configured' : null,
            topic,
            content: postText,
            linkedinPostId: result.postId || null,
            durationMs: Date.now() - startTime,
        });

        console.log(`--- Workflow Completed (${status}) in ${record.durationMs}ms ---\n`);

        // 4. Self-Learning: reflect on successful posts
        if (status === 'success' || status === 'skipped') {
            await learnFromSuccess(postText, topic);
        }

    } catch (error) {
        console.error('--- Workflow Failed ---', error.message);
        saveExecution({
            status: 'failed',
            reason: error.message,
            topic: rawContent ? rawContent.slice(0, 120).trim() : null,
            content: postText,
            linkedinPostId: null,
            durationMs: Date.now() - startTime,
        });
    }
}

// Schedule: Every day at 09:00 (Asia/Jakarta)
console.log('LinkedIn Automation Service Started...');
console.log('Schedule: Every day at 09:00 (Asia/Jakarta)');
console.log('Dashboard: http://localhost:3000\n');

cron.schedule('0 9 * * *', () => {
    runWorkflow();
}, {
    timezone: "Asia/Jakarta"
});

// Run immediately if --now flag passed
if (process.argv.includes('--now')) {
    runWorkflow();
}

module.exports = { runWorkflow };
