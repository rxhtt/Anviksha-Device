import React from 'react';
import { HomeIcon, RecordsIcon, PillIcon, CameraIcon } from './IconComponents.tsx';

interface BottomNavProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  const getActiveColor = (screen: string) => {
    if (currentScreen === screen) return 'text-blue-600';
    if (screen === 'scan' && currentScreen === 'hub') return 'text-blue-600';
    if (screen === 'home' && currentScreen === 'welcome') return 'text-blue-600';
    return 'text-slate-400';
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 pb-6 pt-2 px-6 z-50">
      <div className="flex justify-between items-end">
        
        <button 
          onClick={() => onNavigate('home')} 
          className={`flex flex-col items-center gap-1 w-16 ${getActiveColor('home')}`}
        >
          <div className="text-2xl"><HomeIcon /></div>
          <span className="text-[10px] font-bold">Home</span>
        </button>

        <button 
          onClick={() => onNavigate('records')} 
          className={`flex flex-col items-center gap-1 w-16 ${getActiveColor('records')}`}
        >
          <div className="text-2xl"><RecordsIcon /></div>
          <span className="text-[10px] font-bold">Records</span>
        </button>

        {/* Floating Action Button Container */}
        <div className="relative -top-8">
          <button 
            onClick={() => onNavigate('scan')}
            className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl shadow-[0_8px_30px_rgba(37,99,235,0.5)] border-4 border-slate-50 transform active:scale-95 transition-transform"
          >
            <CameraIcon />
          </button>
        </div>

        <button 
          onClick={() => onNavigate('care')} 
          className={`flex flex-col items-center gap-1 w-16 ${getActiveColor('care')}`}
        >
          <div className="text-2xl"><PillIcon /></div>
          <span className="text-[10px] font-bold">Care</span>
        </button>

        <div className="w-16 opacity-0"></div> {/* Spacer for balance if needed */}
      </div>
    </div>
  );
};

export default BottomNav;