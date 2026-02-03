
import React, { useEffect, useState } from 'react';
import { MicroscopeIcon } from './IconComponents.tsx';

interface AnalysisScreenProps {
    onCancel?: () => void;
}

const AnalysisScreen: React.FC<AnalysisScreenProps> = ({ onCancel }) => {
    const [progress, setProgress] = useState(5);
    const [statusIndex, setStatusIndex] = useState(0);

    const statuses = [
        "Initializing Neural Engine",
        "Calibrating Radiometric Data",
        "Segmenting Anatomical Structures",
        "Isolating Pathological Regions",
        "Cross-Referencing clinical_Guidelines.v3",
        "Synthesizing Diagnostic Report"
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(old => {
                if (old >= 98) return 98;
                const diff = Math.random() * 8;
                return old + diff;
            });
        }, 1200);

        const statusTimer = setInterval(() => {
            setStatusIndex(prev => (prev < statuses.length - 1 ? prev + 1 : prev));
        }, 2200);

        return () => {
            clearInterval(timer);
            clearInterval(statusTimer);
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full bg-slate-900 px-6 overflow-hidden relative">
            {/* Background Neural Grid */}
            <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-500/5 to-transparent"></div>

            <div className="relative mb-12">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-[60px] opacity-20 animate-pulse"></div>

                <div className="relative w-40 h-40 flex items-center justify-center">
                    {/* Outer Rotating Ring */}
                    <div className="absolute inset-0 border-2 border-dashed border-blue-400/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
                    <div className="absolute inset-4 border border-blue-400/20 rounded-full animate-[spin_6s_linear_infinite_reverse]"></div>

                    {/* Scanner Line */}
                    <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-5xl text-white shadow-[0_0_40px_rgba(59,130,246,0.5)] z-10">
                        <MicroscopeIcon />
                    </div>
                </div>
            </div>

            <div className="text-center z-10 max-w-xs">
                <h2 className="text-xl font-black text-white tracking-[0.1em] uppercase mb-1">
                    {statuses[statusIndex]}
                </h2>
                <div className="flex items-center justify-center gap-1.5 mb-8">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>

                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Diagnostic Pipeline Status: Active</p>

                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mb-4 border border-white/5">
                    <div
                        className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)] transition-all duration-1000 ease-in-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">
                    <span>LOD: {Math.round(progress)}%</span>
                    <span>THROUGHPUT: 1.2 GB/S</span>
                </div>
            </div>

            <div className="absolute bottom-12 w-full px-10">
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="w-full text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] hover:text-white transition-colors py-4 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-md"
                    >
                        Terminate Sequence
                    </button>
                )}
            </div>
        </div>
    );
};

export default AnalysisScreen;
