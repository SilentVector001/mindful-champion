'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Mic, MicOff, MessageCircle, Sparkles, X, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type AvatarState = 'idle' | 'listening' | 'processing' | 'responding';

type UserContext = {
  name?: string;
  firstName?: string;
  skillLevel?: string;
  playerRating?: number;
  primaryGoals?: string[];
  biggestChallenges?: string[];
};

// Animated Avatar Component
function AnimatedAvatar({ state, size = 'lg' }: { state: AvatarState; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-28 h-28'
  };

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      {/* Outer pulse ring for active states */}
      {state !== 'idle' && (
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-400 to-cyan-400"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0, 0.4]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      
      {/* Main avatar circle */}
      <motion.div
        className={`relative w-full h-full rounded-full bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 flex items-center justify-center shadow-2xl overflow-hidden`}
        animate={{
          scale: state === 'listening' ? [1, 1.05, 1] : 1,
        }}
        transition={{ duration: 0.8, repeat: state === 'listening' ? Infinity : 0 }}
      >
        {/* Inner content based on state */}
        <AnimatePresence mode="wait">
          {state === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-white text-4xl font-black"
            >
              K
            </motion.div>
          )}
          
          {state === 'listening' && (
            <motion.div
              key="listening"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center"
            >
              <Mic className="w-8 h-8 text-white" />
              {/* Sound wave bars */}
              <div className="absolute inset-0 flex items-center justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-white/60 rounded-full"
                    animate={{
                      height: [8, 20 + Math.random() * 15, 8],
                    }}
                    transition={{
                      duration: 0.4,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
          
          {state === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-1.5"
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 bg-white rounded-full"
                  animate={{
                    y: [0, -8, 0],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </motion.div>
          )}
          
          {state === 'responding' && (
            <motion.div
              key="responding"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Status indicator dot */}
      <motion.div
        className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white shadow-lg ${
          state === 'idle' ? 'bg-green-500' :
          state === 'listening' ? 'bg-yellow-500' :
          state === 'processing' ? 'bg-purple-500' :
          'bg-cyan-500'
        }`}
        animate={state !== 'idle' ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 1, repeat: state !== 'idle' ? Infinity : 0 }}
      />
    </div>
  );
}

// Push-to-Talk Button
function PushToTalkButton({
  onTranscript,
  disabled,
  isListening,
  setIsListening
}: {
  onTranscript: (text: string) => void;
  disabled: boolean;
  isListening: boolean;
  setIsListening: (v: boolean) => void;
}) {
  const recognitionRef = useRef<any>(null);
  const [transcript, setTranscript] = useState('');

  const startListening = useCallback(() => {
    if (disabled) return;
    
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('Speech recognition is not supported in this browser. Please use Chrome, Safari, or Edge.');
        return;
      }
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart;
          } else {
            interimTranscript += transcriptPart;
          }
        }
        
        setTranscript(finalTranscript || interimTranscript);
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
      setTranscript('');
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
    }
  }, [disabled, setIsListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    
    if (transcript.trim()) {
      onTranscript(transcript.trim());
    }
    setTranscript('');
  }, [transcript, onTranscript, setIsListening]);

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        onMouseDown={startListening}
        onMouseUp={stopListening}
        onMouseLeave={isListening ? stopListening : undefined}
        onTouchStart={startListening}
        onTouchEnd={stopListening}
        disabled={disabled}
        className={`relative w-24 h-24 rounded-full shadow-2xl transition-all ${
          disabled 
            ? 'bg-gray-300 cursor-not-allowed' 
            : isListening 
              ? 'bg-gradient-to-br from-yellow-400 to-orange-500 scale-110' 
              : 'bg-gradient-to-br from-teal-500 to-cyan-500 hover:scale-105 active:scale-95'
        }`}
        whileTap={disabled ? {} : { scale: 1.1 }}
      >
        {/* Pulse rings when listening */}
        {isListening && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full bg-yellow-400"
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-orange-400"
              animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
            />
          </>
        )}
        
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          {isListening ? (
            <Mic className="w-10 h-10 text-white animate-pulse" />
          ) : (
            <Mic className="w-10 h-10 text-white" />
          )}
        </div>
      </motion.button>
      
      <div className="text-center">
        <p className={`text-sm font-semibold ${isListening ? 'text-yellow-600' : 'text-slate-700'}`}>
          {isListening ? '🎤 Listening... (speak anytime)' : 'Hold to Talk'}
        </p>
        {transcript && (
          <motion.p 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-slate-500 mt-1 max-w-[200px] truncate"
          >
            "{transcript}"
          </motion.p>
        )}
      </div>
    </div>
  );
}

interface SimpleCoachKaiProps {
  userContext?: UserContext;
}

export default function SimpleCoachKai({ userContext }: SimpleCoachKaiProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [isListening, setIsListening] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const isProcessingRef = useRef(false);
  const lastMessageRef = useRef('');
  const historyLoadedRef = useRef(false);

  // Generate personalized welcome
  const getWelcome = () => {
    const name = userContext?.firstName || 'Champion';
    return `👋 Hey ${name}! I'm Coach Kai, your AI pickleball coach.\n\nWhat would you like to work on today? I can help with:\n• 🎯 Technique & drills\n• 📊 Performance tips\n• 🧠 Mental game\n• 🏆 Tournament prep\n\nJust type or use the mic! 🏓`;
  };

  // Load history on mount
  useEffect(() => {
    if (historyLoadedRef.current) return;
    
    const loadHistory = async () => {
      try {
        const res = await fetch('/api/ai-coach/conversation-history');
        if (res.ok) {
          const data = await res.json();
          if (data.conversation?.messages?.length > 0) {
            const msgs: Message[] = data.conversation.messages.slice(-10).map((m: any) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              timestamp: new Date(m.createdAt)
            }));
            setMessages(msgs);
          } else {
            setMessages([{
              id: 'welcome',
              role: 'assistant',
              content: getWelcome(),
              timestamp: new Date()
            }]);
          }
        }
      } catch {
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          content: getWelcome(),
          timestamp: new Date()
        }]);
      } finally {
        setIsLoadingHistory(false);
        historyLoadedRef.current = true;
      }
    };
    
    loadHistory();
  }, []);

  // Update avatar state
  useEffect(() => {
    if (isListening) {
      setAvatarState('listening');
    } else if (isLoading) {
      setAvatarState('processing');
    } else {
      setAvatarState('idle');
    }
  }, [isListening, isLoading]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current && messages.length > 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Send message
  const sendMessage = useCallback(async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading || isProcessingRef.current) return;
    
    // Prevent duplicate
    if (msg === lastMessageRef.current) return;
    lastMessageRef.current = msg;
    
    isProcessingRef.current = true;
    setInput('');
    setIsLoading(true);
    
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
      
      if (!res.ok) throw new Error('API error');
      
      const data = await res.json();
      
      if (data.message) {
        // Show "responding" state briefly
        setAvatarState('responding');
        
        const assistantMsg: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMsg]);
        
        // Return to idle after a moment
        setTimeout(() => setAvatarState('idle'), 500);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '🤔 Sorry, I had trouble with that. Please try again!',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
      isProcessingRef.current = false;
      lastMessageRef.current = '';
    }
  }, [input, isLoading, messages]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Only show last 5 messages
  const displayMessages = messages.slice(-5);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-white to-teal-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white py-6 px-4 shadow-xl">
        <div className="max-w-4xl mx-auto flex items-center gap-6">
          <AnimatedAvatar state={avatarState} size="md" />
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">COACH KAI</h1>
              <Badge className="bg-white/20 text-white border-white/30">
                <MessageCircle className="w-3 h-3 mr-1" />
                CHAT
              </Badge>
            </div>
            <p className="text-teal-100 text-sm">Your AI Pickleball Coach • Text Responses</p>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mt-2 ${
              avatarState === 'listening' ? 'bg-yellow-400/90 text-yellow-900' :
              avatarState === 'processing' ? 'bg-purple-400/90 text-purple-900' :
              avatarState === 'responding' ? 'bg-cyan-400/90 text-cyan-900' :
              'bg-white/20 text-white'
            }`}>
              {avatarState === 'listening' ? '👂 Listening...' :
               avatarState === 'processing' ? '🤔 Processing...' :
               avatarState === 'responding' ? '✍️ Responding...' :
               '✓ Ready'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Voice & Input Section */}
        <Card className="shadow-xl border-2 border-teal-200 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-2">
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-white" />
              <span className="text-white font-bold">Ask Coach Kai Anything</span>
            </div>
          </div>
          
          <div className="p-6 bg-white">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Push to Talk */}
              <PushToTalkButton
                onTranscript={sendMessage}
                disabled={isLoading}
                isListening={isListening}
                setIsListening={setIsListening}
              />
              
              {/* Divider */}
              <div className="hidden md:flex flex-col items-center h-24">
                <div className="h-full w-px bg-slate-200" />
                <span className="px-2 py-1 text-slate-400 text-xs">or type</span>
                <div className="h-full w-px bg-slate-200" />
              </div>
              <div className="md:hidden w-full flex items-center gap-2">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-slate-400 text-xs">or type</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
              
              {/* Text Input */}
              <div className="flex gap-3 w-full md:flex-1">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your question for Coach Kai..."
                  disabled={isLoading}
                  className="flex-1 min-h-[70px] resize-none border-2 border-slate-200 focus:border-teal-400 rounded-xl"
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="h-[70px] w-[70px] bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 rounded-xl shadow-lg"
                >
                  {isLoading ? (
                    <Loader2 className="w-7 h-7 animate-spin" />
                  ) : (
                    <Send className="w-7 h-7" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Conversation Display */}
        <Card className="shadow-xl border-2 border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-2 border-b flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-teal-600" />
            <span className="font-bold text-slate-900">Last 5 Conversations</span>
            <Badge variant="secondary" className="text-xs">Latest</Badge>
          </div>
          
          <div ref={scrollRef} className="bg-white p-4 max-h-[400px] overflow-y-auto space-y-3">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-teal-500 mr-2" />
                <span className="text-slate-600">Loading...</span>
              </div>
            ) : displayMessages.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <MessageCircle className="w-16 h-16 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">Start a conversation!</p>
              </div>
            ) : (
              displayMessages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-md ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                      : 'bg-slate-100 text-slate-900 border border-slate-200'
                  }`}>
                    {message.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </div>
                </motion.div>
              ))
            )}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-slate-100 rounded-2xl px-4 py-3 border border-slate-200">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
                    <span className="text-slate-700">Coach Kai is thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Serve Tips', prompt: 'Help me improve my serve technique', emoji: '🎯' },
            { label: 'Footwork', prompt: 'Give me tips for better footwork', emoji: '👟' },
            { label: 'Dinking', prompt: 'How can I improve my dinking game?', emoji: '🏓' },
            { label: 'Mental Game', prompt: 'Help me with mental toughness', emoji: '🧠' },
          ].map((action) => (
            <Button
              key={action.label}
              variant="outline"
              onClick={() => sendMessage(action.prompt)}
              disabled={isLoading}
              className="h-auto py-3 flex flex-col items-center gap-1 border-2 hover:border-teal-300 hover:bg-teal-50"
            >
              <span className="text-2xl">{action.emoji}</span>
              <span className="text-sm font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
