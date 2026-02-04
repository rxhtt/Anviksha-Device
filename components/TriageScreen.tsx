
import React, { useState, useRef, useEffect } from 'react';
import { TriageIcon, ChecklistIcon, CameraIcon, ArrowLeftIcon, CameraOffIcon, InfoIcon, CheckCircleIcon } from './IconComponents.tsx';
import type { TriageInputs } from '../types.ts';

interface TriageScreenProps {
    onSubmit: (inputs: TriageInputs) => void;
    onBack: () => void;
    isLoading: boolean;
}

const ToggleCard: React.FC<{ label: string, value: boolean, onChange: (val: boolean) => void, colorClass?: string }> = ({ label, value, onChange, colorClass = "bg-blue-600" }) => (
    <button 
        type="button"
        onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onChange(!value);
        }}
        className={`relative group flex flex-col items-center justify-center p-5 rounded-[2rem] border transition-all duration-300 ease-out h-32 ${
            value 
                ? `${colorClass} border-transparent shadow-2xl scale-[1.03] text-white` 
                : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-700'
        }`}
    >
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 transition-all ${
            value ? 'bg-white/20' : 'bg-slate-50 text-slate-400 group-hover:text-slate-600'
        }`}>
            {value ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            ) : (
                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
            )}
        </div>
        <span className={`text-xs font-black tracking-tight text-center leading-tight px-2 uppercase ${value ? 'text-white' : 'text-slate-600'}`}>
            {label}
        </span>
    </button>
);

const SegmentedControl: React.FC<{ options: string[], value: string, onChange: (val: string) => void }> = ({ options, value, onChange }) => (
    <div className="flex p-2 bg-slate-100/80 rounded-[1.8rem] relative gap-1 border border-slate-200/50">
        {options.map((opt) => {
            const isActive = value === opt;
            return (
                <button
                    key={opt}
                    type="button"
                    onClick={() => onChange(opt)}
                    className={`flex-1 py-4 text-[11px] font-black rounded-2xl transition-all duration-300 z-10 uppercase tracking-widest ${
                        isActive 
                            ? 'bg-white text-blue-600 shadow-xl ring-1 ring-black/5' 
                            : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    {opt}
                </button>
            );
        })}
    </div>
);

const TriageIntroModal: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => (
    <div className="absolute inset-0 z-50 flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-md p-6 h-full w-full">
        <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden animate-scaleUp shadow-[0_30px_100px_rgba(0,0,0,0.5)] border border-white/10">
            <div className="bg-emerald-600 p-10 text-center relative overflow-hidden">
                <div className="absolute top-[-50%] left-[-50%] w-full h-full bg-emerald-500 rounded-full blur-[80px] opacity-40"></div>
                <div className="w-24 h-24 mx-auto bg-white/10 backdrop-blur-xl rounded-3xl text-white flex items-center justify-center text-5xl mb-6 shadow-2xl relative z-10 border border-white/20">
                    <TriageIcon />
                </div>
                <h2 className="text-3xl font-black text-white relative z-10 tracking-tighter uppercase">Deep Triage</h2>
                <p className="text-[11px] font-black text-emerald-100 uppercase tracking-[0.3em] mt-2 relative z-10">Advanced Risk Algo</p>
            </div>
            
            <div className="p-10">
                <div className="mb-8 space-y-4">
                     <p className="text-slate-700 text-[15px] font-bold leading-relaxed">
                        This module synthesizes multi-dimensional patient inputs into a clinical risk profile.
                    </p>
                    <div className="h-px bg-slate-100"></div>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium">
                        Input duration, physiological signs, and visual markers for a comprehensive recommendation.
                    </p>
                </div>
                
                <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100 flex items-center gap-4 mb-10">
                     <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl shrink-0">
                        <ChecklistIcon />
                    </div>
                    <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest leading-snug">
                        AI-DRIVEN RISK MAPPING & SCAN OPTIMIZATION
                    </p>
                </div>

                <button 
                    type="button"
                    onClick={onDismiss}
                    className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl shadow-2xl shadow-slate-300 transition-all text-sm tracking-widest"
                >
                    INITIALIZE ASSESSMENT
                </button>
            </div>
        </div>
    </div>
);

