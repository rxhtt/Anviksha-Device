import React, { useState } from 'react';
import { ArrowLeftIcon, PillIcon, SearchIcon, CheckCircleIcon, InfoIcon } from './IconComponents.tsx';
import AIManager from '../services/aiManager.js';
import type { PharmacyResult, Medicine, UserProfile, Language } from '../types.ts';

interface PharmacyScreenProps {
    onBack: () => void;
    aiManager: AIManager;
    profile: UserProfile;
    language: Language;
}

const PharmacyScreen: React.FC<PharmacyScreenProps> = ({ onBack, aiManager, profile, language }) => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<PharmacyResult | null>(null);
    const [sortOrder, setSortOrder] = useState<'cheap' | 'costly'>('cheap');

    const handleSearch = async () => {
        if (!query.trim()) return;
        setIsLoading(true);
        setResult(null);
        try {
            const data = await aiManager.getPharmacySuggestions(query, profile, language);
            setResult(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const getSortedMedicines = () => {
        if (!result) return [];
        return [...result.medicines].sort((a, b) => {
            return sortOrder === 'cheap'
                ? a.genericPrice - b.genericPrice
                : b.genericPrice - a.genericPrice;
        });
    };

    const calculateSavings = (med: Medicine) => {
        const savings = ((med.price - med.genericPrice) / med.price) * 100;
        return Math.round(savings);
    };

    return (
        <div className="flex flex-col h-full bg-[#f8fafc] page-transition">
            <div className="px-6 py-8 bg-slate-900 text-white rounded-b-[3rem] shadow-2xl shrink-0 z-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-32 -mt-32"></div>

                <div className="flex items-center justify-between mb-8">
                    <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/10 active:scale-95">
                        <ArrowLeftIcon />
                    </button>
                    <div className="text-center">
                        <h1 className="text-sm font-black uppercase tracking-[0.3em] text-emerald-400">Anviksha Pharm</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-500">Generic Pricing Core</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                        <PillIcon />
                    </div>
                </div>

                <div className="relative group">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Symptoms or Medicine Name..."
                        className="w-full h-16 pl-14 pr-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-slate-500 font-extrabold focus:outline-none focus:bg-white/10 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                    />
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                        <SearchIcon />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="absolute right-2 top-2 bottom-2 px-6 bg-emerald-500 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-400 transition-colors active:scale-95"
                    >
                        {isLoading ? '...' : 'Analyze'}
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-64 space-y-6">
                        <div className="w-16 h-16 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Cross-Referencing Pharmanet_v4</p>
                    </div>
                )}

                {!isLoading && !result && (
                    <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-300">
                        <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center text-4xl mb-6 opacity-50"><PillIcon /></div>
                        <p className="text-xs font-black uppercase tracking-widest opacity-50">Enter symptoms for generic savings</p>
                    </div>
                )}

                {result && (
                    <div className="space-y-8 animate-fadeIn pb-12">
                        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Pharmacist Assessment</h3>
                            <p className="text-slate-900 font-bold leading-relaxed tracking-tight">
                                {result.diagnosis}
                            </p>
                        </div>

                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Therapeutic Options</h3>
                            <div className="flex bg-slate-100 rounded-xl p-1">
                                <button
                                    onClick={() => setSortOrder('cheap')}
                                    className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${sortOrder === 'cheap' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}
                                >
                                    Min Cost
                                </button>
                                <button
                                    onClick={() => setSortOrder('costly')}
                                    className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${sortOrder === 'costly' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-400'}`}
                                >
                                    Max Dose
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {getSortedMedicines().map((med, index) => (
                                <div key={index} className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/40 border border-slate-100 group hover:translate-y-[-4px] transition-all duration-500">
                                    <div className="bg-slate-50 px-6 py-3 flex justify-between items-center border-b border-slate-100">
                                        <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full uppercase tracking-[0.15em]">
                                            {med.type}
                                        </span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{med.dosage}</span>
                                    </div>

                                    <div className="p-8">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex-1">
                                                <h4 className="text-2xl font-black text-slate-900 tracking-tight mb-2 leading-none">{med.name}</h4>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Salt: {med.genericName}</p>
                                            </div>
                                            <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-2xl text-center shrink-0 ml-4">
                                                <span className="block text-[8px] font-black text-emerald-600 uppercase mb-0.5">Value Save</span>
                                                <span className="block text-xl font-black text-emerald-700">{calculateSavings(med)}%</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-8">
                                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Market Avg</span>
                                                <span className="text-lg font-black text-slate-400 line-through">₹{med.price}</span>
                                            </div>
                                            <div className="bg-emerald-500 p-4 rounded-2xl shadow-lg shadow-emerald-200">
                                                <span className="block text-[9px] font-black text-white/70 uppercase tracking-widest mb-1">Generic Cost</span>
                                                <span className="text-lg font-black text-white">₹{med.genericPrice}</span>
                                            </div>
                                        </div>

                                        <p className="text-xs text-slate-600 leading-relaxed font-bold tracking-tight">
                                            {med.explanation}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 flex gap-4 items-start">
                            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm shrink-0"><InfoIcon /></div>
                            <p className="text-[11px] text-blue-800 leading-relaxed font-bold italic">
                                <strong>Safety Protocol:</strong> Generic formulations (Jan Aushadhi) possess bioequivalence to branded variants. These estimates are clinical guidelines. Always validate with a registered pharmacist.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PharmacyScreen;