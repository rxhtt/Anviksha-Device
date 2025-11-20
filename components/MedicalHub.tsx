import React, { useState } from 'react';
import { 
    LungsIcon, EKGIcon, DropIcon, BrainIcon, BoneIcon, MicroscopeIcon, 
    ToothIcon, EyeIcon, BabyIcon, DnaIcon, PillIcon, WomanIcon, StomachIcon, AppleIcon,
    TriageIcon 
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
        className="flex flex-col items-center justify-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md active:scale-95 transition-all duration-200"
    >
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-2xl mb-3`}>
            {icon}
        </div>
        <span className="text-xs font-bold text-slate-700 text-center leading-tight">{label}</span>
    </button>
);

const MedicalHub: React.FC<MedicalHubProps> = ({ onSelectService, onStartTriage }) => {
    const [activeTab, setActiveTab] = useState<'scans' | 'specialist' | 'labs' | 'wellness'>('scans');

    const tabs = [
        { id: 'scans', label: 'Scans' },
        { id: 'specialist', label: 'Specialist' },
        { id: 'labs', label: 'Lab Tests' },
        { id: 'wellness', label: 'Wellness' },
    ];

    return (
        <div className="flex flex-col h-full bg-slate-50">
            <div className="px-4 mb-4 pt-2">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Medical Services</h2>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Select Department</h1>
            </div>

            <div className="flex px-4 gap-2 overflow-x-auto no-scrollbar mb-6">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                            activeTab === tab.id 
                                ? 'bg-slate-900 text-white' 
                                : 'bg-white text-slate-500 border border-slate-200'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-6">
                <div className="grid grid-cols-3 gap-3">
                    
                    {activeTab === 'scans' && (
                        <>
                            <ServiceCard icon={<LungsIcon />} label="Chest X-Ray" color="bg-blue-50 text-blue-600" onClick={() => onSelectService('XRAY')} />
                            <ServiceCard icon={<BrainIcon />} label="MRI Neuro" color="bg-purple-50 text-purple-600" onClick={() => onSelectService('MRI')} />
                            <ServiceCard icon={<BoneIcon />} label="Fractures" color="bg-slate-100 text-slate-600" onClick={() => onSelectService('ORTHO')} />
                            <ServiceCard icon={<BrainIcon />} label="CT Scan" color="bg-indigo-50 text-indigo-600" onClick={() => onSelectService('CT')} />
                            <ServiceCard icon={<WomanIcon />} label="Ultrasound" color="bg-pink-50 text-pink-600" onClick={() => onSelectService('GYNE')} />
                            <ServiceCard icon={<WomanIcon />} label="Mammogram" color="bg-rose-50 text-rose-600" onClick={() => onSelectService('GYNE')} />
                            <ServiceCard icon={<LungsIcon />} label="Lung CT" color="bg-cyan-50 text-cyan-600" onClick={() => onSelectService('CT')} />
                            <ServiceCard icon={<BoneIcon />} label="Spine MRI" color="bg-amber-50 text-amber-600" onClick={() => onSelectService('ORTHO')} />
                            <ServiceCard icon={<BoneIcon />} label="Bone Density" color="bg-orange-50 text-orange-600" onClick={() => onSelectService('ORTHO')} />
                        </>
                    )}

                    {activeTab === 'specialist' && (
                        <>
                            <ServiceCard icon={<EKGIcon />} label="Cardiology" color="bg-rose-50 text-rose-600" onClick={() => onSelectService('ECG')} />
                            <ServiceCard icon={<MicroscopeIcon />} label="Dermatology" color="bg-amber-50 text-amber-600" onClick={() => onSelectService('DERMA')} />
                            <ServiceCard icon={<ToothIcon />} label="Dental / Oral" color="bg-teal-50 text-teal-600" onClick={() => onSelectService('DENTAL')} />
                            <ServiceCard icon={<EyeIcon />} label="Ophthalmology" color="bg-blue-50 text-blue-600" onClick={() => onSelectService('OPHTHAL')} />
                            <ServiceCard icon={<BabyIcon />} label="Pediatrics" color="bg-sky-50 text-sky-600" onClick={() => onSelectService('PEDIATRIC')} />
                            <ServiceCard icon={<LungsIcon />} label="ENT / Throat" color="bg-orange-50 text-orange-600" onClick={() => onSelectService('ENT')} />
                            <ServiceCard icon={<StomachIcon />} label="Gastro" color="bg-emerald-50 text-emerald-600" onClick={() => onSelectService('GASTRO')} />
                            <ServiceCard icon={<WomanIcon />} label="OB/GYN" color="bg-pink-50 text-pink-600" onClick={() => onSelectService('GYNE')} />
                            <ServiceCard icon={<BrainIcon />} label="Neurology" color="bg-violet-50 text-violet-600" onClick={() => onSelectService('NEURO')} />
                        </>
                    )}

                    {activeTab === 'labs' && (
                        <>
                            <ServiceCard icon={<DropIcon />} label="Blood Work" color="bg-red-50 text-red-600" onClick={() => onSelectService('BLOOD')} />
                            <ServiceCard icon={<DropIcon />} label="Urinalysis" color="bg-yellow-50 text-yellow-600" onClick={() => onSelectService('BLOOD')} />
                            <ServiceCard icon={<MicroscopeIcon />} label="Pathology" color="bg-slate-100 text-slate-600" onClick={() => onSelectService('PATHOLOGY')} />
                            <ServiceCard icon={<DnaIcon />} label="Genetic Test" color="bg-indigo-50 text-indigo-600" onClick={() => onSelectService('GENETIC')} />
                            <ServiceCard icon={<MicroscopeIcon />} label="Biopsy" color="bg-rose-50 text-rose-600" onClick={() => onSelectService('PATHOLOGY')} />
                            <ServiceCard icon={<DropIcon />} label="Metabolic" color="bg-green-50 text-green-600" onClick={() => onSelectService('BLOOD')} />
                        </>
                    )}

                    {activeTab === 'wellness' && (
                        <>
                            <ServiceCard icon={<TriageIcon />} label="Check Vitals" color="bg-blue-50 text-blue-600" onClick={() => onStartTriage()} />
                            <ServiceCard icon={<AppleIcon />} label="Diet Plan" color="bg-green-50 text-green-600" onClick={() => onSelectService('DIET')} />
                            <ServiceCard icon={<BrainIcon />} label="Mental Health" color="bg-purple-50 text-purple-600" onClick={() => onSelectService('MENTAL')} />
                            <ServiceCard icon={<WomanIcon />} label="Pregnancy" color="bg-pink-50 text-pink-600" onClick={() => onSelectService('PREGNANCY')} />
                            <ServiceCard icon={<PillIcon />} label="Meds Review" color="bg-orange-50 text-orange-600" onClick={() => onSelectService('GENERAL')} />
                            <ServiceCard icon={<DnaIcon />} label="Vaccines" color="bg-cyan-50 text-cyan-600" onClick={() => onSelectService('VACCINE')} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MedicalHub;