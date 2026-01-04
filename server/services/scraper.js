const axios = require('axios');
const cheerio = require('cheerio');

const scrapeMetadata = async (url) => {
    try {
        console.log(`Scraping metadata for: ${url}`);

        // Custom User Agent to avoid immediate blocking
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        };

        const response = await axios.get(url, { headers, timeout: 5000 });
        const html = response.data;
        const $ = cheerio.load(html);

        // Try to find description in standard meta tags
        let description =
            $('meta[property="og:description"]').attr('content') ||
            $('meta[name="description"]').attr('content') ||
            $('meta[name="twitter:description"]').attr('content');

        const title =
            $('meta[property="og:title"]').attr('content') ||
            $('title').text();

        // Fallback for specific sites if generic meta fails
        if (!description && url.includes('instagram.com')) {
            // Instagram often puts json data in a script tag, but simple meta usually exists for public ones
            // If not, we might need a workaround or return title
        }

        if (!description) {
            console.log("No description meta found, falling back to title.");
            return title || null;
        }

        console.log(`Scraped Content: ${description.substring(0, 100)}...`);
        return description;

    } catch (error) {
        console.error("Scraping failed:", error.message);
        return null;
    }
};

module.exports = { scrapeMetadata };
