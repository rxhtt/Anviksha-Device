
import React, { useState, useEffect } from 'react';
import { 
    InfoIcon, ArrowLeftIcon, SparklesIcon, CheckCircleIcon, 
    AlertIcon, WifiIcon, TrashIcon, PlusIcon, MessageIcon, TherapyIcon, CameraIcon, PillIcon
} from './IconComponents.tsx';
import AIManager from '../services/aiManager.js';

interface SettingsScreenProps {
    onBack: () => void;
    aiManager: AIManager;
}

interface LinkState {
    key: string;
    isVerified: boolean | null;
    isTesting: boolean;
    error: string | null;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, aiManager }) => {
    const [links, setLinks] = useState<{ [key: string]: LinkState }>({
        vision: { key: window.localStorage.getItem('anviksha_vision_link') || '', isVerified: null, isTesting: false, error: null },
        chat: { key: window.localStorage.getItem('anviksha_chat_link') || '', isVerified: null, isTesting: false, error: null },
        therapy: { key: window.localStorage.getItem('anviksha_therapy_link') || '', isVerified: null, isTesting: false, error: null },
        fda: { key: window.localStorage.getItem('anviksha_fda_link') || '', isVerified: null, isTesting: false, error: null }
    });
    
    const [saveStatus, setSaveStatus] = useState(false);

    const handleKeyChange = (id: string, value: string) => {
        setLinks(prev => ({
            ...prev,
            [id]: { ...prev[id], key: value, isVerified: null, error: null }
        }));
    };

    const verifyKey = async (id: string) => {
        setLinks(prev => ({ ...prev, [id]: { ...prev[id], isTesting: true, error: null } }));
        
        const result = await aiManager.verifyLink(id, links[id].key);
        
        setLinks(prev => ({
            ...prev,
            [id]: { 
                ...prev[id], 
                isTesting: false, 
                isVerified: result.success,
                error: result.success ? null : result.message 
            }
        }));
    };

    const handleSave = () => {
        Object.entries(links).forEach(([id, state]) => {
            window.localStorage.setItem(`anviksha_${id}_link`, state.key);
        });
        setSaveStatus(true);
        setTimeout(() => setSaveStatus(false), 2000);
    };

    const handleFactoryReset = () => {
        if (window.confirm("CRITICAL: Wipe all local neural links and data records?")) {
            window.localStorage.clear();
            window.location.reload();
        }
    };

    const renderLinkCard = (id: string, label: string, icon: React.ReactNode, placeholder: string) => {
        const state = links[id];
        return (
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 space-y-4 group transition-all hover:shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner transition-colors ${
                            state.isVerified === true ? 'bg-emerald-600 text-white' : 
                            state.isVerified === false ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'
                        }`}>
                            {icon}
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 text-sm tracking-tight uppercase">{label}</h3>
                            <div className="flex items-center gap-1.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                    state.isVerified === true ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                                    state.isVerified === false ? 'bg-red-500' : 'bg-slate-300'
                                }`}></div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                    {state.isVerified === true ? 'Link Established' : 
                                     state.isVerified === false ? 'Handshake Failed' : 'Ready to Verify'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => verifyKey(id)}
                        disabled={state.isTesting || !state.key}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            state.isTesting ? 'bg-slate-50 text-slate-300' : 
                            state.isVerified === true ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}
                    >
                        {state.isTesting ? 'Testing...' : state.isVerified === true ? 'Verified' : 'Verify Link'}
                    </button>
                </div>

                <div className="relative">
                    <input 
                        type="password" 
                        value={state.key}
                        onChange={(e) => handleKeyChange(id, e.target.value)}
                        placeholder={placeholder}
                        className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-300"
                    />
                </div>

                {state.error && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg text-red-600 text-[10px] font-bold uppercase animate-fadeIn">
                        <AlertIcon /> {state.error}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 font-sans">
            <div className="px-5 pt-10 pb-6 bg-white border-b border-slate-100 shrink-0">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase">System Hub</h1>
                    <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                        <ArrowLeftIcon />
                    </button>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Genesis Engine v4.0 • Neural Cluster Command</p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 no-scrollbar pb-32">
                
                <section className="space-y-4">
                    <h2 className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Imaging Channel</h2>
                    {renderLinkCard('vision', 'Optical Vision Link', <CameraIcon />, 'Google Vision API Key...')}
                </section>

                <section className="space-y-4">
                    <h2 className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Intelligence Channels</h2>
                    {renderLinkCard('chat', 'Consultation Link', <MessageIcon />, 'Gemini API Key (Chat/Labs)...')}
                    {renderLinkCard('therapy', 'Therapy Logic Link', <TherapyIcon />, 'Gemini API Key (Wellness)...')}
                </section>

                <section className="space-y-4">
                    <h2 className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Database Channels</h2>
                    {renderLinkCard('fda', 'Clinical FDA Link', <PillIcon />, 'OpenFDA API Key...')}
                </section>

                <section className="pt-4 border-t border-slate-200">
                    <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100">
                        <button 
                            onClick={handleFactoryReset}
                            className="w-full p-6 flex items-center justify-between hover:bg-red-50 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center text-xl group-hover:bg-red-600 group-hover:text-white transition-all">
                                    <TrashIcon />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-slate-900 text-sm">System Cold Boot</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Sanitize local storage and keys</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </section>

                <div className="text-center pt-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">
                        <SparklesIcon /> System Integrity Dashboard Active
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50">
                <button 
                    onClick={handleSave}
                    className={`w-full py-5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 ${
                        saveStatus ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white shadow-slate-200'
                    }`}
                >
                    {saveStatus ? <><CheckCircleIcon /> CLUSTER SYNCHRONIZED</> : 'SAVE NEURAL CONFIG'}
                </button>
            </div>
        </div>
    );
};

export default SettingsScreen;
