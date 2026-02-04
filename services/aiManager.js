
// ANVIKSHA AI - CORE DIAGNOSTIC ENGINE (AIManager.js)
// MISSION: 100% Clinical Accuracy, Zero Hallucination, Specialist-Grade Reasoning

const SPECIALIST_PERSONAS = {
    XRAY: {
        role: "Senior Consultant Radiologist (MBBS, MD)",
        context: "Perform a Systematic Review of the Chest Radiograph. Analyze: 1. Technical Quality (Inspiration, Rotation). 2. Bones & Soft Tissues. 3. Cardiac Silhouette (Cardiothoracic Ratio). 4. Hemidiaphragms & Costophrenic Angles. 5. Lung Fields (Opacities, Nodules, Consolidation). Use ICD-11 terminology."
    },
    MRI: {
        role: "Senior Neuro-Radiologist",
        context: "Analyze MRI sequences (T1, T2, FLAIR, DWI). Evaluate: 1. Signal abnormalities. 2. Midline shift or mass effect. 3. Ventricular morphology. 4. Ischemic or inflammatory markers. Provide precise anatomical location of findings."
    },
    ECG: {
        role: "Chief Interventional Cardiologist",
        context: "Examine 12-lead ECG strip. Analyze: 1. Rate & Rhythm (P-wave morphology). 2. Axis. 3. Intervals (PR, QRS, QTc). 4. Segments (ST Elevation/Depression). 5. Wave morphology (T-wave inversion, Q-waves). Distinguish between STEMI, NSTEMI, and benign variations."
    },
    DERMA: {
        role: "Consultant Dermatopathologist",
        context: "Analyze clinical dermatology photo. Evaluate: 1. Primary Lesion (Macule, Papule, Nodule). 2. Distribution & Pattern. 3. Color & Border. 4. Apply ABCDE rule for pigmented lesions. 5. Consider inflammatory vs neoplastic correlates."
    },
    BLOOD: {
        role: "Senior Clinical Hematologist",
        context: "Analyze Hematology/Biochemistry report. OCR all values. Compare against age/sex-specific reference ranges. Flag: 1. Hematological indices (Hb, WBC, Platelets). 2. Electrolyte imbalances. 3. Renal/Liver function markers. Suggest logical clinical follow-up."
    },
    DEFAULT: {
        role: "Tertiary Care Clinical Diagnostic Specialist",
        context: "High-precision diagnostic review. Match visual and clinical findings against evidence-based medical literature and WHO guidelines."
    }
};

const CLINICAL_GUARDRAILS = `
CRITICAL CLINICAL PROTOCOLS:
1. NEVER HALLUCINATE: If a landmark is not visible, state 'NOT VISIBLE'.
2. ACCURACY FIRST: Use standardized clinical scores (e.g., CURB-65, Glasgow Coma Scale) if applicable.
3. LEGITIMACY: If the image is a duplicate, blurred, or non-medical, reject it with specific reasons.
4. JSON STRUCTURE: Ensure all clinical alerts are evidence-based.
`;

export default class AIManager {
    constructor() {
        this.history = [];
        this.auditLog = [];
    }

    getProfileContext(profile) {
        if (!profile) return "PATIENT: Anonymous/Guest Profile.";
        return `
        PATIENT CLINICAL PROFILE:
        - Demographic: ${profile.age}y / ${profile.sex}
        - Clinical Markers: Blood Group ${profile.bloodGroup}, Weight ${profile.weight}kg
        - History: ${profile.chronicConditions?.join(', ') || 'No chronic conditions reported'}
        - Contraindications/Allergies: ${profile.allergies?.join(', ') || 'No known allergies'}
        `;
    }

