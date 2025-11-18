import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';

// FIX: Per coding guidelines, API key must be sourced exclusively from process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const analyzeXRay = async (imageFile: File): Promise<AnalysisResult> => {
  try {
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

    const response = await ai.models.generateContent({
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
    const result = JSON.parse(jsonText);
    
    return result as AnalysisResult;
    
  } catch (error) {
    console.error('Error analyzing X-ray with Gemini API:', error);
    throw new Error('Failed to get analysis from AI service.');
  }
};