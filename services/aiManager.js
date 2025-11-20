


const fileToBase64 = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Handle both Data URLs (base64) for images and generic files
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to read file as data URL.'));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

const getPromptForModality = (modality) => {
    const baseStructure = `
    You are a Senior Chief Medical Officer AI.
    Your output must be extremely accurate, using professional medical terminology (ICD-10 codes where relevant).
    Output MUST be strict JSON with no markdown formatting.
    Keys: 'condition' (ALL CAPS string), 'confidence' (0-100 int), 'description' (clinical summary), 'details' (detailed findings), 'treatment' (clinical recommendation), 'isEmergency' (boolean).
    `;

    switch (modality) {
        case 'ECG':
            return `
            You are an expert Cardiologist. Analyze this ECG/EKG strip with high precision. 
            1. Identify rhythm (Sinus, Afib, VTach, STEMI, NSTEMI).
            2. Measure intervals (PR, QRS, QT). Look for ST elevation/depression.
            3. Detect ischemia, infarction, or hypertrophy.
            ${baseStructure}
            `;
        case 'BLOOD':
        case 'GENETIC':
            return `
            You are an expert Hematologist and Pathologist. Analyze this Lab Report (Image or PDF).
            1. OCR the text. Identify CBC, Metabolic Panel, Lipid, or Genetic markers.
            2. Flag values outside reference ranges as 'Abnormal' or 'Critical'.
            3. Correlate abnormal values to specific differential diagnoses.
            ${baseStructure}
            `;
        case 'MRI':
        case 'CT':
        case 'NEURO':
            return `
            You are an expert Neuroradiologist. Analyze this Scan (MRI/CT).
            1. Identify anatomical structures. Look for masses, hemorrhage, ischemia, or edema.
            2. For Brain: Check midline shift, ventricles, and sulci.
            3. For Spine: Check alignment, discs, and spinal cord compression.
            ${baseStructure}
            `;
        case 'DERMA':
             return `
            You are an expert Dermatologist. Analyze this skin lesion.
            1. Apply ABCD rule (Asymmetry, Border, Color, Diameter).
            2. Distinguish between benign (nevus, seborrheic) and malignant (melanoma, carcinoma).
            3. Assess for inflammatory conditions (Eczema, Psoriasis).
            ${baseStructure}
            `;
        case 'DENTAL':
            return `
            You are an expert Dentist/Oral Surgeon. Analyze this X-ray or Intraoral photo.
            1. Identify cavities (caries), impacted wisdom teeth, periodontitis, or abscesses.
            2. Check bone levels and root health.
            ${baseStructure}
            `;
        case 'OPHTHAL':
            return `
            You are an expert Ophthalmologist. Analyze this retinal scan or eye photo.
            1. Look for diabetic retinopathy, glaucoma (cup-to-disc ratio), or cataracts.
            2. Assess vascular health in fundus images.
            ${baseStructure}
            `;
        case 'ENT':
            return `
            You are an Otolaryngologist. Analyze this Otoscope/Throat image.
            1. Check tympanic membrane for infection/perforation.
            2. Check tonsils for hypertrophy or exudate.
            ${baseStructure}
            `;
        case 'PEDIATRIC':
            return `
            You are a Senior Pediatrician. Analyze this image regarding a child.
            1. Assess growth indicators or visible symptoms (rash, deformity).
            2. Provide age-appropriate differentials.
            ${baseStructure}
            `;
        case 'ORTHO':
            return `
            You are an Orthopedic Surgeon. Analyze this Bone X-Ray/MRI.
            1. Identify fractures (type: comminuted, hairline, etc.), dislocations, or arthritis.
            2. Check joint space and alignment.
            ${baseStructure}
            `;
        case 'GASTRO':
            return `
            You are a Gastroenterologist. Analyze this Endoscopy/Colonoscopy frame or abdominal scan.
            1. Identify polyps, ulcers, inflammation, or masses.
            ${baseStructure}
            `;
        case 'GYNE':
        case 'PREGNANCY':
            return `
            You are an OB/GYN specialist. Analyze this Ultrasound or visual data.
            1. For Fetal US: Check gestational sac, fetal pole, heartbeat.
            2. For Gyne: Check ovaries, uterus for cysts/fibroids.
            ${baseStructure}
            `;
        case 'PATHOLOGY':
            return `
            You are a Pathologist. Analyze this Histology slide.
            1. Identify cell types, architecture, and nuclear atypia.
            2. Grade malignancy if applicable.
            ${baseStructure}
            `;
        case 'XRAY':
        default:
            return `
            You are an expert Radiologist. Analyze this Chest X-Ray with high precision.
            1. Check lungs for consolidation (Pneumonia), nodules, masses, or infiltrates (TB).
            2. Assess cardiac silhouette size and mediastinum.
            3. Check diaphragm and costophrenic angles for effusion.
            ${baseStructure}
            `;
    }
};

class AIManager {
    constructor() {
        // API Key is now managed on the server side
    }

    async _callProxyServer(payload) {
        try {
            const response = await fetch('/api/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `Server error: ${response.status}`);
            }
            
            const data = await response.json();
            return data.text; 
        } catch (error) {
            console.error("AI Service Error:", error);
            throw error;
        }
    }

    // Helper to ensure JSON is clean (removes markdown code blocks if present)
    _cleanJson(text) {
        if (!text) return "{}";
        let clean = text.trim();
        if (clean.startsWith('```')) {
            clean = clean.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
        }
        return clean;
    }

