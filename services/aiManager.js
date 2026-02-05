
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
        const key = keys[this.currentKeyIndex % keys.length];
        return new GoogleGenAI({ apiKey: key });
    }

    async _callWithRotation(apiFn) {
        const keys = this._getKeys();
        let lastError;
        
        for (let attempt = 0; attempt < Math.max(1, keys.length); attempt++) {
            try {
                return await apiFn();
            } catch (error) {
                lastError = error;
                const errStr = error.toString().toLowerCase();
                
                if (errStr.includes("429") || errStr.includes("quota") || errStr.includes("exhausted") || errStr.includes("limit")) {
                    if (keys.length > 1 && attempt < keys.length - 1) {
                        console.warn(`Anviksha Core: Key #${this.currentKeyIndex} exhausted. Rotating...`);
                        this.currentKeyIndex = (this.currentKeyIndex + 1) % keys.length;
                        continue;
                    }
                }
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
        return `PHYSICIAN_CONTEXT: ${now.toLocaleDateString('en-IN', options)}. LOCATION: India. TARGET: Clinically accurate diagnostic synthesis.`;
    }

    _handleApiError(error) {
        if (!error) return new Error("SYSTEM_MALFUNCTION: Unknown Error.");
        const errStr = error.toString().toLowerCase() || "";
        
        if (errStr.includes("429") || errStr.includes("quota") || errStr.includes("exhausted")) {
            return new Error("SYSTEM_ALERT: Neural Bandwidth Exhausted across all links. Please verify billing or add more keys.");
        }
        return new Error(`SYSTEM_MALFUNCTION: ${error.message || "Synthesis failed."}`);
    }

    _parseDeepJson(rawText) {
        try {
            if (!rawText) throw new Error("Empty core response");
            const cleanText = rawText.replace(/```json|```/g, '').trim();
            return JSON.parse(cleanText);
        } catch (e) {
            console.error("Neural Synthesis Failed:", e);
            throw new Error("CORE_SYNTHESIS_ERROR: Data integrity check failed.");
        }
    }

    async analyzeImage(file, modality) {
        return this._callWithRotation(async () => {
            const ai = this._getAiInstance();
            const base64 = await fileToBase64(file);
            const context = this._getCurrentContext();
            
            const systemInstruction = `You are the Anviksha Genesis Super-Physician. You are a senior consultant multi-specialist and radiologist.
            ${context}
            
            STRICT PROTOCOL:
            1. PIXEL ANALYSIS: Perform a deep visual audit of the provided ${modality} image. Look for subtle radiological signs (e.g., ground-glass opacities, trabecular patterns, wave intervals, biomarker values).
            2. ABSOLUTE REALISM: Do NOT provide generic medical text. If you see a specific fracture, name the exact bone and site. If an ECG is normal, state the specific rhythm (e.g., "Normal Sinus Rhythm at 72bpm").
            3. NO PLACEHOLDERS: Do not use "Evaluation Required" or "Diagnostic Synthesis" as a condition unless truly inconclusive. Be specific (e.g., "Left Lower Lobe Consolidation").
            4. CONFIDENCE: Provide an honest integer (0-100). Low confidence is better than fake certainty.
            5. INDIAN COST: Suggest the specific value of this consultation in INR (₹800-₹3500) based on Indian private healthcare standards.`;

            const response = await ai.models.generateContent({
                model: this.coreModel,
                contents: {
                    parts: [
                        { inlineData: { data: base64, mimeType: file.type } },
                        { text: `Analyze this ${modality} image and synthesize a granular clinical report. Focus on specific pathological markers.` }
                    ]
                },
                config: { 
                    systemInstruction, 
                    responseMimeType: "application/json",
                    thinkingConfig: { thinkingBudget: 8192 },
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
            
            const systemInstruction = `You are a Senior Clinical Pharmacologist. Suggest Indian generic/brand drugs based on symptoms: ${query}. History: ${history}. ${context}`;

            const response = await ai.models.generateContent({
                model: this.coreModel,
                contents: `Condition: ${query}. History: ${history}. Generate precise Indian-market prescription.`,
                config: { 
                    responseMimeType: "application/json",
                    thinkingConfig: { thinkingBudget: 4096 },
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
            return false;
        }
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
            const parts = [{ text }];
            if (imageFile) {
                const b64 = await fileToBase64(imageFile);
                parts.push({ inlineData: { data: b64, mimeType: imageFile.type } });
            }
            const response = await ai.models.generateContent({
                model: this.chatModel,
                contents: { parts },
                config: { 
                    systemInstruction: `You are the Anviksha Genesis Super-Physician. Provide clinically accurate, high-fidelity advice. Use search for recent medical news.`,
                    tools: [{ googleSearch: {} }]
                }
            });
            return response.text;
        });
    }

    async getTherapyResponse(userText) {
        return this._callWithRotation(async () => {
            const ai = this._getAiInstance();
            const response = await ai.models.generateContent({
                model: this.chatModel,
                contents: userText,
                config: { systemInstruction: `You are Dr. Anviksha, a wellness specialist focusing on clinical empathy.` }
            });
            return response.text;
        });
    }

    async performTriage(inputs) {
        return this._callWithRotation(async () => {
            const ai = this._getAiInstance();
            const response = await ai.models.generateContent({
                model: this.chatModel,
                contents: `Triage Context: ${JSON.stringify(inputs)}`,
                config: { 
                    responseMimeType: "application/json",
                    thinkingConfig: { thinkingBudget: 4096 },
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
