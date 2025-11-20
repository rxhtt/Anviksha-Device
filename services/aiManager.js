
// aiManager.js - Manages cloud-based AI analysis via Gemini
// Now supporting multi-modal Hospital AI (X-Ray, ECG, Blood, MRI, etc.)

import { GoogleGenAI, Type } from "@google/genai";

/**
 * Converts a File object to a GoogleGenAI.Part object.
 * @param {File} file The file to convert.
 * @returns {Promise<{inlineData: {data: string, mimeType: string}}>}
 */
const fileToGenerativePart = async (file) => {
  const base64EncodedDataPromise = new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to read file as data URL.'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

// Helper to get a specific system prompt based on modality
const getPromptForModality = (modality) => {
    const baseStructure = `
    Output MUST be strict JSON with no markdown formatting.
    Keys: 'condition' (ALL CAPS string), 'confidence' (0-100 int), 'description' (1 sentence), 'details' (detailed findings), 'treatment' (recommendation), 'isEmergency' (boolean).
    `;

    switch (modality) {
        case 'ECG':
            return `
            You are an expert Cardiologist AI. Analyze this ECG/EKG image. 
            1. Identify the rhythm (Sinus, Afib, VTach, etc.).
            2. Look for ST elevation/depression, QT prolongation, or axis deviation.
            3. Determine if there are signs of Ischemia or Infarction.
            ${baseStructure}
            `;
        case 'BLOOD':
            return `
            You are an expert Hematologist AI. Analyze this image of a Blood Test Report.
            1. OCR the text to identify key markers (CBC, Lipid, metabolic).
            2. Identify values that are 'High', 'Low', or 'Critical' based on standard ranges.
            3. Correlate abnormal values to suggest a diagnosis (e.g., Anemia, Infection, Diabetes).
            ${baseStructure}
            `;
        case 'MRI':
            return `
            You are an expert Neuroradiologist AI. Analyze this MRI scan (likely Brain or Spine).
            1. Look for tumors, lesions, bleeding, or stroke indicators (hyperintensities).
            2. Check for structural abnormalities or demyelination.
            ${baseStructure}
            `;
        case 'CT':
            return `
            You are an expert Radiologist AI. Analyze this CT Scan.
            1. Look for fractures, internal bleeding, tumors, or organ enlargement.
            2. Differentiate between contrast and non-contrast features if visible.
            ${baseStructure}
            `;
        case 'DERMA':
             return `
            You are an expert Dermatologist AI. Analyze this skin condition image.
            1. Evaluate asymmetry, border, color, diameter (ABCD rule).
            2. Identify if it looks like Eczema, Psoriasis, Melanoma, or Infection.
            ${baseStructure}
            `;
        case 'XRAY':
        default:
            return `
            You are an expert Radiologist AI. Analyze this Chest X-Ray.
            1. Look for Pneumonia, TB, Nodules, Effusion, Cardiomegaly, or Fractures.
            ${baseStructure}
            `;
    }
};

class AIManager {
    _apiKey;
    _aiClient;

    constructor(apiKey) {
        this._apiKey = apiKey;
        this._aiClient = null;
    }

    _getAiClient() {
        if (this._aiClient) return this._aiClient;
        
        if (!this._apiKey) throw new Error('API Key is not configured.');
        
        this._aiClient = new GoogleGenAI({ apiKey: this._apiKey });
        return this._aiClient;
    }

    async performTriage(triageInputs) {
        if (!this._apiKey) throw new Error("API Key not configured.");
        
        return await this._performRealTriage(triageInputs, this._apiKey);
    }

    async _performRealTriage(triageInputs, apiKey) {
        try {
            const geminiAI = this._getAiClient();
            const parts = [];
            if (triageInputs.visualObservation) {
                parts.push(await fileToGenerativePart(triageInputs.visualObservation));
            }

            const prompt = `
            Patient Symptoms:
            - Cough: ${triageInputs.coughDuration}, Fever: ${triageInputs.fever}, Chest Pain: ${triageInputs.chestPain}
            - Breathing Diff: ${triageInputs.breathingDifficulty}, Sputum: ${triageInputs.sputum}, Weight Loss: ${triageInputs.weightLoss}
            
            You are a medical triage AI. Calculate a Risk Score (0-100) for serious conditions based on these symptoms and optional visual cues (pallor, distress).
            Output STRICT JSON: { "riskScore": number, "recommendation": "GET_XRAY" | "CONSIDER_XRAY" | "NO_XRAY", "reasoning": "string", "urgencyLabel": "string" }
            `;
            parts.push({ text: prompt });

            const response = await geminiAI.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts },
                config: { responseMimeType: "application/json" }
            });
            return JSON.parse(response.text.trim());
        } catch (error) {
            console.error("Triage error:", error);
            throw new Error("Failed to perform triage analysis.");
        }
    }

    async _performCloudAnalysis(imageFile, modality = 'XRAY') {
        try {
            const geminiAI = this._getAiClient();
            const imagePart = await fileToGenerativePart(imageFile);
            const prompt = getPromptForModality(modality);

            const response = await geminiAI.models.generateContent({
              model: 'gemini-2.5-pro',
              contents: { parts: [imagePart, { text: prompt }] },
              config: {
                  responseMimeType: "application/json",
                  responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                      condition: { type: Type.STRING },
                      confidence: { type: Type.INTEGER },
                      description: { type: Type.STRING },
                      details: { type: Type.STRING },
                      treatment: { type: Type.STRING },
                      isEmergency: { type: Type.BOOLEAN }
                    },
                    required: ["condition", "confidence", "description", "details", "treatment", "isEmergency"],
                  },
              },
            });

            const result = JSON.parse(response.text.trim());
            return {
                ...result,
                modality,
                modelUsed: 'Gemini 2.5 Pro',
                cost: modality === 'MRI' || modality === 'CT' ? 250 : 150,
            };
            
        } catch (error) {
            console.error('Analysis Error:', error);
            throw new Error('AI Service failed to analyze image. Check API Key or Network.');
        }
    }

    async analyzeImage(imageFile, modality = 'XRAY') {
        if (!this._apiKey) throw new Error("API Key is not configured.");
        if (!navigator.onLine) throw new Error('Internet connection required.');
        
        return await this._performCloudAnalysis(imageFile, modality);
    }
}

export default AIManager;
