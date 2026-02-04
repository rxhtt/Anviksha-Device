import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API_KEY missing in Environment variables." });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, imageBase64, mimeType, config } = req.body;
    const genAI = new GoogleGenerativeAI(apiKey);

    // Use gemini-2.0-flash (Cutting-edge clinical reasoning)
    const modelInstance = genAI.getGenerativeModel({
      model: "gemini-2.0-flash"
    });

    const systemInstruction = config?.systemInstruction || "";

    const parts = [];
    if (systemInstruction) {
      parts.push({ text: `INSTRUCTION: ${systemInstruction}` });
    }
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
      generationConfig: {
        temperature: 0.1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      }
    });

    let text = result.response.text();

    // Enhanced JSON extraction
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
