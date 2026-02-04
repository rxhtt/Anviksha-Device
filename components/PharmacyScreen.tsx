
import React, { useState } from 'react';
import { ArrowLeftIcon, PillIcon, SearchIcon, CheckCircleIcon, InfoIcon, AlertIcon, SparklesIcon } from './IconComponents.tsx';
import AIManager from '../services/aiManager.js';
import type { Medicine } from '../types.ts';

interface PharmacyScreenProps {
    onBack: () => void;
    aiManager: AIManager;
}

const PharmacyScreen: React.FC<PharmacyScreenProps> = ({ onBack, aiManager }) => {
    const [query, setQuery] = useState('');
    const [history, setHistory] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setIsLoading(true);
        setResult(null);
        try {
            const data = await aiManager.getPharmacySuggestions(query, history);
            setResult(data);
        } catch (error: any) {
            setResult({ error: error.message || "Neural Handshake Interrupted." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center gap-3 justify-center shrink-0 border-b border-slate-800">
                <div className="text-blue-400 animate-pulse"><SparklesIcon /></div>
                <div className="leading-tight">
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-100">Genesis Pharmacology</p>
                    <p className="text-[10px] font-medium text-slate-500 text-center">Indian Tier 2/3 Market Synthesis</p>
                </div>
            </div>

            <div className="px-6 py-6 bg-teal-900 text-white rounded-b-[2.5rem] shadow-xl shrink-0 z-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-700 rounded-full blur-[80px] opacity-20 -mr-20 -mt-20"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all border border-white/20">
                            <ArrowLeftIcon />
                        </button>
                        <h1 className="text-xl font-black tracking-tight uppercase">Drug Prescription</h1>
                        <div className="text-white text-2xl"><PillIcon /></div>
                    </div>

                    <div className="space-y-3">
                        <div className="relative">
                            <input 
                                type="text" 
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Diagnosis / Symptom (e.g. Fever, Cough)..."
                                className="w-full h-14 pl-12 pr-6 rounded-2xl bg-white text-slate-900 placeholder-slate-400 font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/30 transition-all shadow-lg"
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><SearchIcon /></div>
                        </div>
                        
                        <textarea 
                            value={history}
                            onChange={(e) => setHistory(e.target.value)}
                            placeholder="Patient History / Allergies..."
                            className="w-full h-16 p-4 rounded-2xl bg-teal-800/40 border border-white/10 text-white placeholder-teal-300/40 text-xs font-medium focus:outline-none focus:bg-teal-800/60 transition-all resize-none"
                        />

                        <button 
                            onClick={handleSearch}
                            disabled={isLoading}
                            className="w-full h-14 bg-white text-teal-950 rounded-2xl font-black text-sm hover:bg-teal-50 transition-all shadow-2xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {isLoading ? 'ANALYZING MARKET...' : 'SYNTHESIZE PRESCRIPTION'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-24 no-scrollbar">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-80 space-y-4">
                        <div className="w-16 h-16 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>
                        <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest text-center px-8">Consulting Chief Pharmacologist...<br/>Checking Indian Tier 2/3 Inventories</p>
                    </div>
                )}

                {result && (
                    <div className="space-y-4 animate-slideUp">
                        {result.error && (
                            <div className="bg-red-50 border border-red-200 p-6 rounded-3xl text-red-700 font-bold text-center shadow-lg">
                                <AlertIcon />
                                <p className="text-xs mt-2">{result.error}</p>
                            </div>
                        )}
                        
                        {!result.error && (
                            <>
                                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                    <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Synthesis Summary</h3>
                                    <p className="text-slate-900 font-bold text-sm leading-relaxed italic">
                                        "{result.diagnosisSummary}"
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {result.medicines?.map((med: Medicine, idx: number) => (
                                        <div key={idx} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 group">
                                            <div className="bg-slate-50 px-5 py-3 flex justify-between items-center border-b border-slate-100">
                                                <div className="flex gap-2">
                                                    <span className="text-[9px] font-black bg-blue-100 text-blue-700 px-3 py-1 rounded-full uppercase tracking-tighter">
                                                        {med.dosageSchedule}
                                                    </span>
                                                    <span className="text-[9px] font-black bg-teal-100 text-teal-700 px-3 py-1 rounded-full uppercase tracking-tighter">
                                                        {med.duration}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-black text-slate-900">₹{med.genericPrice} Est.</span>
                                            </div>
                                            
                                            <div className="p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h4 className="text-lg font-black text-slate-900 leading-tight">{med.name}</h4>
                                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">{med.genericName}</p>
                                                    </div>
                                                    <div className="text-[10px] font-black text-blue-500 uppercase px-2 py-1 bg-blue-50 rounded-lg">{med.timing}</div>
                                                </div>
                                                
                                                <div className="space-y-4">
                                                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                                        <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div> Layman Explanation
                                                        </p>
                                                        <p className="text-[13px] text-slate-700 font-bold leading-snug">{med.laymanExplanation}</p>
                                                    </div>

                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mechanism (Expert)</p>
                                                        <p className="text-xs text-slate-500 font-medium leading-relaxed italic">{med.expertNote}</p>
                                                    </div>

                                                    <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{med.marketAvailability}</p>
                                                    </div>
                                                </div>
                                                
                                                {med.contraindications && (
                                                    <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2 items-center text-red-500">
                                                        <AlertIcon />
                                                        <span className="text-[10px] font-black uppercase tracking-tight">WARNING: {med.contraindications}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        
                        <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] flex gap-4 items-center mb-10 shadow-xl">
                            <InfoIcon />
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Pharmacology Disclaimer</p>
                                <p className="text-[11px] font-bold leading-relaxed opacity-80">
                                    Indian drug synthesis protocol v4.2. Market pricing is estimated. Purchase requires a physical prescription from a registered practitioner.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PharmacyScreen;
