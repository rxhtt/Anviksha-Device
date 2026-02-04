
import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Gemini API_KEY is missing in environment variables." });
  }

  const fdaKey = process.env.FDA_KEY; 

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { type, prompt, imageBase64, mimeType, model, config, useSearch, pharmacyContext } = req.body;
    
    // Strictly follow SDK guidelines for initialization
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // --- PHARMACY PIPELINE ENHANCEMENT ---
    if (type === 'PHARMACY_PIPELINE') {
      const drugQuery = encodeURIComponent(pharmacyContext.query);
      
      // STAGE 1: OpenFDA Data Pull
      let fdaData = { results: [] };
      try {
        const fdaUrl = `https://api.fda.gov/drug/label.json?${fdaKey ? `api_key=${fdaKey}&` : ''}search=openfda.brand_name:"${drugQuery}"+openfda.substance_name:"${drugQuery}"&limit=3`;
        const fdaRes = await fetch(fdaUrl);
        if (fdaRes.ok) fdaData = await fdaRes.json();
      } catch (e) { 
        console.warn("FDA API inaccessible, falling back to neural analysis"); 
      }

      // STAGE 2 & 3: Neural Synthesis using Gemini 3 Pro
      const synthesisPrompt = `
        SYSTEM: You are a Clinical Pharmacy Intelligence Engine.
        USER_CONTEXT: ${pharmacyContext.userHistory || "General Consultation"}
        SYMPTOMS: ${drugQuery}
        RAW_FDA_DATA: ${JSON.stringify(fdaData.results?.map(r => ({
          brand: r.openfda?.brand_name?.[0],
          generic: r.openfda?.substance_name?.[0],
          warnings: r.warnings?.[0],
          adverse: r.adverse_reactions?.[0]
        })))}

        TASK:
        1. Perform a "Contraindication Scan": Match symptoms with FDA side effects.
        2. Research Market Logic: Estimate CURRENT retail price tiers in INR (Budget/Premium/Specialized).
        3. Rank medicines by "Compatibility Score" (0-100) based on safety.
        4. Sort results by estimated cost ASCENDING.

        RETURN STRICT JSON only.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: synthesisPrompt,
        config: { responseMimeType: "application/json" }
      });

      // Use the property .text (not a method)
      const rawText = response.text;
      return res.status(200).json({ text: rawText });
    }

    // --- DEFAULT GENERATION (Diagnostic Imaging, Therapy, Chat) ---
    const selectedModel = useSearch ? 'gemini-3-pro-preview' : (model || 'gemini-3-flash-preview');

    const parts = [];
    if (imageBase64) {
      parts.push({ inlineData: { data: imageBase64, mimeType: mimeType || "image/jpeg" } });
    }
    if (prompt) {
      parts.push({ text: prompt });
    }

    const generationConfig = {
        ...config
    };

    if (useSearch) {
        generationConfig.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: { parts },
      config: generationConfig
    });

    // Use the property .text (not a method)
    return res.status(200).json({ text: response.text });

  } catch (error) {
    console.error("Vercel Process Error:", error);
    return res.status(500).json({ error: "Internal Engine Error", details: error.message });
  }
}
