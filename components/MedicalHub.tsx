
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
        className="flex flex-col items-center justify-center bg-white p-4 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-lg hover:-translate-y-1 active:scale-95 transition-all duration-300"
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
    
    // Extract color classes for styling
    const bgClass = color.split(' ').find(c => c.startsWith('bg-')) || 'bg-slate-100';
    const textClass = color.split(' ').find(c => c.startsWith('text-')) || 'text-slate-900';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md transition-opacity animate-fadeIn" onClick={onClose}></div>

            {/* Card Container */}
            <div className="relative w-full max-w-sm bg-white rounded-[2rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-scaleUp border border-white/20">
                
                {/* Header */}
                <div className={`p-6 ${bgClass} relative shrink-0 text-center border-b border-black/5`}>
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-t-[2rem]">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                    </div>

                    <div className={`w-16 h-16 mx-auto bg-white rounded-2xl flex items-center justify-center text-3xl shadow-lg mb-3 ${textClass} relative z-10`}>
                        {icon}
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 relative z-10">{title}</h3>
                    
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 bg-white/50 hover:bg-white rounded-full flex items-center justify-center text-slate-600 transition-all z-20"
                    >
                        ✕
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> 
                            Protocol & Instructions
                        </h4>
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm font-medium text-slate-700 leading-relaxed">
                            {instruction}
                        </div>
                    </div>

                    {explanation && (
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                AI Technology
                            </h4>
                            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 text-xs text-slate-600 leading-relaxed">
                                {explanation}
                            </div>
                        </div>
                    )}
                    
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 flex gap-2 items-start">
                        <div className="text-amber-500 mt-0.5"><InfoIcon /></div>
                        <p className="text-[10px] text-amber-800 font-semibold leading-snug">
                            Ensure patient data is anonymized. Supports Images (JPG, PNG) and Documents (PDF).
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                    <button 
                        onClick={onConfirm} 
                        className="w-full py-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] transition-all text-white rounded-2xl font-bold text-sm shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
                    >
                        <CameraIcon /> <span>Proceed to Capture / Upload</span>
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleUp { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
            `}</style>
        </div>
    );
}

const HubIntroModal: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm p-6">
        <div className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden animate-scaleUp shadow-2xl">
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
                        This is purely for <strong>analyzing medical images</strong> you already have.
                    </p>
                    <div className="my-4 h-px bg-slate-100"></div>
                    <p className="text-slate-600 text-sm leading-relaxed">
                        You use this when a patient brings an <strong>X-Ray, MRI, or Blood Report</strong>, and you need an expert AI opinion on <em>that specific image</em>.
                    </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <MicroscopeIcon />
                    </div>
                    <p className="text-xs font-bold text-slate-700">
                        Acts like a Radiologist or Pathologist.
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
                    title: "Chest X-Ray Analysis",
                    instruction: "Upload a clear photo of the physical X-ray film against a lightbox, or capture a digital screen displaying the X-ray. Avoid glare. Ensure R/L markers are visible.",
                    explanation: "Uses Vision Transformers to detect pneumonia, TB, nodules, and fractures with radiologist-level precision.",
                    icon: <LungsIcon />,
                    color: "bg-blue-50 text-blue-600"
                };
            case 'MRI':
                return {
                    title: "MRI Neural Scan",
                    instruction: "Capture the specific MRI sequence (T1, T2, FLAIR) clearly. If uploading a file, ensure it is high resolution. Text labels should not obscure the anatomy.",
                    explanation: "Segments brain and spine structures to identify tumors, ischemia, or disc herniation.",
                    icon: <BrainIcon />,
                    color: "bg-purple-50 text-purple-600"
                };
            case 'CT':
                return {
                    title: "CT Scan Analysis",
                    instruction: "Ensure the CT slice is well-lit. If scanning from a screen, reduce brightness to prevent blooming. Supports Dicom-to-Image or PDF reports.",
                    explanation: "Analyzes cross-sectional density to detect hemorrhage, masses, or organ damage.",
                    icon: <BrainIcon />,
                    color: "bg-indigo-50 text-indigo-600"
                };
            case 'ECG':
                return {
                    title: "ECG / EKG Analysis",
                    instruction: "Align camera parallel to the grid. Ensure P, QRS, and T waves are sharp. Flatten the paper if curved. PDF export from ECG machine is preferred.",
                    explanation: "Digitizes waveform intervals (PR, QT) to detect AFib, STEMI, and other arrhythmias.",
                    icon: <EKGIcon />,
                    color: "bg-rose-50 text-rose-600"
                };
            case 'BLOOD':
                return {
                    title: "Lab Report OCR",
                    instruction: "Take a steady photo of the printed report or upload the PDF file directly. Ensure numerical values and reference ranges are legible.",
                    explanation: "Extracts biomarkers via OCR and cross-references with medical standards to flag critical abnormalities.",
                    icon: <DropIcon />,
                    color: "bg-red-50 text-red-600"
                };
            case 'DERMA':
                return {
                    title: "Dermatology Scan",
                    instruction: "Take a well-lit, macro photo of the skin lesion. Place a small coin nearby for size reference if possible. Avoid shadows.",
                    explanation: "Analyzes asymmetry, border, color, and diameter (ABCD) to assess malignancy risk.",
                    icon: <MicroscopeIcon />,
                    color: "bg-amber-50 text-amber-600"
                };
            case 'DENTAL':
                return {
                    title: "Dental X-Ray",
                    instruction: "Capture OPG or Bitewing X-rays. Ensure contrast is sufficient to see roots and gum line. PDF reports supported.",
                    explanation: "Detects caries, bone loss, and impacted teeth.",
                    icon: <ToothIcon />,
                    color: "bg-teal-50 text-teal-600"
                };
            case 'OPHTHAL':
                return {
                    title: "Retinal / Eye Scan",
                    instruction: "Upload Fundus camera images or close-up of the external eye. Ensure flash does not wash out the retina.",
                    explanation: "Screens for diabetic retinopathy, glaucoma, and cataracts.",
                    icon: <EyeIcon />,
                    color: "bg-blue-50 text-blue-600"
                };
            default:
                return {
                    title: "Medical Analysis",
                    instruction: "Ensure the medical document or anatomical area is clearly visible, well-lit, and in focus. PDF and Images supported.",
                    explanation: "FDA-aligned algorithms provide preliminary diagnostic insights.",
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

            <div className="px-4 mb-4 pt-2">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Medical Services</h2>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Select Department</h1>
            </div>

            <div className="flex px-4 gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
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

            <div className="flex-1 overflow-y-auto px-4 pb-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    
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
                            <ServiceCard icon={<ToothIcon />} label="Dental / Oral" color="bg-teal-50 text-teal-600" onClick={() => handleServiceClick('DENTAL')} />
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
