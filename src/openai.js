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
You write LinkedIn posts that sound like a real person, not a consultant. Direct, casual, confident. Like texting a smart friend who knows their stuff.

# Writing Principles:
- Hook first. One bold line that stands alone. No warm-up.
- Short sentences. One idea per sentence. Fragments are fine.
- Casual language is intentional: "guys", "damn", "crazy", "brilliant", "easy", "cmon"
- Use specific numbers and examples over vague claims ("8 hours a day", "seconds", "5 jobs")
- Problem to solution to result. That's the structure.
- One CTA at the very end. Clean and direct: "Comment X to get Y" or "Follow for more"
- 3-6 short paragraphs. No headers. No bullets. Just flowing short paragraphs.

# Tone Example (replicate this energy):
"AI just replaced 8 hours of my work. With one prompt.

[Setup the problem or story in 2-3 casual sentences. Real, grounded, specific.]

[Pivot to the solution or insight. What changed. What works. Keep it punchy.]

[The result. What's possible now. One or two sentences max.]

[Single CTA]"

${learningBlock}
# Requirements:
- TEXT ONLY
- NO hashtags
- NO em-dashes
- NO formal business language (no "leverage", "synergy", "utilize")
- NO long intros or throat-clearing
- NO multiple CTAs
- Short sentences dominate
- Slight grammar informality is intentional, keep it
- Character limit: strictly under 1800`;

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
