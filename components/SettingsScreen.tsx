import React, { useState, useEffect } from 'react';
import type { ApiKeyStatus } from '../types';
import { ArrowLeftIcon, CheckCircleIcon, InfoIcon } from './IconComponents';

interface SettingsScreenProps {
  apiKey: string | null;
  apiKeyStatus: ApiKeyStatus;
  onUpdateApiKey: (newKey: string) => Promise<boolean>;
  onTestApiKey: (keyToTest: string) => Promise<boolean>;
  onClearApiKey: () => void;
  onBack: () => void;
}

const ApiKeyStatusIndicator: React.FC<{ status: ApiKeyStatus }> = ({ status }) => {
  const statusMap = {
    not_configured: { text: 'Not Configured', color: 'bg-slate-400', textColor: 'text-slate-600' },
    untested: { text: 'Untested', color: 'bg-yellow-400', textColor: 'text-yellow-800' },
    testing: { text: 'Testing...', color: 'bg-blue-400 animate-pulse', textColor: 'text-blue-800' },
    valid: { text: 'Valid & Active', color: 'bg-green-400', textColor: 'text-green-800' },
    invalid: { text: 'Invalid Key', color: 'bg-red-400', textColor: 'text-red-800' },
  };

  const currentStatus = statusMap[status];

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${currentStatus.textColor}`}>
      <span className={`h-2.5 w-2.5 rounded-full ${currentStatus.color}`}></span>
      {currentStatus.text}
    </div>
  );
};

const SettingsScreen: React.FC<SettingsScreenProps> = ({ 
    apiKey, apiKeyStatus, onUpdateApiKey, onTestApiKey, onClearApiKey, onBack 
}) => {
  const [currentKey, setCurrentKey] = useState(apiKey || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    setCurrentKey(apiKey || '');
  }, [apiKey]);

  const handleSave = async () => {
    if (!currentKey) {
        setMessage({text: 'API Key cannot be empty.', type: 'error'});
        return;
    }
    setIsSaving(true);
    setMessage(null);
    const success = await onUpdateApiKey(currentKey);
    setIsSaving(false);
    if(success) {
        setMessage({text: 'API Key saved and verified successfully!', type: 'success'});
    } else {
        setMessage({text: 'The provided API Key is invalid. Please check and try again.', type: 'error'});
    }
  };

  const handleTest = async () => {
     if (!currentKey) {
        setMessage({text: 'Cannot test an empty API Key.', type: 'error'});
        return;
    }
    const success = await onTestApiKey(currentKey);
     if(success) {
        setMessage({text: 'API Key is valid!', type: 'success'});
    } else {
        setMessage({text: 'The provided API Key is invalid.', type: 'error'});
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold text-slate-800">AI Configuration</h2>
        <p className="text-slate-600 mt-2">Manage your Google Gemini API Key.</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            <label htmlFor="apiKeyInput" className="font-bold text-slate-700">Gemini API Key</label>
            <ApiKeyStatusIndicator status={apiKeyStatus} />
        </div>
        
        <input 
          type="password"
          id="apiKeyInput"
          value={currentKey}
          onChange={(e) => setCurrentKey(e.target.value)}
          className="w-full p-3 border-2 border-slate-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
          placeholder="Enter your API Key here"
        />
         {message && (
            <p className={`text-sm font-semibold ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {message.text}
            </p>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-full transition-colors flex items-center justify-center gap-2 disabled:bg-slate-400"
        >
             {isSaving ? (
                <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Saving...
                </>
             ) : (
                <>
                    <CheckCircleIcon /> Save & Verify
                </>
             )}
        </button>
        <button
            onClick={handleTest}
            disabled={!currentKey || apiKeyStatus === 'testing'}
            className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 px-4 rounded-full transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
            Test Key
        </button>
      </div>
       <div className="mt-4">
         <button
            onClick={onClearApiKey}
            className="w-full text-red-600 hover:bg-red-100 font-semibold py-2 px-4 rounded-full transition-colors text-sm"
        >
            Clear Saved Key
        </button>
       </div>


      <div className="mt-auto pt-6 text-center no-print shrink-0">
        <button
          onClick={onBack}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-6 rounded-full font-semibold transition-colors flex items-center justify-center gap-2 mx-auto text-sm"
        >
          <ArrowLeftIcon /> Back to Home
        </button>
      </div>
    </div>
  );
};

export default SettingsScreen;