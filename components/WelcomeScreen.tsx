
import React, { useRef } from 'react';
import { StethoscopeIcon, CameraIcon, GalleryIcon, DemoIcon, RecordsIcon, SettingsIcon, TriageIcon } from './IconComponents.tsx';
import type { ApiKeyStatus } from '../types.ts';

interface WelcomeScreenProps {
  onStartCamera: () => void;
  onStartScan: (file: File) => void;
  onStartDemo: () => void;
  onStartTriage: () => void;
  onShowRecords: () => void;
  onShowDetails: () => void;
  onShowSettings: () => void;
  apiKeyStatus: ApiKeyStatus;
}

interface StatCardProps {
  value: string;
  label: string;
}

const ApiKeyWarning: React.FC<{ status: ApiKeyStatus, onSettingsClick: () => void }> = ({ status, onSettingsClick }) => {
    if (status === 'valid' || status === 'testing') return null;

    return (
        <button onClick={onSettingsClick} className="w-full mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center justify-between shadow-sm active:scale-[0.98] transition-transform">
            <div className="text-left">
                <p className="font-bold text-sm">Setup Required</p>
                <p className="text-xs opacity-80">Configure API Key to start.</p>
            </div>
            <div className="bg-red-200/50 p-2 rounded-full">
                <SettingsIcon />
            </div>
        </button>
    );
};

const StatCard: React.FC<StatCardProps> = ({ value, label }) => (
  <div className="flex flex-col items-start min-w-[90px] p-3 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
    <span className="text-lg font-bold text-slate-900 tracking-tight">{value}</span>
    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide mt-0.5">{label}</span>
  </div>
);

interface ActionCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
    primary?: boolean;
    gradient?: string;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon, title, description, onClick, primary, gradient }) => {
    return (
        <button 
            onClick={onClick} 
            className={`relative w-full text-left p-5 rounded-[1.5rem] transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.1)] active:scale-[0.97] flex flex-col justify-between h-36 group overflow-hidden ${primary ? 'text-white' : 'bg-white text-slate-800 border border-slate-50'}`}
            style={primary && gradient ? { background: gradient } : {}}
        >
            <div className={`text-3xl ${primary ? 'text-white/90' : 'text-blue-500 group-hover:scale-110 transition-transform duration-300'}`}>
                {icon}
            </div>
            <div className="relative z-10">
                <h3 className={`font-bold text-lg leading-tight mb-1 ${primary ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
                <p className={`text-xs font-medium ${primary ? 'text-white/70' : 'text-slate-400'}`}>{description}</p>
            </div>
            {/* Decorative blob for primary cards */}
            {primary && <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>}
        </button>
    );
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartCamera, onStartScan, onStartDemo, onStartTriage, onShowRecords, onShowDetails, onShowSettings, apiKeyStatus }) => {
    const galleryInputRef = useRef<HTMLInputElement>(null);
    
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onStartScan(file);
        }
    };

  return (
    <div className="flex flex-col h-full">
      <input 
        type="file" 
        ref={galleryInputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
        accept="image/*"
      />
      
      <div className="mb-6 px-2">
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-1">Clinic Station</p>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">
            Medical Triage <br/>& Analysis
        </h1>
      </div>

      <ApiKeyWarning status={apiKeyStatus} onSettingsClick={onShowSettings} />

      <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2 snap-x no-scrollbar">
        <StatCard value="AI-First" label="Triage" />
        <StatCard value="< 10s" label="Speed" />
        <StatCard value="15+" label="Conditions" />
        <StatCard value="Local" label="Secure" />
      </div>
      
       <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="col-span-2">
            <ActionCard
            icon={<TriageIcon />}
            title="Start Screening"
            description="Symptom & Visual Triage"
            onClick={onStartTriage}
            primary
            gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
            />
        </div>
        <ActionCard
          icon={<CameraIcon />}
          title="Scan X-Ray"
          description="Use Camera"
          onClick={onStartCamera}
        />
         <ActionCard
          icon={<GalleryIcon />}
          title="Upload"
          description="From Gallery"
          onClick={() => galleryInputRef.current?.click()}
        />
      </div>
      
      <div className="mt-auto">
          <h3 className="text-sm font-bold text-slate-900 mb-3 px-2">Tools & Settings</h3>
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
             <button onClick={onStartDemo} className="w-full flex items-center gap-4 p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors text-left">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-full"><DemoIcon /></div>
                <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-sm">Demo Mode</div>
                    <div className="text-xs text-slate-400">Try without an API Key</div>
                </div>
             </button>
             <button onClick={onShowRecords} className="w-full flex items-center gap-4 p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors text-left">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-full"><RecordsIcon /></div>
                <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-sm">Patient Records</div>
                    <div className="text-xs text-slate-400">View saved reports</div>
                </div>
             </button>
             <button onClick={onShowSettings} className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors text-left">
                <div className="p-2 bg-slate-100 text-slate-600 rounded-full"><SettingsIcon /></div>
                <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-sm">Settings</div>
                    <div className="text-xs text-slate-400">API Configuration</div>
                </div>
             </button>
          </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
