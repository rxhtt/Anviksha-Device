import React from 'react';
import { WifiIcon, WifiOffIcon, ArrowLeftIcon } from './IconComponents.tsx';

interface HeaderProps {
  isOnline: boolean;
  currentScreen: string;
  onBack: () => void;
}

const Header: React.FC<HeaderProps> = ({ isOnline, currentScreen, onBack }) => {
  const showBackButton = currentScreen !== 'welcome';

  return (
    <header className="no-print sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 text-slate-800 h-14 shrink-0 flex items-center justify-between px-4 transition-all">
      <div className="w-20 flex justify-start">
          {showBackButton ? (
            <button 
                onClick={onBack} 
                className="group flex items-center gap-1 text-blue-600 hover:opacity-70 transition-opacity"
            >
                <ArrowLeftIcon />
                <span className="font-medium text-[17px]">Back</span>
            </button>
          ) : (
             <div className={`flex items-center justify-center w-8 h-8 rounded-full ${isOnline ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                {isOnline ? <WifiIcon /> : <WifiOffIcon />}
             </div>
          )}
      </div>

      <div className="flex-1 text-center">
        <h1 className="text-[17px] font-semibold tracking-tight text-slate-900">
            {currentScreen === 'welcome' ? 'Anviksha AI' : 
             currentScreen.charAt(0).toUpperCase() + currentScreen.slice(1).replace('-', ' ')}
        </h1>
      </div>

      <div className="w-20 flex justify-end">
      </div>
    </header>
  );
};

export default Header;