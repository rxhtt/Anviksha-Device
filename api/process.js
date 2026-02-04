import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  // 1. Securely access the key from Vercel Environment Variables
  const apiKey = process.env.API_KEY; 

  if (!apiKey) {
    return res.status(500).json({ error: "Server API Key configuration missing" });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, imageBase64, mimeType, model, config } = req.body;
    const client = new GoogleGenAI({ apiKey });

    // Prepare parts for Gemini
    const parts = [];
    if (imageBase64) {
      parts.push({
        inlineData: {
          data: imageBase64,
          mimeType: mimeType || "image/jpeg"
        }
      });
    }
    if (prompt) {
      parts.push({ text: prompt });
    }

    // Call Gemini API securely from the server
    const response = await client.models.generateContent({
      model: model || 'gemini-2.5-flash',
      contents: { parts },
      config: config || {}
    });

    // Return the text result to your frontend
    return res.status(200).json({ text: response.text });

  } catch (error) {
    console.error("Vercel Function Error:", error);
    return res.status(500).json({ error: error.message });
  }
}