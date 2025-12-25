'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, MessageCircle, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import StreamingAvatar, { 
  AvatarQuality, 
  StreamingEvents, 
  TaskType,
  VoiceEmotion 
} from '@heygen/streaming-avatar';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type AvatarState = 'offline' | 'connecting' | 'ready' | 'listening' | 'thinking' | 'speaking';

type UserContext = {
  name?: string;
  firstName?: string;
  skillLevel?: string;
  playerRating?: number;
  primaryGoals?: string[];
  biggestChallenges?: string[];
};

interface HeyGenCoachKaiProps {
  userContext?: UserContext;
}

export default function HeyGenCoachKai({ userContext }: HeyGenCoachKaiProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [avatarState, setAvatarState] = useState<AvatarState>('offline');
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasVideo, setHasVideo] = useState(false);
  
  const avatarRef = useRef<StreamingAvatar | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sessionIdRef = useRef<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const isProcessingRef = useRef(false);
  const initAttemptedRef = useRef(false);

  // Initialize avatar session with retry logic
  const initializeAvatar = useCallback(async (retryCount = 0) => {
    if (avatarRef.current || avatarState === 'connecting') return;
    
    setAvatarState('connecting');
    setError(null);
    
    try {
      // First, clean up any stale sessions
      if (retryCount === 0) {
        try {
          await fetch('/api/heygen/cleanup', { method: 'POST' });
        } catch (e) {
          console.log('No stale sessions to clean');
        }
      }
      
      const tokenRes = await fetch('/api/heygen/token', { method: 'POST' });
      if (!tokenRes.ok) {
        const errData = await tokenRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to get HeyGen access token');
      }
      const { token } = await tokenRes.json();
      
      const avatar = new StreamingAvatar({ token });
      avatarRef.current = avatar;
      
      // Event listeners
      avatar.on(StreamingEvents.STREAM_READY, (event: any) => {
        console.log('Stream ready event:', event);
        const mediaStream = event?.detail || event;
        
        if (videoRef.current && mediaStream instanceof MediaStream) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.muted = false;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().then(() => {
              console.log('Video playback started');
              setHasVideo(true);
            }).catch((err) => {
              console.error('Video play error:', err);
              if (videoRef.current) {
                videoRef.current.muted = true;
                videoRef.current.play().then(() => {
                  setHasVideo(true);
                  console.log('Playing muted due to autoplay policy');
                }).catch(console.error);
              }
            });
          };
        } else if (videoRef.current) {
          try {
            videoRef.current.srcObject = mediaStream;
            videoRef.current.play().then(() => setHasVideo(true)).catch(console.error);
          } catch (e) {
            console.error('Failed to set video stream:', e);
          }
        }
        setAvatarState('ready');
      });
      
      avatar.on(StreamingEvents.AVATAR_START_TALKING, () => setAvatarState('speaking'));
      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => setAvatarState('ready'));
      
      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log('Stream disconnected');
        setAvatarState('offline');
        setHasVideo(false);
        avatarRef.current = null;
        sessionIdRef.current = null;
        // Auto-retry on unexpected disconnect (up to 2 retries)
        if (retryCount < 2) {
          setError('Reconnecting...');
          setTimeout(() => initializeAvatar(retryCount + 1), 2000);
        } else {
          setError('Video unavailable. Text chat is always free!');
        }
      });
      
      const sessionData = await avatar.createStartAvatar({
        quality: AvatarQuality.Low,
        avatarName: 'Kristin_public_2_20240108', // Female avatar
        voice: {
          voiceId: '001cc6d54eae4ca2b5fb16ca8e8eb9bb', // Sara - Friendly female voice
          rate: 1.0,
          emotion: VoiceEmotion.FRIENDLY
        }
      });
      
      sessionIdRef.current = sessionData.session_id;
      
      // Greeting
      const name = userContext?.firstName || 'Champion';
      setTimeout(() => speakText(`Hey ${name}! I'm Coach Kai. Click on me to ask anything about pickleball!`), 1500);
      
    } catch (err: any) {
      console.error('Avatar init error:', err);
      const errorMsg = err.message?.toLowerCase() || '';
      
      // Check for specific error types
      if (errorMsg.includes('concurrent') || errorMsg.includes('limit') || errorMsg.includes('session')) {
        setError('Session limit reached. Retrying...');
        if (retryCount < 2) {
          setTimeout(() => initializeAvatar(retryCount + 1), 3000);
          return;
        }
      } else if (errorMsg.includes('credit') || errorMsg.includes('quota')) {
        setError('HeyGen credits exhausted. Text chat is free!');
      } else {
        setError('Video unavailable. Text chat is always free!');
      }
      setAvatarState('offline');
    }
  }, [avatarState, userContext?.firstName]);

  // Disconnect avatar
  const disconnectAvatar = useCallback(async () => {
    if (avatarRef.current) {
      try { await avatarRef.current.stopAvatar(); } catch (e) {}
      avatarRef.current = null;
      sessionIdRef.current = null;
    }
    setAvatarState('offline');
    setHasVideo(false);
  }, []);

  // Speak text
  const speakText = async (text: string) => {
    if (!avatarRef.current || !sessionIdRef.current) return;
    try {
      await avatarRef.current.speak({ text, taskType: TaskType.REPEAT });
    } catch (err) {
      console.error('Speak error:', err);
    }
  };

  // Send message
  const sendMessage = useCallback(async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading || isProcessingRef.current) return;
    
    isProcessingRef.current = true;
    setInput('');
    setIsLoading(true);
    setAvatarState('thinking');
    
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
        body: JSON.stringify({ 
          messages: conversationMsgs,
          systemPromptAddition: 'Keep your response to 2-3 sentences since it will be spoken by a video avatar.'
        })
      });
      
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      
      if (data.message) {
        const assistantMsg: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.message,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMsg]);
        
        if (avatarRef.current && sessionIdRef.current) {
          const cleanText = data.message
            .replace(/\*\*/g, '').replace(/\*/g, '').replace(/#{1,6}\s/g, '')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').substring(0, 500);
          await speakText(cleanText);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I had trouble with that. Please try again!',
        timestamp: new Date()
      }]);
      setAvatarState('ready');
    } finally {
      setIsLoading(false);
      isProcessingRef.current = false;
    }
  }, [input, isLoading, messages]);

  // Speech recognition - triggered on avatar click
  const startListening = useCallback(() => {
    if (isLoading || avatarState === 'listening') return;
    
    // If avatar not ready, initialize first
    if (avatarState === 'offline') {
      initializeAvatar();
      return;
    }
    
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('Speech recognition not supported. Please use Chrome, Safari, or Edge.');
        return;
      }
      
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        sendMessage(transcript);
      };
      
      recognition.onerror = () => setAvatarState(avatarRef.current ? 'ready' : 'offline');
      recognition.onend = () => {
        setAvatarState((prev) => prev === 'listening' ? (avatarRef.current ? 'ready' : 'offline') : prev);
      };
      
      recognitionRef.current = recognition;
      recognition.start();
      setAvatarState('listening');
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
    }
  }, [isLoading, avatarState, sendMessage, initializeAvatar]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setAvatarState(avatarRef.current ? 'ready' : 'offline');
  }, []);

  // Auto-initialize on mount
  useEffect(() => {
    if (!initAttemptedRef.current) {
      initAttemptedRef.current = true;
      initializeAvatar();
    }
    return () => { disconnectAvatar(); };
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Handle avatar click - start/stop listening
  const handleAvatarClick = () => {
    if (avatarState === 'offline' || avatarState === 'connecting') {
      initializeAvatar();
    } else if (avatarState === 'listening') {
      stopListening();
    } else if (avatarState === 'ready') {
      startListening();
    }
    // Don't interrupt if speaking or thinking
  };

  // Color-coded states
  const getStateStyles = () => {
    switch (avatarState) {
      case 'offline': return { ring: 'ring-slate-500', glow: '', bg: 'bg-slate-800' };
      case 'connecting': return { ring: 'ring-cyan-500 animate-pulse', glow: 'shadow-cyan-500/50', bg: 'bg-slate-800' };
      case 'ready': return { ring: 'ring-emerald-500', glow: 'shadow-emerald-500/30', bg: 'bg-slate-800' };
      case 'listening': return { ring: 'ring-green-400 ring-4', glow: 'shadow-green-500/60 shadow-2xl', bg: 'bg-green-950/30' };
      case 'thinking': return { ring: 'ring-purple-500 animate-pulse', glow: 'shadow-purple-500/50', bg: 'bg-purple-950/20' };
      case 'speaking': return { ring: 'ring-amber-500 ring-4', glow: 'shadow-amber-500/60 shadow-2xl', bg: 'bg-amber-950/20' };
      default: return { ring: 'ring-slate-500', glow: '', bg: 'bg-slate-800' };
    }
  };

  const stateStyles = getStateStyles();

  const getStateLabel = () => {
    switch (avatarState) {
      case 'offline': return { text: 'Click to start', color: 'text-slate-400' };
      case 'connecting': return { text: 'Connecting...', color: 'text-cyan-400' };
      case 'ready': return { text: 'Click to talk', color: 'text-emerald-400' };
      case 'listening': return { text: '🎤 Listening...', color: 'text-green-400' };
      case 'thinking': return { text: 'Thinking...', color: 'text-purple-400' };
      case 'speaking': return { text: 'Speaking...', color: 'text-amber-400' };
      default: return { text: '', color: '' };
    }
  };

  const stateLabel = getStateLabel();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white py-3 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center text-xl font-black shadow-lg">
              K
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight">COACH KAI</h1>
                <Badge className="bg-white/20 text-white border-white/30 text-xs">VIDEO AI</Badge>
              </div>
              <p className={`text-sm ${stateLabel.color}`}>{stateLabel.text}</p>
            </div>
          </div>
          
          {avatarState !== 'offline' && avatarState !== 'connecting' && (
            <Button onClick={disconnectAvatar} variant="ghost" size="sm" className="text-white hover:bg-white/20">
              End
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Interactive Avatar Area */}
          <Card className={`${stateStyles.bg} border-slate-700 overflow-hidden transition-all duration-300`}>
            {/* Clickable Avatar Zone */}
            <motion.div 
              onClick={handleAvatarClick}
              className={`aspect-video relative cursor-pointer ring-2 ${stateStyles.ring} transition-all duration-300 ${stateStyles.glow}`}
              whileHover={{ scale: avatarState === 'speaking' || avatarState === 'thinking' ? 1 : 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {/* Video element - always present */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isMuted}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                className={`w-full h-full object-cover ${hasVideo ? 'opacity-100' : 'opacity-0'}`}
                onCanPlay={() => {
                  console.log('Video can play');
                  if (videoRef.current && !hasVideo) {
                    videoRef.current.play().catch(console.error);
                  }
                }}
              />
              
              {/* Fallback Avatar Placeholder */}
              {!hasVideo && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {/* Animated Coach Kai graphic */}
                  <motion.div 
                    className={`relative w-32 h-32 rounded-full flex items-center justify-center ${
                      avatarState === 'listening' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                      avatarState === 'speaking' ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                      avatarState === 'thinking' ? 'bg-gradient-to-br from-purple-500 to-violet-600' :
                      avatarState === 'connecting' ? 'bg-gradient-to-br from-cyan-500 to-blue-600' :
                      'bg-gradient-to-br from-teal-500 to-cyan-600'
                    }`}
                    animate={
                      avatarState === 'listening' ? { scale: [1, 1.1, 1], boxShadow: ['0 0 20px rgba(34, 197, 94, 0.5)', '0 0 40px rgba(34, 197, 94, 0.8)', '0 0 20px rgba(34, 197, 94, 0.5)'] } :
                      avatarState === 'speaking' ? { scale: [1, 1.05, 1], boxShadow: ['0 0 20px rgba(245, 158, 11, 0.5)', '0 0 35px rgba(245, 158, 11, 0.7)', '0 0 20px rgba(245, 158, 11, 0.5)'] } :
                      avatarState === 'thinking' ? { rotate: [0, 5, -5, 0] } :
                      avatarState === 'connecting' ? { scale: [1, 1.05, 1] } :
                      { scale: [1, 1.02, 1] }
                    }
                    transition={{ duration: avatarState === 'listening' ? 0.8 : avatarState === 'speaking' ? 0.6 : 2, repeat: Infinity }}
                  >
                    <span className="text-5xl font-black text-white">K</span>
                    
                    {/* Recording indicator for listening */}
                    {avatarState === 'listening' && (
                      <motion.div 
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </motion.div>
                    )}
                  </motion.div>
                  
                  {/* State text */}
                  <motion.p 
                    className={`mt-4 font-semibold text-lg ${stateLabel.color}`}
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {stateLabel.text}
                  </motion.p>
                  
                  {/* Hint text */}
                  {avatarState === 'ready' && (
                    <p className="text-slate-500 text-sm mt-1">Tap anywhere to start talking</p>
                  )}
                  
                  {error && <p className="text-amber-400 text-sm mt-2">{error}</p>}
                </div>
              )}
              
              {/* Video overlay - state indicator when video is showing */}
              {hasVideo && (
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <Badge className={`${
                    avatarState === 'listening' ? 'bg-green-500' :
                    avatarState === 'speaking' ? 'bg-amber-500' :
                    avatarState === 'thinking' ? 'bg-purple-500' :
                    'bg-emerald-500'
                  } text-white font-semibold`}>
                    {stateLabel.text}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                    className="bg-black/50 hover:bg-black/70 text-white"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </div>
              )}
              
              {/* Pulse ring animation for listening */}
              {avatarState === 'listening' && (
                <motion.div 
                  className="absolute inset-0 border-4 border-green-400 rounded-lg pointer-events-none"
                  animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.02, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.div>
          </Card>

          {/* Chat Section */}
          <Card className="bg-slate-800/50 border-slate-700 flex flex-col h-[400px] lg:h-auto">
            <div className="px-4 py-3 border-b border-slate-700 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-teal-400" />
              <span className="font-bold text-white">Conversation</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>Start a conversation with Coach Kai!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                        : 'bg-slate-700 text-slate-100'
                    }`}>
                      {message.role === 'assistant' ? (
                        <div className="prose prose-sm prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p>{message.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-700 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                      <span className="text-slate-300">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-700">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your question..."
                  disabled={isLoading}
                  className="flex-1 min-h-[50px] resize-none bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="h-[50px] w-[50px] bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Prompts */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Serve Tips', prompt: 'Give me your best serve tip', emoji: '🎯' },
            { label: 'Dinking', prompt: 'How can I improve my dinking?', emoji: '🏓' },
            { label: 'Third Shot', prompt: 'Teach me the third shot drop', emoji: '📊' },
            { label: 'Mental Game', prompt: 'Help me stay focused during matches', emoji: '🧠' },
          ].map((action) => (
            <Button
              key={action.label}
              variant="outline"
              onClick={() => sendMessage(action.prompt)}
              disabled={isLoading}
              className="h-auto py-3 flex flex-col items-center gap-1 border-slate-600 hover:border-teal-400 hover:bg-slate-800 text-slate-300"
            >
              <span className="text-2xl">{action.emoji}</span>
              <span className="text-sm font-medium">{action.label}</span>
            </Button>
          ))}
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          ⚡ Video avatar uses HeyGen credits • Text chat is always free
        </p>
      </div>
    </div>
  );
}
