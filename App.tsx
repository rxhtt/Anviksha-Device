import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import WelcomeScreen from './components/WelcomeScreen';
import CameraScreen from './components/CameraScreen';
import AnalysisScreen from './components/AnalysisScreen';
import ResultsScreen from './components/ResultsScreen';
import RecordsScreen from './components/RecordsScreen';
import DetailsScreen from './components/DetailsScreen';
import ExitModal from './components/ExitModal';
import AIManager from './services/aiManager.js'; // This is now cloud-only
import type { Screen, AnalysisResult } from './types';

const aiManager = new AIManager();
// FIX: Cast import.meta to any to access env property without TypeScript errors.
const apiKey = (import.meta as any).env.VITE_API_KEY;

// --- API Key Missing Screen ---
// This component is shown if the VITE_API_KEY environment variable is not set.
const WarningIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-1em w-1em" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
);

const ApiKeyMissingScreen: React.FC = () => {
    return (
        <div className="bg-slate-50 h-screen w-screen flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white shadow-2xl rounded-2xl p-8 text-center">
                <div className="text-7xl text-amber-500 mx-auto w-fit mb-4">
                    <WarningIcon />
                </div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Configuration Error</h1>
                <p className="text-slate-600 mb-6 max-w-lg mx-auto">
                    The Gemini API key is missing. The application cannot start without it. Please follow the steps below to configure your project.
                </p>

                <div className="text-left bg-slate-100 p-6 rounded-lg border border-slate-200">
                    <h2 className="font-bold text-lg text-slate-700 mb-3">How to Fix on Vercel:</h2>
                    <ol className="list-decimal list-inside space-y-3 text-slate-700">
                        <li>Go to your project dashboard on the <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">Vercel website</a>.</li>
                        <li>Navigate to the <strong>Settings</strong> tab for this project.</li>
                        <li>Click on <strong>Environment Variables</strong> in the sidebar.</li>
                        <li>
                            Create a new variable with the name <code className="bg-slate-200 text-red-600 font-mono py-1 px-1.5 rounded-md text-sm">VITE_API_KEY</code>.
                        </li>
                        <li>Paste your Gemini API key into the value field.</li>
                        <li>Save the variable and redeploy the latest commit for the changes to take effect.</li>
                    </ol>
                </div>
                 <p className="text-xs text-slate-400 mt-6">
                    Make sure the variable name is spelled correctly and includes the `VITE_` prefix. This is required for security and allows the key to be accessible by the application.
                </p>
            </div>
        </div>
    );
};


// Helper to normalize results from the AI service
const normalizeAiResult = (data: any): Omit<AnalysisResult, 'id' | 'date'> => {
  // Cloud result confidence is already 0-100
  const confidence = data.confidence;

  return {
    condition: data.condition,
    confidence: Math.min(100, Math.max(0, confidence)), // Clamp confidence 0-100
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

  // If the API key is not provided, render a dedicated error screen.
  // This prevents the app from crashing and provides clear instructions to the user.
  if (!apiKey) {
    return <ApiKeyMissingScreen />;
  }

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    aiManager.initialize().then(status => {
      console.log("AI Manager initialized:", status);
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

    // UNIFIED ANALYSIS: Both demo and regular scans use the real AI.
    try {
      const rawResult = await aiManager.analyzeImage(file);

      if (rawResult.condition === 'ANALYSIS_UNAVAILABLE' || rawResult.condition === 'ANALYSIS_FAILED') {
        throw new Error(rawResult.description || 'AI analysis failed.');
      }

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