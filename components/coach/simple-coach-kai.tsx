'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Mic, MicOff, MessageCircle, Sparkles, Volume2, VolumeX, Brain, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ActionCardsList } from './action-cards';
import { ActionCard } from '@/lib/coach-kai/types';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actionCards?: ActionCard[];
  emotion?: string;
};

type AvatarState = 'idle' | 'listening' | 'processing' | 'responding' | 'speaking';

type UserContext = {
  name?: string;
  firstName?: string;
  skillLevel?: string;
  playerRating?: number;
  primaryGoals?: string[];
  biggestChallenges?: string[];
};

// TTS Hook - Cross-platform Web Speech API
function useTTS() {
  const [isTTSEnabled, setIsTTSEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Load TTS preference from localStorage
    const saved = localStorage.getItem('coachKai_tts');
    if (saved === 'true') setIsTTSEnabled(true);
  }, []);

  const toggleTTS = useCallback(() => {
    const newValue = !isTTSEnabled;
    setIsTTSEnabled(newValue);
    localStorage.setItem('coachKai_tts', String(newValue));
    if (!newValue) stopSpeaking();
  }, [isTTSEnabled]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!isTTSEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Clean text for speech (remove markdown, emojis)
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s/g, '')
      .replace(/[🎯👟🧠♟️💪✅👋🏓🤔✓👂✍️]/g, '')
      .replace(/\[.*?\]/g, '')
      .trim();
    
    if (!cleanText) return;
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    // Try to find a natural voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => 
      v.name.includes('Samantha') || // iOS/Mac
      v.name.includes('Google') || // Chrome
      v.name.includes('Microsoft') || // Windows
      v.lang.startsWith('en')
    ) || voices[0];
    
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isTTSEnabled]);

  return { isTTSEnabled, isSpeaking, toggleTTS, speak, stopSpeaking };
}

// Format message timestamp
function formatMessageTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