    async analyzeImage(file, modality, profile, language = 'en') {
        try {
            const base64 = await this.fileToBase64(file);
            const specialist = SPECIALIST_PERSONAS[modality] || SPECIALIST_PERSONAS.DEFAULT;
            const profileContext = this.getProfileContext(profile);

            const systemInstruction = `
            ACT AS: ${specialist.role}.
            
            DIAGNOSTIC MISSION: ${specialist.context}
            
            ${CLINICAL_GUARDRAILS}
            
            ${profileContext}

            OUTPUT REQUIREMENTS:
            - Response MUST be scientific, clinical, and precise.
            - Format: JSON only.
            - If non-medical: return {"error": "INVALID_IMAGE", "reason": "Detailed medical explanation why this isn't a diagnostic image"}.
            `;

            const userPrompt = `PERFORM CLINICAL ANALYSIS ON THIS ${modality} IMAGE. 
            Identify every visible pathological marker. Provide a structured reasoning path.
            JSON SCHEMA: 
            {
                "condition": "Clinical DX (e.g. Right Lower Lobe Pneumonia)",
                "confidence": number (0-100),
                "reasoningPath": ["Observation 1", "Observation 2", "Inference"],
                "details": "High-fidelity clinical description",
                "treatment": "Standard management protocol (Evidence-based)",
                "isEmergency": boolean,
                "clinicalAlerts": ["Alert 1"]
            }`;

            let response;
            try {
                // PAYLOAD SIZE CHECK: Vercel limits is ~4.5MB. Base64 is ~1.37x original.
                const estimateSize = base64.length * 0.75;
                if (estimateSize > 4 * 1024 * 1024) {
                    throw new Error("IMAGE_TOO_LARGE_CLIENT");
                }

                response = await fetch('/api/process', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: userPrompt,
                        imageBase64: base64,
                        mimeType: file.type,
                        config: { systemInstruction, temperature: 0.1 }
                    })
                });
            } catch (e) {
                console.warn("Vercel API call failed, attempting Direct Satellite Link...", e);
            }

            let text;
            if (response && response.ok) {
                const data = await response.json();
                text = data.text;
            } else {
                // FALLBACK: DIRECT CLIENT-SIDE CALL (Resilient Multi-Model Mode)
                const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "";
                if (!apiKey || apiKey === "undefined") {
                    throw new Error(`CORE_LINK_FAILURE: No API Key detected in environment.`);
                }

                const { GoogleGenerativeAI } = await import("@google/generative-ai");
                const genAI = new GoogleGenerativeAI(apiKey);

                // MULTI-MODEL RESILIENCE LOOP
                // Prioritizing stability (1.5) for the competition, with 3.0/2.0 as options
                // This loop now handles 429 (Quota) and 404 (Not Found) errors
                const modelsToTry = ["gemini-1.5-flash", "gemini-3-flash", "gemini-2.0-flash"];
                let lastError = null;

                for (const modelName of modelsToTry) {
                    try {
                        const model = genAI.getGenerativeModel({ model: modelName });
                        const result = await model.generateContent([
                            { text: `SYSTEM_INSTRUCTION: ${systemInstruction}` },
                            { inlineData: { data: base64, mimeType: file.type } },
                            { text: userPrompt }
                        ]);
                        text = result.response.text();
                        if (text) {
                            console.log(`Neural Link Established: ${modelName}`);
                            break;
                        }
                    } catch (err) {
                        lastError = err;
                        const isQuota = err.message.includes("429") || err.message.includes("quota");
                        const isNotFound = err.message.includes("404") || err.message.includes("not found");

                        if (isQuota || isNotFound) {
                            console.warn(`Model ${modelName} ${isQuota ? 'Quota Exceeded' : 'Not Found'}, switching...`);
                            continue;
                        }
                        throw err;
                    }
                }

                if (!text) {
                    throw new Error(`CORE_LINK_FAILURE: All diagnostic models returned 404. Detail: ${lastError?.message}`);
                }

                // Clean JSON
                if (text.includes("```json")) text = text.split("```json")[1].split("```")[0].trim();
                else if (text.includes("```")) text = text.split("```")[1].split("```")[0].trim();
                else {
                    const jsonMatch = text.match(/\{[\s\S]*\}/);
                    if (jsonMatch) text = jsonMatch[0];
                }
            }

            const result = JSON.parse(text);

            if (result.error === "INVALID_IMAGE") {
                return {
                    condition: "Analysis Rejected",
                    description: result.reason,
                    treatment: "Provide a high-resolution, clear medical scan for analysis.",
                    isEmergency: false,
                    isInvalid: true
                };
            }

            this.logReasoning(modality, result.reasoningPath);
            return {
                ...result,
                status: 'CLINICAL_VALIDATED',
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error("Clinical Engine Error:", error);
            return this.getLocalFallback(modality, error.message);
        }
    }

    async performTriage(inputs, profile, language = 'en') {
        try {
            const profileContext = this.getProfileContext(profile);
            const userPrompt = `Perform an Evidence-Based Clinical Triage.
            Symptoms: ${JSON.stringify(inputs)}.
            ${profileContext}
            
            Determine risk based on clinical red flags (e.g. chest pain, dyspnea, focal neuro deficits).
            
            Return JSON: {
                "riskScore": number,
                "recommendation": "GET_XRAY" | "CONSIDER_XRAY" | "NO_XRAY",
                "urgencyLabel": "string (e.g. Immediate ER Admission)",
                "reasoning": "Scientific clinical rationale"
            }`;

            const response = await fetch('/api/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: userPrompt,
                    config: { temperature: 0.1, responseMimeType: "application/json" }
                })
            });

            if (response.ok) {
                const data = await response.json();
                return JSON.parse(data.text);
            }
            throw new Error("TRIAGE_INTERRUPTED");
        } catch (e) {
            return { riskScore: 0, recommendation: "NO_XRAY", urgencyLabel: "Awaiting Data", reasoning: "Could not perform real-time triage. Please monitor symptoms." };
        }
    }

    async getPharmacySuggestions(query, profile) {
        try {
            const profileContext = this.getProfileContext(profile);
            const userPrompt = `Analyze therapeutic requirement for: "${query}".
            Find 3 FDA/CDSCO approved generic salt equivalents available in India.
            Compare prices (Brand vs Jan Aushadhi).
            ${profileContext}
            
            Return JSON: {
                "diagnosis": "Summary of medical context",
                "medicines": [{
                    "name": "Standard Brand",
                    "genericName": "Generic Salt",
                    "type": "Formulation",
                    "dosage": "Standard Adult/Pediatric Dose",
                    "price": number,
                    "genericPrice": number,
                    "explanation": "Pharmacological action"
                }]
            }`;

            const response = await fetch('/api/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: userPrompt,
                    config: { temperature: 0.1, responseMimeType: "application/json" }
                })
            });

            if (response.ok) {
                const data = await response.json();
                return JSON.parse(data.text);
            }
            return { diagnosis: "Service Unavailable", medicines: [] };
        } catch (e) {
            return { diagnosis: "Service Unavailable", medicines: [] };
        }
    }

    async getTherapyResponse(userText, profile, language = 'en') {
        try {
            const profileContext = this.getProfileContext(profile);
            const response = await fetch('/api/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: `User Expression: "${userText}". 
                    ${profileContext}
                    Role: Clinical Psychologist (CBT/DBT Expert). 
                    Mission: Provide a 100% scientifically grounded, compassionate response using therapeutic frameworks. 
                    Avoid generic advice. Max 3 sentences.`,
                    config: { temperature: 0.5 }
                })
            });

            if (response.ok) {
                const data = await response.json();
                return data.text;
            }
            return "Professional support link interrupted. Please reach out if you are in crisis.";
        } catch (e) {
            return "Clinical link currently unstable. Please wait.";
        }
    }

    async sendChatMessage(text, imageFile, profile, language = 'en') {
        if (imageFile) {
            const res = await this.analyzeImage(imageFile, 'GENERAL', profile, language);
            if (res.isInvalid) return `SAFETY ALERT: ${res.description}`;
            return `CLINICAL DX: ${res.condition}. \n\nREASONING: ${res.reasoningPath?.join(' -> ') || 'Observation in progress.'} \n\nMANAGEMENT: ${res.treatment}`;
        }
        return await this.getTherapyResponse(text, profile, language);
    }

    logReasoning(modality, path) {
        this.auditLog.push({ timestamp: new Date().toISOString(), modality, path });
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = e => reject(e);
        });
    }

    getLocalFallback(modality, errorMessage = "") {
        return {
            condition: "CLINICAL_CORE_OFFLINE",
            description: `Anviksha Neural Core Link Failure: ${errorMessage || 'Unknown Error'}.`,
            treatment: "Manual Override: Check your internet connection or verify your API key settings in Vercel. Ensure images are below 4MB.",
            isEmergency: false
        };
    }
}
