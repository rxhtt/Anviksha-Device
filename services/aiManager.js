// aiManager.js - Manages cloud-based AI analysis via Gemini
// This is the single source of truth for all AI interactions.
// Other AI service files are deprecated.

import { GoogleGenAI, Type } from "@google/genai";

let ai = null;

/**
 * Initializes and returns the GoogleGenAI client instance.
 * Throws an error if the API key is not configured.
 * @returns {GoogleGenAI} The initialized AI client.
 */
const getAiClient = () => {
    if (ai) {
        return ai;
    }
    // For Vercel deployments, environment variables must be prefixed with NEXT_PUBLIC_ to be exposed to the browser.
    if (!process.env.NEXT_PUBLIC_API_KEY) {
        throw new Error('API Key is not configured. Please set the NEXT_PUBLIC_API_KEY environment variable for your Vercel deployment.');
    }
    ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_API_KEY });
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
 * Analyzes an X-ray image using the Gemini API. Throws on failure.
 * @param {File} imageFile The X-ray image file.
 * @returns {Promise<object>} The analysis result from the API.
 */
const performCloudAnalysis = async (imageFile) => {
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
    
    return {
        ...result,
        modelUsed: 'Gemini 2.5 Pro',
        cost: 150,
    };
    
  } catch (error) {
    console.error('Error analyzing X-ray with Gemini API:', error);
    let message = 'Failed to get analysis from AI service.';
    if (error instanceof Error) {
        if(error.message.includes('API key') || error.message.includes('API Key')) {
            message = 'AI Service failed: The API Key is missing, invalid, or not correctly configured for this deployment.';
        } else if (error instanceof SyntaxError || error.message.includes('JSON')) {
            message = 'AI Service returned an invalid format. Could not parse the response.';
        } else {
            message = `AI Service error: ${error.message}`;
        }
    }
    throw new Error(message);
  }
};


/**
 * Returns a mock analysis result for demo mode.
 * @returns {Promise<object>} A promise that resolves with the mock data.
 */
const getDemoResult = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        condition: "PNEUMONIA",
        confidence: 92,
        description: "Opacity and consolidation observed in the lower lobe of the right lung, consistent with pneumonia.",
        details: "The radiograph shows significant airspace opacity in the right lower lobe. Air bronchograms are visible, which is a classic sign of alveolar filling, strongly suggesting bacterial pneumonia. The cardiac silhouette and pleural spaces appear normal. No signs of tuberculosis or pneumothorax were found.",
        treatment: "Immediate consultation with a physician is recommended. Standard treatment involves a course of antibiotics. Further testing, such as a sputum culture, may be required to identify the specific pathogen.",
        isEmergency: true,
        modelUsed: 'Demo Model',
        cost: 0,
      });
    }, 2500); // Simulate analysis time
  });
};


class AIManager {
    /**
     * Analyzes an image file. Throws an error on failure.
     * @param {File} imageFile The image file to analyze.
     * @param {boolean} isDemoMode Whether to run in demo mode.
     * @returns {Promise<object>} The analysis result.
     */
    async analyzeImage(imageFile, isDemoMode = false) {
        if (isDemoMode) {
            console.log('Running in Demo Mode...');
            return getDemoResult();
        }

        if (!navigator.onLine) {
            console.error('Offline: Cannot perform cloud analysis.');
            throw new Error('An internet connection is required for AI analysis. Please connect to a network and try again.');
        }

        // This will now throw an error on failure, which will be caught by the caller in App.tsx
        return await performCloudAnalysis(imageFile);
    }
    
    /**
     * Initializes the AI Manager.
     */
    async initialize() {
        console.log('Initializing AI Manager (Cloud-only mode)...');
    }
}

export default AIManager;