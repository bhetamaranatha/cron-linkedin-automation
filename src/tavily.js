const axios = require('axios');
require('dotenv').config();

async function searchAIUpdates() {
    console.log('Searching for latest AI in business updates...');
    try {
        const response = await axios.post('https://api.tavily.com/search', {
            query: "What are the latest update of AI in Business",
            search_depth: "advanced",
            max_results: 1,
            start_date: "2026-02-01",
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
            console.warn('No raw content found in Tavily results.');
            return null;
        }

        return rawContent;
    } catch (error) {
        console.error('Error fetching from Tavily:', error.response?.data || error.message);
        throw error;
    }
}

module.exports = { searchAIUpdates };
