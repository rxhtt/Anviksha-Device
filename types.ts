export type Screen = 'welcome' | 'camera' | 'analysis' | 'results' | 'records' | 'details';

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
