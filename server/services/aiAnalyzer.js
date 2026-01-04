
const axios = require('axios');

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const FALLBACK_MODELS = [
    "gemini-2.0-flash",
    "gemini-2.5-flash",
    "gemini-2.0-flash-001",
    "gemini-flash-latest"
];

const generateWithFallback = async (prompt, parts = []) => {
    let lastError = null;
    for (const modelName of FALLBACK_MODELS) {
        try {
            console.log(`Trying model: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(parts.length > 0 ? parts : prompt);

            if (!result || !result.response) {
                throw new Error("Empty response from model");
            }

            return result.response.text();
        } catch (error) {
            console.warn(`Model ${modelName} failed:`, error.message);
            lastError = error;
            // Continue to next model
        }
    }
    throw lastError || new Error("All models failed");
};

const optimizeSearchQuery = async (originalQuery) => {
    try {
        const prompt = `
        You are a Search Engine Optimization expert for a Fact Checking system.
        Convert the following user input (which might be in Hindi, Hinglish, or any other language) into the single best ENGLISH Google Search query to verify the claim.
        
        Rules:
        1. Keep it concise (5-15 words).
        2. Identify the core CLAIM or EVENT.
        3. Add keywords like "fact check", "fake news", "verification", "hoax", "official report".
        4. Remove conversational filler ("kya ye sach hai", "is this true").
        5. Return ONLY the search query string, no quotes.

        User Input: "${originalQuery}"
        `;
        const text = await generateWithFallback(prompt);
        return text.trim();
    } catch (error) {
        console.error("Query Optimization Error:", error.message);
        return originalQuery; // Fallback to original
    }
};

const analyzeWithGemini = async (content, searchResults = []) => {
    try {
        let searchContext = "";
        if (searchResults && searchResults.length > 0) {
            searchContext = `
            \nHere are some relevant search results to assist your verification:
            ${searchResults.map((r, i) => `${i + 1}. Source: ${r.source}\n   Title: ${r.title}\n   Snippet: ${r.snippet}`).join('\n')}
            \nUse these results to cross-reference the claim.
            `;
        } else {
            searchContext = "\nNo specific search results found. Rely on your internal knowledge base and look for logical inconsistencies or typical patterns of misinformation.";
        }

        const prompt = `
      You are an expert fact-checker and media literacy analyst. 
      Current Date: ${new Date().toLocaleDateString()}
      ${searchContext}
      
      Analyze the following news content:
      "${content}"

      Step 1: Analyze the claim. Is it sensationalist? Does it lack sources? Is it a known hoax format?
      Step 2: Compare with Search Results. Do reputable sources confirm it? Do they debunk it?
      Step 3: Determine the verdict.

      Provide a JSON response with the following fields:
      1. "reasoning": A 2-3 sentence explanation of your THOUGHT PROCESS. Why did you choose the score? (e.g., "The claim matches a known viral hoax... Search results from reputable sources like BoomLive debunk this...")
      2. "fallacies": A list of logical fallacies or manipulative tactics used (e.g., Ad Hominem, Straw Man, Fear Mongering, False Context).
      3. "bias": Determine the political or emotional bias (e.g., Left-leaning, Right-leaning, Neutral, Sensationalist).
      4. "trustScore": A score from 0 (Fake) to 100 (Verified).
         - 0-20: Definitely Fake / Hoax
         - 21-50: Misleading / Unverified / Missing Context
         - 51-80: Mostly True but with some inaccuracies
         - 81-100: Verified / True
      5. "summary": A brief one-sentence final verification summary.

      IMPORTANT:
      - Be SKEPTICAL. If a sensational claim has no verifying search results, the Trust Score should be LOW (< 40).
      - "Viral" does not mean true.
      - Pay attention to the Current Date. Old videos reposted as new are "False Context".

      Format the output strictly as valid JSON.
    `;

        const text = await generateWithFallback(prompt);

        // Clean up markdown code blocks if present to parse JSON
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();

        return JSON.parse(cleanText);
    } catch (error) {
        console.error("Gemini Analysis Error:", error.message);
        return {
            reasoning: "Analysis failed due to a technical error (" + error.message + ").",
            fallacies: [],
            bias: "Unknown",
            trustScore: 0,
            summary: "Unable to verify at this time."
        };
    }
};

const analyzeImage = async (imageBuffer, mimeType = 'image/jpeg') => {
    try {
        console.log(`[DEBUG] analyzeImage called. Buffer size: ${imageBuffer.length}, Mime: ${mimeType}`);

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

        console.log("[DEBUG] Sending request to Gemini...");

        const text = await generateWithFallback(null, [
            prompt,
            {
                inlineData: {
                    data: imageBuffer.toString('base64'),
                    mimeType: mimeType
                }
            }
        ]);

        console.log("[DEBUG] Gemini response received");
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanText);

    } catch (error) {
        console.error("Image Analysis Error:", error.message);
        return null;
    }
};

module.exports = { analyzeWithGemini, optimizeSearchQuery, analyzeImage };
