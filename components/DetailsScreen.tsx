
import React from 'react';
import { 
    CheckCircleIcon, LungsIcon, HeartIcon, DropIcon, 
    BrainIcon, MicroscopeIcon, ArrowLeftIcon, TriageIcon,
    VirusIcon
} from './IconComponents.tsx';

const DetailsScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <div className="flex flex-col h-full bg-white">
      
      {/* Header Image / Banner */}
      <div className="relative h-56 bg-slate-900 rounded-b-[3rem] overflow-hidden mb-6 shrink-0 shadow-2xl shadow-slate-200">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-indigo-900 opacity-90"></div>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-blue-500/30 rounded-full blur-3xl"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-8">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-widest mb-3 border border-white/10">
                AI Healthcare Revolution
            </span>
            <h1 className="text-4xl font-bold text-white tracking-tight leading-none mb-2">Anviksha AI</h1>
            <p className="text-blue-100 text-sm font-medium opacity-90">The Future of Digital Hospitals.</p>
        </div>
        
        <button onClick={onBack} className="absolute top-6 left-6 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all z-10">
            <ArrowLeftIcon />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-10 space-y-10">
          
          {/* Introduction */}
          <section>
              <h2 className="text-xl font-bold text-slate-900 mb-2">About the App</h2>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  Anviksha AI is a fully-fledged <strong>AI Hospital</strong> designed to bring premium medical diagnostics to remote and underserved areas. Powered by Google's Gemini 2.5 Pro multimodal AI, it analyzes medical imagery and symptoms with specialist-level accuracy in seconds.
              </p>
          </section>

          {/* Core Features */}
          <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Diagnostic Capabilities</h3>
              <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><LungsIcon /></div>
                      <div>
                          <h4 className="font-bold text-slate-900 text-sm">Chest X-Ray Analysis</h4>
                          <p className="text-xs text-slate-500 mt-1 leading-5">Detects Pneumonia, Tuberculosis, Nodules, Effusions, and Cardiomegaly with high precision.</p>
                      </div>
                  </div>
                  <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0"><HeartIcon /></div>
                      <div>
                          <h4 className="font-bold text-slate-900 text-sm">ECG / EKG Cardiology</h4>
                          <p className="text-xs text-slate-500 mt-1 leading-5">Reads ECG strips to identify Arrhythmias, Atrial Fibrillation, Ischemia, and Myocardial Infarction signs.</p>
                      </div>
                  </div>
                  <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0"><BrainIcon /></div>
                      <div>
                          <h4 className="font-bold text-slate-900 text-sm">MRI & CT Neurology</h4>
                          <p className="text-xs text-slate-500 mt-1 leading-5">Scans brain and spine MRIs for Tumors, Lesions, Hematomas, and early signs of Stroke.</p>
                      </div>
                  </div>
                   <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0"><MicroscopeIcon /></div>
                      <div>
                          <h4 className="font-bold text-slate-900 text-sm">Dermatology</h4>
                          <p className="text-xs text-slate-500 mt-1 leading-5">Analyzes skin lesions for ABCDE rule compliance to detect Melanoma, Eczema, and Psoriasis.</p>
                      </div>
                  </div>
                  <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><TriageIcon /></div>
                      <div>
                          <h4 className="font-bold text-slate-900 text-sm">Smart Triage</h4>
                          <p className="text-xs text-slate-500 mt-1 leading-5">Uses patient symptoms and visual observations to calculate risk scores and recommend next steps.</p>
                      </div>
                  </div>
              </div>
          </section>

          {/* Privacy Section */}
           <section className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <CheckCircleIcon /> Privacy & Security
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  This application is designed with privacy-first architecture.
              </p>
              <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-xs text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      API Keys are stored locally on your device.
                  </li>
                   <li className="flex items-center gap-2 text-xs text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      Patient records are persisted in LocalStorage only.
                  </li>
                   <li className="flex items-center gap-2 text-xs text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      Images are processed in memory and not permanently stored on any server.
                  </li>
              </ul>
          </section>

          {/* Footer Info */}
          <div className="pt-4 border-t border-slate-100">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Technical Stack</h3>
               <div className="flex flex-wrap gap-2">
                   <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md uppercase">React 18</span>
                   <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md uppercase">TailwindCSS</span>
                   <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md uppercase">Google Gemini API</span>
                   <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md uppercase">Vite</span>
               </div>
               <p className="text-[10px] text-slate-400 mt-6 text-center">
                   © 2024 Anviksha AI. For research and demonstration purposes only.<br/>Not a replacement for professional medical advice.
               </p>
          </div>

      </div>
    </div>
  );
};

export default DetailsScreen;
