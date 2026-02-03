
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
        className="flex flex-col items-center justify-center bg-white p-5 rounded-[2rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-xl hover:-translate-y-1.5 active:scale-95 transition-all duration-300 h-full group"
    >
        <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center text-2xl mb-4 shadow-sm group-hover:scale-110 transition-transform duration-500`}>
            {icon}
        </div>
        <span className="text-[11px] font-extrabold text-slate-800 text-center leading-tight tracking-tight uppercase">{label}</span>
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
        <div className="absolute inset-0 z-[100] flex items-end justify-center px-0 py-0 h-full w-full">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-fadeIn" onClick={onClose}></div>

            <div className="relative w-full bg-white rounded-t-[3rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-slideInUp border-t border-white/20">
                <div className="h-1.5 w-12 bg-slate-200 mx-auto rounded-full mt-4 mb-2 shrink-0"></div>

                <div className="p-8 pb-4 bg-white shrink-0 text-center relative">
                    <div className={`w-28 h-28 mx-auto rounded-[2.5rem] flex items-center justify-center text-5xl shadow-2xl shadow-slate-100 mb-6 ${color} ring-8 ring-slate-50/50`}>
                        {icon}
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2 leading-tight">{title}</h3>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-[0.2em] mb-4">Clinical Department</p>

                    <button
                        onClick={onClose}
                        className="absolute top-2 right-6 w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 transition-all active:scale-90"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-8 pb-6 space-y-6 no-scrollbar">
                    <div className="glass-card p-6 rounded-[2rem] border border-blue-50 bg-blue-50/30">
                        <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">Preparation Guidelines</h4>
                        <p className="text-sm font-semibold text-slate-800 leading-relaxed italic">
                            "{instruction}"
                        </p>
                    </div>

                    {explanation && (
                        <div className="px-2">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">AI Diagnostic Scope</h4>
                            <p className="text-sm text-slate-500 leading-relaxed font-medium">
                                {explanation}
                            </p>
                        </div>
                    )}

                    <div className="flex items-center justify-between px-2 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400">PDF</div>
                                <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400">JPG</div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase ml-2 tracking-widest">HL7 Compliant</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-500">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Secure Cloud Path</span>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-white border-t border-slate-50 shrink-0">
                    <button
                        onClick={onConfirm}
                        className="w-full py-5 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] transition-all text-white rounded-[1.5rem] font-bold text-base shadow-2xl shadow-slate-300 flex items-center justify-center gap-4 group"
                    >
                        <div className="bg-white/20 p-2 rounded-xl group-hover:bg-white/30 transition-colors"><CameraIcon /></div>
                        <span>Initialize Scan</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

const HubIntroModal: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => (
    <div className="absolute inset-0 z-[110] flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-md p-6 h-full w-full">
        <div className="bg-white rounded-[3rem] w-full max-w-sm overflow-hidden animate-scaleUp shadow-2xl border border-white/20">
            <div className="bg-slate-900 p-10 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.3),transparent)]"></div>
                <div className="w-24 h-24 mx-auto bg-blue-600 rounded-3xl text-white flex items-center justify-center text-5xl mb-6 shadow-2xl relative z-10 animate-pulse-slow">
                    <LungsIcon />
                </div>
                <h2 className="text-3xl font-black text-white relative z-10 tracking-tight">Anviksha Core</h2>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mt-2 relative z-10">Neural Diagnostic Engine</p>
            </div>

            <div className="p-10">
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 text-slate-400 font-bold italic">01</div>
                        <p className="text-slate-600 text-sm font-semibold leading-relaxed pt-1">
                            Adopt a <span className="text-slate-900">clinical mindset</span>. Provide clear, well-lit medical imagery.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 text-slate-400 font-bold italic">02</div>
                        <p className="text-slate-600 text-sm font-semibold leading-relaxed pt-1">
                            Our AI simulates <span className="text-blue-600">specialist reasoning</span> for tertiary level reviews.
                        </p>
                    </div>
                </div>

                <button
                    onClick={onDismiss}
                    className="w-full mt-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-100 transition-all hover:-translate-y-1 active:scale-95 text-sm uppercase tracking-widest"
                >
                    Acknowledge & Start
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
        switch (modality) {
            case 'XRAY':
                return {
                    title: "Radiology Unit",
                    instruction: "Ensure the X-ray is held against a white light source or captured from a high-resolution display.",
                    explanation: "Our neural net analyzes lung markings, heart silhouette, and bony structures.",
                    icon: <LungsIcon />,
                    color: "bg-blue-600 text-white"
                };
            case 'MRI':
                return {
                    title: "Neuro Imaging",
                    instruction: "Capture specific MRI sequences (T1/T2). Focus on the area of concern.",
                    explanation: "Detailed soft-tissue analysis including brain, spine, and musculoskeletal structures.",
                    icon: <BrainIcon />,
                    color: "bg-purple-600 text-white"
                };
            case 'CT':
                return {
                    title: "Contrast CT",
                    instruction: "High contrast images work best. Avoid glare from the screen.",
                    explanation: "Identifies acute internal trauma, hemorrhage, and tumor morphology.",
                    icon: <BrainIcon />,
                    color: "bg-indigo-600 text-white"
                };
            case 'ECG':
                return {
                    title: "Cardiac Lab",
                    instruction: "Capture the full rhythm strip. Ensure the grid paper is clearly visible.",
                    explanation: "AI measures cardiac axis, intervals, and rhythmic patterns (AFib/Block).",
                    icon: <EKGIcon />,
                    color: "bg-rose-600 text-white"
                };
            case 'BLOOD':
                return {
                    title: "Hematology Lab",
                    instruction: "Ensure the entire report is within frame. OCR works best with printed text.",
                    explanation: "Extracts biomarkers to flag anemia, infection, and metabolic imbalances.",
                    icon: <DropIcon />,
                    color: "bg-red-600 text-white"
                };
            case 'DERMA':
                return {
                    title: "Dermatology",
                    instruction: "Uniform lighting, no shadows. Use macro mode for lesion details.",
                    explanation: "Morphological analysis of skin lesions and inflammatory patterns.",
                    icon: <MicroscopeIcon />,
                    color: "bg-amber-500 text-white"
                };
            case 'DENTAL':
                return {
                    title: "Oral Health",
                    instruction: "Panoramic or intraoral X-ray needed.",
                    explanation: "Evaluates endodontic state and periodontal health.",
                    icon: <ToothIcon />,
                    color: "bg-teal-600 text-white"
                };
            case 'OPHTHAL':
                return {
                    title: "Eye Clinic",
                    instruction: "Retinal imaging or clear external ocular photo.",
                    explanation: "Screens for diabetic retinopathy, glaucoma signs, and cataracts.",
                    icon: <EyeIcon />,
                    color: "bg-cyan-600 text-white"
                };
            default:
                return {
                    title: "Diagnostic Unit",
                    instruction: "Ensure the document or anatomy is clearly visible.",
                    explanation: "Comprehensive clinical diagnostic protocol.",
                    icon: <MicroscopeIcon />,
                    color: "bg-slate-700 text-white"
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
                            className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeTab === tab.id
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
