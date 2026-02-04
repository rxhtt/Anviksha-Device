
import React, { useState, useEffect } from 'react';
import { 
    InfoIcon, ArrowLeftIcon, SparklesIcon, CheckCircleIcon, 
    AlertIcon, WifiIcon, SearchIcon, TrashIcon, PlusIcon
} from './IconComponents.tsx';
import AIManager from '../services/aiManager.js';

interface SettingsScreenProps {
    onBack: () => void;
    aiManager: AIManager;
}

interface KeyEntry {
    key: string;
    status: 'idle' | 'success' | 'error' | 'testing';
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, aiManager }) => {
    const [fdaKey, setFdaKey] = useState(() => window.localStorage.getItem('anviksha_fda_key') || '');
    const [newKey, setNewKey] = useState('');
    const [keyCluster, setKeyCluster] = useState<KeyEntry[]>(() => {
        try {
            const saved = JSON.parse(window.localStorage.getItem('anviksha_neural_links') || '[]');
            return saved.map((k: string) => ({ key: k, status: 'idle' }));
        } catch (e) { return []; }
    });

    const [isTestingFda, setIsTestingFda] = useState(false);
    const [fdaStatus, setFdaStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [saveStatus, setSaveStatus] = useState(false);

    const handleAddKey = () => {
        if (!newKey.trim()) return;
        if (keyCluster.some(k => k.key === newKey.trim())) {
            alert("This link is already active.");
            return;
        }
        setKeyCluster(prev => [...prev, { key: newKey.trim(), status: 'idle' }]);
        setNewKey('');
    };

    const handleRemoveKey = (keyToRemove: string) => {
        setKeyCluster(prev => prev.filter(k => k.key !== keyToRemove));
    };

    const handleClearFdaKey = () => {
        setFdaKey('');
        setFdaStatus('idle');
    };

    const testSingleKey = async (index: number) => {
        const target = keyCluster[index];
        setKeyCluster(prev => prev.map((k, i) => i === index ? { ...k, status: 'testing' } : k));
        
        try {
            const ok = await aiManager.testKeyConnection(target.key);
            setKeyCluster(prev => prev.map((k, i) => i === index ? { ...k, status: ok ? 'success' : 'error' } : k));
        } catch (e) {
            setKeyCluster(prev => prev.map((k, i) => i === index ? { ...k, status: 'error' } : k));
        }
    };

    const testFda = async () => {
        if (!fdaKey.trim()) return;
        setIsTestingFda(true);
        setFdaStatus('idle');
        try {
            const ok = await aiManager.testFdaConnection(fdaKey);
            setFdaStatus(ok ? 'success' : 'error');
        } catch (e) {
            setFdaStatus('error');
        } finally {
            setIsTestingFda(false);
        }
    };

    const handleSave = () => {
        if (fdaKey.trim()) {
            window.localStorage.setItem('anviksha_fda_key', fdaKey.trim());
        } else {
            window.localStorage.removeItem('anviksha_fda_key');
        }
        
        window.localStorage.setItem('anviksha_neural_links', JSON.stringify(keyCluster.map(k => k.key)));
        setSaveStatus(true);
        setTimeout(() => setSaveStatus(false), 2000);
    };

    const handleFactoryReset = () => {
        if (window.confirm("CRITICAL: Wipe all local records and settings?")) {
            window.localStorage.clear();
            // Force a hard reload to reset memory state
            window.location.reload();
        }
    };

    const maskKey = (key: string) => {
        if (key.length <= 8) return "••••••••";
        return `${key.substring(0, 4)}••••${key.substring(key.length - 4)}`;
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 font-sans">
            <div className="px-5 pt-10 pb-6 bg-white border-b border-slate-100 shrink-0">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">System</h1>
                    <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                        <ArrowLeftIcon />
                    </button>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Neural Engine v3.2 • Multi-Link Cluster</p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 no-scrollbar">
                
                {/* NEURAL LINK CLUSTER */}
                <section className="space-y-3">
                    <h2 className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Neural Links (Gemini)</h2>
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 relative">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl shadow-lg">
                                <SparklesIcon />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">Key Cluster</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase">Adding multiple keys prevents 429 errors</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input 
                                    type="password" 
                                    value={newKey}
                                    onChange={(e) => setNewKey(e.target.value)}
                                    placeholder="Add Gemini API Key..."
                                    className="flex-1 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                                <button 
                                    onClick={handleAddKey}
                                    className="w-14 h-14 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-md active:scale-95 transition-all"
                                >
                                    <PlusIcon />
                                </button>
                            </div>

                            <div className="space-y-2 mt-4">
                                {keyCluster.map((entry, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${
                                                entry.status === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                                                entry.status === 'error' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 
                                                entry.status === 'testing' ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'
                                            }`}></div>
                                            <span className="text-xs font-mono font-bold text-slate-600 tracking-tight">{maskKey(entry.key)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => testSingleKey(idx)}
                                                className={`w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center transition-all ${
                                                    entry.status === 'success' ? 'text-emerald-500' : 'text-slate-400 hover:text-blue-500'
                                                }`}
                                            >
                                                {entry.status === 'testing' ? <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin"></div> : <WifiIcon />}
                                            </button>
                                            <button 
                                                onClick={() => handleRemoveKey(entry.key)}
                                                className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 transition-all flex items-center justify-center"
                                            >
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* FDA CONFIG */}
                <section className="space-y-3">
                    <h2 className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">OpenFDA (Clinical)</h2>
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Authentication Key</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="password" 
                                        value={fdaKey}
                                        onChange={(e) => setFdaKey(e.target.value)}
                                        placeholder="Enter FDA Key..."
                                        className="flex-1 px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none"
                                    />
                                    <button 
                                        onClick={testFda}
                                        disabled={isTestingFda || !fdaKey.trim()}
                                        className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all shadow-sm ${
                                            fdaStatus === 'success' ? 'bg-emerald-500 text-white' : 
                                            fdaStatus === 'error' ? 'bg-red-500 text-white' : 
                                            'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                        }`}
                                    >
                                        {isTestingFda ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : fdaStatus === 'success' ? (
                                            <CheckCircleIcon />
                                        ) : fdaStatus === 'error' ? (
                                            <AlertIcon />
                                        ) : (
                                            <WifiIcon />
                                        )}
                                    </button>
                                    <button 
                                        onClick={handleClearFdaKey}
                                        className="w-14 h-14 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* MAINTENANCE */}
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
                                    <h3 className="font-bold text-slate-900 text-sm">Factory Reset</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Wipe all local records and links</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </section>

                <div className="pt-4">
                     <button 
                        onClick={handleSave}
                        className={`w-full py-4.5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 ${
                            saveStatus ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white'
                        }`}
                    >
                        {saveStatus ? <><CheckCircleIcon /> Saved</> : 'Apply Cluster Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsScreen;
