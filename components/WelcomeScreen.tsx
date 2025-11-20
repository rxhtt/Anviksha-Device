
import React, { useRef } from 'react';
import { CameraIcon, GalleryIcon, RecordsIcon, TriageIcon, InfoIcon } from './IconComponents.tsx';

interface WelcomeScreenProps {
  onStartCamera: () => void;
  onStartScan: (file: File) => void;
  onStartTriage: () => void;
  onShowRecords: () => void;
  onShowDetails: () => void;
}

interface StatCardProps {
  value: string;
  label: string;
}

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

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartCamera, onStartScan, onStartTriage, onShowRecords, onShowDetails }) => {
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
            Anviksha<br/>AI Hospital
        </h1>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2 snap-x no-scrollbar">
        <StatCard value="AI-First" label="Triage" />
        <StatCard value="< 10s" label="Speed" />
        <StatCard value="Multi" label="Modalities" />
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
            gradient="linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)"
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
          <div className="flex gap-3">
             <button onClick={onShowRecords} className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm active:scale-[0.98] transition-transform flex flex-col items-center gap-2 hover:bg-slate-50">
                <div className="text-purple-600"><RecordsIcon /></div>
                <span className="text-xs font-bold text-slate-700">Records</span>
             </button>
             <button onClick={onShowDetails} className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm active:scale-[0.98] transition-transform flex flex-col items-center gap-2 hover:bg-slate-50">
                <div className="text-blue-600"><InfoIcon /></div>
                <span className="text-xs font-bold text-slate-700">About</span>
             </button>
          </div>
          <p className="text-[10px] text-slate-400 text-center mt-4">Version 2.1 • AI Powered</p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
