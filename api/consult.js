import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST allowed' });
    }

    const { prompt, context, persona, model } = req.body;
    const apiKey = process.env.CONSULT_GEMINI_API_KEY || process.env.API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "Consulting API Key missing" });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const modelInstance = genAI.getGenerativeModel({
            model: model || 'gemini-2.0-flash',
            systemInstruction: persona || "You are a professional medical consultant."
        });

        const result = await modelInstance.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return res.status(200).json({ text });
    } catch (error) {
        console.error("Consulting API Error:", error);
        return res.status(500).json({ error: 'Failed to process consultation' });
    }
}
