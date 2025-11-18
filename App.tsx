
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Header from './components/Header.tsx';
import WelcomeScreen from './components/WelcomeScreen.tsx';
import CameraScreen from './components/CameraScreen.tsx';
import AnalysisScreen from './components/AnalysisScreen.tsx';
import ResultsScreen from './components/ResultsScreen.tsx';
import RecordsScreen from './components/RecordsScreen.tsx';
import DetailsScreen from './components/DetailsScreen.tsx';
import SettingsScreen from './components/SettingsScreen.tsx';
import TriageScreen from './components/TriageScreen.tsx';
import TriageResultScreen from './components/TriageResultScreen.tsx';
import AIManager from './services/aiManager.js';
import type { Screen, AnalysisResult, ApiKeyStatus, TriageInputs, TriageResult } from './types.ts';

// Helper to normalize results from the AI service
const normalizeAiResult = (data: any): Omit<AnalysisResult, 'id' | 'date'> => {
  return {
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
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
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
      console.error("Failed to parse patient records from localStorage", error);
      return [];
    }
  });
  const [viewingRecordId, setViewingRecordId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(() => window.localStorage.getItem('geminiApiKey'));
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus>('untested');

  const aiManager = useMemo(() => new AIManager(apiKey), [apiKey]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial API Key Check
    if (apiKey) {
      handleTestApiKey(apiKey, true);
    } else {
      setApiKeyStatus('not_configured');
    }

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
        window.localStorage.setItem('patientRecords', JSON.stringify(patientRecords));
    } catch (error) {
        console.error("Failed to save patient records to localStorage", error);
    }
  }, [patientRecords]);

  const handleStartScan = (file: File) => {
    if (apiKeyStatus !== 'valid') {
        alert('Please configure a valid API key in Settings before running an analysis.');
        setCurrentScreen('settings');
        return;
    }
    setImageFile(file);
    setCurrentScreen('analysis');
  };
  
  const handleStartDemo = () => {
    setIsDemoMode(true);
    setCurrentScreen('triage'); // Start Demo flow at Triage now
  };

  const handleNewAnalysis = () => {
    setAnalysisResult(null);
    setTriageResult(null);
    setError(null);
    setImageFile(null);
    setViewingRecordId(null);
    setIsDemoMode(false);
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
  
  const handleUpdateApiKey = async (newKey: string) => {
    const isValid = await handleTestApiKey(newKey);
    if (isValid) {
      setApiKey(newKey);
      window.localStorage.setItem('geminiApiKey', newKey);
    }
    return isValid;
  };

  const handleTestApiKey = async (keyToTest: string, isInitialLoad = false) => {
    if (!keyToTest) {
      setApiKeyStatus('not_configured');
      return false;
    }
    setApiKeyStatus('testing');
    const isValid = await AIManager.verifyApiKey(keyToTest);
    setApiKeyStatus(isValid ? 'valid' : 'invalid');
    if (!isValid && !isInitialLoad) {
      alert('The provided API Key appears to be invalid. Please check it and try again.');
    }
    return isValid;
  };

  const handleClearApiKey = () => {
    setApiKey(null);
    setApiKeyStatus('not_configured');
    window.localStorage.removeItem('geminiApiKey');
    alert('API Key cleared.');
  };

  const handleBack = () => {
    setError(null);
    if (currentScreen === 'results' && viewingRecordId) {
      handleReturnToRecords();
    } else if (['camera', 'records', 'details', 'settings', 'triage'].includes(currentScreen)) {
      setCurrentScreen('welcome');
    } else if (currentScreen === 'triage-results') {
      setCurrentScreen('triage');
    }
  };

  const runTriage = async (inputs: TriageInputs) => {
    if (apiKeyStatus !== 'valid' && !isDemoMode) {
         alert('Please configure a valid API key in Settings.');
         return;
    }

    setIsLoading(true);
    try {
        const result = await aiManager.performTriage(inputs, isDemoMode);
        setTriageResult(result);
        setCurrentScreen('triage-results');
    } catch (err) {
        console.error("Triage failed", err);
        alert("Triage analysis failed. Please check network and API Key.");
    } finally {
        setIsLoading(false);
    }
  };

  const runAnalysis = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const rawResult = await aiManager.analyzeImage(file, isDemoMode);
      const normalizedData = normalizeAiResult(rawResult);
      
      const resultWithMetadata: AnalysisResult = {
        ...normalizedData,
        id: isDemoMode ? `demo-${Date.now()}` : `scan-${Date.now()}`,
        date: new Date().toISOString(),
      }
      setAnalysisResult(resultWithMetadata);
      setCurrentScreen('results');
    } catch (err) {
      console.error("Analysis failed:", err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Analysis failed: ${errorMessage}. Please check your connection and API Key, then try again.`);
      setCurrentScreen('camera');
    } finally {
      setIsLoading(false);
    }
  }, [aiManager, isDemoMode]);

  useEffect(() => {
    if (currentScreen === 'analysis' && imageFile) {
      runAnalysis(imageFile);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentScreen, imageFile]);

  useEffect(() => {
    const preventDefault = (e: Event) => e.preventDefault();
    document.addEventListener('contextmenu', preventDefault);
    if (currentScreen !== 'results' && currentScreen !== 'triage-results') {
      document.addEventListener('selectstart', preventDefault);
    }
    return () => {
      document.removeEventListener('contextmenu', preventDefault);
      document.removeEventListener('selectstart', preventDefault);
    };
  }, [currentScreen]);

  const renderScreen = () => {
    if (viewingRecordId && currentScreen === 'results') {
      const recordToView = patientRecords.find(r => r.id === viewingRecordId);
      return recordToView && <ResultsScreen result={recordToView} imageFile={null} onNewAnalysis={handleNewAnalysis} onSaveRecord={handleSaveRecord} isViewingRecord={true} onReturnToRecords={handleReturnToRecords} />;
    }

    switch (currentScreen) {
      case 'triage':
        return <TriageScreen onSubmit={runTriage} onBack={handleBack} isLoading={isLoading} />;
      case 'triage-results':
        return triageResult && <TriageResultScreen result={triageResult} onProceedToXRay={() => setCurrentScreen('camera')} onBack={() => setCurrentScreen('welcome')} />;
      case 'camera':
        return <CameraScreen onStartScan={handleStartScan} error={error} isDemoMode={isDemoMode} onBackToHome={handleBack} />;
      case 'analysis':
        return <AnalysisScreen />;
      case 'results':
        return analysisResult && <ResultsScreen result={analysisResult} imageFile={imageFile} onNewAnalysis={handleNewAnalysis} onSaveRecord={handleSaveRecord} isDemoMode={isDemoMode} />;
      case 'records':
        return <RecordsScreen records={patientRecords} onViewRecord={handleViewRecord} onBackToHome={handleBack} />;
      case 'details':
        return <DetailsScreen onBack={handleBack} />;
      case 'settings':
        return <SettingsScreen 
                  apiKey={apiKey}
                  apiKeyStatus={apiKeyStatus}
                  onUpdateApiKey={handleUpdateApiKey}
                  onTestApiKey={handleTestApiKey}
                  onClearApiKey={handleClearApiKey}
                  onBack={handleBack} 
                />;
      case 'welcome':
      default:
        return <WelcomeScreen 
                  onStartCamera={() => setCurrentScreen('camera')}
                  onStartScan={handleStartScan}
                  onStartDemo={handleStartDemo} 
                  onStartTriage={() => setCurrentScreen('triage')}
                  onShowRecords={() => setCurrentScreen('records')}
                  onShowDetails={() => setCurrentScreen('details')}
                  onShowSettings={() => setCurrentScreen('settings')}
                  apiKeyStatus={apiKeyStatus}
                />;
    }
  };

  return (
    <div className="bg-slate-100 h-screen w-screen flex items-center justify-center p-0 sm:p-4 overflow-hidden">
      <div className="relative h-full w-full sm:max-w-[430px] sm:h-[92vh] bg-white shadow-2xl sm:rounded-[2.5rem] overflow-hidden flex flex-col border border-slate-200/60 ring-8 ring-slate-900/5">
        <Header 
            isOnline={isOnline}
            currentScreen={currentScreen}
            onBack={handleBack}
        />
        <main className="main-content flex-1 p-5 overflow-y-auto bg-slate-50/50 scroll-smooth">
          <div key={currentScreen} className={`screen-container min-h-full flex flex-col ${currentScreen === 'results' || currentScreen === 'triage-results' ? 'printable-area' : ''}`}>
            {renderScreen()}
          </div>
        </main>
        {/* Bottom Indicator for Mobile feel */}
        {currentScreen !== 'camera' && (
          <div className="absolute bottom-1 left-0 right-0 flex justify-center pointer-events-none">
            <div className="w-32 h-1 bg-slate-200 rounded-full mb-2"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
