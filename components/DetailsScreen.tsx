
import React from 'react';
import { 
    LungsIcon, HeartIcon, ArrowLeftIcon, TriageIcon, DnaIcon, SparklesIcon, MicroscopeIcon
} from './IconComponents.tsx';

const DetailsScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans">
      
      <div className="relative h-64 bg-slate-950 rounded-b-[4rem] overflow-hidden mb-8 shrink-0 shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-black/90"></div>
        
        <div className="absolute bottom-12 left-8 right-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[9px] font-black text-white uppercase tracking-[0.3em] mb-4 border border-white/10">
                <SparklesIcon /> SYSTEM MANIFESTO V3.0
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter leading-none mb-1">Genesis</h1>
            <p className="text-blue-400 text-sm font-bold opacity-80 uppercase tracking-[0.2em] leading-none">Autonomous Digital Hospital</p>
        </div>
        
        <button onClick={onBack} className="absolute top-8 left-8 w-11 h-11 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 transition-all hover:bg-white/20">
            <ArrowLeftIcon />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-12 no-scrollbar">
          
          <section className="space-y-5">
              <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">The Neural Mission</h2>
              </div>
              <p className="text-slate-600 text-[15px] leading-relaxed font-bold">
                  Anviksha AI is an autonomous clinical infrastructure. We are democratizing world-class diagnostics for regions where specialists are scarce, using the world's most advanced neural reasoning models.
              </p>
              <div className="p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Conceptualized By</p>
                      <p className="text-xl font-black text-blue-600 tracking-tight">Rohit Bagewadi</p>
                  </div>
                  <div className="text-slate-100 text-5xl opacity-20"><MicroscopeIcon /></div>
              </div>
          </section>

          <section className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-1">Operational Domains</h3>
              <div className="grid gap-4">
                  {[
                    { icon: <LungsIcon />, title: "Imaging Core", desc: "X-Ray, MRI, and CT analysis with micro-detail detection." },
                    { icon: <HeartIcon />, title: "Vascular Hub", desc: "ECG interpretation and hemodynamic risk mapping." },
                    { icon: <DnaIcon />, title: "Drug Synthesis", desc: "Molecular mapping for Tier 2/3 Indian pharma markets." },
                    { icon: <TriageIcon />, title: "Clinical Triage", desc: "Symptom synthesis for rapid risk prioritization." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-5 items-center p-6 bg-white rounded-[2rem] border border-slate-50 transition-all hover:shadow-lg hover:border-slate-100">
                        <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl shrink-0 shadow-xl">{item.icon}</div>
                        <div>
                            <h4 className="font-black text-slate-900 text-[13px] uppercase tracking-tight leading-none mb-1.5">{item.title}</h4>
                            <p className="text-[11px] text-slate-500 font-bold leading-relaxed">{item.desc}</p>
                        </div>
                    </div>
                  ))}
              </div>
          </section>

          <div className="pt-8 border-t border-slate-200 text-center">
               <a href="https://anviksha-ai.vercel.app/" target="_blank" rel="noopener noreferrer" className="inline-block text-blue-600 text-[11px] font-black tracking-widest uppercase hover:underline mb-6">
                   Global Core Dashboard →
               </a>
               <p className="text-[9px] text-slate-300 font-black uppercase tracking-[0.5em] mb-10">
                   © 2025 GENESIS NEURAL • Bengaluru, India.
               </p>
          </div>

      </div>
    </div>
  );
};

export default DetailsScreen;