const TriageScreen: React.FC<TriageScreenProps> = ({ onSubmit, onBack, isLoading }) => {
    const [inputs, setInputs] = useState<TriageInputs>({
        coughDuration: 'None',
        fever: false,
        chestPain: false,
        breathingDifficulty: false,
        sputum: false,
        weightLoss: false,
        visualObservation: null
    });

    const [showCamera, setShowCamera] = useState(false);
    const [showIntro, setShowIntro] = useState(true);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [capturedImagePreview, setCapturedImagePreview] = useState<string | null>(null);

    useEffect(() => {
        let stream: MediaStream | null = null;
        if (showCamera && !capturedImagePreview) {
            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                .then(s => {
                    stream = s;
                    if (videoRef.current) videoRef.current.srcObject = stream;
                })
                .catch(err => setCameraError("Camera access denied."));
        }
        return () => stream?.getTracks().forEach(t => t.stop());
    }, [showCamera, capturedImagePreview]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0);
            canvas.toBlob(blob => {
                if (blob) {
                    const file = new File([blob], "patient_visual.jpg", { type: "image/jpeg" });
                    setInputs(prev => ({ ...prev, visualObservation: file }));
                    setCapturedImagePreview(URL.createObjectURL(file));
                    setShowCamera(false);
                }
            }, 'image/jpeg');
        }
    };

    const handleSubmit = () => {
        onSubmit(inputs);
    };

    if (showCamera && !capturedImagePreview) {
        return (
            <div className="flex flex-col h-full bg-black relative">
                <div className="absolute top-8 left-0 right-0 z-10 text-center">
                    <span className="bg-black/50 text-white px-5 py-2 rounded-full text-[11px] font-black backdrop-blur-xl uppercase tracking-[0.2em]">Capture Symptom Focus</span>
                </div>
                {cameraError ? (
                    <div className="flex-1 flex items-center justify-center text-white flex-col">
                        <CameraOffIcon />
                        <p className="mt-4 font-bold tracking-widest uppercase text-xs">Access Interrupted</p>
                        <button type="button" onClick={() => setShowCamera(false)} className="mt-6 text-sm underline opacity-50">Dismiss</button>
                    </div>
                ) : (
                    <video ref={videoRef} autoPlay playsInline className="flex-1 object-cover w-full opacity-90" />
                )}
                <div className="absolute bottom-0 w-full p-10 bg-gradient-to-t from-black via-black/40 to-transparent flex justify-between items-center">
                    <button type="button" onClick={() => setShowCamera(false)} className="text-white px-6 text-[11px] font-black uppercase tracking-widest opacity-60">ABORT</button>
                    <button type="button" onClick={handleCapture} className="bg-white rounded-full w-20 h-20 border-8 border-white/20 shadow-2xl transform active:scale-90 transition-all"></button>
                    <div className="w-12"></div>
                </div>
                <canvas ref={canvasRef} className="hidden" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50/60 relative overflow-hidden">
            {showIntro && <TriageIntroModal onDismiss={() => setShowIntro(false)} />}

            <div className="px-6 mb-8 mt-4 shrink-0">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-1">Genesis Triage</h2>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Select physiological active symptoms.</p>
            </div>

            <div className="flex-grow overflow-y-auto pb-10 px-6 space-y-10 no-scrollbar">
                
                <div className="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-2 h-6 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                        <label className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Symptom Duration</label>
                    </div>
                    <SegmentedControl 
                        options={['None', '< 1W', '1-3W', '> 3W']} 
                        value={inputs.coughDuration}
                        onChange={(val) => setInputs({...inputs, coughDuration: val})}
                    />
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                         <div className="w-2 h-6 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                         <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Physical Signs</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <ToggleCard label="High Fever" value={inputs.fever} onChange={(v) => setInputs({...inputs, fever: v})} colorClass="bg-red-600" />
                        <ToggleCard label="Thoracic Pain" value={inputs.chestPain} onChange={(v) => setInputs({...inputs, chestPain: v})} colorClass="bg-rose-600" />
                        <ToggleCard label="Dyspnea" value={inputs.breathingDifficulty} onChange={(v) => setInputs({...inputs, breathingDifficulty: v})} colorClass="bg-orange-600" />
                        <ToggleCard label="Hemoptysis" value={inputs.sputum} onChange={(v) => setInputs({...inputs, sputum: v})} colorClass="bg-amber-700" />
                        <ToggleCard label="Weight Loss" value={inputs.weightLoss} onChange={(v) => setInputs({...inputs, weightLoss: v})} colorClass="bg-slate-800" />
                        
                        <button 
                            type="button"
                            onClick={() => capturedImagePreview ? null : setShowCamera(true)}
                            className={`relative group flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 border-dashed transition-all duration-500 h-32 ${
                                capturedImagePreview 
                                    ? 'bg-slate-950 border-transparent shadow-xl' 
                                    : 'bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50'
                            }`}
                        >
                            {capturedImagePreview ? (
                                <>
                                    <img src={capturedImagePreview} className="absolute inset-0 w-full h-full object-cover rounded-[2rem] opacity-50" alt="Visual" />
                                    <div className="relative z-10 bg-white/20 rounded-2xl p-2 backdrop-blur-xl border border-white/20 text-white shadow-lg">
                                        <CheckCircleIcon />
                                    </div>
                                    <span className="relative z-10 text-[10px] text-white font-black mt-2 uppercase tracking-widest">Retake</span>
                                    <button 
                                        type="button"
                                        onClick={(e) => {e.stopPropagation(); setCapturedImagePreview(null); setInputs({...inputs, visualObservation: null})}}
                                        className="absolute inset-0 w-full h-full z-20"
                                    />
                                </>
                            ) : (
                                <>
                                    <div className="w-10 h-10 flex items-center justify-center mb-2 text-slate-400 group-hover:text-blue-500 transition-all">
                                        <CameraIcon />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 text-center uppercase tracking-widest leading-tight group-hover:text-blue-600 transition-colors">Visual<br/>Capture</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-white border-t border-slate-100 flex gap-4 shrink-0 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                 <button 
                    type="button"
                    onClick={onBack}
                    disabled={isLoading}
                    className="w-18 h-18 rounded-3xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all flex items-center justify-center active:scale-95"
                >
                    <div className="scale-125"><ArrowLeftIcon /></div>
                </button>
                <button 
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex-1 h-18 rounded-3xl bg-slate-950 text-white font-black text-base shadow-2xl shadow-slate-950/20 hover:bg-slate-900 hover:-translate-y-1 active:translate-y-0 active:scale-95 transition-all flex justify-center items-center gap-4 tracking-widest"
                >
                    {isLoading ? (
                         <>
                            <div className="animate-spin rounded-full h-6 w-6 border-3 border-white/30 border-t-white"></div>
                            SYNTHESIZING...
                        </>
                    ) : (
                        <>
                            RUN ANALYSIS <div className="bg-white/20 p-2 rounded-xl text-lg rotate-180"><ArrowLeftIcon /></div>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default TriageScreen;
