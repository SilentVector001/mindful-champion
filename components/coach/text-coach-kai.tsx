'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles, Calendar, Target, Dumbbell, Video, Check, X as XIcon, Mic, MicOff, MessageSquarePlus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MainNavigation from '@/components/navigation/main-navigation';
import SimliAvatar from './simli-avatar';

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
  isExpanded?: boolean; // Track if "Tell me more" has been used
};

type UserContext = {
  name?: string;
  firstName?: string;
  skillLevel?: string;
  playerRating?: number;
  primaryGoals?: string[];
  biggestChallenges?: string[];
};

interface TextCoachKaiProps {
  userContext?: UserContext;
  userData?: any;
}

const QUICK_ACTIONS = [
  { label: 'Fix My Backhand', icon: '🏓', prompt: 'Help me improve my backhand technique' },
  { label: 'Add Tournament', icon: '📅', prompt: 'I want to register for a tournament this weekend' },
  { label: 'Serve Drill', icon: '🎯', prompt: 'Give me a drill to improve my serve' },
  { label: 'Set a Goal', icon: '🏆', prompt: 'Help me set a training goal for this week' },
];

export default function TextCoachKai({ userContext, userData }: TextCoachKaiProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingActions, setPendingActions] = useState<ActionSuggestion[]>([]);
  const [executingAction, setExecutingAction] = useState<string | null>(null);
  
  // PTT State
  const [isPTTActive, setIsPTTActive] = useState(false);
  const [pttTranscript, setPttTranscript] = useState('');
  const [pttSupported, setPttSupported] = useState(false);
  
  // Beta badge blinking animation state
  const [isBetaBlinking, setIsBetaBlinking] = useState(false);
  const [betaBlinkComplete, setBetaBlinkComplete] = useState(false);
  
  // Simli Avatar State
  const [avatarEnabled, setAvatarEnabled] = useState(false);
  const [avatarReady, setAvatarReady] = useState(false);
  const [avatarAudioData, setAvatarAudioData] = useState<Uint8Array | undefined>();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  
  const firstName = userContext?.firstName || userContext?.name?.split(' ')[0] || 'Champion';

  // Check for speech recognition support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setPttSupported(!!SpeechRecognition);
    }
  }, []);

  // Beta badge blinking animation - blink 4 times then stop
  useEffect(() => {
    if (betaBlinkComplete) return; // Don't blink if already completed

    setIsBetaBlinking(true);
    
    // Blink 4 times (on-off-on-off-on-off-on-off = 8 state changes)
    let blinkCount = 0;
    const blinkInterval = setInterval(() => {
      blinkCount++;
      setIsBetaBlinking(prev => !prev);
      
      if (blinkCount >= 8) { // 4 complete blinks (on-off cycles)
        clearInterval(blinkInterval);
        setIsBetaBlinking(false);
        setBetaBlinkComplete(true); // Mark as complete, never blink again
      }
    }, 300); // 300ms for each blink state change
    
    // Cleanup
    return () => {
      clearInterval(blinkInterval);
    };
  }, [betaBlinkComplete]);

  // Improved auto-scroll to bottom on new messages - ensures latest message is always visible
  useEffect(() => {
    if (messagesEndRef.current) {
      // Use requestAnimationFrame for smoother scroll
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest'
        });
      });
    }
    
    // Also scroll the container to ensure visibility
    if (messagesContainerRef.current) {
      requestAnimationFrame(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      });
    }
  }, [messages, isLoading]);

  // PTT - Start listening
  const startPTT = useCallback(() => {
    if (!pttSupported) return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setPttTranscript(transcript);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsPTTActive(false);
    };
    
    recognition.onend = () => {
      if (isPTTActive) {
        // Stopped unexpectedly, try to restart
        recognition.start();
      }
    };
    
    recognitionRef.current = recognition;
    recognition.start();
    setIsPTTActive(true);
    setPttTranscript('');
  }, [pttSupported, isPTTActive]);

  // PTT - Stop and send
  const stopPTT = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsPTTActive(false);
    
    if (pttTranscript.trim()) {
      setInput(pttTranscript.trim());
      // Auto-send after brief delay
      setTimeout(() => {
        handleSend(pttTranscript.trim());
      }, 100);
    }
    setPttTranscript('');
  }, [pttTranscript]);

  // Send message
  const handleSend = async (overrideText?: string) => {
    const messageText = overrideText || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/coach-kai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let assistantContent = '';
      let actions: ActionSuggestion[] = [];
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);

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
                assistantContent += data.content;
                setMessages(prev => 
                  prev.map(m => 
                    m.id === assistantMessage.id 
                      ? { ...m, content: assistantContent }
                      : m
                  )
                );
              } else if (data.type === 'actions') {
                actions = data.suggestions || [];
                setPendingActions(actions);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      // Final update with actions
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMessage.id
            ? { ...m, content: assistantContent, actions }
            : m
        )
      );
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please try again in a moment! 🏓",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Execute action
  const executeAction = async (action: ActionSuggestion) => {
    setExecutingAction(action.action);
    try {
      const response = await fetch('/api/coach-kai/execute-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      
      if (response.ok) {
        setPendingActions(prev => prev.filter(a => a !== action));
      }
    } catch (error) {
      console.error('Action execution error:', error);
    } finally {
      setExecutingAction(null);
    }
  };

  // Quick action handler
  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    handleSend(prompt);
  };

  // Tell me more handler
  const handleTellMeMore = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message || message.role !== 'assistant' || message.isExpanded) return;

    // Send request for more details
    const expandPrompt = "Tell me more about that last response. Please provide more details and explanation.";
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: expandPrompt,
      timestamp: new Date(),
    };

    // Mark message as expanded and add user message
    setMessages(prev => [
      ...prev.map(m => m.id === messageId ? { ...m, isExpanded: true } : m),
      userMessage
    ]);
    setIsLoading(true);

    try {
      // Build messages array with the expanded flag update
      const updatedMessages = messages.map(m => 
        m.id === messageId ? { ...m, isExpanded: true } : m
      );
      
      const response = await fetch('/api/coach-kai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...updatedMessages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let assistantContent = '';
      let actions: ActionSuggestion[] = [];
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);

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
                assistantContent += data.content;
                setMessages(prev => 
                  prev.map(m => 
                    m.id === assistantMessage.id 
                      ? { ...m, content: assistantContent }
                      : m
                  )
                );
              } else if (data.type === 'actions') {
                actions = data.suggestions || [];
                setPendingActions(actions);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      // Final update with actions
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMessage.id
            ? { ...m, content: assistantContent, actions }
            : m
        )
      );
    } catch (error) {
      console.error('Tell me more error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'm having trouble expanding on that right now. Please try again! 🏓",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'calendar': return <Calendar className="w-4 h-4" />;
      case 'resource': return <Dumbbell className="w-4 h-4" />;
      case 'analysis': return <Video className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <MainNavigation user={userData} />
      
      <div className="pt-20 pb-8 px-4 max-w-4xl mx-auto">
        {/* Header with Avatar */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative inline-block"
          >
            {/* Simli Avatar or Static K */}
            {avatarEnabled ? (
              <SimliAvatar
                isActive={avatarEnabled}
                audioData={avatarAudioData}
                onReady={() => setAvatarReady(true)}
                onError={() => setAvatarEnabled(false)}
                className="w-24 h-24"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-teal-500/30">
                K
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </motion.div>
          <div className="flex items-center justify-center gap-3 mt-4">
            <h1 className="text-2xl font-bold text-white">Coach Kai</h1>
            <Badge 
              className={`bg-purple-600 text-white px-2 py-1 text-xs font-semibold transition-opacity duration-200 ${
                isBetaBlinking ? 'opacity-30' : 'opacity-100'
              }`}
            >
              Beta
            </Badge>
            {/* Avatar toggle button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setAvatarEnabled(!avatarEnabled)}
              className={`text-xs px-2 py-1 h-6 ${avatarEnabled ? 'text-teal-400 bg-teal-900/30' : 'text-slate-400 hover:text-teal-400'}`}
              title={avatarEnabled ? 'Disable video avatar' : 'Enable video avatar'}
            >
              <User className="w-3 h-3 mr-1" />
              {avatarEnabled ? 'Avatar On' : 'Avatar'}
            </Button>
          </div>
          <p className="text-teal-400 text-sm">Your AI Pickleball Coach</p>
        </div>

        {/* Chat Container */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm overflow-hidden">
          {/* Messages */}
          <div ref={messagesContainerRef} className="h-[400px] overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Sparkles className="w-12 h-12 text-teal-500/50 mb-4" />
                <p className="text-slate-400">Start a conversation with Coach Kai!</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={message.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-700 text-slate-100'
                      }`}
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  </motion.div>
                  
                  {/* Tell me more button for assistant messages */}
                  {message.role === 'assistant' && 
                   !message.isExpanded && 
                   index === messages.length - 1 && 
                   !isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start mt-2 ml-2"
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTellMeMore(message.id)}
                        className="border-teal-500/30 text-teal-400 hover:bg-teal-900/30 hover:text-teal-300 hover:border-teal-500/50 text-xs"
                      >
                        <MessageSquarePlus className="w-3 h-3 mr-1" />
                        Tell me more
                      </Button>
                    </motion.div>
                  )}
                </div>
              ))
            )}
            
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-slate-700 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                    <span className="text-slate-400 text-sm">Coach Kai is thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Action Cards */}
          <AnimatePresence>
            {pendingActions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 pb-3 space-y-2"
              >
                {pendingActions.map((action, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gradient-to-r from-teal-900/50 to-slate-800 border border-teal-500/30 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400">
                          {getActionIcon(action.type)}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{action.action}</p>
                          <p className="text-slate-400 text-xs">{action.confirmationPrompt}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setPendingActions(prev => prev.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-white"
                        >
                          <XIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => executeAction(action)}
                          disabled={executingAction === action.action}
                          className="bg-teal-600 hover:bg-teal-700 text-white"
                        >
                          {executingAction === action.action ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-700">
            {/* PTT Transcript Display */}
            {isPTTActive && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 p-3 bg-teal-900/30 border border-teal-500/30 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-teal-400 text-xs font-medium">Listening...</span>
                </div>
                <p className="text-white text-sm min-h-[20px]">
                  {pttTranscript || 'Speak now...'}
                </p>
              </motion.div>
            )}
            
            <div className="flex gap-2">
              {/* PTT Button */}
              {pttSupported && (
                <Button
                  type="button"
                  variant={isPTTActive ? 'default' : 'outline'}
                  size="icon"
                  className={`shrink-0 ${
                    isPTTActive 
                      ? 'bg-red-600 hover:bg-red-700 text-white border-red-600' 
                      : 'border-slate-600 text-slate-400 hover:text-white hover:border-teal-500'
                  }`}
                  onMouseDown={startPTT}
                  onMouseUp={stopPTT}
                  onMouseLeave={isPTTActive ? stopPTT : undefined}
                  onTouchStart={startPTT}
                  onTouchEnd={stopPTT}
                >
                  {isPTTActive ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>
              )}
              
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your question..."
                className="min-h-[50px] max-h-[120px] bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 resize-none"
                disabled={isLoading || isPTTActive}
              />
              
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="shrink-0 bg-teal-600 hover:bg-teal-700 text-white"
                size="icon"
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

        {/* Quick Actions */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {QUICK_ACTIONS.map((action, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuickAction(action.prompt)}
              className="flex flex-col items-center gap-2 p-3 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-teal-500/50 transition-colors"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className="text-xs text-slate-300 font-medium">{action.label}</span>
            </motion.button>
          ))}
        </div>

      </div>
    </div>
  );
}
