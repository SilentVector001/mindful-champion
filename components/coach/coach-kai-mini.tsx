'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles, X, Maximize2, MessageCircle, Mic, Volume2, VolumeX, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import InteractiveAvatar from '@/components/avatar/interactive-avatar';
import ContinuousVoiceButton from '@/components/voice/continuous-voice-button';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking';

export default function CoachKaiMini() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    role: 'assistant',
    content: '👋 Hey! Quick question? I\'m here to help!',
    timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [voiceSessionActive, setVoiceSessionActive] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitialMountRef = useRef(true); // Track if it's the initial mount to prevent auto-scroll
  const hasUserInteractedRef = useRef(false); // Only scroll after user sends their first message

  // Load conversation history on mount - SYNC WITH MAIN COACH KAI PAGE
  useEffect(() => {
    const loadConversationHistory = async () => {
      try {
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
            
            // Load last 10 messages to sync with main page
            const last10Messages = allMessages.slice(-10);
            setMessages(last10Messages);
          }
        }
      } catch (error) {
        console.error('Error loading conversation history:', error);
      }
      setIsLoadingHistory(false);
    };

    loadConversationHistory();
  }, []);

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

  // Update avatar state
  useEffect(() => {
    if (isUserSpeaking || isListening) {
      setAvatarState('listening');
    } else if (isSpeaking) {
      setAvatarState('speaking');
    } else if (isLoading) {
      setAvatarState('thinking');
    } else {
      setAvatarState('idle');
    }
  }, [isListening, isSpeaking, isLoading, isUserSpeaking]);

  // Mark as read when opened
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
    }
  }, [isOpen]);

  // Handle continuous voice input
  const handleVoiceTranscript = useCallback((text: string) => {
    if (text.trim()) {
      console.log('🎤 Voice transcript received:', text);
      // Automatically send voice input as message
      handleSendMessage(text);
    }
  }, []);

  const handleVoiceSessionChange = useCallback((active: boolean) => {
    console.log('🔊 Voice session:', active ? 'ACTIVE' : 'INACTIVE');
    setVoiceSessionActive(active);
    setIsListening(active);
  }, []);

  const handleUserSpeakingChange = useCallback((speaking: boolean) => {
    console.log('👄 User speaking:', speaking);
    setIsUserSpeaking(speaking);
  }, []);

  const handleSendMessage = async (messageContent?: string) => {
    const textToSend = messageContent || input.trim();
    if (!textToSend || isLoading) return;

    // Enable auto-scroll after first user interaction
    hasUserInteractedRef.current = true;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Save to history
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
      console.error('Error saving message:', error);
    }

    try {
      // CRITICAL FIX: Send only last 9 messages + new message (same as main Coach Kai page)
      // This prevents duplication with database history and stops repetition on mobile
      const conversationMessages = [
        ...messages.slice(-9).map(m => ({
          role: m.role,
          content: m.content
        })),
        {
          role: 'user',
          content: textToSend
        }
      ];

      const response = await fetch('/api/ai-coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationMessages
        })
      });

      if (!response.ok) {
        throw new Error('Server error');
      }

      const data = await response.json();
      
      if (!data.message) {
        throw new Error('No response');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Show unread indicator if minimized
      if (!isOpen) {
        setHasUnread(true);
      }

      // Save to history
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
        console.error('Error saving message:', error);
      }
    } catch (error) {
      console.error('Coach Kai error:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I'm having trouble right now. Try again? 🔄",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  return (
    <>
      {/* Floating Button - Opens Chat */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-30"
            style={{ pointerEvents: 'auto' }}
          >
            <Button
              onClick={toggleOpen}
              size="lg"
              className={`relative w-16 h-16 rounded-full shadow-2xl transition-all ${
                voiceSessionActive
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/50 animate-pulse'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:shadow-emerald-500/50'
              }`}
            >
              <div className={`relative ${
                avatarState === 'thinking' ? 'animate-pulse' :
                avatarState === 'speaking' ? 'animate-bounce' :
                ''
              }`}>
                {voiceSessionActive ? (
                  <Mic className="w-7 h-7 text-white" />
                ) : (
                  <Sparkles className="w-7 h-7 text-white" />
                )}
              </div>
              {hasUnread && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white"
                />
              )}
            </Button>
            <div className="absolute -top-12 right-0 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
              {voiceSessionActive ? 'Voice session active' : 'Ask Coach Kai'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="fixed bottom-4 right-4 z-30 w-[380px] md:w-[420px] max-h-[calc(100vh-2rem)]"
            style={{ pointerEvents: 'auto' }}
          >
            <Card className="shadow-2xl border-2 border-emerald-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`relative p-0.5 rounded-full bg-white ${
                      avatarState === 'thinking' ? 'ring-2 ring-orange-300' :
                      avatarState === 'speaking' ? 'ring-2 ring-emerald-300' :
                      avatarState === 'listening' ? 'ring-2 ring-blue-300' :
                      ''
                    }`}>
                      <InteractiveAvatar
                        state={avatarState}
                        size="sm"
                        showStatusIndicator={true}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Coach Kai</h3>
                      <p className="text-xs text-emerald-100">Your AI Coach</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href="/train/coach">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20 h-8 w-8 p-0"
                        title="Open full Coach Kai"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleOpen}
                      className="text-white hover:bg-white/20 h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="h-[320px] p-4 bg-gray-50" ref={scrollRef}>
                <div className="space-y-3">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </motion.div>
                  ))}

                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                          <span className="text-xs text-gray-600">Thinking...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-4 bg-gradient-to-b from-white to-gray-50 border-t border-gray-200">
                <div className="space-y-3">
                  {/* Text Input (hidden when voice session active) */}
                  {!voiceSessionActive && (
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Textarea
                          ref={inputRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Type or use voice..."
                          className="resize-none min-h-[40px] max-h-[80px] text-sm border-2 border-gray-200 focus:border-emerald-500 transition-colors"
                          disabled={isLoading}
                          rows={1}
                        />
                      </div>
                      
                      <Button
                        onClick={() => handleSendMessage()}
                        disabled={!input.trim() || isLoading}
                        size="sm"
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 h-[40px] px-3"
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Continuous Voice Button - Always visible */}
                  <div className="flex flex-col items-center gap-2">
                    <ContinuousVoiceButton
                      onTranscript={handleVoiceTranscript}
                      onSessionChange={handleVoiceSessionChange}
                      onSpeakingChange={handleUserSpeakingChange}
                      disabled={isLoading}
                      language="en-US"
                      pauseThreshold={1500}
                    />
                    {voiceSessionActive && (
                      <p className="text-xs text-gray-500 text-center">
                        {isUserSpeaking ? '🎤 Listening to you...' : isLoading ? '🤔 Thinking...' : '💬 Speak naturally, I\'ll respond'}
                      </p>
                    )}
                    {!voiceSessionActive && (
                      <p className="text-xs text-gray-400 text-center">
                        Click the microphone for continuous voice conversation
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
