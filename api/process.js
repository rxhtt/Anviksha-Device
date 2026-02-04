import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API_KEY missing in Environment variables. Please set it in Vercel settings." });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, imageBase64, mimeType, config } = req.body;
    const genAI = new GoogleGenerativeAI(apiKey);
    const systemInstruction = config?.systemInstruction || "";

    // Prepare the parts for the prompt
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

    // MULTI-MODEL BACKEND RESILIENCE: Lead with 3.0, fallback to stable models
    const modelsToTry = ["gemini-3-flash", "gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];
    let text = "";
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Backend attempting: ${modelName}`);
        const modelInstance = genAI.getGenerativeModel({ model: modelName });

        const result = await modelInstance.generateContent({
          contents: [{ role: 'user', parts }],
          generationConfig: {
            temperature: 0.1,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 2048,
          }
        });

        text = result.response.text();
        if (text) {
          console.log(`Backend succeeded with: ${modelName}`);
          break;
        }
      } catch (err) {
        lastError = err;
        const isRetryable = err.message.includes("429") || err.message.includes("404") || err.message.includes("quota");
        if (isRetryable) {
          console.warn(`Backend Switcher: ${modelName} hit limit or not found, trying next...`);
          continue;
        }
        throw err; // Non-retryable error (auth, etc)
      }
    }

    if (!text) {
      throw lastError || new Error("All clinical models failed to respond. Check if your API key has any remaining quota.");
    }

    // Enhanced JSON extraction for consistent results
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
    console.error("Gemini Backend Error:", error);
    return res.status(500).json({ error: error.message || "Internal Diagnostic Error" });
  }
}
