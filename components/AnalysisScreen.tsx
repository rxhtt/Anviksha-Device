import React, { useEffect, useState } from 'react';
import { MicroscopeIcon } from './IconComponents';

const analysisSteps = [
    "Initializing diagnostic matrix...",
    "Scanning for radiological signs...",
    "Analyzing lung structure and opacity...",
    "Checking for consolidations or infiltrates...",
    "Evaluating cardiac silhouette...",
    "Cross-referencing with medical imaging data...",
    "Finalizing diagnosis and confidence score...",
];

const AnalysisScreen: React.FC = () => {
    const [progress, setProgress] = useState(10);
    const [statusText, setStatusText] = useState(analysisSteps[0]);

    useEffect(() => {
        const progressTimer = setTimeout(() => {
            setProgress(90);
        }, 100);

        let stepIndex = 0;
        const statusTimer = setInterval(() => {
            stepIndex = (stepIndex + 1) % analysisSteps.length;
            setStatusText(analysisSteps[stepIndex]);
        }, 2000);

        return () => {
            clearTimeout(progressTimer);
            clearInterval(statusTimer);
        };
    }, []);

    return (
        <div className="analysis-screen text-center flex flex-col items-center justify-center h-full">
            <div className="text-7xl text-blue-500 animate-pulse mb-4">
                <MicroscopeIcon />
            </div>
            <h2 className="text-3xl font-bold text-slate-800">Analyzing X-ray Image...</h2>
            <p className="text-slate-600 mt-2 mb-8 h-6">{statusText}</p>
            
            <div className="analysis-progress w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div 
                    className="analysis-progress-bar h-full bg-gradient-to-r from-blue-400 to-emerald-500 rounded-full"
                    style={{ width: `${progress}%`, transition: 'width 12s cubic-bezier(0.25, 1, 0.5, 1)' }}
                ></div>
            </div>
            
            <p className="mt-4 text-sm text-slate-500">Detecting tuberculosis, pneumonia, and 12+ other conditions.</p>
        </div>
    );
};

export default AnalysisScreen;