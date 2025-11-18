import React, { useRef } from 'react';
import { StethoscopeIcon, CameraIcon, GalleryIcon, DemoIcon, RecordsIcon, InfoIcon } from './IconComponents';

interface WelcomeScreenProps {
  onStartCamera: () => void;
  onStartScan: (file: File) => void;
  onStartDemo: () => void;
  onShowRecords: () => void;
  onShowDetails: () => void;
}

interface StatCardProps {
  value: string;
  label: string;
}

const StatCard: React.FC<StatCardProps> = ({ value, label }) => (
  <div className="stat-card bg-slate-100/80 p-3 rounded-xl text-center">
    <div className="stat-value text-xl font-bold text-slate-800">{value}</div>
    <div className="stat-label text-xs text-slate-500 mt-1 uppercase tracking-wider">{label}</div>
  </div>
);

interface ActionCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
    isPrimary?: boolean;
}

const ActionCard: React.FC<ActionCardProps> = ({ icon, title, description, onClick, isPrimary = false }) => {
    const baseClasses = "action-card bg-white rounded-2xl p-4 text-center shadow-lg border transition-all transform active:scale-95 active:shadow-md cursor-pointer flex flex-col items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-xl";
    const primaryClasses = "border-blue-300 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/30";
    const secondaryClasses = "border-slate-200 text-slate-700";

    return (
        <div onClick={onClick} className={`${baseClasses} ${isPrimary ? primaryClasses : secondaryClasses}`}>
            <div className={`action-icon text-4xl ${isPrimary ? 'text-white' : 'text-blue-500'}`}>{icon}</div>
            <div>
                <div className="action-title font-bold text-base">{title}</div>
                <div className={`action-desc text-xs ${isPrimary ? 'opacity-90' : 'text-slate-500'}`}>{description}</div>
            </div>
        </div>
    );
};

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartCamera, onStartScan, onStartDemo, onShowRecords, onShowDetails }) => {
    const galleryInputRef = useRef<HTMLInputElement>(null);
    
    const handleGalleryClick = () => {
        galleryInputRef.current?.click();
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onStartScan(file);
        }
    };

  return (
    <div className="welcome-screen text-center">
      <input 
        type="file" 
        ref={galleryInputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
        accept="image/*"
      />
      <div className="text-6xl text-slate-800 mb-4 mx-auto w-fit"><StethoscopeIcon /></div>
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Medical AI Diagnostic Station</h1>
      <p className="text-slate-600 mb-8 max-w-md mx-auto">
        Powered by Google's Gemini, this station provides instant chest X-ray analysis for 14+ conditions.
        <span className="block font-semibold mt-1">An internet connection is required.</span>
      </p>
      
      <div className="stats-grid grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard value="₹150" label="Per Diagnosis" />
        <StatCard value="< 10s" label="Processing Time" />
        <StatCard value="14+" label="Conditions Detected" />
        <StatCard value="24/7" label="Availability" />
      </div>
      
       <div className="action-grid grid grid-cols-2 gap-4">
        <ActionCard
          icon={<CameraIcon />}
          title="Start Scan"
          description="Live camera capture"
          onClick={onStartCamera}
          isPrimary={true}
        />
         <ActionCard
          icon={<GalleryIcon />}
          title="Upload"
          description="Select from device"
          onClick={handleGalleryClick}
        />
        <ActionCard
          icon={<RecordsIcon />}
          title="Records"
          description="View patient history"
          onClick={onShowRecords}
        />
        <ActionCard
          icon={<DemoIcon />}
          title="Demo Mode"
          description="Test with samples"
          onClick={onStartDemo}
        />
      </div>
      
      <div className="mt-8">
        <button 
            onClick={onShowDetails}
            className="text-blue-600 hover:text-blue-800 font-semibold py-2.5 px-4 rounded-full flex items-center justify-center gap-2 w-full max-w-xs mx-auto bg-blue-100 hover:bg-blue-200 transition-colors"
        >
            <InfoIcon /> Learn What Anviksha AI Can Detect
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
