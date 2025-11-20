
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Header from './components/Header.tsx';
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
import AIManager from './services/aiManager.js';
import type { Screen, AnalysisResult, TriageInputs, TriageResult, Modality } from './types.ts';

const normalizeAiResult = (data: any, modality: Modality): Omit<AnalysisResult, 'id' | 'date'> => {
  return {
    modality: modality,
    condition: data.condition,
    confidence: Math.min(100, Math.max(0, data.confidence ?? 0)),
    description: data.description,
    details: data.details,
    treatment: data.treatment,
    isEmergency: data.isEmergency ?? data.emergency ?? false,
    modelVersion: data.modelVersion,
    modelUsed: data.modelUsed,
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
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const aiManager = useMemo(() => new AIManager(), []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
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
      alert('Record saved successfully!');
    }
    handleNewAnalysis();
  }

  const handleViewRecord = (id: string) => {
    setViewingRecordId(id);
    setImageFile(null);
    setCurrentScreen('results');
  };

  const handleReturnToRecords = () => {
    setViewingRecordId(null);
    setCurrentScreen('records');
  };
  
  const handleBack = () => {
    setError(null);
    if (currentScreen === 'results') {
        if (viewingRecordId) {
            handleReturnToRecords();
        } else {
            setCurrentScreen('hub');
        }
    } else if (currentScreen === 'camera') {
      setCurrentScreen('hub');
    } else if (currentScreen === 'triage') {
      setCurrentScreen('welcome');
    } else if (currentScreen === 'hub') {
      setCurrentScreen('welcome');
    } else if (['records', 'details', 'chat', 'pharmacy', 'therapy'].includes(currentScreen)) {
      setCurrentScreen('welcome');
    } else if (currentScreen === 'triage-results') {
      setCurrentScreen('triage');
    } else if (currentScreen === 'analysis') {
      setIsLoading(false);
      setCurrentScreen('camera'); // Allow user to cancel analysis and retake photo
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
        alert("Triage analysis failed. Please check your internet connection and API Key configuration.");
    } finally {
        setIsLoading(false);
    }
  };

  const runAnalysis = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const rawResult = await aiManager.analyzeImage(file, selectedModality);
      // Check if user cancelled (changed screen) during await
      const normalizedData = normalizeAiResult(rawResult, selectedModality);
      setAnalysisResult({ ...normalizedData, id: `scan-${Date.now()}`, date: new Date().toISOString() });
      setCurrentScreen('results');
    } catch (err) {
      console.error("Analysis failed:", err);
      setError(`Analysis failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setCurrentScreen('camera');
    } finally {
      setIsLoading(false);
    }
  }, [aiManager, selectedModality]);

  useEffect(() => {
    if (currentScreen === 'analysis' && imageFile) runAnalysis(imageFile);
  }, [currentScreen, imageFile]);

  const isFullScreenApp = ['chat', 'therapy', 'pharmacy'].includes(currentScreen);

  const renderScreen = () => {
    if (viewingRecordId && currentScreen === 'results') {
      const recordToView = patientRecords.find(r => r.id === viewingRecordId);
      return recordToView && <ResultsScreen result={recordToView} imageFile={null} onNewAnalysis={handleNewAnalysis} onSaveRecord={handleSaveRecord} isViewingRecord={true} onReturnToRecords={handleReturnToRecords} />;
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

  return (
    <div className="bg-slate-100 h-screen w-screen flex items-center justify-center p-0 sm:p-4 overflow-hidden">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      
      <div className="relative h-full w-full sm:max-w-[430px] sm:h-[92vh] bg-white shadow-2xl sm:rounded-[2.5rem] overflow-hidden flex flex-col border border-slate-200/60 ring-8 ring-slate-900/5">
        {!isFullScreenApp && currentScreen !== 'camera' && 
          <Header isOnline={isOnline} currentScreen={currentScreen} onBack={handleBack} />
        }
        
        <main className={`main-content flex-1 bg-white ${isFullScreenApp ? 'overflow-hidden flex flex-col' : 'overflow-y-auto scroll-smooth'}`}>
          <div key={currentScreen} className={`screen-container ${isFullScreenApp ? 'h-full' : 'min-h-full'} flex flex-col`}>
            {renderScreen()}
          </div>
        </main>

        {!isFullScreenApp && currentScreen !== 'camera' && (
          <div className="absolute bottom-1 left-0 right-0 flex justify-center pointer-events-none">
            <div className="w-32 h-1 bg-slate-200 rounded-full mb-2"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
