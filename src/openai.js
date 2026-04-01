const OpenAI = require('openai');
const { getRecentInsightsSummary } = require('./memory');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function generateLinkedInPost(rawContent) {
    if (!rawContent) return null;

    console.log('Generating LinkedIn post using OpenAI...');

    // Load accumulated learning insights
    const learnedInsights = getRecentInsightsSummary(5);
    const learningBlock = learnedInsights
        ? `\n# Learned Writing Principles (From Past Successful Posts):\nApply these proven principles from previous successful posts:\n${learnedInsights}\n`
        : '';

    if (learnedInsights) {
        console.log(`🧠 Applying ${learnedInsights.split('\n').length} learned insights to this post.`);
    }

     const systemMessage = `# Role
You are a visionary AI Strategist and Thought Leader. Your goal is to write sophisticated, high-level LinkedIn posts that focus on the future of Enterprise AI, orchestration, and strategic value. Your tone is authoritative, visionary, and concise.

# Writing Principles:
• Start with a provocative, future-focused hook that challenges current thinking.
• Use a short introductory paragraph to set the context.
• Break down complex ideas into 3-4 clearly defined, numbered sections with bold titles (e.g., "1. Systems Over Models").
• Focus on strategic shifts, efficiency, ROI, and domain-specific excellence.
• Conclude with a "The takeaway is clear" summary followed by a challenging question to the audience.

# Tone & Style Example (Must replicate this structure):
"The AI of today will be ancient history by 2026.

The pace of innovation is accelerating... [Topic Context].

Here are [X] key trends that will define [Topic] in the near future.

1. [Bold Title]
[Concise explanation of the trend/shift].

[Repeat for other points]

The takeaway is clear. [Summary of the vision]. [Call-to-action Question]?"
${learningBlock}
# Requirements:
• TEXT ONLY.
• NO hashtags.
• NO em-dashes.
• NO clickbait slang.
• Max 2 sentences per paragraph.
• Character limit: strictly under 1800.`;

    const prompt = `Raw content: ${rawContent}`;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 1000,
        });

        let text = response.choices[0].message.content;

        // Clean up formatting
        text = text.replace(/#/g, '').replace(/\*/g, '');

        return text;
    } catch (error) {
        console.error('Error generating content with OpenAI:', error.message);
        throw error;
    }
}

module.exports = { generateLinkedInPost };
