
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles, Target, Zap, TrendingUp, Settings, ArrowRight, Brain, Trophy, Video, BookOpen, BarChart, Users, Calendar, Volume2, VolumeX, MessageSquare, Activity, Clock, Dumbbell, MapPin, Award, Lightbulb, ChevronDown, ChevronUp, X, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import InteractiveAvatar from '@/components/avatar/interactive-avatar';
import VoiceSettingsModal, { VoicePreferences } from '@/components/voice/voice-settings-modal';
import TextToSpeech from '@/components/voice/text-to-speech';
import PushToTalk from '@/components/voice/push-to-talk';
import { Progress } from '@/components/ui/progress';

import MentalTrainingPrompts from './mental-training-prompts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  quickActions?: QuickAction[];
};

type QuickAction = {
  label: string;
  icon: any;
  action: () => void;
  variant?: 'default' | 'secondary' | 'outline';
};

type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking';

type UserContext = {
  name?: string;
  firstName?: string;
  skillLevel?: string;
  playerRating?: number;
  primaryGoals?: string[];
  biggestChallenges?: string[];
  recentMatches?: number;
  sessionCount?: number;
};

const defaultVoicePreferences: VoicePreferences = {
  voiceEnabled: true,
  speechToTextEnabled: true,
  textToSpeechEnabled: true,
  rate: 1,
  pitch: 1,
  volume: 0.8,
  interactionMode: 'both',
  avatarName: 'Coach Kai',
  avatarType: 'default',
  autoSpeak: true,
  language: 'en-US'
};

const getPersonalizedWelcome = (userContext?: UserContext) => {
  const firstName = userContext?.firstName || 'Champion';
  const skillLevel = userContext?.skillLevel || 'beginner';
  const goals = userContext?.primaryGoals?.[0];
  
  let message = `👋 Hey ${firstName}! I'm Coach Kai, your AI pickleball companion. 🏓\n\n`;
  
  if (goals) {
    message += `I see you're focused on ${goals}. Let's crush those goals today! 🔥\n\n`;
  }
  
  message += `What would you like to work on? I can help with:\n• 🎯 Technique & drills\n• 📊 Performance analysis\n• 🧠 Mental game strategies\n• 📹 Video analysis\n• 🏆 Tournament prep\n\nJust type below!`;
  
  return message;
};

interface PTTAICoachProps {
  userContext?: UserContext;
}

