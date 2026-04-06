const axios = require('axios');
require('dotenv').config();

const AI_BUSINESS_TOPICS = [
    "Latest trends in Enterprise AI Agent Orchestration",
    "ROI of AI implementation in manufacturing and supply chain",
    "AI Governance and Ethics for corporate leadership",
    "Generative AI for personalized customer experience at scale",
    "Impact of Multi-modal LLMs on business decision making",
    "AI-Human collaboration models in modern workplaces",
    "Cost-benefit analysis of Open-source vs Proprietary LLMs for business",
    "AI-driven predictive analytics for market expansion",
    "The role of Vector Databases in enterprise knowledge management",
    "Zero-shot learning applications in niche industry sectors",
    "AI agents for autonomous procurement and vendor management",
    "Hyper-automation in financial services using LLMs",
    "Sustainable AI: Reducing the carbon footprint of enterprise models",
    "AI-powered cybersecurity: Threat detection and response",
    "Edge AI: Deploying intelligent models on-premise for privacy",
    "The evolution of Prompt Engineering into Agentic Workflow Design",
    "Customizing LLMs with RAG (Retrieval-Augmented Generation) for legal tech",
    "AI in HR: Bias mitigation and talent acquisition optimization",
    "The future of low-code/no-code AI development platforms",
    "Voice AI and Conversational Interfaces in industrial IoT"
];


async function searchAIUpdates() {
    // Pick a random sub-topic to ensure variety
    const randomTopic = AI_BUSINESS_TOPICS[Math.floor(Math.random() * AI_BUSINESS_TOPICS.length)];

    console.log(`Searching for: "${randomTopic}"...`);

    try {
        const response = await axios.post('https://api.tavily.com/search', {
            query: `What are the latest updates and strategic insights regarding ${randomTopic}?`,
            search_depth: "advanced",
            max_results: 1,
            start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
            include_raw_content: "text",
            chunks_per_source: 2
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.TAVILY_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const rawContent = response.data.results?.[0]?.raw_content;

        if (!rawContent) {
            console.warn(`No raw content found for topic: ${randomTopic}`);
            return null;
        }

        return rawContent;
    } catch (error) {
        console.error('Error fetching from Tavily:', error.response?.data || error.message);
        throw error;
    }
}

module.exports = { searchAIUpdates };

