
import React, { useState, useEffect } from 'react';
import { 
    InfoIcon, ArrowLeftIcon, SparklesIcon, CheckCircleIcon, 
    AlertIcon, WifiIcon, TrashIcon, PlusIcon, MessageIcon, TherapyIcon, CameraIcon
} from './IconComponents.tsx';
import AIManager from '../services/aiManager.js';

interface SettingsScreenProps {
    onBack: () => void;
    aiManager: AIManager;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, aiManager }) => {
    const [keys, setKeys] = useState({
        vision: window.localStorage.getItem('anviksha_vision_link') || '',
        chat: window.localStorage.getItem('anviksha_chat_link') || '',
        therapy: window.localStorage.getItem('anviksha_therapy_link') || ''
    });
    
    const [saveStatus, setSaveStatus] = useState(false);

    const handleSave = () => {
        window.localStorage.setItem('anviksha_vision_link', keys.vision);
        window.localStorage.setItem('anviksha_chat_link', keys.chat);
        window.localStorage.setItem('anviksha_therapy_link', keys.therapy);
        setSaveStatus(true);
        setTimeout(() => setSaveStatus(false), 2000);
    };

    const handleFactoryReset = () => {
        if (window.confirm("CRITICAL: Wipe all local data and configurations?")) {
            window.localStorage.clear();
            window.location.reload();
        }
    };

    const renderKeyInput = (id: keyof typeof keys, label: string, icon: React.ReactNode, placeholder: string) => (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xl">
                    {icon}
                </div>
                <div>
                    <h3 className="font-bold text-slate-900 text-sm">{label}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Link Cluster</p>
                </div>
            </div>
            <input 
                type="password" 
                value={keys[id]}
                onChange={(e) => setKeys(prev => ({ ...prev, [id]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-slate-50 font-sans">
            <div className="px-5 pt-10 pb-6 bg-white border-b border-slate-100 shrink-0">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">System</h1>
                    <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <ArrowLeftIcon />
                    </button>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Genesis Engine v3.5 • Multi-Channel Configuration</p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 no-scrollbar pb-32">
                
                <section className="space-y-3">
                    <h2 className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Optical Intelligence</h2>
                    {renderKeyInput('vision', 'Google Vision Link', <CameraIcon />, 'Enter Google Cloud Vision API Key...')}
                </section>

                <section className="space-y-3">
                    <h2 className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Consultation Engine</h2>
                    {renderKeyInput('chat', 'Gemini Chat Link', <MessageIcon />, 'Enter Gemini API Key for Chat...')}
                </section>

                <section className="space-y-3">
                    <h2 className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Wellness Logic</h2>
                    {renderKeyInput('therapy', 'Genesis Therapy Link', <TherapyIcon />, 'Enter Gemini API Key for Therapy...')}
                </section>

                <section className="space-y-3">
                    <h2 className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Maintenance</h2>
                    <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100">
                        <button 
                            onClick={handleFactoryReset}
                            className="w-full p-6 flex items-center justify-between hover:bg-red-50 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center text-xl group-hover:bg-red-500 group-hover:text-white transition-all">
                                    <TrashIcon />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-slate-900 text-sm">OS Cold Boot</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Wipe all local cache and records</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </section>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-2xl">
                <button 
                    onClick={handleSave}
                    className={`w-full py-5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 ${
                        saveStatus ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white shadow-blue-200'
                    }`}
                >
                    {saveStatus ? <><CheckCircleIcon /> CHANNELS SYNCHRONIZED</> : 'SAVE CONFIGURATION'}
                </button>
            </div>
        </div>
    );
};

export default SettingsScreen;
