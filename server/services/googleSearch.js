const axios = require('axios');

const searchGoogle = async (query) => {
    try {
        const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
        const cx = process.env.GOOGLE_SEARCH_ENGINE_ID;

        if (!apiKey || !cx) {
            console.warn("Google Search API Key or CX ID missing.");
            return [];
        }

        const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`;

        const response = await axios.get(url);
        const items = response.data.items || [];

        // Return top 3 results
        return items.slice(0, 3).map(item => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
            source: item.displayLink
        }));
    } catch (error) {
        console.error("Google Search Error:", error.message);
        return []; // Return empty array on error so flow doesn't break
    }
};

module.exports = { searchGoogle };
