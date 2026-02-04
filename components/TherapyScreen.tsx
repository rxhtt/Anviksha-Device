import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeftIcon, TherapyIcon, SendIcon, MicIcon, MenuIcon, PlusIcon, MessageIcon, TrashIcon, HomeIcon } from './IconComponents.tsx';
import AIManager from '../services/aiManager.js';
import type { UserProfile, Language } from '../types.ts';

interface TherapyScreenProps {
    onBack: () => void;
    aiManager: AIManager;
    profile: UserProfile;
    language: Language;
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

const TherapyScreen: React.FC<TherapyScreenProps> = ({ onBack, aiManager, profile, language }) => {
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
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

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
        const initialMsg: Message = { id: 'init', text: "Welcome to your reflection space. I'm here to listen. How is your heart feeling today?", sender: 'ai' };

        const newSession: TherapySession = {
            id: newId,
            title: 'Reflection Session',
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
        const today = new Date().setHours(0, 0, 0, 0);
        const yesterday = new Date(Date.now() - 86400000).setHours(0, 0, 0, 0);

        return {
            today: sessions.filter(s => s.timestamp >= today),
            yesterday: sessions.filter(s => s.timestamp < today && s.timestamp >= yesterday),
            older: sessions.filter(s => s.timestamp < yesterday)
        };
    };

    // Voice recognition logic handled by toggleListening

    const toggleListening = async () => {
        if (isListening) {
            setIsListening(false);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                mediaRecorderRef.current.stop();
            }
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                const audioChunks: Blob[] = [];

                mediaRecorder.ondataavailable = (event) => {
                    audioChunks.push(event.data);
                };

                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    setIsLoading(true);
                    try {
                        const transcript = await aiManager.transcribeAudio(audioBlob, language);
                        if (transcript) {
                            setInput(prev => prev + (prev ? ' ' : '') + transcript);
                        }
                    } catch (error) {
                        console.error("Transcription failed", error);
                    } finally {
                        setIsLoading(false);
                    }
                    stream.getTracks().forEach(track => track.stop());
                };

                mediaRecorderRef.current = mediaRecorder;
                mediaRecorder.start();
                setIsListening(true);
            } catch (err) {
                console.error("Error accessing microphone", err);
                setPermissionError(true);
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
            const response = await aiManager.getTherapyResponse(userMsg.text, profile, language);
            const aiMsg: Message = { id: (Date.now() + 1).toString(), text: response, sender: 'ai' };
            const finalMessages = [...updatedMessages, aiMsg];
            setMessages(finalMessages);
            setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: finalMessages } : s));
        } catch (error) {
            const errMsg: Message = { id: 'err', text: "The path is clear, but the link is obscured. Take a deep breath and try again soon.", sender: 'ai' };
            setMessages(prev => [...updatedMessages, errMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const groupedSessions = groupSessions();

    return (
        <div className="flex flex-col h-full bg-[#fdfaf6] relative overflow-hidden page-transition">

            {isListening && (
                <div className="absolute inset-0 z-[60] bg-teal-900/90 backdrop-blur-3xl flex flex-col items-center justify-center animate-fadeIn">
                    <div className="relative mb-12">
                        <div className="absolute inset-[-30px] bg-teal-400 rounded-full blur-[60px] opacity-30 animate-pulse"></div>
                        <button onClick={toggleListening} className="relative z-10 w-28 h-28 bg-teal-500 rounded-full flex items-center justify-center text-white shadow-2xl border-4 border-white/20 text-4xl">
                            <MicIcon />
                        </button>
                    </div>
                    <div className="text-center">
                        <h3 className="text-white text-2xl font-serif italic mb-2 tracking-wide">Listening Gently...</h3>
                        <p className="text-teal-200 text-[10px] font-black uppercase tracking-[0.3em]">Speak your heart</p>
                    </div>
                </div>
            )}

            <div className={`absolute inset-y-0 left-0 z-50 w-[85%] bg-[#1a2f2f] text-teal-50 shadow-2xl transform transition-transform duration-500 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-8 border-b border-white/5">
                    <h2 className="text-xs font-black uppercase tracking-[0.4em] text-teal-600 mb-8">Journaling History</h2>
                    <button onClick={startNewSession} className="w-full py-4 bg-teal-600 rounded-2xl flex items-center justify-center gap-3 text-white text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">
                        <PlusIcon /> New Reflection
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-8 no-scrollbar">
                    {Object.entries(groupedSessions).map(([label, group]) => group.length > 0 && (
                        <div key={label}>
                            <h3 className="text-[9px] font-black text-teal-800 uppercase tracking-widest mb-4 px-4">{label}</h3>
                            <div className="space-y-2">
                                {group.map(session => (
                                    <button key={session.id} onClick={() => switchSession(session.id)} className={`w-full text-left px-4 py-4 rounded-2xl flex items-center justify-between group transition-all ${currentSessionId === session.id ? 'bg-white/10 text-white' : 'text-teal-200/50 hover:bg-white/5 hover:text-white'}`}>
                                        <span className="text-xs font-bold truncate flex-1 pr-2">{session.title}</span>
                                        <div onClick={(e) => deleteSession(e, session.id)} className="opacity-0 group-hover:opacity-100 p-2 hover:text-red-400">
                                            <TrashIcon />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isSidebarOpen && <div className="absolute inset-0 bg-teal-950/60 z-40 backdrop-blur-md" onClick={() => setIsSidebarOpen(false)}></div>}

            <div className="px-6 py-6 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 z-10 shadow-sm relative">
                <button onClick={() => setIsSidebarOpen(true)} className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all border border-slate-100">
                    <MenuIcon />
                </button>
                <div className="text-center">
                    <h1 className="text-xl font-serif font-black text-slate-900 tracking-tight">Reflections</h1>
                    <p className="text-[9px] text-teal-600 font-black uppercase tracking-[0.2em]">Clinical Safe-Space</p>
                </div>
                <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100 hover:bg-teal-100">
                    <HomeIcon />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 no-scrollbar bg-[radial-gradient(circle_at_50%_0%,#fff,#fdfaf6)]">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] px-8 py-6 rounded-[2.5rem] text-[15px] leading-[1.6] shadow-xl ${msg.sender === 'user'
                            ? 'bg-slate-900 text-white rounded-tr-none shadow-slate-200'
                            : 'bg-white text-slate-800 rounded-tl-none border border-slate-100 shadow-slate-200/40 font-serif italic'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white px-10 py-6 rounded-[2.5rem] rounded-tl-none border border-slate-100 flex gap-1 items-center shadow-xl">
                            <span className="w-1.5 h-1.5 bg-teal-300 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-teal-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            <span className="w-1.5 h-1.5 bg-teal-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-6 bg-white border-t border-slate-100">
                <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-[2.5rem] pr-2.5 shadow-inner border border-slate-100 group focus-within:ring-2 ring-teal-500/10">
                    <button onClick={toggleListening} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-slate-400 shadow-md'}`}>
                        <MicIcon />
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Speak through your heart..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 placeholder-slate-400 text-[14px] font-bold"
                    />
                    <button onClick={handleSend} className="w-12 h-12 rounded-full bg-teal-700 text-white flex items-center justify-center shadow-xl shadow-teal-100 hover:scale-105 active:scale-95 transition-all">
                        <SendIcon />
                    </button>
                </div>
                <p className="text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-4">Safe • Secure • Non-Judgmental</p>
            </div>
        </div>
    );
};

export default TherapyScreen;