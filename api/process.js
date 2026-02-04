import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Server API Key configuration missing" });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, imageBase64, mimeType, model, config } = req.body;
    const genAI = new GoogleGenerativeAI(apiKey);

    // Extract system instruction from config if provided
    const systemInstruction = config?.systemInstruction;

    // Clean up generation config
    const generationConfig = { ...config };
    delete generationConfig.systemInstruction;

    const modelInstance = genAI.getGenerativeModel({
      model: model || 'gemini-3-flash',
      systemInstruction: systemInstruction,
      generationConfig: generationConfig
    });

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

    const result = await modelInstance.generateContent({
      contents: [{ role: 'user', parts }]
    });

    const text = result.response.text();
    return res.status(200).json({ text });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}