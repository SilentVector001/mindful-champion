
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles, Target, Zap, TrendingUp, Settings, ArrowRight, Brain, Trophy, Video, BookOpen, BarChart, Users, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import InteractiveAvatar from '@/components/avatar/interactive-avatar';
import VoiceSettingsModal, { VoicePreferences } from '@/components/voice/voice-settings-modal';
import TextToSpeech from '@/components/voice/text-to-speech';
import EnhancedSpeechToText from '@/components/voice/enhanced-speech-to-text';
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
  
  message += `What would you like to work on? I can help with:\n• 🎯 Technique & drills\n• 📊 Performance analysis\n• 🧠 Mental game strategies\n• 📹 Video analysis\n• 🏆 Tournament prep\n\nWhat's on your mind?`;
  
  return message;
};

interface EnhancedAICoachProps {
  userContext?: UserContext;
}

// v2.1 - Fixed response repetition + Enhanced VAD
export default function EnhancedAICoach({ userContext }: EnhancedAICoachProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  
  // Voice-related state with better management
  const [voicePreferences, setVoicePreferences] = useState<VoicePreferences>(defaultVoicePreferences);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [lastAssistantMessage, setLastAssistantMessage] = useState<string>('');
  
  // FIX: Better state management to prevent duplicates
  const [processingVoiceInput, setProcessingVoiceInput] = useState(false);
  const [lastProcessedMessageId, setLastProcessedMessageId] = useState<string>('');
  const [pendingResponse, setPendingResponse] = useState(false);
  
  // Mental Training Panel state
  const [showMentalPanel, setShowMentalPanel] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isInitialMountRef = useRef(true); // Track if it's the initial mount to prevent auto-scroll
  const hasUserInteractedRef = useRef(false); // Only scroll after user sends their first message

  // Load conversation history on mount
  useEffect(() => {
    const loadConversationHistory = async () => {
      try {
        const response = await fetch('/api/ai-coach/conversation-history');
        if (response.ok) {
          const data = await response.json();
          if (data.conversation?.messages && data.conversation.messages.length > 0) {
            // Convert API messages to local Message format
            const loadedMessages: Message[] = data.conversation.messages.map((msg: any) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              timestamp: new Date(msg.createdAt)
            }));
            setMessages(loadedMessages);
          } else {
            // No previous conversation - show personalized welcome
            setMessages([{
              id: '1',
              role: 'assistant',
              content: getPersonalizedWelcome(userContext),
              timestamp: new Date()
            }]);
          }
        } else {
          // If fetch fails, show default welcome message
          setMessages([{
            id: '1',
            role: 'assistant',
            content: getPersonalizedWelcome(userContext),
            timestamp: new Date()
          }]);
        }
      } catch (error) {
        console.error('Error loading conversation history:', error);
        setMessages([{
          id: '1',
          role: 'assistant',
          content: getPersonalizedWelcome(userContext),
          timestamp: new Date()
        }]);
      }
      setIsLoadingHistory(false);
    };

    loadConversationHistory();
  }, [userContext]);

  // Auto-scroll to latest message - but ONLY after user sends their first message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Skip auto-scroll on initial mount
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }
    
    // Only scroll if user has interacted with the chat
    if (hasUserInteractedRef.current && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Update avatar state based on voice activity
  useEffect(() => {
    if (isListening) {
      setAvatarState('listening');
    } else if (isSpeaking) {
      setAvatarState('speaking');
    } else if (isLoading) {
      setAvatarState('thinking');
    } else {
      setAvatarState('idle');
    }
  }, [isListening, isSpeaking, isLoading]);

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

  // FIXED: Handle voice input with duplicate prevention
  const handleVoiceInput = useCallback((text: string) => {
    if (processingVoiceInput || isLoading || pendingResponse) {
      console.log('🚫 Voice input blocked: already processing');
      return;
    }

    if (text.trim()) {
      console.log('🎤 Processing voice input:', text);
      
      // Stop any speaking immediately when user starts talking
      if (isSpeaking && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      
      setProcessingVoiceInput(true);
      
      // Send message immediately (no manual clicking needed)
      handleSendMessage(text).finally(() => {
        // Add delay before allowing next voice input
        setTimeout(() => {
          setProcessingVoiceInput(false);
        }, 2000);
      });
    }
  }, [processingVoiceInput, isLoading, pendingResponse, isSpeaking]);

  // Handle listening state change
  const handleListeningChange = useCallback((listening: boolean) => {
    setIsListening(listening);
  }, []);

  // FIXED: Handle speaking state change with better management
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

  // FIXED: Improved message sending with duplicate prevention
  const handleSendMessage = async (messageContent?: string) => {
    const textToSend = messageContent || input.trim();
    if (!textToSend || isLoading || pendingResponse) return;

    // Enable auto-scroll after first user interaction
    hasUserInteractedRef.current = true;

    // Create unique message ID based on content and timestamp
    const messageId = `${Date.now()}_${textToSend.slice(0, 10)}`;
    
    // Check if we already processed this exact message recently
    if (lastProcessedMessageId === messageId) {
      console.log('🚫 Duplicate message blocked:', textToSend);
      return;
    }

    setLastProcessedMessageId(messageId);
    setPendingResponse(true);

    const userMessage: Message = {
      id: messageId,
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setAvatarState('thinking');

    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      // Build context-rich message for AI
      const contextMessage = {
        role: 'system',
        content: `User context: ${userContext?.firstName || 'User'} is a ${userContext?.skillLevel || 'beginner'} level player${
          userContext?.playerRating ? ` with rating ${userContext.playerRating}` : ''
        }. ${userContext?.primaryGoals ? `Their goals: ${userContext.primaryGoals.join(', ')}.` : ''} ${
          userContext?.biggestChallenges ? `Challenges: ${userContext.biggestChallenges.join(', ')}.` : ''
        } You have access to features: Drill Library, Video Analysis, Progress Tracking, Partner Matching, Tournaments. Guide users to these when relevant.`
      };

      const response = await fetch('/api/ai-coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [contextMessage, ...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.message) {
        throw new Error('No response from Coach Kai');
      }

      // Parse content for quick actions
      const { content, actions } = parseQuickActions(data.message);

      const assistantMessage: Message = {
        id: `${Date.now()}_assistant`,
        role: 'assistant',
        content: content,
        timestamp: new Date(),
        quickActions: actions.length > 0 ? actions : undefined
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // FIXED: Only update and trigger TTS for NEW messages
      if (content !== lastAssistantMessage) {
        setLastAssistantMessage(content);
        
        // Auto-speak response if enabled
        if (voicePreferences.textToSpeechEnabled && voicePreferences.autoSpeak && !isListening) {
          // Small delay to prevent conflicts
          setTimeout(() => {
            setIsSpeaking(true);
          }, 500);
        }
      }

    } catch (error: any) {
      // Don't show error if request was aborted
      if (error.name === 'AbortError') {
        console.log('Request aborted (normal)');
        return;
      }
      
      console.error('Coach Kai error:', error);
      
      setMessages(prev => {
        const withoutLast = prev.slice(0, -1);
        return [
          ...withoutLast,
          userMessage,
          {
            id: `${Date.now()}_error`,
            role: 'assistant',
            content: "Hey, I'm having a bit of trouble connecting right now. Could you try that again? 🔄",
            timestamp: new Date()
          }
        ];
      });
    } finally {
      setIsLoading(false);
      setAvatarState('idle');
      setPendingResponse(false);
      
      // Don't auto-focus on mobile as it causes keyboard to pop up unexpectedly
      if (window.innerWidth > 640) {
        inputRef.current?.focus();
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedPrompts = [
    { icon: Target, text: "Show me drills for my skill level", color: "from-emerald-500 to-teal-600" },
    { icon: Brain, text: "Help me with my mental game", color: "from-blue-500 to-indigo-600" },
    { icon: TrendingUp, text: "Review my progress this week", color: "from-purple-500 to-pink-600" },
    { icon: Video, text: "How do I analyze my serve?", color: "from-orange-500 to-red-500" },
    { icon: Trophy, text: "Prepare me for tournaments", color: "from-yellow-500 to-amber-600" }
  ];

  if (isLoadingHistory) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your conversation with Coach Kai...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full" onTouchStart={interruptSpeech} onClick={interruptSpeech}>
      {/* Speaking Indicator */}
      <AnimatePresence>
        {isSpeaking && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between touch-none cursor-pointer"
            onClick={interruptSpeech}
            onTouchStart={interruptSpeech}
          >
            <span className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-pulse" />
              Coach Kai is speaking...
            </span>
            <span className="text-xs opacity-90">Tap to interrupt</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Version Indicator */}
      <div className="mb-2 text-xs text-gray-400 text-right">v2.1 - Enhanced VAD + Response Fix</div>
      
      {/* Header with User Context */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className={`relative p-1 rounded-full transition-all ${
            avatarState === 'thinking' ? 'ring-2 ring-orange-400' :
            avatarState === 'speaking' ? 'ring-2 ring-emerald-400' :
            avatarState === 'listening' ? 'ring-2 ring-blue-400' :
            'ring-1 ring-gray-200'
          }`}>
            <InteractiveAvatar
              state={avatarState}
              size="lg"
              showStatusIndicator={true}
            />
          </div>
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Coach Kai - AI Coaching Session</h2>
            <p className="text-sm sm:text-base text-gray-600">Natural voice conversation with auto-pause detection</p>
            {userContext?.skillLevel && (
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {userContext.skillLevel.charAt(0).toUpperCase() + userContext.skillLevel.slice(1)}
                </Badge>
                {userContext.playerRating && (
                  <Badge variant="secondary" className="text-xs">
                    Rating: {userContext.playerRating}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowMentalPanel(!showMentalPanel)}
            onTouchStart={(e) => e.stopPropagation()}
            className="flex items-center gap-2 min-h-[44px] flex-1 sm:flex-none active:scale-95 transition-transform"
          >
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">{showMentalPanel ? 'Hide' : 'Show'} Mental Training</span>
            <span className="sm:hidden">Mental</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowVoiceSettings(true)}
            onTouchStart={(e) => e.stopPropagation()}
            className="flex items-center gap-2 min-h-[44px] flex-1 sm:flex-none active:scale-95 transition-transform"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Voice Settings</span>
            <span className="sm:hidden">Voice</span>
          </Button>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className={`grid gap-6 ${showMentalPanel ? 'lg:grid-cols-[1fr_400px]' : 'grid-cols-1'} transition-all`}>
        {/* Chat Interface - Floating Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-white/95 backdrop-blur-xl border shadow-2xl hover:shadow-3xl transition-shadow duration-300 rounded-2xl overflow-hidden">
          {/* Messages */}
          <ScrollArea className="h-[500px] p-6" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className="space-y-2">
                  <div
                    className={`max-w-[85%] rounded-2xl px-6 py-3 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className={`text-sm prose prose-sm max-w-none ${
                      message.role === 'user' 
                        ? 'prose-invert prose-headings:text-white prose-p:text-white prose-strong:text-white prose-ul:text-white prose-ol:text-white prose-li:text-white' 
                        : 'prose-headings:text-gray-900 prose-p:text-gray-900 prose-strong:text-gray-900 prose-ul:text-gray-900 prose-ol:text-gray-900'
                    }`}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  {message.quickActions && message.quickActions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {message.quickActions.map((action, idx) => (
                        <Button
                          key={idx}
                          variant={action.variant || "outline"}
                          size="sm"
                          onClick={action.action}
                          onTouchStart={(e) => e.stopPropagation()}
                          className="text-xs flex items-center gap-1 min-h-[40px] active:scale-95 transition-transform"
                        >
                          <action.icon className="w-3 h-3" />
                          {action.label}
                        </Button>
                      ))}
                    </div>
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
                <div className="bg-gray-100 rounded-2xl px-6 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span className="text-sm text-gray-600">
                      Coach Kai is thinking...
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Suggested Prompts */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50/50">
          <p className="text-sm text-gray-600 mb-3">💡 Try asking me about:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => setInput(prompt.text)}
                onTouchStart={(e) => e.stopPropagation()}
                disabled={isLoading || processingVoiceInput}
                className="text-xs sm:text-xs whitespace-nowrap flex items-center gap-1 hover:bg-gradient-to-r hover:text-white transition-all min-h-[40px] active:scale-95"
              >
                <prompt.icon className="w-3 h-3" />
                <span className="truncate max-w-[150px] sm:max-w-none">{prompt.text}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 sm:p-6 border-t border-gray-200">
          <div className="flex gap-2 sm:gap-3 items-end">
            <div className="flex-1 relative">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={interruptSpeech}
                onTouchStart={(e) => {
                  // Stop propagation to prevent parent touch handlers
                  e.stopPropagation();
                  interruptSpeech();
                }}
                placeholder="Type your question or use the microphone..."
                className={`resize-none min-h-[56px] sm:min-h-[50px] max-h-[120px] transition-all duration-300 text-base ${
                  isListening 
                    ? 'ring-2 ring-blue-500 border-blue-500 focus:ring-blue-600' 
                    : isSpeaking 
                    ? 'ring-2 ring-emerald-500 border-emerald-500 focus:ring-emerald-600' 
                    : isLoading 
                    ? 'ring-2 ring-amber-500 border-amber-500 focus:ring-amber-600' 
                    : ''
                }`}
                disabled={isLoading || processingVoiceInput}
                rows={2}
                style={{
                  WebkitAppearance: 'none',
                  fontSize: '16px', // Prevent iOS zoom on focus
                }}
              />
              
              {/* Processing State Indicator */}
              <AnimatePresence>
                {(isSpeaking || isListening || isLoading || processingVoiceInput) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute -top-6 left-0 text-xs font-medium flex items-center gap-1.5"
                  >
                    {processingVoiceInput && (
                      <>
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        <span className="text-orange-600">Processing voice...</span>
                      </>
                    )}
                    {!processingVoiceInput && isSpeaking && (
                      <>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-emerald-600">Coach speaking...</span>
                      </>
                    )}
                    {!processingVoiceInput && !isSpeaking && isListening && (
                      <>
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-blue-600">Listening...</span>
                      </>
                    )}
                    {!processingVoiceInput && !isSpeaking && !isListening && isLoading && (
                      <>
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-amber-600">Processing...</span>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Voice Controls - ENHANCED */}
            <div className="flex gap-2 items-center">
              <div 
                onClick={interruptSpeech} 
                onTouchStart={(e) => {
                  e.stopPropagation();
                  interruptSpeech();
                }}
                className="flex items-center"
              >
                <EnhancedSpeechToText
                  onTranscript={handleVoiceInput}
                  onListeningChange={handleListeningChange}
                  disabled={isLoading || processingVoiceInput}
                  language={voicePreferences.language}
                  pauseThreshold={1500}
                />
              </div>

              <Button
                onClick={() => handleSendMessage()}
                onTouchStart={(e) => e.stopPropagation()}
                disabled={!input.trim() || isLoading || processingVoiceInput}
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 h-[56px] sm:h-[50px] px-5 sm:px-6 min-w-[56px] sm:min-w-[50px] active:scale-95 transition-transform"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5 sm:w-5 sm:h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
        </Card>
        </motion.div>

        {/* Mental Training Panel - Floating Card */}
        <AnimatePresence>
          {showMentalPanel && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="lg:sticky lg:top-6 h-fit"
            >
              <Card className="bg-gradient-to-br from-white via-purple-50/30 to-white backdrop-blur-xl border border-purple-100 shadow-2xl hover:shadow-3xl transition-shadow duration-300 rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Mental Training
                  </h3>
                  <p className="text-white/80 text-sm mt-1">Master the mind game</p>
                </div>
                <ScrollArea className="h-[500px] p-6">
                  <MentalTrainingPrompts 
                    onPromptSelect={(prompt) => {
                      setInput(prompt);
                      // Auto-focus the input after selecting a prompt (only on desktop)
                      if (window.innerWidth > 640) {
                        setTimeout(() => inputRef.current?.focus(), 100);
                      }
                    }}
                  />
                </ScrollArea>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hidden Text-to-Speech for auto-speak */}
      {voicePreferences.textToSpeechEnabled && lastAssistantMessage && (
        <TextToSpeech
          text={lastAssistantMessage}
          rate={voicePreferences.rate}
          pitch={voicePreferences.pitch}
          volume={voicePreferences.volume}
          autoPlay={voicePreferences.autoSpeak && !isListening && !processingVoiceInput}
          onSpeakingChange={handleSpeakingChange}
          className="hidden"
        />
      )}

      {/* Voice Settings Modal */}
      <VoiceSettingsModal
        isOpen={showVoiceSettings}
        onClose={() => setShowVoiceSettings(false)}
        currentSettings={voicePreferences}
        onSettingsChange={handleVoiceSettingsChange}
      />
    </div>
  );
}
