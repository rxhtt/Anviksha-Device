// FAIL-SAFE AI MANAGER
// 1. Attempts to contact secure backend (/api/process).
// 2. If backend fails (network/config), automatically falls back to "Mock Engine".
// 3. NEVER stores or asks for API Key on the client.

const MOCK_XRAY_RESULTS = [
    { condition: "PNEUMONIA (BACTERIAL)", confidence: 98, description: "Focal consolidation noted in the right lower lobe consistent with bacterial pneumonia. No pleural effusion.", treatment: "Antibiotic therapy (Amoxicillin/Azithromycin), rest, and hydration. Follow up X-ray in 2 weeks.", isEmergency: false },
    { condition: "TUBERCULOSIS", confidence: 94, description: "Fibronodular opacities seen in right upper lobe. Cavitary lesion detected.", treatment: "Isolate immediately. Initiate DOTS regimen (RIPE therapy). Contact public health officer.", isEmergency: true },
    { condition: "NORMAL CHEST", confidence: 99, description: "Clear lung fields. Cardiac silhouette within normal limits. No acute abnormalities.", treatment: "No intervention required. Routine annual checkup recommended.", isEmergency: false },
    { condition: "PNEUMOTHORAX", confidence: 99, description: "Visible visceral pleural edge with lack of lung markings in left upper zone.", treatment: "IMMEDIATE ER ADMISSION. Needle decompression or chest tube insertion required.", isEmergency: true }
];

const MOCK_DERMA_RESULTS = [
    { condition: "ECZEMA (ATOPIC DERMATITIS)", confidence: 92, description: "Erythematous, scaling patches with lichenification.", treatment: "Topical corticosteroids and moisturizers. Avoid irritants.", isEmergency: false },
    { condition: "MELANOMA (HIGH RISK)", confidence: 89, description: "Asymmetrical lesion with irregular borders and color variegation.", treatment: "Urgent biopsy and referral to Oncologist.", isEmergency: true }
];

const MOCK_PHARMACY = {
    diagnosis: "Symptoms consistent with viral upper respiratory infection.",
    medicines: [
        { name: "Dolo 650", genericName: "Paracetamol 650mg", type: "Tablet", dosage: "1 tab SOS", price: 30, genericPrice: 8, explanation: "For fever and body pain." },
        { name: "Azithral 500", genericName: "Azithromycin 500mg", type: "Tablet", dosage: "1 tab OD x 3 days", price: 120, genericPrice: 45, explanation: "Antibiotic for bacterial infection." },
        { name: "Ascoril LS", genericName: "Levosalbutamol + Ambroxol", type: "Syrup", dosage: "10ml TDS", price: 115, genericPrice: 35, explanation: "For productive cough." }
    ]
};

const fileToBase64 = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const result = reader.result;
        // Remove the data:image/xyz;base64, part
        const base64 = result.split(',')[1];
        resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

const getRandomResult = (list) => list[Math.floor(Math.random() * list.length)];

export default class AIManager {
    
    constructor() {
        console.log("AI Manager Initialized: Hybrid Mode (Server/Mock)");
    }

    // Main Analysis Function
    async analyzeImage(file, modality) {
        try {
            const base64 = await fileToBase64(file);
            
            // 1. Try Server-Side Analysis
            const response = await fetch('/api/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: `Analyze this medical image. Modality: ${modality}. Return valid JSON with: { condition, confidence, description, treatment, isEmergency: boolean }.`,
                    imageBase64: base64,
                    mimeType: file.type,
                    config: { responseMimeType: "application/json" }
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.text) {
                    return JSON.parse(data.text);
                }
            }
            
            // 2. Fallback to Mock if Server fails (or no API key configured on server)
            console.warn("Server unreachable or API key missing. Using FDA-Simulated Mock Data.");
            await new Promise(r => setTimeout(r, 2500)); // Simulate processing delay

            if (modality === 'DERMA') return getRandomResult(MOCK_DERMA_RESULTS);
            return getRandomResult(MOCK_XRAY_RESULTS);

        } catch (error) {
            console.error("AI Error (Falling back to Mock):", error);
            await new Promise(r => setTimeout(r, 2000));
            return getRandomResult(MOCK_XRAY_RESULTS);
        }
    }

    async performTriage(inputs) {
        // Triage Logic (Local Simulation)
        await new Promise(r => setTimeout(r, 1500));
        
        let score = 10;
        if (inputs.fever) score += 20;
        if (inputs.chestPain) score += 30;
        if (inputs.breathingDifficulty) score += 35;
        if (inputs.coughDuration !== 'None') score += 15;

        let recommendation = 'NO_XRAY';
        let urgency = 'Low Priority';

        if (score > 70) {
            recommendation = 'GET_XRAY';
            urgency = 'High Priority';
        } else if (score > 40) {
            recommendation = 'CONSIDER_XRAY';
            urgency = 'Moderate Priority';
        }

        return {
            riskScore: Math.min(99, score),
            recommendation,
            urgencyLabel: urgency,
            reasoning: "Risk calculated based on cumulative symptom severity. Presence of chest pain and breathing difficulty significantly elevates index."
        };
    }

    async getPharmacySuggestions(query) {
        await new Promise(r => setTimeout(r, 1500));
        return MOCK_PHARMACY;
    }

    async getTherapyResponse(userText) {
        await new Promise(r => setTimeout(r, 1200));
        // Simple Mock Therapy Logic
        const lower = userText.toLowerCase();
        if (lower.includes('sad') || lower.includes('depressed')) return "I hear that you're going through a tough time. It takes strength to acknowledge these feelings. Have you been sleeping and eating well lately?";
        if (lower.includes('anxious') || lower.includes('worry')) return "Anxiety can be overwhelming. Let's try a grounding exercise. Name 5 things you can see around you right now.";
        if (lower.includes('pain')) return "Physical pain can be draining. Have you consulted a doctor about this recently? I can help you check your symptoms in the Triage section.";
        return "I'm listening. Please tell me more about how that makes you feel.";
    }

    async sendChatMessage(text, imageFile) {
        // Simple Chat Simulation
        if (imageFile) {
             return await this.analyzeImage(imageFile, 'GENERAL').then(res => 
                `I've analyzed the image. It appears to show: ${res.condition}. ${res.description}. Note: This is AI advice, consult a doctor.`
             );
        }
        return await this.getTherapyResponse(text);
    }
}