import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeftIcon, TherapyIcon, SendIcon, MicIcon, MenuIcon, PlusIcon, MessageIcon, TrashIcon, HomeIcon } from './IconComponents.tsx';
import AIManager from '../services/aiManager.js';

interface TherapyScreenProps {
    onBack: () => void;
    aiManager: AIManager;
}

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
}

interface TherapySession {
    id: string;
    title: string;
    messages: Message[];
    timestamp: number;
}

const TherapyScreen: React.FC<TherapyScreenProps> = ({ onBack, aiManager }) => {
    const [sessions, setSessions] = useState<TherapySession[]>(() => {
        try {
            const saved = window.localStorage.getItem('anviksha_therapy_sessions');
            return saved ? JSON.parse(saved) : [];
        } catch (e) { return []; }
    });

    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isListening, setIsListening] = useState(false);
    const [permissionError, setPermissionError] = useState(false);
    
    const Recognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (!currentSessionId) {
            if (sessions.length > 0) {
                const recent = sessions[0];
                setCurrentSessionId(recent.id);
                setMessages(recent.messages);
            } else {
                startNewSession();
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('anviksha_therapy_sessions', JSON.stringify(sessions));
    }, [sessions]);

    const startNewSession = () => {
        const newId = Date.now().toString();
        const initialMsg: Message = { id: 'init', text: "Hello. I'm Dr. Anviksha. I'm here to listen without judgment. How are you feeling right now?", sender: 'ai' };
        
        const newSession: TherapySession = {
            id: newId,
            title: 'New Session',
            messages: [initialMsg],
            timestamp: Date.now()
        };

        setSessions(prev => [newSession, ...prev]);
        setCurrentSessionId(newId);
        setMessages([initialMsg]);
        setIsSidebarOpen(false);
    };

    const switchSession = (id: string) => {
        const session = sessions.find(s => s.id === id);
        if (session) {
            setCurrentSessionId(id);
            setMessages(session.messages);
            setIsSidebarOpen(false);
        }
    };

    const deleteSession = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newSessions = sessions.filter(s => s.id !== id);
        setSessions(newSessions);
        if (currentSessionId === id) {
            if (newSessions.length > 0) {
                switchSession(newSessions[0].id);
            } else {
                startNewSession();
            }
        }
    };

    const groupSessions = () => {
        const today = new Date().setHours(0,0,0,0);
        const yesterday = new Date(Date.now() - 86400000).setHours(0,0,0,0);
        
        return {
            today: sessions.filter(s => s.timestamp >= today),
            yesterday: sessions.filter(s => s.timestamp < today && s.timestamp >= yesterday),
            older: sessions.filter(s => s.timestamp < yesterday)
        };
    };

    // Initialize Speech Recognition
    useEffect(() => {
        if (Recognition) {
            const recognition = new Recognition();
            recognition.continuous = false;
            recognition.lang = 'en-US';
            
            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            
            recognition.onerror = (e: any) => {
                console.error("Speech error:", e.error);
                setIsListening(false);
                if (e.error === 'not-allowed' || e.error === 'permission-denied') {
                     setPermissionError(true);
                }
            };
            
            recognition.onresult = (e: any) => {
                const transcript = e.results[0][0].transcript;
                if (transcript) {
                    setInput(prev => prev + (prev ? ' ' : '') + transcript);
                }
            };
            
            recognitionRef.current = recognition;
        }
    }, [Recognition]);

    const toggleListening = () => {
        setPermissionError(false);
        if (!recognitionRef.current) {
            alert("Voice input not supported in this browser.");
            return;
        }
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Error starting speech recognition:", e);
            }
        }
    };

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading || !currentSessionId) return;
        
        const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user' };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        
        setSessions(prev => prev.map(s => {
            if (s.id === currentSessionId) {
                return {
                    ...s,
                    messages: updatedMessages,
                    title: s.messages.length <= 1 ? (input.slice(0, 25) || "Therapy Session") : s.title
                };
            }
            return s;
        }));

        setInput('');
        setIsLoading(true);

        try {
            const response = await aiManager.getTherapyResponse(userMsg.text);
            const aiMsg: Message = { id: (Date.now() + 1).toString(), text: response, sender: 'ai' };
            const finalMessages = [...updatedMessages, aiMsg];
            setMessages(finalMessages);
            setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: finalMessages } : s));
        } catch (error) {
            const errMsg: Message = { id: 'err', text: "I'm having trouble connecting. Please take a deep breath and try again.", sender: 'ai' };
            setMessages(prev => [...updatedMessages, errMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const groupedSessions = groupSessions();

    return (
        <div className="flex flex-col h-full bg-[#f8fafc] relative overflow-hidden font-sans">
             
             {/* Voice Listening Overlay - Enhanced */}
             {isListening && (
                <div className="absolute inset-0 z-[60] bg-gradient-to-b from-teal-900/95 to-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center transition-opacity duration-500 animate-fadeIn">
                    <div className="relative mb-10">
                        <div className="absolute inset-0 bg-teal-500 rounded-full animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-30"></div>
                        <div className="absolute inset-0 bg-teal-400 rounded-full animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-20 delay-500"></div>
                        <div className="absolute -inset-6 bg-teal-300/20 rounded-full blur-xl animate-pulse"></div>
                        
                        <button 
                            onClick={toggleListening}
                            className="relative z-10 w-24 h-24 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white shadow-[0_0_40px_rgba(20,184,166,0.4)] border-4 border-teal-400/30 text-4xl"
                        >
                            <MicIcon />
                        </button>
                    </div>
                    
                    <div className="text-center space-y-2">
                        <h3 className="text-white text-2xl font-serif font-bold tracking-wide animate-pulse">Listening...</h3>
                        <p className="text-teal-200/80 text-sm font-medium tracking-wide">I'm here. Take your time.</p>
                    </div>
                    
                    <div className="absolute bottom-12 w-full flex justify-center">
                        <button 
                            onClick={toggleListening} 
                            className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full text-white font-bold text-sm transition-all border border-white/10 backdrop-blur-md flex items-center gap-2"
                        >
                            <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                            Pause Session
                        </button>
                    </div>
                </div>
            )}
            
            {/* Permission Error Overlay */}
            {permissionError && (
                <div className="absolute inset-0 z-[70] bg-teal-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
                    <div className="bg-white rounded-3xl p-8 max-w-xs w-full shadow-2xl transform scale-100 animate-[scaleUp_0.3s_ease-out]">
                        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                            <MicIcon />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h3>
                        <p className="text-sm text-slate-500 mb-6 leading-relaxed font-medium">
                            Please allow microphone permissions in your browser settings to use voice commands.
                        </p>
                        <button 
                            onClick={() => setPermissionError(false)}
                            className="w-full py-3.5 bg-teal-900 text-white rounded-xl font-bold text-sm hover:bg-teal-800 transition-colors shadow-lg"
                        >
                            Understood
                        </button>
                    </div>
                </div>
            )}

             {/* Sidebar */}
            <div className={`absolute inset-y-0 left-0 z-50 w-[85%] sm:w-[75%] bg-teal-950 text-teal-50 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                
                {/* Sidebar Header */}
                <div className="p-4 flex items-center justify-between border-b border-teal-800/50 bg-teal-950">
                     <h2 className="font-serif text-xl italic tracking-wide text-teal-100">Journal</h2>
                     <div className="flex items-center gap-2">
                         <button onClick={startNewSession} className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-teal-300 hover:text-white" title="New Session">
                             <PlusIcon />
                         </button>
                         <button onClick={() => setIsSidebarOpen(false)} className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-teal-300 hover:text-white">
                             ✕
                         </button>
                     </div>
                </div>

                <div className="p-2 flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto space-y-6 pr-1 mt-2">
                        {Object.entries(groupedSessions).map(([label, group]) => group.length > 0 && (
                            <div key={label}>
                                <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-2 px-3 opacity-80">{label}</h3>
                                <div className="space-y-2">
                                    {group.map(session => (
                                        <button 
                                            key={session.id}
                                            onClick={() => switchSession(session.id)}
                                            className={`w-full text-left px-3 py-3 mx-1 rounded-xl flex items-center justify-between group transition-colors ${currentSessionId === session.id ? 'bg-white/10 text-white' : 'text-teal-200/70 hover:bg-white/5 hover:text-teal-100'}`}
                                        >
                                            <span className="text-sm truncate flex-1 font-medium pr-2">{session.title}</span>
                                            <div 
                                                onClick={(e) => deleteSession(e, session.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-all"
                                            >
                                                <TrashIcon />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {isSidebarOpen && (
                <div className="absolute inset-0 bg-teal-950/40 z-40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
            )}

            <div className="px-5 py-4 bg-white border-b border-slate-100 shrink-0 z-10 flex justify-between items-center shadow-sm">
                <button onClick={() => setIsSidebarOpen(true)} className="w-10 h-10 rounded-full text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors">
                    <MenuIcon />
                </button>
                <div className="text-center">
                    <h1 className="text-lg font-serif font-bold text-teal-900">Mental Wellness</h1>
                    <p className="text-[10px] text-teal-600 font-medium tracking-wider uppercase">Safe Space</p>
                </div>
                <button onClick={onBack} className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 hover:bg-teal-100 flex items-center justify-center transition-colors" title="Back to Home">
                    <HomeIcon />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-[#f8fafc]">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] px-6 py-4 rounded-3xl text-[15px] leading-relaxed shadow-sm ${
                            msg.sender === 'user' 
                                ? 'bg-teal-700 text-white rounded-tr-none shadow-teal-200' 
                                : 'bg-white text-slate-600 rounded-tl-none border border-slate-100'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white px-6 py-5 rounded-3xl rounded-tl-none border border-slate-100 flex gap-2 items-center shadow-sm">
                            <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
                            <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse delay-75"></span>
                            <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse delay-150"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-slate-100">
                <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-[2rem] pr-2 shadow-inner border border-slate-100">
                    <button 
                         onClick={toggleListening}
                         className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white shadow-lg scale-110' : 'bg-white text-slate-500 shadow-sm hover:bg-slate-200'}`}
                    >
                        <MicIcon />
                    </button>
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Share your thoughts..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 placeholder-slate-400 text-[15px] font-medium"
                    />
                    <button 
                        onClick={handleSend}
                        className="w-10 h-10 rounded-full bg-teal-700 text-white flex items-center justify-center shadow-md hover:bg-teal-800 hover:scale-105 transition-all"
                    >
                        <SendIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TherapyScreen;