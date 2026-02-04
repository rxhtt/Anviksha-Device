
import React, { useRef } from 'react';
import { CameraIcon, GalleryIcon, RecordsIcon, TriageIcon, InfoIcon, CheckCircleIcon, ChatBubbleIcon, PillIcon, PharmacyCrossIcon, TherapyIcon } from './IconComponents.tsx';

interface WelcomeScreenProps {
  onOpenHub: () => void;
  onStartScan: (file: File) => void;
  onStartTriage: () => void;
  onShowRecords: () => void;
  onShowDetails: () => void;
  onOpenChat: () => void;
  onOpenPharmacy: () => void;
  onOpenTherapy?: () => void;
}

interface FeatureCardProps {
    image?: string;
    title: string;
    subtitle: string;
    onClick: () => void;
    featured?: boolean;
    color?: string;
    icon?: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ image, title, subtitle, onClick, featured, color = "bg-slate-900", icon }) => (
    <button 
        onClick={onClick}
        className={`relative overflow-hidden rounded-[2rem] text-left group transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] active:scale-[0.98] ${featured ? 'col-span-2 h-64' : 'h-56'}`}
    >
        <div className={`absolute inset-0 ${color}`}>
            {image && <img src={image} alt={title} className="w-full h-full object-cover opacity-80 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700" />}
            <div className={`absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent`}></div>
        </div>
        <div className="absolute bottom-0 left-0 p-5 w-full z-10">
             {featured && (
                 <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full mb-3 border border-white/20">
                     <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                     <span className="text-[10px] font-bold text-white uppercase tracking-wider">Genesis Core</span>
                 </div>
             )}
             {icon && <div className="text-white mb-2 text-3xl opacity-90 drop-shadow-md">{icon}</div>}
             <h3 className={`font-bold text-white leading-tight mb-0.5 ${featured ? 'text-2xl' : 'text-lg'}`}>{title}</h3>
             <p className="text-slate-300 text-[11px] font-medium leading-snug">{subtitle}</p>
        </div>
        <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 z-10">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </div>
    </button>
);

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onOpenHub, onStartScan, onStartTriage, onShowRecords, onShowDetails, onOpenChat, onOpenPharmacy, onOpenTherapy }) => {
    const galleryInputRef = useRef<HTMLInputElement>(null);
    
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onStartScan(file);
        }
    };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <input 
        type="file" 
        ref={galleryInputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
        accept="image/*"
      />
      
      <div className="px-5 pt-6 pb-4">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">
                    Anviksha<br/>Genesis
                </h1>
                <span className="inline-block mt-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase tracking-wide">
                    World's First Neural Hospital
                </span>
            </div>
            <button onClick={onShowDetails} className="w-10 h-10 rounded-full bg-white hover:bg-slate-100 shadow-sm flex items-center justify-center text-slate-600 transition-colors">
                <InfoIcon />
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-8 no-scrollbar">
          <div className="grid grid-cols-2 gap-3 px-3">

              <FeatureCard 
                image="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80"
                title="Diagnostic Hub"
                subtitle="Imaging Workflow (Live)"
                onClick={onOpenHub}
                featured
                color="bg-blue-900"
              />

              <FeatureCard 
                image="https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&w=600&q=80"
                title="Triage Algo"
                subtitle="Risk Calculation"
                onClick={onStartTriage}
              />

              <FeatureCard 
                image="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80"
                title="Records"
                subtitle="Encrypted Session"
                onClick={onShowRecords}
                color="bg-indigo-900"
              />

              <FeatureCard 
                image="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80"
                title="Lab Reports"
                subtitle="OCR Analysis (Beta)"
                onClick={() => galleryInputRef.current?.click()}
              />

              <FeatureCard 
                image="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=600&q=80"
                title="Medicine DB"
                subtitle="Generic Mapping"
                onClick={onOpenPharmacy}
                color="bg-emerald-900"
              />

              <FeatureCard 
                image="https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=600&q=80"
                title="Wellness"
                subtitle="Conversational AI"
                onClick={onOpenTherapy || (() => {})}
                color="bg-teal-900"
              />

              <FeatureCard 
                image="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80"
                title="AI Consult"
                subtitle="Genesis Assistant"
                onClick={onOpenChat}
                color="bg-violet-900"
              />

              <button 
                onClick={onShowDetails}
                className="col-span-2 mt-2 bg-slate-100 rounded-[2rem] p-5 flex flex-row items-center justify-center gap-3 border border-slate-200 hover:bg-slate-200 transition-colors group"
              >
                  <div className="text-blue-600"><CheckCircleIcon /></div>
                  <div className="text-left">
                    <span className="block text-xs font-bold text-slate-900 uppercase tracking-wide">Powered by Genesis Neural Core</span>
                    <span className="block text-[10px] text-slate-500">Tap for methodology</span>
                  </div>
              </button>

          </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
