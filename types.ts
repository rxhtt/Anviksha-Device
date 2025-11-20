
export type Screen = 'welcome' | 'hub' | 'triage' | 'triage-results' | 'camera' | 'analysis' | 'results' | 'records' | 'details' | 'settings' | 'chat' | 'pharmacy' | 'therapy';

export type ApiKeyStatus = 'not_configured' | 'untested' | 'testing' | 'valid' | 'invalid';

export type Modality = 
  | 'XRAY' | 'ECG' | 'BLOOD' | 'MRI' | 'CT' | 'DERMA' | 'GENERAL'
  | 'DENTAL' | 'OPHTHAL' | 'ENT' | 'PEDIATRIC' | 'GYNE' | 'ORTHO' 
  | 'UROLOGY' | 'GASTRO' | 'NEURO' | 'ONCO' | 'PATHOLOGY' | 'GENETIC'
  | 'VITALS' | 'DIET' | 'MENTAL' | 'SLEEP' | 'PREGNANCY' | 'VACCINE';

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
  riskScore: number;
  recommendation: 'GET_XRAY' | 'CONSIDER_XRAY' | 'NO_XRAY';
  reasoning: string;
  urgencyLabel: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  image?: string;
  timestamp: number;
}

export interface ChatSession {
    id: string;
    title: string;
    messages: ChatMessage[];
    timestamp: number;
}

export interface Medicine {
    name: string;
    genericName: string;
    type: string;
    dosage: string;
    price: number;
    genericPrice: number;
    explanation: string;
}

export interface PharmacyResult {
    diagnosis: string;
    medicines: Medicine[];
}