// Animated Avatar Component - Dark Theme
function AnimatedAvatar({ state, size = 'lg' }: { state: AvatarState; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-28 h-28'
  };

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      {state !== 'idle' && (
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400"
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      
      <motion.div
        className="relative w-full h-full rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30 overflow-hidden"
        animate={{ scale: state === 'listening' ? [1, 1.05, 1] : 1 }}
        transition={{ duration: 0.8, repeat: state === 'listening' ? Infinity : 0 }}
      >
        <AnimatePresence mode="wait">
          {state === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-white text-4xl font-black">
              K
            </motion.div>
          )}
          {state === 'listening' && (
            <motion.div key="listening" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center">
              <Mic className="w-8 h-8 text-white" />
              <div className="absolute inset-0 flex items-center justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <motion.div key={i} className="w-1 bg-white/60 rounded-full"
                    animate={{ height: [8, 20 + Math.random() * 15, 8] }}
                    transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
          {state === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-1.5">
              {[...Array(3)].map((_, i) => (
                <motion.div key={i} className="w-3 h-3 bg-white rounded-full"
                  animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </motion.div>
          )}
          {state === 'responding' && (
            <motion.div key="responding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      <motion.div
        className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-slate-900 shadow-lg ${
          state === 'idle' ? 'bg-emerald-500' :
          state === 'listening' ? 'bg-amber-500' :
          state === 'processing' ? 'bg-purple-500' : 'bg-cyan-500'
        }`}
        animate={state !== 'idle' ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 1, repeat: state !== 'idle' ? Infinity : 0 }}
      />
    </div>
  );
}

// Push-to-Talk Button - Dark Theme
function PushToTalkButton({ onTranscript, disabled, isListening, setIsListening }: {
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
        alert('Speech recognition is not supported in this browser.');
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onresult = (event: any) => {
        let finalTranscript = '', interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const part = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalTranscript += part;
          else interimTranscript += part;
        }
        setTranscript(finalTranscript || interimTranscript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
      setTranscript('');
    } catch (error) {
      console.error('Speech recognition failed:', error);
    }
  }, [disabled, setIsListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    if (transcript.trim()) onTranscript(transcript.trim());
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
          disabled ? 'bg-slate-700 cursor-not-allowed' 
            : isListening ? 'bg-gradient-to-br from-amber-500 to-orange-500 scale-110 shadow-amber-500/50' 
            : 'bg-gradient-to-br from-emerald-500 to-teal-500 hover:scale-105 active:scale-95 shadow-emerald-500/30'
        }`}
        whileTap={disabled ? {} : { scale: 1.1 }}
      >
        {isListening && (
          <>
            <motion.div className="absolute inset-0 rounded-full bg-amber-400" animate={{ scale: [1, 1.5], opacity: [0.5, 0] }} transition={{ duration: 1, repeat: Infinity }} />
            <motion.div className="absolute inset-0 rounded-full bg-orange-400" animate={{ scale: [1, 1.3], opacity: [0.5, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0.3 }} />
          </>
        )}
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          <Mic className={`w-10 h-10 text-white ${isListening ? 'animate-pulse' : ''}`} />
        </div>
      </motion.button>
      <div className="text-center">
        <p className={`text-sm font-semibold ${isListening ? 'text-amber-400' : 'text-slate-300'}`}>
          {isListening ? '🎤 Listening...' : 'Hold to Talk'}
        </p>
        {transcript && (
          <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-slate-400 mt-1 max-w-[200px] truncate">
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
  const [streamingContent, setStreamingContent] = useState('');
  
  const { isTTSEnabled, isSpeaking, toggleTTS, speak, stopSpeaking } = useTTS();
  
  const isProcessingRef = useRef(false);
  const lastMessageRef = useRef('');
  const historyLoadedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getWelcome = () => {
    const name = userContext?.firstName || 'Champion';
    return `Hey ${name}! 👋 I'm Coach Kai, your AI pickleball coach.\n\nI'm here to help with **technique**, **mental game**, **drills**, and anything else. Tell me what's on your mind - whether you crushed it today or need help working through a challenge.\n\nWhat would you like to work on? 🏓`;
  };

  // Load history
  useEffect(() => {
    if (historyLoadedRef.current) return;
    const loadHistory = async () => {
      try {
        const res = await fetch('/api/ai-coach/conversation-history');
        if (res.ok) {
          const data = await res.json();
          if (data.conversation?.messages?.length > 0) {
            const msgs: Message[] = data.conversation.messages.slice(-10).map((m: any) => ({
              id: m.id, role: m.role, content: m.content, timestamp: new Date(m.createdAt)
            }));
            setMessages(msgs);
          } else {
            setMessages([{ id: 'welcome', role: 'assistant', content: getWelcome(), timestamp: new Date() }]);
          }
        }
      } catch {
        setMessages([{ id: 'welcome', role: 'assistant', content: getWelcome(), timestamp: new Date() }]);
      } finally {
        setIsLoadingHistory(false);
        historyLoadedRef.current = true;
      }
    };
    loadHistory();
  }, []);

  useEffect(() => {
    if (isSpeaking) setAvatarState('speaking');
    else if (isListening) setAvatarState('listening');
    else if (isLoading) setAvatarState('processing');
    else setAvatarState('idle');
  }, [isListening, isLoading, isSpeaking]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  // Send message with streaming
  const sendMessage = useCallback(async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading || isProcessingRef.current) return;
    if (msg === lastMessageRef.current) return;
    
    lastMessageRef.current = msg;
    isProcessingRef.current = true;
    setInput('');
    setIsLoading(true);
    setStreamingContent('');
    
    const userMsg: Message = { id: `user-${Date.now()}`, role: 'user', content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    
    try {
      const conversationMsgs = [
        ...messages.slice(-9).map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: msg }
      ];
      
      const res = await fetch('/api/coach-kai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationMsgs })
      });
      
      if (!res.ok) throw new Error('API error');
      
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let actionCards: ActionCard[] = [];
      let emotion = '';
      
      setAvatarState('responding');
      
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'text') {
                  fullContent += data.content;
                  setStreamingContent(fullContent);
                } else if (data.type === 'actions') {
                  actionCards = data.cards || [];
                } else if (data.type === 'complete') {
                  emotion = data.emotion || '';
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }
      
      // Add final message with action cards
      const finalContent = fullContent || 'I\'m here to help! What would you like to work on?';
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: finalContent,
        timestamp: new Date(),
        actionCards,
        emotion
      };
      
      setMessages(prev => [...prev, assistantMsg]);
      setStreamingContent('');
      
      // Auto-speak response if TTS is enabled
      speak(finalContent);
      
      setTimeout(() => setAvatarState('idle'), 500);
      
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

  const handleActionComplete = (card: ActionCard) => {
    // Add a follow-up message when goal is created
    if (card.action === 'create-goal') {
      setMessages(prev => [...prev, {
        id: `system-${Date.now()}`,
        role: 'assistant',
        content: `✅ **Goal Set!** I've added "${card.data?.goalText}" to your goals. I'll check in on your progress. Let's crush it! 💪`,
        timestamp: new Date()
      }]);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Header - Dark Theme with TTS Toggle */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-cyan-950 border-b border-emerald-500/20 text-white py-4 md:py-6 px-3 md:px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3 md:gap-6">
          {/* Avatar - smaller on mobile */}
          <div className="hidden sm:block">
            <AnimatedAvatar state={avatarState} size="md" />
          </div>
          <div className="sm:hidden">
            <AnimatedAvatar state={avatarState} size="sm" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 md:gap-3 mb-1 flex-wrap">
              <h1 className="text-xl md:text-3xl font-black tracking-tight">COACH KAI</h1>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs hidden sm:inline-flex">
                <Brain className="w-3 h-3 mr-1" /> AI COACH
              </Badge>
              <Badge variant="outline" className="text-amber-400 border-amber-500/30 text-xs">
                BETA
              </Badge>
            </div>
            <p className="text-emerald-200/70 text-xs md:text-sm hidden sm:block">Your AI Pickleball Coach • Emotionally Intelligent • Action-Focused</p>
            <div className={`inline-flex items-center gap-1.5 px-2 md:px-3 py-1 rounded-full text-xs font-medium mt-1 md:mt-2 ${
              avatarState === 'speaking' ? 'bg-cyan-500/20 text-cyan-300' :
              avatarState === 'listening' ? 'bg-amber-500/20 text-amber-300' :
              avatarState === 'processing' ? 'bg-purple-500/20 text-purple-300' :
              avatarState === 'responding' ? 'bg-cyan-500/20 text-cyan-300' :
              'bg-emerald-500/20 text-emerald-300'
            }`}>
              {avatarState === 'speaking' ? '🔊 Speaking...' :
               avatarState === 'listening' ? '👂 Listening...' :
               avatarState === 'processing' ? '🤔 Thinking...' :
               avatarState === 'responding' ? '✍️ Responding...' :
               '✓ Ready'}
            </div>
          </div>
          
          {/* TTS Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={isSpeaking ? stopSpeaking : toggleTTS}
            className={`shrink-0 h-10 w-10 md:h-auto md:w-auto md:px-3 rounded-full md:rounded-lg ${
              isTTSEnabled 
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/30' 
                : 'bg-slate-800/50 border-slate-600 text-slate-400 hover:text-white hover:border-slate-500'
            }`}
            title={isTTSEnabled ? 'Turn off voice' : 'Turn on voice'}
          >
            {isSpeaking ? (
              <VolumeX className="w-5 h-5" />
            ) : isTTSEnabled ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
            <span className="hidden md:inline ml-2">{isSpeaking ? 'Stop' : isTTSEnabled ? 'Voice On' : 'Voice Off'}</span>
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 md:px-4 py-4 md:py-6 space-y-4 md:space-y-6">
        {/* Voice & Input Section - Dark Theme - Mobile Optimized */}
        <Card className="shadow-xl border border-emerald-500/20 bg-slate-900/80 backdrop-blur overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-900/50 to-teal-900/50 px-3 md:px-4 py-2 border-b border-emerald-500/20">
            <div className="flex items-center gap-2">
              <Mic className="w-4 md:w-5 h-4 md:h-5 text-emerald-400" />
              <span className="text-white font-bold text-sm md:text-base">Talk to Coach Kai</span>
            </div>
          </div>
          
          <div className="p-3 md:p-6">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
              {/* PTT Button - Compact on mobile */}
              <div className="w-full md:w-auto flex justify-center">
                <PushToTalkButton onTranscript={sendMessage} disabled={isLoading} isListening={isListening} setIsListening={setIsListening} />
              </div>
              
              {/* Divider */}
              <div className="hidden md:flex flex-col items-center h-24">
                <div className="h-full w-px bg-slate-700" />
                <span className="px-2 py-1 text-slate-500 text-xs">or type</span>
                <div className="h-full w-px bg-slate-700" />
              </div>
              <div className="md:hidden w-full flex items-center gap-2">
                <div className="flex-1 h-px bg-slate-700" />
                <span className="text-slate-500 text-xs">or type</span>
                <div className="flex-1 h-px bg-slate-700" />
              </div>
              
              {/* Text Input */}
              <div className="flex gap-2 md:gap-3 w-full md:flex-1">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="What's on your mind?"
                  disabled={isLoading}
                  className="flex-1 min-h-[50px] md:min-h-[70px] resize-none bg-slate-800 border-slate-700 focus:border-emerald-500 text-white placeholder:text-slate-500 rounded-xl text-sm md:text-base"
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="h-[50px] w-[50px] md:h-[70px] md:w-[70px] bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  {isLoading ? <Loader2 className="w-5 md:w-7 h-5 md:h-7 animate-spin" /> : <Send className="w-5 md:w-7 h-5 md:h-7" />}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Conversation Display - Dark Theme - Mobile Optimized */}
        <Card className="shadow-xl border border-slate-700/50 bg-slate-900/80 backdrop-blur overflow-hidden">
          <div className="bg-slate-800/50 px-3 md:px-4 py-2 border-b border-slate-700/50 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white text-sm md:text-base">Conversation</span>
          </div>
          
          <div className="p-3 md:p-4 space-y-3 md:space-y-4 max-h-[400px] md:max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-8 md:py-12">
                <Loader2 className="w-6 md:w-8 h-6 md:h-8 animate-spin text-emerald-500 mr-2" />
                <span className="text-slate-400 text-sm">Loading...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 md:py-12 text-slate-500">
                <MessageCircle className="w-12 md:w-16 h-12 md:h-16 mx-auto mb-3 opacity-30" />
                <p className="font-semibold text-sm">Start a conversation!</p>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`max-w-[90%] md:max-w-[85%] rounded-2xl px-3 md:px-4 py-2 md:py-3 shadow-lg ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                        : 'bg-slate-800 text-slate-100 border border-slate-700'
                    }`}>
                      {message.role === 'assistant' ? (
                        <div className="prose prose-sm prose-invert max-w-none text-sm md:text-base">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm md:text-base">{message.content}</p>
                      )}
                    </div>
                    
                    {/* Action Cards */}
                    {message.role === 'assistant' && message.actionCards && message.actionCards.length > 0 && (
                      <div className="w-full max-w-[90%] md:max-w-[85%] mt-2">
                        <ActionCardsList cards={message.actionCards} onAction={handleActionComplete} />
                      </div>
                    )}
                    
                    <span className={`text-xs text-slate-500 mt-1 px-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {formatMessageTime(message.timestamp)}
                    </span>
                  </motion.div>
                ))}
                
                {/* Streaming content */}
                {streamingContent && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-start">
                    <div className="max-w-[90%] md:max-w-[85%] rounded-2xl px-3 md:px-4 py-2 md:py-3 shadow-lg bg-slate-800 text-slate-100 border border-slate-700">
                      <div className="prose prose-sm prose-invert max-w-none text-sm md:text-base">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingContent}</ReactMarkdown>
                      </div>
                      <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 animate-pulse" />
                    </div>
                  </motion.div>
                )}
                
                {isLoading && !streamingContent && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-slate-800 rounded-2xl px-3 md:px-4 py-2 md:py-3 border border-slate-700">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                        <span className="text-slate-300 text-sm">Coach Kai is thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </Card>

        {/* Quick Actions - Dark Theme - Mobile Optimized */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {[
            { label: 'Serve Help', prompt: 'Help me improve my serve technique', emoji: '🎯' },
            { label: 'Footwork', prompt: 'Give me footwork drills and tips', emoji: '👟' },
            { label: 'Mental Game', prompt: "I get nervous in big points. Help me with mental toughness.", emoji: '🧠' },
            { label: 'Strategy', prompt: 'What strategies should I use in doubles?', emoji: '♟️' },
          ].map((action) => (
            <Button
              key={action.label}
              variant="outline"
              onClick={() => sendMessage(action.prompt)}
              disabled={isLoading}
              className="h-auto py-2 md:py-3 flex flex-col items-center gap-0.5 md:gap-1 bg-slate-800/50 border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-950/30 text-slate-300 hover:text-white"
            >
              <span className="text-xl md:text-2xl">{action.emoji}</span>
              <span className="text-xs md:text-sm font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
