import React, { useState, useEffect, useRef } from 'react';
import { SendIcon, MicIcon, UploadIcon, ArrowLeftIcon, InfoIcon, ChatBubbleIcon, MenuIcon, PlusIcon, MessageIcon, TrashIcon, HomeIcon } from './IconComponents.tsx';
import AIManager from '../services/aiManager.js';
import type { ChatMessage, ChatSession, UserProfile, Language } from '../types.ts';

interface ChatScreenProps {
    onBack: () => void;
    aiManager: AIManager;
    profile: UserProfile;
    language: Language;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ onBack, aiManager, profile, language }) => {
    const [sessions, setSessions] = useState<ChatSession[]>(() => {
        try {
            const saved = window.localStorage.getItem('anviksha_chat_sessions');
            return saved ? JSON.parse(saved) : [];
        } catch (e) { return []; }
    });

    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isListening, setIsListening] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [permissionError, setPermissionError] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    useEffect(() => {
        if (!currentSessionId) {
            if (sessions.length > 0) {
                const recent = sessions[0];
                setCurrentSessionId(recent.id);
                setMessages(recent.messages);
            } else {
                startNewChat();
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('anviksha_chat_sessions', JSON.stringify(sessions));
    }, [sessions]);

    const startNewChat = () => {
        const newId = Date.now().toString();
        const initialMsg: ChatMessage = {
            id: 'init',
            role: 'ai',
            text: "Hello. I am Dr. Anviksha. I have loaded your medical clinical profile. How can I assist you today?",
            timestamp: Date.now()
        };

        const newSession: ChatSession = {
            id: newId,
            title: 'New Consultation',
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
                startNewChat();
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

    // Voice recognition logic handled by toggleVoiceInput

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(() => { scrollToBottom(); }, [messages]);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const toggleVoiceInput = async () => {
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
                            setInputText(prev => prev + (prev ? ' ' : '') + transcript);
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

    const handleSend = async () => {
        if ((!inputText.trim() && !selectedImage) || isLoading || !currentSessionId) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: inputText,
            image: imagePreview || undefined,
            timestamp: Date.now()
        };

        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);

        setSessions(prev => prev.map(s => {
            if (s.id === currentSessionId) {
                return {
                    ...s,
                    messages: updatedMessages,
                    title: s.messages.length <= 1 ? (inputText.slice(0, 25) || "Image Analysis") : s.title
                };
            }
            return s;
        }));

        setInputText('');
        setIsLoading(true);
        setSelectedImage(null);
        setImagePreview(null);

        try {
            const responseText = await aiManager.sendChatMessage(userMsg.text, selectedImage, profile, language);
            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                text: responseText,
                timestamp: Date.now()
            };

            const finalMessages = [...updatedMessages, aiMsg];
            setMessages(finalMessages);
            setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: finalMessages } : s));
        } catch (error) {
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                text: "Diagnostic link interrupted. Re-establishing secure connection...",
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const groupedSessions = groupSessions();

    return (
        <div className="flex flex-col h-full bg-[#f8fafc] relative overflow-hidden page-transition">

            {/* Immersive Voice Overlay */}
            {isListening && (
                <div className="absolute inset-0 z-[60] bg-slate-900/95 backdrop-blur-2xl flex flex-col items-center justify-center animate-fadeIn">
                    <div className="relative mb-16">
                        <div className="absolute inset-[-40px] bg-blue-500 rounded-full blur-[80px] opacity-20 animate-pulse"></div>
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            <div className="absolute inset-0 border-2 border-blue-400/30 rounded-full animate-ping"></div>
                            <div className="absolute inset-2 border border-blue-400/20 rounded-full animate-[ping_2s_linear_infinite_0.5s]"></div>
                            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-4xl text-white shadow-[0_0_50px_rgba(59,130,246,0.5)]">
                                <MicIcon />
                            </div>
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-white text-2xl font-black tracking-widest uppercase mb-2">Neural Link Active</h3>
                        <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">Processing Voice Input...</p>
                    </div>
                    <button onClick={toggleVoiceInput} className="absolute bottom-20 px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
                        Terminate Link
                    </button>
                </div>
            )}

            {/* Sidebar Redesign */}
            <div className={`absolute inset-y-0 left-0 z-50 w-[85%] bg-slate-900 text-slate-100 shadow-2xl transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-8 border-b border-white/10">
                    <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500 mb-6">Consultation Archive</h2>
                    <button onClick={startNewChat} className="w-full py-4 bg-blue-600 rounded-2xl flex items-center justify-center gap-3 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 active:scale-95 transition-all">
                        <PlusIcon /> New Consultation
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-8 no-scrollbar">
                    {Object.entries(groupedSessions).map(([label, group]) => group.length > 0 && (
                        <div key={label}>
                            <h3 className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-4 px-4">{label}</h3>
                            <div className="space-y-2">
                                {group.map(session => (
                                    <button
                                        key={session.id}
                                        onClick={() => switchSession(session.id)}
                                        className={`w-full text-left px-4 py-4 rounded-2xl flex items-center justify-between group transition-all ${currentSessionId === session.id ? 'bg-white/10 text-white border border-white/5' : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'}`}
                                    >
                                        <span className="text-xs font-bold truncate flex-1 pr-2">{session.title}</span>
                                        <div onClick={(e) => deleteSession(e, session.id)} className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg">
                                            <TrashIcon />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isSidebarOpen && <div className="absolute inset-0 bg-slate-900/60 z-40 backdrop-blur-md" onClick={() => setIsSidebarOpen(false)}></div>}

            {/* Header Upgrade */}
            <div className="px-6 py-5 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 z-20">
                <button onClick={() => setIsSidebarOpen(true)} className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all border border-slate-100">
                    <MenuIcon />
                </button>
                <div className="text-center">
                    <h1 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Anviksha Core</h1>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                        <span className="text-sm font-black text-slate-900 tracking-tight">AI Clinical Desk</span>
                    </div>
                </div>
                <button onClick={onBack} className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all border border-slate-100">
                    <HomeIcon />
                </button>
            </div>

            {/* Messages Area Upgrade */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 bg-[#f8fafc] no-scrollbar">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] sm:max-w-[70%] rounded-[2rem] p-6 shadow-xl ${msg.role === 'user'
                            ? 'bg-slate-900 text-white rounded-tr-sm shadow-slate-200'
                            : 'bg-white text-slate-800 rounded-tl-sm border border-slate-100 shadow-slate-200/50'
                            }`}>
                            {msg.image && (
                                <div className="relative mb-4 group cursor-pointer overflow-hidden rounded-2xl border-2 border-white/10">
                                    <img src={msg.image} alt="Uploaded" className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700" />
                                </div>
                            )}
                            <p className="text-[14px] leading-relaxed whitespace-pre-wrap font-bold tracking-tight">{msg.text}</p>
                            <div className={`mt-3 text-[9px] font-black uppercase tracking-widest ${msg.role === 'user' ? 'text-white/40' : 'text-slate-400'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white px-8 py-6 rounded-[2rem] rounded-tl-sm border border-slate-100 flex gap-2 items-center shadow-xl shadow-slate-200/50">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area Upgrade */}
            <div className="p-6 bg-white border-t border-slate-100">
                {imagePreview && (
                    <div className="mb-4 animate-scaleUp">
                        <div className="relative inline-block group">
                            <img src={imagePreview} alt="Preview" className="h-24 w-24 object-cover rounded-[1.5rem] border-4 border-slate-50 shadow-lg" />
                            <button onClick={() => { setImagePreview(null); setSelectedImage(null); }} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center border-4 border-white text-xs font-black shadow-lg">✕</button>
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-3 bg-slate-50 p-2 pr-2.5 rounded-[2.5rem] border border-slate-100 shadow-inner group focus-within:ring-2 ring-blue-500/10 transition-all">
                    <button onClick={() => fileInputRef.current?.click()} className="w-12 h-12 rounded-full bg-white text-slate-400 shadow-md hover:text-blue-600 flex items-center justify-center active:scale-90 transition-all">
                        <UploadIcon />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImageSelect} className="hidden" accept="image/*" />

                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Inquire with Clinical AI..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 placeholder-slate-400 text-[14px] font-bold max-h-32 py-4 px-2 resize-none no-scrollbar"
                        rows={1}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    />

                    {inputText || selectedImage ? (
                        <button onClick={handleSend} className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-200 active:scale-95 transition-all">
                            <SendIcon />
                        </button>
                    ) : (
                        <button onClick={toggleVoiceInput} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-900 text-white active:scale-90'}`}>
                            <MicIcon />
                        </button>
                    )}
                </div>
                <p className="text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-4">Encrypted Clinical Neural Link</p>
            </div>
        </div>
    );
};

export default ChatScreen;