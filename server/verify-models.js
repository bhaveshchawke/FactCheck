require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const listModels = async () => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Note: listModels might not be directly available on the client instance in some versions, 
        // but let's try the standard way via the model manager if possible or just use a known model to check.
        // Actually, v1beta API has listModels.
        // Let's use a lower level fetch/axios if the SDK doesn't expose it easily, 
        // OR just try to create a model and see what happens.
        // Wait, the SDK has a ModelManager. 

        // Direct REST call to list models is safer to debug access issues.
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("No API KEY found");
            return;
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${await response.text()}`);
        }
        const data = await response.json();
        console.log("Available Models:");
        data.models.forEach(m => {
            if (m.supportedGenerationMethods.includes("generateContent")) {
                console.log(`- ${m.name} (${m.displayName})`);
            }
        });

    } catch (error) {
        console.error("Error listing models:", error);
    }
};

listModels();
