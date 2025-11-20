import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeftIcon, TherapyIcon, SendIcon, MicIcon } from './IconComponents.tsx';
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

const TherapyScreen: React.FC<TherapyScreenProps> = ({ onBack, aiManager }) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: 'init', text: "Hello. I'm Dr. Anviksha. I'm here to listen without judgment. How are you feeling right now?", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isListening, setIsListening] = useState(false);
    
    const Recognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (Recognition) {
            const recognition = new Recognition();
            recognition.continuous = false;
            recognition.lang = 'en-US';
            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onresult = (e: any) => setInput(prev => prev + ' ' + e.results[0][0].transcript);
            recognitionRef.current = recognition;
        }
    }, [Recognition]);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        
        const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await aiManager.getTherapyResponse(userMsg.text);
            const aiMsg: Message = { id: (Date.now() + 1).toString(), text: response, sender: 'ai' };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            setMessages(prev => [...prev, { id: 'err', text: "I'm having trouble connecting. Please take a deep breath and try again.", sender: 'ai' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#f4f7f6]">
            <div className="px-6 py-6 bg-teal-50 rounded-b-[3rem] shadow-sm shrink-0 z-10 flex justify-between items-center">
                <button onClick={onBack} className="w-10 h-10 rounded-full bg-white text-teal-700 shadow-sm flex items-center justify-center hover:bg-teal-100 transition-colors">
                    <ArrowLeftIcon />
                </button>
                <div className="text-center">
                    <h1 className="text-xl font-serif font-bold text-teal-900">Mental Wellness</h1>
                    <p className="text-xs text-teal-600 font-medium">Private & Secure Therapy</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center">
                    <TherapyIcon />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-5 rounded-3xl text-sm leading-relaxed shadow-sm ${
                            msg.sender === 'user' 
                                ? 'bg-teal-700 text-white rounded-tr-none' 
                                : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white px-5 py-4 rounded-3xl rounded-tl-none border border-slate-100 flex gap-2 items-center">
                            <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
                            <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse delay-75"></span>
                            <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse delay-150"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white/80 backdrop-blur-md border-t border-slate-100">
                <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-full pr-2">
                    <button 
                         onClick={() => recognitionRef.current?.start()}
                         className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white' : 'bg-white text-slate-500 shadow-sm hover:bg-slate-200'}`}
                    >
                        <MicIcon />
                    </button>
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Share your thoughts..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 placeholder-slate-400 text-sm"
                    />
                    <button 
                        onClick={handleSend}
                        className="w-10 h-10 rounded-full bg-teal-700 text-white flex items-center justify-center shadow-md hover:bg-teal-800 transition-all"
                    >
                        <div className="ml-0.5"><SendIcon /></div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TherapyScreen;