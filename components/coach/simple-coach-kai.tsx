'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, Loader2, Sparkles, MessageCircle, Brain } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SimpleCoachKaiProps {
  userContext?: {
    name?: string;
    firstName?: string;
    skillLevel?: string;
    playerRating?: number;
  };
}

// Animated avatar component
const AnimatedAvatar = ({ state, size = 'lg' }: { state: 'idle' | 'listening' | 'thinking' | 'responding'; size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32'
  };
  
  const iconSize = size === 'lg' ? 48 : size === 'md' ? 32 : 20;
  
  return (
    <div className={`${sizeClasses[size]} relative`}>
      {/* Outer glow ring */}
      <div className={`absolute inset-0 rounded-full ${
        state === 'listening' ? 'bg-green-500/30 animate-ping' :
        state === 'thinking' ? 'bg-purple-500/30 animate-pulse' :
        state === 'responding' ? 'bg-amber-500/30 animate-pulse' :
        'bg-teal-500/20'
      }`} />
      
      {/* Main avatar circle */}
      <div className={`absolute inset-1 rounded-full flex items-center justify-center ${
        state === 'listening' ? 'bg-gradient-to-br from-green-400 to-emerald-600' :
        state === 'thinking' ? 'bg-gradient-to-br from-purple-400 to-violet-600' :
        state === 'responding' ? 'bg-gradient-to-br from-amber-400 to-orange-500' :
        'bg-gradient-to-br from-teal-400 to-cyan-600'
      } shadow-xl transition-all duration-300`}>
        <span className="text-white font-bold text-2xl">K</span>
      </div>
      
      {/* Status indicator */}
      <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${
        state === 'listening' ? 'bg-green-500' :
        state === 'thinking' ? 'bg-purple-500' :
        state === 'responding' ? 'bg-amber-500' :
        'bg-teal-500'
      }`}>
        {state === 'listening' && <Mic className="w-3 h-3 text-white" />}
        {state === 'thinking' && <Brain className="w-3 h-3 text-white animate-pulse" />}
        {state === 'responding' && <Volume2 className="w-3 h-3 text-white" />}
        {state === 'idle' && <MessageCircle className="w-3 h-3 text-white" />}
      </div>
    </div>
  );
};

export default function SimpleCoachKai({ userContext }: SimpleCoachKaiProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hey ${userContext?.firstName || 'Champion'}! 🏓 I'm Coach Kai, ready to help you level up your pickleball game. What's on your mind today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [avatarState, setAvatarState] = useState<'idle' | 'listening' | 'thinking' | 'responding'>('idle');
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const isProcessingRef = useRef(false);
  const lastMessageRef = useRef('');

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Setup speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript && transcript.trim()) {
            setInput(transcript);
            // Auto-send after voice input
            setTimeout(() => {
              const submitEvent = new Event('submit');
              document.getElementById('chat-form')?.dispatchEvent(submitEvent);
            }, 100);
          }
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          setAvatarState('idle');
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
          setAvatarState('idle');
        };
      }
    }
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError('Speech recognition not supported in this browser');
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setAvatarState('idle');
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      setAvatarState('listening');
      setError(null);
    }
  }, [isListening]);

  const sendMessage = useCallback(async () => {
    const msg = input.trim();
    if (!msg || isLoading || isProcessingRef.current) return;
    
    // Prevent duplicate
    if (msg === lastMessageRef.current) return;
    lastMessageRef.current = msg;
    
    isProcessingRef.current = true;
    setInput('');
    setIsLoading(true);
    setAvatarState('thinking');
    setError(null);
    
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: msg,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    
    try {
      const conversationMsgs = [
        ...messages.slice(-9).map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: msg }
      ];
      
      const res = await fetch('/api/ai-coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationMsgs })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || `API error: ${res.status}`);
      }
      
      if (data.message) {
        setAvatarState('responding');
        
        const assistantMsg: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMsg]);
        
        setTimeout(() => setAvatarState('idle'), 500);
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || 'Something went wrong');
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `🤔 ${err.message || 'Sorry, I had trouble with that. Please try again!'}`,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
      isProcessingRef.current = false;
      lastMessageRef.current = '';
      setAvatarState('idle');
    }
  }, [input, isLoading, messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Quick topic buttons
  const quickTopics = [
    { label: '🎯 Serve Tips', message: 'Can you give me some tips to improve my serve?' },
    { label: '🏓 Dinking', message: 'How can I improve my dinking game?' },
    { label: '⚡ Third Shot', message: 'What\'s the best way to execute a third shot drop?' },
    { label: '🧠 Mental Game', message: 'How can I stay focused during competitive matches?' },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white py-6 px-4 shadow-xl">
        <div className="max-w-4xl mx-auto flex items-center gap-6">
          <AnimatedAvatar state={avatarState} size="md" />
          
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">COACH KAI</h1>
              <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-medium">AI COACH</span>
            </div>
            <p className="text-white/80 text-sm mt-1">
              {avatarState === 'listening' && '🎤 Listening...'}
              {avatarState === 'thinking' && '🧠 Thinking...'}
              {avatarState === 'responding' && '💬 Responding...'}
              {avatarState === 'idle' && 'Ready to help with your pickleball game!'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Chat Container */}
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
          {/* Messages */}
          <div className="h-[400px] overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-700 text-gray-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-700 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Coach Kai is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Topics */}
          <div className="px-4 py-2 border-t border-slate-700 flex gap-2 overflow-x-auto">
            {quickTopics.map((topic) => (
              <button
                key={topic.label}
                onClick={() => {
                  setInput(topic.message);
                  setTimeout(sendMessage, 50);
                }}
                disabled={isLoading}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-gray-200 rounded-full text-xs whitespace-nowrap transition-colors disabled:opacity-50"
              >
                {topic.label}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form id="chat-form" onSubmit={handleSubmit} className="p-4 border-t border-slate-700">
            <div className="flex items-center gap-3">
              {/* Microphone Button */}
              <button
                type="button"
                onClick={toggleListening}
                disabled={isLoading}
                className={`p-3 rounded-full transition-all ${
                  isListening
                    ? 'bg-green-500 text-white animate-pulse'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                } disabled:opacity-50`}
              >
                {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
              
              {/* Text Input */}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                disabled={isLoading}
                className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              />
              
              {/* Send Button */}
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-3 bg-teal-600 hover:bg-teal-500 text-white rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer Note */}
        <p className="text-center text-gray-500 text-xs mt-4">
          💬 Text chat is always free • Voice input available on supported browsers
        </p>
      </div>
    </div>
  );
}
