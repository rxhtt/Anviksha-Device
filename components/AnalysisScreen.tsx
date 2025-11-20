import React, { useEffect, useState } from 'react';
import { MicroscopeIcon } from './IconComponents.tsx';

const AnalysisScreen: React.FC = () => {
    const [progress, setProgress] = useState(5);
    const [status, setStatus] = useState("Analyzing");

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(old => {
                if (old >= 95) return 95;
                const diff = Math.random() * 15;
                return old + diff;
            });
        }, 800);

        const txtTimer = setTimeout(() => setStatus("Processing"), 2000);
        const txtTimer2 = setTimeout(() => setStatus("Diagnosing"), 4500);

        return () => {
            clearInterval(timer);
            clearTimeout(txtTimer);
            clearTimeout(txtTimer2);
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full bg-white rounded-3xl">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-full shadow-lg shadow-blue-200 text-4xl">
                    <MicroscopeIcon />
                </div>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">{status}...</h2>
            <p className="text-slate-400 text-sm font-medium mb-8">Please wait while AI scans the image.</p>
            
            <div className="w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
};

export default AnalysisScreen;