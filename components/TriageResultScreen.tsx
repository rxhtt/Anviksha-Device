import React from 'react';
import type { TriageResult } from '../types.ts';
import { AlertIcon, CheckCircleIcon, CameraIcon, ArrowLeftIcon, InfoIcon } from './IconComponents.tsx';

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

    switch (recommendation) {
        case 'GET_XRAY':
            themeClass = 'from-red-50 to-white';
            accentColor = 'text-red-600 bg-red-100';
            icon = <AlertIcon />;
            actionText = 'X-Ray Recommended';
            showXRayBtn = true;
            break;
        case 'CONSIDER_XRAY':
            themeClass = 'from-amber-50 to-white';
            accentColor = 'text-amber-600 bg-amber-100';
            icon = <InfoIcon />;
            actionText = 'Review Symptoms';
            showXRayBtn = true;
            break;
        case 'NO_XRAY':
        default:
            themeClass = 'from-emerald-50 to-white';
            accentColor = 'text-emerald-600 bg-emerald-100';
            icon = <CheckCircleIcon />;
            actionText = 'No X-Ray Needed';
            showXRayBtn = false;
            break;
    }

    return (
        <div className={`flex flex-col h-full -m-6 p-6 bg-gradient-to-b ${themeClass}`}>
            <div className="flex flex-col items-center justify-center pt-6 pb-8 text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 ${accentColor} shadow-sm`}>
                    {icon}
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{actionText}</h2>
                <p className="text-slate-500 font-medium mt-1 text-sm max-w-xs mx-auto">{urgencyLabel}</p>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 mb-6">
                <div className="flex justify-between items-end mb-4 border-b border-slate-50 pb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Risk Probability</span>
                    <div className="flex items-baseline">
                        <span className={`text-4xl font-black tracking-tighter ${recommendation === 'GET_XRAY' ? 'text-red-600' : recommendation === 'CONSIDER_XRAY' ? 'text-amber-500' : 'text-emerald-600'}`}>
                            {riskScore}
                        </span>
                        <span className="text-sm text-slate-400 ml-1 font-bold">%</span>
                    </div>
                </div>
                
                <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-2">AI Assessment</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        {reasoning}
                    </p>
                </div>
            </div>

            <div className="flex-grow"></div>

            <div className="space-y-3 mt-4">
                {showXRayBtn && (
                    <button 
                        onClick={onProceedToXRay}
                        className="w-full h-14 rounded-2xl bg-slate-900 text-white font-bold shadow-xl shadow-slate-200 hover:shadow-2xl hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 text-sm tracking-wide"
                    >
                        <CameraIcon /> Proceed to X-Ray
                    </button>
                )}
                <button 
                    onClick={onBack}
                    className="w-full h-14 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm tracking-wide"
                >
                   <ArrowLeftIcon /> Return Home
                </button>
            </div>
        </div>
    );
};

export default TriageResultScreen;