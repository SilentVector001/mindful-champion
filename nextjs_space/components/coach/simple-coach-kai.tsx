// @ts-nocheck
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Mic, MicOff, MessageCircle, Sparkles, Brain, Settings, Bell, Phone, Heart, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
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

type AvatarState = 'idle' | 'listening' | 'processing' | 'responding';

type UserContext = {
  name?: string;
  firstName?: string;
  skillLevel?: string;
  playerRating?: number;
  primaryGoals?: string[];
  biggestChallenges?: string[];
};

// Motivational quotes for pickleball players
const MOTIVATIONAL_QUOTES = [
  { quote: "Every dink is a step toward mastery.", author: "Coach Kai" },
  { quote: "Champions are made at the kitchen line.", author: "Pickleball Wisdom" },
  { quote: "The third shot drop separates good from great.", author: "Coach Kai" },
  { quote: "Stay patient. Stay low. Stay ready.", author: "Pro Tip" },
  { quote: "Your opponent's power is your opportunity.", author: "Coach Kai" },
  { quote: "Win the point, not the rally.", author: "Strategy Tip" },
  { quote: "Footwork is the foundation of every great shot.", author: "Coach Kai" },
  { quote: "Mental toughness wins more games than talent alone.", author: "Champion Mindset" },
  { quote: "Practice your weaknesses, compete with your strengths.", author: "Coach Kai" },
  { quote: "The kitchen is where points are won and lost.", author: "Pickleball Truth" },
  { quote: "Reset, breathe, focus. The next point is yours.", author: "Coach Kai" },
  { quote: "Consistency beats power every time.", author: "Pro Tip" },
];

