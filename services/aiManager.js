// aiManager.js - Manages cloud-based AI analysis via Gemini
// Contains merged logic from geminiService.ts and cloudAI.ts to resolve module loading issues.

import { GoogleGenAI, Type } from "@google/genai";

// --- Start of merged geminiService.ts logic ---

let ai = null;

/**
 * Initializes and returns the GoogleGenAI client instance.
 * @returns {GoogleGenAI} The initialized AI client.
 */
const getAiClient = () => {
    if (ai) {
        return ai;
    }
    // The API key is expected to be injected by the execution environment.
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    return ai;
};

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

/**
 * Analyzes an X-ray image using the Gemini API.
 * @param {File} imageFile The X-ray image file.
 * @returns {Promise<object>} The analysis result from the API.
 */
const analyzeXRay = async (imageFile) => {
  try {
    const geminiAI = getAiClient();
    const imagePart = await fileToGenerativePart(imageFile);
    
    const prompt = `You are a specialized medical AI assistant with expertise in radiology. Your task is to analyze the provided chest X-ray image by following a rigorous, step-by-step process.

Step 1: Systematic Analysis.
Carefully examine the image for abnormalities in the lungs, heart, bones, and pleural space. Note any signs of: Consolidation, infiltrates, opacities, cavitary lesions, nodules, pleural effusion, pneumothorax, cardiomegaly, rib fractures, fibrosis, edema, masses, or other findings.

Step 2: Formulate a Diagnosis.
Based on your observations, determine the most likely primary condition from this list: Tuberculosis, Pneumonia, Atelectasis, Cardiomegaly, Effusion, Nodule/Mass, Pneumothorax, Fibrosis, Edema, Consolidation, Emphysema, Fracture, Hernia, Infiltration. If no abnormalities are found, classify it as 'Normal'.

Step 3: Justify Your Findings & Provide a Recommendation.
Explain your reasoning. What specific visual evidence supports your diagnosis? What is the recommended course of action?

Step 4: Synthesize the Final JSON Output.
Now, combine all your findings into a single JSON object. The response must be ONLY the JSON object, with no other text, explanations, or markdown formatting before or after it.

The JSON object must have these exact keys:
- 'condition': (string) The final diagnosis from the list in ALL CAPS.
- 'confidence': (number) Your confidence score from 0 to 100.
- 'description': (string) A brief, one-sentence summary of the key finding.
- 'details': (string) Your detailed analysis and justification from Step 3.
- 'treatment': (string) A general, recommended course of action.
- 'isEmergency': (boolean) True if the condition requires immediate medical attention.`;

    const response = await geminiAI.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: {
          parts: [
              imagePart,
              { text: prompt },
          ]
      },
      config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              condition: { type: Type.STRING, description: "The identified medical condition (e.g., 'PNEUMONIA')." },
              confidence: { type: Type.INTEGER, description: "Confidence level of the diagnosis from 0 to 100." },
              description: { type: Type.STRING, description: "A brief, one-sentence summary of the findings." },
              details: { type: Type.STRING, description: "A detailed paragraph explaining the findings and their implications."},
              treatment: { type: Type.STRING, description: "A recommended course of action or treatment." },
              isEmergency: { type: Type.BOOLEAN, description: "Indicates if the condition is an emergency." }
            },
            required: ["condition", "confidence", "description", "details", "treatment", "isEmergency"],
          },
      },
    });

    const jsonText = response.text.trim();
    // The Gemini API with a JSON schema might still wrap the JSON in markdown backticks.
    // This removes them for robust parsing.
    const cleanJsonText = jsonText.replace(/^```json\s*/, '').replace(/```$/, '');
    const result = JSON.parse(cleanJsonText);
    
    return result;
    
  } catch (error) {
    console.error('Error analyzing X-ray with Gemini API:', error);
    let message = 'Failed to get analysis from AI service.';
    if (error instanceof Error) {
        if(error.message.includes('API key is missing')) {
            message = 'AI Service failed: The API Key is missing or invalid. Please check your configuration.';
        } else if (error instanceof SyntaxError) {
            message = 'AI Service returned an invalid format. Could not parse the response.';
        } else {
            message = `AI Service error: ${error.message}`;
        }
    }
    throw new Error(message);
  }
};

// --- End of merged geminiService.ts logic ---


// --- Start of merged cloudAI.ts logic ---
class CloudAI {
    async analyzeImage(imageFile) {
        try {
            console.log('Sending image to cloud AI (Gemini)...');
            const result = await analyzeXRay(imageFile);
            
            return {
                ...result,
                modelUsed: 'Gemini 2.5 Pro',
                cost: 150,
            };
        } catch (error) {
            console.error('❌ Cloud AI (Gemini) analysis failed:', error);
            // Re-throw the more detailed error from analyzeXRay
            throw error;
        }
    }
}
// --- End of merged cloudAI.ts logic ---


class AIManager {
    constructor() {
        this.cloudAI = new CloudAI();
    }

    /**
     * Analyzes an image file using the cloud-based Gemini AI.
     * @param {File} imageFile The image file to analyze.
     * @returns {Promise<object>} The analysis result.
     */
    async analyzeImage(imageFile) {
        if (!navigator.onLine) {
            console.error('Offline: Cannot perform cloud analysis.');
            return {
                condition: 'ANALYSIS_UNAVAILABLE',
                description: 'An internet connection is required for AI analysis. Please connect to a network and try again.',
                isEmergency: true,
            };
        }

        try {
            return await this.cloudAI.analyzeImage(imageFile);
        } catch (error) {
            console.error('❌ AI analysis failed in AIManager:', error);
            const errorMessage = error instanceof Error ? error.message : 'The AI service could not process the image. Please try again.';
            return {
                condition: 'ANALYSIS_FAILED',
                description: errorMessage,
                isEmergency: true,
            };
        }
    }
    
    /**
     * Initializes the AI Manager. This is now a lightweight setup.
     */
    async initialize() {
        console.log('Initializing AI Manager (Cloud-only mode)...');
    }

    /**
     * Gets the current status of AI services.
     */
    getStatus() {
        return {
            cloud: {
                available: navigator.onLine,
                status: navigator.onLine ? 'connected' : 'offline'
            },
        };
    }
}

export default AIManager;