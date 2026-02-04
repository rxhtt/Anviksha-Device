
import React, { useState } from 'react';
import { AlertIcon, InfoIcon } from './IconComponents.tsx';

interface DisclaimerModalProps {
  onAccept: () => void;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ onAccept }) => {
  const [canAccept, setCanAccept] = useState(false);

  return (
    <div className="fixed inset-0 z-[999] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-6">
        <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-white/10 animate-scaleUp relative overflow-hidden">
            
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500"></div>

            <div className="flex items-center gap-3 mb-4 text-slate-900">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                    <AlertIcon />
                </div>
                <div>
                    <h2 className="text-lg font-black uppercase tracking-tight">Anviksha Genesis</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">First-Gen Neural Hospital</p>
                </div>
            </div>

            <div className="h-72 overflow-y-auto bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-6 text-sm text-slate-600 space-y-4" onScroll={(e) => {
                const target = e.target as HTMLDivElement;
                if (target.scrollHeight - target.scrollTop <= target.clientHeight + 30) {
                    setCanAccept(true);
                }
            }}>
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg">
                    <p className="text-xs text-blue-800 font-bold">
                        ACCESS PROTOCOL:
                    </p>
                    <p className="text-[11px] text-blue-700 mt-1 leading-tight">
                        This environment demonstrates the **Genesis Core** capabilities prior to global public rollout.
                    </p>
                </div>

                <p><strong>1. INFRASTRUCTURE SCALE:</strong> We are currently in the **Demonstration Phase**. While public uploads are enabled for capability showcase, Enterprise-Grade Encryption and HIPAA-compliant Auth layers are architected for the Global Rollout Phase.</p>
                
                <p><strong>2. NON-CLINICAL DEVICE:</strong> Anviksha is a "Clinical Decision Support System" (CDSS). It aids, but does not replace, professional medical judgment. It is not an FDA-cleared diagnostic tool.</p>
                
                <p><strong>3. DATA PRIVACY:</strong> Patient records in this session are stored in **Local Storage** to ensure immediate data sovereignty during this demonstration. No PHI (Protected Health Information) is permanently stored on our servers.</p>
                
                <p className="text-xs text-slate-400 italic mt-6 text-center">-- Scroll to acknowledge --</p>
            </div>

            <div className="space-y-3">
                <button 
                    onClick={onAccept}
                    disabled={!canAccept}
                    className={`w-full py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                        canAccept 
                            ? 'bg-slate-900 text-white shadow-xl shadow-amber-900/20 hover:bg-slate-800 hover:scale-[1.02]' 
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                >
                    {canAccept ? "Enter Genesis Portal" : "Read Full Protocol"}
                </button>
                
                {!canAccept && (
                    <p className="text-[10px] text-center text-slate-400 font-medium">
                        Please review the access protocols to proceed.
                    </p>
                )}
            </div>
        </div>
    </div>
  );
};

export default DisclaimerModal;
