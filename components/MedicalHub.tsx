
import React, { useState, useEffect } from 'react';
import { 
    LungsIcon, EKGIcon, DropIcon, BrainIcon, BoneIcon, MicroscopeIcon, 
    ToothIcon, EyeIcon, BabyIcon, DnaIcon, PillIcon, WomanIcon, StomachIcon, AppleIcon,
    TriageIcon, InfoIcon, CameraIcon, UploadIcon, CheckCircleIcon
} from './IconComponents.tsx';
import type { Modality } from '../types.ts';

interface MedicalHubProps {
    onSelectService: (modality: Modality) => void;
    onStartTriage: () => void;
}

interface ServiceCardProps {
    icon: React.ReactNode;
    label: string;
    color: string;
    onClick: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, label, color, onClick }) => (
    <button 
        onClick={onClick}
        className="flex flex-col items-center justify-center bg-white p-4 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-lg hover:-translate-y-1 active:scale-95 transition-all duration-300 h-full"
    >
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-2xl mb-3 shadow-inner`}>
            {icon}
        </div>
        <span className="text-xs font-bold text-slate-700 text-center leading-tight">{label}</span>
    </button>
);

interface InstructionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    instruction: string;
    explanation?: string;
    icon: React.ReactNode;
    color: string;
}

const InstructionModal: React.FC<InstructionModalProps> = ({ isOpen, onClose, onConfirm, title, instruction, explanation, icon, color }) => {
    if (!isOpen) return null;
    
    return (
        <div className="absolute inset-0 z-[100] flex items-center justify-center px-4 py-6 h-full w-full">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md transition-opacity animate-fadeIn" onClick={onClose}></div>

            <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scaleUp border-4 border-white/20">
                <div className="p-8 pb-6 bg-white shrink-0 text-center relative">
                    <div className={`w-24 h-24 mx-auto rounded-[2rem] flex items-center justify-center text-5xl shadow-2xl shadow-slate-200 mb-5 ${color} ring-8 ring-slate-50`}>
                        {icon}
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-1 leading-tight">{title}</h3>
                    <div className="h-1.5 w-12 bg-slate-100 mx-auto rounded-full mt-3"></div>
                    
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 w-9 h-9 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-8 pb-4 space-y-6">
                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Standard Protocol</h4>
                        <p className="text-sm font-medium text-slate-800 leading-relaxed">
                            {instruction}
                        </p>
                    </div>

                    {explanation && (
                        <div className="px-2">
                            <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">AI Capabilities</h4>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                {explanation}
                            </p>
                        </div>
                    )}
                    
                    <div className="flex items-center justify-between px-2 py-2 border-t border-slate-50">
                         <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                             <span className="bg-slate-100 p-1 rounded">PDF</span>
                             <span className="bg-slate-100 p-1 rounded">JPG</span>
                             <span className="bg-slate-100 p-1 rounded">PNG</span>
                         </div>
                         <div className="text-[10px] font-bold text-slate-400 uppercase">Secure Upload</div>
                    </div>
                </div>

                <div className="p-6 bg-white border-t border-slate-50 shrink-0">
                    <button 
                        onClick={onConfirm} 
                        className="w-full py-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] transition-all text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-300 flex items-center justify-center gap-3 group"
                    >
                        <div className="bg-white/20 p-1.5 rounded-full group-hover:bg-white/30 transition-colors"><CameraIcon /></div>
                        <span>Start Analysis</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

const HubIntroModal: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => (
    <div className="absolute inset-0 z-[90] flex items-center justify-center px-4 bg-slate-900/80 backdrop-blur-sm p-6 h-full w-full">
        <div className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden animate-scaleUp shadow-2xl border border-white/10">
            <div className="bg-blue-600 p-8 text-center relative overflow-hidden">
                <div className="absolute top-[-50%] left-[-50%] w-full h-full bg-blue-500 rounded-full blur-3xl opacity-50"></div>
                <div className="w-20 h-20 mx-auto bg-white/10 backdrop-blur-md rounded-2xl text-white flex items-center justify-center text-4xl mb-4 shadow-inner relative z-10 border border-white/20">
                    <LungsIcon />
                </div>
                <h2 className="text-2xl font-bold text-white relative z-10">Full Body Scan</h2>
                <p className="text-xs font-bold text-blue-100 uppercase tracking-widest mt-1 relative z-10">Diagnostic Imaging</p>
            </div>
            
            <div className="p-8">
                <div className="mb-6">
                    <p className="text-slate-600 text-sm font-medium leading-relaxed">
                        This is purely for <strong>analyzing medical images</strong>.
                    </p>
                    <div className="my-4 h-px bg-slate-100"></div>
                    <p className="text-slate-600 text-sm leading-relaxed">
                        Use this when a patient provides an <strong>X-Ray, MRI, or Report</strong> for expert AI opinion.
                    </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <MicroscopeIcon />
                    </div>
                    <p className="text-xs font-bold text-slate-700">
                        Radiologist-Grade Analysis
                    </p>
                </div>

                <button 
                    onClick={onDismiss}
                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-lg transition-all"
                >
                    Access Medical Hub
                </button>
            </div>
        </div>
    </div>
);

const MedicalHub: React.FC<MedicalHubProps> = ({ onSelectService, onStartTriage }) => {
    const [activeTab, setActiveTab] = useState<'scans' | 'specialist' | 'labs' | 'wellness'>('scans');
    const [showHubIntro, setShowHubIntro] = useState(true);
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        modality: Modality | null;
        title: string;
        instruction: string;
        explanation: string;
        icon: React.ReactNode;
        color: string;
    }>({ isOpen: false, modality: null, title: '', instruction: '', explanation: '', icon: null, color: '' });

    const getServiceDetails = (modality: Modality) => {
        switch(modality) {
            case 'XRAY':
                return {
                    title: "Chest X-Ray",
                    instruction: "Upload a clear photo of the physical X-ray film or a digital screen capture. Ensure markers (L/R) are visible.",
                    explanation: "Detects pneumonia, TB, nodules, fractures, and effusions.",
                    icon: <LungsIcon />,
                    color: "bg-blue-50 text-blue-600"
                };
            case 'MRI':
                return {
                    title: "MRI Scan",
                    instruction: "Capture specific MRI sequences (T1/T2). High contrast images work best.",
                    explanation: "Analyzes soft tissue, brain structures, and spinal alignment.",
                    icon: <BrainIcon />,
                    color: "bg-purple-50 text-purple-600"
                };
            case 'CT':
                return {
                    title: "CT Scan",
                    instruction: "Ensure slice is well-lit. Reduce screen brightness to prevent blooming if photographing a monitor.",
                    explanation: "Identifies hemorrhage, masses, and internal trauma.",
                    icon: <BrainIcon />,
                    color: "bg-indigo-50 text-indigo-600"
                };
            case 'ECG':
                return {
                    title: "ECG / EKG",
                    instruction: "Align camera parallel to grid. Ensure P, QRS, and T waves are sharp.",
                    explanation: "Measures intervals to detect AFib, STEMI, and arrhythmias.",
                    icon: <EKGIcon />,
                    color: "bg-rose-50 text-rose-600"
                };
            case 'BLOOD':
                return {
                    title: "Lab Report",
                    instruction: "Photo of printed report or PDF upload. Ensure numbers are legible.",
                    explanation: "OCRs values to flag abnormal biomarkers.",
                    icon: <DropIcon />,
                    color: "bg-red-50 text-red-600"
                };
            case 'DERMA':
                return {
                    title: "Skin Scan",
                    instruction: "Macro photo of lesion. Good lighting is essential.",
                    explanation: "Assesses ABCDs of melanoma and common rashes.",
                    icon: <MicroscopeIcon />,
                    color: "bg-amber-50 text-amber-600"
                };
            case 'DENTAL':
                return {
                    title: "Dental X-Ray",
                    instruction: "OPG or Bitewing X-ray needed.",
                    explanation: "Checks for cavities, bone loss, and impaction.",
                    icon: <ToothIcon />,
                    color: "bg-teal-50 text-teal-600"
                };
            case 'OPHTHAL':
                return {
                    title: "Eye Scan",
                    instruction: "Fundus image or external eye photo.",
                    explanation: "Screens for retinopathy and cataracts.",
                    icon: <EyeIcon />,
                    color: "bg-blue-50 text-blue-600"
                };
            default:
                return {
                    title: "Medical Analysis",
                    instruction: "Ensure document or area is visible.",
                    explanation: "Standard AI diagnostic protocol.",
                    icon: <MicroscopeIcon />,
                    color: "bg-slate-50 text-slate-600"
                };
        }
    };

    const handleServiceClick = (modality: Modality) => {
        const details = getServiceDetails(modality);
        setModalState({
            isOpen: true,
            modality,
            ...details
        });
    };

    const handleConfirm = () => {
        if (modalState.modality) {
            onSelectService(modalState.modality);
            setModalState(prev => ({ ...prev, isOpen: false }));
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 relative">
            {showHubIntro && <HubIntroModal onDismiss={() => setShowHubIntro(false)} />}

            <InstructionModal 
                isOpen={modalState.isOpen}
                onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
                onConfirm={handleConfirm}
                title={modalState.title}
                instruction={modalState.instruction}
                explanation={modalState.explanation}
                icon={modalState.icon}
                color={modalState.color}
            />

            <div className="px-4 mb-4 pt-2 shrink-0">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Medical Services</h2>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Select Department</h1>
            </div>

            <div className="px-4 mb-6 pb-1 shrink-0">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {[
                        { id: 'scans', label: 'Scans & Imaging' },
                        { id: 'specialist', label: 'Specialist Care' },
                        { id: 'labs', label: 'Lab Reports' },
                        { id: 'wellness', label: 'Wellness' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                                activeTab === tab.id 
                                    ? 'bg-slate-900 text-white shadow-md transform scale-105' 
                                    : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-10">
                    {activeTab === 'scans' && (
                        <>
                            <ServiceCard icon={<LungsIcon />} label="Chest X-Ray" color="bg-blue-50 text-blue-600" onClick={() => handleServiceClick('XRAY')} />
                            <ServiceCard icon={<BrainIcon />} label="MRI Neuro" color="bg-purple-50 text-purple-600" onClick={() => handleServiceClick('MRI')} />
                            <ServiceCard icon={<BrainIcon />} label="CT Scan" color="bg-indigo-50 text-indigo-600" onClick={() => handleServiceClick('CT')} />
                            <ServiceCard icon={<BoneIcon />} label="Fractures" color="bg-slate-100 text-slate-600" onClick={() => handleServiceClick('ORTHO')} />
                            <ServiceCard icon={<WomanIcon />} label="Ultrasound" color="bg-pink-50 text-pink-600" onClick={() => handleServiceClick('GYNE')} />
                            <ServiceCard icon={<BoneIcon />} label="Spine MRI" color="bg-amber-50 text-amber-600" onClick={() => handleServiceClick('ORTHO')} />
                        </>
                    )}

                    {activeTab === 'specialist' && (
                        <>
                            <ServiceCard icon={<EKGIcon />} label="Cardiology" color="bg-rose-50 text-rose-600" onClick={() => handleServiceClick('ECG')} />
                            <ServiceCard icon={<MicroscopeIcon />} label="Dermatology" color="bg-amber-50 text-amber-600" onClick={() => handleServiceClick('DERMA')} />
                            <ServiceCard icon={<ToothIcon />} label="Dental" color="bg-teal-50 text-teal-600" onClick={() => handleServiceClick('DENTAL')} />
                            <ServiceCard icon={<EyeIcon />} label="Ophthalmology" color="bg-blue-50 text-blue-600" onClick={() => handleServiceClick('OPHTHAL')} />
                            <ServiceCard icon={<BabyIcon />} label="Pediatrics" color="bg-sky-50 text-sky-600" onClick={() => handleServiceClick('PEDIATRIC')} />
                            <ServiceCard icon={<LungsIcon />} label="ENT / Throat" color="bg-orange-50 text-orange-600" onClick={() => handleServiceClick('ENT')} />
                            <ServiceCard icon={<StomachIcon />} label="Gastro" color="bg-emerald-50 text-emerald-600" onClick={() => handleServiceClick('GASTRO')} />
                            <ServiceCard icon={<WomanIcon />} label="OB/GYN" color="bg-pink-50 text-pink-600" onClick={() => handleServiceClick('GYNE')} />
                        </>
                    )}

                    {activeTab === 'labs' && (
                        <>
                            <ServiceCard icon={<DropIcon />} label="Blood Work" color="bg-red-50 text-red-600" onClick={() => handleServiceClick('BLOOD')} />
                            <ServiceCard icon={<DropIcon />} label="Urinalysis" color="bg-yellow-50 text-yellow-600" onClick={() => handleServiceClick('BLOOD')} />
                            <ServiceCard icon={<MicroscopeIcon />} label="Pathology" color="bg-slate-100 text-slate-600" onClick={() => handleServiceClick('PATHOLOGY')} />
                            <ServiceCard icon={<DnaIcon />} label="Genetic Test" color="bg-indigo-50 text-indigo-600" onClick={() => handleServiceClick('GENETIC')} />
                            <ServiceCard icon={<MicroscopeIcon />} label="Biopsy" color="bg-rose-50 text-rose-600" onClick={() => handleServiceClick('PATHOLOGY')} />
                        </>
                    )}

                    {activeTab === 'wellness' && (
                        <>
                            <ServiceCard icon={<TriageIcon />} label="Smart Triage" color="bg-blue-50 text-blue-600" onClick={() => onStartTriage()} />
                            <ServiceCard icon={<AppleIcon />} label="Diet Plan" color="bg-green-50 text-green-600" onClick={() => handleServiceClick('DIET')} />
                            <ServiceCard icon={<BrainIcon />} label="Mental Health" color="bg-purple-50 text-purple-600" onClick={() => handleServiceClick('MENTAL')} />
                            <ServiceCard icon={<WomanIcon />} label="Pregnancy" color="bg-pink-50 text-pink-600" onClick={() => handleServiceClick('PREGNANCY')} />
                            <ServiceCard icon={<PillIcon />} label="Meds Review" color="bg-orange-50 text-orange-600" onClick={() => handleServiceClick('GENERAL')} />
                            <ServiceCard icon={<DnaIcon />} label="Vaccines" color="bg-cyan-50 text-cyan-600" onClick={() => handleServiceClick('VACCINE')} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MedicalHub;
