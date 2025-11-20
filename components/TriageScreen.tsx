
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
        className={`relative group flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ease-out h-28 ${
            value 
                ? `${colorClass} border-transparent shadow-lg scale-[1.02]` 
                : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
        }`}
    >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 transition-all ${
            value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400 group-hover:text-slate-600'
        }`}>
            {value ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            ) : (
                <div className="w-2 h-2 rounded-full bg-slate-300"></div>
            )}
        </div>
        <span className={`text-xs font-bold tracking-wide text-center leading-tight px-1 ${value ? 'text-white' : 'text-slate-600'}`}>
            {label}
        </span>
    </button>
);

const SegmentedControl: React.FC<{ options: string[], value: string, onChange: (val: string) => void }> = ({ options, value, onChange }) => (
    <div className="flex p-1.5 bg-slate-100 rounded-2xl relative">
        {options.map((opt) => {
            const isActive = value === opt;
            return (
                <button
                    key={opt}
                    type="button"
                    onClick={() => onChange(opt)}
                    className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-200 z-10 ${
                        isActive 
                            ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' 
                            : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    {opt}
                </button>
            );
        })}
    </div>
);

const TriageIntroModal: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => (
    <div className="absolute inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm p-6 h-full w-full">
        <div className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden animate-[scaleUp_0.3s_ease-out_forwards] shadow-2xl">
            <div className="bg-emerald-500 p-8 text-center relative overflow-hidden">
                <div className="absolute top-[-50%] left-[-50%] w-full h-full bg-emerald-400 rounded-full blur-3xl opacity-50"></div>
                <div className="w-20 h-20 mx-auto bg-white/10 backdrop-blur-md rounded-2xl text-white flex items-center justify-center text-4xl mb-4 shadow-inner relative z-10 border border-white/20">
                    <TriageIcon />
                </div>
                <h2 className="text-2xl font-bold text-white relative z-10">Smart Triage</h2>
                <p className="text-xs font-bold text-emerald-100 uppercase tracking-widest mt-1 relative z-10">Clinical Assessment</p>
            </div>
            
            <div className="p-8">
                <div className="mb-6">
                     <p className="text-slate-600 text-sm font-medium leading-relaxed">
                        This is a <strong>Symptom Checker</strong>.
                    </p>
                    <div className="my-4 h-px bg-slate-100"></div>
                    <p className="text-slate-600 text-sm leading-relaxed">
                        Use this when a patient presents with symptoms (e.g., fever, cough) to determine if further diagnostics are needed.
                    </p>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3 mb-8">
                     <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <ChecklistIcon />
                    </div>
                    <p className="text-xs font-bold text-slate-700">
                        Calculates Risk Score & Recommends Scans
                    </p>
                </div>

                <button 
                    type="button"
                    onClick={onDismiss}
                    className="mt-2 w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-slate-200 transition-all"
                >
                    Start Assessment
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
                <div className="absolute top-6 left-0 right-0 z-10 text-center">
                    <span className="bg-black/50 text-white px-4 py-1 rounded-full text-xs font-bold backdrop-blur-md uppercase tracking-wide">Point at visible symptoms</span>
                </div>
                {cameraError ? (
                    <div className="flex-1 flex items-center justify-center text-white flex-col">
                        <CameraOffIcon />
                        <p className="mt-2">Camera unavailable</p>
                        <button type="button" onClick={() => setShowCamera(false)} className="mt-4 text-sm underline">Cancel</button>
                    </div>
                ) : (
                    <video ref={videoRef} autoPlay playsInline className="flex-1 object-cover w-full" />
                )}
                <div className="absolute bottom-0 w-full p-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex justify-between items-center">
                    <button type="button" onClick={() => setShowCamera(false)} className="text-white px-4 text-xs font-bold uppercase">Cancel</button>
                    <button type="button" onClick={handleCapture} className="bg-white rounded-full w-16 h-16 border-4 border-slate-300 shadow-lg transform active:scale-90 transition-transform"></button>
                    <div className="w-12"></div>
                </div>
                <canvas ref={canvasRef} className="hidden" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50/50 relative">
            {showIntro && <TriageIntroModal onDismiss={() => setShowIntro(false)} />}

            <div className="px-4 mb-6 mt-2">
                <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-slate-900">Patient Assessment</h2>
                </div>
                <p className="text-xs font-medium text-slate-500">Select all active symptoms to calculate risk score.</p>
            </div>

            <div className="flex-grow overflow-y-auto pb-8 px-4 space-y-8 no-scrollbar">
                
                <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-4 bg-blue-500 rounded-full"></div>
                        <label className="text-xs font-bold text-slate-900 uppercase tracking-wide">Cough Duration</label>
                    </div>
                    <SegmentedControl 
                        options={['None', '< 1 Week', '1-3 Weeks', '> 3 Weeks']} 
                        value={inputs.coughDuration}
                        onChange={(val) => setInputs({...inputs, coughDuration: val})}
                    />
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-4 px-1">
                         <div className="w-1.5 h-4 bg-red-500 rounded-full"></div>
                         <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Clinical Signs</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <ToggleCard label="High Fever (>38°C)" value={inputs.fever} onChange={(v) => setInputs({...inputs, fever: v})} colorClass="bg-red-500" />
                        <ToggleCard label="Chest Pain" value={inputs.chestPain} onChange={(v) => setInputs({...inputs, chestPain: v})} colorClass="bg-rose-500" />
                        <ToggleCard label="Breathing Difficulty" value={inputs.breathingDifficulty} onChange={(v) => setInputs({...inputs, breathingDifficulty: v})} colorClass="bg-orange-500" />
                        <ToggleCard label="Blood in Sputum" value={inputs.sputum} onChange={(v) => setInputs({...inputs, sputum: v})} colorClass="bg-amber-600" />
                        <ToggleCard label="Rapid Weight Loss" value={inputs.weightLoss} onChange={(v) => setInputs({...inputs, weightLoss: v})} colorClass="bg-slate-700" />
                        
                        <button 
                            type="button"
                            onClick={() => capturedImagePreview ? null : setShowCamera(true)}
                            className={`relative group flex flex-col items-center justify-center p-4 rounded-2xl border border-dashed transition-all duration-300 h-28 ${
                                capturedImagePreview 
                                    ? 'bg-slate-900 border-transparent shadow-md' 
                                    : 'bg-slate-50 border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                            }`}
                        >
                            {capturedImagePreview ? (
                                <>
                                    <img src={capturedImagePreview} className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-60" alt="Visual" />
                                    <div className="relative z-10 bg-black/50 rounded-full p-2 backdrop-blur-md">
                                        <CheckCircleIcon />
                                    </div>
                                    <span className="relative z-10 text-[10px] text-white font-bold mt-1 uppercase tracking-wide">Retake</span>
                                    <button 
                                        type="button"
                                        onClick={(e) => {e.stopPropagation(); setCapturedImagePreview(null); setInputs({...inputs, visualObservation: null})}}
                                        className="absolute inset-0 w-full h-full z-20"
                                    />
                                </>
                            ) : (
                                <>
                                    <div className="w-8 h-8 flex items-center justify-center mb-2 text-slate-400 group-hover:text-blue-500 transition-colors">
                                        <CameraIcon />
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 text-center group-hover:text-blue-600 transition-colors">Add Visual<br/>Observation</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-100 flex gap-3 shrink-0 z-20">
                 <button 
                    type="button"
                    onClick={onBack}
                    disabled={isLoading}
                    className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors flex items-center justify-center"
                >
                    <ArrowLeftIcon />
                </button>
                <button 
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex-1 h-14 rounded-2xl bg-slate-900 text-white font-bold text-base shadow-xl shadow-slate-200 hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0 transition-all flex justify-center items-center gap-3"
                >
                    {isLoading ? (
                         <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Processing...
                        </>
                    ) : (
                        <>
                            Analyze Symptoms <div className="bg-white/20 p-1 rounded-full"><ArrowLeftIcon /></div>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default TriageScreen;
