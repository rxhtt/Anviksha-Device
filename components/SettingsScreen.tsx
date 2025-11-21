import React from 'react';
import { InfoIcon } from './IconComponents.tsx';

// Secure Component: All Settings Logic Removed
const SettingsScreen: React.FC<any> = ({ onBack }) => {
  return (
    <div className="flex flex-col h-full p-6 items-center justify-center text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
        <InfoIcon />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">Settings Restricted</h2>
      <p className="text-sm text-slate-500">
        Application configuration is managed by the administrator via secure environment variables.
      </p>
      <button onClick={onBack} className="mt-8 px-6 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm">
          Back
      </button>
    </div>
  );
};

export default SettingsScreen;