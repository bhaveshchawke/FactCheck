const axios = require('axios');

const SUSPICIOUS_KEYWORDS = [
    'shocking', 'miracle', 'secret', 'banned', 'unbelievable',
    '100%', 'guaranteed', 'free', 'winner', 'risk-free',
    'urgent', 'act now', 'limited time', 'exposed', 'conspiracy'
];

const POSITIVE_KEYWORDS = [
    'official', 'report', 'study', 'research', 'according to',
    'statement', 'announced', 'confirmed', 'evidence', 'sources',
    'data', 'analysis', 'expert', 'government', 'police'
];

const TRUSTED_DOMAINS = [
    // Fact Checking Organizations
    'altnews.in', 'boomlive.in', 'snopes.com', 'politifact.com', 'factcheck.org', 'vishvasnews.com', 'thequint.com',
    'newsmobile.in', 'indiatoday.in/fact-check', 'thip.media', 'logicalindian.com',

    // Major Indian News
    'thehindu.com', 'indianexpress.com', 'hindustantimes.com', 'timesofindia.indiatimes.com', 'ndtv.com',
    'livemint.com', 'economictimes.indiatimes.com', 'business-standard.com', 'newsonair.gov.in', 'pib.gov.in',
    'ddnews.gov.in', 'ptinews.com', 'aniin.com', 'wionews.com', 'outlookindia.com', 'theweek.in',
    'dainikbhaskar.com', 'jagran.com', 'amarujala.com', 'patrika.com', 'navbharattimes.indiatimes.com',

    // Major International News
    'bbc.com', 'reuters.com', 'apnews.com', 'afp.com', 'nytimes.com', 'washingtonpost.com', 'wsj.com',
    'cnn.com', 'bloomberg.com', 'forbes.com', 'theguardian.com', 'aljazeera.com', 'dw.com', 'france24.com',
    'nhk.or.jp', 'scmp.com', 'straitstimes.com', 'abc.net.au', 'cbc.ca', 'npr.org', 'pbs.org', 'usatoday.com',
    'time.com', 'newsweek.com', 'cnbc.com', 'financialtown.com', 'investopedia.com',

    // Official/Government
    'who.int', 'un.org', 'gov.in', 'nic.in', 'rbi.org.in', 'isro.gov.in', 'nasa.gov', 'cdc.gov'
];
const SUSPICIOUS_DOMAINS = ['fakenews.com', 'conspiracy.net', 'clickbait.org', 'boredpanda.com'];

const analyzeHeuristics = (text, type = 'text') => {
    let score = 50; // Neutral start
    let reasons = [];

    const lowerText = text.toLowerCase();

    // 1. Keyword Analysis (Negative)
    let negativeCount = 0;
    SUSPICIOUS_KEYWORDS.forEach(word => {
        if (lowerText.includes(word.toLowerCase())) {
            negativeCount++;
        }
    });

    if (negativeCount > 0) {
        score -= (negativeCount * 15); // Increased penalty
        reasons.push(`Detected ${negativeCount} suspicious keywords.`);
    }

    // 2. Keyword Analysis (Positive)
    let positiveCount = 0;
    POSITIVE_KEYWORDS.forEach(word => {
        if (lowerText.includes(word.toLowerCase())) {
            positiveCount++;
        }
    });

    if (positiveCount > 0) {
        score += (positiveCount * 10);
        reasons.push(`Detected ${positiveCount} credible keywords.`);
    }

    // Adjust for no keywords found (Default behavior)
    if (negativeCount === 0 && positiveCount === 0) {
        if (text.length < 20) {
            score -= 5;
            reasons.push('Text too short to verify reliable sources.');
        } else {
            score += 5; // Slight trust for normal length text
        }
    }

    // 3. Domain Analysis (if URL)
    if (text.startsWith('http') || type === 'url') {
        try {
            const urlObj = new URL(text);
            const domain = urlObj.hostname.replace('www.', '');

            if (TRUSTED_DOMAINS.some(d => domain.includes(d))) {
                score += 40;
                reasons.push(`Trusted domain detected: ${domain}`);
            } else if (SUSPICIOUS_DOMAINS.some(d => domain.includes(d))) {
                score -= 40;
                reasons.push(`Suspicious domain detected: ${domain}`);
            } else {
                reasons.push(`Domain ${domain} not in verified list.`);
            }
        } catch (e) {
            reasons.push("Invalid URL format.");
        }
    }

    // 4. Formatting Analysis (ALL CAPS)
    const upperCaseCount = text.replace(/[^A-Z]/g, "").length;
    const totalChars = text.length;
    if (totalChars > 10 && (upperCaseCount / totalChars) > 0.5) {
        score -= 20;
        reasons.push('Excessive use of capital letters.');
    }

    // Clamp score
    return {
        score: Math.max(0, Math.min(100, score)),
        reasons
    };
};

const extractKeywords = (text) => {
    // Basic Stop Words (English + Hindi)
    const stopWords = [
        'is', 'the', 'a', 'an', 'in', 'on', 'of', 'for', 'to', 'and', 'or', 'but', 'with', 'by', 'from', 'at',
        'se', 'ka', 'ki', 'ke', 'ko', 'par', 'mein', 'hai', 'hain', 'aur', 'kya', 'kyun', 'kise', 'fake', 'news', 'check',
        'PM', 'CM', 'sir', 'payment', 'karne', 'wala', 'wali', 'dena', 'pe', 'ho', 'gaya', 'raha'
    ];

    // Remove special chars and split
    const words = text.replace(/[^\w\s\u0900-\u097F]/gi, '').split(/\s+/);

    // Filter out stop words and short words
    const keywords = words.filter(w =>
        w.length > 2 && !stopWords.includes(w.toLowerCase())
    );

    // Return top 5 keywords joined
    return keywords.slice(0, 6).join(' ');
};

module.exports = { analyzeHeuristics, extractKeywords };
