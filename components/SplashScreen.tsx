import React, { useEffect, useState } from 'react';
import { AnvikshaLogo } from './IconComponents.tsx';

interface SplashScreenProps {
    onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setFadeOut(true), 7000);
        const finishTimer = setTimeout(onFinish, 8000);
        return () => {
            clearTimeout(timer);
            clearTimeout(finishTimer);
        };
    }, [onFinish]);

    return (
        <div className={`fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center px-6 transition-opacity duration-1000 ease-in-out overflow-hidden ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40vh] h-[40vh] bg-blue-50 rounded-full blur-3xl opacity-60"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40vh] h-[40vh] bg-indigo-50 rounded-full blur-3xl opacity-60"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center w-full max-w-md">
                
                <div className="mb-12 relative">
                    <div className="absolute inset-0 bg-blue-400/20 blur-2xl rounded-full animate-pulse"></div>
                    <div className="animate-[scaleIn_1.2s_cubic-bezier(0.16,1,0.3,1)_forwards]">
                        <AnvikshaLogo className="w-28 h-28 sm:w-36 sm:h-36 drop-shadow-xl" />
                    </div>
                </div>

                <div className="space-y-8 w-full">
                    <div className="overflow-hidden">
                        <h1 className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tighter animate-[slideUp_1s_ease-out_0.5s_both]">
                            ANVIKSHA
                            <span className="text-blue-600">.AI</span>
                        </h1>
                    </div>

                    <div className="w-16 h-1 bg-slate-200 rounded-full mx-auto animate-[widthExpand_1s_ease-out_1.2s_both]"></div>

                    <div className="relative px-2">
                        <p className="text-lg sm:text-xl text-slate-600 font-serif italic leading-relaxed animate-[fadeIn_1.5s_ease-out_1.8s_both]">
                            "Every symptom is a whisper.<br/>
                            We have learned to listen."
                        </p>
                    </div>
                    
                    <p className="text-[10px] sm:text-xs font-bold text-blue-500 uppercase tracking-[0.3em] pt-8 animate-[fadeIn_1.5s_ease-out_3s_both]">
                        DECODING THE LANGUAGE OF LIFE
                    </p>
                </div>
            </div>
            
            <style>{`
                @keyframes scaleIn {
                    0% { transform: scale(0.8); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes slideUp {
                    0% { transform: translateY(40px); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }
                @keyframes fadeIn {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                }
                @keyframes widthExpand {
                    0% { width: 0; opacity: 0; }
                    100% { width: 64px; opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default SplashScreen;