
import React, { useRef } from 'react';
import { CameraIcon, GalleryIcon, RecordsIcon, TriageIcon, InfoIcon, CheckCircleIcon, ChatBubbleIcon, PillIcon, PharmacyCrossIcon, TherapyIcon, MenuIcon, SparklesIcon } from './IconComponents.tsx';

interface WelcomeScreenProps {
  onOpenHub: () => void;
  onStartScan: (file: File) => void;
  onStartTriage: () => void;
  onShowRecords: () => void;
  onShowDetails: () => void;
  onOpenChat: () => void;
  onOpenPharmacy: () => void;
  onOpenTherapy?: () => void;
  onOpenSettings: () => void;
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
        className={`relative overflow-hidden rounded-[2rem] text-left group transition-all duration-300 shadow-sm hover:shadow-xl active:scale-[0.98] ${featured ? 'col-span-2 h-64' : 'h-52'}`}
    >
        <div className={`absolute inset-0 ${color}`}>
            {image && <img src={image} alt={title} className="w-full h-full object-cover opacity-80 group-hover:opacity-50 transition-all duration-700" />}
            <div className={`absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent`}></div>
        </div>
        <div className="absolute bottom-0 left-0 p-5 w-full z-10">
             {featured && (
                 <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-lg px-3 py-1 rounded-full mb-3 border border-white/20">
                     <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                     <span className="text-[9px] font-black text-white uppercase tracking-widest">Genesis Core Active</span>
                 </div>
             )}
             {icon && <div className="text-white mb-2 text-2xl drop-shadow-md">{icon}</div>}
             <h3 className={`font-black text-white leading-tight mb-0.5 tracking-tight ${featured ? 'text-2xl' : 'text-lg'}`}>{title}</h3>
             <p className="text-slate-300 text-[10px] font-bold leading-tight opacity-70 uppercase tracking-widest">{subtitle}</p>
        </div>
        <div className="absolute top-5 right-5 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 z-10">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
        </div>
    </button>
);

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onOpenHub, onStartScan, onStartTriage, onShowRecords, onShowDetails, onOpenChat, onOpenPharmacy, onOpenTherapy, onOpenSettings }) => {
    const galleryInputRef = useRef<HTMLInputElement>(null);
    
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onStartScan(file);
        }
    };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      <input 
        type="file" 
        ref={galleryInputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
        accept="image/*"
      />
      
      <div className="px-6 pt-10 pb-5 shrink-0">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-2">
                    Anviksha<br/>Genesis
                </h1>
                <span className="inline-block px-2 py-1 bg-blue-600 text-white text-[9px] font-black rounded-md uppercase tracking-[0.2em]">
                    Enterprise OS v3.0
                </span>
            </div>
            <div className="flex gap-2">
                <button onClick={onOpenSettings} className="w-11 h-11 rounded-xl bg-white hover:bg-slate-100 shadow-sm flex items-center justify-center text-slate-500 border border-slate-100 transition-all active:scale-90">
                    <MenuIcon />
                </button>
                <button onClick={onShowDetails} className="w-11 h-11 rounded-xl bg-white hover:bg-slate-100 shadow-sm flex items-center justify-center text-slate-500 border border-slate-100 transition-all active:scale-90">
                    <InfoIcon />
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-10 no-scrollbar">
          <div className="grid grid-cols-2 gap-3 px-4 pb-12">

              <FeatureCard 
                image="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80"
                title="Imaging Hub"
                subtitle="Expert Diagnostics"
                onClick={onOpenHub}
                featured
                color="bg-blue-900"
              />

              <FeatureCard 
                image="https://images.unsplash.com/photo-1584362917165-526a968579e8?auto=format&fit=crop&w=600&q=80"
                title="Triage Logic"
                subtitle="Clinical Risk Map"
                onClick={onStartTriage}
                color="bg-rose-900"
              />

              <FeatureCard 
                image="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80"
                title="Records"
                subtitle="Health History"
                onClick={onShowRecords}
                color="bg-indigo-900"
              />

              <FeatureCard 
                image="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80"
                title="Super Consult"
                subtitle="Expert Assistant"
                onClick={onOpenChat}
                color="bg-violet-900"
              />

              <FeatureCard 
                image="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=600&q=80"
                title="Pharmacy"
                subtitle="Molecular Synth"
                onClick={onOpenPharmacy}
                color="bg-teal-900"
              />

              <FeatureCard 
                image="https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=600&q=80"
                title="Wellness"
                subtitle="Mental Health"
                onClick={onOpenTherapy || (() => {})}
                color="bg-emerald-900"
              />

              <button 
                onClick={onShowDetails}
                className="col-span-2 mt-2 bg-white rounded-2xl p-5 flex flex-row items-center justify-between border border-slate-200 hover:bg-slate-50 transition-all group shadow-sm"
              >
                  <div className="flex items-center gap-3">
                    <div className="text-blue-600 text-2xl"><SparklesIcon /></div>
                    <div className="text-left">
                        <span className="block text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">Anviksha Neural Network</span>
                        <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Status: Online | Diagnostic Mode Active</span>
                    </div>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
              </button>

          </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
