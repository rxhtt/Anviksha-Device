import React, { useEffect, useState } from 'react';
import { MicroscopeIcon } from './IconComponents';

const AnalysisScreen: React.FC = () => {
    const [progress, setProgress] = useState(10);

    useEffect(() => {
        const timer = setTimeout(() => {
            setProgress(90);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="analysis-screen text-center flex flex-col items-center justify-center h-full">
            <div className="text-7xl text-blue-500 animate-pulse mb-4">
                <MicroscopeIcon />
            </div>
            <h2 className="text-3xl font-bold text-slate-800">Analyzing X-ray Image...</h2>
            <p className="text-slate-600 mt-2 mb-8">AI is processing the chest X-ray patterns.</p>
            
            <div className="analysis-progress w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                    className="analysis-progress-bar h-full bg-gradient-to-r from-blue-400 to-emerald-500 rounded-full"
                    style={{ width: `${progress}%`, transition: 'width 8s ease-in-out' }}
                ></div>
            </div>
            
            <p className="mt-4 text-sm text-slate-500">Detecting tuberculosis, pneumonia, and other conditions.</p>
        </div>
    );
};

export default AnalysisScreen;
