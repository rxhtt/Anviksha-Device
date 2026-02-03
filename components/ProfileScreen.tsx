import React, { useState } from 'react';
import type { UserProfile } from '../types.ts';
import { ArrowLeftIcon, SaveIcon, UserIcon, InfoIcon } from './IconComponents.tsx';

interface ProfileScreenProps {
    profile: UserProfile;
    onSave: (profile: UserProfile) => void;
    onBack: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ profile, onSave, onBack }) => {
    const [editedProfile, setEditedProfile] = useState<UserProfile>({ ...profile });

    const handleSave = () => {
        onSave(editedProfile);
    };

    return (
        <div className="flex flex-col h-full bg-[#f8fafc] page-transition">

            <div className="px-8 py-10 shrink-0 bg-white border-b border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Patient Profile</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Neural Context Configuration</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar pb-32">

                {/* Weight Trend Visualization */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-4 bg-teal-500 rounded-full"></div>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Longitudinal Trends</h3>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden">
                        <div className="flex justify-between items-end gap-2 h-32 mb-6">
                            {[50, 65, 58, 72, 68, 75, 70].map((h, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full bg-slate-50 rounded-full flex items-end overflow-hidden h-full">
                                        <div className="w-full bg-teal-500/20 group-hover:bg-teal-500/40 transition-all" style={{ height: `${h}%` }}></div>
                                    </div>
                                    <span className="text-[8px] font-black text-slate-300 uppercase">Wk {i + 1}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-4 bg-teal-50 p-4 rounded-2xl border border-teal-100">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-teal-600 shadow-sm"><InfoIcon /></div>
                            <p className="text-[10px] text-teal-800 font-bold leading-relaxed italic">
                                Metabolic Stability: Your weight has fluctuated by ±2% over the last session cycle.
                            </p>
                        </div>
                    </div>
                </section>

                <div className="space-y-8">
                    <InputGroup label="Full Name" value={editedProfile.name} onChange={(v) => setEditedProfile({ ...editedProfile, name: v })} placeholder="Clinical ID / Name" />

                    <div className="grid grid-cols-2 gap-6">
                        <InputGroup label="Age" type="number" value={editedProfile.age.toString()} onChange={(v) => setEditedProfile({ ...editedProfile, age: parseInt(v) })} placeholder="Years" />
                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Biological Sex</label>
                            <select
                                value={editedProfile.sex}
                                onChange={(e) => setEditedProfile({ ...editedProfile, sex: e.target.value as any })}
                                className="w-full h-14 px-6 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 shadow-sm appearance-none"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <InputGroup label="Blood Group" value={editedProfile.bloodGroup} onChange={(v) => setEditedProfile({ ...editedProfile, bloodGroup: v })} placeholder="e.g. O+" />
                        <InputGroup label="Body Mass (KG)" type="number" value={editedProfile.weight.toString()} onChange={(v) => setEditedProfile({ ...editedProfile, weight: parseFloat(v) })} placeholder="Weight" />
                    </div>

                    <InputGroup label="Chronic Conditions" value={editedProfile.chronicConditions.join(', ')} onChange={(v) => setEditedProfile({ ...editedProfile, chronicConditions: v.split(',').map(s => s.trim()).filter(s => s) })} placeholder="Diabetes, Asthma, etc." />

                    <InputGroup label="Allergies" value={editedProfile.allergies.join(', ')} onChange={(v) => setEditedProfile({ ...editedProfile, allergies: v.split(',').map(s => s.trim()).filter(s => s) })} placeholder="Penicillin, Peanuts, etc." />

                    <InputGroup label="Emergency Contact" value={editedProfile.emergencyContact} onChange={(v) => setEditedProfile({ ...editedProfile, emergencyContact: v })} placeholder="+91 XXXX XXXX" />
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white/90 to-transparent flex gap-4">
                <button
                    onClick={onBack}
                    className="w-16 h-16 rounded-[2rem] bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100 transition-all flex items-center justify-center active:scale-90"
                >
                    <ArrowLeftIcon />
                </button>
                <button
                    onClick={handleSave}
                    className="flex-1 h-16 rounded-[2rem] bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/30 hover:bg-slate-800 active:scale-[0.98] transition-all flex justify-center items-center gap-4"
                >
                    Update Neural Profile <div className="bg-white/10 p-2 rounded-xl"><SaveIcon /></div>
                </button>
            </div>
        </div>
    );
};

const InputGroup = ({ label, value, onChange, placeholder, type = "text" }: { label: string, value: string, onChange: (v: string) => void, placeholder: string, type?: string }) => (
    <div className="space-y-3">
        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-14 px-6 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 shadow-sm transition-all"
        />
    </div>
);

export default ProfileScreen;
