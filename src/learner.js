const OpenAI = require('openai');
const { saveInsight } = require('./memory');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * After a successful post, ask OpenAI to reflect on what made the content strong.
 * The insight is stored and used to improve future posts.
 */
async function learnFromSuccess(postContent, topic) {
    if (!postContent) return;

    console.log('🧠 AI Self-Learning: Reflecting on successful post...');

    const reflectionPrompt = `You are an expert LinkedIn content analyst. A LinkedIn post was just published successfully.

Topic area: "${topic || 'AI in Business'}"

Post content:
---
${postContent}
---

Analyze this post and extract ONE concise, actionable writing principle that made it effective. 
This principle will be used to make future posts better.

Respond with ONLY a single sentence starting with a verb, max 25 words. 
Example: "Open with a bold future prediction to instantly capture attention and challenge conventional thinking."`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "user", content: reflectionPrompt }
            ],
            temperature: 0.4,
            max_tokens: 100,
        });

        const note = response.choices[0].message.content.trim().replace(/['"]/g, '');
        if (note && note.length > 10) {
            saveInsight({ note, topic: topic || 'AI in Business' });
            console.log(`✅ Insight saved: "${note}"`);
        }
    } catch (error) {
        // Non-critical — don't let learning failure break the workflow
        console.warn('⚠️ Learning reflection failed (non-critical):', error.message);
    }
}

module.exports = { learnFromSuccess };
