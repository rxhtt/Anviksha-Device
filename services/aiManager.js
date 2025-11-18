// aiManager.js - Manages cloud-based AI analysis via Gemini
import CloudAI from './cloudAI.ts';

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
                aiMode: 'none',
                error: 'Device is offline.',
            };
        }

        try {
            const startTime = performance.now();
            const result = await this.cloudAI.analyzeImage(imageFile);
            const processingTime = (performance.now() - startTime) / 1000;

            return {
                ...result,
                processingTime: `${processingTime.toFixed(1)}s`,
                usedMode: 'cloud',
            };
        } catch (error) {
            console.error('❌ AI analysis failed:', error);
            return {
                condition: 'ANALYSIS_FAILED',
                description: error.message || 'The AI service could not process the image. Please try again.',
                isEmergency: true,
                aiMode: 'none',
                error: error.message,
            };
        }
    }
    
    /**
     * Initializes the AI Manager. This is now a lightweight setup.
     */
    async initialize() {
        console.log('Initializing AI Manager (Cloud-only mode)...');
        return this.getStatus();
    }

    /**
     * Gets the current status of AI services.
     */
    getStatus() {
        return {
            onDevice: {
                available: false,
                status: 'not_supported'
            },
            cloud: {
                available: navigator.onLine,
                status: navigator.onLine ? 'connected' : 'offline'
            },
        };
    }
}

export default AIManager;
