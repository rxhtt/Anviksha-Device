
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
        return window.localStorage.getItem(`anviksha_${name}_link`) || '';
    }

    async isConfigured(module = 'any') {
        if (module === 'any') {
            return !!(this._getStoredKey('vision') && this._getStoredKey('chat'));
        }
        return !!this._getStoredKey(module);
    }

    /**
     * VERIFICATION SUITE: Individual testing for each channel
     */
    async verifyLink(type, key) {
        if (!key) return { success: false, message: "Key required" };
        
        try {
            if (type === 'vision') {
                const res = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${key}`, {
                    method: 'POST',
                    body: JSON.stringify({ requests: [{ image: { content: "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" }, features: [{ type: "LABEL_DETECTION" }] }] })
                });
                return { success: res.ok, message: res.ok ? "Optical Link Active" : "Invalid Vision Key" };
            }

            if (type === 'chat' || type === 'therapy') {
                const ai = new GoogleGenAI({ apiKey: key });
                const response = await ai.models.generateContent({
                    model: this.chatModel,
                    contents: "ping",
                });
                return { success: !!response.text, message: response.text ? "Neural Link Active" : "No response" };
            }

            if (type === 'fda') {
                const res = await fetch(`https://api.fda.gov/drug/label.json?api_key=${key}&limit=1`);
                return { success: res.ok, message: res.ok ? "FDA Database Linked" : "Invalid FDA Key" };
            }
        } catch (e) {
            return { success: false, message: e.message || "Connection Failed" };
        }
        return { success: false, message: "Unknown Channel" };
    }

    /**
     * STAGE 1: Google Vision API (Direct REST)
     * Bypasses Gemini to perform raw optical inspection.
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
                    { type: "LABEL_DETECTION", maxResults: 15 },
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
     * Uses the Consultation Link (Chat Key) to synthesize the Vision data into a medical report.
     */
    async analyzeImage(file, modality) {
        const base64 = await fileToBase64(file);
        
        // 1. Get raw optical evidence
        const visionData = await this._callVisionApi(base64, modality);
        const opticalEvidence = visionData.responses[0];
        
        // 2. Synthesize using Consultation Link (Chat Key)
        const chatKey = this._getStoredKey('chat');
        const ai = new GoogleGenAI({ apiKey: chatKey });
        
        const systemInstruction = `You are the Anviksha Genesis Senior Radiologist. 
        Synthesize a structured clinical report based on provided OPTICAL EVIDENCE.
        MODALITY: ${modality}.
        
        STRICT PROTOCOL:
        1. NO HALLUCINATION: Only report findings supported by detected labels or text.
        2. PIXEL AUDIT: Interpret detected objects (e.g., bones, markers) clinically.
        3. REALISM: If the vision API returns non-medical labels, state "Optical profile mismatch".
        4. COST: Benchmark in INR (₹1200 - ₹4500).`;

        const response = await ai.models.generateContent({
            model: this.chatModel,
            contents: `Optical labels: ${opticalEvidence.labelAnnotations?.map(a => a.description).join(', ')}. 
                       Detected text: ${opticalEvidence.fullTextAnnotation?.text || "None"}.
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

        const cleanText = response.text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanText);
    }

    async getPharmacySuggestions(query, history = "") {
        const key = this._getStoredKey('chat');
        const fdaKey = this._getStoredKey('fda');
        const ai = new GoogleGenAI({ apiKey: key });
        
        const response = await ai.models.generateContent({
            model: this.chatModel,
            contents: `Symptoms: ${query}. History: ${history}. Generate Indian prescription. Use FDA reference if applicable.`,
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
