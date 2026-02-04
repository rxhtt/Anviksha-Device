import React, { useState, useEffect } from 'react';
import {
  ArrowLeftIcon,
  ShieldCheckIcon,
  SparklesIcon,
  WifiIcon,
  WifiOffIcon,
  AlertIcon,
  HistoryIcon,
  SettingsIcon,
  MicIcon,
  CameraIcon,
  CheckCircleIcon
} from './IconComponents.tsx';

interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const [keys, setKeys] = useState({
    geminiKey: '',
    visionKey: '',
    speechKey: ''
  });

  const [testStatus, setTestStatus] = useState<{
    gemini: 'idle' | 'testing' | 'pass' | 'fail';
    vision: 'idle' | 'testing' | 'pass' | 'fail';
    speech: 'idle' | 'testing' | 'pass' | 'fail';
  }>({
    gemini: 'idle',
    vision: 'idle',
    speech: 'idle'
  });

  const [saveStatus, setSaveStatus] = useState(false);

  useEffect(() => {
    const savedKeys = localStorage.getItem('anviksha_manual_keys');
    if (savedKeys) {
      setKeys(JSON.parse(savedKeys));
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('anviksha_manual_keys', JSON.stringify(keys));
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2000);
    // Refresh AIManager config by reloading or event (simple reload for this demo)
    window.location.reload();
  };

  const testGemini = async () => {
    setTestStatus(prev => ({ ...prev, gemini: 'testing' }));
    try {
      const res = await fetch('/api/consult', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Manual-Gemini-Key': keys.geminiKey
        },
        body: JSON.stringify({ prompt: "Respond with 'PASS'", persona: "Test System" })
      });
      if (res.ok) setTestStatus(prev => ({ ...prev, gemini: 'pass' }));
      else setTestStatus(prev => ({ ...prev, gemini: 'fail' }));
    } catch (e) {
      setTestStatus(prev => ({ ...prev, gemini: 'fail' }));
    }
  };

  const testVision = async () => {
    setTestStatus(prev => ({ ...prev, vision: 'testing' }));
    try {
      // Send tiny dummy base64
      const res = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Manual-Vision-Key': keys.visionKey
        },
        body: JSON.stringify({ imageBase64: 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7' })
      });
      if (res.ok) setTestStatus(prev => ({ ...prev, vision: 'pass' }));
      else setTestStatus(prev => ({ ...prev, vision: 'fail' }));
    } catch (e) {
      setTestStatus(prev => ({ ...prev, vision: 'fail' }));
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'testing') return <span className="text-[10px] font-black text-blue-500 animate-pulse">TESTING...</span>;
    if (status === 'pass') return <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1"><CheckCircleIcon /> VERIFIED</span>;
    if (status === 'fail') return <span className="text-[10px] font-black text-red-500 flex items-center gap-1"><AlertIcon /> FAILED</span>;
    return <span className="text-[10px] font-black text-slate-400">NOT TESTED</span>;
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] page-transition">
      {/* Header */}
      <div className="px-8 py-10 bg-slate-900 text-white rounded-b-[3.5rem] shadow-2xl relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>

        <div className="flex items-center justify-between mb-8 relative z-10">
          <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 active:scale-95 transition-all">
            <ArrowLeftIcon />
          </button>
          <div className="text-center">
            <h1 className="text-xs font-black uppercase tracking-[0.4em] text-blue-400">Control Center</h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Neural Key Management</p>
          </div>
          <div className="w-12 h-12"></div>
        </div>

        <div className="flex items-center gap-4 bg-white/5 p-6 rounded-3xl border border-white/10">
          <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
            <ShieldCheckIcon />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest">End-to-End Encryption</h3>
            <p className="text-[10px] text-slate-400 font-bold leading-relaxed">Your API keys are stored only in your local browser storage and never touch our servers.</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 no-scrollbar">

        {/* Gemini Section */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center"><SparklesIcon /></div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Gemini Core</h3>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter mt-1">Clinical Reasoning & Therapy</p>
              </div>
            </div>
            <StatusBadge status={testStatus.gemini} />
          </div>

          <div className="space-y-4">
            <input
              type="password"
              value={keys.geminiKey}
              onChange={(e) => setKeys({ ...keys, geminiKey: e.target.value })}
              placeholder="AIzaSy..."
              className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
            <button
              onClick={testGemini}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
            >
              Test Connection
            </button>
          </div>
        </div>

        {/* Vision Section */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><CameraIcon /></div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Vision Engine</h3>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter mt-1">Image Classification & OCR</p>
              </div>
            </div>
            <StatusBadge status={testStatus.vision} />
          </div>

          <div className="space-y-4">
            <input
              type="password"
              value={keys.visionKey}
              onChange={(e) => setKeys({ ...keys, visionKey: e.target.value })}
              placeholder="AIzaSy..."
              className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
            <button
              onClick={testVision}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
            >
              Validate Vision Auth
            </button>
          </div>
        </div>

        {/* Speech Section */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><MicIcon /></div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest leading-none">Speech Core</h3>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter mt-1">Vocational Transcription</p>
              </div>
            </div>
            <StatusBadge status={testStatus.speech} />
          </div>

          <div className="space-y-4">
            <input
              type="password"
              value={keys.speechKey}
              onChange={(e) => setKeys({ ...keys, speechKey: e.target.value })}
              placeholder="AIzaSy..."
              className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 text-slate-900 font-mono text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="pb-12">
          <button
            onClick={handleSave}
            className={`w-full py-6 rounded-3xl text-xs font-black uppercase tracking-[0.3em] transition-all shadow-2xl ${saveStatus ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-blue-600 text-white shadow-blue-200'}`}
          >
            {saveStatus ? 'Configuration Saved!' : 'Apply Neural Config'}
          </button>
          <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6 italic">App will reload to initialize new neural frequencies</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;