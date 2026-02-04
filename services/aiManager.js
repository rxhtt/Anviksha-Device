
import { GoogleGenAI, Type } from "@google/genai";

const fileToBase64 = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

export default class AIManager {
    constructor() {
        this.coreModel = 'gemini-3-pro-preview'; 
        this.chatModel = 'gemini-3-flash-preview';
        this.currentKeyIndex = 0;
    }

    _getKeys() {
        try {
            const saved = JSON.parse(window.localStorage.getItem('anviksha_neural_links') || '[]');
            // Use saved keys if they exist, otherwise fallback to system key
            const keys = saved.length > 0 ? saved : [process.env.API_KEY].filter(Boolean);
            return keys;
        } catch (e) {
            return [process.env.API_KEY].filter(Boolean);
        }
    }

    isConfigured() {
        return this._getKeys().length > 0;
    }

    _getAiInstance() {
        const keys = this._getKeys();
        if (keys.length === 0) {
            throw new Error("NEURAL_LINK_OFFLINE: No API keys registered. Visit Settings.");
        }
        // Rotate logic: ensure index is within bounds
        const key = keys[this.currentKeyIndex % keys.length];
        return new GoogleGenAI({ apiKey: key });
    }

    /**
     * High-Availability Wrapper
     * Automatically rotates keys and retries on 429/Quota errors
     */
    async _callWithRotation(apiFn) {
        const keys = this._getKeys();
        let lastError;
        
        // Attempt the call up to the number of keys we have available
        for (let attempt = 0; attempt < Math.max(1, keys.length); attempt++) {
            try {
                return await apiFn();
            } catch (error) {
                lastError = error;
                const errStr = error.toString().toLowerCase();
                
                // If it's a quota/bandwidth error, rotate and try next key
                if (errStr.includes("429") || errStr.includes("quota") || errStr.includes("exhausted") || errStr.includes("limit")) {
                    if (keys.length > 1 && attempt < keys.length - 1) {
                        console.warn(`Anviksha Core: Key #${this.currentKeyIndex} exhausted. Rotating to next link...`);
                        this.currentKeyIndex = (this.currentKeyIndex + 1) % keys.length;
                        continue;
                    }
                }
                
                // If it's not a quota error or we've run out of keys, break and handle normally
                break;
            }
        }
        throw this._handleApiError(lastError);
    }

