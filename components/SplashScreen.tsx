import React, { useEffect, useState } from 'react';
import { AnvikshaLogo } from './IconComponents.tsx';

interface SplashScreenProps {
    onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
    const [fadeOut, setFadeOut] = useState(false);
    const [statusText, setStatusText] = useState('Initializing Core');

    useEffect(() => {
        const statuses = [
            'Initializing Core',
            'Calibrating Neural Pathways',
            'Synchronizing Clinical Matrix',
            'Securing Patient Portal',
            'Ready for Diagnosis'
        ];

        let i = 0;
        const statusInterval = setInterval(() => {
            if (i < statuses.length - 1) {
                i++;
                setStatusText(statuses[i]);
            }
        }, 1500);

        const timer = setTimeout(() => setFadeOut(true), 7500);
        const finishTimer = setTimeout(onFinish, 8500);

        return () => {
            clearInterval(statusInterval);
            clearTimeout(timer);
            clearTimeout(finishTimer);
        };
    }, [onFinish]);

    return (
        <div className={`fixed inset-0 z-[100] bg-[#0a0f18] flex flex-col items-center justify-center px-8 transition-all duration-1000 ease-in-out overflow-hidden ${fadeOut ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100'}`}>

            {/* Tactical Grid Background */}
            <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent)]"></div>

            <div className="relative z-10 flex flex-col items-center text-center w-full max-w-lg">

                <div className="mb-16 relative">
                    <div className="absolute inset-[-40px] bg-blue-500/10 blur-[60px] rounded-full animate-pulse"></div>
                    <div className="absolute inset-[-20px] bg-blue-400/5 blur-[30px] rounded-full"></div>
                    <div className="animate-[scaleIn_1.5s_cubic-bezier(0.16,1,0.3,1)_forwards] relative">
                        <AnvikshaLogo className="w-32 h-32 sm:w-44 sm:h-44 drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]" />
                    </div>
                </div>

                <div className="space-y-10 w-full">
                    <div className="overflow-hidden">
                        <h1 className="text-6xl sm:text-7xl font-black text-white tracking-tighter animate-[slideUp_1.2s_cubic-bezier(0.16,1,0.3,1)_0.6s_both] flex items-center justify-center gap-1">
                            ANVIKSHA
                            <span className="text-blue-500 relative">
                                .AI
                                <span className="absolute -top-4 -right-8 text-[10px] font-black text-blue-400/40 tracking-[0.4em] uppercase">Private</span>
                            </span>
                        </h1>
                    </div>

                    <div className="flex flex-col items-center gap-6">
                        <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-blue-400/50 to-transparent animate-[widthExpand_1.5s_ease-out_1.2s_both]"></div>

                        <div className="relative px-4">
                            <p className="text-xl sm:text-2xl text-slate-400 font-serif italic leading-relaxed animate-[fadeIn_2s_ease-out_2s_both] tracking-tight">
                                "Every <span className="text-white">symptom</span> is a whisper.<br />
                                We have learned to <span className="text-blue-400">listen</span>."
                            </p>
                        </div>
                    </div>

                    <div className="pt-20 flex flex-col items-center gap-4 animate-[fadeIn_1.5s_ease-out_3.5s_both]">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-blue-500 rounded-full animate-ping"></div>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">{statusText}</p>
                        </div>
                        <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full animate-[progress_7s_linear_forwards] shadow-[0_0_10px_rgba(59,130,246,1)]"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-12 text-slate-600 text-[9px] font-black uppercase tracking-[0.5em] animate-[fadeIn_2s_ease-out_5s_both]">
                Neural Diagnostic Core v2.5.0
            </div>

            <style>{`
                @keyframes scaleIn {
                    0% { transform: scale(0.6); opacity: 0; filter: blur(20px); }
                    100% { transform: scale(1); opacity: 1; filter: blur(0); }
                }
                @keyframes slideUp {
                    0% { transform: translateY(60px); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }
                @keyframes fadeIn {
                    0% { opacity: 0; transform: translateY(10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes widthExpand {
                    0% { width: 0; opacity: 0; }
                    100% { width: 96px; opacity: 1; }
                }
                @keyframes progress {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
            `}</style>
        </div>
    );
};

export default SplashScreen;