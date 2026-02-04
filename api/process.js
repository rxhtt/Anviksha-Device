import { GoogleGenerativeAI } from "@google/generative-ai";

const KEY_POOL = [
  "AIzaSyDzXOdxOJ_FLQGVMXHzfRiXrnBJeog0MLo", // NUCLEAR_KEY_1
  "AIzaSyA6U7X1YlFlY52zYwSyXhBWJMhgsBNnHqA", // PRO_1
  "AIzaSyBptLrGSF2MT-IYLXpFD9QqrLUVCZPFic0", // PRO_2
  "AIzaSyBIgh-9o1Fg1VXz2BrOEk3UFOU0Vpzt4Ug", // PRO_3
  "AIzaSyCc7YkS2waYRV1aUk3yVjNQdtKMVPu0PUY", // FLASH
  "AIzaSyAkja0H8ux3g2iw8jd-HJGEZxMMs04jIYk"  // KEY_1
];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: "Method not allowed" });

  try {
    const { prompt, imageBase64, mimeType, config } = req.body;
    const systemInstruction = config?.systemInstruction || "";

    const parts = [];
    if (systemInstruction) parts.push({ text: `INSTRUCTION: ${systemInstruction}` });
    if (imageBase64) {
      parts.push({
        inlineData: { data: imageBase64, mimeType: mimeType || "image/jpeg" }
      });
    }
    if (prompt) parts.push({ text: prompt });

    const modelsToTry = ["gemini-1.5-flash", "gemini-3-flash", "gemini-2.0-flash", "gemini-1.5-pro"];

    let text = "";
    let lastError = null;

    // Use environment key first, then fall back to the pool
    const primaryKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
    const keysToTry = primaryKey ? [primaryKey, ...KEY_POOL] : KEY_POOL;

    for (const key of keysToTry) {
      const genAI = new GoogleGenerativeAI(key);

      for (const modelName of modelsToTry) {
        try {
          const modelInstance = genAI.getGenerativeModel({ model: modelName });
          const result = await modelInstance.generateContent({
            contents: [{ role: 'user', parts }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 2048 }
          });

          text = result.response.text();
          if (text) break;
        } catch (err) {
          lastError = err;
          if (err.message.includes("429") || err.message.includes("404") || err.message.includes("quota")) {
            continue;
          }
          break; // If it's another error (auth), try next key
        }
      }
      if (text) break;
    }

    if (!text) throw lastError || new Error("Neural Link Exhausted.");

    // Extract JSON
    if (text.includes("```json")) text = text.split("```json")[1].split("```")[0].trim();
    else if (text.includes("```")) text = text.split("```")[1].split("```")[0].trim();
    else {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) text = jsonMatch[0];
    }

    return res.status(200).json({ text });

  } catch (error) {
    return res.status(500).json({ error: error.message || "Internal Diagnostic Error" });
  }
}
