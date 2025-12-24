'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Mic, MicOff, MessageCircle, Sparkles, Video, VideoOff, Volume2, VolumeX, Wifi, WifiOff } from 'lucide-react';
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

type AvatarState = 'disconnected' | 'connecting' | 'idle' | 'listening' | 'thinking' | 'speaking';

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
  const [avatarState, setAvatarState] = useState<AvatarState>('disconnected');
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  
  const avatarRef = useRef<StreamingAvatar | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sessionIdRef = useRef<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const isProcessingRef = useRef(false);

  // Initialize avatar session
  const initializeAvatar = useCallback(async () => {
    if (avatarRef.current || avatarState === 'connecting') return;
    
    setAvatarState('connecting');
    setError(null);
    
    try {
      // Get access token from our API
      const tokenRes = await fetch('/api/heygen/token', { method: 'POST' });
      if (!tokenRes.ok) {
        throw new Error('Failed to get HeyGen access token');
      }
      const { token } = await tokenRes.json();
      
      // Initialize StreamingAvatar
      const avatar = new StreamingAvatar({ token });
      avatarRef.current = avatar;
      
      // Set up event listeners
      avatar.on(StreamingEvents.STREAM_READY, (event: any) => {
        console.log('Stream ready:', event);
        if (videoRef.current && event.detail) {
          videoRef.current.srcObject = event.detail;
          videoRef.current.play().catch(console.error);
        }
        setAvatarState('idle');
      });
      
      avatar.on(StreamingEvents.AVATAR_START_TALKING, () => {
        setAvatarState('speaking');
      });
      
      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
        setAvatarState('idle');
      });
      
      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        setAvatarState('disconnected');
        avatarRef.current = null;
        sessionIdRef.current = null;
      });
      
      // Start avatar session with valid HeyGen avatar/voice IDs
      const sessionData = await avatar.createStartAvatar({
        quality: AvatarQuality.High,
        avatarName: 'Andrew_public_pro1_20230614', // Alex in Black Suit
        voice: {
          voiceId: '1ae3be1e24894ccabdb4d8139399f721', // Tony - Professional
          rate: 1.0,
          emotion: VoiceEmotion.FRIENDLY
        }
      });
      
      sessionIdRef.current = sessionData.session_id;
      console.log('Avatar session started:', sessionData.session_id);
      
      // Say greeting
      const name = userContext?.firstName || 'Champion';
      setTimeout(async () => {
        await speakText(`Hey ${name}! I'm Coach Kai, your AI pickleball coach. What can I help you with today?`);
      }, 1000);
      
    } catch (err: any) {
      console.error('Avatar init error:', err);
      const errorMsg = err.message || 'Failed to connect to video avatar';
      // More helpful error messages
      if (errorMsg.includes('400') || errorMsg.includes('Bad Request')) {
        setError('Video avatar unavailable. The HeyGen API may need configuration. Text chat is always available!');
      } else if (errorMsg.includes('401') || errorMsg.includes('Unauthorized')) {
        setError('HeyGen API key not configured. Text chat is always available!');
      } else {
        setError(errorMsg);
      }
      setAvatarState('disconnected');
    }
  }, [avatarState, userContext?.firstName]);

  // Disconnect avatar
  const disconnectAvatar = useCallback(async () => {
    if (avatarRef.current) {
      try {
        await avatarRef.current.stopAvatar();
      } catch (e) {
        console.error('Error stopping avatar:', e);
      }
      avatarRef.current = null;
      sessionIdRef.current = null;
    }
    setAvatarState('disconnected');
  }, []);

  // Speak text through avatar
  const speakText = async (text: string) => {
    if (!avatarRef.current || !sessionIdRef.current) return;
    
    try {
      await avatarRef.current.speak({
        text,
        taskType: TaskType.REPEAT
      });
    } catch (err) {
      console.error('Speak error:', err);
    }
  };

  // Send message and get AI response
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
      // Get AI response from Coach Kai API
      const conversationMsgs = [
        ...messages.slice(-9).map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: msg }
      ];
      
      const res = await fetch('/api/ai-coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: conversationMsgs,
          // Request shorter responses for video
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
        
        // Speak the response through avatar
        if (avatarRef.current && sessionIdRef.current) {
          // Clean response for speech (remove markdown)
          const cleanText = data.message
            .replace(/\*\*/g, '')
            .replace(/\*/g, '')
            .replace(/#{1,6}\s/g, '')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .substring(0, 500); // Limit length for credits
          
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
      setAvatarState('idle');
    } finally {
      setIsLoading(false);
      isProcessingRef.current = false;
    }
  }, [input, isLoading, messages]);

  // Speech recognition
  const startListening = useCallback(() => {
    if (isLoading) return;
    
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
      
      recognition.onerror = (event: any) => {
        console.error('Speech error:', event.error);
        setIsListening(false);
        setAvatarState(avatarRef.current ? 'idle' : 'disconnected');
      };
      
      recognition.onend = () => {
        setIsListening(false);
        setAvatarState(avatarRef.current ? 'idle' : 'disconnected');
      };
      
      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
      setAvatarState('listening');
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
    }
  }, [isLoading, sendMessage]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectAvatar();
    };
  }, [disconnectAvatar]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getStateColor = () => {
    switch (avatarState) {
      case 'disconnected': return 'bg-slate-500';
      case 'connecting': return 'bg-yellow-500 animate-pulse';
      case 'idle': return 'bg-green-500';
      case 'listening': return 'bg-yellow-500 animate-pulse';
      case 'thinking': return 'bg-purple-500 animate-pulse';
      case 'speaking': return 'bg-cyan-500 animate-pulse';
      default: return 'bg-slate-500';
    }
  };

  const getStateText = () => {
    switch (avatarState) {
      case 'disconnected': return 'Offline';
      case 'connecting': return 'Connecting...';
      case 'idle': return 'Ready';
      case 'listening': return 'Listening...';
      case 'thinking': return 'Thinking...';
      case 'speaking': return 'Speaking...';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white py-4 px-4 shadow-2xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-400 flex items-center justify-center text-2xl font-black shadow-lg">
                K
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStateColor()}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight">COACH KAI</h1>
                <Badge className="bg-white/20 text-white border-white/30">
                  <Video className="w-3 h-3 mr-1" />
                  VIDEO AI
                </Badge>
              </div>
              <p className="text-teal-100 text-sm">{getStateText()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {avatarState === 'disconnected' ? (
              <Button 
                onClick={initializeAvatar}
                className="bg-white/20 hover:bg-white/30"
              >
                <Video className="w-4 h-4 mr-2" />
                Start Video
              </Button>
            ) : (
              <Button 
                onClick={disconnectAvatar}
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <VideoOff className="w-4 h-4 mr-2" />
                End
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Section */}
          <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
            <div className="aspect-video bg-slate-900 relative">
              {avatarState === 'disconnected' ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                  <motion.div 
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500/30 to-cyan-500/30 flex items-center justify-center mb-4"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Video className="w-12 h-12" />
                  </motion.div>
                  <p className="font-semibold mb-2">Click "Start Video" to begin</p>
                  <p className="text-sm text-slate-500">Interactive video coaching</p>
                  {error && (
                    <p className="text-red-400 text-sm mt-2">{error}</p>
                  )}
                </div>
              ) : avatarState === 'connecting' ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="w-12 h-12 animate-spin mb-4 text-teal-400" />
                  <p className="font-semibold">Connecting to Coach Kai...</p>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted={isMuted}
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Video overlay controls */}
              {avatarState !== 'disconnected' && avatarState !== 'connecting' && (
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <Badge className={`${getStateColor()} text-white`}>
                    {getStateText()}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsMuted(!isMuted)}
                    className="bg-black/50 hover:bg-black/70 text-white"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </div>
              )}
            </div>
            
            {/* Voice Input */}
            <div className="p-4 bg-slate-800/30">
              <div className="flex items-center gap-4">
                <motion.button
                  onClick={isListening ? stopListening : startListening}
                  disabled={isLoading || avatarState === 'disconnected' || avatarState === 'connecting'}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                    isListening 
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500 scale-110' 
                      : avatarState === 'disconnected' || avatarState === 'connecting'
                        ? 'bg-slate-600 cursor-not-allowed'
                        : 'bg-gradient-to-br from-teal-500 to-cyan-500 hover:scale-105'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {isListening ? (
                    <MicOff className="w-8 h-8 text-white" />
                  ) : (
                    <Mic className="w-8 h-8 text-white" />
                  )}
                </motion.button>
                <div className="flex-1">
                  <p className="text-white font-semibold">
                    {isListening ? '🎤 Listening...' : 'Tap to speak'}
                  </p>
                  <p className="text-slate-400 text-sm">
                    Ask Coach Kai anything about pickleball
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Chat Section */}
          <Card className="bg-slate-800/50 border-slate-700 flex flex-col h-[500px]">
            <div className="px-4 py-3 border-b border-slate-700 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-teal-400" />
              <span className="font-bold text-white">Conversation</span>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Start a conversation with Coach Kai!</p>
                </div>
              ) : (
                messages.map((message, index) => (
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
                <div className="flex justify-start">
                  <div className="bg-slate-700 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                      <span className="text-slate-300">Coach Kai is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Text Input */}
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
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
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

        {/* Credits Notice */}
        <p className="text-center text-slate-500 text-sm mt-6">
          ⚡ Video avatar uses HeyGen credits • Text chat is always free
        </p>
      </div>
    </div>
  );
}
