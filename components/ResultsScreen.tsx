
import React, { useState, useEffect } from 'react';
import type { AnalysisResult } from '../types.ts';
import { SparklesIcon, ShareIcon, HomeIcon, RecordsIcon, CheckCircleIcon } from './IconComponents.tsx';
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

  useEffect(() => {
    if (imageFile) {
        const url = URL.createObjectURL(imageFile);
        setImageUrl(url);
        return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  let modalityColor = "text-blue-600 bg-blue-50";
  let marketValue = result.cost || 500;

  switch(result.modality) {
      case 'ECG': modalityColor = "text-rose-600 bg-rose-50"; break;
      case 'BLOOD': modalityColor = "text-red-600 bg-red-50"; break;
      case 'MRI': modalityColor = "text-purple-600 bg-purple-50"; break;
      case 'CT': modalityColor = "text-purple-600 bg-purple-50"; break;
      case 'DERMA': modalityColor = "text-amber-600 bg-amber-50"; break;
      default: modalityColor = "text-blue-600 bg-blue-50";
  }

  let statusText = "STABLE";
  let statusClass = "bg-emerald-100 text-emerald-700 border-emerald-200";

  if (result.confidence < 75) {
      statusText = "INCONCLUSIVE - REVIEW REQUIRED";
      statusClass = "bg-amber-100 text-amber-700 border-amber-200";
  } else if (isEmergency) {
      statusText = "CRITICAL - IMMEDIATE CARE";
      statusClass = "bg-red-100 text-red-700 border-red-200";
  } else {
      statusText = "STABLE - ROUTINE CHECK";
      statusClass = "bg-emerald-100 text-emerald-700 border-emerald-200";
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
      
      <div className="flex-1 overflow-y-auto pb-24 px-1 no-scrollbar">
          {imageUrl && (
            <div className="relative h-48 rounded-[2rem] overflow-hidden bg-black mb-6 shadow-md group mx-4 mt-4" onClick={() => setIsZoomModalOpen(true)}>
                <img src={imageUrl} alt="Scan" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-3 right-4 bg-black/50 backdrop-blur-md text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                    Tap to Zoom
                </div>
                <div className={`absolute top-3 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${modalityColor.replace('text-', 'bg-white text-')}`}>
                    {result.modality || 'General'} Analysis
                </div>
            </div>
          )}

          <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 mb-4 mx-2">
            <div className="flex justify-between items-start mb-4">
                <div className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide border ${statusClass}`}>
                    {statusText}
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-slate-300 text-[10px] font-bold uppercase tracking-widest">{new Date(result.date).toLocaleDateString()}</span>
                    <div className="flex items-center gap-1 mt-1">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                        <span className="text-[10px] font-bold text-blue-500 uppercase">Live Neural Analysis</span>
                    </div>
                </div>
            </div>
            
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2 leading-tight">{result.condition}</h1>
            <p className="text-slate-600 font-medium text-sm leading-relaxed mb-6">{result.description}</p>

            <div className="pt-4 border-t border-slate-50">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-2">
                    <span className="text-slate-400">Diagnostic Confidence</span>
                    <span className="text-slate-900">{result.confidence}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 ${isEmergency ? 'bg-red-500' : 'bg-emerald-500'}`} 
                        style={{ width: `${result.confidence}%` }}
                    ></div>
                </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 mb-4 mx-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Clinical Evidence</h3>
            <p className="text-sm text-slate-700 leading-relaxed mb-6 font-medium">
                {result.details || "Processing visual evidence..."}
            </p>
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Management Protocol</h3>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <p className="text-sm text-slate-800 font-bold leading-relaxed">
                    {result.treatment}
                </p>
            </div>
          </div>

           <div className={`rounded-[2rem] p-6 border flex items-center justify-between mx-2 ${modalityColor.replace('text-', 'border-').replace('600', '100')}`}>
                <div className="flex items-center gap-4">
                    <div className={`p-3 bg-white rounded-2xl shadow-sm ${modalityColor}`}><SparklesIcon /></div>
                    <div>
                        <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Estimated Savings</div>
                        <div className={`text-xl font-black ${modalityColor}`}>₹{marketValue}</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Model Latency</div>
                    <div className={`text-xl font-black ${modalityColor}`}>&lt; 5.2s</div>
                </div>
           </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-xl border-t border-slate-100 z-30">
         <div className="flex gap-4">
             {isViewingRecord ? (
                 <button 
                    onClick={onReturnToRecords} 
                    className="flex-1 h-14 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm"
                 >
                     <RecordsIcon /> Back to Records
                 </button>
             ) : (
                <>
                    <button 
                        onClick={onNewAnalysis} 
                        className="flex-1 h-14 bg-white border-2 border-slate-100 hover:bg-slate-50 text-slate-600 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm"
                    >
                        <HomeIcon />
                    </button>
                    <button 
                        onClick={() => onSaveRecord(result)} 
                        className="flex-[2] h-14 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-3 text-sm active:scale-95"
                    >
                        <CheckCircleIcon />
                        Save Record
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
