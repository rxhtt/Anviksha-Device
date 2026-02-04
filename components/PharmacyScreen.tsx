
import React, { useState } from 'react';
import { ArrowLeftIcon, PillIcon, SearchIcon, CheckCircleIcon, InfoIcon, AlertIcon } from './IconComponents.tsx';
import AIManager from '../services/aiManager.js';
import type { PharmacyResult, Medicine } from '../types.ts';

interface PharmacyScreenProps {
    onBack: () => void;
    aiManager: AIManager;
}

const PharmacyScreen: React.FC<PharmacyScreenProps> = ({ onBack, aiManager }) => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<PharmacyResult | null>(null);
    const [sortOrder, setSortOrder] = useState<'cheap' | 'costly'>('cheap');

    const handleSearch = async () => {
        if (!query.trim()) return;
        setIsLoading(true);
        setResult(null);
        try {
            const data = await aiManager.getPharmacySuggestions(query);
            setResult(data);
        } catch (error) {
            alert("Failed to fetch medicines. Please check connection.");
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

    return (
        <div className="flex flex-col h-full bg-slate-50">
            
            {/* STRATEGIC DEFENSE: COMPLIANCE BANNER */}
            <div className="bg-amber-100 text-amber-900 px-4 py-2 flex items-center gap-3 justify-center shrink-0 border-b border-amber-200">
                <div className="text-amber-600 animate-pulse"><AlertIcon /></div>
                <div className="leading-tight">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Genesis Database Mode</p>
                    <p className="text-[10px] font-medium">Pricing and mapping data is simulated for demonstration.</p>
                </div>
            </div>

            <div className="px-4 py-4 bg-teal-800 text-white rounded-b-[2.5rem] shadow-lg shrink-0 z-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-600 rounded-full blur-3xl opacity-50 -mr-10 -mt-10"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-md">
                            <ArrowLeftIcon />
                        </button>
                        <h1 className="text-xl font-bold tracking-tight">Pharmacy Database</h1>
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md">
                            <PillIcon />
                        </div>
                    </div>
                    
                    <p className="text-teal-200 text-xs font-bold uppercase tracking-wide mb-4 px-1">
                        Generic Equivalency Engine (Concept)
                    </p>

                    <div className="relative">
                        <input 
                            type="text" 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Enter condition (e.g., Fever)..."
                            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white text-slate-900 placeholder-slate-400 font-medium shadow-xl shadow-teal-900/20 focus:outline-none focus:ring-4 focus:ring-teal-500/30 transition-all"
                        />
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                            <SearchIcon />
                        </div>
                        <button 
                            onClick={handleSearch}
                            className="absolute right-2 top-2 bottom-2 px-4 bg-teal-900 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition-colors shadow-lg"
                        >
                            {isLoading ? 'Searching...' : 'Query DB'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4">
                        <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
                        <p className="text-slate-400 text-sm font-medium">Querying Mock Database...</p>
                    </div>
                )}

                {!isLoading && !result && (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400 opacity-60">
                        <div className="text-5xl mb-2"><PillIcon /></div>
                        <p className="text-sm">Enter symptoms to simulate generic matching.</p>
                    </div>
                )}

                {result && (
                    <div className="space-y-6 animate-slideUpFade">
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">AI Analysis</h3>
                            <p className="text-slate-800 font-medium leading-relaxed">
                                {result.diagnosis}
                            </p>
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-lg font-bold text-slate-900">Results</h3>
                            <div className="flex bg-slate-200 rounded-lg p-1">
                                <button 
                                    onClick={() => setSortOrder('cheap')}
                                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${sortOrder === 'cheap' ? 'bg-white shadow-sm text-teal-700' : 'text-slate-500'}`}
                                >
                                    Low Price
                                </button>
                                <button 
                                    onClick={() => setSortOrder('costly')}
                                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${sortOrder === 'costly' ? 'bg-white shadow-sm text-teal-700' : 'text-slate-500'}`}
                                >
                                    High Price
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {getSortedMedicines().map((med, index) => (
                                <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 group hover:shadow-md transition-all">
                                    <div className="bg-slate-50 px-4 py-2 flex justify-between items-center border-b border-slate-100">
                                        <span className="text-[10px] font-bold bg-teal-100 text-teal-700 px-2 py-0.5 rounded uppercase tracking-wide">
                                            {med.type}
                                        </span>
                                        <span className="text-xs font-bold text-slate-500">{med.dosage}</span>
                                    </div>
                                    
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="text-lg font-bold text-slate-900">{med.name}</h4>
                                                <p className="text-xs text-slate-400 font-medium">Brand Price: ₹{med.price}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-black text-teal-600">₹{med.genericPrice}</div>
                                                <div className="text-[10px] font-bold text-teal-600 uppercase">Generic Price</div>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 mb-3">
                                            <p className="text-xs text-slate-600">
                                                <span className="font-bold text-slate-800 block mb-1">Generic Name (Salt):</span> 
                                                {med.genericName}
                                            </p>
                                        </div>
                                        
                                        <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-50 pt-2">
                                            {med.explanation}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex gap-3 items-start">
                            <div className="text-red-600 mt-0.5"><AlertIcon /></div>
                            <p className="text-xs text-red-800 leading-relaxed font-bold">
                                DISCLAIMER: Clinical Validation Pending. Do not use for treatment.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PharmacyScreen;