    async performTriage(triageInputs) {
        let imageBase64 = null;
        let mimeType = null;

        if (triageInputs.visualObservation) {
            imageBase64 = await fileToBase64(triageInputs.visualObservation);
            mimeType = triageInputs.visualObservation.type;
        }

        const prompt = `
        Patient Symptoms:
        - Cough: ${triageInputs.coughDuration}, Fever: ${triageInputs.fever}, Chest Pain: ${triageInputs.chestPain}
        - Breathing Diff: ${triageInputs.breathingDifficulty}, Sputum: ${triageInputs.sputum}, Weight Loss: ${triageInputs.weightLoss}
        
        You are a Senior Triage Nurse AI. Calculate a Risk Score (0-100) based on these symptoms and visual cues.
        Output STRICT JSON: { "riskScore": number, "recommendation": "GET_XRAY" | "CONSIDER_XRAY" | "NO_XRAY", "reasoning": "string", "urgencyLabel": "string" }
        `;

        const resultText = await this._callProxyServer({
            model: 'gemini-2.5-flash',
            prompt: prompt,
            imageBase64: imageBase64,
            mimeType: mimeType,
            config: { responseMimeType: "application/json" }
        });

        return JSON.parse(this._cleanJson(resultText));
    }

    async analyzeImage(file, modality = 'XRAY') {
        if (!navigator.onLine) throw new Error('Internet connection required.');
        
        const imageBase64 = await fileToBase64(file);
        const prompt = getPromptForModality(modality);

        const resultText = await this._callProxyServer({
            model: 'gemini-2.5-flash',
            prompt: prompt,
            imageBase64: imageBase64,
            mimeType: file.type, // Support image/jpeg, image/png, application/pdf
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        condition: { type: "STRING" },
                        confidence: { type: "INTEGER" },
                        description: { type: "STRING" },
                        details: { type: "STRING" },
                        treatment: { type: "STRING" },
                        isEmergency: { type: "BOOLEAN" }
                    },
                    required: ["condition", "confidence", "description", "details", "treatment", "isEmergency"],
                },
            }
        });

        const result = JSON.parse(this._cleanJson(resultText));
        return {
            ...result,
            modality,
            modelUsed: 'Gemini 2.5 Flash',
            cost: modality === 'MRI' || modality === 'CT' ? 250 : 150,
        };
    }

    async sendChatMessage(message, imageFile = null) {
        let imageBase64 = null;
        let mimeType = null;
        
        if (imageFile) {
            imageBase64 = await fileToBase64(imageFile);
            mimeType = imageFile.type;
        }

        const prompt = `You are Anviksha AI, a Highly Advanced Medical Intelligence System.
        Your goal is to provide accurate, scientifically-backed medical information.
        Rules:
        1. Be authoritative and professional.
        2. Use medical terminology but explain it simply.
        3. If analyzing an image, be extremely detailed.
        4. Be helpful and direct.
        
        User Question: ${message}`;

        return await this._callProxyServer({
            model: 'gemini-2.5-flash',
            prompt: prompt,
            imageBase64: imageBase64,
            mimeType: mimeType
        });
    }

    async getPharmacySuggestions(symptoms) {
        const prompt = `
        You are an expert Pharmacist in India with deep knowledge of generic medicines (Jan Aushadhi) and rural availability.
        The user is describing symptoms: "${symptoms}".
        
        Your Task:
        1. Recommend the most effective medicines available in Tier-2 and Tier-3 cities in India.
        2. **CRITICAL**: For every branded medicine (e.g., Crocin, Dolo), you MUST provide the exact **Jan Aushadhi / Generic equivalent**.
        3. Provide realistic, current MRP (Market Price) in INR.
        4. Prioritize affordable, widely available options.
        
        Output Strict JSON format:
        {
          "diagnosis": "Brief assessment",
          "medicines": [
            {
              "name": "Brand Name (e.g., Dolo 650)",
              "genericName": "Chemical Name (e.g., Paracetamol 650mg)",
              "type": "Tablet/Syrup/Ointment",
              "dosage": "e.g., 1 tab post meals",
              "price": 30 (estimated brand price INR),
              "genericPrice": 5 (estimated PM Jan Aushadhi price INR),
              "explanation": "Why this medicine is needed"
            }
          ]
        }
        `;

        const resultText = await this._callProxyServer({
            model: 'gemini-2.5-flash',
            prompt: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        return JSON.parse(this._cleanJson(resultText));
    }

    async getTherapyResponse(message) {
        const prompt = `
        You are Dr. Anviksha, a Doctorate-level Clinical Psychologist and Therapist with 30 years of experience. 
        
        User Message: "${message}"
        
        Your Goal: Provide the best possible therapeutic response, surpassing a human doctorate.
        
        Instructions:
        1. **Adapt to User's Tone**: If they are sad, be empathetic and gentle. If they are angry, be calm and de-escalating. If they are casual, be friendly but professional.
        2. **Deep Insight**: Do not just give generic advice. Analyze the underlying emotion and offer a profound perspective or a coping mechanism (CBT/DBT techniques).
        3. **Conciseness**: Be impactful but not overly wordy.
        4. **Safety**: If the user expresses self-harm, immediately provide helpline resources politely but firmly.

        Output only the response text.
        `;

        return await this._callProxyServer({
            model: 'gemini-2.5-flash',
            prompt: prompt
        });
    }
}

export default AIManager;
