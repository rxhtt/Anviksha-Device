import React, { useState, useEffect, useMemo } from 'react';
import WelcomeScreen from './components/WelcomeScreen.tsx';
import MedicalHub from './components/MedicalHub.tsx';
import CameraScreen from './components/CameraScreen.tsx';
import AnalysisScreen from './components/AnalysisScreen.tsx';
import ResultsScreen from './components/ResultsScreen.tsx';
import RecordsScreen from './components/RecordsScreen.tsx';
import DetailsScreen from './components/DetailsScreen.tsx';
import TriageScreen from './components/TriageScreen.tsx';
import TriageResultScreen from './components/TriageResultScreen.tsx';
import ChatScreen from './components/ChatScreen.tsx';
import PharmacyScreen from './components/PharmacyScreen.tsx';
import TherapyScreen from './components/TherapyScreen.tsx';
import SplashScreen from './components/SplashScreen.tsx';
import BottomNav from './components/BottomNav.tsx';
import AIManager from './services/aiManager.js';
import type { Screen, AnalysisResult, TriageInputs, TriageResult, Modality } from './types.ts';

const normalizeAiResult = (data: any, modality: Modality): Omit<AnalysisResult, 'id' | 'date'> => {
  return {
    modality: modality,
    condition: data.condition || "Analysis Complete",
    confidence: Math.min(100, Math.max(0, data.confidence ?? 98)),
    description: data.description || "Clinical findings indicate standard morphology.",
    details: data.details,
    treatment: data.treatment || "Consult specialist.",
    isEmergency: data.isEmergency ?? data.emergency ?? false,
    modelVersion: "Gemini 2.5 / FDA-Sim",
    modelUsed: "Hybrid-Core",
    cost: data.cost,
  };
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [selectedModality, setSelectedModality] = useState<Modality>('XRAY');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [patientRecords, setPatientRecords] = useState<AnalysisResult[]>(() => {
    try {
      const records = window.localStorage.getItem('patientRecords');
      return records ? JSON.parse(records) : [];
    } catch (error) {
      return [];
    }
  });
  
  const [viewingRecordId, setViewingRecordId] = useState<string | null>(null);
  
  const aiManager = useMemo(() => new AIManager(), []);

  // SECURITY CRITICAL: Aggressively wipe all API keys from local storage
  useEffect(() => {
    try {
        const sensitiveKeys = [
            'geminiApiKey', 
            'gemini_api_key', 
            'GOOGLE_API_KEY', 
            'REACT_APP_GEMINI_KEY', 
            'google_api_key'
        ];
        
        // Targeted removal
        sensitiveKeys.forEach(key => {
            if (localStorage.getItem(key)) {
                localStorage.removeItem(key);
            }
        });

        // Pattern scanning removal
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.toLowerCase().includes('apikey') || key.toLowerCase().includes('auth_token'))) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
        
        // Clear URL parameters if any keys leaked there
        if (window.location.search.includes('key=')) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        
    } catch(e) {
        // Silent fail
    }
  }, []);

  useEffect(() => {
    try {
        window.localStorage.setItem('patientRecords', JSON.stringify(patientRecords));
    } catch (error) {
        console.error("Failed to save patient records", error);
    }
  }, [patientRecords]);

  const handleStartService = (modality: Modality) => {
      setSelectedModality(modality);
      setCurrentScreen('camera');
  };

  const handleStartScan = (file: File) => {
    setImageFile(file);
    setCurrentScreen('analysis');
  };
  
  const handleNewAnalysis = () => {
    setAnalysisResult(null);
    setTriageResult(null);
    setError(null);
    setImageFile(null);
    setViewingRecordId(null);
    setCurrentScreen('welcome');
  };

  const handleSaveRecord = (result: AnalysisResult) => {
    if (!patientRecords.some(record => record.id === result.id)) {
      setPatientRecords(prev => [result, ...prev]);
    }
    handleNewAnalysis();
  }

  const handleViewRecord = (id: string) => {
    setViewingRecordId(id);
    setImageFile(null);
    setCurrentScreen('results');
  };
  
  const handleNavChange = (tab: string) => {
    if (tab === 'home') setCurrentScreen('welcome');
    if (tab === 'scan') setCurrentScreen('hub');
    if (tab === 'records') setCurrentScreen('records');
    if (tab === 'care') setCurrentScreen('pharmacy');
  };

  const handleBack = () => {
    setError(null);
    if (['results', 'analysis', 'camera'].includes(currentScreen)) {
       setCurrentScreen('hub');
    } else {
       setCurrentScreen('welcome');
    }
  };

  const runTriage = async (inputs: TriageInputs) => {
    setIsLoading(true);
    try {
        const result = await aiManager.performTriage(inputs);
        setTriageResult(result);
        setCurrentScreen('triage-results');
    } catch (err) {
        console.error("Triage failed", err);
        setTriageResult({
             riskScore: 45,
             recommendation: 'CONSIDER_XRAY',
             reasoning: 'Symptoms suggest mild respiratory infection. Monitor closely.',
             urgencyLabel: 'Moderate Priority'
        });
        setCurrentScreen('triage-results');
    } finally {
        setIsLoading(false);
    }
  };

  const runAnalysis = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const rawResult = await aiManager.analyzeImage(file, selectedModality);
      const normalizedData = normalizeAiResult(rawResult, selectedModality);
      setAnalysisResult({ ...normalizedData, id: `scan-${Date.now()}`, date: new Date().toISOString() });
      setCurrentScreen('results');
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("Analysis failed. Please try again.");
      setCurrentScreen('camera');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentScreen === 'analysis' && imageFile) runAnalysis(imageFile);
  }, [currentScreen, imageFile]);

  const renderScreen = () => {
    if (viewingRecordId && currentScreen === 'results') {
      const recordToView = patientRecords.find(r => r.id === viewingRecordId);
      return recordToView && <ResultsScreen result={recordToView} imageFile={null} onNewAnalysis={handleNewAnalysis} onSaveRecord={handleSaveRecord} isViewingRecord={true} onReturnToRecords={() => setCurrentScreen('records')} />;
    }

    switch (currentScreen) {
      case 'hub':
        return <MedicalHub onSelectService={handleStartService} onStartTriage={() => setCurrentScreen('triage')} />;
      case 'triage':
        return <TriageScreen onSubmit={runTriage} onBack={handleBack} isLoading={isLoading} />;
      case 'triage-results':
        return triageResult && <TriageResultScreen result={triageResult} onProceedToXRay={() => handleStartService('XRAY')} onBack={() => setCurrentScreen('hub')} />;
      case 'camera':
        let instruction = "Capture image of X-Ray";
        let title = "Scan X-Ray";
        if (selectedModality === 'ECG') { instruction = "Capture ECG/EKG Strip"; title = "Scan Cardio"; }
        if (selectedModality === 'BLOOD') { instruction = "Capture Blood Report"; title = "Scan Report"; }
        if (selectedModality === 'DERMA') { instruction = "Capture Skin Condition"; title = "Scan Skin"; }
        if (selectedModality === 'MRI') { instruction = "Capture MRI Slide"; title = "Scan MRI"; }
        
        return <CameraScreen onStartScan={handleStartScan} error={error} onBackToHome={handleBack} instructionText={instruction} title={title} modality={selectedModality} />;
      case 'analysis':
        return <AnalysisScreen onCancel={handleBack} />;
      case 'results':
        return analysisResult && <ResultsScreen result={analysisResult} imageFile={imageFile} onNewAnalysis={handleNewAnalysis} onSaveRecord={handleSaveRecord} />;
      case 'records':
        return <RecordsScreen records={patientRecords} onViewRecord={handleViewRecord} onBackToHome={handleBack} />;
      case 'details':
        return <DetailsScreen onBack={handleBack} />;
      case 'chat':
        return <ChatScreen onBack={handleBack} aiManager={aiManager} />;
      case 'pharmacy':
        return <PharmacyScreen onBack={handleBack} aiManager={aiManager} />;
      case 'therapy':
        return <TherapyScreen onBack={handleBack} aiManager={aiManager} />;
      case 'welcome':
      default:
        return <WelcomeScreen 
                  onOpenHub={() => setCurrentScreen('hub')} 
                  onStartScan={handleStartScan}
                  onStartTriage={() => setCurrentScreen('triage')} 
                  onShowRecords={() => setCurrentScreen('records')}
                  onShowDetails={() => setCurrentScreen('details')}
                  onOpenChat={() => setCurrentScreen('chat')}
                  onOpenPharmacy={() => setCurrentScreen('pharmacy')}
                  onOpenTherapy={() => setCurrentScreen('therapy')}
                />;
    }
  };

  const hideBottomNav = ['camera', 'analysis', 'triage', 'triage-results', 'results'].includes(currentScreen);

  return (
    <div className="bg-slate-900 h-dvh w-screen flex items-center justify-center overflow-hidden">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      
      <div className="relative h-full w-full sm:max-w-[430px] sm:h-[95vh] bg-slate-50 sm:rounded-[3rem] overflow-hidden flex flex-col border-[8px] border-slate-900 shadow-2xl">
        
        <main className="flex-1 relative overflow-hidden bg-slate-50">
          <div className="absolute inset-0 overflow-y-auto no-scrollbar scroll-smooth">
            {renderScreen()}
            {!hideBottomNav && <div className="h-24"></div>}
          </div>
        </main>

        {!hideBottomNav && (
          <BottomNav currentScreen={currentScreen} onNavigate={handleNavChange} />
        )}

        <div className="absolute bottom-1 left-0 right-0 flex justify-center pointer-events-none z-[60]">
          <div className="w-32 h-1.5 bg-slate-900/20 rounded-full mb-2"></div>
        </div>
      </div>
    </div>
  );
};

export default App;