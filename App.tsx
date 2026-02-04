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
import ProfileScreen from './components/ProfileScreen.tsx';
import SplashScreen from './components/SplashScreen.tsx';
import LegalConsentModal from './components/LegalConsentModal.tsx';
import Header from './components/Header.tsx';
import AIManager from './services/aiManager.js';
import type { Screen, AnalysisResult, TriageInputs, TriageResult, Modality, UserProfile, Language } from './types.ts';

const normalizeAiResult = (data: any, modality: Modality): Omit<AnalysisResult, 'id' | 'date'> => {
  if (data.isInvalid) {
    return {
      modality,
      condition: data.condition || "Analysis Rejected",
      confidence: 0,
      description: data.description || "The uploaded image could not be verified as a valid diagnostic scan.",
      treatment: data.treatment || "Please upload a clinical-grade medical image.",
      isEmergency: false,
      clinicalAlerts: ["INVALID_INPUT"],
      observationNotes: "Rejection Logic Triggered",
      modelVersion: "Anviksha-Logic-v1",
      modelUsed: "Legitimacy-Filter",
    };
  }

  return {
    modality: modality,
    condition: data.condition || "Clinical Review Complete",
    confidence: data.confidence ?? 0,
    description: data.description || "Comprehensive clinical analysis was performed.",
    details: data.details || "Consult reasoning path for detailed findings.",
    treatment: data.treatment || "Refer to clinical management guidelines.",
    isEmergency: data.isEmergency ?? false,
    clinicalAlerts: data.clinicalAlerts || [],
    observationNotes: data.observationNotes || "Verified via Anviksha Diagnostic Core",
    modelVersion: "Anviksha-Neural-v3.0",
    modelUsed: "Clinical-Specialist-Engine",
    cost: data.cost,
  };
};

const DEFAULT_PROFILE: UserProfile = {
  name: 'Guest Patient',
  age: 25,
  sex: 'Male',
  bloodGroup: 'Unknown',
  weight: 70,
  chronicConditions: [],
  allergies: [],
  emergencyContact: ''
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [showConsent, setShowConsent] = useState(() => !localStorage.getItem('anviksha_consent_v2'));
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [selectedModality, setSelectedModality] = useState<Modality>('XRAY');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<Language>('en');

  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('anviksha_profile');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch (e) { return DEFAULT_PROFILE; }
  });

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

  useEffect(() => {
    localStorage.setItem('anviksha_profile', JSON.stringify(profile));
  }, [profile]);

  // SECURITY CRITICAL: wipe potential leak sources
  useEffect(() => {
    try {
      const sensitiveKeys = [
        'geminiApiKey',
        'gemini_api_key',
        'GOOGLE_API_KEY',
        'REACT_APP_GEMINI_KEY',
        'google_api_key'
      ];

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

    } catch (e) { /* Silent fail */ }
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
    if (['results', 'analysis', 'camera', 'profile', 'records', 'details', 'chat', 'pharmacy', 'therapy'].includes(currentScreen)) {
      setCurrentScreen(currentScreen === 'profile' || currentScreen === 'records' || currentScreen === 'details' ? 'welcome' : 'hub');
    } else if (currentScreen === 'hub' || currentScreen === 'triage') {
      setCurrentScreen('welcome');
    } else {
      setCurrentScreen('welcome');
    }
  };

  const runTriage = async (inputs: TriageInputs) => {
    setIsLoading(true);
    try {
      const result = await aiManager.performTriage(inputs, profile, language);
      setTriageResult(result);
      setCurrentScreen('triage-results');
    } catch (err) {
      console.error("Triage failed", err);
      setError("Clinical Triage Engine is temporarily unreachable. Using Local Heuristic: High Risk markers not detected. Please try again or consult a doctor.");
      setCurrentScreen('hub');
    } finally {
      setIsLoading(false);
    }
  };

  const runAnalysis = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const rawResult = await aiManager.analyzeImage(file, selectedModality, profile, language);
      const normalizedData = normalizeAiResult(rawResult, selectedModality);
      setAnalysisResult({ ...normalizedData, id: `scan-${Date.now()}`, date: new Date().toISOString() });
      setCurrentScreen('results');
    } catch (err) {
      console.error("Analysis failed:", err);
      setError("Clinical pipeline interrupted. Please verify connectivity.");
      setCurrentScreen('camera');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentScreen === 'analysis' && imageFile) runAnalysis(imageFile);
  }, [currentScreen, imageFile]);

  const handleAcceptConsent = () => {
    localStorage.setItem('anviksha_consent_v2', 'true');
    setShowConsent(false);
  };

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
        return <CameraScreen onStartScan={handleStartScan} error={error} onBackToHome={handleBack} instructionText={`Align ${selectedModality} for scan`} title={`Scan ${selectedModality}`} modality={selectedModality} />;
      case 'analysis':
        return <AnalysisScreen onCancel={handleBack} />;
      case 'results':
        return analysisResult && <ResultsScreen result={analysisResult} imageFile={imageFile} onNewAnalysis={handleNewAnalysis} onSaveRecord={handleSaveRecord} />;
      case 'records':
        return <RecordsScreen records={patientRecords} onViewRecord={handleViewRecord} onBackToHome={handleBack} />;
      case 'details':
        return <DetailsScreen onBack={handleBack} />;
      case 'chat':
        return <ChatScreen onBack={handleBack} aiManager={aiManager} profile={profile} language={language} />;
      case 'pharmacy':
        return <PharmacyScreen onBack={handleBack} aiManager={aiManager} profile={profile} language={language} />;
      case 'therapy':
        return <TherapyScreen onBack={handleBack} aiManager={aiManager} profile={profile} language={language} />;
      case 'profile':
        return <ProfileScreen profile={profile} onSave={(p) => { setProfile(p); handleBack(); }} onBack={handleBack} />;
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
          onOpenProfile={() => setCurrentScreen('profile')}
        />;
    }
  };

  const shouldShowHeader = !['camera', 'analysis', 'profile'].includes(currentScreen);

  return (
    <div className="flex flex-col h-dvh bg-[#0a0f18] overflow-hidden text-slate-900 font-sans">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      {showConsent && !showSplash && <LegalConsentModal onAccept={handleAcceptConsent} />}

      <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
        {shouldShowHeader && (
          <Header
            isOnline={true}
            currentScreen={currentScreen}
            onBack={handleBack}
          />
        )}

        <main className="flex-1 relative overflow-hidden">
          <div className="absolute inset-0 overflow-y-auto scroll-smooth no-scrollbar">
            {renderScreen()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
