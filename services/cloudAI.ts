import { analyzeXRay } from './geminiService';
import type { AnalysisResult } from '../types';

class CloudAI {
    async analyzeImage(imageFile: File) {
        try {
            console.log('Sending image to cloud AI (Gemini)...');
            // analyzeXRay returns a partial AnalysisResult
            const result: Omit<AnalysisResult, 'id'|'date'> = await analyzeXRay(imageFile);
            
            // Adapt the result to be more consistent with onDeviceAI's output
            return {
                ...result,
                condition: result.condition || 'ANALYSIS_FAILED',
                confidence: result.confidence, // Gemini already returns 0-100
                emergency: result.isEmergency,
                cost: 150, // Match the display cost
                aiMode: 'cloud',
                processingTime: null, // Gemini API doesn't provide this
                server: 'Google Cloud',
                modelUsed: 'Gemini 2.5 Pro'
            };
        } catch (error) {
            console.error('❌ Cloud AI (Gemini) analysis failed:', error);
            if (error instanceof Error) {
                throw new Error(`Cloud AI service error: ${error.message}`);
            }
            throw new Error(`Cloud AI service error: An unknown error occurred.`);
        }
    }

    async healthCheck() {
        // Assume cloud is healthy if online
        return { status: 'healthy', timestamp: new Date().toISOString() };
    }
}

export default CloudAI;
