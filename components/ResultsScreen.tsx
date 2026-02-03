
import React, { useState, useEffect } from 'react';
import type { AnalysisResult } from '../types.ts';
import { SparklesIcon, ShareIcon, HomeIcon, RecordsIcon, MicroscopeIcon } from './IconComponents.tsx';
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
    const [profile] = useState<any>(() => {
        const saved = localStorage.getItem('anviksha_profile');
        return saved ? JSON.parse(saved) : { name: 'Guest' };
    });

    useEffect(() => {
        if (imageFile) {
            const url = URL.createObjectURL(imageFile);
            setImageUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [imageFile]);

    let modalityColor = "text-blue-600 bg-blue-50";
    let marketValue = result.cost || 500;

    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const handleDownloadReport = () => {
        setIsGeneratingPdf(true);
        setTimeout(() => {
            alert("Professional Clinical Report generated. (Simulation: PDF would be initiated here)");
            setIsGeneratingPdf(false);
        }, 2000);
    };

    const alertList = result.clinicalAlerts || [];
    const observation = result.observationNotes || "Verified via Anviksha Diagnostic Core";

    return (
        <div id="capture-report" className="flex flex-col h-full bg-[#f8fafc] page-transition">
            <div className="flex-1 overflow-y-auto pb-40 px-6 pt-10 no-scrollbar">

                {/* Patient Profile Context Header */}
                <div className="bg-slate-900 rounded-[2.5rem] p-8 mb-10 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-3">Clinical Subject</p>
                            <h2 className="text-2xl font-black tracking-tight">{profile.name}</h2>
                            <div className="flex items-center gap-4 mt-4">
                                <div className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-white/10 rounded-md border border-white/10">{profile.age} Years</div>
                                <div className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-white/10 rounded-md border border-white/10">{profile.bloodGroup}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Report Date</p>
                            <p className="text-xs font-bold">{new Date(result.date).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* Header Identity */}
                <div className="flex justify-between items-center mb-6 px-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-[10px] font-black">A</div>
                        <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Diagnostic Intelligence</h2>
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ID: {result.id?.split('-')[1] || '0000'}</div>
                </div>

                {imageUrl && (
                    <div className="relative h-72 rounded-[3.5rem] overflow-hidden bg-slate-900 mb-10 shadow-2xl group border-8 border-white cursor-pointer" onClick={() => setIsZoomModalOpen(true)}>
                        <img src={imageUrl} alt="Scan" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        <div className="absolute bottom-10 left-10 right-10 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]"></div>
                                <span className="text-[11px] font-black text-white uppercase tracking-widest">Neural Calibration Active</span>
                            </div>
                            <div className="px-5 py-2 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl text-white text-[10px] font-black uppercase tracking-[0.2em]">
                                Explore Findings
                            </div>
                        </div>
                    </div>
                )}

                {/* Diagnosis Hero */}
                <div className="bg-white rounded-[3rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-50 mb-8 relative overflow-hidden">
                    {isEmergency && (
                        <div className="absolute top-0 right-0 px-8 py-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-bl-[2rem] shadow-lg">
                            Critical Alert
                        </div>
                    )}

                    <div className="flex items-center gap-4 mb-6">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${isEmergency ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                            {isEmergency ? 'Urgent Intervention' : 'Baseline Stability'}
                        </span>
                        <div className="h-px w-8 bg-slate-100"></div>
                        <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">{result.modality}</span>
                    </div>

                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 leading-[1.1]">{result.condition}</h1>
                    <p className="text-slate-500 font-bold text-base leading-relaxed mb-10">{result.description}</p>

                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                        <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                            <span>Diagnostic Reliability</span>
                            <span className="text-blue-600 font-black">{result.confidence}%</span>
                        </div>
                        <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden p-1 shadow-inner">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(59,130,246,0.4)] ${isEmergency ? 'bg-red-500' : 'bg-blue-600'}`}
                                style={{ width: `${result.confidence}%` }}
                            ></div>
                        </div>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mt-4 text-center">Confidence calibrated based on image morphology</p>
                    </div>
                </div>

                {/* Alerts Section */}
                {alertList.length > 0 && (
                    <div className="mb-8 space-y-4">
                        {alertList.map((alert: string, i: number) => (
                            <div key={i} className="flex items-center gap-5 p-6 bg-orange-50 border border-orange-100 rounded-[2rem] text-orange-800 shadow-sm">
                                <div className="w-6 h-6 shrink-0 text-orange-500"><SparklesIcon /></div>
                                <p className="text-xs font-black uppercase tracking-widest leading-relaxed">{alert}</p>
                            </div>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 mb-10">
                    <div className="bg-white rounded-[3rem] p-10 border border-slate-50 shadow-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-1.5 h-6 bg-blue-500 rounded-full"></div>
                            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Neural Observations</h3>
                        </div>
                        <div className="text-sm text-slate-600 leading-relaxed font-bold space-y-4 px-2">
                            {result.details && result.details.split('\n').map((line, i) => (
                                <div key={i} className="flex gap-4 group">
                                    <span className="text-blue-500/30 group-hover:text-blue-500 transition-colors">0{i + 1}</span>
                                    <span>{line}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px]"></div>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-blue-400 border border-white/10"><MicroscopeIcon /></div>
                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em]">Clinical Protocol</h3>
                        </div>
                        <p className="text-[15px] text-slate-300 leading-relaxed font-medium mb-4 italic">
                            "{result.treatment}"
                        </p>
                        <div className="h-px w-16 bg-blue-500/40 mt-8 mb-4"></div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Autonomous Recommendation Engine</p>
                    </div>
                </div>

                <div className="bg-white rounded-[3rem] p-8 border border-slate-50 flex items-center justify-between shadow-sm px-10">
                    <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 flex items-center justify-center rounded-[1.5rem] bg-emerald-50 text-emerald-600 text-2xl shadow-sm`}><SparklesIcon /></div>
                        <div>
                            <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Impact Factor</div>
                            <div className="text-xl font-black text-slate-900 tracking-tight">₹{marketValue} Savings</div>
                        </div>
                    </div>
                    <button
                        onClick={handleDownloadReport}
                        disabled={isGeneratingPdf}
                        className={`flex flex-col items-center gap-1 group active:scale-95 transition-all ${isGeneratingPdf ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <div className="w-14 h-14 rounded-[1.5rem] bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-100 transition-all border border-indigo-100/50">
                            {isGeneratingPdf ? (
                                <span className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                            )}
                        </div>
                        <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-1">Export PDF</span>
                    </button>
                </div>

                <div className="mt-12 text-center pb-20">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] mb-4">
                        Signature OF Diagnostic Core
                    </p>
                    <div className="w-24 h-px bg-slate-100 mx-auto mb-4"></div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
                        {observation}
                    </p>
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
