
import React, { useState, useEffect, useRef } from 'react';
import { SendIcon, MicIcon, UploadIcon, ArrowLeftIcon, InfoIcon, ChatBubbleIcon, MenuIcon, PlusIcon, MessageIcon, TrashIcon, HomeIcon, AlertIcon } from './IconComponents.tsx';
import AIManager from '../services/aiManager.js';
import type { ChatMessage, ChatSession } from '../types.ts';

interface ChatScreenProps {
  onBack: () => void;
  aiManager: AIManager;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ onBack, aiManager }) => {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
      try {
          const saved = window.localStorage.getItem('anviksha_chat_sessions');
          const parsed = saved ? JSON.parse(saved) : [];
          return Array.isArray(parsed) ? parsed : [];
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
  const Recognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
      if (!currentSessionId) {
          if (sessions.length > 0) {
              const recent = sessions[0];
              setCurrentSessionId(recent.id);
              setMessages(Array.isArray(recent.messages) ? recent.messages : []);
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
        text: "I am the Anviksha Genesis Assistant. I can help analyze medical data and provide clinical-grade support.",
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
          setMessages(Array.isArray(session.messages) ? session.messages : []);
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
      const today = new Date().setHours(0,0,0,0);
      const yesterday = new Date(Date.now() - 86400000).setHours(0,0,0,0);
      
      return {
          today: sessions.filter(s => s.timestamp >= today),
          yesterday: sessions.filter(s => s.timestamp < today && s.timestamp >= yesterday),
          older: sessions.filter(s => s.timestamp < yesterday)
      };
  };

  useEffect(() => {
      if (Recognition) {
          const recognition = new Recognition();
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = 'en-US';
          
          recognition.onstart = () => setIsListening(true);
          recognition.onend = () => setIsListening(false);
          recognition.onerror = (event: any) => {
              console.error("Speech recognition error:", event.error);
              setIsListening(false);
              if (event.error === 'not-allowed' || event.error === 'permission-denied') {
                  setPermissionError(true);
              }
          };

          recognition.onresult = (event: any) => {
              const transcript = event.results[0][0].transcript;
              if (transcript) {
                  setInputText(prev => prev + (prev ? ' ' : '') + transcript);
              }
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
      setPermissionError(false);
      if (!recognitionRef.current) {
          alert("Voice input is not supported in this browser.");
          return;
      }
      if (isListening) {
          recognitionRef.current.stop();
      } else {
          try {
              recognitionRef.current.start();
          } catch (e) {
              console.error("Failed to start recognition:", e);
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
                  title: (s.messages && s.messages.length <= 1) ? (inputText.slice(0, 25) || "Image Analysis") : s.title
              };
          }
          return s;
      }));

      setInputText('');
      setIsLoading(true);
      setSelectedImage(null);
      setImagePreview(null);

      try {
          const responseText = await aiManager.sendChatMessage(userMsg.text, selectedImage);
          const aiMsg: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'ai',
              text: responseText || "No response received from Neural Core.",
              timestamp: Date.now()
          };
          
          const finalMessages = [...updatedMessages, aiMsg];
          setMessages(finalMessages);
          setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: finalMessages } : s));

      } catch (error) {
          const errorMsg: ChatMessage = {
              id: (Date.now() + 1).toString(),
              role: 'ai',
              text: "Connection error. Please verify internet status.",
              timestamp: Date.now()
          };
          setMessages(prev => [...updatedMessages, errorMsg]);
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden font-sans">
      
      {isListening && (
        <div className="absolute inset-0 z-[60] bg-gradient-to-br from-blue-900/95 to-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center transition-opacity duration-500 animate-fadeIn">
             <div className="relative mb-10">
                <div className="absolute inset-0 bg-blue-500 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-30"></div>
                <div className="absolute inset-0 bg-blue-400 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-20 delay-300"></div>
                <div className="absolute -inset-4 bg-indigo-500 rounded-full animate-pulse opacity-20 blur-xl"></div>
                
                <button 
                    onClick={toggleVoiceInput}
                    className="relative z-10 w-24 h-24 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-[0_0_40px_rgba(59,130,246,0.5)] border-4 border-blue-400/20 text-4xl"
                >
                    <MicIcon />
                </button>
             </div>
             
             <div className="text-center space-y-3">
                <h3 className="text-white text-2xl font-bold tracking-tight animate-pulse">Listening...</h3>
                <p className="text-blue-200/80 text-sm font-medium px-8">Speak your medical query clearly</p>
             </div>
             
             <div className="absolute bottom-12 w-full flex justify-center">
                 <button 
                    onClick={toggleVoiceInput} 
                    className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full text-white font-bold text-sm transition-all border border-white/10 backdrop-blur-md flex items-center gap-2"
                 >
                     <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                     Stop Recording
                 </button>
             </div>
        </div>
      )}
      
      {permissionError && (
          <div className="absolute inset-0 z-[70] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
             <div className="bg-white rounded-3xl p-8 max-w-xs w-full shadow-2xl transform scale-100 animate-[scaleUp_0.3s_ease-out]">
                 <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                     <MicIcon />
                 </div>
                 <h3 className="text-xl font-black text-slate-900 mb-2">Access Denied</h3>
                 <p className="text-sm text-slate-500 mb-6 leading-relaxed font-medium">
                     Please enable microphone access in your browser settings to use voice features.
                 </p>
                 <button 
                     onClick={() => setPermissionError(false)}
                     className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg"
                 >
                     Understood
                 </button>
             </div>
          </div>
      )}

      {/* Sidebar */}
      <div className={`absolute inset-y-0 left-0 z-50 w-[85%] sm:w-[75%] bg-[#171717] text-gray-100 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4 flex items-center justify-between border-b border-white/10 bg-[#171717]">
              <h2 className="font-bold text-lg text-white tracking-tight">History</h2>
              <div className="flex items-center gap-2">
                  <button onClick={startNewChat} className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-gray-400 hover:text-white" title="New Chat">
                      <PlusIcon />
                  </button>
                  <button onClick={() => setIsSidebarOpen(false)} className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-gray-400 hover:text-white">
                      ✕
                  </button>
              </div>
          </div>

          <div className="p-2 flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto pr-1 space-y-6 mt-2">
                  {Object.entries(groupSessions()).map(([label, group]) => group && group.length > 0 && (
                      <div key={label}>
                          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 px-3">{label}</h3>
                          <div className="space-y-1">
                              {group.map(session => (
                                  <button 
                                      key={session.id}
                                      onClick={() => switchSession(session.id)}
                                      className={`w-full text-left px-3 py-3 mx-1 rounded-lg flex items-center justify-between group transition-all ${currentSessionId === session.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}
                                  >
                                      <span className="text-sm truncate flex-1 pr-2">{session.title}</span>
                                      <div 
                                          onClick={(e) => deleteSession(e, session.id)}
                                          className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-red-400 transition-opacity"
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
          <div className="absolute inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between shrink-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-600"
              >
                  <MenuIcon />
              </button>
          </div>
          <div className="flex flex-col items-center">
               <h1 className="text-base font-bold text-slate-800">Consultation</h1>
               <span className="text-[10px] text-blue-500 font-bold flex items-center gap-1">
                   Genesis Prime
               </span>
          </div>
          <div className="flex items-center gap-2">
              <button 
                 onClick={onBack}
                 className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-600"
                 title="Home"
              >
                 <HomeIcon />
              </button>
              <button 
                 onClick={startNewChat}
                 className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-600"
                 title="New Chat"
              >
                 <PlusIcon />
              </button>
          </div>
      </div>
      
      {/* STRATEGIC DEFENSE: PROTOTYPE WARNING BANNER */}
      <div className="bg-slate-900 px-4 py-2 flex items-center justify-center gap-2 border-b border-slate-800">
        <div className="text-blue-400"><AlertIcon /></div>
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">Anviksha Genesis Intelligence • Clinical Support</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white">
          {Array.isArray(messages) && messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm ${
                      msg.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-br-sm' 
                          : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                  }`}>
                      {msg.image && (
                          <img src={msg.image} alt="Uploaded" className="w-full h-48 object-cover rounded-xl mb-3 border border-black/10" />
                      )}
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
                  </div>
              </div>
          ))}
          
          {isLoading && (
              <div className="flex justify-start">
                  <div className="bg-slate-100 px-5 py-4 rounded-2xl rounded-bl-sm flex gap-2 items-center">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                  </div>
              </div>
          )}
          <div ref={messagesEndRef} />
      </div>

      <div className="bg-white p-3 pb-5 border-t border-slate-100">
          {imagePreview && (
              <div className="mb-3 flex">
                  <div className="relative">
                      <img src={imagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-xl border border-slate-200 shadow-sm" />
                      <button 
                          onClick={() => { setImagePreview(null); setSelectedImage(null); }}
                          className="absolute -top-2 -right-2 bg-slate-800 text-white rounded-full w-6 h-6 flex items-center justify-center border-2 border-white text-xs font-bold"
                      >
                          ✕
                      </button>
                  </div>
              </div>
          )}
          
          <div className="flex items-center gap-2 bg-slate-100 p-2 pr-3 rounded-[1.8rem] shadow-inner">
              <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-10 h-10 rounded-full bg-white text-slate-500 shadow-sm hover:text-blue-600 flex items-center justify-center transition-all shrink-0"
              >
                  <UploadIcon />
              </button>
              <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageSelect} 
                  className="hidden" 
                  accept="image/*"
              />
              
              <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask Genesis Assistant..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 placeholder-slate-500 text-[15px] max-h-24 py-3 px-2 resize-none font-medium"
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
                      className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md hover:bg-blue-700 hover:scale-105 transition-all shrink-0"
                  >
                      <SendIcon />
                  </button>
              ) : (
                  <button 
                      onClick={toggleVoiceInput}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${
                          isListening ? 'bg-red-500 text-white shadow-lg scale-110' : 'bg-slate-800 text-white hover:bg-slate-700'
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
