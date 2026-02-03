import React from 'react';
import {
    CheckCircleIcon, LungsIcon, HeartIcon, BrainIcon, MicroscopeIcon, ArrowLeftIcon, TriageIcon, DnaIcon, InfoIcon, ShieldCheckIcon
} from './IconComponents.tsx';

const DetailsScreen: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
    return (
        <div className="flex flex-col h-full bg-[#f8fafc] page-transition">

            {/* Header Section */}
            <div className="relative h-64 bg-slate-900 rounded-b-[3.5rem] overflow-hidden mb-8 shrink-0 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-indigo-900 to-slate-900 opacity-95"></div>
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]"></div>
                <div className="absolute -top-12 -left-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>

                <div className="absolute bottom-0 left-0 w-full p-10">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[9px] font-black text-white uppercase tracking-[0.2em] border border-white/10">
                            Clinical Architecture v3.0
                        </span>
                        <span className="px-3 py-1 bg-emerald-500/20 backdrop-blur-md rounded-full text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] border border-emerald-500/20">
                            Secure
                        </span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-3">Anviksha AI</h1>
                    <p className="text-blue-100/70 text-sm font-bold tracking-tight">The Neural Infrastructure for Digital Healthcare.</p>
                </div>

                <button onClick={onBack} className="absolute top-8 left-8 w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white/20 transition-all z-10 border border-white/10 shadow-xl active:scale-95">
                    <ArrowLeftIcon />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-12 space-y-12 no-scrollbar">

                {/* Mission & Overview */}
                <section className="animate-fadeIn">
                    <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Executive Summary</h2>
                    <div className="p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
                        <p className="text-slate-600 text-sm leading-relaxed font-bold tracking-tight">
                            Anviksha AI represents a breakthrough in <strong>Autonomous Diagnostic Support</strong>. By integrating 3rd Generation Generative Neural Engines with clinical-grade diagnostic frameworks, the platform provides instantaneous interpretation across 25+ medical specialities.
                        </p>
                        <div className="mt-6 pt-6 border-t border-slate-50 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-xl">RB</div>
                            <div>
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Architected & Engineered By</p>
                                <p className="text-base text-slate-900 font-black uppercase tracking-tight">Rohit Bagewadi</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Diagnostic Capability Matrix */}
                <section>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        <span className="w-8 h-px bg-slate-200"></span>
                        Clinical Accuracy Matrix
                        <span className="w-8 h-px bg-slate-200"></span>
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        <CapabilityCard
                            icon={<LungsIcon />}
                            title="Radiological Intelligence"
                            desc="Digital interpretation of Chest X-Ray, Bone Trauma, and Soft Tissue pathology."
                            color="blue"
                        />
                        <CapabilityCard
                            icon={<HeartIcon />}
                            title="Cardio-Neural Core"
                            desc="Precision interpretation of 12-lead ECG waveforms and acute ischemic detection."
                            color="rose"
                        />
                        <CapabilityCard
                            icon={<DnaIcon />}
                            title="Pathological Insights"
                            desc="Biochemical report analysis and hematological reference mapping."
                            color="purple"
                        />
                        <CapabilityCard
                            icon={<MicroscopeIcon />}
                            title="Specialized Diagnostics"
                            desc="Dermatological lesion screening, Dental morphology, and Vision assessment."
                            color="amber"
                        />
                    </div>
                </section>

                {/* Legal Section - CRITICAL */}
                <section className="bg-rose-50 rounded-[3rem] p-8 border border-rose-100/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-rose-900 pointer-events-none">
                        <InfoIcon />
                    </div>
                    <h3 className="text-lg font-black text-rose-900 mb-4 flex items-center gap-2">
                        Legal Compliance & Disclaimer
                    </h3>
                    <div className="space-y-4">
                        <p className="text-xs text-rose-800 leading-relaxed font-bold">
                            <strong>1. Clinical Status:</strong> Anviksha AI is a Diagnostic Support Tool (DST) and is NOT classified as a medical device for primary diagnosis. All findings are probabilistic neural outputs intended to assist, not replace, humans.
                        </p>
                        <p className="text-xs text-rose-800 leading-relaxed font-bold">
                            <strong>2. Mandatory Consultation:</strong> Users are strictly required to consult a Registered Medical Practitioner (RMP) before initiating any treatment or pharmaceutical intervention based on reports generated herein.
                        </p>
                        <p className="text-xs text-rose-800 leading-relaxed font-bold">
                            <strong>3. Liability:</strong> The developer, Rohit Bagewadi, and associated contributors shall not be held liable for any clinical decisions made solely based on AI-generated interpretations.
                        </p>
                    </div>
                </section>

                {/* Privacy & Data Section */}
                <section className="bg-slate-900 rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
                    <div className="relative z-10">
                        <h3 className="text-lg font-black mb-4 flex items-center gap-2 text-emerald-400">
                            <ShieldCheckIcon /> Data Sovereignty
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium mb-6">
                            We adhere to a <strong>Zero-Persistence Architecture</strong> for sensitive medical imagery.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400"><CheckCircleIcon /></div>
                                <p className="text-[11px] font-bold text-slate-300">End-to-Edge Encryption for AI Queries</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400"><CheckCircleIcon /></div>
                                <p className="text-[11px] font-bold text-slate-300">Local-Only Health Record Persistence</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400"><CheckCircleIcon /></div>
                                <p className="text-[11px] font-bold text-slate-300">Automatic Session Memory Purge</p>
                            </div>
                        </div>
                    </div>
                    <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>
                </section>

                {/* Footer Branding */}
                <div className="pt-8 border-t border-slate-100 text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4">Anviksha Secure Core v3.0</p>
                    <div className="flex justify-center gap-6 mb-8">
                        <div className="px-5 py-2 rounded-2xl bg-slate-100 text-slate-900 text-[10px] font-black">HIPAA ALIGNED</div>
                        <div className="px-5 py-2 rounded-2xl bg-slate-100 text-slate-900 text-[10px] font-black">SSL SECURE</div>
                    </div>
                    <p className="text-[10px] text-slate-300 font-bold">
                        © 2024-2026 Anviksha AI Infrastructure. Developed in India.
                    </p>
                </div>

            </div>
        </div>
    );
};

interface CapabilityCardProps {
    icon: React.ReactNode;
    title: string;
    desc: string;
    color: 'blue' | 'rose' | 'purple' | 'amber';
}

const CapabilityCard: React.FC<CapabilityCardProps> = ({ icon, title, desc, color }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        rose: 'bg-rose-50 text-rose-600 border-rose-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        amber: 'bg-amber-50 text-amber-600 border-amber-100',
    };

    return (
        <div className="flex gap-5 p-5 bg-white rounded-3xl border border-slate-100 shadow-sm group hover:shadow-md transition-all duration-300">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${colors[color]}`}>
                {icon}
            </div>
            <div>
                <h4 className="font-black text-slate-900 text-sm mb-1 tracking-tight">{title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-bold tracking-tight opacity-70">{desc}</p>
            </div>
        </div>
    );
};

export default DetailsScreen;
