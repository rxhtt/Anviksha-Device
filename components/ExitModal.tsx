import React, { useState } from 'react';

interface ExitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExitModal: React.FC<ExitModalProps> = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAttemptExit = () => {
    if (password === 'anviksha123') {
      alert('Kiosk mode exited. Device returning to normal operation.');
      setPassword('');
      setError('');
      onClose();
    } else {
      setError('Incorrect password. Please contact an administrator.');
      setPassword('');
    }
  };

  const handleClose = () => {
    setPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="exit-overlay fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="exit-modal bg-white p-8 rounded-2xl text-center max-w-sm w-full shadow-2xl">
        <h3 className="text-2xl font-bold text-slate-800">Emergency Exit</h3>
        <p className="text-slate-600 mt-2 mb-4">Enter admin password to exit kiosk mode:</p>
        
        <input 
          type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="exit-password w-full p-3 mb-2 border-2 border-slate-300 rounded-lg text-center text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
          placeholder="••••••••"
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        
        <div className="nav-buttons grid grid-cols-2 gap-4 mt-4">
          <button className="nav-btn secondary bg-slate-200 hover:bg-slate-300 text-slate-800 py-3 rounded-full font-bold transition-colors" onClick={handleClose}>
            Cancel
          </button>
          <button className="nav-btn primary bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-full font-bold transition-colors" onClick={handleAttemptExit}>
            Exit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitModal;