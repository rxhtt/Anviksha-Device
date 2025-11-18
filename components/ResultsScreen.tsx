import React, { useState, useEffect } from 'react';
import type { AnalysisResult } from '../types';
import { ArrowLeftIcon, SaveIcon, BrainCircuitIcon, RecordsIcon, SparklesIcon, ShareIcon, PrintIcon } from './IconComponents';
import ImageZoom from './ImageZoom';

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
  const cardBorderColor = isEmergency ? 'border-red-500' : 'border-green-500';
  const cardBgColor = isEmergency ? 'bg-red-50' : 'bg-white';
  const badgeBgColor = isEmergency ? 'bg-red-500' : 'bg-green-500';
  const confidenceGradient = isEmergency ? 'from-orange-500 to-red-500' : 'from-teal-400 to-green-500';

  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (imageFile) {
        const url = URL.createObjectURL(imageFile);
        setImageUrl(url);
        return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    let reportText = `*** ANVIKSHA AI - X-RAY ANALYSIS REPORT ***\n\n`;
    reportText += `Date: ${new Date(result.date).toLocaleString()}\n`;
    reportText += `Patient ID: ${result.id}\n\n`;
    reportText += `--- ANALYSIS RESULTS ---\n`;
    reportText += `Condition Detected: ${result.condition}\n`;
    reportText += `Confidence Score: ${result.confidence}%\n`;
    reportText += `Emergency Flag: ${result.isEmergency ? 'YES - IMMEDIATE ATTENTION REQUIRED' : 'No'}\n\n`;
    reportText += `--- FINDINGS ---\n`;
    reportText += `Summary: ${result.description}\n`;
    if (result.details) {
      reportText += `Detailed Analysis:\n${result.details}\n\n`;
    }
    reportText += `--- RECOMMENDATION ---\n`;
    reportText += `${result.treatment}\n\n`;
    reportText += `---\n`;
    reportText += `Analysis performed using ${result.modelUsed || 'Gemini AI'}`;
    if(result.modelVersion) reportText += ` (v${result.modelVersion})`;
    if(isDemoMode) reportText += ` (DEMO MODE)`;
    reportText += `.\nDisclaimer: This is an AI-powered screening tool and not a substitute for a professional medical diagnosis.`;

    const shareData = {
        title: 'Anviksha AI X-ray Analysis Report',
        text: reportText,
    };

    try {
        if (navigator.share) {
            await navigator.share(shareData);
        } else {
            // Fallback for browsers that don't support Web Share API
            await navigator.clipboard.writeText(reportText);
            alert('Report copied to clipboard! Web Share is not supported in this browser.');
        }
    } catch (err) {
        console.error('Error sharing report:', err);
        alert('Could not share or copy the report.');
    }
  };

  const cost = result.cost ?? 150; // Default to cloud cost
  const savings = 1000 - cost;


  return (
    <div className="results-screen">
      {isDemoMode && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-lg mb-4 text-left" role="alert">
              <p className="font-bold">Demo Mode Result</p>
              <p className="text-sm">This is a sample analysis performed in Demo Mode. The report cannot be saved to patient records.</p>
          </div>
      )}
      {imageUrl && (
        <div className="mb-6">
            <h3 className="font-bold text-slate-700 text-center mb-3 text-base">Analyzed Image</h3>
            <div className="w-full bg-slate-100 rounded-lg overflow-hidden cursor-pointer shadow-inner" onClick={() => setIsZoomModalOpen(true)}>
                <img src={imageUrl} alt="Analyzed X-ray" className="w-full h-auto object-contain"/>
            </div>
            <p className="text-xs text-center text-slate-500 mt-2">Click image to zoom and pan</p>
        </div>
      )}
      <div className={`result-card ${cardBgColor} rounded-2xl p-6 shadow-lg border-l-8 ${cardBorderColor} mb-6`}>
        <div className="flex justify-between items-start">
            <div>
                 <div className={`condition-badge inline-block px-4 py-2 ${badgeBgColor} text-white rounded-full font-bold mb-4 text-sm uppercase tracking-wider`}>
                    {result.condition}
                </div>
                <h2 className="text-2xl font-bold text-slate-800">{result.condition}</h2>
            </div>
            <div className="text-xs text-slate-400">
                {new Date(result.date).toLocaleString()}
            </div>
        </div>
        
        <div className="my-4">
            <p className="text-sm font-semibold text-slate-600 mb-1">{result.confidence}% Confidence</p>
            <div className="confidence-meter bg-slate-200 rounded-full h-4 overflow-hidden">
              <div 
                className={`confidence-fill h-full bg-gradient-to-r ${confidenceGradient} rounded-full`}
                style={{ width: `${result.confidence}%` }}
              ></div>
            </div>
        </div>

        <p className="text-slate-600 mb-3"><strong>Findings:</strong> {result.description}</p>
        {result.details && <p className="text-slate-600 mb-5 bg-slate-50 p-3 rounded-lg border border-slate-200"><strong>Details:</strong> {result.details}</p>}
        <p className="text-slate-800 font-semibold"><strong>Recommendation:</strong> <span className="font-normal">{result.treatment}</span></p>

        <div className="cost-comparison border-t border-slate-200 pt-5 mt-6">
          <h3 className="font-bold text-slate-700 text-center mb-3 text-base">Cost &amp; Time Comparison</h3>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center gap-2 text-blue-600 text-sm">
                <BrainCircuitIcon />
                <h4 className="font-bold">AI-Powered</h4>
              </div>
              <p className="text-2xl font-bold text-blue-700 my-1">₹{isDemoMode ? 0 : cost}</p>
              <p className="text-xs text-slate-500">Under 10s</p>
            </div>
            <div className="p-3 bg-slate-100 rounded-lg border border-slate-200">
              <div className="flex items-center justify-center gap-2 text-slate-600 text-sm">
                <RecordsIcon />
                <h4 className="font-bold">Traditional</h4>
              </div>
              <p className="text-2xl font-bold text-slate-500 my-1 line-through">₹1000</p>
              <p className="text-xs text-slate-500">24-48 Hours</p>
            </div>
          </div>
          <div className="text-center mt-4">
            <div className="savings-badge bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full font-bold inline-flex items-center gap-2 text-sm">
              <SparklesIcon />
              <span>Savings of <span className="font-extrabold">₹{isDemoMode ? 1000 : savings}</span> &amp; Faster Diagnosis</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="nav-buttons no-print grid grid-cols-1 sm:grid-cols-2 gap-4">
        {isViewingRecord ? (
            <button onClick={onReturnToRecords} className="nav-btn secondary bg-slate-200 hover:bg-slate-300 text-slate-800 py-3 px-4 rounded-full font-bold transition-colors flex items-center justify-center gap-2 sm:col-span-2">
                <ArrowLeftIcon /> Back to Records
            </button>
        ) : (
            <>
                <button onClick={onNewAnalysis} className="nav-btn secondary bg-slate-200 hover:bg-slate-300 text-slate-800 py-3 px-4 rounded-full font-bold transition-colors flex items-center justify-center gap-2">
                    <ArrowLeftIcon /> New Analysis
                </button>
                <button 
                    onClick={() => onSaveRecord(result)} 
                    disabled={isDemoMode}
                    className="nav-btn primary bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-full font-bold transition-colors flex items-center justify-center gap-2 disabled:bg-slate-400 disabled:cursor-not-allowed">
                    <SaveIcon /> {isDemoMode ? 'Save Disabled' : 'Save & Finish'}
                </button>
            </>
        )}
      </div>
       <div className="mt-4 no-print grid grid-cols-2 gap-4">
         <button 
            onClick={handleShare} 
            className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-colors">
            <ShareIcon /> Share Report
        </button>
         <button 
            onClick={handlePrint} 
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-colors">
            <PrintIcon /> Print Report
        </button>
       </div>
       <div className="text-xs text-slate-400 text-center mt-6 border-t pt-4">
         Analysis performed using {result.modelUsed || 'Gemini AI'}{' '}
         {result.modelVersion && `(v${result.modelVersion})`}. This is a screening tool and not a substitute for a professional medical diagnosis.
      </div>
      {isZoomModalOpen && imageUrl && <ImageZoom src={imageUrl} onClose={() => setIsZoomModalOpen(false)} />}
    </div>
  );
};

export default ResultsScreen;