const { GoogleGenerativeAI } = require("@google/generative-ai");

const keys = [
    { name: "GEMINI_API_KEY_PRO_1", key: "AIzaSyA6U7X1YlFlY52zYwSyXhBWJMhgsBNnHqA" },
    { name: "GEMINI_API_KEY_PRO_2", key: "AIzaSyBptLrGSF2MT-IYLXpFD9QqrLUVCZPFic0" },
    { name: "GEMINI_API_KEY_PRO_3", key: "AIzaSyBIgh-9o1Fg1VXz2BrOEk3UFOU0Vpzt4Ug" },
    { name: "GEMINI_API_KEY_FLASH", key: "AIzaSyCc7YkS2waYRV1aUk3yVjNQdtKMVPu0PUY" },
    { name: "GEMINI_API_KEY_1", key: "AIzaSyAkja0H8ux3g2iw8jd-HJGEZxMMs04jIYk" },
    { name: "NUCLEAR_KEY_1", key: "AIzaSyDzXOdxOJ_FLQGVMXHzfRiXrnBJeog0MLo" }
];

async function testKey(name, key) {
    const models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-pro"];
    let lastError = "";
    for (const modelName of models) {
        try {
            const genAI = new GoogleGenerativeAI(key);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("OK");
            console.log(`✅ ${name}: WORKING (via ${modelName})`);
            return { success: true, model: modelName };
        } catch (error) {
            lastError = error.message;
            if (lastError.includes("429") || lastError.includes("quota")) {
                console.log(`⚠️ ${name}: QUOTA EXCEEDED (Key is valid)`);
                return { success: true, quota: true };
            }
            if (lastError.includes("401") || lastError.includes("key is invalid")) {
                console.log(`❌ ${name}: INVALID KEY`);
                return { success: false, error: "AUTH" };
            }
            // If it's a 404, try the next model
        }
    }
    console.log(`❌ ${name}: FAILED - ${lastError}`);
    return { success: false, error: lastError };
}

async function runTests() {
    console.log("Starting Key Capacity Test...");
    const results = [];
    for (const k of keys) {
        const success = await testKey(k.name, k.key);
        results.push({ ...k, success });
    }
    console.log("\n--- FINAL REPORT ---");
    console.log(JSON.stringify(results, null, 2));
}

runTests();
