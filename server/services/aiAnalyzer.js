
const axios = require('axios');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const optimizeSearchQuery = async (originalQuery) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        const prompt = `
        You are a Search Engine Optimization expert.
        Convert the following user input (which might be in Hindi, Hinglish, or any other language) into the single best ENGLISH Google Search query to find factual news reports about the event.
        
        Rules:
        1. Keep it concise (5-10 words).
        2. Focus on keywords (entities, actions, dates).
        3. Remove conversational filler ("is this true", "report says").
        4. Return ONLY the search query string, no quotes.

        User Input: "${originalQuery}"
        `;
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error("Query Optimization Error:", error);
        return originalQuery; // Fallback to original
    }
};

const analyzeWithGemini = async (content, searchResults = []) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        let searchContext = "";
        if (searchResults && searchResults.length > 0) {
            searchContext = `
            \nHere are some relevant search results to assist your verification:
            ${searchResults.map((r, i) => `${i + 1}. Source: ${r.source}\n   Title: ${r.title}\n   Snippet: ${r.snippet}`).join('\n')}
            \nUse these results to cross-reference the claim.
            `;
        }

        const prompt = `
      You are an expert fact-checker and media literacy analyst. 
      Current Date: ${new Date().toLocaleDateString()}
      ${searchContext}
      
      Analyze the following news content:
      "${content}"

      Provide a JSON response with the following fields:
      1. "fallacies": A list of logical fallacies or manipulative tactics used (e.g., Ad Hominem, Straw Man, Fear Mongering). If none, return an empty list.
      2. "bias": Determine the political or emotional bias (e.g., Left-leaning, Right-leaning, Neutral, Sensationalist).
      3. "trustScore": A score from 0 (Fake) to 100 (Verified) based on the claims and the provided search results.
      4. "summary": A brief one-sentence verification summary. Use the provided search results as the primary source of truth for recent events.

      IMPORTANT:
      - If the Search Results confirm the claim, trustScore should be high (80-100).
      - If Search Results debunk it, trustScore should be low.
      - Pay attention to the Current Date. Events in the future relative to typical training data might be real if confirmed by Search Results (Breaking News).

      Format the output strictly as valid JSON.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present to parse JSON
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(cleanText);
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return null; // Fail gracefully
    }
};

const analyzeImage = async (imageUrl) => {
    try {
        // 1. Fetch Image as Buffer
        const imageResp = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(imageResp.data, 'binary').toString('base64');

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        You are an expert Forensic Image Analyst.
        Analyze this image for signs of AI generation or deepfake manipulation.
        Look for:
        - Asymmetrical features (eyes, teeth, hands)
        - Unnatural textures (smooth plastic skin, blurred backgrounds)
        - Glitched text or nonsense patterns
        - Lighting inconsistencies

        Respond with valid JSON:
        {
            "isAiGenerated": boolean,
            "confidence": number (0-100),
            "summary": "Short explanation of your findings",
            "fallacies": ["List visual anomalies found", "e.g. Extra fingers"],
            "trustScore": number (0 = Definitely Fake, 100 = Real Photo)
        }
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: imageBuffer,
                    mimeType: imageResp.headers['content-type'] || 'image/jpeg'
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanText);

    } catch (error) {
        console.error("Image Analysis Error:", error.message);
        return null;
    }
};

module.exports = { analyzeWithGemini, optimizeSearchQuery, analyzeImage };
