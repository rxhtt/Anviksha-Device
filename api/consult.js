import { GoogleGenerativeAI } from "@google/generative-ai";

// HIGH-AVAILABILITY ROTATION POOL
const GEMINI_POOL = [
    "AIzaSyAWJD3qqQ1c9aNFBdHHrW1oustB_Cpe84c",
    "AIzaSyBxTas_M5K9pUc2MH0nZJzaYMLdlaHfGdE",
    "AIzaSyAuI3EM_J2h9FWhVy6fKxdffSrZV5QfulY",
    "AIzaSyA8pv75KBG6auxNGZEIORR9FCwEN948REc",
    "AIzaSyDTJ-4pkUiAI0IxRi0yfSXvFIdS_fEvFg8",
    "AIzaSyCVaSFmgrTOxxKbIwgXd5vz_a8xGr1fvvw",
    "AIzaSyBR0Zd2RUFUrtjuWYRAqHAle54lfbewPrA"
];

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Only POST allowed' });

    const { prompt, persona, model } = req.body;

    // Shuffle keys so users don't all hit the same 'first' key
    const shuffled = [...GEMINI_POOL].sort(() => Math.random() - 0.5);

    // Attempt up to 3 rotations before failing
    for (let i = 0; i < Math.min(shuffled.length, 3); i++) {
        try {
            const genAI = new GoogleGenerativeAI(shuffled[i]);
            const modelInstance = genAI.getGenerativeModel({
                model: model || 'gemini-2.0-flash',
                systemInstruction: persona || "You are a professional medical consultant."
            });

            const result = await modelInstance.generateContent(prompt);
            const text = result.response.text();

            return res.status(200).json({ text });
        } catch (error) {
            console.error(`Attempt ${i + 1} failed with key ${shuffled[i].slice(0, 8)}...:`, error.message);

            const isRateLimit = error.message?.includes("429") || error.message?.toLowerCase().includes("quota");

            if (isRateLimit && i < 2) {
                console.log("Rotating to next key due to rate limit...");
                continue;
            }

            return res.status(500).json({
                error: "Neural Link Capacity Exceeded. Please try again in a moment.",
                details: error.message
            });
        }
    }
}
