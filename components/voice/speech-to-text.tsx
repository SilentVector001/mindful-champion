
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface SpeechToTextProps {
  onTranscript: (text: string) => void;
  onListeningChange: (isListening: boolean) => void;
  disabled?: boolean;
  language?: string;
}

export default function SpeechToText({
  onTranscript,
  onListeningChange,
  disabled = false,
  language = 'en-US'
}: SpeechToTextProps) {
  const [isListening, setIsListening] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check browser support and permissions
  useEffect(() => {
    // Ensure we're in the browser
    if (typeof window === 'undefined') return;
    
    // Check for Speech Recognition API with better browser support
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition ||
      (window as any).mozSpeechRecognition ||
      (window as any).msSpeechRecognition;
    
    if (!SpeechRecognition) {
      // Provide helpful browser-specific error
      const browserName = navigator.userAgent.includes('Firefox') ? 'Firefox' : 
                          navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome') ? 'Safari' :
                          navigator.userAgent.includes('Edge') ? 'Edge' : 'this browser';
      
      setError(`Voice input works best in Chrome. ${browserName} may have limited support.`);
      return;
    }

    // Check microphone permission
    navigator.permissions?.query({ name: 'microphone' as PermissionName })
      .then(result => {
        setPermissionStatus(result.state);
        result.addEventListener('change', () => {
          setPermissionStatus(result.state);
        });
      })
      .catch(() => {
        // Fallback if permissions API not supported
        setPermissionStatus('prompt');
      });

    // Initialize recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setIsInitializing(false);
      setError(null);
      onListeningChange(true);
    };

    recognition.onend = () => {
      setIsListening(false);
      setIsInitializing(false);
      onListeningChange(false);
      
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      setIsInitializing(false);
      onListeningChange(false);
      
      console.log('Speech recognition error:', event.error);
      
      switch (event.error) {
        case 'not-allowed':
        case 'service-not-allowed':
          setError('🎤 Allow microphone access to use voice input');
          setPermissionStatus('denied');
          break;
        case 'no-speech':
          setError('🔇 No speech detected. Try speaking louder or closer to the microphone.');
          // Auto-clear this error after 3 seconds
          setTimeout(() => setError(null), 3000);
          break;
        case 'network':
          setError('📡 Network error. Check your internet connection.');
          break;
        case 'aborted':
          // Normal when user stops manually
          setError(null);
          break;
        case 'audio-capture':
          setError('🎤 Microphone not working. Check device settings.');
          break;
        case 'bad-grammar':
          setError('Speech recognition configuration error.');
          break;
        default:
          setError(`🎤 Voice input error. Try refreshing the page.`);
          console.error('Unhandled speech recognition error:', event.error);
      }
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      setTranscript(prev => prev + finalTranscript);
      setInterimTranscript(interimTranscript);

      // Auto-stop after 3 seconds of silence
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        if (isListening) {
          stopListening();
        }
      }, 3000);

      // Send transcript if we have final results
      if (finalTranscript) {
        onTranscript(finalTranscript.trim());
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognition) {
        recognition.stop();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [language, onTranscript, onListeningChange, isListening]);

  const startListening = useCallback(async () => {
    if (!recognitionRef.current || disabled) return;

    setError(null);
    setTranscript('');
    setInterimTranscript('');
    setIsInitializing(true);

    try {
      // Request microphone permission explicitly
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach(track => track.stop());
      
      // Start speech recognition
      recognitionRef.current.start();
      
      // Set permission status to granted
      setPermissionStatus('granted');
    } catch (err: any) {
      setIsInitializing(false);
      console.error('Microphone access error:', err);
      
      // Provide specific error messages based on error type
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Please allow microphone access and try again');
        setPermissionStatus('denied');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Check your device settings.');
      } else if (err.name === 'NotSupportedError') {
        setError('Voice input not supported in this browser. Try Chrome.');
      } else {
        setError('Unable to start voice input. Please check microphone permissions.');
      }
    }
  }, [disabled]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Send final transcript
    const fullTranscript = (transcript + interimTranscript).trim();
    if (fullTranscript) {
      onTranscript(fullTranscript);
    }
    
    setTranscript('');
    setInterimTranscript('');
  }, [isListening, transcript, interimTranscript, onTranscript]);

  const getMicButtonVariant = () => {
    if (isListening) return 'destructive';
    if (error) return 'secondary';
    return 'default';
  };

  const getMicIcon = () => {
    if (isInitializing) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (isListening) return <Square className="w-4 h-4" />;
    if (permissionStatus === 'denied') return <MicOff className="w-4 h-4" />;
    return <Mic className="w-4 h-4" />;
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Microphone Button */}
      <Button
        variant={getMicButtonVariant()}
        size="sm"
        onClick={isListening ? stopListening : startListening}
        onTouchStart={(e) => {
          e.stopPropagation();
          // Handle touch event for mobile
          if (!disabled && !isInitializing) {
            if (isListening) {
              stopListening();
            } else {
              startListening();
            }
          }
        }}
        disabled={disabled || isInitializing}
        className={`relative h-[56px] w-[56px] sm:h-[40px] sm:w-[40px] min-w-[56px] sm:min-w-[40px] active:scale-90 transition-all ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : permissionStatus === 'denied'
            ? 'bg-orange-500 hover:bg-orange-600'
            : 'bg-emerald-600 hover:bg-emerald-700'
        }`}
        title={
          isListening 
            ? 'Click to stop recording' 
            : permissionStatus === 'denied' 
            ? 'Click to allow microphone access' 
            : 'Click to speak (works best in Chrome)'
        }
      >
        {getMicIcon()}
      </Button>

      {/* Voice Wave Animation */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center space-x-1"
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-blue-500 rounded-full"
                animate={{
                  height: [4, 16, 4],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Transcript Display */}
      <AnimatePresence>
        {(transcript || interimTranscript) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-xs text-center"
          >
            <p className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded">
              <span className="font-medium">{transcript}</span>
              <span className="text-gray-400 italic">{interimTranscript}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xs text-red-500 text-center max-w-xs"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
