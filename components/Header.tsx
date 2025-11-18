import React, { useRef, useState } from 'react';
import { WifiIcon, WifiOffIcon, ArrowLeftIcon } from './IconComponents';

interface HeaderProps {
  onEmergencyExit: () => void;
  isOnline: boolean;
  currentScreen: string;
  onBack: () => void;
}

const Header: React.FC<HeaderProps> = ({ onEmergencyExit, isOnline, currentScreen, onBack }) => {
  const pressTimer = useRef<number | null>(null);
  const progressInterval = useRef<number | null>(null);
  const [pressProgress, setPressProgress] = useState(0);
  
  const LONG_PRESS_DURATION = 2000; // 2 seconds
  const showBackButton = currentScreen !== 'welcome';

  const handlePressStart = () => {
    handlePressEnd();
    progressInterval.current = window.setInterval(() => {
        setPressProgress(p => p >= 100 ? 100 : p + (100 / (LONG_PRESS_DURATION / 100)));
    }, 100);
    pressTimer.current = window.setTimeout(() => {
        onEmergencyExit();
        handlePressEnd();
    }, LONG_PRESS_DURATION);
  };

  const handlePressEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    if (progressInterval.current) clearInterval(progressInterval.current);
    pressTimer.current = null;
    progressInterval.current = null;
    setPressProgress(0);
  };

  return (
    <header className="clinic-header no-print bg-slate-800 text-white p-4 shadow-md shrink-0 flex items-center rounded-t-2xl">
      {/* Left Section: Back Button & Status */}
      <div className="flex-1 flex justify-start items-center gap-4">
          {showBackButton && (
            <button onClick={onBack} className="text-white hover:bg-white/10 rounded-full p-2 transition-colors">
                <ArrowLeftIcon />
            </button>
          )}
          {isOnline ? (
              <span className="flex items-center gap-1.5 text-green-300 bg-black/20 px-2.5 py-1 rounded-full text-xs font-semibold">
                  <WifiIcon /> Online
              </span>
          ) : (
              <span className="flex items-center gap-1.5 text-slate-400 bg-black/20 px-2.5 py-1 rounded-full text-xs font-semibold">
                  <WifiOffIcon /> Offline
              </span>
          )}
      </div>

      {/* Center Section: Title */}
      <div className="flex-shrink-0 text-center mx-4">
        <h1 className="clinic-name text-lg font-bold tracking-wide">ANVIKSHA AI</h1>
      </div>

      {/* Right Section: Emergency Exit */}
      <div className="flex-1 flex justify-end">
        <button 
          onMouseDown={handlePressStart}
          onMouseUp={handlePressEnd}
          onMouseLeave={handlePressEnd}
          onTouchStart={handlePressStart}
          onTouchEnd={handlePressEnd}
          className="emergency-exit relative bg-white/10 hover:bg-white/20 transition-colors text-white px-3 py-2 rounded-full text-xs font-semibold select-none overflow-hidden"
          style={{ touchAction: 'none' }}
        >
          <span 
            className="absolute top-0 left-0 h-full bg-red-500/60"
            style={{ width: `${pressProgress}%`, transition: pressProgress > 0 ? 'width 0.1s linear' : 'none' }}
          ></span>
          <span className="relative z-10">
              {pressProgress > 0 ? 'Hold...' : 'Exit'}
          </span>
        </button>
      </div>
    </header>
  );
};

export default Header;