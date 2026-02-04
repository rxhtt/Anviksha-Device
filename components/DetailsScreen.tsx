
import React from 'react';
import { 
    CheckCircleIcon, LungsIcon, HeartIcon, BrainIcon, MicroscopeIcon, ArrowLeftIcon, TriageIcon, DnaIcon
} from './IconComponents.tsx';

const DetailsScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  return (
    <div className="flex flex-col h-full bg-white">
      
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
          
          <section>
              <h2 className="text-xl font-bold text-slate-900 mb-2">About the App</h2>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  Anviksha AI is a comprehensive <strong>Digital Hospital</strong> offering over 25+ medical specialities. Powered by medically-aligned algorithms and High-Precision Generative models, it brings expert-level diagnostics to your pocket.
              </p>
              <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <p className="text-xs text-blue-800 font-bold">Innovation and Concept by <br/><span className="text-base text-blue-900">Rohit Bagewadi</span></p>
              </div>
          </section>

          <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">25+ Diagnostic Specialities</h3>
              <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><LungsIcon /></div>
                      <div>
                          <h4 className="font-bold text-slate-900 text-sm">Full Body Radiology</h4>
                          <p className="text-xs text-slate-500 mt-1 leading-5">X-Ray, CT, and MRI analysis for Lungs, Brain, Spine, and Fractures.</p>
                      </div>
                  </div>
                  <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0"><HeartIcon /></div>
                      <div>
                          <h4 className="font-bold text-slate-900 text-sm">Advanced Cardiology</h4>
                          <p className="text-xs text-slate-500 mt-1 leading-5">12-Lead ECG interpretation, Arrhythmia detection, and vascular health check.</p>
                      </div>
                  </div>
                  <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0"><DnaIcon /></div>
                      <div>
                          <h4 className="font-bold text-slate-900 text-sm">Lab & Genetic Analysis</h4>
                          <p className="text-xs text-slate-500 mt-1 leading-5">Full blood work analysis (CBC, Metabolic), Urinalysis, and Pathology slides.</p>
                      </div>
                  </div>
                   <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0"><MicroscopeIcon /></div>
                      <div>
                          <h4 className="font-bold text-slate-900 text-sm">Specialist Care</h4>
                          <p className="text-xs text-slate-500 mt-1 leading-5">Dermatology, Ophthalmology (Eye), Dental, Pediatrics, and Gynecology.</p>
                      </div>
                  </div>
                  <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><TriageIcon /></div>
                      <div>
                          <h4 className="font-bold text-slate-900 text-sm">Triage & Wellness</h4>
                          <p className="text-xs text-slate-500 mt-1 leading-5">Symptom checking, Mental Health screening, Diet Plans, and Vaccine tracking.</p>
                      </div>
                  </div>
              </div>
          </section>

           <section className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <CheckCircleIcon /> Clinical Accuracy
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Models calibrated against standard medical datasets.
              </p>
          </section>

          <div className="pt-4 border-t border-slate-100 text-center">
               <a href="https://anviksha-ai.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs font-bold hover:underline mb-4 block">
                   https://anviksha-ai.vercel.app/
               </a>
               <p className="text-[10px] text-slate-400 mt-2">
                   © 2025 Anviksha AI.
               </p>
          </div>

      </div>
    </div>
  );
};

export default DetailsScreen;
