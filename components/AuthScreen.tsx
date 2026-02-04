
import React, { useState } from 'react';
import { AnvikshaLogo } from './IconComponents.tsx';

interface AuthScreenProps {
  onLogin: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Mock Authentication Delay
    setTimeout(() => {
        setIsLoading(false);
        if (email.trim().length > 3 && password.trim().length > 3) {
            onLogin();
        } else {
            setError('Invalid credentials. Use demo/demo.');
        }
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 border border-slate-100 animate-scaleUp">
        
        <div className="flex justify-center mb-6">
            <div className="w-20 h-20 relative">
                <AnvikshaLogo className="w-full h-full" />
            </div>
        </div>

        <h1 className="text-2xl font-black text-center text-slate-900 mb-1">Authorized Access</h1>
        <p className="text-center text-slate-500 text-xs font-bold uppercase tracking-widest mb-8">Medical Staff Portal</p>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">Secure ID</label>
                <input 
                    type="text" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Doctor ID / Email"
                />
            </div>
            
            <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">Password</label>
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="••••••••"
                />
            </div>

            {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}

            <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center"
            >
                {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                    "Authenticate"
                )}
            </button>
        </form>

        <div className="mt-6 text-center">
             <p className="text-[10px] text-slate-400">
                 Authorized Personnel Only.<br/>Unauthorized access is a punishable offense.
             </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
