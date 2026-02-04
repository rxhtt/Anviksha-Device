
export type Screen = 'welcome' | 'hub' | 'triage' | 'triage-results' | 'camera' | 'analysis' | 'results' | 'records' | 'details' | 'settings' | 'chat' | 'pharmacy' | 'therapy';

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

export interface Medicine {
    name: string;
    genericName: string;
    dosageSchedule: string; // e.g. "1-0-1"
    timing: string; // e.g. "After food"
    duration: string; // e.g. "5 days"
    genericPrice: number;
    laymanExplanation: string;
    expertNote: string;
    contraindications: string;
    marketAvailability: string; // Information on Tier 2/3 availability in India
}

export interface PharmacyResult {
    diagnosisSummary: string;
    medicines: Medicine[];
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
