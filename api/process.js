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
    const systemInstruction = config?.systemInstruction || "";

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

    // HYPER-RESILIENT BACKEND SWITCHER
    // Prioritizing the newest model (3.0) for the presentation, 
    // but cascading to the most stable high-quota version (1.5) immediately if needed.
    const modelsToTry = [
      "gemini-3-flash",
      "gemini-1.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash-8b",
      "gemini-1.5-pro"
    ];

    let text = "";
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        const modelInstance = genAI.getGenerativeModel({ model: modelName });

        const result = await modelInstance.generateContent({
          contents: [{
            role: 'user',
            parts: [
              { text: `SYSTEM_INSTRUCTION: ${systemInstruction}` },
              ...parts
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 2048,
          }
        });

        text = result.response.text();
        if (text) {
          console.log(`[BACKEND] Success: ${modelName}`);
          break;
        }
      } catch (err) {
        lastError = err;
        const errStr = err.message?.toLowerCase() || "";
        const isRetryable = errStr.includes("429") || errStr.includes("quota") || errStr.includes("404") || errStr.includes("not found");

        if (isRetryable) {
          console.warn(`[BACKEND] Switching from ${modelName} due to: ${errStr.substring(0, 50)}...`);
          continue;
        }
        throw err;
      }
    }

    if (!text) {
      throw lastError || new Error("All clinical models failed to respond. Check if your API key has any remaining quota.");
    }

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
