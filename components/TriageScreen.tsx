
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
        className={`relative group flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ease-out h-28 ${value
                ? `${colorClass} border-transparent shadow-lg scale-[1.02]`
                : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
            }`}
    >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 transition-all ${value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400 group-hover:text-slate-600'
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
                    className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all duration-200 z-10 ${isActive
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
                .catch(err => {
                    console.error(err);
                    setCameraError("Camera access denied.");
                });
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
            <div className="flex flex-col h-full bg-slate-950 relative overflow-hidden animate-fadeIn">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent)] animate-pulse"></div>
                <div className="absolute top-10 left-0 right-0 z-10 text-center">
                    <span className="bg-black/40 text-blue-400 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-xl border border-blue-500/20">Clinical Vision Active</span>
                </div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="w-64 h-64 border-2 border-blue-500/20 rounded-[3rem] relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,1)]"></div>
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-2xl"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-2xl"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-2xl"></div>
                    </div>
                </div>

                {cameraError ? (
                    <div className="flex-1 flex items-center justify-center text-white flex-col p-12 text-center">
                        <div className="w-20 h-20 bg-red-500/20 rounded-[2rem] flex items-center justify-center text-red-500 mb-6 border border-red-500/20 animate-scaleUp">
                            <CameraOffIcon />
                        </div>
                        <h3 className="text-xl font-black mb-2 tracking-tight">Vision Restricted</h3>
                        <p className="text-slate-500 text-xs font-bold leading-relaxed mb-8">Access to the clinical imaging system has been denied by the operating environment.</p>
                        <button onClick={() => setShowCamera(false)} className="px-10 py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10">Return to Portal</button>
                    </div>
                ) : (
                    <video ref={videoRef} autoPlay playsInline className="flex-1 object-cover w-full opacity-60" />
                )}

                <div className="absolute bottom-0 w-full p-12 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex justify-between items-center z-20">
                    <button onClick={() => setShowCamera(false)} className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Abort</button>
                    <button onClick={handleCapture} className="relative group">
                        <div className="absolute inset-[-10px] bg-white rounded-full blur-xl opacity-20 group-active:opacity-40 transition-opacity"></div>
                        <div className="w-20 h-20 bg-white rounded-full border-8 border-white/20 shadow-2xl flex items-center justify-center active:scale-95 transition-all">
                            <div className="w-12 h-12 border-2 border-slate-900 rounded-full"></div>
                        </div>
                    </button>
                    <div className="w-10"></div>
                </div>
                <canvas ref={canvasRef} className="hidden" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#f8fafc] relative page-transition">
            {showIntro && <TriageIntroModal onDismiss={() => setShowIntro(false)} />}

            <div className="px-8 py-10 shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Smart Triage</h2>
                    <div className="w-12 h-12 rounded-[1.5rem] bg-indigo-500/10 text-indigo-600 flex items-center justify-center border border-indigo-500/10">
                        <TriageIcon />
                    </div>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Diagnostic Neural Intake • v2.0</p>
            </div>

            <div className="flex-grow overflow-y-auto pb-12 px-8 space-y-10 no-scrollbar">

                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Temporal Baseline</label>
                    </div>
                    <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
                        <SegmentedControl
                            options={['None', '< 1 Week', '1-3 Weeks', '> 3 Weeks']}
                            value={inputs.coughDuration}
                            onChange={(val) => setInputs({ ...inputs, coughDuration: val })}
                        />
                    </div>
                </section>

                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1 h-4 bg-red-500 rounded-full"></div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Clinical Indicators</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <ToggleCard label="Febrile (>38°C)" value={inputs.fever} onChange={(v) => setInputs({ ...inputs, fever: v })} colorClass="bg-red-500" />
                        <ToggleCard label="Angina / Pain" value={inputs.chestPain} onChange={(v) => setInputs({ ...inputs, chestPain: v })} colorClass="bg-rose-500" />
                        <ToggleCard label="Dyspnea" value={inputs.breathingDifficulty} onChange={(v) => setInputs({ ...inputs, breathingDifficulty: v })} colorClass="bg-orange-500" />
                        <ToggleCard label="Hemoptysis" value={inputs.sputum} onChange={(v) => setInputs({ ...inputs, sputum: v })} colorClass="bg-amber-600" />
                        <ToggleCard label="Cachexia" value={inputs.weightLoss} onChange={(v) => setInputs({ ...inputs, weightLoss: v })} colorClass="bg-slate-700" />

                        <button
                            type="button"
                            onClick={() => capturedImagePreview ? null : setShowCamera(true)}
                            className={`relative group flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed transition-all duration-500 h-28 overflow-hidden ${capturedImagePreview
                                    ? 'border-transparent shadow-xl'
                                    : 'bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50/50'
                                }`}
                        >
                            {capturedImagePreview ? (
                                <>
                                    <img src={capturedImagePreview} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Visual" />
                                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"></div>
                                    <div className="relative z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-xl">
                                        <CheckCircleIcon />
                                    </div>
                                    <span className="relative z-10 text-[8px] text-white font-black uppercase tracking-widest mt-2">Retake Analysis</span>
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setCapturedImagePreview(null); setInputs({ ...inputs, visualObservation: null }) }}
                                        className="absolute inset-0 w-full h-full z-20"
                                    />
                                </>
                            ) : (
                                <>
                                    <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-100 transition-all">
                                        <CameraIcon />
                                    </div>
                                    <span className="text-[9px] font-black text-slate-400 text-center uppercase tracking-widest group-hover:text-blue-600">Observation</span>
                                </>
                            )}
                        </button>
                    </div>
                </section>
            </div>

            <div className="px-8 py-10 bg-white border-t border-slate-100 flex gap-4 shrink-0 z-20">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={isLoading}
                    className="w-16 h-16 rounded-[2rem] bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100 transition-all flex items-center justify-center active:scale-90"
                >
                    <ArrowLeftIcon />
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="flex-1 h-16 rounded-[2rem] bg-slate-900 text-white font-black text-[12px] uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/30 hover:bg-slate-800 active:scale-[0.98] transition-all flex justify-center items-center gap-4 border border-white/5"
                >
                    {isLoading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
                            Processing Matrix
                        </>
                    ) : (
                        <>
                            Initiate Core Analysis <div className="bg-white/10 p-2 rounded-xl"><ArrowLeftIcon /></div>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default TriageScreen;
