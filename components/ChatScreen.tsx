import React, { useState, useEffect, useRef } from 'react';
import { SendIcon, MicIcon, UploadIcon, ArrowLeftIcon, InfoIcon, ChatBubbleIcon } from './IconComponents.tsx';
import AIManager from '../services/aiManager.js';
import type { ChatMessage } from '../types.ts';

interface ChatScreenProps {
  onBack: () => void;
  aiManager: AIManager;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ onBack, aiManager }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
        id: '1',
        role: 'ai',
        text: "Hello. I am Anviksha, your Medical Intelligence Assistant. I can analyze symptoms, explain reports, or provide clinical guidance. How can I assist you?",
        timestamp: Date.now()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const Recognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
      if (Recognition) {
          const recognition = new Recognition();
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = 'en-US';
          
          recognition.onstart = () => setIsListening(true);
          recognition.onend = () => setIsListening(false);
          recognition.onresult = (event: any) => {
              const transcript = event.results[0][0].transcript;
              setInputText(prev => prev + (prev ? ' ' : '') + transcript);
          };
          
          recognitionRef.current = recognition;
      }
  }, [Recognition]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setSelectedImage(file);
          setImagePreview(URL.createObjectURL(file));
      }
  };

  const toggleVoiceInput = () => {
      if (!recognitionRef.current) {
          alert("Voice input is not supported in this browser.");
          return;
      }
      
      if (isListening) {
          recognitionRef.current.stop();
      } else {
          recognitionRef.current.start();
      }
  };

  const speakText = (text: string) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
  };

  const handleSend = async () => {
      if ((!inputText.trim() && !selectedImage) || isLoading) return;

      const userMsg: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          text: inputText,
          image: imagePreview || undefined,
          timestamp: Date.now()
      };

      setMessages(prev => [...prev, userMsg]);
      setInputText('');
      setIsLoading(true);
      
      setSelectedImage(null);
      setImagePreview(null);

      try {
          const responseText = await aiManager.sendChatMessage(userMsg.text, selectedImage);
          
          const aiMsg: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'ai',
              text: responseText,
              timestamp: Date.now()
          };
          
          setMessages(prev => [...prev, aiMsg]);
      } catch (error) {
          const errorMsg: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'ai',
              text: "Connection error. Please verify internet status.",
              timestamp: Date.now()
          };
          setMessages(prev => [...prev, errorMsg]);
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="px-4 py-4 bg-indigo-600 text-white rounded-b-[2rem] shadow-md flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-4">
              <button 
                onClick={onBack} 
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors backdrop-blur-sm"
              >
                  <ArrowLeftIcon />
              </button>
              <div>
                  <h1 className="text-lg font-bold tracking-tight">Dr. Anviksha</h1>
                  <p className="text-indigo-200 text-[10px] font-medium uppercase tracking-widest">AI Medical Consultant</p>
              </div>
          </div>
          <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
              <ChatBubbleIcon />
          </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 ${
                      msg.role === 'user' 
                          ? 'bg-indigo-600 text-white rounded-br-none shadow-lg shadow-indigo-200' 
                          : 'bg-white text-slate-800 rounded-bl-none shadow-sm border border-slate-100'
                  }`}>
                      {msg.image && (
                          <img src={msg.image} alt="Uploaded" className="w-full h-48 object-cover rounded-xl mb-3 bg-black/10" />
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      
                      {msg.role === 'ai' && (
                          <div className="mt-2 pt-2 border-t border-slate-100/50 flex justify-end">
                               <button 
                                  onClick={() => speakText(msg.text)}
                                  className="text-[10px] font-bold uppercase tracking-wide text-slate-400 hover:text-indigo-600 flex items-center gap-1"
                               >
                                  <MicIcon /> Read
                               </button>
                          </div>
                      )}
                  </div>
              </div>
          ))}
          
          {isLoading && (
              <div className="flex justify-start">
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 flex gap-1.5 items-center">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                      <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                  </div>
              </div>
          )}
          <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t border-slate-100 p-3 pb-6">
          {imagePreview && (
              <div className="mb-2 inline-flex relative">
                  <img src={imagePreview} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-slate-200" />
                  <button 
                      onClick={() => { setImagePreview(null); setSelectedImage(null); }}
                      className="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                      ×
                  </button>
              </div>
          )}
          
          <div className="flex items-end gap-2 bg-slate-50 p-2 rounded-[1.5rem] border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageSelect} 
                  className="hidden" 
                  accept="image/*"
              />
              <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 flex items-center justify-center transition-colors shrink-0"
              >
                  <UploadIcon />
              </button>
              
              <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type symptoms or upload report..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 placeholder-slate-400 text-sm max-h-32 py-3 resize-none"
                  rows={1}
                  onKeyDown={(e) => {
                      if(e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                      }
                  }}
              />

              {inputText || selectedImage ? (
                  <button 
                      onClick={handleSend}
                      className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md hover:bg-indigo-700 active:scale-95 transition-all shrink-0 mb-0.5"
                  >
                      <div className="ml-0.5"><SendIcon /></div>
                  </button>
              ) : (
                  <button 
                      onClick={toggleVoiceInput}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 mb-0.5 ${
                          isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-900 text-white hover:bg-slate-700'
                      }`}
                  >
                      <MicIcon />
                  </button>
              )}
          </div>
      </div>
    </div>
  );
};

export default ChatScreen;