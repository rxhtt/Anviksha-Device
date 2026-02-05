
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
        this.chatModel = 'gemini-3-flash-preview';
        this.therapyModel = 'gemini-3-flash-preview';
    }

    _getStoredKey(name) {
        return window.localStorage.getItem(`anviksha_${name}_link`) || process.env.API_KEY || '';
    }

    async isConfigured(module = 'any') {
        if (module === 'vision') return !!this._getStoredKey('vision');
        if (module === 'chat') return !!this._getStoredKey('chat');
        if (module === 'therapy') return !!this._getStoredKey('therapy');
        
        // Default check for any key configuration
        return !!(this._getStoredKey('vision') || this._getStoredKey('chat') || this._getStoredKey('therapy'));
    }

    async requestKeySelection() {
        if (typeof window.aistudio?.openSelectKey === 'function') {
            await window.aistudio.openSelectKey();
            return true;
        }
        return false;
    }

    /**
     * STAGE 1: Google Vision API (REST)
     * Performs raw optical analysis of the medical image.
     */
    async _callVisionApi(base64, modality) {
        const visionKey = this._getStoredKey('vision');
        if (!visionKey) throw new Error("VISION_KEY_MISSING: Diagnostic imaging requires a Vision API Link.");

        const url = `https://vision.googleapis.com/v1/images:annotate?key=${visionKey}`;
        const payload = {
            requests: [{
                image: { content: base64 },
                features: [
                    { type: "TEXT_DETECTION" },
                    { type: "LABEL_DETECTION", maxResults: 10 },
                    { type: "OBJECT_LOCALIZATION" },
                    { type: "IMAGE_PROPERTIES" }
                ]
            }]
        };

        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(`VISION_API_ERROR: ${err.error?.message || "Optical scan failed."}`);
        }

        return await response.json();
    }

    /**
     * STAGE 2: Neural Synthesis
     * Uses the Chat Key (Gemini) to turn raw Vision data into a medical report.
     */
    async analyzeImage(file, modality) {
        const base64 = await fileToBase64(file);
        
        // 1. Get raw visual evidence from Google Vision
        const visionData = await this._callVisionApi(base64, modality);
        const opticalEvidence = visionData.responses[0];
        
        // 2. Synthesize clinical report using Chat Key (Gemini)
        const chatKey = this._getStoredKey('chat');
        const ai = new GoogleGenAI({ apiKey: chatKey });
        
        const systemInstruction = `You are the Anviksha Genesis Senior Radiologist. 
        Synthesize a report based on provided OPTICAL EVIDENCE from Google Vision API.
        MODALITY: ${modality}.
        EVIDENCE: ${JSON.stringify(opticalEvidence).substring(0, 3000)}
        
        STRICT PROTOCOL:
        1. NO HALLUCINATION: Only report findings supported by optical labels or detected text.
        2. MEDICAL TERMINOLOGY: Use professional clinical language.
        3. REALISM: If labels are inconclusive, state "Radiological scan requires higher contrast".
        4. COST: Benchmark in INR (₹1200 - ₹4500).`;

        const response = await ai.models.generateContent({
            model: this.chatModel,
            contents: `Optical markers detected: ${opticalEvidence.labelAnnotations?.map(a => a.description).join(', ')}. 
                       Text detected: ${opticalEvidence.fullTextAnnotation?.text || "None"}.
                       Synthesize the final physician report for this ${modality} scan.`,
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

        try {
            const cleanText = response.text.replace(/```json|```/g, '').trim();
            return JSON.parse(cleanText);
        } catch (e) {
            throw new Error("SYNTHESIS_ERROR: Failed to generate medical report from visual evidence.");
        }
    }

    async getPharmacySuggestions(query, history = "") {
        const key = this._getStoredKey('chat');
        const ai = new GoogleGenAI({ apiKey: key });
        
        const response = await ai.models.generateContent({
            model: this.chatModel,
            contents: `Symptoms: ${query}. History: ${history}. Generate Indian prescription.`,
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
                    }
                }
            }
        });

        const cleanText = response.text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanText);
    }

    async sendChatMessage(text, imageFile) {
        const key = this._getStoredKey('chat');
        const ai = new GoogleGenAI({ apiKey: key });
        const parts = [{ text }];
        
        if (imageFile) {
            const b64 = await fileToBase64(imageFile);
            parts.push({ inlineData: { data: b64, mimeType: imageFile.type } });
        }

        const response = await ai.models.generateContent({
            model: this.chatModel,
            contents: { parts },
            config: { 
                systemInstruction: `You are the Anviksha Physician Assistant.`,
                tools: [{ googleSearch: {} }]
            }
        });
        return response.text;
    }

    async getTherapyResponse(userText) {
        const key = this._getStoredKey('therapy');
        const ai = new GoogleGenAI({ apiKey: key });
        const response = await ai.models.generateContent({
            model: this.therapyModel,
            contents: userText,
            config: { systemInstruction: `You are Dr. Anviksha, Wellness Specialist.` }
        });
        return response.text;
    }

    async performTriage(inputs) {
        const key = this._getStoredKey('chat');
        const ai = new GoogleGenAI({ apiKey: key });
        const response = await ai.models.generateContent({
            model: this.chatModel,
            contents: `Triage Context: ${JSON.stringify(inputs)}`,
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
        const cleanText = response.text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanText);
    }
}
