
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
            themeClass = 'from-red-50 to-white';
            accentColor = 'text-red-600 bg-red-100/50';
            btnColor = 'bg-red-600 shadow-red-200';
            icon = <AlertIcon />;
            actionText = 'Critical Indication';
            showXRayBtn = true;
            break;
        case 'CONSIDER_XRAY':
            themeClass = 'from-amber-50 to-white';
            accentColor = 'text-amber-600 bg-amber-100/50';
            btnColor = 'bg-slate-900 shadow-slate-200';
            icon = <InfoIcon />;
            actionText = 'Observation Required';
            showXRayBtn = true;
            break;
        case 'NO_XRAY':
        default:
            themeClass = 'from-emerald-50 to-white';
            accentColor = 'text-emerald-600 bg-emerald-100/50';
            btnColor = 'bg-slate-900 shadow-slate-200';
            icon = <CheckCircleIcon />;
            actionText = 'Baseline Normal';
            showXRayBtn = false;
            break;
    }

    return (
        <div className={`flex flex-col h-full bg-white page-transition`}>

            <div className={`px-8 pt-12 pb-12 text-center rounded-b-[3.5rem] bg-gradient-to-b ${themeClass} shadow-sm relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center text-4xl mb-6 mx-auto ${accentColor} border border-white/50 shadow-xl shadow-slate-200/50`}>
                    {icon}
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-3">{actionText}</h2>
                <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-white shadow-sm">
                    <span className={`w-2 h-2 rounded-full animate-pulse ${recommendation === 'GET_XRAY' ? 'bg-red-500' : recommendation === 'CONSIDER_XRAY' ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{urgencyLabel}</span>
                </div>
            </div>

            <div className="flex-1 px-8 py-10 overflow-y-auto no-scrollbar">
                <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/60 border border-slate-100 mb-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] scale-150 transition-transform duration-1000 group-hover:rotate-12">
                        <ChecklistIconLarge />
                    </div>

                    <div className="flex justify-between items-center mb-10 pb-8 border-b border-slate-50">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Neural Risk Index</span>
                            <div className="flex items-baseline gap-2">
                                <span className={`text-6xl font-black tracking-tighter ${recommendation === 'GET_XRAY' ? 'text-red-600' : recommendation === 'CONSIDER_XRAY' ? 'text-amber-500' : 'text-emerald-600'}`}>
                                    {riskScore}
                                </span>
                                <span className="text-xl font-black text-slate-300">%</span>
                            </div>
                        </div>
                        <div className="h-16 w-px bg-slate-100 mx-6"></div>
                        <div className="flex-1">
                            <p className="text-[11px] font-bold text-slate-400 leading-relaxed max-w-[120px]">
                                Calculated based on multi-variate symptom analysis.
                            </p>
                        </div>
                    </div>

                    <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span> Internal Logic
                        </h3>
                        <p className="text-sm text-slate-800 leading-relaxed font-bold tracking-tight">
                            {reasoning}
                        </p>
                    </div>
                </div>

                <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-3xl flex gap-4 items-center mb-8">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm shrink-0"><InfoIcon /></div>
                    <p className="text-[10px] text-blue-800 font-bold leading-relaxed italic">
                        The AI suggests further scans based on pattern matching with similar clinical cases.
                    </p>
                </div>
            </div>

            <div className="p-8 bg-white border-t border-slate-100 shrink-0">
                <div className="flex gap-4">
                    <button
                        onClick={onBack}
                        className="flex-1 h-16 rounded-[2rem] bg-slate-50 text-slate-500 font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100 flex items-center justify-center gap-3 text-[10px]"
                    >
                        <HomeIcon /> Portal
                    </button>

                    {showXRayBtn && (
                        <button
                            onClick={onProceedToXRay}
                            className={`flex-[1.5] h-16 rounded-[2rem] text-white font-black uppercase tracking-[0.2em] shadow-xl hover:translate-y-[-4px] active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-[10px] ${btnColor}`}
                        >
                            <CameraIcon /> Launch Imaging
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
