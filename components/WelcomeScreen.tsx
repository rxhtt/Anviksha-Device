import React, { useRef, useState } from 'react';
import { CameraIcon, GalleryIcon, RecordsIcon, TriageIcon, InfoIcon, CheckCircleIcon, ChatBubbleIcon, PillIcon, PharmacyCrossIcon, TherapyIcon, AnvikshaLogo, UserIcon, UploadIcon } from './IconComponents.tsx';

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
    className={`relative overflow-hidden rounded-[2.5rem] text-left group transition-all duration-500 shadow-xl hover:shadow-2xl hover:-translate-y-2 active:scale-[0.98] ${featured ? 'col-span-2 h-72' : 'h-60'}`}
  >
    <div className={`absolute inset-0 ${color}`}>
      {image && <img src={image} alt={title} className="w-full h-full object-cover opacity-70 group-hover:opacity-40 group-hover:scale-110 transition-all duration-1000" />}
      <div className={`absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent`}></div>
    </div>
    <div className="absolute bottom-0 left-0 p-8 w-full z-10 transition-transform duration-500 group-hover:translate-y-[-8px]">
      {featured && (
        <div className="inline-flex items-center gap-2 bg-blue-500/20 backdrop-blur-xl px-4 py-1.5 rounded-full mb-4 border border-white/20">
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Priority Service</span>
        </div>
      )}
      {icon && <div className="text-white mb-3 text-4xl opacity-90 drop-shadow-2xl translate-y-2 group-hover:translate-y-0 transition-transform duration-500">{icon}</div>}
      <h3 className={`font-black text-white leading-tight mb-1.5 tracking-tight ${featured ? 'text-3xl' : 'text-xl'}`}>{title}</h3>
      <p className="text-slate-300 text-[11px] font-bold leading-snug uppercase tracking-widest opacity-80">{subtitle}</p>
    </div>
    <div className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0 z-10">
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
    </div>
  </button>
);

const ServiceButton: React.FC<{ icon: React.ReactNode, label: string, color: string, onClick: () => void }> = ({ icon, label, color, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-3 active:scale-95 transition-all group">
    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-xl transition-all shadow-sm ${color} group-hover:shadow-lg group-hover:-translate-y-1 border border-black/5`}>
      {icon}
    </div>
    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
  </button>
);

const ChecklistIconLarge: React.FC = () => (
  <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor">
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

interface WelcomeScreenProps {
  onOpenHub: () => void;
  onStartScan: (file: File) => void;
  onStartTriage: () => void;
  onShowRecords: () => void;
  onShowDetails: () => void;
  onOpenChat: () => void;
  onOpenPharmacy: () => void;
  onOpenTherapy?: () => void;
  onOpenProfile: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onOpenHub, onStartScan, onStartTriage, onShowRecords, onShowDetails,
  onOpenChat, onOpenPharmacy, onOpenTherapy, onOpenProfile
}) => {
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [profile] = useState<any>(() => {
    const saved = localStorage.getItem('anviksha_profile');
    return saved ? JSON.parse(saved) : { name: 'Guest' };
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onStartScan(file);
    }
  };

  return (
    <div className="flex flex-col min-h-full bg-[#f8fafc] page-transition relative">
      <input
        type="file"
        ref={galleryInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept="image/*"
      />

      <header className="px-8 pt-12 pb-10 bg-white border-b border-slate-100 shrink-0 z-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>

        <div className="flex justify-between items-center mb-10 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-900 rounded-[1.4rem] flex items-center justify-center text-white shadow-2xl shadow-slate-200">
              <AnvikshaLogo className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">Anviksha<span className="text-blue-600">.AI</span></h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Neural Medical Core</p>
            </div>
          </div>
          <button
            onClick={onOpenProfile}
            className="w-14 h-14 rounded-[1.4rem] bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm hover:bg-slate-50 transition-all active:scale-90"
          >
            <UserIcon />
          </button>
        </div>

        <div className="flex items-center justify-between bg-slate-50 rounded-[2rem] p-6 border border-slate-100/50 relative z-10 shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-blue-500 font-black text-lg shadow-sm capitalize">
              {profile.name[0]}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 opacity-70">Active Patient</p>
              <p className="text-lg font-black text-slate-900 leading-none">{profile.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Secured</span>
          </div>
        </div>
      </header>

      <main className="flex-1 px-8 py-12 no-scrollbar space-y-16">

        <section>
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] whitespace-nowrap leading-none">Clinical Matrix</h2>
            <div className="h-px w-full bg-slate-100"></div>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <FeatureCard
              title="Medical Hub"
              subtitle="Specialist Scans"
              onClick={onOpenHub}
              featured
              color="bg-slate-900"
              icon={<CameraIcon />}
            />
            <FeatureCard
              title="Records"
              subtitle="Ledger"
              onClick={onShowRecords}
              color="bg-white"
              icon={<RecordsIcon />}
            />
            <FeatureCard
              title="Triage"
              subtitle="Risk Score"
              onClick={onStartTriage}
              color="bg-white"
              icon={<TriageIcon />}
            />
          </div>
        </section>

        <section>
          <div className="flex items-center gap-4 mb-10">
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] whitespace-nowrap leading-none">Auxiliary Units</h2>
            <div className="h-px w-full bg-slate-100"></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <ServiceButton icon={<PharmacyCrossIcon />} label="Pharmacy" color="text-teal-600 bg-teal-50" onClick={onOpenPharmacy} />
            <ServiceButton icon={<TherapyIcon />} label="Therapy" color="text-indigo-600 bg-indigo-50" onClick={onOpenTherapy || (() => { })} />
            <ServiceButton icon={<ChatBubbleIcon />} label="Consult" color="text-blue-600 bg-blue-50" onClick={onOpenChat} />
          </div>
        </section>

        {/* Tactical Scanner Lab CTA */}
        <div className="bg-blue-600 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-200 group active:scale-[0.98] transition-all cursor-pointer">
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-125 transition-transform duration-1000 rotate-12"><ChecklistIconLarge /></div>
          <div className="relative z-10">
            <h3 className="text-3xl font-black tracking-tight mb-3">Neural Scan v2.5</h3>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-80 mb-10 max-w-[240px] leading-relaxed">Execute localized autonomous radiological imaging.</p>
            <button
              onClick={() => galleryInputRef.current?.click()}
              className="inline-flex items-center gap-4 bg-white text-blue-600 px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-xl hover:shadow-2xl active:translate-y-1 transition-all"
            >
              <UploadIcon /> Initialize Lab
            </button>
          </div>

          {/* Decorative Scanner Glow */}
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/20 rounded-full blur-[80px]"></div>
        </div>

        {/* Quick Info / Tips */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white/90">
          <div className="flex items-start gap-5">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0"><InfoIcon /></div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">Pro-Tip</h4>
              <p className="text-xs font-bold leading-relaxed opacity-80 italic">"Regularly updating your weight and conditions in the Patient Profile helps the AI provide more accurate localized dosages."</p>
            </div>
          </div>
        </div>

      </main>

      <footer className="p-8 text-center opacity-30">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.5em]">Guardian-Core v2.5.0-Deployment-01</p>
      </footer>
    </div>
  );
};

export default WelcomeScreen;
