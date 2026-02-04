
// ANVIKSHA GENESIS - REAL-TIME NEURAL ENGINE
const fileToBase64 = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

export default class AIManager {
    constructor() {}

    // Helper to extract JSON from model responses
    _parseDeepJson(data) {
        try {
            const rawText = data.text || data;
            if (!rawText) throw new Error("Empty response");
            
            // Handle markdown blocks if present
            const cleanText = rawText.replace(/```json|```/g, '').trim();
            return JSON.parse(cleanText);
        } catch (e) {
            console.error("Neural Extraction Failed:", e);
            // Return a safe error object instead of crashing
            return { error: "Diagnosis unavailable", raw: data };
        }
    }

    async analyzeImage(file, modality) {
        try {
            const base64 = await fileToBase64(file);
            const systemInstruction = `You are a World-Class Diagnostic Specialist in ${modality}. Perform a REAL-TIME clinical analysis based ONLY on visual evidence. Return JSON.`;
            const prompt = `Analyze this ${modality} scan. JSON Schema: { "condition": string, "confidence": number, "description": string, "details": string, "treatment": string, "isEmergency": boolean, "cost": number }`;

            const response = await fetch('/api/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    imageBase64: base64,
                    mimeType: file.type,
                    model: 'gemini-3-flash-preview', 
                    config: { responseMimeType: "application/json", systemInstruction }
                })
            });

            if (!response.ok) throw new Error("Neural Link Error");
            const data = await response.json();
            return this._parseDeepJson(data);
        } catch (error) { 
            console.error("Analyze Image Error:", error);
            throw error; 
        }
    }

    async getPharmacySuggestions(query, history = "") {
        try {
            const response = await fetch('/api/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'PHARMACY_PIPELINE',
                    pharmacyContext: {
                        query,
                        userHistory: history || "General adult profile."
                    }
                })
            });

            if (!response.ok) throw new Error("Pharmacy Synthesis Offline");
            const data = await response.json();
            return this._parseDeepJson(data);
        } catch (error) {
            console.error("Pharmacy Synthesis Error:", error);
            throw error;
        }
    }

    async sendChatMessage(text, imageFile) {
        try {
            let base64 = null;
            if (imageFile) base64 = await fileToBase64(imageFile);
            
            const response = await fetch('/api/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: text,
                    imageBase64: base64,
                    mimeType: imageFile?.type,
                    model: 'gemini-3-pro-preview',
                    useSearch: true,
                    config: { 
                        systemInstruction: "You are the Genesis Assistant. You are a highly professional medical assistant capable of diagnosing based on images and providing up-to-date health information using real-time search." 
                    }
                })
            });

            if (!response.ok) throw new Error("Chat Service Offline");
            const data = await response.json();
            return data.text || "I was unable to process that message. Please try again.";
        } catch (error) {
            console.error("Chat Service Error:", error);
            throw error;
        }
    }

    async getTherapyResponse(userText) {
        try {
            const response = await fetch('/api/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: userText,
                    model: 'gemini-3-pro-preview',
                    config: { 
                        systemInstruction: "You are Dr. Anviksha, a compassionate, empathetic therapist specializing in medical anxiety and wellness. Use short, helpful responses." 
                    }
                })
            });

            if (!response.ok) throw new Error("Therapy Link Broken");
            const data = await response.json();
            return data.text || "I'm listening. Please continue sharing.";
        } catch (error) {
            console.error("Therapy Service Error:", error);
            throw error;
        }
    }

    async performTriage(inputs) {
        try {
            const prompt = `Assess patient: Cough(${inputs.coughDuration}), Fever(${inputs.fever}). Return JSON risk assessment.`;
            const response = await fetch('/api/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    model: 'gemini-3-flash-preview',
                    config: { responseMimeType: "application/json" }
                })
            });
            if (!response.ok) throw new Error("Triage API error");
            const data = await response.json();
            return this._parseDeepJson(data);
        } catch (error) {
            console.error("Triage Error:", error);
            throw error;
        }
    }
}
