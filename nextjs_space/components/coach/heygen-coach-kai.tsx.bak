'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, MessageCircle, Sparkles, Volume2, VolumeX, X, Mic, MicOff, Calendar, Target, Dumbbell, Video, Check, X as XIcon, ChevronRight } from 'lucide-react';
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

type ActionSuggestion = {
  type: 'calendar' | 'message' | 'resource' | 'analysis';
  action: string;
  data: Record<string, any>;
  requiresConfirmation: boolean;
  confirmationPrompt?: string;
};

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: ActionSuggestion[];
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
  const [vadEnabled, setVadEnabled] = useState(true);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [pendingActions, setPendingActions] = useState<ActionSuggestion[]>([]);
  const [executingAction, setExecutingAction] = useState<string | null>(null);
  const [isPTTActive, setIsPTTActive] = useState(false);
  const [pttTranscript, setPttTranscript] = useState('');
  
  const avatarRef = useRef<StreamingAvatar | null>(null);
  const pttRecognitionRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sessionIdRef = useRef<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const isProcessingRef = useRef(false);
  const initAttemptedRef = useRef(false);
  const vadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize avatar session with retry logic - AUTO-START on mount
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
      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
        setAvatarState('ready');
        // Auto-restart listening after avatar finishes speaking (if VAD enabled)
        if (vadEnabled && !isProcessingRef.current) {
          setTimeout(() => startContinuousListening(), 500);
        }
      });
      
      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log('Stream disconnected');
        setAvatarState('offline');
        setHasVideo(false);
        avatarRef.current = null;
        sessionIdRef.current = null;
        stopContinuousListening();
        // Auto-retry on unexpected disconnect (up to 2 retries)
        if (retryCount < 2) {
          setError('Reconnecting...');
          setTimeout(() => initializeAvatar(retryCount + 1), 2000);
        } else {
          setError('Video unavailable. Text chat is always free!');
        }
      });
      
      // Try female avatars first (Coach Kai is female), with fallbacks
      const avatarOptions = [
        'Kayla-incasualsuit-20220818',  // Primary: American blonde female
        'Kristin_public_2_20240108',    // Backup: Female
        'Angela-inwhiteskirt-20220820', // Backup: Female  
        'emily_lite_20240612'           // Fallback
      ];
      
      let sessionData = null;
      for (const avatarName of avatarOptions) {
        try {
          sessionData = await avatar.createStartAvatar({
            quality: AvatarQuality.Low,
            avatarName: avatarName,
            voice: {
              voiceId: '1a9bfb4ec9bc43d59ab64a4e66fe46', // Arabella - fluid natural American voice
              rate: 1.0,
              emotion: VoiceEmotion.FRIENDLY
            }
          });
          console.log(`Successfully initialized avatar: ${avatarName}`);
          break;
        } catch (avatarErr) {
          console.log(`Avatar ${avatarName} failed, trying next...`);
        }
      }
      
      if (!sessionData) {
        throw new Error('All avatar options failed');
      }
      
      sessionIdRef.current = sessionData.session_id;
      
      // Greeting - then auto-start listening
      const name = userContext?.firstName || 'there';
      setTimeout(() => {
        speakText(`Hi ${name}! I'm Coach Kai, your pickleball AI coach. Just start talking whenever you're ready - I'm listening!`);
      }, 1500);
      
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
  }, [avatarState, userContext?.firstName, vadEnabled]);

  // Disconnect avatar
  const disconnectAvatar = useCallback(async () => {
    stopContinuousListening();
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
      stopContinuousListening(); // Stop listening while avatar speaks
      await avatarRef.current.speak({ text, taskType: TaskType.REPEAT });
    } catch (err) {
      console.error('Speak error:', err);
    }
  };

  // Stop continuous listening
  const stopContinuousListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }
    if (vadTimeoutRef.current) {
      clearTimeout(vadTimeoutRef.current);
      vadTimeoutRef.current = null;
    }
    setInterimTranscript('');
  }, []);

  // Start continuous listening with Voice Activity Detection
  const startContinuousListening = useCallback(() => {
    // Check states that should prevent listening
    const blockedStates: AvatarState[] = ['speaking', 'thinking'];
    if (!vadEnabled || isLoading || blockedStates.includes(avatarState)) return;
    if (recognitionRef.current) return; // Already listening
    
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) return;
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        let interim = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interim += transcript;
          }
        }
        
        setInterimTranscript(interim);
        
        if (finalTranscript.trim()) {
          setInterimTranscript('');
          sendMessage(finalTranscript.trim());
        }
      };
      
      recognition.onerror = (e: any) => {
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
          console.log('Speech recognition error:', e.error);
        }
        // Auto-restart after error (except abort)
        if (e.error !== 'aborted' && vadEnabled) {
          vadTimeoutRef.current = setTimeout(() => startContinuousListening(), 1000);
        }
      };
      
      recognition.onend = () => {
        recognitionRef.current = null;
        // Auto-restart if VAD enabled and not processing
        if (vadEnabled && !isProcessingRef.current) {
          vadTimeoutRef.current = setTimeout(() => startContinuousListening(), 500);
        }
      };
      
      recognition.onstart = () => {
        setAvatarState(prev => (prev === 'ready' || prev === 'offline') ? 'listening' : prev);
      };
      
      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.log('Speech recognition not available');
    }
  }, [vadEnabled, isLoading, avatarState]);

  // Execute a suggested action
  const executeAction = useCallback(async (action: ActionSuggestion) => {
    setExecutingAction(action.action);
    try {
      const res = await fetch('/api/coach-kai/execute-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: action.type === 'resource' ? action.data?.type || 'drill' : action.type,
          data: action.data
        })
      });
      
      if (!res.ok) throw new Error('Action failed');
      const result = await res.json();
      
      // Add confirmation message
      setMessages(prev => [...prev, {
        id: `action-${Date.now()}`,
        role: 'assistant',
        content: `✅ ${result.message}${result.xpAwarded ? ` (+${result.xpAwarded} XP!)` : ''}`,
        timestamp: new Date()
      }]);
      
      // Remove from pending
      setPendingActions(prev => prev.filter(a => a !== action));
      
    } catch (err) {
      console.error('Action execution error:', err);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '❌ Sorry, I couldn\'t complete that action. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setExecutingAction(null);
    }
  }, []);

  // Dismiss an action
  const dismissAction = useCallback((action: ActionSuggestion) => {
    setPendingActions(prev => prev.filter(a => a !== action));
  }, []);

  // Send message - now using enhanced Coach Kai API with streaming
  const sendMessage = useCallback(async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading || isProcessingRef.current) return;
    
    isProcessingRef.current = true;
    stopContinuousListening();
    setInput('');
    setIsLoading(true);
    setAvatarState('thinking');
    setInterimTranscript('');
    
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
      
      // Use enhanced Coach Kai API with streaming
      const res = await fetch('/api/coach-kai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationMsgs })
      });
      
      if (!res.ok) throw new Error('API error');
      
      // Handle streaming response
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let actionSuggestions: ActionSuggestion[] = [];
      
      if (reader) {
        let partialRead = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          partialRead += decoder.decode(value, { stream: true });
          const lines = partialRead.split('\n');
          partialRead = lines.pop() || '';
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.type === 'text' && parsed.content) {
                  fullContent += parsed.content;
                } else if (parsed.type === 'actions' && parsed.suggestions) {
                  actionSuggestions = parsed.suggestions;
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }
      
      if (fullContent) {
        const assistantMsg: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: fullContent,
          timestamp: new Date(),
          actions: actionSuggestions
        };
        
        setMessages(prev => [...prev, assistantMsg]);
        
        // Add to pending actions if any need confirmation
        if (actionSuggestions.length > 0) {
          setPendingActions(prev => [...prev, ...actionSuggestions.filter(a => a.requiresConfirmation)]);
        }
        
        if (avatarRef.current && sessionIdRef.current) {
          // Clean markdown for speech
          const cleanText = fullContent
            .replace(/\*\*/g, '')
            .replace(/\*/g, '')
            .replace(/#{1,6}\s/g, '')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .substring(0, 500);
          await speakText(cleanText);
        } else {
          setAvatarState('ready');
          if (vadEnabled) setTimeout(() => startContinuousListening(), 500);
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
      if (vadEnabled) setTimeout(() => startContinuousListening(), 1000);
    } finally {
      setIsLoading(false);
      isProcessingRef.current = false;
    }
  }, [input, isLoading, messages, vadEnabled, stopContinuousListening, startContinuousListening]);

  // Toggle VAD
  const toggleVAD = useCallback(() => {
    if (vadEnabled) {
      stopContinuousListening();
      setAvatarState(avatarRef.current ? 'ready' : 'offline');
    } else {
      startContinuousListening();
    }
    setVadEnabled(!vadEnabled);
  }, [vadEnabled, stopContinuousListening, startContinuousListening]);

  // Push-to-Talk: Start listening when button is pressed
  const startPTT = useCallback(() => {
    // Disable VAD while PTT is active
    if (vadEnabled) {
      stopContinuousListening();
    }
    
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setError('Speech recognition not supported in this browser');
        return;
      }
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        let interim = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interim += transcript;
          }
        }
        
        setPttTranscript(interim || finalTranscript);
      };
      
      recognition.onerror = (e: any) => {
        console.log('PTT error:', e.error);
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
          setError('Voice recognition error. Try again.');
        }
      };
      
      recognition.onend = () => {
        // Recognition ended - handled by stopPTT
      };
      
      pttRecognitionRef.current = recognition;
      recognition.start();
      setIsPTTActive(true);
      setAvatarState('listening');
      setPttTranscript('');
    } catch (error) {
      console.error('PTT start error:', error);
      setError('Could not start voice recognition');
    }
  }, [vadEnabled, stopContinuousListening]);

  // Push-to-Talk: Stop listening and send message
  const stopPTT = useCallback(() => {
    if (pttRecognitionRef.current) {
      pttRecognitionRef.current.stop();
      pttRecognitionRef.current = null;
    }
    
    setIsPTTActive(false);
    setAvatarState(avatarRef.current ? 'ready' : 'offline');
    
    // Send the captured transcript
    if (pttTranscript.trim()) {
      sendMessage(pttTranscript.trim());
    }
    
    setPttTranscript('');
    
    // Restore VAD if it was enabled
    if (vadEnabled) {
      setTimeout(() => startContinuousListening(), 500);
    }
  }, [pttTranscript, vadEnabled, startContinuousListening, sendMessage]);

  // Auto-initialize on mount
  useEffect(() => {
    if (!initAttemptedRef.current) {
      initAttemptedRef.current = true;
      initializeAvatar();
    }
    return () => { 
      stopContinuousListening();
      disconnectAvatar(); 
    };
  }, []);

  // Start listening when avatar becomes ready
  useEffect(() => {
    if (avatarState === 'ready' && vadEnabled && !recognitionRef.current && !isProcessingRef.current) {
      const timer = setTimeout(() => startContinuousListening(), 1000);
      return () => clearTimeout(timer);
    }
  }, [avatarState, vadEnabled, startContinuousListening]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Color-coded states - more vibrant
  const getStateStyles = () => {
    switch (avatarState) {
      case 'offline': return { ring: 'ring-slate-500', glow: '', bg: 'bg-slate-900' };
      case 'connecting': return { ring: 'ring-cyan-400 ring-2 animate-pulse', glow: 'shadow-lg shadow-cyan-500/40', bg: 'bg-slate-900' };
      case 'ready': return { ring: 'ring-emerald-400 ring-2', glow: 'shadow-lg shadow-emerald-500/30', bg: 'bg-slate-900' };
      case 'listening': return { ring: 'ring-green-400 ring-4', glow: 'shadow-xl shadow-green-500/50', bg: 'bg-green-950/40' };
      case 'thinking': return { ring: 'ring-purple-400 ring-2 animate-pulse', glow: 'shadow-lg shadow-purple-500/40', bg: 'bg-purple-950/30' };
      case 'speaking': return { ring: 'ring-amber-400 ring-4', glow: 'shadow-xl shadow-amber-500/50', bg: 'bg-amber-950/30' };
      default: return { ring: 'ring-slate-500', glow: '', bg: 'bg-slate-900' };
    }
  };

  const stateStyles = getStateStyles();

  const getStateLabel = () => {
    switch (avatarState) {
      case 'offline': return { text: 'Starting up...', color: 'text-slate-400', icon: '⏳' };
      case 'connecting': return { text: 'Connecting...', color: 'text-cyan-400', icon: '🔄' };
      case 'ready': return { text: 'Ready', color: 'text-emerald-400', icon: '✓' };
      case 'listening': return { text: 'Listening...', color: 'text-green-400', icon: '🎤' };
      case 'thinking': return { text: 'Thinking...', color: 'text-purple-400', icon: '🧠' };
      case 'speaking': return { text: 'Speaking...', color: 'text-amber-400', icon: '🔊' };
      default: return { text: '', color: '', icon: '' };
    }
  };

  const stateLabel = getStateLabel();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Compact Header with minimal controls */}
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
              <p className={`text-sm ${stateLabel.color} flex items-center gap-1`}>
                <span>{stateLabel.icon}</span> {stateLabel.text}
                {interimTranscript && <span className="text-white/70 ml-2">"{interimTranscript}"</span>}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* VAD Toggle */}
            <Button 
              onClick={toggleVAD} 
              variant="ghost" 
              size="sm" 
              className={`text-white hover:bg-white/20 ${vadEnabled ? 'bg-green-500/30' : 'bg-red-500/30'}`}
              title={vadEnabled ? 'Auto-listen ON' : 'Auto-listen OFF'}
            >
              {vadEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </Button>
            
            {/* Close button - small X */}
            {(avatarState !== 'offline') && (
              <Button 
                onClick={disconnectAvatar} 
                variant="ghost" 
                size="sm" 
                className="text-white/70 hover:text-white hover:bg-white/20 w-8 h-8 p-0"
                title="End session"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Interactive Avatar Area - No click needed */}
          <Card className={`${stateStyles.bg} border-slate-700 overflow-hidden transition-all duration-500 ${stateStyles.glow}`}>
            {/* Avatar Zone - auto-listens, no click required */}
            <motion.div 
              className={`aspect-video relative ring-2 ${stateStyles.ring} transition-all duration-300 rounded-lg overflow-hidden`}
            >
              {/* Video element - always present */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isMuted}
                style={{ width: '100%', height: '100%', objectFit: 'cover', backgroundColor: '#0f172a' }}
                className={`w-full h-full object-cover transition-opacity duration-500 ${hasVideo ? 'opacity-100' : 'opacity-0'}`}
                onCanPlay={() => {
                  console.log('Video can play');
                  if (videoRef.current && !hasVideo) {
                    videoRef.current.play().catch(console.error);
                  }
                }}
              />
              
              {/* Fallback Avatar Placeholder - shown while loading */}
              {!hasVideo && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                  {/* Animated Coach Kai graphic */}
                  <motion.div 
                    className={`relative w-28 h-28 rounded-full flex items-center justify-center shadow-2xl ${
                      avatarState === 'listening' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                      avatarState === 'speaking' ? 'bg-gradient-to-br from-amber-500 to-orange-600' :
                      avatarState === 'thinking' ? 'bg-gradient-to-br from-purple-500 to-violet-600' :
                      avatarState === 'connecting' ? 'bg-gradient-to-br from-cyan-500 to-blue-600' :
                      'bg-gradient-to-br from-teal-500 to-cyan-600'
                    }`}
                    animate={
                      avatarState === 'listening' ? { scale: [1, 1.08, 1], boxShadow: ['0 0 30px rgba(34, 197, 94, 0.4)', '0 0 50px rgba(34, 197, 94, 0.7)', '0 0 30px rgba(34, 197, 94, 0.4)'] } :
                      avatarState === 'speaking' ? { scale: [1, 1.05, 1], boxShadow: ['0 0 30px rgba(245, 158, 11, 0.4)', '0 0 45px rgba(245, 158, 11, 0.6)', '0 0 30px rgba(245, 158, 11, 0.4)'] } :
                      avatarState === 'thinking' ? { rotate: [0, 3, -3, 0], scale: [1, 1.02, 1] } :
                      avatarState === 'connecting' ? { scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] } :
                      { scale: [1, 1.02, 1] }
                    }
                    transition={{ duration: avatarState === 'listening' ? 0.7 : avatarState === 'speaking' ? 0.5 : 1.5, repeat: Infinity }}
                  >
                    <span className="text-4xl font-black text-white">K</span>
                    
                    {/* Recording indicator for listening */}
                    {avatarState === 'listening' && (
                      <motion.div 
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.4, repeat: Infinity }}
                      >
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </motion.div>
                    )}
                  </motion.div>
                  
                  {/* State text */}
                  <motion.p 
                    className={`mt-4 font-semibold ${stateLabel.color}`}
                    animate={{ opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {stateLabel.icon} {stateLabel.text}
                  </motion.p>
                  
                  {/* Listening hint - show interim transcript */}
                  {avatarState === 'listening' && interimTranscript && (
                    <p className="text-green-300/80 text-sm mt-2 px-4 text-center">"{interimTranscript}"</p>
                  )}
                  
                  {/* Auto-listen hint */}
                  {(avatarState === 'ready' || avatarState === 'listening') && vadEnabled && !interimTranscript && (
                    <p className="text-slate-500 text-xs mt-2">Just start talking - I'm listening!</p>
                  )}
                  
                  {error && <p className="text-amber-400 text-sm mt-3 px-4 text-center">{error}</p>}
                </div>
              )}
              
              {/* Video overlay - state indicator when video is showing */}
              {hasVideo && (
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <Badge className={`${
                    avatarState === 'listening' ? 'bg-green-500/90' :
                    avatarState === 'speaking' ? 'bg-amber-500/90' :
                    avatarState === 'thinking' ? 'bg-purple-500/90' :
                    'bg-emerald-500/90'
                  } text-white font-semibold backdrop-blur-sm`}>
                    {stateLabel.icon} {stateLabel.text}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                    className="bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </div>
              )}
              
              {/* Pulse ring animation for listening */}
              {avatarState === 'listening' && (
                <motion.div 
                  className="absolute inset-0 border-4 border-green-400/60 rounded-lg pointer-events-none"
                  animate={{ opacity: [0.6, 0.2, 0.6], scale: [1, 1.01, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
              
              {/* Speaking waves animation */}
              {avatarState === 'speaking' && (
                <motion.div 
                  className="absolute inset-0 border-4 border-amber-400/50 rounded-lg pointer-events-none"
                  animate={{ opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
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
              
              {/* Pending Action Cards */}
              {pendingActions.length > 0 && (
                <div className="space-y-2 mt-4">
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Suggested Actions</p>
                  {pendingActions.map((action, idx) => (
                    <motion.div
                      key={`action-${idx}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-teal-900/50 to-cyan-900/50 border border-teal-500/30 rounded-xl p-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          action.type === 'calendar' ? 'bg-blue-500/20 text-blue-400' :
                          action.type === 'resource' ? 'bg-emerald-500/20 text-emerald-400' :
                          action.type === 'message' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-amber-500/20 text-amber-400'
                        }`}>
                          {action.type === 'calendar' ? <Calendar className="w-5 h-5" /> :
                           action.type === 'resource' && action.data?.type === 'goal' ? <Target className="w-5 h-5" /> :
                           action.type === 'resource' ? <Dumbbell className="w-5 h-5" /> :
                           action.type === 'analysis' ? <Video className="w-5 h-5" /> :
                           <MessageCircle className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm">{action.action}</p>
                          <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">
                            {action.confirmationPrompt || action.data?.title || action.data?.description}
                          </p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            size="sm"
                            onClick={() => executeAction(action)}
                            disabled={!!executingAction}
                            className="h-8 px-3 bg-teal-500 hover:bg-teal-600 text-white"
                          >
                            {executingAction === action.action ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <><Check className="w-4 h-4 mr-1" /> Yes</>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => dismissAction(action)}
                            disabled={!!executingAction}
                            className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
                          >
                            <XIcon className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-700">
              {/* PTT Transcript Display */}
              {isPTTActive && pttTranscript && (
                <div className="mb-3 p-3 rounded-lg bg-green-900/30 border border-green-500/50">
                  <p className="text-green-300 text-sm flex items-center gap-2">
                    <motion.span 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="w-2 h-2 bg-red-500 rounded-full"
                    />
                    <span className="font-medium">Listening:</span> {pttTranscript}
                  </p>
                </div>
              )}
              
              <div className="flex gap-2">
                {/* Push-to-Talk Button */}
                <motion.button
                  onMouseDown={startPTT}
                  onMouseUp={stopPTT}
                  onMouseLeave={isPTTActive ? stopPTT : undefined}
                  onTouchStart={startPTT}
                  onTouchEnd={stopPTT}
                  disabled={isLoading}
                  className={`h-[50px] w-[50px] rounded-lg flex items-center justify-center transition-all duration-200 ${
                    isPTTActive 
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 shadow-lg shadow-red-500/50 scale-110' 
                      : 'bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  whileTap={{ scale: 1.1 }}
                  title="Hold to talk"
                >
                  {isPTTActive ? (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.3, repeat: Infinity }}
                    >
                      <Mic className="w-5 h-5 text-white" />
                    </motion.div>
                  ) : (
                    <Mic className="w-5 h-5 text-white" />
                  )}
                </motion.button>
                
                <Textarea
                  value={isPTTActive ? pttTranscript : input}
                  onChange={(e) => !isPTTActive && setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={isPTTActive ? "Listening... release to send" : "Type or hold 🎤 to talk..."}
                  disabled={isLoading || isPTTActive}
                  className={`flex-1 min-h-[50px] resize-none bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 ${
                    isPTTActive ? 'border-green-500/50 bg-green-900/20' : ''
                  }`}
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading || isPTTActive}
                  className="h-[50px] w-[50px] bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </Button>
              </div>
              
              <p className="text-slate-500 text-xs mt-2 text-center">
                💡 Hold the 🎤 button to speak, or type your message
              </p>
            </div>
          </Card>
        </div>

        {/* Quick Prompts - Enhanced for function calling */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Fix My Backhand', prompt: 'My backhand keeps going into the net. Can you help?', emoji: '🏓' },
            { label: 'Add Tournament', prompt: 'I have a tournament this Saturday at 2pm', emoji: '📅' },
            { label: 'Serve Drill', prompt: 'I need a drill to improve my serve consistency', emoji: '🎯' },
            { label: 'Set a Goal', prompt: 'Help me set a goal to improve my dinking', emoji: '🏆' },
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
