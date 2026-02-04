import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Only POST allowed' });

    const apiKey = req.headers['x-manual-gemini-key'];

    if (!apiKey || apiKey.trim() === "") {
        return res.status(401).json({ error: "Consulting Key Missing. Please set your Gemini API Key in Settings." });
    }

    const { prompt, persona, model } = req.body;

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const modelInstance = genAI.getGenerativeModel({
            model: model || 'gemini-2.0-flash',
            systemInstruction: persona || "You are a professional medical consultant."
        });

        const result = await modelInstance.generateContent(prompt);
        const text = result.response.text();

        return res.status(200).json({ text });
    } catch (error) {
        console.error("Consulting API Error:", error.message);
        return res.status(500).json({
            error: "Failed to process consultation",
            details: error.message
        });
    }
}
