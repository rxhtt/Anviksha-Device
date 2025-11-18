
export type Screen = 'welcome' | 'triage' | 'triage-results' | 'camera' | 'analysis' | 'results' | 'records' | 'details' | 'settings';

// Fix: Added the missing ApiKeyStatus type to resolve an import error.
export type ApiKeyStatus = 'not_configured' | 'untested' | 'testing' | 'valid' | 'invalid';

export interface AnalysisResult {
  id: string;
  date: string;
  condition: string;
  confidence: number;
  description: string;
  details?: string;
  treatment: string;
  isEmergency: boolean;
  modelVersion?: string;
  modelUsed?: string;
  cost?: number;
}

export interface TriageInputs {
  coughDuration: string;
  fever: boolean;
  chestPain: boolean;
  breathingDifficulty: boolean;
  sputum: boolean;
  weightLoss: boolean;
  visualObservation?: File | null; // Photo of the patient/chest for visual distress signs
}

export interface TriageResult {
  riskScore: number; // 0-100
  recommendation: 'GET_XRAY' | 'CONSIDER_XRAY' | 'NO_XRAY';
  reasoning: string;
  urgencyLabel: string;
}
