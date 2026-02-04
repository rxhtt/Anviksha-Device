
import React, { useState } from 'react';
import { ArrowLeftIcon, PillIcon, SearchIcon, CheckCircleIcon, InfoIcon, AlertIcon, SparklesIcon } from './IconComponents.tsx';
import AIManager from '../services/aiManager.js';
import type { PharmacyResult, Medicine } from '../types.ts';

interface PharmacyScreenProps {
    onBack: () => void;
    aiManager: AIManager;
}

const PharmacyScreen: React.FC<PharmacyScreenProps> = ({ onBack, aiManager }) => {
    const [query, setQuery] = useState('');
    const [history, setHistory] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<PharmacyResult | null>(null);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setIsLoading(true);
        setResult(null);
        try {
            const data = await aiManager.getPharmacySuggestions(query, history);
            setResult(data);
        } catch (error) {
            alert("Neural Synthesis Error. Verify API keys.");
        } finally {
            setIsLoading(false);
        }
    };

    const getTierColor = (tier: string) => {
        switch(tier) {
            case 'Budget': return 'bg-emerald-100 text-emerald-700';
            case 'Premium': return 'bg-blue-100 text-blue-700';
            case 'Specialized': return 'bg-purple-100 text-purple-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            
            <div className="bg-slate-900 text-white px-4 py-2 flex items-center gap-3 justify-center shrink-0 border-b border-slate-800">
                <div className="text-blue-400 animate-pulse"><SparklesIcon /></div>
                <div className="leading-tight">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Anviksha Neural Pharmacy</p>
                    <p className="text-[10px] font-medium text-slate-500">3-Stage Synthesis: OpenFDA • Neural Synthesis • Market Logic</p>
                </div>
            </div>

            <div className="px-4 py-6 bg-teal-900 text-white rounded-b-[2.5rem] shadow-xl shrink-0 z-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-teal-700 rounded-full blur-3xl opacity-40 -mr-16 -mt-16"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-md border border-white/10">
                            <ArrowLeftIcon />
                        </button>
                        <h1 className="text-xl font-black tracking-tight uppercase">Pharmacy Pipeline</h1>
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                            <PillIcon />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="relative">
                            <input 
                                type="text" 
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Condition (e.g. Chronic Cough)..."
                                className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white text-slate-900 placeholder-slate-400 font-bold shadow-xl focus:outline-none focus:ring-4 focus:ring-teal-500/30 transition-all"
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><SearchIcon /></div>
                        </div>
                        
                        <div className="relative">
                            <input 
                                type="text" 
                                value={history}
                                onChange={(e) => setHistory(e.target.value)}
                                placeholder="Medical History (e.g. Allergic to Sulfa)..."
                                className="w-full h-12 pl-4 pr-4 rounded-xl bg-teal-800/50 border border-white/10 text-white placeholder-teal-300/50 text-xs font-medium focus:outline-none focus:bg-teal-800 transition-all"
                            />
                        </div>

                        <button 
                            onClick={handleSearch}
                            disabled={isLoading}
                            className="w-full h-14 bg-white text-teal-900 rounded-2xl font-black text-sm hover:bg-teal-50 transition-all shadow-xl shadow-teal-950/20 active:scale-95 disabled:opacity-50"
                        >
                            {isLoading ? 'EXECUTING SYNTHESIS...' : 'RUN NEURAL ANALYSIS'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-12">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-64 space-y-6">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-teal-600"><SparklesIcon /></div>
                        </div>
                        <div className="text-center">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Processing Pipeline</p>
                            <p className="text-slate-600 text-sm font-bold">Querying OpenFDA & Researching Market Pricing...</p>
                        </div>
                    </div>
                )}

                {!isLoading && !result && (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-300">
                        <div className="text-6xl mb-4 opacity-20"><PillIcon /></div>
                        <p className="text-sm font-bold uppercase tracking-widest opacity-50">Awaiting Synthesis Query</p>
                    </div>
                )}

                {result && (
                    <div className="space-y-6 animate-slideUp">
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-4 text-emerald-500 opacity-10 scale-150"><CheckCircleIcon /></div>
                             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Neural Synthesis Result</h3>
                             <p className="text-slate-900 font-bold leading-relaxed text-sm">
                                {result.diagnosis}
                             </p>
                        </div>

                        <div className="space-y-4">
                            {result.medicines.map((med, index) => (
                                <div key={index} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 group">
                                    <div className="bg-slate-50 px-5 py-3 flex justify-between items-center border-b border-slate-100">
                                        <div className="flex gap-2">
                                            <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-tighter ${getTierColor(med.priceTier)}`}>
                                                {med.priceTier} Tier
                                            </span>
                                            <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-full uppercase">
                                                Safety: {med.compatibilityScore}%
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase">{med.type}</span>
                                    </div>
                                    
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="text-lg font-black text-slate-900">{med.name}</h4>
                                                <p className="text-xs text-slate-500 font-bold">{med.genericName}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-black text-slate-900">₹{med.genericPrice}</div>
                                                <div className="text-[10px] font-black text-slate-400 uppercase">Est. Market Price</div>
                                            </div>
                                        </div>
                                        
                                        {med.contraindications && (
                                            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-4 flex gap-3">
                                                <div className="text-red-600 shrink-0"><AlertIcon /></div>
                                                <div className="text-[11px] text-red-800 font-bold leading-tight">
                                                    CONTRAINDICATION: {med.contraindications}
                                                </div>
                                            </div>
                                        )}
                                        
                                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                            {med.explanation}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="bg-slate-900 text-white p-6 rounded-[2.5rem] flex gap-4 items-center">
                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl shrink-0"><InfoIcon /></div>
                            <p className="text-[11px] font-bold leading-relaxed opacity-80">
                                This analysis uses OpenFDA clinical data synthesized with real-time market research. Always consult a physical pharmacist before purchase.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PharmacyScreen;
