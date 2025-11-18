
import React from 'react';
import { 
    CheckCircleIcon, VirusIcon, LungsIcon, LinesIcon, HeartIcon, DropletIcon, 
    CircleDotIcon, WindIcon, BrokenBoneIcon, StomachIcon 
} from './IconComponents.tsx';

const conditions = [
    { name: "Normal", icon: <CheckCircleIcon /> },
    { name: "Tuberculosis", icon: <VirusIcon /> },
    { name: "Pneumonia", icon: <LungsIcon /> },
    { name: "Cardiomegaly", icon: <HeartIcon /> },
    { name: "Effusion", icon: <DropletIcon /> },
    { name: "Pneumothorax", icon: <WindIcon /> },
    { name: "Fracture", icon: <BrokenBoneIcon /> },
    { name: "Mass", icon: <CircleDotIcon /> },
];

const DetailsScreen: React.FC<{ onBack?: () => void }> = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-5 bg-slate-900 text-white rounded-3xl shadow-lg shadow-slate-200 mb-6">
        <h2 className="font-bold text-lg mb-2">Anviksha AI</h2>
        <p className="text-slate-300 text-sm leading-relaxed">
            Advanced medical imaging analysis powered by Google Gemini Pro. Designed for rapid triage and assistant diagnostics.
        </p>
      </div>

      <h3 className="text-sm font-bold text-slate-900 px-2 mb-3">Detectable Conditions</h3>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {conditions.map((c) => (
              <div key={c.name} className="flex items-center gap-4 p-4 border-b border-slate-50 last:border-0">
                  <div className="text-blue-500 text-xl">{c.icon}</div>
                  <span className="font-medium text-slate-700 text-sm">{c.name}</span>
              </div>
          ))}
      </div>
    </div>
  );
};

export default DetailsScreen;
