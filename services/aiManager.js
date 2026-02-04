
// ANVIKSHA AI - CORE DIAGNOSTIC ENGINE (AIManager.js)
// Refined for Production, Vercel, and Indian Healthcare Context

const SPECIALIST_PERSONAS = {
    XRAY: {
        role: "Senior Consultant Radiologist",
        context: "Analyze this chest radiograph. Look specifically for parenchymal opacities, pneumothorax, effusion, or cardiomegaly. Provide reasoning path."
    },
    MRI: {
        role: "Neuro-Radiologist",
        context: "Analyze MRI sequence for signal abnormalities in T1/T2/FLAIR. Look for lesions or infarcts."
    },
    ECG: {
        role: "Interventional Cardiologist",
        context: "Analyze 12-lead ECG. Measure PR, QRS, and QT intervals. Flag acute ischemia or arrhythmias."
    },
    DERMA: {
        role: "Dermatopathologist",
        context: "Analyze skin lesion using ABCDE rule. Distinguish between benign and malignant patterns."
    },
    BLOOD: {
        role: "Clinical Hematologist",
        context: "Analyze lab report. OCR values and compare against standard Indian reference ranges."
    },
    DEFAULT: {
        role: "Clinical Diagnostic Engine",
        context: "High-precision clinical analysis for general medicine."
    }
};

const MOCK_PHARMACY = {
    diagnosis: "Symptoms consistent with common clinical presentations.",
    medicines: [
        { name: "Dolo 650", genericName: "Paracetamol 650mg", type: "Tablet", dosage: "1 tab SOS", price: 30, genericPrice: 8, explanation: "Standard antipyretic for fever." },
        { name: "Azithral 500", genericName: "Azithromycin 500mg", type: "Tablet", dosage: "1 tab OD x 3 days", price: 120, genericPrice: 42, explanation: "Broad-spectrum antibiotic." }
    ]
};

const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = e => reject(e);
});

export default class AIManager {
    constructor() {
        this.history = [];
        this.auditLog = [];
    }

    getProfileContext(profile) {
        if (!profile) return "No patient profile provided.";
        return `
        PATIENT CONTEXT:
        - Name: ${profile.name}
        - Age/Sex: ${profile.age}y / ${profile.sex}
        - Blood Group: ${profile.bloodGroup}
        - Conditions: ${profile.chronicConditions?.join(', ') || 'None'}
        - Allergies: ${profile.allergies?.join(', ') || 'None'}
        `;
    }

    async analyzeImage(file, modality, profile, language = 'en') {
        try {
            const base64 = await fileToBase64(file);
            const specialist = SPECIALIST_PERSONAS[modality] || SPECIALIST_PERSONAS.DEFAULT;
            const profileContext = this.getProfileContext(profile);

            const systemInstruction = `
            ACT AS: ${specialist.role}.
            
            CRITICAL SAFETY CHECK: 
            Before analysis, verify if the image is a legitimate medical image (X-ray, MRI, CT, ECG, Lab report, or clinical skin photo).
            If the image is NOT a medical image (e.g., a person, a landscape, food, generic object, or non-clinical photo), 
            you MUST return a specific error JSON.

            REASONING FRAMEWORK:
            1. STEP_ONE: Validate image legitimacy.
            2. STEP_TWO: Identify anatomical landmarks.
            3. STEP_THREE: Note abnormalities.
            4. STEP_FOUR: Clinical correlation.

            ${profileContext}
            `;

            const userPrompt = `Analyze this ${modality} image. 
            If it is NOT a medical image, return: {"error": "INVALID_IMAGE", "message": "This image is not meant for medical analysis. Please provide a legit medical scan or report."}
            Otherwise, return valid JSON with: { "condition", "confidence", "reasoningPath", "treatment", "isEmergency", "doctorReviewNeeded" }`;

            const response = await fetch('/api/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: userPrompt,
                    imageBase64: base64,
                    mimeType: file.type,
                    config: { systemInstruction, temperature: 0.1 }
                })
            });

            if (!response.ok) throw new Error("API Connection Failed");

            const data = await response.json();
            const result = JSON.parse(data.text);

            if (result.error === "INVALID_IMAGE") {
                return {
                    condition: "Non-Medical Image Detected",
                    description: result.message,
                    treatment: "Please upload a valid diagnostic image.",
                    isEmergency: false,
                    isInvalid: true
                };
            }

            this.logReasoning(modality, result.reasoningPath);
            return {
                ...result,
                status: 'AI_VERIFIED',
                id: `DX-${Date.now().toString(36).toUpperCase()}`
            };

        } catch (error) {
            console.error("AI Manager Error:", error);
            return this.getLocalFallback(modality);
        }
    }

    async performTriage(inputs, profile, language = 'en') {
        try {
            const profileContext = this.getProfileContext(profile);
            const userPrompt = `Perform a Clinical Triage based on: ${JSON.stringify(inputs)}. ${profileContext}
            Return JSON: { "riskScore": number, "recommendation": "GET_XRAY" | "CONSIDER_XRAY" | "NO_XRAY", "urgencyLabel": string, "reasoning": string }`;

            const response = await fetch('/api/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: userPrompt,
                    config: { temperature: 0.2, responseMimeType: "application/json" }
                })
            });

            if (response.ok) {
                const data = await response.json();
                return JSON.parse(data.text);
            }
            throw new Error("Triage Failed");
        } catch (e) {
            return { riskScore: 50, recommendation: "CONSIDER_XRAY", urgencyLabel: "Offline Mode", reasoning: "System running in fallback mode. Please consult a doctor if symptoms persist." };
        }
    }

    async getPharmacySuggestions(query, profile) {
        try {
            const profileContext = this.getProfileContext(profile);
            const userPrompt = `Provide 3 Indian Generic Medicine alternatives for: "${query}". ${profileContext}
            Return JSON: { "diagnosis": string, "medicines": [{ "name", "genericName", "type", "dosage", "price", "genericPrice", "explanation" }] }`;

            const response = await fetch('/api/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: userPrompt,
                    config: { temperature: 0.3, responseMimeType: "application/json" }
                })
            });

            if (response.ok) {
                const data = await response.json();
                return JSON.parse(data.text);
            }
            return MOCK_PHARMACY;
        } catch (e) {
            return MOCK_PHARMACY;
        }
    }

    async getTherapyResponse(userText, profile, language = 'en') {
        try {
            const profileContext = this.getProfileContext(profile);
            const response = await fetch('/api/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: `User: "${userText}". ${profileContext}. You are Dr. Anviksha, a clinical psychologist. Give a warm, 2-sentence response.`,
                    config: { temperature: 0.7 }
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data.text;
            }
            return "I'm listening. Please tell me more about how you're feeling.";
        } catch (e) {
            return "Connection to clinical desk interrupted. I am still here for you.";
        }
    }

    async sendChatMessage(text, imageFile, profile, language = 'en') {
        if (imageFile) {
            const res = await this.analyzeImage(imageFile, 'GENERAL', profile, language);
            if (res.isInvalid) return res.description;
            return `Observation: ${res.condition}. ${res.reasoningPath?.join(' ') || ''} Recommended: ${res.treatment}`;
        }
        return await this.getTherapyResponse(text, profile, language);
    }

    logReasoning(modality, path) {
        this.auditLog.push({ timestamp: new Date().toISOString(), modality, path });
    }

    getLocalFallback(modality) {
        return {
            condition: "Awaiting Sync",
            description: "Connection to Anviksha Core interrupted.",
            treatment: "Consult a clinician immediately for urgent matters.",
            isEmergency: false
        };
    }
}
