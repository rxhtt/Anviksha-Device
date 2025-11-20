
export type Screen = 'welcome' | 'hub' | 'triage' | 'triage-results' | 'camera' | 'analysis' | 'results' | 'records' | 'details' | 'settings';

export type ApiKeyStatus = 'not_configured' | 'untested' | 'testing' | 'valid' | 'invalid';

export type Modality = 'XRAY' | 'ECG' | 'BLOOD' | 'MRI' | 'CT' | 'DERMA' | 'GENERAL';

export interface AnalysisResult {
  id: string;
  date: string;
  modality: Modality;
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
  visualObservation?: File | null;
}

export interface TriageResult {
  riskScore: number; // 0-100
  recommendation: 'GET_XRAY' | 'CONSIDER_XRAY' | 'NO_XRAY';
  reasoning: string;
  urgencyLabel: string;
}
