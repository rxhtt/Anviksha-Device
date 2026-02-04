import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Server API Key configuration missing. Set GEMINI_API_KEY in Vercel." });
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
      model: model || 'gemini-1.5-pro',
      systemInstruction: systemInstruction,
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      ]
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
      contents: [{ role: 'user', parts }],
      generationConfig: generationConfig
    });

    let text = result.response.text();

    // Enhanced JSON extraction logic
    if (text.includes("```json")) {
      text = text.split("```json")[1].split("```")[0].trim();
    } else if (text.includes("```")) {
      const matches = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (matches) text = matches[1].trim();
    } else {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) text = jsonMatch[0];
    }

    return res.status(200).json({ text });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}