
import React, { useState, useRef, useEffect } from 'react';
import { TriageIcon, ChecklistIcon, CameraIcon, ArrowLeftIcon, CameraOffIcon, InfoIcon } from './IconComponents.tsx';
import type { TriageInputs } from '../types.ts';

interface TriageScreenProps {
    onSubmit: (inputs: TriageInputs) => void;
    onBack: () => void;
    isLoading: boolean;
}

const ToggleCard: React.FC<{ label: string, value: boolean, onChange: (val: boolean) => void }> = ({ label, value, onChange }) => (
    <button 
        onClick={() => onChange(!value)}
        className={`relative group flex flex-col items-center justify-center p-3 h-24 rounded-2xl border transition-all duration-300 ease-out ${
            value 
                ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-200' 
                : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-md'
        }`}
    >
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mb-2 transition-all ${
            value ? 'border-white bg-white/20' : 'border-slate-200 group-hover:border-blue-300'
        }`}>
            {value && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
        </div>
        <span className={`text-xs font-bold tracking-wide text-center transition-colors ${value ? 'text-white' : 'text-slate-600'}`}>
            {label}
        </span>
    </button>
);

const SegmentedControl: React.FC<{ options: string[], value: string, onChange: (val: string) => void }> = ({ options, value, onChange }) => (
    <div className="flex p-1 bg-slate-100/80 rounded-xl relative">
        {options.map((opt) => {
            const isActive = value === opt;
            return (
                <button
                    key={opt}
                    onClick={() => onChange(opt)}
                    className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all duration-200 z-10 ${
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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm p-6">
        <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden animate-[scaleUp_0.3s_ease-out_forwards]">
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
                        You use this when a patient walks in feeling sick (e.g., coughing, fever) but you <em>haven't run tests yet</em>.
                    </p>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3 mb-8">
                     <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <ChecklistIcon />
                    </div>
                    <p className="text-xs font-bold text-slate-700">
                        Calculates "Risk Score" to decide if they need a Scan.
                    </p>
                </div>

                <button 
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
                    <span className="bg-black/50 text-white px-4 py-1 rounded-full text-sm backdrop-blur-md">Point at chest/face</span>
                </div>
                {cameraError ? (
                    <div className="flex-1 flex items-center justify-center text-white flex-col">
                        <CameraOffIcon />
                        <p className="mt-2">Camera unavailable</p>
                        <button onClick={() => setShowCamera(false)} className="mt-4 text-sm underline">Cancel</button>
                    </div>
                ) : (
                    <video ref={videoRef} autoPlay playsInline className="flex-1 object-cover w-full" />
                )}
                <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-center">
                    <button onClick={() => setShowCamera(false)} className="text-white px-4 text-sm font-medium">Cancel</button>
                    <button onClick={handleCapture} className="bg-white rounded-full w-16 h-16 border-4 border-slate-300 shadow-lg transform active:scale-90 transition-transform"></button>
                    <div className="w-12"></div>
                </div>
                <canvas ref={canvasRef} className="hidden" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            {showIntro && <TriageIntroModal onDismiss={() => setShowIntro(false)} />}

            <div className="px-1 mb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    Symptom Checklist
                </h2>
                <p className="text-xs text-slate-500 mt-1">Fill out the form below to assess risk.</p>
            </div>

            <div className="flex-grow overflow-y-auto pb-6 space-y-6 pr-1">
                
                <div className="bg-white rounded-2xl p-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Cough Duration</label>
                    <SegmentedControl 
                        options={['None', '< 1 wk', '1-3 wks', '> 3 wks']} 
                        value={inputs.coughDuration}
                        onChange={(val) => setInputs({...inputs, coughDuration: val})}
                    />
                </div>

                <div>
                    <h3 className="px-1 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Key Symptoms</h3>
                    <div className="grid grid-cols-3 gap-3">
                        <ToggleCard label="Fever >38°C" value={inputs.fever} onChange={(v) => setInputs({...inputs, fever: v})} />
                        <ToggleCard label="Chest Pain" value={inputs.chestPain} onChange={(v) => setInputs({...inputs, chestPain: v})} />
                        <ToggleCard label="Breathing" value={inputs.breathingDifficulty} onChange={(v) => setInputs({...inputs, breathingDifficulty: v})} />
                        <ToggleCard label="Blood Sputum" value={inputs.sputum} onChange={(v) => setInputs({...inputs, sputum: v})} />
                        <ToggleCard label="Weight Loss" value={inputs.weightLoss} onChange={(v) => setInputs({...inputs, weightLoss: v})} />
                         <button 
                            onClick={() => capturedImagePreview ? null : setShowCamera(true)}
                            className={`relative group flex flex-col items-center justify-center p-3 h-24 rounded-2xl border transition-all duration-300 ease-out ${
                                capturedImagePreview 
                                    ? 'bg-slate-800 border-slate-800' 
                                    : 'bg-white border-dashed border-slate-300 hover:border-blue-400'
                            }`}
                        >
                            {capturedImagePreview ? (
                                <>
                                    <img src={capturedImagePreview} className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-60" alt="Visual" />
                                    <div className="relative z-10 bg-black/50 rounded-full p-1">
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    </div>
                                    <span className="relative z-10 text-[10px] text-white font-bold mt-1">Retake</span>
                                    <button 
                                        onClick={(e) => {e.stopPropagation(); setCapturedImagePreview(null); setInputs({...inputs, visualObservation: null})}}
                                        className="absolute inset-0 w-full h-full z-20"
                                    />
                                </>
                            ) : (
                                <>
                                    <div className="w-6 h-6 flex items-center justify-center mb-2 text-slate-400 group-hover:text-blue-500 transition-colors">
                                        <CameraIcon />
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 text-center leading-none group-hover:text-blue-600 transition-colors">Add Visual</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="pt-4 flex gap-3 shrink-0 bg-slate-50/50 z-10">
                 <button 
                    onClick={onBack}
                    disabled={isLoading}
                    className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors flex items-center justify-center shadow-sm"
                >
                    <ArrowLeftIcon />
                </button>
                <button 
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex-1 h-12 rounded-2xl bg-slate-900 text-white font-bold text-sm shadow-lg shadow-slate-300 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-70 disabled:transform-none transition-all flex justify-center items-center gap-2"
                >
                    {isLoading ? (
                         <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <ChecklistIcon /> Run Analysis
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default TriageScreen;
