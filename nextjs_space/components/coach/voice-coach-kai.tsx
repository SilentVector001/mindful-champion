// @ts-nocheck
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Phone, Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import MainNavigation from '@/components/navigation/main-navigation';
import Image from 'next/image';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

type UserContext = {
  name?: string;
  firstName?: string;
  skillLevel?: string;
  playerRating?: number;
  primaryGoals?: string[];
  biggestChallenges?: string[];
};

interface VoiceCoachKaiProps {
  userContext?: UserContext;
  userData?: any;
}

export default function VoiceCoachKai({ userContext, userData }: VoiceCoachKaiProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCallMode, setIsCallMode] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const firstName = userContext?.firstName || userContext?.name?.split(' ')[0] || 'Champion';

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Unlock audio on first interaction
  const unlockAudio = useCallback(() => {
    if (!audioUnlocked) {
      const audio = new Audio();
      audio.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
      audio.play().catch(() => {});
      setAudioUnlocked(true);
    }
  }, [audioUnlocked]);

  // Text to Speech using ElevenLabs
  const speakText = useCallback(async (text: string) => {
    if (!text || isSpeaking) return;
    
    try {
      setIsSpeaking(true);
      const response = await fetch('/api/tts/elevenlabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text, 
          voiceId: 'UgBBYS2sOqTuMpoF3BR0', // Mark - Natural Conversations voice
          modelId: 'eleven_multilingual_v2',
          voiceSettings: {
            stability: 0.30,
            similarity_boost: 0.70,
            style: 0.70,
            use_speaker_boost: true
          }
        })
      });
      
      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.pause();
        }
        
        const audio = new Audio(audioUrl);
        audio.setAttribute('playsinline', 'true');
        audioRef.current = audio;
        
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          // Resume listening in call mode
          if (isCallMode) {
            setTimeout(() => startListening(), 500);
          }
        };
        
        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        await audio.play();
      } else {
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
    }
  }, [isSpeaking, isCallMode]);

  // Speech Recognition
  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    let finalTranscript = '';
    
    recognition.onstart = () => {
      setIsListening(true);
    };
    
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Reset silence timer on speech
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      
      // Auto-send after 1.5s of silence
      if (finalTranscript.trim()) {
        silenceTimeoutRef.current = setTimeout(() => {
          if (finalTranscript.trim()) {
            recognition.stop();
            handleSendMessage(finalTranscript.trim());
            finalTranscript = '';
          }
        }, 1500);
      }
    };
    
    recognition.onerror = () => {
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    setIsListening(false);
  }, []);

  // Helper function to extract message from various response formats
  const extractMessage = (content: string): string => {
    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(content);
      if (parsed.message) {
        return parsed.message;
      }
      if (parsed.content) {
        return parsed.content;
      }
      if (typeof parsed === 'string') {
        return parsed;
      }
    } catch {
      // Not JSON
    }
    
    // Try regex extraction for partial JSON
    const messageMatch = content.match(/"message"\s*:\s*"([^"]+(?:\\.[^"]*)*?)"/);
    if (messageMatch) {
      return messageMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
    }
    
    // If content looks like raw JSON, try to extract just the message part
    if (content.includes('"message"') && content.includes('"metadata"')) {
      const match = content.match(/"message"\s*:\s*"([\s\S]*?)"\s*,\s*"metadata"/);
      if (match) {
        return match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
      }
    }
    
    // Return as-is if no JSON structure found
    return content;
  };

  // Send message to AI
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/ai-coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          userContext
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Extract the message properly - ALWAYS extract from response
        let displayContent = '';
        if (typeof data === 'object' && data.message) {
          displayContent = data.message;
        } else if (typeof data === 'string') {
          displayContent = extractMessage(data);
        } else if (typeof data === 'object') {
          // For any object, try to extract message field
          displayContent = data.message || data.content || extractMessage(JSON.stringify(data));
        } else {
          displayContent = String(data);
        }
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: displayContent,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Speak the response
        if (displayContent) {
          speakText(displayContent);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle call mode
  const toggleCallMode = () => {
    unlockAudio();
    if (isCallMode) {
      stopListening();
      setIsCallMode(false);
    } else {
      setIsCallMode(true);
      startListening();
    }
  };

  // Toggle tap to talk
  const handleTapToTalk = () => {
    unlockAudio();
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Toggle speaker
  const toggleSpeaker = () => {
    if (isSpeaking && audioRef.current) {
      audioRef.current.pause();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* @ts-ignore */}
      <MainNavigation user={userData} />
      
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white tracking-wide">COACH KAI</h1>
          <p className="text-slate-400 text-sm">Your AI Pickleball Coach</p>
        </div>
        
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <motion.div
            animate={{
              scale: isListening ? [1, 1.05, 1] : isSpeaking ? [1, 1.03, 1] : 1,
            }}
            transition={{ duration: 1.5, repeat: (isListening || isSpeaking) ? Infinity : 0 }}
            className="relative"
          >
            {/* Glow rings */}
            {(isListening || isSpeaking) && (
              <>
                <motion.div
                  className={`absolute inset-0 rounded-full ${isListening ? 'bg-amber-400' : 'bg-emerald-400'}`}
                  animate={{ scale: [1, 1.4, 1.4], opacity: [0.4, 0, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ width: 160, height: 160, margin: -16 }}
                />
                <motion.div
                  className={`absolute inset-0 rounded-full ${isListening ? 'bg-amber-400' : 'bg-emerald-400'}`}
                  animate={{ scale: [1, 1.2, 1.2], opacity: [0.3, 0, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                  style={{ width: 160, height: 160, margin: -16 }}
                />
              </>
            )}
            
            {/* Avatar image */}
            <div className={`relative w-32 h-32 rounded-full overflow-hidden border-4 ${
              isListening ? 'border-amber-400 shadow-lg shadow-amber-400/50' :
              isSpeaking ? 'border-emerald-400 shadow-lg shadow-emerald-400/50' :
              'border-slate-600'
            }`}>
              <Image
                src="/avatars/coach-kai.webp"
                alt="Coach Kai"
                fill
                className="object-cover"
              />
            </div>
          </motion.div>
        </div>
        
        {/* Tap to Talk Button */}
        <div className="flex justify-center mb-8">
          <Button
            onClick={handleTapToTalk}
            className={`px-8 py-3 rounded-full font-medium transition-all ${
              isListening 
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/30'
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
          >
            {isListening ? 'Listening...' : 'Tap to talk'}
          </Button>
        </div>
        
        {/* Messages */}
        <div className="space-y-4 mb-32 max-h-[400px] overflow-y-auto px-2">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-700 text-slate-100'
                }`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-slate-700 rounded-2xl px-4 py-3">
                <Loader2 className="w-5 h-5 animate-spin text-teal-400" />
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Bottom Input & Controls */}
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent pt-8 pb-6">
          <div className="max-w-2xl mx-auto px-4">
            {/* Text Input */}
            <div className="flex gap-2 mb-4">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage(input)}
                placeholder="Type a message..."
                className="flex-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 rounded-full px-4"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="bg-teal-600 hover:bg-teal-500 rounded-full w-12 h-12"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Voice Controls */}
            <div className="flex justify-center items-center gap-6">
              {/* Mic */}
              <button
                onClick={handleTapToTalk}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  isListening
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/40'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Mic className="w-6 h-6" />
              </button>
              
              {/* Phone (Call Mode) */}
              <button
                onClick={toggleCallMode}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isCallMode
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/40'
                    : 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/30'
                }`}
              >
                <Phone className="w-7 h-7" />
              </button>
              
              {/* Speaker */}
              <button
                onClick={toggleSpeaker}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  isSpeaking
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <Volume2 className="w-6 h-6" />
              </button>
            </div>
            
            {/* Help Text */}
            <p className="text-center text-slate-500 text-xs mt-3">
              Tap mic once to talk • Tap phone for hands-free call
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
