
import React from 'react';
import { LungsIcon, EKGIcon, DropIcon, BrainIcon, BoneIcon, TriageIcon, MicroscopeIcon } from './IconComponents.tsx';
import type { Modality } from '../types.ts';

interface MedicalHubProps {
    onSelectService: (modality: Modality) => void;
    onStartTriage: () => void;
    userName?: string;
}

interface ServiceCardProps {
    icon: React.ReactNode;
    label: string;
    color: string;
    onClick: () => void;
    delay: number;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ icon, label, color, onClick, delay }) => (
    <button 
        onClick={onClick}
        className="flex flex-col items-center justify-center bg-white rounded-3xl aspect-square shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] border border-slate-50 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.12)] hover:-translate-y-1 active:scale-95 transition-all duration-300 group relative overflow-hidden"
        style={{ animation: `fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms backwards` }}
    >
        <div className={`w-16 h-16 rounded-full ${color} flex items-center justify-center text-3xl mb-3 transition-transform duration-300 group-hover:scale-110`}>
            {icon}
        </div>
        <span className="text-sm font-bold text-slate-800 tracking-tight">{label}</span>
    </button>
);

const MedicalHub: React.FC<MedicalHubProps> = ({ onSelectService, onStartTriage }) => {
    return (
        <div className="flex flex-col h-full">
            <div className="px-2 mb-6">
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Anviksha Hospital AI</h2>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Select Service</h1>
            </div>

            <div className="grid grid-cols-2 gap-4 overflow-y-auto pb-4 px-2">
                {/* Triage - Main Feature */}
                <button 
                    onClick={onStartTriage}
                    className="col-span-2 flex items-center p-5 bg-slate-900 rounded-[2rem] text-white shadow-xl shadow-slate-300 hover:bg-slate-800 active:scale-[0.98] transition-all duration-300 relative overflow-hidden group"
                >
                    <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-2xl mr-4 group-hover:bg-white/20 transition-colors">
                        <TriageIcon />
                    </div>
                    <div className="text-left z-10">
                        <h3 className="text-lg font-bold">AI Triage & Screening</h3>
                        <p className="text-slate-300 text-xs font-medium">Check symptoms before scanning</p>
                    </div>
                    {/* Decorative Gradient */}
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
                </button>

                <ServiceCard 
                    icon={<LungsIcon />} 
                    label="Chest X-Ray" 
                    color="bg-blue-50 text-blue-600" 
                    onClick={() => onSelectService('XRAY')} 
                    delay={100}
                />
                <ServiceCard 
                    icon={<EKGIcon />} 
                    label="Cardio / ECG" 
                    color="bg-rose-50 text-rose-600" 
                    onClick={() => onSelectService('ECG')} 
                    delay={200}
                />
                <ServiceCard 
                    icon={<DropIcon />} 
                    label="Blood Work" 
                    color="bg-red-50 text-red-600" 
                    onClick={() => onSelectService('BLOOD')} 
                    delay={300}
                />
                <ServiceCard 
                    icon={<BrainIcon />} 
                    label="MRI / CT" 
                    color="bg-purple-50 text-purple-600" 
                    onClick={() => onSelectService('MRI')} 
                    delay={400}
                />
                <ServiceCard 
                    icon={<MicroscopeIcon />} 
                    label="Dermatology" 
                    color="bg-amber-50 text-amber-600" 
                    onClick={() => onSelectService('DERMA')} 
                    delay={500}
                />
                 <ServiceCard 
                    icon={<BoneIcon />} 
                    label="Fractures" 
                    color="bg-emerald-50 text-emerald-600" 
                    onClick={() => onSelectService('XRAY')} 
                    delay={600}
                />
            </div>
        </div>
    );
};

export default MedicalHub;
