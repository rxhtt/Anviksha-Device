
import React, { useState } from 'react';
import { AlertIcon, InfoIcon } from './IconComponents.tsx';

interface DisclaimerModalProps {
  onAccept: () => void;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ onAccept }) => {
  const [canAccept, setCanAccept] = useState(false);

  return (
    <div className="fixed inset-0 z-[999] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4">
        <div className="bg-white max-w-sm w-full rounded-[2.5rem] p-8 shadow-2xl animate-scaleUp relative overflow-hidden">
            
            <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600"></div>

            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                    <InfoIcon />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Access Protocol</h2>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Genesis Neural Network</p>
            </div>

            <div className="h-64 overflow-y-auto bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-6 text-xs text-slate-600 leading-relaxed space-y-4" onScroll={(e) => {
                const target = e.target as HTMLDivElement;
                if (target.scrollHeight - target.scrollTop <= target.clientHeight + 20) {
                    setCanAccept(true);
                }
            }}>
                <p className="font-bold text-slate-900">1. DIAGNOSTIC SUPPORT SYSTEM</p>
                <p>Anviksha AI is a high-precision Clinical Decision Support System. It provides expert-grade analysis based on medical imaging and data inputs but is designed to support, not replace, physical clinical examinations.</p>
                
                <p className="font-bold text-slate-900">2. DATA SOVEREIGNTY</p>
                <p>All patient records created in this session are stored locally on your device's secure cache. No personally identifiable health information is stored on Anviksha cloud servers unless explicitly synced.</p>
                
                <p className="font-bold text-slate-900">3. NEURAL INTEGRITY</p>
                <p>By entering, you acknowledge that diagnostics are performed by the Genesis Neural Engine v3.0. In critical cases, immediate physical medical consultation is mandatory.</p>
                
                <p className="text-center text-slate-400 italic pt-4">-- Scroll to acknowledge protocol --</p>
            </div>

            <div className="space-y-3">
                <button 
                    onClick={onAccept}
                    disabled={!canAccept}
                    className={`w-full py-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 tracking-widest uppercase ${
                        canAccept 
                            ? 'bg-slate-900 text-white shadow-xl hover:bg-slate-800' 
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                >
                    {canAccept ? "INITIALIZE ENGINE" : "READ PROTOCOL"}
                </button>
            </div>
        </div>
    </div>
  );
};

export default DisclaimerModal;