    _getCurrentContext() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'Asia/Kolkata'
        };
        return `PHYSICIAN_CONTEXT: Current Date & Time: ${now.toLocaleDateString('en-IN', options)}. LOCATION: India. TIER_TARGET: 2 and 3 cities. No demo mode. Absolute realism.`;
    }

    _handleApiError(error) {
        if (!error) return new Error("SYSTEM_MALFUNCTION: Unknown Error.");
        const errStr = error.toString().toLowerCase() || "";
        
        if (errStr.includes("429") || errStr.includes("quota") || errStr.includes("exhausted")) {
            return new Error("SYSTEM_ALERT: Neural Bandwidth Exhausted across ALL registered links. Please add more API keys in Settings or upgrade your tier at ai.google.dev/billing.");
        }
        if (errStr.includes("401") || errStr.includes("key")) {
            return new Error("SECURITY_ALERT: Unauthorized Access. One or more Neural Link keys are invalid.");
        }
        return new Error(`SYSTEM_MALFUNCTION: Core bypass error. ${error.message || "Synthesizer failed."}`);
    }

    _parseDeepJson(rawText) {
        try {
            if (!rawText) throw new Error("Empty core response");
            const cleanText = rawText.replace(/```json|```/g, '').trim();
            return JSON.parse(cleanText);
        } catch (e) {
            console.error("Neural Synthesis Failed:", e);
            throw new Error("CORE_SYNTHESIS_ERROR: Result structure corrupted.");
        }
    }

    async analyzeImage(file, modality) {
        return this._callWithRotation(async () => {
            const ai = this._getAiInstance();
            const base64 = await fileToBase64(file);
            const context = this._getCurrentContext();
            
            const systemInstruction = `You are the Anviksha Genesis Super-Physician. You are a world-class senior consultant radiologist.
            ${context}
            PROTOCOL:
            1. Professional Report: Write a formal clinical report using precise terminology.
            2. Real-World Grounding: Analyze pixels for actual findings. No generic text.
            3. Precision: confidence MUST be an INTEGER between 0 and 100.
            4. Emergency: Set isEmergency true only for life-threatening acute findings.
            5. Valuation: Use realistic Indian private hospital rates (₹800 - ₹2500).`;

            const response = await ai.models.generateContent({
                model: this.coreModel,
                contents: {
                    parts: [
                        { inlineData: { data: base64, mimeType: file.type } },
                        { text: `Synthesize a high-fidelity clinical report for this ${modality} data.` }
                    ]
                },
                config: { 
                    systemInstruction, 
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            condition: { type: Type.STRING },
                            confidence: { type: Type.INTEGER },
                            description: { type: Type.STRING },
                            details: { type: Type.STRING },
                            treatment: { type: Type.STRING },
                            isEmergency: { type: Type.BOOLEAN },
                            cost: { type: Type.NUMBER }
                        },
                        required: ["condition", "confidence", "description", "details", "treatment", "isEmergency", "cost"]
                    }
                }
            });

            return this._parseDeepJson(response.text);
        });
    }

    async getPharmacySuggestions(query, history = "") {
        return this._callWithRotation(async () => {
            const ai = this._getAiInstance();
            const context = this._getCurrentContext();
            
            const systemInstruction = `You are a Senior Clinical Pharmacologist. 
            ${context}
            TASK: Suggest Indian generic/brand drugs, dosage, and schedules.`;

            const response = await ai.models.generateContent({
                model: this.coreModel,
                contents: `Condition: ${query}. History: ${history}. Generate prescription.`,
                config: { 
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            diagnosisSummary: { type: Type.STRING },
                            medicines: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING },
                                        genericName: { type: Type.STRING },
                                        dosageSchedule: { type: Type.STRING },
                                        timing: { type: Type.STRING },
                                        duration: { type: Type.STRING },
                                        genericPrice: { type: Type.NUMBER },
                                        laymanExplanation: { type: Type.STRING },
                                        expertNote: { type: Type.STRING },
                                        contraindications: { type: Type.STRING },
                                        marketAvailability: { type: Type.STRING }
                                    }
                                }
                            }
                        },
                        required: ["diagnosisSummary", "medicines"]
                    }
                }
            });

            return this._parseDeepJson(response.text);
        });
    }

    async testKeyConnection(key) {
        try {
            const ai = new GoogleGenAI({ apiKey: key });
            const response = await ai.models.generateContent({
                model: this.chatModel,
                contents: "ping",
            });
            return !!response.text;
        } catch (e) {
            console.error("Gemini connection test failed", e);
            return false;
        }
    }

    async testGeminiConnection() {
        return this._callWithRotation(async () => {
            const ai = this._getAiInstance();
            const response = await ai.models.generateContent({
                model: this.chatModel,
                contents: "ping",
            });
            return !!response.text;
        });
    }

    async testFdaConnection(customKey) {
        try {
            const res = await fetch(`https://api.fda.gov/drug/label.json?${customKey ? `api_key=${customKey}&` : ''}search=openfda.brand_name:"aspirin"&limit=1`);
            return res.ok;
        } catch (e) { return false; }
    }

    async sendChatMessage(text, imageFile) {
        return this._callWithRotation(async () => {
            const ai = this._getAiInstance();
            const context = this._getCurrentContext();
            const parts = [{ text }];
            if (imageFile) {
                const b64 = await fileToBase64(imageFile);
                parts.push({ inlineData: { data: b64, mimeType: imageFile.type } });
            }
            const response = await ai.models.generateContent({
                model: this.chatModel,
                contents: { parts },
                config: { 
                    systemInstruction: `You are the Anviksha Genesis Super-Physician. ${context}. Expert advice only. Use search for current news.`,
                    tools: [{ googleSearch: {} }]
                }
            });
            return response.text;
        });
    }

    async getTherapyResponse(userText) {
        return this._callWithRotation(async () => {
            const ai = this._getAiInstance();
            const context = this._getCurrentContext();
            const response = await ai.models.generateContent({
                model: this.chatModel,
                contents: userText,
                config: { systemInstruction: `You are Dr. Anviksha, Wellness Specialist. ${context}.` }
            });
            return response.text;
        });
    }

    async performTriage(inputs) {
        return this._callWithRotation(async () => {
            const ai = this._getAiInstance();
            const context = this._getCurrentContext();
            const response = await ai.models.generateContent({
                model: this.chatModel,
                contents: `Triage Context: ${JSON.stringify(inputs)}. ${context}`,
                config: { 
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            riskScore: { type: Type.INTEGER },
                            recommendation: { type: Type.STRING },
                            reasoning: { type: Type.STRING },
                            urgencyLabel: { type: Type.STRING }
                        }
                    }
                }
            });
            return this._parseDeepJson(response.text);
        });
    }
}
