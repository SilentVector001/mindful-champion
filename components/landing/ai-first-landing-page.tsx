
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles, Target, Zap, TrendingUp, Mic, Settings, Trophy, ArrowRight, Menu, X, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import InteractiveAvatar from '@/components/avatar/interactive-avatar';
import VoiceChatControls from '@/components/voice/voice-chat-controls';
import VoiceSettingsModal, { VoicePreferences } from '@/components/voice/voice-settings-modal';
import TextToSpeech from '@/components/voice/text-to-speech';
import SpeechToText from '@/components/voice/speech-to-text';
import FeatureShowcase from '@/components/features/feature-showcase';
import HeroVideo from '@/components/landing/hero-video';
import FeatureInfoModal, { FeatureInfo } from '@/components/landing/feature-info-modal';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking';

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

const getWelcomeMessage = (userName?: string) => {
  if (userName) {
    return `👋 Welcome back, ${userName}! I'm Coach Kai, your AI pickleball companion with voice support! 🎤\n\nLet's continue where we left off. What would you like to work on today? 🔥`;
  }
  return `👋 Hey there! I'm Coach Kai, your AI pickleball companion with voice support! 🎤\n\nI'm here to help you level up your game, answer questions, and keep you motivated. Ready to start your journey?`;
};

export default function AIFirstLandingPage() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
  const [continuousMode, setContinuousMode] = useState(false);
  
  // Feature modal state
  const [selectedFeature, setSelectedFeature] = useState<FeatureInfo | null>(null);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialLoadRef = useRef(true); // Track if it's the initial page load
  const hasLoadedHistoryRef = useRef(false); // Track if history has been loaded

  // FIX: Force scroll to top on component mount to prevent unwanted scrolling
  useEffect(() => {
    // Ensure page always starts at the top
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
      // Also set scroll restoration to manual to prevent browser auto-scrolling
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
    }
  }, []);

  // Load conversation history on mount
  useEffect(() => {
    const loadConversationHistory = async () => {
      if (session?.user) {
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
              // No previous conversation - show welcome message
              const userName = session.user.name?.split(' ')[0] || session.user.email?.split('@')[0];
              setMessages([{
                id: '1',
                role: 'assistant',
                content: getWelcomeMessage(userName),
                timestamp: new Date()
              }]);
            }
          } else {
            // If fetch fails, show default welcome message
            const userName = session.user.name?.split(' ')[0] || session.user.email?.split('@')[0];
            setMessages([{
              id: '1',
              role: 'assistant',
              content: getWelcomeMessage(userName),
              timestamp: new Date()
            }]);
          }
        } catch (error) {
          console.error('Error loading conversation history:', error);
          // Show default welcome message on error
          const userName = session?.user?.name?.split(' ')[0] || session?.user?.email?.split('@')[0];
          setMessages([{
            id: '1',
            role: 'assistant',
            content: getWelcomeMessage(userName),
            timestamp: new Date()
          }]);
        }
      } else {
        // Not authenticated - show default welcome message
        setMessages([{
          id: '1',
          role: 'assistant',
          content: getWelcomeMessage(),
          timestamp: new Date()
        }]);
      }
      setIsLoadingHistory(false);
      hasLoadedHistoryRef.current = true; // Mark history as loaded
    };

    loadConversationHistory();
  }, [session]);

  // Auto-scroll to latest message - but ONLY for actual new messages (not on page load)
  const scrollToBottom = (force: boolean = false) => {
    // FIXED: Only scroll the INTERNAL chat container, never the page itself
    if (force && scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        // Use requestAnimationFrame to ensure smooth scrolling without affecting page scroll
        requestAnimationFrame(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        });
      }
    }
  };

  useEffect(() => {
    // NEVER auto-scroll on page load or history load
    // Only scroll when a NEW message is actually sent (triggered manually from handleSendMessage)
    if (isInitialLoadRef.current || !hasLoadedHistoryRef.current) {
      isInitialLoadRef.current = false;
      return;
    }
    // Removed automatic scroll here - will be triggered manually only when needed
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

  // Handle voice input - AUTO-SEND IMMEDIATELY
  const handleVoiceInput = useCallback((text: string) => {
    if (text.trim()) {
      // Stop any speaking immediately when user starts talking
      if (isSpeaking && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      
      // Send message immediately (no manual clicking needed)
      handleSendMessage(text);
    }
  }, [isSpeaking]);

  // Handle listening state change
  const handleListeningChange = useCallback((listening: boolean) => {
    setIsListening(listening);
  }, []);

  // Handle speaking state change
  const handleSpeakingChange = useCallback((speaking: boolean) => {
    setIsSpeaking(speaking);
    
    // When Coach Kai finishes speaking, auto-start listening in continuous mode
    if (!speaking && continuousMode && !isLoading) {
      // Wait 500ms then start listening again
      setTimeout(() => {
        // Trigger the microphone button programmatically
        const micButtons = document.querySelectorAll('[title*="Click to speak"]');
        if (micButtons.length > 0) {
          (micButtons[0] as HTMLButtonElement).click();
        }
      }, 500);
    }
  }, [continuousMode, isLoading]);

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

  // Handle feature modal
  const handleFeatureClick = useCallback((feature: FeatureInfo) => {
    setSelectedFeature(feature);
    setShowFeatureModal(true);
  }, []);

  const handleSendMessage = async (messageContent?: string) => {
    const textToSend = messageContent || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setAvatarState('thinking');

    // Scroll to show the user's message
    setTimeout(() => scrollToBottom(true), 100);

    // Save user message to history if authenticated
    if (session?.user) {
      try {
        await fetch('/api/ai-coach/conversation-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: 'user',
            content: textToSend
          })
        });
      } catch (error) {
        console.error('Error saving user message:', error);
      }
    }

    try {
      const response = await fetch('/api/ai-coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.message) {
        throw new Error('No response from Coach Kai');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setLastAssistantMessage(data.message);

      // Scroll to the new message after a brief delay to ensure rendering
      setTimeout(() => scrollToBottom(true), 100);

      // Save assistant message to history if authenticated
      if (session?.user) {
        try {
          await fetch('/api/ai-coach/conversation-history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              role: 'assistant',
              content: data.message
            })
          });
        } catch (error) {
          console.error('Error saving assistant message:', error);
        }
      }

      // Auto-speak response if enabled
      if (voicePreferences.textToSpeechEnabled && voicePreferences.autoSpeak && !isListening) {
        setIsSpeaking(true);
      }
    } catch (error) {
      console.error('Coach Kai error:', error);
      
      setMessages(prev => {
        const withoutLast = prev.slice(0, -1);
        return [
          ...withoutLast,
          userMessage,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: "Hey, I'm having a bit of trouble connecting right now. Could you try that again? 🔄",
            timestamp: new Date()
          }
        ];
      });

      // Scroll to show the error message
      setTimeout(() => scrollToBottom(true), 100);
    } finally {
      setIsLoading(false);
      setAvatarState('idle');
      // REMOVED: inputRef.current?.focus(); - Causes unwanted auto-scroll on landing page
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedPrompts = [
    { icon: Target, text: "Show me beginner drills", color: "from-emerald-500 to-teal-600" },
    { icon: Brain, text: "Analyze my serve technique", color: "from-blue-500 to-indigo-600" },
    { icon: TrendingUp, text: "Create a training plan for me", color: "from-purple-500 to-pink-600" },
    { icon: Sparkles, text: "What should I work on today?", color: "from-orange-500 to-red-500" },
    { icon: Zap, text: "Help me improve my dinking", color: "from-yellow-500 to-amber-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50/80 to-blue-50 dark:from-gray-900 dark:via-emerald-900/10 dark:to-gray-900">
      {/* Navigation - iOS Safari Compatible with Safe Area Support */}
      <nav className="sticky top-0 left-0 right-0 z-[100] backdrop-blur-lg bg-white/95 dark:bg-slate-900/95 border-b border-gray-200 dark:border-slate-800 shadow-sm ios-safe-area-top"
        style={{
          WebkitBackdropFilter: 'blur(12px)',
          WebkitTransform: 'translate3d(0,0,0)', // Force hardware acceleration on iOS
          transform: 'translate3d(0,0,0)',
          willChange: 'transform' // Optimize for iOS rendering
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
                <Trophy className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <span className="text-gray-900 dark:text-white font-bold text-base md:text-xl">Mindful Champion</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Features
              </Link>
              <Link href="#training" className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Training
              </Link>
              <Link href="#community" className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Community
              </Link>
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg">
                  Start Free Trial
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-900 dark:text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - iOS Compatible */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg z-[101]"
            style={{
              WebkitBackdropFilter: 'blur(12px)',
              WebkitTransform: 'translate3d(0,0,0)',
              transform: 'translate3d(0,0,0)'
            }}
          >
            <div className="px-6 py-8 space-y-4">
              <Link href="#features" className="block text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 py-3 text-lg" onClick={() => setMobileMenuOpen(false)}>
                Features
              </Link>
              <Link href="#training" className="block text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 py-3 text-lg" onClick={() => setMobileMenuOpen(false)}>
                Training
              </Link>
              <Link href="#community" className="block text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 py-3 text-lg" onClick={() => setMobileMenuOpen(false)}>
                Community
              </Link>
              <div className="pt-4 space-y-3">
                <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full h-12 text-base">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white h-12 text-base shadow-lg">
                    Start Free Trial
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Video Section - REMOVED PER USER REQUEST */}
      {/* <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative w-full" style={{ height: '60vh', minHeight: '400px', maxHeight: '800px' }}>
            <HeroVideo />
          </div>
        </div>
      </div> */}

      {/* Speaking Indicator - Tap to Interrupt */}
      <AnimatePresence>
        {isSpeaking && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-0 right-0 z-50 mx-auto max-w-2xl"
          >
            <div className="mx-4 mt-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-pulse" />
                Coach Kai is speaking...
              </span>
              <span className="text-xs opacity-90">Tap anywhere to interrupt</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feature Showcase Section */}
      <div className="pt-8">
        <FeatureShowcase />
      </div>

      {/* Main Hero Section with Coach Kai */}
      <div className="pt-8">
        <div className="min-h-[60vh] flex flex-col" onClick={interruptSpeech}>
          <div className="flex-1 max-w-7xl mx-auto px-4 py-8 lg:py-12">
            {/* Hero Header - Fixed spacing to prevent text overlap */}
            <div className="text-center mb-8 lg:mb-12 space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className={`relative p-1 rounded-full transition-all ${
                    avatarState === 'thinking' ? 'ring-2 ring-orange-400' :
                    avatarState === 'speaking' ? 'ring-2 ring-emerald-400' :
                    avatarState === 'listening' ? 'ring-2 ring-blue-400' :
                    'ring-1 ring-gray-200'
                  }`}>
                    <InteractiveAvatar
                      state={avatarState}
                      size="xl"
                      showStatusIndicator={true}
                    />
                  </div>
                </div>
                <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                  Meet <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Coach Kai</span>
                </h1>
                <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                  Your Complete Pickleball Ecosystem - Training, Analysis, Community & Live Tournaments 🏓
                </p>
                <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                  AI-powered video analysis, 7 structured training programs, live tournament streaming, partner matching, progress tracking, and 24/7 coaching with Coach Kai
                </p>
              </motion.div>
            </div>

            {/* Coach Kai Chat Interface */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border shadow-xl">
                {/* Chat Messages */}
                <ScrollArea className="h-[400px] lg:h-[500px] p-6" ref={scrollRef}>
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-6 py-3 ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                          }`}
                        >
                          <p className="text-sm lg:text-base whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </motion.div>
                    ))}

                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                      >
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-6 py-3">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Coach Kai is thinking...
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Suggested Prompts - DISABLED ON LANDING PAGE */}
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 text-center">💡 Coach Kai can help you with:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {suggestedPrompts.map((prompt, idx) => (
                      <div
                        key={idx}
                        className="text-xs whitespace-nowrap flex items-center gap-1 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                      >
                        <prompt.icon className="w-3 h-3" />
                        {prompt.text}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Input Area - DISABLED ON LANDING PAGE (Preview Only) */}
                <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-teal-50 dark:from-gray-800 dark:to-gray-700">
                  <div className="text-center py-4">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      <Sparkles className="w-4 h-4 inline mr-1" />
                      This is a preview of Coach Kai
                    </p>
                    <Link href="/auth/signup">
                      <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg px-8">
                        <Sparkles className="w-5 h-5 mr-2" />
                        Sign Up to Chat with Coach Kai
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Sign Up CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mt-8 lg:mt-12"
            >
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Ready to access the complete pickleball ecosystem?
              </p>
              <Link href="/auth/signup">
                <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg px-8">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Join Mindful Champion - Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                Access all features: Video Analysis, Training Programs, Live Tournaments, Coach Kai & More
              </p>
            </motion.div>
          </div>
        </div>

        {/* Key Benefits Section */}
        <div className="bg-gradient-to-b from-emerald-50 to-white dark:from-gray-800 dark:to-gray-900 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Why Champions Choose Mindful Champion
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Join thousands of players who've transformed their game with our AI-powered coaching platform
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {[
                {
                  icon: "🚀",
                  title: "Improve 3x Faster",
                  description: "AI-powered insights and personalized coaching accelerate your learning curve",
                  highlight: "3x Faster Results"
                },
                {
                  icon: "🎯",
                  title: "Personalized Training",
                  description: "Every drill, tip, and strategy is customized to your skill level and goals",
                  highlight: "100% Personalized"
                },
                {
                  icon: "📈",
                  title: "Track Real Progress",
                  description: "Data-driven insights show exactly where you're improving and what to focus on next",
                  highlight: "Real-Time Analytics"
                }
              ].map((benefit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="text-3xl mb-4">{benefit.icon}</div>
                  <div className="inline-block bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                    {benefit.highlight}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Complete Training Ecosystem - WITH IMAGERY */}
        <div id="features" className="bg-white dark:bg-gray-900 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Your Complete Pickleball Ecosystem
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Everything from live tournament streaming and AI coaching to structured training programs and community connections
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Brain,
                  title: "AI Video Analysis",
                  description: "Upload match footage for instant technique analysis, form corrections, and personalized improvement recommendations",
                  color: "from-blue-500 to-indigo-600",
                  image: "/video-analysis.jpg",
                  redirectUrl: "/train/video",
                  benefits: [
                    "AI-powered pose detection analyzes your form in real-time",
                    "Get specific recommendations for technique improvements",
                    "Track your progress across multiple video sessions",
                    "Compare your form to professional players",
                    "Frame-by-frame breakdown with visual overlays",
                    "Downloadable PDF reports for your coach"
                  ],
                  details: [
                    "Upload videos up to 10 minutes",
                    "Frame-by-frame analysis",
                    "Shot detection & categorization",
                    "Body position tracking",
                    "Instant feedback reports",
                    "Export analysis for coaches"
                  ]
                },
                {
                  icon: Target,
                  title: "7 Structured Training Programs",
                  description: "Follow day-by-day training programs designed for your skill level, from beginner basics to pro-level mastery",
                  color: "from-emerald-500 to-teal-600",
                  image: "/drill-library.jpg",
                  redirectUrl: "/train",
                  benefits: [
                    "7 complete programs: Beginner to Pro level",
                    "Day-by-day structured workouts with clear objectives",
                    "Video demonstrations and technique tutorials",
                    "Progress tracking for each program",
                    "Coach Kai provides daily tips and adjustments",
                    "Earn completion badges and achievements"
                  ],
                  details: [
                    "Beginner Fundamentals (14 days)",
                    "Intermediate Mastery (21 days)",
                    "Advanced Techniques (28 days)",
                    "Pro-level Competition Prep",
                    "200+ professional drills",
                    "Customizable difficulty"
                  ]
                },
                {
                  icon: Trophy,
                  title: "Live Tournament Hub",
                  description: "Watch live pickleball tournaments, track scores, discover events, and access streaming platforms all in one place",
                  color: "from-red-500 to-pink-600",
                  image: "/tournament.jpg",
                  redirectUrl: "/media",
                  benefits: [
                    "Live streams from PPA Tour, MLP, and APP Tour",
                    "Real-time match scores and tournament brackets",
                    "Discover upcoming tournaments and events",
                    "Access 5 major streaming platforms",
                    "Tournament calendars with registration links",
                    "Latest pickleball news and highlights"
                  ],
                  details: [
                    "PPA Tour live coverage",
                    "Major League Pickleball streams",
                    "USA Pickleball events",
                    "Live score updates",
                    "Tournament finder",
                    "Event notifications"
                  ]
                },
                {
                  icon: TrendingUp,
                  title: "Smart Progress Tracking",
                  description: "Monitor improvement with detailed analytics, goal setting, achievement badges, and performance comparisons",
                  color: "from-purple-500 to-violet-600",
                  image: "/progress-tracking.jpg",
                  redirectUrl: "/progress",
                  benefits: [
                    "Visualize your improvement over time with detailed charts",
                    "Set and track personalized goals",
                    "Earn badges and achievements as you progress",
                    "Compare your stats vs. community averages",
                    "Track training streaks and consistency",
                    "Get insights into areas that need more focus"
                  ],
                  details: [
                    "Skill level progression",
                    "Match performance stats",
                    "Training session history",
                    "Goal completion tracking",
                    "Strength & weakness analysis",
                    "Achievement milestones"
                  ]
                },
                {
                  icon: Sparkles,
                  title: "Coach Kai AI Assistant",
                  description: "24/7 AI coaching with voice support, personalized training plans, mental game strategies, and technique advice",
                  color: "from-orange-500 to-amber-600",
                  image: "/mental-training.jpg",
                  redirectUrl: "/train/coach",
                  benefits: [
                    "Chat or talk with Coach Kai anytime, anywhere",
                    "Get instant answers to technique questions",
                    "Personalized training recommendations based on your data",
                    "Mental game and sports psychology guidance",
                    "Pre-match preparation and strategy tips",
                    "Wearable data integration for health-aware coaching"
                  ],
                  details: [
                    "Voice and text chat",
                    "Personalized training plans",
                    "Mental toughness exercises",
                    "Pressure management",
                    "Confidence building",
                    "Recovery strategies"
                  ]
                },
                {
                  icon: Zap,
                  title: "Community & Partner Matching",
                  description: "Find practice partners at your skill level, connect with local players, and join the pickleball community",
                  color: "from-cyan-500 to-blue-600",
                  image: "/partner-matching.jpg",
                  redirectUrl: "/connect/partners",
                  benefits: [
                    "Smart AI matching algorithm finds partners at your level",
                    "Location-based search for nearby players",
                    "Track match history and connect with DUPR",
                    "Join group challenges and competitions",
                    "Community forums for tips and advice",
                    "Build lasting friendships with fellow enthusiasts"
                  ],
                  details: [
                    "Smart matching algorithm",
                    "Location-based search",
                    "Skill level filtering",
                    "DUPR integration",
                    "Match scheduling",
                    "Community board"
                  ]
                }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group cursor-pointer border border-gray-200 dark:border-gray-700"
                  onClick={() => handleFeatureClick(feature as FeatureInfo)}
                >
                  {/* Feature Image */}
                  <div className="relative h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <img 
                      src={feature.image} 
                      alt={feature.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    <div className={`absolute bottom-3 left-3 w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center shadow-lg`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  
                  {/* Feature Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3">
                      {feature.description}
                    </p>
                    <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-medium group-hover:gap-2 transition-all">
                      Learn more
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:ml-2 transition-all" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div id="training" className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                How Mindful Champion Works
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Transform your game in minutes daily with our proven 3-step approach
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Assess Your Game",
                  description: "Upload a video or chat with Coach Kai to identify your strengths and areas for improvement",
                  icon: "📊"
                },
                {
                  step: "2", 
                  title: "Get Personalized Training",
                  description: "Receive custom drills, technique tips, and mental game strategies tailored to your needs",
                  icon: "🎯"
                },
                {
                  step: "3",
                  title: "Track & Improve",
                  description: "Monitor your progress with detailed analytics and celebrate achievements as you advance",
                  icon: "📈"
                }
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.2 }}
                  className="text-center relative"
                >
                  {idx < 2 && (
                    <div className="hidden md:block absolute top-8 left-full w-8 h-0.5 bg-emerald-300 dark:bg-emerald-600 z-0"></div>
                  )}
                  <div className="relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                    <div className="text-4xl mb-4">{step.icon}</div>
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-sm">{step.step}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Video Analysis Showcase - WITH SCREENSHOTS */}
        <div id="video-analysis" className="bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/10 dark:to-gray-900 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left: Content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full mb-4">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">AI-Powered Analysis</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Transform Your Game with <span className="text-blue-600">AI Video Analysis</span>
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  Upload your match footage and get instant AI-powered analysis of your technique, strategy, and performance. See exactly where to improve with frame-by-frame breakdowns.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Instant technique analysis with AI pose detection",
                    "Form corrections and improvement suggestions",
                    "Shot-by-shot strategy recommendations",
                    "Progress tracking across multiple sessions"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-blue-600 font-bold text-sm">✓</span>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => handleFeatureClick({
                    icon: Brain,
                    title: "AI Video Analysis",
                    description: "Upload match footage for instant technique analysis, form corrections, and strategy insights",
                    color: "from-blue-500 to-indigo-600",
                    image: "/video-analysis.jpg",
                    redirectUrl: "/train/video",
                    benefits: [
                      "AI-powered pose detection analyzes your form in real-time",
                      "Get specific recommendations for technique improvements",
                      "Track your progress across multiple video sessions",
                      "Compare your form to professional players"
                    ],
                    details: [
                      "Upload videos up to 10 minutes",
                      "Frame-by-frame analysis",
                      "Shot detection & categorization",
                      "Body position tracking",
                      "Instant feedback reports",
                      "Export analysis for coaches"
                    ]
                  })}
                >
                  Learn More & Get Access
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>

              {/* Right: Screenshot Showcase */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-gray-200 dark:border-gray-700">
                  <img 
                    src="/video-analysis/analytics-dashboard.png" 
                    alt="Video Analysis Dashboard"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-transparent"></div>
                </div>
                {/* Floating Feature Cards */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Brain className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">AI Accuracy</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">95%+ Detection Rate</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Rewards & Achievements Showcase */}
        <div className="bg-gradient-to-b from-amber-50 to-white dark:from-amber-900/10 dark:to-gray-900 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left: Rewards Image */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="relative rounded-xl overflow-hidden shadow-2xl">
                  <img 
                    src="/rewards/trophy.jpg" 
                    alt="Rewards & Achievements"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-900/40 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Trophy className="w-6 h-6 text-amber-600" />
                        <span className="text-lg font-bold text-gray-900 dark:text-white">Achievement Unlocked!</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Complete challenges and earn exclusive rewards</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right: Content */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 px-4 py-2 rounded-full mb-4">
                  <Trophy className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">Rewards Program</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Earn Rewards as You <span className="text-amber-600">Level Up</span>
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  Stay motivated with our gamified achievement system. Unlock badges, earn points, and redeem exclusive rewards as you progress.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    { icon: "🏆", label: "Unlock Badges", value: "50+" },
                    { icon: "🎯", label: "Daily Challenges", value: "New Daily" },
                    { icon: "🎁", label: "Exclusive Rewards", value: "25+" },
                    { icon: "⭐", label: "Earn Points", value: "Unlimited" }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 text-center">
                      <div className="text-2xl mb-1">{item.icon}</div>
                      <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">{item.value}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{item.label}</div>
                    </div>
                  ))}
                </div>
                <Button 
                  size="lg" 
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={() => handleFeatureClick({
                    icon: Trophy,
                    title: "Rewards & Achievements",
                    description: "Earn rewards as you level up with our gamified achievement system",
                    color: "from-amber-500 to-yellow-600",
                    image: "/rewards/trophy.jpg",
                    redirectUrl: "/rewards",
                    benefits: [
                      "Unlock 50+ exclusive badges as you progress",
                      "Earn points for completing drills and challenges",
                      "Redeem rewards for equipment and gear",
                      "Get access to exclusive sponsor discounts"
                    ],
                    details: [
                      "Daily challenges for extra points",
                      "Achievement tracking system",
                      "Leaderboard rankings",
                      "Sponsor partnerships",
                      "Exclusive rewards store",
                      "Special milestone bonuses"
                    ]
                  })}
                >
                  Learn More & Get Access
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Mental Training Showcase */}
        <div id="mental-training" className="bg-gradient-to-b from-purple-50 to-white dark:from-purple-900/10 dark:to-gray-900 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left: Content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded-full mb-4">
                  <Brain className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">Mental Game</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Master Your <span className="text-purple-600">Mental Game</span>
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  Elite performance requires mental strength. Access sports psychology techniques, mindfulness practices, and visualization exercises designed specifically for pickleball.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Pre-match mental preparation routines",
                    "Pressure management & focus techniques",
                    "Confidence building exercises",
                    "Mindfulness & visualization training"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-purple-600 font-bold text-sm">✓</span>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  size="lg" 
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => handleFeatureClick({
                    icon: Brain,
                    title: "Mental Training",
                    description: "Develop mental toughness with sports psychology techniques and mindfulness practices",
                    color: "from-purple-500 to-pink-600",
                    image: "/mental-training.jpg",
                    redirectUrl: "/train/coach",
                    benefits: [
                      "Build confidence and mental resilience",
                      "Learn proven sports psychology techniques",
                      "Master pre-match preparation rituals",
                      "Improve focus and concentration under pressure"
                    ],
                    details: [
                      "Visualization exercises",
                      "Breathing techniques",
                      "Pressure management",
                      "Confidence building",
                      "Focus training",
                      "Recovery mindset"
                    ]
                  })}
                >
                  Learn More & Get Access
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>

              {/* Right: Mental Training Image */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="relative rounded-xl overflow-hidden shadow-2xl">
                  <img 
                    src="/mental-training.jpg" 
                    alt="Mental Training"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/10 to-transparent"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Sponsor Partnership Showcase */}
        <div className="bg-gradient-to-b from-teal-50 to-white dark:from-teal-900/10 dark:to-gray-900 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  Powered by Premium Partnerships
                </h2>
                <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
                  We partner with leading pickleball brands to bring you exclusive discounts, sponsored rewards, and premium equipment opportunities
                </p>
              </motion.div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* For Players */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg"
              >
                <div className="relative h-48 mb-6 rounded-lg overflow-hidden">
                  <img 
                    src="/sponsors/partnership.jpg" 
                    alt="Sponsor Benefits"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold">For Players</h3>
                  </div>
                </div>
                <ul className="space-y-3 mb-6">
                  {[
                    "Exclusive sponsor discounts up to 40%",
                    "Earn rewards redeemable for equipment",
                    "Early access to new product launches",
                    "VIP tournament entry opportunities"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full border-teal-600 text-teal-600 hover:bg-teal-50"
                  onClick={() => handleFeatureClick({
                    icon: Sparkles,
                    title: "Sponsor Benefits",
                    description: "Get exclusive sponsor discounts and premium equipment opportunities",
                    color: "from-teal-500 to-emerald-600",
                    image: "/sponsors/partnership.jpg",
                    redirectUrl: "/rewards",
                    benefits: [
                      "Exclusive sponsor discounts up to 40%",
                      "Earn rewards redeemable for equipment",
                      "Early access to new product launches",
                      "VIP tournament entry opportunities"
                    ],
                    details: [
                      "Partner with leading brands",
                      "Monthly exclusive offers",
                      "Equipment upgrade rewards",
                      "Special event invitations",
                      "Community perks",
                      "Loyalty program benefits"
                    ]
                  })}
                >
                  Explore Player Benefits
                </Button>
              </motion.div>

              {/* For Sponsors */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-gradient-to-br from-teal-600 to-emerald-600 rounded-xl p-8 shadow-lg text-white"
              >
                <h3 className="text-2xl font-bold mb-4">Become a Sponsor</h3>
                <p className="text-teal-50 mb-6">
                  Partner with Mindful Champion to reach thousands of engaged pickleball players and grow your brand
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Access to 10,000+ active players",
                    "Branded reward opportunities",
                    "Featured placement in app",
                    "Performance analytics & ROI tracking"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white font-bold text-sm">✓</span>
                      </div>
                      <span className="text-teal-50">{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/partners/become-sponsor">
                  <Button size="lg" className="w-full bg-white text-teal-600 hover:bg-teal-50">
                    Learn About Sponsorship
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Community & Social Proof */}
        <div id="community" className="bg-white dark:bg-gray-900 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Join the Mindful Champion Community
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Connect with passionate players, share progress, and learn from each other's journey
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {[
                {
                  metric: "10,000+",
                  label: "Active Players",
                  icon: "👥"
                },
                {
                  metric: "500K+",
                  label: "Drills Completed",
                  icon: "🏃"
                },
                {
                  metric: "50K+",
                  label: "Videos Analyzed",
                  icon: "🎥"
                },
                {
                  metric: "98%",
                  label: "See Improvement",
                  icon: "📈"
                }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className="text-center bg-gray-50 dark:bg-gray-800 rounded-lg p-6"
                >
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.metric}</div>
                  <div className="text-sm text-gray-800 dark:text-gray-200 font-semibold">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-8"
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Ready to Transform Your Game?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-xl mx-auto">
                  Start your free trial today and discover why thousands of players choose Mindful Champion to elevate their pickleball game
                </p>
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg px-8 py-3">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start Free Trial - No Credit Card Required
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  Join in seconds • Full access • Cancel anytime
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Text-to-Speech for auto-speak */}
      {voicePreferences.textToSpeechEnabled && lastAssistantMessage && (
        <TextToSpeech
          text={lastAssistantMessage}
          rate={voicePreferences.rate}
          pitch={voicePreferences.pitch}
          volume={voicePreferences.volume}
          autoPlay={voicePreferences.autoSpeak && !isListening}
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

      {/* Continuous Mode Indicator */}
      <AnimatePresence>
        {continuousMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-40 bg-emerald-500 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium"
          >
            🔄 Continuous Mode ON
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feature Info Modal */}
      <FeatureInfoModal
        isOpen={showFeatureModal}
        onClose={() => setShowFeatureModal(false)}
        feature={selectedFeature}
      />
    </div>
  );
}
