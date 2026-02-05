
import React, { useState, useEffect, useMemo } from 'react';
import WelcomeScreen from './components/WelcomeScreen.tsx';
import MedicalHub from './components/MedicalHub.tsx';
import CameraScreen from './components/CameraScreen.tsx';
import AnalysisScreen from './components/AnalysisScreen.tsx';
import ResultsScreen from './components/ResultsScreen.tsx';
import RecordsScreen from './components/RecordsScreen.tsx';
import DetailsScreen from './components/DetailsScreen.tsx';
import SettingsScreen from './components/SettingsScreen.tsx';
import TriageScreen from './components/TriageScreen.tsx';
import TriageResultScreen from './components/TriageResultScreen.tsx';
import ChatScreen from './components/ChatScreen.tsx';
import PharmacyScreen from './components/PharmacyScreen.tsx';
import TherapyScreen from './components/TherapyScreen.tsx';
import SplashScreen from './components/SplashScreen.tsx';
import Header from './components/Header.tsx';
import DisclaimerModal from './components/DisclaimerModal.tsx';
import AIManager from './services/aiManager.js';
import type { Screen, AnalysisResult, TriageInputs, TriageResult, Modality } from './types.ts';

const normalizeAiResult = (data: any, modality: Modality): Omit<AnalysisResult, 'id' | 'date'> => {
  if (!data.condition || !data.description || data.confidence === undefined) {
      throw new Error("CORE_INTEGRITY_ERROR: The Neural Engine returned an incomplete diagnostic synthesis. Please ensure clear imaging and check Vision API billing.");
  }

  return {
    modality: modality,
    condition: data.condition,
    confidence: Math.min(100, Math.max(0, data.confidence)),
    description: data.description,
    details: data.details || "Granular physiological audit data not extracted.",
    treatment: data.treatment || "Standard clinical protocol advised.",
    isEmergency: !!data.isEmergency,
    modelVersion: "Genesis-v3.5 (Optical + Neural Reasoning)",
    modelUsed: "Google Vision + Gemini-3-Flash",
    cost: data.cost || 1250,
  };
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
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
      const parsed = records ? JSON.parse(records) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  });
  
  const [viewingRecordId, setViewingRecordId] = useState<string | null>(null);
  
  const aiManager = useMemo(() => new AIManager(), []);

  useEffect(() => {
    try {
        window.localStorage.setItem('patientRecords', JSON.stringify(patientRecords));
    } catch (error) {
        console.error("Failed to save records", error);
    }
  }, [patientRecords]);

  const handleStartService = async (modality: Modality) => {
      const visionConfigured = await aiManager.isConfigured('vision');
      const chatConfigured = await aiManager.isConfigured('chat');
      
      if (!visionConfigured || !chatConfigured) {
          setError("NEURAL_LINK_OFFLINE: Imaging requires both Vision and Chat channels. Visit Settings.");
          setCurrentScreen('settings');
          return;
      }
      setSelectedModality(modality);
      setCurrentScreen('camera');
  };

  const checkModuleConfig = async (module: 'chat' | 'therapy' | 'vision') => {
      const ok = await aiManager.isConfigured(module);
      if (!ok) {
          setError(`CHANNEL_OFFLINE: ${module.toUpperCase()} link required.`);
          setCurrentScreen('settings');
          return false;
      }
      return true;
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
    setCurrentScreen('hub'); 
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

  const handleBack = () => {
    setError(null);
    if (['results', 'analysis', 'camera'].includes(currentScreen)) {
       setCurrentScreen('hub');
    } else {
       setCurrentScreen('welcome');
    }
  };

  const runTriage = async (inputs: TriageInputs) => {
    if (!(await checkModuleConfig('chat'))) return;
    setIsLoading(true);
    try {
        const result = await aiManager.performTriage(inputs);
        setTriageResult(result as TriageResult);
        setCurrentScreen('triage-results');
    } catch (err: any) {
        setError(err.message || "Triage assessment failed.");
    } finally {
        setIsLoading(false);
    }
  };

  const runAnalysis = async (file: File) => {
    if (!(await checkModuleConfig('vision')) || !(await checkModuleConfig('chat'))) return;
    setIsLoading(true);
    setError(null);
    try {
      const rawResult = await aiManager.analyzeImage(file, selectedModality);
      const normalizedData = normalizeAiResult(rawResult, selectedModality);
      setAnalysisResult({ ...normalizedData, id: `scan-${Date.now()}`, date: new Date().toISOString() });
      setCurrentScreen('results');
    } catch (err: any) {
      console.error("Analysis Error:", err);
      setError(err.message || "The Neural Engine could not synthesize a valid report.");
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
        let instruction = "Align X-Ray film clearly";
        let title = "Scan Imaging";
        if (selectedModality === 'ECG') { instruction = "Align ECG Strip clearly"; title = "Scan Cardiac"; }
        if (selectedModality === 'BLOOD') { instruction = "Align Lab Report clearly"; title = "Scan Lab"; }
        if (selectedModality === 'DERMA') { instruction = "Capture lesion in focus"; title = "Scan Derma"; }
        return <CameraScreen onStartScan={handleStartScan} error={error} onBackToHome={handleBack} instructionText={instruction} title={title} modality={selectedModality} />;
      case 'analysis':
        return <AnalysisScreen onCancel={handleBack} />;
      case 'results':
        return analysisResult && <ResultsScreen result={analysisResult} imageFile={imageFile} onNewAnalysis={handleNewAnalysis} onSaveRecord={handleSaveRecord} />;
      case 'records':
        return <RecordsScreen records={patientRecords} onViewRecord={handleViewRecord} onBackToHome={handleBack} />;
      case 'details':
        return <DetailsScreen onBack={handleBack} />;
      case 'settings':
        return <SettingsScreen onBack={handleBack} aiManager={aiManager} />;
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
                  onOpenChat={async () => {
                      if (await checkModuleConfig('chat')) setCurrentScreen('chat');
                  }}
                  onOpenPharmacy={async () => {
                      if (await checkModuleConfig('chat')) setCurrentScreen('pharmacy');
                  }}
                  onOpenTherapy={async () => {
                      if (await checkModuleConfig('therapy')) setCurrentScreen('therapy');
                  }}
                  onOpenSettings={() => setCurrentScreen('settings')}
                />;
    }
  };

  const shouldShowHeader = !['camera', 'analysis', 'settings'].includes(currentScreen);

  return (
    <div className="flex flex-col h-dvh bg-slate-50 overflow-hidden text-slate-900 font-sans">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      {!showSplash && !hasAcceptedTerms && (
          <DisclaimerModal onAccept={() => setHasAcceptedTerms(true)} />
      )}
      {shouldShowHeader && (
          <Header 
            isOnline={true} 
            currentScreen={currentScreen}
            onBack={handleBack}
          />
      )}
      <main className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 overflow-y-auto scroll-smooth">
            {!showSplash && (
                <div className={!hasAcceptedTerms ? 'blur-md pointer-events-none h-full transition-all duration-500' : 'h-full'}>
                    {renderScreen()}
                </div>
            )}
          </div>
      </main>
    </div>
  );
};

export default App;
