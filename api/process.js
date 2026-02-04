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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, imageBase64, mimeType, model, config } = req.body;

    // Extract system instruction
    const systemInstruction = config?.systemInstruction;
    const generationConfig = { ...config };
    delete generationConfig.systemInstruction;

    // Shuffle and Rotate
    const shuffled = [...GEMINI_POOL].sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(shuffled.length, 3); i++) {
      try {
        const genAI = new GoogleGenerativeAI(shuffled[i]);
        const modelInstance = genAI.getGenerativeModel({
          model: model || 'gemini-2.0-flash',
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
        console.error(`Process Attempt ${i + 1} failed:`, error.message);
        const isRateLimit = error.message?.includes("429") || error.message?.toLowerCase().includes("quota");
        if (isRateLimit && i < 2) continue;

        return res.status(500).json({
          error: (error.message?.includes("429") || error.message?.toLowerCase().includes("quota"))
            ? "Neural Link Capacity Exceeded (Rate Limit)."
            : error.message || "Internal Server Error"
        });
      }
    }
  } catch (outerError) {
    return res.status(500).json({ error: outerError.message });
  }
}