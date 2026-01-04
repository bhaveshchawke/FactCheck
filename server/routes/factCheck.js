const express = require('express');
const router = express.Router();
const axios = require('axios');
const News = require('../models/News');
const { analyzeHeuristics, extractKeywords } = require('../utils/analyzer');
const { searchGoogle } = require('../services/googleSearch');
const auth = require('../middleware/auth');

// @route   POST api/fact-check/analyze
// @desc    Analyze news content
// @access  Public (or Private)
// @route   POST api/fact-check/analyze
// @desc    Analyze news content
// @access  Public (or Private)
router.post('/analyze', async (req, res) => {
    console.log('Analyze Request Received:', req.body);
    let { content, type } = req.body;

    if (!content) {
        console.error('Content missing');
        return res.status(400).json({ msg: 'Content is required' });
    }

    try {
        // 0. Scrape Content if URL (NEW)
        if (type === 'url' || content.startsWith('http')) {
            const { scrapeMetadata } = require('../services/scraper');
            const scrapedText = await scrapeMetadata(content);

            if (scrapedText) {
                console.log(`URL Detected. Scraped content: "${scrapedText}"`);
                // Prefix content so AI knows it came from a link
                content = `[Analyzed Link Content]: ${scrapedText}`;
            } else {
                console.log("URL scraping failed or returned empty. Using raw URL.");
            }
        }

        // 1. Initial Heuristic Analysis
        const heuristicResult = analyzeHeuristics(content, type);
        let finalScore = heuristicResult.score;
        const analysisBreakdown = {
            keywordScore: heuristicResult.score,
            domainScore: 0,
            apiScore: 0,
            communityScore: 0,
            aiScore: 0 // New field
        };
        let matchedClaims = [];
        let aiAnalysis = null;
        let searchResults = [];

        // 1.5. Google Search moved to after optimizer import


        // 2. Google Fact Check API
        const apiKey = process.env.GOOGLE_FACT_CHECK_API_KEY;
        if (apiKey && apiKey !== 'your_api_key_here') {
            try {
                console.log(`Querying Google API with: "${content}"`);
                const response = await axios.get(`https://factchecktools.googleapis.com/v1alpha1/claims:search`, {
                    params: {
                        query: content,
                        key: apiKey
                    }
                });

                console.log(`Google API Response Status: ${response.status}`);

                if (response.data.claims && response.data.claims.length > 0) {
                    matchedClaims = response.data.claims;
                } else {
                    // Retry logic (Simplified for brevity, can keep full logic if needed, but let's rely on AI as fallback too)
                    const keywords = extractKeywords(content);
                    if (keywords && keywords.length > 5) {
                        const retryResponse = await axios.get(`https://factchecktools.googleapis.com/v1alpha1/claims:search`, {
                            params: { query: keywords, key: apiKey }
                        });
                        if (retryResponse.data.claims) matchedClaims = retryResponse.data.claims;
                    }
                }

                if (matchedClaims.length > 0) {
                    // Filter and scoring logic
                    const filteredClaims = matchedClaims.slice(0, 3);
                    matchedClaims = filteredClaims;

                    const firstClaim = matchedClaims[0];
                    const rating = firstClaim.claimReview[0].textualRating.toLowerCase();

                    if (rating.includes('false') || rating.includes('fake')) {
                        finalScore = Math.max(0, finalScore - 40);
                        analysisBreakdown.apiScore = -40;
                    } else if (rating.includes('true') || rating.includes('correct')) {
                        finalScore = Math.min(100, finalScore + 30);
                        analysisBreakdown.apiScore = 30;
                    }
                }
            } catch (apiError) {
                console.error('Google API Error:', apiError.message);
            }
        }

        // 3. AI Deep Logic Analysis (NEW)
        const { analyzeWithGemini, optimizeSearchQuery } = require('../services/aiAnalyzer');

        // 1.5. Perform Google Search (New Source Citations)
        try {
            let searchContext = content;

            // Only optimize if content is NOT just a raw URL (meaning scraping succeeded or it was text input)
            // If scraping failed, 'content' is still the raw URL. Generating a query from a raw URL usually fails/hallucinates.
            const isRawUrl = (type === 'url' || content.startsWith('http')) && !content.includes('[Analyzed Link Content]');

            if (!isRawUrl) {
                console.log("Optimizing search query...");
                const optimizedQuery = await optimizeSearchQuery(content);
                console.log(`Original: "${content}" -> Optimized: "${optimizedQuery}"`);
                searchContext = optimizedQuery;
            } else {
                console.log("Skipping optimization for raw URL.");
            }

            console.log("Fetching Source Citations...");
            searchResults = await searchGoogle(searchContext);
            console.log(`Found ${searchResults.length} sources.`);
        } catch (searchErr) {
            console.error("Search Service Error:", searchErr);
        }

        console.log("Starting AI Analysis...");
        const aiResult = await analyzeWithGemini(content, searchResults);

        if (aiResult) {
            console.log("AI Analysis Complete:", aiResult);
            aiAnalysis = aiResult;

            // Adjust score based on AI trust score
            // If AI is very confident (high or low), we weigh it heavily
            if (aiResult.trustScore < 40) {
                finalScore = Math.max(0, finalScore - 30);
                analysisBreakdown.aiScore = -30;
            } else if (aiResult.trustScore > 80) {
                finalScore = Math.min(100, finalScore + 20);
                analysisBreakdown.aiScore = 20;
            }
        } else {
            console.log("AI Analysis returned null.");
        }

        // 4. Determine Category
        let category = 'Doubtful';
        if (finalScore >= 70) category = 'Real';
        else if (finalScore < 40) category = 'Fake';

        // 5. Save and Return
        let newsItem = new News({
            content,
            type,
            analysisResult: {
                score: finalScore,
                category,
                breakdown: analysisBreakdown,
                matchedClaims,
                heuristicReasons: heuristicResult.reasons,
                aiAnalysis,
                searchResults // Save sources
            },
            status: 'pending'
        });

        await newsItem.save();
        res.json(newsItem);

    } catch (err) {
        console.error('Analysis Error:', err);
        res.status(500).send('Server error: ' + err.message);
    }
});

