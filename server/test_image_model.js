require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1x1 Transparent PNG buffer
const dummyImage = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==", "base64");

async function testModel(modelName) {
    console.log(`Testing model: ${modelName}...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([
            "What is in this image?",
            {
                inlineData: {
                    data: dummyImage.toString('base64'),
                    mimeType: "image/png"
                }
            }
        ]);
        await result.response;
        console.log(`✅ SUCCESS: ${modelName} works!`);
        return true;
    } catch (error) {
        console.log(`❌ FAILURE: ${modelName} - ${error.message.split(' ').slice(0, 10).join(' ')}...`);
        return false;
    }
}

async function runTests() {
    const modelsToTry = [
        "gemini-3-flash-preview",
        "gemini-2.0-flash",
        "gemini-flash-latest"
    ];

    for (const m of modelsToTry) {
        const works = await testModel(m);
        if (works) {
            console.log(`\n🎉 Win! We will use: ${m}`);
            break;
        }
    }
}

runTests();
