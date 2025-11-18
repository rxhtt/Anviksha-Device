import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import WelcomeScreen from './components/WelcomeScreen';
import CameraScreen from './components/CameraScreen';
import AnalysisScreen from './components/AnalysisScreen';
import ResultsScreen from './components/ResultsScreen';
import RecordsScreen from './components/RecordsScreen';
import DetailsScreen from './components/DetailsScreen';
import ExitModal from './components/ExitModal';
import AIManager from './services/aiManager.js'; // This is now the single source of truth
import type { Screen, AnalysisResult } from './types';

const aiManager = new AIManager();

// Helper to normalize results from the AI service
const normalizeAiResult = (data: any): Omit<AnalysisResult, 'id' | 'date'> => {
  return {
    condition: data.condition,
    confidence: Math.min(100, Math.max(0, data.confidence ?? 0)), // Clamp confidence 0-100 and provide default
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
  const [error, setError] = useState<string | null>(null);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
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

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    aiManager.initialize().then(status => {
      console.log("AI Manager initialized");
    });

    return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    try {
        window.localStorage.setItem('patientRecords', JSON.stringify(patientRecords));
    } catch (error) {
        console.error("Failed to save patient records to localStorage", error);
    }
  }, [patientRecords]);


  const handleStartScan = (file: File) => {
    setImageFile(file);
    setCurrentScreen('analysis');
  };
  
  const handleStartDemo = () => {
    setIsDemoMode(true);
    setCurrentScreen('camera');
  };

  const handleNewAnalysis = () => {
    setAnalysisResult(null);
    setError(null);
    setImageFile(null);
    setViewingRecordId(null);
    setIsDemoMode(false);
    setCurrentScreen('welcome');
  };

  const handleSaveRecord = (result: AnalysisResult) => {
    // Prevent saving duplicates
    if (!patientRecords.some(record => record.id === result.id)) {
      setPatientRecords(prev => [result, ...prev]);
      alert('Record saved successfully!');
    }
    handleNewAnalysis();
  }

  const handleViewRecord = (id: string) => {
    setViewingRecordId(id);
    setImageFile(null); // No image available for saved records yet
    setCurrentScreen('results');
  };

  const handleReturnToRecords = () => {
    setViewingRecordId(null);
    setCurrentScreen('records');
  };

  const handleBack = () => {
    setError(null); // Clear errors on navigation
    if (currentScreen === 'results' && viewingRecordId) {
      handleReturnToRecords();
    } else if (['camera', 'records', 'details'].includes(currentScreen)) {
      setCurrentScreen('welcome');
    }
  };

  const runAnalysis = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      // AIManager.analyzeImage now throws on failure, simplifying this block.
      const rawResult = await aiManager.analyzeImage(file, isDemoMode);

      // Normalization is still a good practice for safety.
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
      setError(`Analysis failed: ${errorMessage}. Please try again or use a different image.`);
      setCurrentScreen('camera'); // Go back to camera screen on error
    } finally {
      setIsLoading(false);
    }
  }, [isDemoMode]);

  useEffect(() => {
    if (currentScreen === 'analysis' && imageFile) {
      runAnalysis(imageFile);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentScreen, imageFile]);

  // Kiosk mode preventions
  useEffect(() => {
    const preventDefault = (e: Event) => e.preventDefault();
    document.addEventListener('contextmenu', preventDefault);
    // Allow text selection in results
    if (currentScreen !== 'results') {
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
      case 'welcome':
      default:
        return <WelcomeScreen 
                  onStartCamera={() => setCurrentScreen('camera')}
                  onStartScan={handleStartScan}
                  onStartDemo={handleStartDemo} 
                  onShowRecords={() => setCurrentScreen('records')}
                  onShowDetails={() => setCurrentScreen('details')}
                />;
    }
  };

  return (
    <div className="bg-slate-50 h-screen w-screen overflow-hidden touch-manipulation">
      <div className="kiosk-container h-full max-w-lg mx-auto flex flex-col bg-white shadow-2xl rounded-2xl">
        <Header 
            onEmergencyExit={() => setIsExitModalOpen(true)} 
            isOnline={isOnline}
            currentScreen={currentScreen}
            onBack={handleBack}
        />
        <main className="main-content flex-1 p-6 overflow-y-auto">
          <div key={currentScreen} className={`screen-container ${currentScreen === 'results' ? 'printable-area' : ''}`}>
            {renderScreen()}
          </div>
        </main>
      </div>
      <ExitModal isOpen={isExitModalOpen} onClose={() => setIsExitModalOpen(false)} />
    </div>
  );
};

export default App;