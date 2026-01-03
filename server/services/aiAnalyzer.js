const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
      3. "trustScore": A score from 0 to 100 based on the credibility of the writing style and claims (independent of external search).
      4. "summary": A brief one-sentence verification summary.

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

module.exports = { analyzeWithGemini };