export default function PTTAICoach({ userContext }: PTTAICoachProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  
  // Voice-related state
  const [voicePreferences, setVoicePreferences] = useState<VoicePreferences>(defaultVoicePreferences);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [lastAssistantMessage, setLastAssistantMessage] = useState<string>('');
  const [lastAssistantMessageId, setLastAssistantMessageId] = useState<string>(''); // Track message ID for TTS
  
  // PTT state management
  const [processingVoiceInput, setProcessingVoiceInput] = useState(false);
  
  // Mental Training Panel state - Hidden by default to prevent UI clutter
  const [showMentalPanel, setShowMentalPanel] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSentMessageRef = useRef<string>('');
  const lastSentTimeRef = useRef<number>(0);
  const historyLoadedRef = useRef<boolean>(false); // Prevent duplicate history loads
  const isProcessingRequestRef = useRef<boolean>(false); // Prevent concurrent API calls
  const lastAssistantResponseRef = useRef<string>(''); // Track last response to prevent exact duplicates
  const isInitialMountRef = useRef(true); // Track if it's the initial mount to prevent auto-scroll
  const hasUserInteractedRef = useRef(false); // Only scroll after user sends their first message

  // Load conversation history on mount - LIMIT TO LAST 10 MESSAGES
  useEffect(() => {
    // Prevent loading history multiple times
    if (historyLoadedRef.current) {
      console.log('📋 History already loaded, skipping');
      return;
    }

    const loadConversationHistory = async () => {
      try {
        console.log('📋 Loading conversation history...');
        const response = await fetch('/api/ai-coach/conversation-history');
        if (response.ok) {
          const data = await response.json();
          if (data.conversation?.messages && data.conversation.messages.length > 0) {
            // Convert API messages to local Message format
            const allMessages: Message[] = data.conversation.messages.map((msg: any) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: new Date(msg.createdAt)
            }));
            
            // LIMIT TO LAST 10 MESSAGES ONLY & DEDUPLICATE BY ID
            const last10Messages = allMessages.slice(-10);
            
            // Deduplicate messages by ID (in case of any duplicates from API)
            const uniqueMessages = last10Messages.filter((msg, index, self) => 
              index === self.findIndex((m) => m.id === msg.id)
            );
            
            console.log(`📋 Loaded ${uniqueMessages.length} unique messages`);
            setMessages(uniqueMessages);
          } else {
            // No previous conversation - show personalized welcome
            console.log('📋 No history found, showing welcome message');
            setMessages([{
              id: `welcome-${Date.now()}`,
              role: 'assistant',
              content: getPersonalizedWelcome(userContext),
              timestamp: new Date()
            }]);
          }
        } else {
          // If fetch fails, show default welcome message
          console.log('📋 Failed to fetch history, showing welcome message');
          setMessages([{
            id: `welcome-${Date.now()}`,
            role: 'assistant',
            content: getPersonalizedWelcome(userContext),
            timestamp: new Date()
          }]);
        }
      } catch (error) {
        console.error('Error loading conversation history:', error);
        setMessages([{
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          content: getPersonalizedWelcome(userContext),
          timestamp: new Date()
        }]);
      } finally {
        setIsLoadingHistory(false);
        historyLoadedRef.current = true; // Mark history as loaded
      }
    };

    loadConversationHistory();
  }, []); // Remove userContext dependency to prevent re-loading

  // Auto-scroll to latest message - but ONLY after user sends their first message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Skip auto-scroll on initial mount
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      console.log('📜 Initial page load - skipping auto-scroll to stay at top');
      return;
    }
    
    // Only scroll if user has interacted with the chat
    if (hasUserInteractedRef.current && messages.length > 0) {
      console.log('📜 New message added - auto-scrolling to bottom');
      scrollToBottom();
    }
  }, [messages]);

  // Update avatar state based on activity
  useEffect(() => {
    if (isListening || processingVoiceInput) {
      setAvatarState('listening');
    } else if (isSpeaking) {
      setAvatarState('speaking');
    } else if (isLoading) {
      setAvatarState('thinking');
    } else {
      setAvatarState('idle');
    }
  }, [isListening, isSpeaking, isLoading, processingVoiceInput]);

  // Parse quick actions from AI response
  const parseQuickActions = (content: string): { content: string; actions: QuickAction[] } => {
    const actions: QuickAction[] = [];
    
    // Check for navigation suggestions
    if (content.toLowerCase().includes('drill') || content.toLowerCase().includes('practice')) {
      actions.push({
        label: 'View Drills',
        icon: Target,
        action: () => window.location.href = '/train/drills'
      });
    }
    
    if (content.toLowerCase().includes('video') || content.toLowerCase().includes('analyze')) {
      actions.push({
        label: 'Upload Video',
        icon: Video,
        action: () => window.location.href = '/train/video-analysis'
      });
    }
    
    if (content.toLowerCase().includes('progress') || content.toLowerCase().includes('stats')) {
      actions.push({
        label: 'View Progress',
        icon: BarChart,
        action: () => window.location.href = '/progress'
      });
    }
    
    if (content.toLowerCase().includes('partner') || content.toLowerCase().includes('match')) {
      actions.push({
        label: 'Find Partners',
        icon: Users,
        action: () => window.location.href = '/connect/players'
      });
    }
    
    if (content.toLowerCase().includes('tournament')) {
      actions.push({
        label: 'Find Tournaments',
        icon: Trophy,
        action: () => window.location.href = '/connect/tournaments'
      });
    }
    
    return { content, actions };
  };

  // Handle message sending - MOVED BEFORE handlePTTVoiceInput to fix closure issue
  const handleSendMessage = useCallback(async (messageContent?: string) => {
    const textToSend = messageContent || input.trim();
    console.log('📤 handleSendMessage called with:', textToSend.substring(0, 50));
    console.log('📊 State check:', { isLoading, isProcessingRequest: isProcessingRequestRef.current });
    
    if (!textToSend) {
      console.log('📭 No text to send');
      return;
    }
    
    if (isLoading) {
      console.log('⏳ Already loading, skipping');
      return;
    }

    // PREVENT CONCURRENT REQUESTS - but with timeout protection
    if (isProcessingRequestRef.current) {
      const timeSinceLastSent = Date.now() - lastSentTimeRef.current;
      
      // If more than 5 seconds have passed, force reset (stuck state) - REDUCED from 10s
      if (timeSinceLastSent > 5000) {
        console.log('⚠️ Processing flag stuck for > 5s, force resetting');
        isProcessingRequestRef.current = false;
      } else {
        console.log('🚫 Already processing a request (sent ' + Math.round(timeSinceLastSent/1000) + 's ago), skipping');
        return;
      }
    }

    // DEDUPLICATION: Prevent sending the same message twice within 2 seconds
    const now = Date.now();
    const timeSinceLastMessage = now - lastSentTimeRef.current;
    const isSameMessage = textToSend.trim().toLowerCase() === lastSentMessageRef.current.toLowerCase();
    
    if (isSameMessage && timeSinceLastMessage < 2000) {
      console.log('🚫 Duplicate message blocked:', textToSend.substring(0, 50));
      return;
    }
    
    // Update last sent tracking
    lastSentMessageRef.current = textToSend.trim().toLowerCase();
    lastSentTimeRef.current = now;

    // Mark as processing
    console.log('✅ Setting isProcessingRequestRef to true');
    isProcessingRequestRef.current = true;
    
    // Enable auto-scroll after first user interaction
    hasUserInteractedRef.current = true;

    // Generate unique ID for user message
    const uniqueId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const userMessage: Message = {
      id: uniqueId,
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    // Add user message with IMPROVED deduplication check
    setMessages(prev => {
      // Check if this exact message is already in the last 3 messages
      const recentMessages = prev.slice(-3);
      const isDuplicate = recentMessages.some(msg => 
        msg.role === 'user' && 
        msg.content.trim().toLowerCase() === textToSend.trim().toLowerCase()
      );
      
      if (isDuplicate) {
        console.log('🚫 Duplicate message in state, skipping');
        return prev;
      }
      
      console.log('✅ Adding user message:', textToSend.substring(0, 50));
      return [...prev, userMessage];
    });
    if (!messageContent) setInput(''); // Only clear input if not from PTT
    setIsLoading(true);

    // Cancel any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Add timeout protection (30 seconds)
    const timeoutId = setTimeout(() => {
      console.log('⏱️ Request timeout after 30s, aborting...');
      controller.abort();
    }, 30000);

    try {
      // Build messages array in the format the API expects
      // Use the PREVIOUS messages (before adding the new one) + the new message
      // This prevents sending the user message twice
      const conversationMessages = [
        ...messages.slice(-9).map(msg => ({  // Get last 9 messages (not 10)
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user',
          content: textToSend
        }
      ];

      console.log('📡 Sending request to API with', conversationMessages.length, 'messages');

      // Add retry logic for 503 errors (service temporarily unavailable)
      let response;
      let retries = 0;
      const maxRetries = 2;

      while (retries <= maxRetries) {
        try {
          console.log(`📡 API call attempt ${retries + 1}/${maxRetries + 1}`);
          response = await fetch('/api/ai-coach/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: conversationMessages
            }),
            signal: controller.signal
          });
          console.log('📡 API response received:', response.status, response.statusText);

          // If successful or non-retryable error, break
          if (response.ok || (response.status !== 503 && response.status !== 502)) {
            break;
          }

          // For 503/502, retry after a short delay
          if (retries < maxRetries) {
            console.log(`⚠️ Server unavailable (${response.status}), retrying... (attempt ${retries + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1))); // Exponential backoff
            retries++;
          } else {
            break;
          }
        } catch (fetchError: any) {
          if (fetchError.name === 'AbortError') {
            throw fetchError;
          }
          if (retries < maxRetries) {
            console.log(`⚠️ Network error, retrying... (attempt ${retries + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1)));
            retries++;
          } else {
            throw fetchError;
          }
        }
      }

      if (!response || !response.ok) {
        const errorText = await response?.text().catch(() => 'No response');
        console.error('❌ API error:', {
          status: response?.status,
          statusText: response?.statusText,
          error: errorText,
          retriesAttempted: retries
        });
        throw new Error(`API Error ${response?.status || 'Unknown'}: ${response?.statusText || 'Service unavailable. Please try again.'}`);
      }

      const data = await response.json();
      console.log('✅ API Response received:', data);
      
      // CRITICAL FIX: Validate response has a message
      if (!data || !data.message) {
        console.error('❌ API returned invalid response:', data);
        throw new Error('Invalid API response: missing message');
      }
      
      console.log('📝 Message content:', data.message.substring(0, 100));
      
      // Parse content for quick actions
      const { content, actions } = parseQuickActions(data.message);
      
      // CRITICAL FIX: Validate content is not empty
      if (!content || content.trim().length === 0) {
        console.error('❌ Empty content received from API');
        throw new Error('Empty response from API');
      }
      
      // Generate unique ID for assistant message
      const uniqueId = `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const assistantMessage: Message = {
        id: uniqueId,
        role: 'assistant',
        content,
        timestamp: new Date(),
        quickActions: actions
      };

      // IMPROVED: Check if this exact response was JUST received (but only if we have a previous response)
      if (lastAssistantResponseRef.current && content.trim().toLowerCase() === lastAssistantResponseRef.current.toLowerCase()) {
        console.log('🚫 Exact duplicate assistant response detected, skipping');
        setIsLoading(false);
        isProcessingRequestRef.current = false;
        return;
      }

      // Add assistant message with COMPREHENSIVE deduplication check
      setMessages(prev => {
        // Check if this exact response is already in the last 3 messages
        const recentMessages = prev.slice(-3);
        const isDuplicate = recentMessages.some(msg => 
          msg.role === 'assistant' && 
          msg.content.trim().toLowerCase() === content.trim().toLowerCase()
        );
        
        if (isDuplicate) {
          console.log('🚫 Duplicate assistant response in recent messages, skipping');
          return prev;
        }
        
        console.log('✅ Adding assistant message:', content.substring(0, 50));
        return [...prev, assistantMessage];
      });
      
      // Update tracking
      lastAssistantResponseRef.current = content.trim().toLowerCase();
      console.log('🔊 Setting lastAssistantMessage for TTS:', content.substring(0, 50));
      console.log('🔊 Message ID for TTS:', uniqueId);
      
      // Set both the message content AND the unique ID for TTS tracking
      setLastAssistantMessage(content);
      setLastAssistantMessageId(uniqueId); // CRITICAL: Pass unique ID to prevent duplicate TTS

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('🚫 Request aborted');
        const abortMessage: Message = {
          id: `abort-${Date.now()}`,
          role: 'assistant',
          content: '⏱️ Request timed out. Please try again!',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, abortMessage]);
        // Don't return here - let the finally block execute
      } else {
        console.error('❌ Error sending message:', error);
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack?.split('\n').slice(0, 3).join('\n')
        });
        
        const is503Error = error.message?.includes('503') || error.message?.includes('502');
        const isInvalidResponse = error.message?.includes('Invalid API response') || error.message?.includes('Empty response');
        
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: is503Error
            ? '🔄 I\'m having a moment! The servers are a bit busy. Give me just a second and try again! 💪'
            : isInvalidResponse
            ? '🤔 Hmm, I got a bit confused there. Can you try saying that again? 🏓'
            : `🤔 Sorry, I had trouble processing that. Could you try again?\n\n${error.message ? `(${error.message})` : ''}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      // Clear timeout
      clearTimeout(timeoutId);
      
      // CRITICAL: Always reset flags
      console.log('🔄 Finally block: resetting all flags');
      setIsLoading(false);
      isProcessingRequestRef.current = false;
      abortControllerRef.current = null;
    }
  }, [input, isLoading, messages, parseQuickActions]); // Add all dependencies

  // Handle PTT voice input - PROPERLY MEMOIZED with handleSendMessage dependency
  const handlePTTVoiceInput = useCallback(async (text: string) => {
    console.log('🎤 PTT Voice input received:', text);
    console.log('📊 Current state:', { 
      isLoading, 
      processingVoiceInput, 
      isProcessingRequest: isProcessingRequestRef.current,
      messagesCount: messages.length 
    });
    
    if (!text.trim()) {
      console.log('📭 Empty transcript, ignoring');
      return;
    }

    console.log('✅ Processing PTT voice input:', text.substring(0, 50));
    setProcessingVoiceInput(true);
    
    // Stop any speaking immediately when user starts talking
    if (isSpeaking && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      console.log('🔇 Interrupting TTS for new voice input');
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    
    // CRITICAL FIX: Force reset blocking flags if they're stuck (but check timing first)
    if (isProcessingRequestRef.current) {
      const timeSinceLastSent = Date.now() - lastSentTimeRef.current;
      if (timeSinceLastSent > 3000) {
        // Only reset if it's been more than 3 seconds since last send
        console.log('⚠️ Processing flag was stuck for', Math.round(timeSinceLastSent/1000), 's, force resetting');
        isProcessingRequestRef.current = false;
      } else {
        console.log('⏳ Recent request still processing (', Math.round(timeSinceLastSent/1000), 's ago), waiting...');
        setProcessingVoiceInput(false);
        return;
      }
    }
    
    try {
      // Send message immediately (PTT automatically sends on release)
      console.log('📤 About to call handleSendMessage with text length:', text.length);
      await handleSendMessage(text);
      console.log('✅ PTT message sent successfully');
    } catch (error) {
      console.error('❌ Error sending PTT message:', error);
      // Show error to user
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: '🔄 Sorry, I had trouble processing that. Please try again!',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      // Always reset processing state
      console.log('🔄 Resetting processingVoiceInput state');
      setProcessingVoiceInput(false);
    }
  }, [handleSendMessage, isLoading, processingVoiceInput, isSpeaking, messages.length]); // Proper dependencies

  // Handle speaking state change
  const handleSpeakingChange = useCallback((speaking: boolean) => {
    setIsSpeaking(speaking);
  }, []);

  // Interrupt TTS - allow user to stop Coach Kai from speaking
  const interruptSpeech = useCallback(() => {
    if (isSpeaking && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSpeaking]);

  // Handle voice settings update
  const handleVoiceSettingsChange = useCallback((newPreferences: VoicePreferences) => {
    setVoicePreferences(newPreferences);
  }, []);


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Calculate session stats
  const sessionStart = useRef(new Date());
  const [sessionStats, setSessionStats] = useState({
    questionsAsked: 0,
    sessionTime: '0m',
    topicsDiscussed: new Set<string>()
  });

  // Update session stats when messages change
  useEffect(() => {
    const userMessages = messages.filter(m => m.role === 'user').length;
    const elapsed = Math.floor((new Date().getTime() - sessionStart.current.getTime()) / 60000);
    
    // Extract topics from conversation
    const topics = new Set<string>();
    messages.forEach(msg => {
      if (msg.content.toLowerCase().includes('serve')) topics.add('Serve');
      if (msg.content.toLowerCase().includes('footwork')) topics.add('Footwork');
      if (msg.content.toLowerCase().includes('dink')) topics.add('Dinking');
      if (msg.content.toLowerCase().includes('volley')) topics.add('Volleys');
      if (msg.content.toLowerCase().includes('strategy')) topics.add('Strategy');
      if (msg.content.toLowerCase().includes('mental')) topics.add('Mental');
    });
    
    setSessionStats({
      questionsAsked: userMessages,
      sessionTime: elapsed > 0 ? `${elapsed}m` : 'Just started',
      topicsDiscussed: topics
    });
  }, [messages]);

  // Always show only last 3 messages - no expansion
  const displayMessages = messages.slice(-3);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-teal-50 via-white to-cyan-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-400 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400 rounded-full blur-3xl" />
      </div>

      {/* HERO SECTION - Coach Kai Branding */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white shadow-2xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between gap-6">
            {/* Left: Avatar + Title */}
            <div className="flex items-center gap-4">
              <motion.div
                animate={{
                  scale: avatarState === 'speaking' ? [1, 1.1, 1] : avatarState === 'listening' ? [1, 1.05, 1] : 1
                }}
                transition={{ duration: 1, repeat: avatarState !== 'idle' ? Infinity : 0 }}
                className="relative"
              >
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-4 ring-white/30 shadow-xl">
                  <InteractiveAvatar state={avatarState} size="md" />
                </div>
                {avatarState !== 'idle' && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.7, 0.3, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-white/20 -z-10"
                  />
                )}
              </motion.div>
              
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-black tracking-tight">
                    COACH KAI
                  </h1>
                  <Badge className="bg-white/20 backdrop-blur-sm text-white border border-white/30 font-semibold px-3 py-1">
                    🎙️ VOICE ACTIVE
                  </Badge>
                </div>
                <p className="text-teal-100 font-medium text-sm">
                  Your AI Pickleball Coach • Walkie-Talkie Mode
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    avatarState === 'listening' ? 'bg-yellow-400/90 text-yellow-900' :
                    avatarState === 'thinking' ? 'bg-purple-400/90 text-purple-900' :
                    avatarState === 'speaking' ? 'bg-green-400/90 text-green-900' :
                    'bg-white/20 text-white'
                  }`}>
                    <Activity className="h-3 w-3" />
                    {avatarState === 'listening' ? '👂 Listening...' :
                     avatarState === 'thinking' ? '🤔 Thinking...' :
                     avatarState === 'speaking' ? '🗣️ Speaking...' :
                     '✓ Ready'}
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Session Stats */}
            <div className="hidden lg:flex items-center gap-4">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-xs font-medium opacity-80">Questions</span>
                </div>
                <p className="text-2xl font-bold">{sessionStats.questionsAsked}</p>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-medium opacity-80">Session</span>
                </div>
                <p className="text-2xl font-bold">{sessionStats.sessionTime}</p>
              </Card>
              <Button
                onClick={() => setShowVoiceSettings(true)}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              {isSpeaking && (
                <Button
                  onClick={interruptSpeech}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-red-400/20 border border-white/30"
                >
                  <VolumeX className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* PTT & INPUT SECTION - MOVED TO TOP FOR IMMEDIATE ACCESS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-2xl border-3 border-teal-200 overflow-hidden bg-gradient-to-br from-white to-teal-50">
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-6 py-4 border-b border-teal-100">
              <div className="flex items-center gap-2">
                <Mic className="h-6 w-6 text-white animate-pulse" />
                <h2 className="text-xl font-bold text-white">Ask Coach Kai Anything</h2>
                <Badge className="bg-white/20 backdrop-blur-sm text-white border border-white/30 ml-auto">
                  Voice + Text Ready
                </Badge>
              </div>
            </div>
            
            <div className="p-8 bg-white">
              {/* PTT Button - Large and Prominent */}
              <div className="flex flex-col items-center gap-4 mb-8">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full blur-xl opacity-50 animate-pulse" />
                  <PushToTalk
                    onTranscript={handlePTTVoiceInput}
                    disabled={isLoading || processingVoiceInput}
                    language={voicePreferences.language}
                    className="scale-125 relative z-10"
                  />
                </motion.div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900 mb-2 bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    Press & Hold to Talk
                  </p>
                  <p className="text-sm text-slate-600 flex items-center justify-center gap-1">
                    <Sparkles className="h-4 w-4 text-teal-500" />
                    Release when done • Coach Kai responds instantly
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gradient-to-r from-transparent via-slate-300 to-transparent" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-6 py-2 bg-white text-slate-500 font-bold text-sm rounded-full border-2 border-slate-200">
                    Or type your question below
                  </span>
                </div>
              </div>

              {/* Text Input - Large and Inviting */}
              <div className="flex gap-4">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your question for Coach Kai... (e.g., 'How can I improve my serve?')"
                  disabled={isLoading}
                  className="flex-1 min-h-[100px] text-lg resize-none border-3 border-slate-200 focus:border-teal-400 focus:ring-4 focus:ring-teal-400/20 rounded-2xl p-4 shadow-inner"
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="h-[100px] w-[100px] bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="h-10 w-10 animate-spin" />
                  ) : (
                    <Send className="h-10 w-10" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* LAST 3 CONVERSATIONS - STATIC DISPLAY */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-xl border-2 border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-teal-600" />
                <h2 className="text-lg font-bold text-slate-900">Last 3 Conversations</h2>
                <Badge variant="secondary" className="text-xs">
                  Latest
                </Badge>
              </div>
            </div>
            
            <div className="bg-white p-4 space-y-3">
              {isLoadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-teal-500 mr-2" />
                  <span className="text-slate-600 font-medium">Loading conversation...</span>
                </div>
              ) : displayMessages.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Brain className="h-16 w-16 mx-auto mb-3 opacity-30" />
                  <p className="text-lg font-semibold">Start a conversation!</p>
                  <p className="text-sm mt-1">Use voice or text above to ask Coach Kai anything</p>
                </div>
              ) : (
                <>
                  {displayMessages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-lg ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                          : 'bg-gradient-to-r from-slate-50 to-slate-100 text-slate-900 border-2 border-slate-200'
                      }`}>
                        {message.role === 'assistant' ? (
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-base">{message.content}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl px-5 py-3 border-2 border-slate-200">
                        <div className="flex items-center gap-3">
                          <Loader2 className="h-5 w-5 animate-spin text-teal-500" />
                          <span className="text-base text-slate-700 font-medium">Coach Kai is thinking...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </Card>
        </motion.div>

        {/* QUICK ACTION CARDS - PROMINENT COACHING BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 shadow-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              Quick Coaching Sessions
            </h2>
            <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-4 py-2 text-sm">
              Tap to Start
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[
              {
                title: 'Serve Analysis',
                prompt: 'Help me improve my serve technique. What should I focus on?',
                icon: Target,
                gradient: 'from-orange-400 via-red-400 to-rose-500',
                description: 'Perfect your serve motion'
              },
              {
                title: 'Footwork Tips',
                prompt: 'Give me tips for better footwork and court positioning',
                icon: Activity,
                gradient: 'from-blue-400 via-indigo-400 to-purple-500',
                description: 'Master court movement'
              },
              {
                title: 'Dinking Skills',
                prompt: 'How can I improve my dinking game and soft shots?',
                icon: Brain,
                gradient: 'from-purple-400 via-pink-400 to-rose-500',
                description: 'Control the kitchen'
              },
              {
                title: 'Mental Preparedness',
                prompt: 'Help me develop mental toughness and focus for competitive play',
                icon: Lightbulb,
                gradient: 'from-amber-400 via-yellow-400 to-orange-500',
                description: 'Strengthen your mindset',
                isMental: true
              },
              {
                title: 'Tournament Prep',
                prompt: 'Help me prepare strategically for my next tournament',
                icon: Trophy,
                gradient: 'from-yellow-400 via-amber-400 to-orange-500',
                description: 'Game day strategies'
              },
              {
                title: 'Practice Drills',
                prompt: 'Show me effective practice drills for improving consistency',
                icon: Dumbbell,
                gradient: 'from-teal-400 via-cyan-400 to-blue-500',
                description: 'Build muscle memory'
              },
              {
                title: 'Review Progress',
                prompt: 'Review my recent progress and suggest areas for improvement',
                icon: TrendingUp,
                gradient: 'from-green-400 via-emerald-400 to-teal-500',
                description: 'Track your growth'
              }
            ].map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.05, type: "spring", stiffness: 100 }}
                whileHover={{ scale: 1.05, y: -5, rotate: action.isMental ? [0, -2, 2, 0] : 0 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  className={`cursor-pointer group hover:shadow-2xl transition-all duration-300 border-3 ${
                    action.isMental 
                      ? 'border-amber-300 ring-4 ring-amber-200/50' 
                      : 'border-slate-200 hover:border-teal-300'
                  } h-full overflow-hidden relative`}
                  onClick={() => !isLoading && handleSendMessage(action.prompt)}
                >
                  {action.isMental && (
                    <motion.div
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-gradient-to-br from-amber-100 to-yellow-100 -z-10"
                    />
                  )}
                  <div className={`h-3 bg-gradient-to-r ${action.gradient} shadow-md`} />
                  <div className="p-5 bg-white relative">
                    <div className="flex items-start gap-3 mb-3">
                      <motion.div 
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className={`p-3 rounded-2xl bg-gradient-to-r ${action.gradient} text-white shadow-xl group-hover:shadow-2xl`}
                      >
                        <action.icon className="h-7 w-7" />
                      </motion.div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-teal-700 transition-colors mb-1">
                          {action.title}
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed">{action.description}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className={`w-full ${
                        action.isMental 
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' 
                          : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600'
                      } text-white shadow-lg group-hover:shadow-xl font-semibold`}
                      disabled={isLoading}
                    >
                      {action.isMental ? (
                        <>
                          <Sparkles className="h-4 w-4 mr-1" />
                          Mental Focus
                        </>
                      ) : (
                        <>
                          Start Now
                          <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>



        {/* NAVIGATION & RESOURCES - ENHANCED CARDS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 shadow-lg">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Training Resources</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <motion.div
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href="/train/video">
                <Card className="p-6 border-2 border-slate-200 hover:border-teal-300 hover:shadow-xl transition-all cursor-pointer h-full group bg-gradient-to-br from-white to-teal-50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">
                      <Video className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-teal-700 transition-colors">
                      Video Analysis
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    Upload videos for AI-powered technique breakdown and personalized feedback
                  </p>
                  <Button size="sm" className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-md">
                    Upload Video
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Card>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href="/train/drills">
                <Card className="p-6 border-2 border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all cursor-pointer h-full group bg-gradient-to-br from-white to-blue-50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">
                      <Dumbbell className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-700 transition-colors">
                      Practice Drills
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    Browse structured drills designed to improve specific aspects of your game
                  </p>
                  <Button size="sm" className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md">
                    View Drills
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Card>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03, y: -3 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href="/progress">
                <Card className="p-6 border-2 border-slate-200 hover:border-green-300 hover:shadow-xl transition-all cursor-pointer h-full group bg-gradient-to-br from-white to-green-50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">
                      <BarChart className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 group-hover:text-green-700 transition-colors">
                      Track Progress
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                    Monitor your improvement journey with detailed stats and analytics
                  </p>
                  <Button size="sm" className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md">
                    View Stats
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Card>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Session Topics - Enhanced Visual */}
        {sessionStats.topicsDiscussed.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6 bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 border-2 border-teal-200 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 shadow-lg">
                  <Lightbulb className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Topics Covered This Session</h3>
                <Badge className="ml-auto bg-white text-teal-700 border border-teal-300 font-semibold">
                  {sessionStats.topicsDiscussed.size} Topics
                </Badge>
              </div>
              <div className="flex flex-wrap gap-3">
                {Array.from(sessionStats.topicsDiscussed).map((topic, index) => (
                  <motion.div
                    key={topic}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <Badge className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0 px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all">
                      ✓ {topic}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Voice Settings Modal */}
      <VoiceSettingsModal
        isOpen={showVoiceSettings}
        onClose={() => setShowVoiceSettings(false)}
        currentSettings={voicePreferences}
        onSettingsChange={handleVoiceSettingsChange}
      />

      {/* TTS Component */}
      <TextToSpeech
        text={lastAssistantMessage}
        messageId={lastAssistantMessageId}
        rate={voicePreferences.rate}
        pitch={voicePreferences.pitch}
        volume={voicePreferences.volume}
        autoPlay={true}
        onStart={() => console.log('🔊 Coach Kai started speaking')}
        onEnd={() => console.log('🔇 Coach Kai finished speaking')}
        onSpeakingChange={handleSpeakingChange}
      />
    </div>
  );
}