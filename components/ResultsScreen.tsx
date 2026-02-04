
import React, { useState, useEffect } from 'react';
import type { AnalysisResult } from '../types.ts';
import { SparklesIcon, ShareIcon, HomeIcon, RecordsIcon } from './IconComponents.tsx';
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
  let marketValue = 500;

  switch(result.modality) {
      case 'ECG': 
          modalityColor = "text-rose-600 bg-rose-50"; 
          marketValue = 600;
          break;
      case 'BLOOD': 
          modalityColor = "text-red-600 bg-red-50"; 
          marketValue = 300;
          break;
      case 'MRI': 
          modalityColor = "text-purple-600 bg-purple-50"; 
          marketValue = 1500;
          break;
      case 'CT': 
          modalityColor = "text-purple-600 bg-purple-50"; 
          marketValue = 1000;
          break;
      case 'DERMA': 
          modalityColor = "text-amber-600 bg-amber-50"; 
          marketValue = 700;
          break;
      default: 
          modalityColor = "text-blue-600 bg-blue-50";
          marketValue = 500;
  }

  let statusText = "STABLE";
  let statusClass = "bg-emerald-100 text-emerald-700 border-emerald-200";

  if (result.confidence < 75) {
      statusText = "INCONCLUSIVE - DOCTOR REVIEW";
      statusClass = "bg-amber-100 text-amber-700 border-amber-200";
  } else if (isEmergency) {
      statusText = "CRITICAL - IMMEDIATE CARE";
      statusClass = "bg-red-100 text-red-700 border-red-200";
  } else {
      statusText = "STABLE - ROUTINE CHECK";
      statusClass = "bg-emerald-100 text-emerald-700 border-emerald-200";
  }

  return (
    <div className="flex flex-col h-full">
      
      <div className="flex-1 overflow-y-auto pb-20 px-1">
          {imageUrl && (
            <div className="relative h-48 rounded-[2rem] overflow-hidden bg-black mb-6 shadow-md group mx-4 mt-4" onClick={() => setIsZoomModalOpen(true)}>
                <img src={imageUrl} alt="Scan" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-3 right-4 bg-black/50 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full font-medium">
                    Tap to Zoom
                </div>
                <div className={`absolute top-3 left-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${modalityColor.replace('text-', 'bg-white text-')}`}>
                    {result.modality || 'General'} Analysis
                </div>
            </div>
          )}

          <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 mb-4 mx-2">
            <div className="flex justify-between items-start mb-3">
                <div className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide border ${statusClass}`}>
                    {statusText}
                </div>
                <span className="text-slate-300 text-xs font-semibold">{new Date(result.date).toLocaleDateString()}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1 leading-tight">{result.condition}</h1>
            <p className="text-slate-500 font-medium text-sm leading-relaxed mt-2">{result.description}</p>

            <div className="mt-6">
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                    <span className="text-slate-400">AI Confidence</span>
                    <span className="text-slate-900">{result.confidence}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${isEmergency ? 'bg-gradient-to-r from-orange-400 to-red-500' : 'bg-gradient-to-r from-teal-400 to-emerald-500'}`} style={{ width: `${result.confidence}%` }}></div>
                </div>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 mb-4 mx-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-3">Detailed Findings</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                {result.details || "No specific details provided."}
            </p>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2">Treatment Plan</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
                {result.treatment}
            </p>
          </div>

           <div className={`rounded-[2rem] p-5 border flex items-center justify-between mx-2 ${modalityColor.replace('text-', 'border-').replace('600', '100')}`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 bg-white rounded-full shadow-sm ${modalityColor}`}><SparklesIcon /></div>
                    <div>
                        <div className="text-[10px] font-bold uppercase text-slate-500">Est. Consult Fee</div>
                        <div className={`text-lg font-bold ${modalityColor}`}>₹{marketValue} Saved</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-bold uppercase text-slate-500">Processing</div>
                    <div className={`text-lg font-bold ${modalityColor}`}>&lt; 10s</div>
                </div>
           </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-slate-100 z-10">
         <div className="flex gap-3">
             {isViewingRecord ? (
                 <button 
                    onClick={onReturnToRecords} 
                    className="flex-1 h-12 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                 >
                     <RecordsIcon /> Back to Records
                 </button>
             ) : (
                <>
                    <button 
                        onClick={onNewAnalysis} 
                        className="flex-1 h-12 bg-white border-2 border-slate-100 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                        <span className="text-lg text-slate-500"><HomeIcon /></span>
                        <span>Home</span>
                    </button>
                    <button 
                        onClick={() => onSaveRecord(result)} 
                        className="flex-[1.5] h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-300 transition-all flex items-center justify-center gap-2 text-sm active:scale-95"
                    >
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
