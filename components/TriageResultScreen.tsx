
import React from 'react';
import type { TriageResult } from '../types.ts';
import { AlertIcon, CheckCircleIcon, CameraIcon, ArrowLeftIcon, InfoIcon, HomeIcon } from './IconComponents.tsx';

interface TriageResultScreenProps {
    result: TriageResult;
    onProceedToXRay: () => void;
    onBack: () => void;
}

const TriageResultScreen: React.FC<TriageResultScreenProps> = ({ result, onProceedToXRay, onBack }) => {
    const { recommendation, riskScore, urgencyLabel, reasoning } = result;

    let themeClass = '';
    let icon = null;
    let actionText = '';
    let showXRayBtn = false;
    let accentColor = '';
    let btnColor = '';

    switch (recommendation) {
        case 'GET_XRAY':
            themeClass = 'bg-red-50/50';
            accentColor = 'text-red-600 bg-red-100';
            btnColor = 'bg-red-600 hover:bg-red-700 shadow-red-200';
            icon = <AlertIcon />;
            actionText = 'X-Ray Recommended';
            showXRayBtn = true;
            break;
        case 'CONSIDER_XRAY':
            themeClass = 'bg-amber-50/50';
            accentColor = 'text-amber-600 bg-amber-100';
            btnColor = 'bg-amber-600 hover:bg-amber-700 shadow-amber-200';
            icon = <InfoIcon />;
            actionText = 'Review Symptoms';
            showXRayBtn = true;
            break;
        case 'NO_XRAY':
        default:
            themeClass = 'bg-emerald-50/50';
            accentColor = 'text-emerald-600 bg-emerald-100';
            btnColor = 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200';
            icon = <CheckCircleIcon />;
            actionText = 'No X-Ray Needed';
            showXRayBtn = false;
            break;
    }

    return (
        <div className={`flex flex-col h-full -m-0 bg-white`}>
            
            <div className={`px-6 pt-10 pb-8 text-center rounded-b-[3rem] ${themeClass}`}>
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-5 mx-auto ${accentColor} shadow-sm`}>
                    {icon}
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{actionText}</h2>
                <p className="text-slate-500 font-bold mt-2 text-sm uppercase tracking-wide">{urgencyLabel}</p>
            </div>

            <div className="flex-1 px-6 py-6 overflow-y-auto">
                <div className="bg-white rounded-3xl p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-100 mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <ChecklistIconLarge />
                    </div>
                    
                    <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-6">
                        <div className="flex flex-col">
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Risk Score</span>
                             <span className={`text-5xl font-black tracking-tighter ${recommendation === 'GET_XRAY' ? 'text-red-600' : recommendation === 'CONSIDER_XRAY' ? 'text-amber-500' : 'text-emerald-600'}`}>
                                {riskScore}%
                            </span>
                        </div>
                        <div className="h-12 w-px bg-slate-100 mx-4"></div>
                        <div className="flex-1">
                            <div className="text-xs font-medium text-slate-500 leading-snug">
                                Based on clinical symptoms provided.
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> AI Reasoning
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                            {reasoning}
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-white border-t border-slate-50">
                <div className="flex gap-3">
                    <button 
                        onClick={onBack}
                        className="flex-1 h-12 rounded-xl bg-white border-2 border-slate-100 text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                       <HomeIcon /> Home
                    </button>
                    
                    {showXRayBtn && (
                        <button 
                            onClick={onProceedToXRay}
                            className={`flex-[1.5] h-12 rounded-xl text-white font-bold shadow-lg hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm ${btnColor}`}
                        >
                            <CameraIcon /> Start X-Ray
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const ChecklistIconLarge: React.FC = () => (
    <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default TriageResultScreen;