// Format message timestamp
function formatMessageTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Animated Avatar Component
function AnimatedAvatar({ state, size = 'lg' }: { state: AvatarState; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = { sm: 'w-10 h-10', md: 'w-14 h-14', lg: 'w-20 h-20' };
  const textSizes = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl' };

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
        className="relative w-full h-full rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-xl shadow-emerald-500/30"
        animate={{ scale: state === 'listening' ? [1, 1.05, 1] : 1 }}
        transition={{ duration: 0.8, repeat: state === 'listening' ? Infinity : 0 }}
      >
        <AnimatePresence mode="wait">
          {state === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={`text-white ${textSizes[size]} font-black`}>
              K
            </motion.div>
          )}
          {state === 'listening' && (
            <motion.div key="listening" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-0.5">
              {[...Array(4)].map((_, i) => (
                <motion.div key={i} className="w-1 bg-white/80 rounded-full"
                  animate={{ height: [6, 14 + Math.random() * 10, 6] }}
                  transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.08 }}
                />
              ))}
            </motion.div>
          )}
          {state === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-1">
              {[...Array(3)].map((_, i) => (
                <motion.div key={i} className="w-2 h-2 bg-white rounded-full"
                  animate={{ y: [0, -6, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }}
                />
              ))}
            </motion.div>
          )}
          {state === 'responding' && (
            <motion.div key="responding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      <motion.div
        className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-slate-900 shadow ${
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

// Push-to-Talk Button - Compact for top position
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
        alert('Speech recognition not supported in this browser.');
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
    <div className="flex items-center gap-3">
      <motion.button
        onMouseDown={startListening}
        onMouseUp={stopListening}
        onMouseLeave={isListening ? stopListening : undefined}
        onTouchStart={startListening}
        onTouchEnd={stopListening}
        disabled={disabled}
        className={`relative w-14 h-14 rounded-full shadow-lg transition-all ${
          disabled ? 'bg-slate-700 cursor-not-allowed' 
            : isListening ? 'bg-gradient-to-br from-amber-500 to-orange-500 scale-110 shadow-amber-500/40' 
            : 'bg-gradient-to-br from-emerald-500 to-teal-500 hover:scale-105 active:scale-95 shadow-emerald-500/30'
        }`}
        whileTap={disabled ? {} : { scale: 1.1 }}
      >
        {isListening && (
          <motion.div className="absolute inset-0 rounded-full bg-amber-400" animate={{ scale: [1, 1.4], opacity: [0.4, 0] }} transition={{ duration: 0.8, repeat: Infinity }} />
        )}
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          <Mic className={`w-6 h-6 text-white ${isListening ? 'animate-pulse' : ''}`} />
        </div>
      </motion.button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${isListening ? 'text-amber-400' : 'text-slate-300'}`}>
          {isListening ? '🎤 Listening...' : 'Hold to Talk'}
        </p>
        {transcript && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-slate-400 truncate">
            "{transcript}"
          </motion.p>
        )}
      </div>
    </div>
  );
}

// SMS Settings Modal
function SMSSettingsModal({ isOpen, onClose, phoneNumber, setPhoneNumber, smsEnabled, setSmsEnabled }: {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  setPhoneNumber: (v: string) => void;
  smsEnabled: boolean;
  setSmsEnabled: (v: boolean) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [localPhone, setLocalPhone] = useState(phoneNumber);
  const [localEnabled, setLocalEnabled] = useState(smsEnabled);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/sms-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: localPhone, smsEnabled: localEnabled })
      });
      if (res.ok) {
        setPhoneNumber(localPhone);
        setSmsEnabled(localEnabled);
        onClose();
      }
    } catch (e) {
      console.error('Failed to save SMS settings:', e);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">SMS Reminders</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-slate-400 text-sm mb-4">
          Get motivational texts and drill reminders from Coach Kai! 🏓
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-white">Enable SMS Reminders</span>
            <Switch checked={localEnabled} onCheckedChange={setLocalEnabled} />
          </div>

          {localEnabled && (
            <div>
              <label className="text-sm text-slate-400 block mb-1">Phone Number</label>
              <Input
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={localPhone}
                onChange={(e) => setLocalPhone(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
              <p className="text-xs text-slate-500 mt-1">Standard messaging rates may apply</p>
            </div>
          )}

          <Button
            onClick={handleSave}
            disabled={saving || (localEnabled && !localPhone)}
            className="w-full bg-emerald-600 hover:bg-emerald-500"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
            Save Settings
          </Button>
        </div>
      </motion.div>
    </motion.div>
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
  const [showSMSSettings, setShowSMSSettings] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dailyQuote, setDailyQuote] = useState(MOTIVATIONAL_QUOTES[0]);
  
  const isProcessingRef = useRef(false);
  const lastMessageRef = useRef('');
  const historyLoadedRef = useRef(false);
  const conversationTopRef = useRef<HTMLDivElement>(null);

  // Get daily quote based on date
  useEffect(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    setDailyQuote(MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length]);
  }, []);

  const getWelcome = () => {
    const name = userContext?.firstName || 'Champion';
    return `Hey ${name}! 👋 I'm Coach Kai, your AI pickleball coach.\n\nI'm here for **technique**, **mental game**, **drills**, and support - whether you crushed it today or need to work through a challenge.\n\nWhat's on your mind? 🏓`;
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
            // Reverse for newest-first display
            setMessages(msgs.reverse());
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

  // Load SMS settings
  useEffect(() => {
    const loadSMSSettings = async () => {
      try {
        const res = await fetch('/api/user/sms-settings');
        if (res.ok) {
          const data = await res.json();
          setSmsEnabled(data.smsEnabled || false);
          setPhoneNumber(data.phoneNumber || '');
        }
      } catch (e) {
        // Ignore - optional feature
      }
    };
    loadSMSSettings();
  }, []);

  useEffect(() => {
    if (isListening) setAvatarState('listening');
    else if (isLoading) setAvatarState('processing');
    else setAvatarState('idle');
  }, [isListening, isLoading]);

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
    // Add new message at the beginning (newest first)
    setMessages(prev => [userMsg, ...prev]);
    
    try {
      // Build conversation from reversed messages (API expects oldest first)
      const conversationMsgs = [
        ...messages.slice(0, 9).reverse().map(m => ({ role: m.role, content: m.content })),
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
      
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: fullContent || 'I\'m here to help! What would you like to work on?',
        timestamp: new Date(),
        actionCards,
        emotion
      };
      
      // Insert assistant message after user message (at position 1)
      setMessages(prev => [prev[0], assistantMsg, ...prev.slice(1)]);
      setStreamingContent('');
      setTimeout(() => setAvatarState('idle'), 500);
      
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [{
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '🤔 Sorry, I had trouble with that. Please try again!',
        timestamp: new Date()
      }, ...prev]);
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
    if (card.action === 'create-goal') {
      setMessages(prev => [{
        id: `system-${Date.now()}`,
        role: 'assistant',
        content: `✅ **Goal Set!** I've added "${card.data?.goalText}" to your goals. Let's crush it! 💪`,
        timestamp: new Date()
      }, ...prev]);
    }
  };

  // Visible messages (limit to 4 for initial view, user can scroll for more)
  const visibleMessages = messages.slice(0, 4);
  const hasMoreMessages = messages.length > 4;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      {/* Compact Header with PTT */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-cyan-950 border-b border-emerald-500/20 text-white py-4 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <AnimatedAvatar state={avatarState} size="md" />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-black tracking-tight">COACH KAI</h1>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                  <Brain className="w-3 h-3 mr-1" /> AI
                </Badge>
                <Badge variant="outline" className="text-amber-400 border-amber-500/30 text-xs">BETA</Badge>
              </div>
              <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                avatarState === 'listening' ? 'bg-amber-500/20 text-amber-300' :
                avatarState === 'processing' ? 'bg-purple-500/20 text-purple-300' :
                avatarState === 'responding' ? 'bg-cyan-500/20 text-cyan-300' :
                'bg-emerald-500/20 text-emerald-300'
              }`}>
                {avatarState === 'listening' ? '👂 Listening...' :
                 avatarState === 'processing' ? '🤔 Thinking...' :
                 avatarState === 'responding' ? '✍️ Responding...' :
                 '✓ Ready'}
              </div>
            </div>

            {/* PTT Button - Top Right */}
            <div className="flex items-center gap-2">
              <PushToTalkButton onTranscript={sendMessage} disabled={isLoading} isListening={isListening} setIsListening={setIsListening} />
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSMSSettings(true)}
                className="text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/50"
                title="SMS Reminders"
              >
                <Phone className="w-5 h-5" />
                {smsEnabled && <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-4 flex flex-col gap-4">
        {/* Text Input - Compact */}
        <Card className="shadow-lg border border-emerald-500/20 bg-slate-900/80 backdrop-blur p-3">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Tell Coach Kai what's on your mind..."
              disabled={isLoading}
              className="flex-1 min-h-[50px] max-h-[80px] resize-none bg-slate-800 border-slate-700 focus:border-emerald-500 text-white placeholder:text-slate-500 rounded-xl text-sm"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="h-[50px] w-[50px] bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 rounded-xl shadow-lg"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
        </Card>

        {/* Conversation - Newest First, Limited to 4 Visible */}
        <Card className="flex-1 shadow-lg border border-slate-700/50 bg-slate-900/80 backdrop-blur overflow-hidden flex flex-col">
          <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-white text-sm">Conversation</span>
            </div>
            {hasMoreMessages && (
              <span className="text-xs text-slate-500">Scroll for older messages</span>
            )}
          </div>
          
          <div ref={conversationTopRef} className="flex-1 p-4 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700" style={{ maxHeight: '400px' }}>
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mr-2" />
                <span className="text-slate-400">Loading...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="font-medium">Start a conversation!</p>
              </div>
            ) : (
              <>
                {/* Streaming content at top */}
                {streamingContent && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-start">
                    <div className="max-w-[85%] rounded-2xl px-4 py-3 shadow-lg bg-slate-800 text-slate-100 border border-slate-700">
                      <div className="prose prose-sm prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingContent}</ReactMarkdown>
                      </div>
                      <span className="inline-block w-2 h-4 bg-emerald-400 ml-1 animate-pulse" />
                    </div>
                  </motion.div>
                )}
                
                {isLoading && !streamingContent && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="bg-slate-800 rounded-2xl px-4 py-3 border border-slate-700">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                        <span className="text-slate-300 text-sm">Coach Kai is thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Messages - newest first */}
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-lg ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                        : 'bg-slate-800 text-slate-100 border border-slate-700'
                    }`}>
                      {message.role === 'assistant' ? (
                        <div className="prose prose-sm prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                    </div>
                    
                    {message.role === 'assistant' && message.actionCards && message.actionCards.length > 0 && (
                      <div className="w-full max-w-[85%] mt-2">
                        <ActionCardsList cards={message.actionCards} onAction={handleActionComplete} />
                      </div>
                    )}
                    
                    <span className={`text-xs text-slate-500 mt-1 px-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {formatMessageTime(message.timestamp)}
                    </span>
                  </motion.div>
                ))}
              </>
            )}
          </div>
        </Card>

        {/* Quick Actions - Compact */}
        <div className="grid grid-cols-4 gap-2">
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
              className="h-auto py-2 flex flex-col items-center gap-0.5 bg-slate-800/50 border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-950/30 text-slate-300 hover:text-white text-xs"
            >
              <span className="text-lg">{action.emoji}</span>
              <span className="font-medium">{action.label}</span>
            </Button>
          ))}
        </div>

        {/* Motivational Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-gradient-to-r from-emerald-950/50 to-teal-950/50 border border-emerald-500/20 rounded-xl p-3 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            <Heart className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-semibold">Daily Inspiration</span>
          </div>
          <p className="text-white text-sm italic">"{dailyQuote.quote}"</p>
          <p className="text-slate-500 text-xs mt-1">— {dailyQuote.author}</p>
        </motion.div>
      </div>

      {/* SMS Settings Modal */}
      <AnimatePresence>
        {showSMSSettings && (
          <SMSSettingsModal
            isOpen={showSMSSettings}
            onClose={() => setShowSMSSettings(false)}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            smsEnabled={smsEnabled}
            setSmsEnabled={setSmsEnabled}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
