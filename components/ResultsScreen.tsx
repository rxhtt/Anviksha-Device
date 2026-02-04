
import React, { useState, useEffect } from 'react';
import type { AnalysisResult } from '../types.ts';
import { SparklesIcon, HomeIcon, RecordsIcon, InfoIcon, AlertIcon, CheckCircleIcon } from './IconComponents.tsx';
import ImageZoom from './ImageZoom.tsx';

interface ResultsScreenProps {
  result: AnalysisResult;
  imageFile: File | null;
  onNewAnalysis: () => void;
  onSaveRecord: (result: AnalysisResult) => void;
  isViewingRecord?: boolean;
  onReturnToRecords?: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ result, imageFile, onNewAnalysis, onSaveRecord, isViewingRecord = false, onReturnToRecords }) => {
  const isEmergency = result.isEmergency;
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    if (imageFile) {
        const url = URL.createObjectURL(imageFile);
        setImageUrl(url);
        return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  const displayConfidence = result.confidence < 1 ? result.confidence * 100 : result.confidence;
  
  let statusLabel = "STABLE";
  let statusClass = "bg-emerald-100 text-emerald-700 border-emerald-200";

  if (displayConfidence < 60) {
      statusLabel = "EVALUATION REQUIRED";
      statusClass = "bg-amber-100 text-amber-700 border-amber-200";
  } else if (isEmergency) {
      statusLabel = "CRITICAL FINDING";
      statusClass = "bg-red-100 text-red-700 border-red-200";
  }

  const handleSave = () => {
      onSaveRecord(result);
      setHasSaved(true);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden relative">
      
      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto pb-40 px-4 pt-4 no-scrollbar">
          {imageUrl && (
            <div className="relative h-60 rounded-[2.5rem] overflow-hidden bg-black mb-6 shadow-2xl group cursor-zoom-in border-4 border-white" onClick={() => setIsZoomModalOpen(true)}>
                <img src={imageUrl} alt="Scan" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div className="absolute bottom-5 left-5 right-5 flex justify-between items-center">
                    <span className="text-white text-[10px] font-black uppercase tracking-[0.2em] bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20">PATIENT IMAGING DATA</span>
                    <span className="bg-white text-blue-600 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-xl">{result.modality}</span>
                </div>
            </div>
          )}

          <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-100 mb-6">
            <div className="flex justify-between items-start mb-6">
                <div className={`text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest border ${statusClass}`}>
                    {statusLabel}
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DIAGNOSTIC CORE v3</span>
                    </div>
                </div>
            </div>
            
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-3 leading-[1.1] uppercase">{result.condition}</h1>
            <p className="text-slate-600 font-bold text-[16px] leading-relaxed mb-8">{result.description}</p>

            <div className="pt-6 border-t border-slate-50">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em] mb-3">
                    <span className="text-slate-400">Precision Index</span>
                    <span className="text-slate-900">{displayConfidence.toFixed(0)}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 ${isEmergency ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]'}`} 
                        style={{ width: `${displayConfidence}%` }}
                    ></div>
                </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-100 mb-6 space-y-8">
            <div>
                <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-4">Clinical Findings</h3>
                <div className="text-sm text-slate-700 leading-relaxed font-bold border-l-4 border-blue-500 pl-6 py-2 whitespace-pre-wrap italic bg-slate-50/50 rounded-r-2xl">
                    {result.details}
                </div>
            </div>
            
            <div className="bg-slate-950 rounded-[2rem] p-6 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 text-blue-400"><SparklesIcon /></div>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Physician Protocol</p>
                <p className="text-[15px] text-blue-50 font-bold leading-relaxed">
                    {result.treatment}
                </p>
            </div>
          </div>

          <div className="rounded-[2.5rem] p-8 bg-slate-900 shadow-2xl mb-12">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/10 rounded-2xl text-blue-400"><SparklesIcon /></div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest leading-none mb-1.5">Consultation Tier</p>
                            <p className="text-base font-black text-white leading-none uppercase tracking-tight">Genesis-3-Neural</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest leading-none mb-1.5">Value</p>
                        <p className="text-2xl font-black text-blue-400 leading-none">₹{result.cost || 1250}</p>
                    </div>
                </div>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed border-t border-white/5 pt-4 uppercase tracking-tighter">
                    Standardized Indian private specialty consultation value.
                </p>
          </div>
      </div>

      {/* FIXED ACTION BAR - FIXED OVERLAP */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-[0_-20px_50px_rgba(0,0,0,0.1)] z-50 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
         <div className="flex gap-4 max-w-md mx-auto">
             {isViewingRecord ? (
                 <button 
                    onClick={onReturnToRecords} 
                    className="flex-1 h-14 bg-slate-900 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 text-sm tracking-widest uppercase shadow-xl active:scale-95"
                 >
                     <RecordsIcon /> CLOSE RECORD
                 </button>
             ) : (
                <>
                    <button 
                        onClick={onNewAnalysis} 
                        className="flex-1 h-14 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black rounded-2xl transition-all flex items-center justify-center gap-3 text-sm tracking-widest uppercase active:scale-95 border border-slate-200"
                    >
                        <HomeIcon /> RESET
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={hasSaved}
                        className={`flex-[1.5] h-14 font-black rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 text-sm tracking-widest uppercase active:scale-95 ${
                            hasSaved ? 'bg-emerald-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                        }`}
                    >
                        {hasSaved ? <><CheckCircleIcon /> SAVED</> : <><CheckCircleIcon /> SAVE RECORD</>}
                    </button>
                </>
             )}
         </div>
      </div>
      
      {isZoomModalOpen && imageUrl && <ImageZoom src={imageUrl} onClose={() => setIsZoomModalOpen(false)} />}
    </div>
  );
};

export default ResultsScreen;
