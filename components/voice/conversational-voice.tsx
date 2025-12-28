'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Phone, PhoneOff, Loader2, Volume2, VolumeX, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { unlockIOSTTS } from '@/components/voice/text-to-speech';

interface ConversationalVoiceProps {
  onTranscript: (text: string) => void;
  onSessionChange?: (active: boolean) => void;
  onSpeakingChange?: (speaking: boolean) => void;
  onListeningChange?: (listening: boolean) => void;
  disabled?: boolean;
  language?: string;
  aiIsSpeaking?: boolean; // External signal that AI is speaking (TTS)
  onInterruptAI?: () => void; // Callback to stop AI speech
  pauseThreshold?: number; // ms of silence before sending
}

type SessionState = 'inactive' | 'listening' | 'processing' | 'ai_speaking' | 'paused';

export default function ConversationalVoice({
  onTranscript,
  onSessionChange,
  onSpeakingChange,
  onListeningChange,
  disabled = false,
  language = 'en-US',
  aiIsSpeaking = false,
  onInterruptAI,
  pauseThreshold = 1500
}: ConversationalVoiceProps) {
  const [sessionState, setSessionState] = useState<SessionState>('inactive');
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptBufferRef = useRef<string>('');
  const sessionActiveRef = useRef<boolean>(false);
  const wasListeningBeforeAIRef = useRef<boolean>(false);
  const lastSpeechTimeRef = useRef<number>(0);

  // Sync AI speaking state - pause listening when AI speaks, resume after
  useEffect(() => {
    if (!sessionActiveRef.current) return;

    if (aiIsSpeaking) {
      // AI started speaking - pause our listening
      wasListeningBeforeAIRef.current = sessionState === 'listening';
      if (sessionState === 'listening') {
        setSessionState('ai_speaking');
        stopListening();
      }
    } else if (sessionState === 'ai_speaking' || wasListeningBeforeAIRef.current) {
      // AI finished speaking - resume listening automatically
      wasListeningBeforeAIRef.current = false;
      if (sessionActiveRef.current) {
        console.log('🔄 AI finished speaking, resuming listening...');
        setTimeout(() => {
          if (sessionActiveRef.current) {
            startListening();
          }
        }, 300); // Small delay for natural conversation flow
      }
    }
  }, [aiIsSpeaking]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Voice input not supported. Use Chrome for best experience.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🎤 Conversational: Recognition started');
      setSessionState('listening');
      onListeningChange?.(true);
      setError(null);
    };

    recognition.onend = () => {
      console.log('🛑 Conversational: Recognition ended, sessionActive:', sessionActiveRef.current);
      
      // Auto-restart if session is still active and not in AI speaking mode
      if (sessionActiveRef.current && !aiIsSpeaking) {
        console.log('🔄 Auto-restarting recognition...');
        setTimeout(() => {
          if (sessionActiveRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (err: any) {
              if (err.name !== 'InvalidStateError') {
                console.error('Failed to restart recognition:', err);
              }
            }
          }
        }, 100);
      } else {
        onListeningChange?.(false);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('🚨 Conversational error:', event.error);

      if (event.error === 'not-allowed') {
        setError('Microphone access denied.');
        setPermissionGranted(false);
        stopSession();
      } else if (event.error === 'no-speech') {
        // Normal - just means user was quiet
        console.log('No speech detected, continuing...');
      } else if (event.error === 'aborted') {
        // Normal when stopping
      } else if (event.error === 'network') {
        // Try to restart on network errors
        if (sessionActiveRef.current) {
          setTimeout(() => {
            if (sessionActiveRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e) {}
            }
          }, 1000);
        }
      }
    };

    recognition.onresult = (event: any) => {
      let finalText = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          finalText += transcript + ' ';
        } else {
          interimText += transcript;
        }
      }

      // Track when user is speaking
      if (finalText || interimText) {
        lastSpeechTimeRef.current = Date.now();
        if (!isUserSpeaking) {
          setIsUserSpeaking(true);
          onSpeakingChange?.(true);
        }
        
        // Clear any pending silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
      }

      // Update transcripts
      if (finalText) {
        transcriptBufferRef.current += finalText;
        setCurrentTranscript(transcriptBufferRef.current);
        console.log('📝 Final:', finalText.trim());
        
        // Start silence timer - if user stops talking, send the message
        silenceTimerRef.current = setTimeout(() => {
          const timeSinceLastSpeech = Date.now() - lastSpeechTimeRef.current;
          if (timeSinceLastSpeech >= pauseThreshold - 100 && transcriptBufferRef.current.trim()) {
            console.log('⏰ Silence detected, sending transcript');
            sendTranscript();
          }
        }, pauseThreshold);
      }

      setInterimTranscript(interimText);
      
      // Update speaking state based on interim
      if (interimText) {
        // Reset silence timer while user is still speaking
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
        }
        silenceTimerRef.current = setTimeout(() => {
          setIsUserSpeaking(false);
          onSpeakingChange?.(false);
          
          // Check if we should send
          if (transcriptBufferRef.current.trim()) {
            sendTranscript();
          }
        }, pauseThreshold);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {}
      }
    };
  }, [language, onListeningChange, onSpeakingChange, pauseThreshold]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
    };
  }, []);

  const sendTranscript = useCallback(() => {
    const fullTranscript = transcriptBufferRef.current.trim();
    
    if (fullTranscript) {
      console.log('📤 Sending:', fullTranscript);
      setSessionState('processing');
      onTranscript(fullTranscript);
      
      // Clear for next utterance
      transcriptBufferRef.current = '';
      setCurrentTranscript('');
      setInterimTranscript('');
      setIsUserSpeaking(false);
      onSpeakingChange?.(false);
    }
  }, [onTranscript, onSpeakingChange]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.start();
      console.log('✅ Started listening');
    } catch (err: any) {
      if (err.name === 'InvalidStateError') {
        // Already running
        console.log('Recognition already running');
      } else {
        console.error('Failed to start recognition:', err);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
      console.log('🛑 Stopped listening');
    } catch (err) {
      // Ignore
    }
  }, []);

  const startSession = useCallback(async () => {
    try {
      setError(null);
      
      // Unlock iOS TTS immediately on user gesture
      unlockIOSTTS();
      
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      stream.getTracks().forEach(track => track.stop()); // Release immediately, recognition will get its own
      setPermissionGranted(true);

      // Start session
      sessionActiveRef.current = true;
      onSessionChange?.(true);
      
      // Start listening
      startListening();
      
      console.log('✅ Conversation session started');
    } catch (err: any) {
      console.error('Failed to start session:', err);
      
      if (err.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow in browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found.');
      } else {
        setError('Failed to start voice session.');
      }
      
      setPermissionGranted(false);
    }
  }, [onSessionChange, startListening]);

  const stopSession = useCallback(() => {
    console.log('🛑 Stopping conversation session');

    // Send any remaining transcript
    if (transcriptBufferRef.current.trim()) {
      sendTranscript();
    }

    // Clear timers
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    // Stop recognition
    stopListening();

    // Reset state
    sessionActiveRef.current = false;
    setSessionState('inactive');
    setIsUserSpeaking(false);
    onSessionChange?.(false);
    onSpeakingChange?.(false);
    onListeningChange?.(false);
    transcriptBufferRef.current = '';
    setCurrentTranscript('');
    setInterimTranscript('');
    wasListeningBeforeAIRef.current = false;
  }, [sendTranscript, stopListening, onSessionChange, onSpeakingChange, onListeningChange]);

  const toggleSession = useCallback(() => {
    if (sessionActiveRef.current) {
      stopSession();
    } else {
      startSession();
    }
  }, [startSession, stopSession]);

  const handleInterrupt = useCallback(() => {
    // User wants to interrupt AI - stop TTS and start listening
    onInterruptAI?.();
    if (sessionActiveRef.current) {
      setTimeout(() => startListening(), 200);
    }
  }, [onInterruptAI, startListening]);

  const isActive = sessionActiveRef.current || sessionState !== 'inactive';
  const showListening = sessionState === 'listening';
  const showProcessing = sessionState === 'processing';
  const showAISpeaking = sessionState === 'ai_speaking' || aiIsSpeaking;

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Main Conversation Button */}
      <div className="relative">
        <motion.div
          animate={
            isUserSpeaking
              ? {
                  scale: [1, 1.08, 1],
                  boxShadow: [
                    '0 0 0 0 rgba(16, 185, 129, 0.5)',
                    '0 0 0 25px rgba(16, 185, 129, 0)',
                    '0 0 0 0 rgba(16, 185, 129, 0)',
                  ],
                }
              : {}
          }
          transition={{
            duration: 0.8,
            repeat: isUserSpeaking ? Infinity : 0,
            ease: 'easeInOut',
          }}
        >
          <Button
            onClick={toggleSession}
            disabled={disabled}
            className={`relative h-28 w-28 sm:h-32 sm:w-32 rounded-full transition-all duration-300 shadow-xl ${
              isActive
                ? showAISpeaking
                  ? 'bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-purple-500/40'
                  : isUserSpeaking
                  ? 'bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-emerald-500/40'
                  : showProcessing
                  ? 'bg-gradient-to-br from-blue-500 to-cyan-600 shadow-blue-500/40'
                  : 'bg-gradient-to-br from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-teal-500/40'
                : 'bg-gradient-to-br from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700'
            }`}
          >
            <motion.div
              animate={showProcessing ? { rotate: 360 } : {}}
              transition={{ duration: 1, repeat: showProcessing ? Infinity : 0, ease: 'linear' }}
            >
              {!isActive ? (
                <Phone className="w-12 h-12 text-white" />
              ) : showAISpeaking ? (
                <Volume2 className="w-12 h-12 text-white" />
              ) : showProcessing ? (
                <Loader2 className="w-12 h-12 text-white" />
              ) : isUserSpeaking ? (
                <Mic className="w-12 h-12 text-white animate-pulse" />
              ) : (
                <Mic className="w-12 h-12 text-white" />
              )}
            </motion.div>
          </Button>
        </motion.div>

        {/* Active Session Ring */}
        {isActive && (
          <motion.div
            className={`absolute inset-0 rounded-full border-4 pointer-events-none ${
              showAISpeaking ? 'border-purple-400' :
              isUserSpeaking ? 'border-emerald-400' : 
              'border-teal-400'
            }`}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.6, 0.2, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </div>

      {/* Status Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
      >
        <p className={`text-lg font-bold ${
          !isActive ? 'text-slate-600' :
          showAISpeaking ? 'text-purple-600' :
          isUserSpeaking ? 'text-emerald-600' :
          showProcessing ? 'text-blue-600' :
          'text-teal-600'
        }`}>
          {!isActive ? (
            <>📞 Tap to Start Conversation</>
          ) : showAISpeaking ? (
            <>🗣️ Coach Kai is speaking...</>
          ) : showProcessing ? (
            <>🤔 Processing...</>
          ) : isUserSpeaking ? (
            <>🎤 Listening to you...</>
          ) : (
            <>👂 Listening... (speak anytime)</>
          )}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {!isActive ? (
            'Natural conversation - like talking to a friend'
          ) : showAISpeaking ? (
            <button 
              onClick={handleInterrupt}
              className="text-purple-500 hover:text-purple-700 underline"
            >
              Tap to interrupt
            </button>
          ) : (
            'Speak naturally • Coach Kai responds when you pause'
          )}
        </p>
      </motion.div>

      {/* End Call Button (when active) */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Button
            onClick={stopSession}
            variant="outline"
            size="sm"
            className="text-red-500 border-red-300 hover:bg-red-50 hover:text-red-600"
          >
            <PhoneOff className="w-4 h-4 mr-2" />
            End Conversation
          </Button>
        </motion.div>
      )}

      {/* Live Transcript */}
      <AnimatePresence>
        {(currentTranscript || interimTranscript) && isActive && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className={`max-w-sm bg-white border-2 rounded-xl p-3 shadow-lg transition-colors ${
              isUserSpeaking ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-200'
            }`}
          >
            <p className="text-sm text-slate-800">
              <span className="font-medium">{currentTranscript}</span>
              <span className="text-emerald-500 italic">{interimTranscript}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Wave Animation */}
      <AnimatePresence>
        {isUserSpeaking && isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center justify-center gap-1 h-6"
          >
            {[...Array(7)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-emerald-500 rounded-full"
                animate={{
                  height: [6, 20, 6],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.07,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-xs bg-red-50 border border-red-200 rounded-lg p-2 text-center"
          >
            <p className="text-xs text-red-600">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
