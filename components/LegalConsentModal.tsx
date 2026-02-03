import React, { useState } from 'react';
import { InfoIcon, ShieldCheckIcon, AlertIcon } from './IconComponents.tsx';

interface LegalConsentModalProps {
    onAccept: () => void;
}

const LegalConsentModal: React.FC<LegalConsentModalProps> = ({ onAccept }) => {
    const [scrolled, setScrolled] = useState(false);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollTop + clientHeight >= scrollHeight - 20) {
            setScrolled(true);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-2xl flex items-center justify-center p-6 animate-fadeIn">
            <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scaleUp">

                <div className="p-8 pb-4 text-center">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100">
                        <ShieldCheckIcon />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">Clinical Consent</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Guardian Protocol v2.5</p>
                </div>

                <div
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto px-10 py-6 space-y-8 no-scrollbar text-slate-600"
                >
                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Non-Diagnostic Advisory</h3>
                        </div>
                        <p className="text-sm font-bold leading-relaxed">
                            Anviksha AI is a clinical decision support tool designed for educational and preliminary screening purposes. It is <span className="text-red-600 underline">NOT</span> a replacement for a certified Medical Professional.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Data Privacy (HIPAA Alignment)</h3>
                        </div>
                        <p className="text-xs font-medium leading-relaxed italic opacity-80">
                            Your medical images and inputs are processed via encrypted neural channels. No patient data is permanently stored on public cloud servers beyond the session duration.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Emergency Protocol</h3>
                        </div>
                        <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex gap-4">
                            <div className="text-red-500 shrink-0"><AlertIcon /></div>
                            <p className="text-[11px] font-black text-red-900 leading-normal uppercase">
                                IF YOU ARE EXPERIENCING A MEDICAL EMERGENCY, CALL 108 (India) OR YOUR LOCAL EMERGENCY SERVICE IMMEDIATELY.
                            </p>
                        </div>
                    </section>

                    {!scrolled && (
                        <div className="text-center py-4 border-t border-slate-50 animate-bounce">
                            <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Scroll to verify all terms</span>
                        </div>
                    )}
                </div>

                <div className="p-8 bg-slate-50 border-t border-slate-100">
                    <button
                        onClick={onAccept}
                        disabled={!scrolled}
                        className={`w-full h-16 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-xl transition-all ${scrolled
                                ? 'bg-slate-900 text-white hover:bg-slate-800'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                            }`}
                    >
                        Accept & Initialize Neural Core
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LegalConsentModal;
