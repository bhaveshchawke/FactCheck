require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Dummy init
        // Actually we need to use the model manager if available or just try a standard one
        // The API specific way to list models:
        // There isn't a direct listModels method on the simple client usually, but let's try a standard request 
        // OR rely on the error message which says "Call ListModels"

        // Actually, let's just try to hit the API with a known working model for text and see if it works for vision
        console.log("Testing gemini-1.5-flash...");
        try {
            const m = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const r = await m.generateContent("Hello");
            console.log("gemini-1.5-flash Works for text!");
        } catch (e) { console.log("gemini-1.5-flash Failed:", e.message); }

        console.log("Testing gemini-pro-vision...");
        try {
            const m = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
            // vision model needs image usually
            console.log("gemini-pro-vision instantiated (might need image to test)");
        } catch (e) { console.log("gemini-pro-vision Failed:", e.message); }

        console.log("Testing gemini-2.0-flash-exp...");
        try {
            const m = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
            const r = await m.generateContent("Hello");
            console.log("gemini-2.0-flash-exp Works!");
        } catch (e) { console.log("gemini-2.0-flash-exp Failed:", e.message); }

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
