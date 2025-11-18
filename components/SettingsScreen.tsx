
import React, { useState, useEffect } from 'react';
import type { ApiKeyStatus } from '../types.ts';
import { ArrowLeftIcon, CheckCircleIcon, InfoIcon } from './IconComponents.tsx';

interface SettingsScreenProps {
  apiKey: string | null;
  apiKeyStatus: ApiKeyStatus;
  onUpdateApiKey: (newKey: string) => Promise<boolean>;
  onTestApiKey: (keyToTest: string) => Promise<boolean>;
  onClearApiKey: () => void;
  onBack: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
    apiKey, apiKeyStatus, onUpdateApiKey, onTestApiKey, onClearApiKey, onBack 
}) => {
  const [currentKey, setCurrentKey] = useState(apiKey || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!currentKey) return;
    setIsSaving(true);
    await onUpdateApiKey(currentKey);
    setIsSaving(false);
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-bold text-slate-900 mb-6 px-2">Configuration</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
          <div className="p-4 border-b border-slate-50">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Gemini API Key</label>
              <input 
                type="password"
                value={currentKey}
                onChange={(e) => setCurrentKey(e.target.value)}
                placeholder="Paste key here"
                className="w-full text-base text-slate-900 placeholder-slate-300 focus:outline-none"
              />
          </div>
          <div className="p-4 bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${apiKeyStatus === 'valid' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                 <span className="text-xs font-semibold text-slate-500 capitalize">{apiKeyStatus.replace('_', ' ')}</span>
              </div>
              <div className="flex gap-2">
                  <button onClick={() => onTestApiKey(currentKey)} className="text-xs font-bold text-blue-600 px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100">Test</button>
                  <button onClick={handleSave} disabled={isSaving} className="text-xs font-bold text-white px-3 py-1.5 bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50">
                      {isSaving ? 'Saving...' : 'Save'}
                  </button>
              </div>
          </div>
      </div>

      <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50 flex gap-3 items-start mb-6">
          <div className="text-blue-500 mt-0.5"><InfoIcon /></div>
          <p className="text-xs text-blue-800/70 leading-relaxed">
              Get your API key from Google AI Studio. This key is stored locally on your device.
          </p>
      </div>

      <div className="mt-auto">
        <button onClick={onClearApiKey} className="w-full py-3 text-red-500 font-semibold text-sm hover:bg-red-50 rounded-xl transition-colors">
            Reset Configuration
        </button>
      </div>
    </div>
  );
};

export default SettingsScreen;
