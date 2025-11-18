
import React, { useState, useEffect } from 'react';
import type { AnalysisResult } from '../types.ts';
import { ArrowLeftIcon, SaveIcon, BrainCircuitIcon, RecordsIcon, SparklesIcon, ShareIcon, PrintIcon } from './IconComponents.tsx';
import ImageZoom from './ImageZoom.tsx';

interface ResultsScreenProps {
  result: AnalysisResult;
  imageFile: File | null;
  onNewAnalysis: () => void;
  onSaveRecord: (result: AnalysisResult) => void;
  isViewingRecord?: boolean;
  onReturnToRecords?: () => void;
  isDemoMode?: boolean;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ result, imageFile, onNewAnalysis, onSaveRecord, isViewingRecord = false, onReturnToRecords, isDemoMode = false }) => {
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

  const handleShare = async () => {
      // ... (Keep logic same, just UI changes)
      alert("Share functionality invoked");
  }

  return (
    <div className="flex flex-col h-full">
      {isDemoMode && (
          <div className="bg-amber-50 text-amber-600 text-xs font-bold py-2 px-4 rounded-full text-center mb-4 border border-amber-100">
              DEMO MODE REPORT
          </div>
      )}
      
      <div className="flex-1 overflow-y-auto pb-20">
          {/* Image Header */}
          {imageUrl && (
            <div className="relative h-48 rounded-[2rem] overflow-hidden bg-black mb-6 shadow-md group" onClick={() => setIsZoomModalOpen(true)}>
                <img src={imageUrl} alt="X-ray" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-3 right-4 bg-black/50 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full font-medium">
                    Tap to Zoom
                </div>
            </div>
          )}

          {/* Main Diagnosis Card */}
          <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 mb-4">
            <div className="flex justify-between items-start mb-2">
                <div className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${isEmergency ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {isEmergency ? 'Attention Needed' : 'Stable'}
                </div>
                <span className="text-slate-300 text-xs font-semibold">{new Date(result.date).toLocaleDateString()}</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">{result.condition}</h1>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">{result.description}</p>

            {/* Confidence Bar */}
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

          {/* Findings Details */}
          <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3">Detailed Findings</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4 bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                {result.details || "No specific details provided."}
            </p>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-2">Treatment Plan</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
                {result.treatment}
            </p>
          </div>

           {/* Cost Card */}
           <div className="bg-blue-50 rounded-[2rem] p-5 border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white text-blue-600 rounded-full shadow-sm"><SparklesIcon /></div>
                    <div>
                        <div className="text-xs text-blue-600/70 font-bold uppercase">Estimated Savings</div>
                        <div className="text-lg font-bold text-blue-900">₹850 Saved</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-blue-600/70 font-bold uppercase">Time</div>
                    <div className="text-lg font-bold text-blue-900">&lt; 10s</div>
                </div>
           </div>
      </div>

      {/* Sticky Footer Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 flex gap-3 z-10">
         {isViewingRecord ? (
             <button onClick={onReturnToRecords} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-3.5 rounded-2xl transition-colors">
                 Back to Records
             </button>
         ) : (
            <>
                <button onClick={onNewAnalysis} className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 font-bold py-3.5 rounded-2xl transition-colors">
                    Home
                </button>
                <button 
                    onClick={() => onSaveRecord(result)} 
                    disabled={isDemoMode}
                    className="flex-[2] bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-slate-300 transition-all disabled:opacity-50"
                >
                    {isDemoMode ? 'Demo Mode' : 'Save Record'}
                </button>
            </>
         )}
      </div>
      
      {isZoomModalOpen && imageUrl && <ImageZoom src={imageUrl} onClose={() => setIsZoomModalOpen(false)} />}
    </div>
  );
};

export default ResultsScreen;