// @route   POST api/fact-check/submit
// @desc    Submit news to database
// @access  Public (should be Private)
// @route   POST api/fact-check/submit
// @desc    Submit news to database
// @access  Private
router.post('/submit', auth, async (req, res) => {
    // Save logic
    const { content, type, analysisResult, user } = req.body;
    try {
        const newNews = new News({
            user, // ID if logged in
            content,
            type,
            analysisResult
        });
        await newNews.save();
        res.json(newNews);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   Get api/fact-check/all (for feed)
router.get('/all', async (req, res) => {
    try {
        const news = await News.find().sort({ createdAt: -1 });
        res.json(news);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// @route   PUT api/fact-check/:id
// @desc    Update news status (Admin)
router.put('/:id', auth, async (req, res) => {
    try {
        const { status } = req.body;
        let news = await News.findById(req.params.id);
        if (!news) return res.status(404).json({ msg: 'News not found' });

        news.status = status;
        await news.save();
        res.json(news);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST api/fact-check/:id/vote
// @desc    Vote on news accuracy
router.post('/:id/vote', auth, async (req, res) => {
    console.log(`Vote Request for ID: ${req.params.id}`, req.body);
    try {
        const { type } = req.body; // 'up' or 'down'
        const news = await News.findById(req.params.id);
        if (!news) return res.status(404).json({ msg: 'News not found' });

        if (type === 'up') news.votes.up += 1;
        if (type === 'down') news.votes.down += 1;

        // Dynamic Community Score Calculation
        const totalVotes = news.votes.up + news.votes.down;
        if (totalVotes > 0) {
            // Calculate percentage of upvotes
            const score = (news.votes.up / totalVotes) * 100;
            news.analysisResult.communityScore = Math.round(score);
        }

        await news.save();
        res.json(news);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
