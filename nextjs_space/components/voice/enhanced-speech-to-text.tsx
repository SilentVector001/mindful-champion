
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Square, Loader2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface EnhancedSpeechToTextProps {
  onTranscript: (text: string) => void;
  onListeningChange: (isListening: boolean) => void;
  disabled?: boolean;
  language?: string;
  pauseThreshold?: number; // milliseconds of silence before auto-sending
  showDebug?: boolean;
}

export default function EnhancedSpeechToText({
  onTranscript,
  onListeningChange,
  disabled = false,
  language = 'en-US',
  pauseThreshold = 1500, // 1.5 seconds default
  showDebug = false
}: EnhancedSpeechToTextProps) {
  const [isListening, setIsListening] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [isProcessing, setIsProcessing] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptBufferRef = useRef<string>('');
  const isManualStopRef = useRef<boolean>(false);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Native Voice Activity Detection using Web Audio API
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const vadIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const volumeThreshold = 30; // Adjust based on sensitivity needed

  // Simple VAD implementation using Web Audio API
  const startVAD = useCallback(async () => {
    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        } 
      });
      
      mediaStreamRef.current = stream;
      
      // Create audio context and analyzer
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const analyzer = audioContextRef.current.createAnalyser();
      
      analyzer.fftSize = 256;
      analyzer.smoothingTimeConstant = 0.8;
      source.connect(analyzer);
      analyserRef.current = analyzer;
      
      // Start VAD monitoring
      vadIntervalRef.current = setInterval(() => {
        if (!analyserRef.current) return;
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        
        // Voice activity detection logic
        if (average > volumeThreshold && !isUserSpeaking) {
          console.log('🎤 Native VAD: Speech started', average);
          setIsUserSpeaking(true);
          
          // Clear silence timer when user starts speaking
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }

          // Clear processing timeout
          if (processingTimeoutRef.current) {
            clearTimeout(processingTimeoutRef.current);
            processingTimeoutRef.current = null;
          }

          // Start speech recognition if not already listening
          if (!isListening && recognitionRef.current && !isProcessing) {
            try {
              recognitionRef.current.start();
              setIsListening(true);
              onListeningChange(true);
            } catch (err) {
              console.log('Recognition already started:', err);
            }
          }
        } else if (average <= volumeThreshold && isUserSpeaking) {
          console.log('🔇 Native VAD: Speech ended', average);
          setIsUserSpeaking(false);

          // Start silence timer for auto-send
          if (isListening && transcriptBufferRef.current.trim() && !isManualStopRef.current) {
            console.log(`⏰ Starting ${pauseThreshold}ms silence timer`);
            silenceTimerRef.current = setTimeout(() => {
              console.log('🚀 Auto-sending due to silence');
              sendTranscript();
            }, pauseThreshold);
          }
        }
      }, 100); // Check every 100ms
      
      console.log('✅ Native VAD started successfully');
    } catch (err) {
      console.error('Failed to start VAD:', err);
      throw err;
    }
  }, [isUserSpeaking, isListening, isProcessing, onListeningChange, pauseThreshold]);

  const stopVAD = useCallback(() => {
    // Stop VAD monitoring
    if (vadIntervalRef.current) {
      clearInterval(vadIntervalRef.current);
      vadIntervalRef.current = null;
    }
    
    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    analyserRef.current = null;
    console.log('🛑 Native VAD stopped');
  }, []);

  // Check browser support and permissions
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Voice input requires Chrome browser for optimal performance.');
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
      .catch(() => setPermissionStatus('prompt'));

    // Initialize recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🎤 Speech recognition started');
      setIsListening(true);
      setIsInitializing(false);
      setError(null);
      onListeningChange(true);
    };

    recognition.onend = () => {
      console.log('🛑 Speech recognition ended');
      setIsListening(false);
      onListeningChange(false);
      
      // Clear timers
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    };

    recognition.onerror = (event: any) => {
      console.error('🚨 Speech recognition error:', event.error);
      setIsListening(false);
      onListeningChange(false);
      
      switch (event.error) {
        case 'not-allowed':
        case 'service-not-allowed':
          setError('🎤 Allow microphone access to use voice input');
          setPermissionStatus('denied');
          break;
        case 'no-speech':
          // Don't show error for no-speech in continuous mode
          if (showDebug) console.log('No speech detected (normal)');
          break;
        case 'network':
          setError('📡 Network error. Check your internet connection.');
          break;
        case 'aborted':
          // Normal when user stops manually
          if (showDebug) console.log('Recognition aborted (normal)');
          break;
        default:
          if (event.error !== 'no-speech') {
            setError('🎤 Voice input error. Please try again.');
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

      // Update transcripts
      if (finalText.trim()) {
        transcriptBufferRef.current += finalText;
        setTranscript(transcriptBufferRef.current);
        console.log('📝 Final transcript added:', finalText.trim());
      }

      setInterimTranscript(interimText);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognition) {
        recognition.stop();
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
      stopVAD();
    };
  }, [language, onListeningChange, pauseThreshold, showDebug, stopVAD]);

  // Send transcript function with processing prevention
  const sendTranscript = useCallback(() => {
    const fullTranscript = transcriptBufferRef.current.trim();
    
    if (fullTranscript && !isProcessing) {
      console.log('📤 Sending transcript:', fullTranscript);
      setIsProcessing(true);
      
      // Clear all timers
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      // Stop VAD and recognition
      stopVAD();
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.stop();
        } catch (err) {
          console.log('Error stopping recognition:', err);
        }
      }

      // Send transcript
      onTranscript(fullTranscript);
      
      // Clear transcript buffer and display
      transcriptBufferRef.current = '';
      setTranscript('');
      setInterimTranscript('');
      
      // Reset states
      setIsListening(false);
      setIsUserSpeaking(false);
      onListeningChange(false);

      // Set timeout to prevent rapid re-processing
      processingTimeoutRef.current = setTimeout(() => {
        setIsProcessing(false);
      }, 2000);
    }
  }, [onTranscript, isListening, isProcessing, onListeningChange, stopVAD]);

  const startListening = useCallback(async () => {
    if (disabled || isProcessing || isInitializing) return;

    setError(null);
    setTranscript('');
    setInterimTranscript('');
    setIsInitializing(true);
    isManualStopRef.current = false;
    transcriptBufferRef.current = '';

    try {
      // Start native VAD (this will request microphone permission)
      await startVAD();
      setPermissionStatus('granted');
      
      setIsInitializing(false);
      
    } catch (err: any) {
      setIsInitializing(false);
      console.error('Microphone access error:', err);
      
      if (err.name === 'NotAllowedError') {
        setError('Please allow microphone access and try again');
        setPermissionStatus('denied');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Check your device settings.');
      } else {
        setError('Unable to start voice input. Please try again.');
      }
    }
  }, [disabled, isProcessing, isInitializing, startVAD]);

  const stopListening = useCallback(() => {
    console.log('🛑 Manual stop requested');
    isManualStopRef.current = true;
    
    // Clear timers
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    // Send any existing transcript immediately
    const fullTranscript = (transcript + interimTranscript).trim();
    if (fullTranscript && !isProcessing) {
      onTranscript(fullTranscript);
    }

    // Stop VAD and recognition
    stopVAD();
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.log('Error stopping recognition:', err);
      }
    }
    
    // Reset states
    transcriptBufferRef.current = '';
    setTranscript('');
    setInterimTranscript('');
    setIsListening(false);
    setIsUserSpeaking(false);
    onListeningChange(false);
  }, [transcript, interimTranscript, onTranscript, isListening, isProcessing, onListeningChange, stopVAD]);

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

  const getStatusText = () => {
    if (isInitializing) return 'Initializing...';
    if (isProcessing) return 'Processing...';
    if (isListening) {
      if (isUserSpeaking) return 'Listening...';
      return 'Ready for voice';
    }
    if (error) return 'Error';
    return 'Click to speak';
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      {/* Enhanced Microphone Button with VAD status */}
      <div className="relative">
        <Button
          variant={getMicButtonVariant()}
          size="sm"
          onClick={isListening ? stopListening : startListening}
          disabled={disabled || isInitializing || isProcessing}
          className={`relative h-[56px] w-[56px] sm:h-[40px] sm:w-[40px] min-w-[56px] sm:min-w-[40px] transition-all transform ${
            isListening 
              ? isUserSpeaking
                ? 'bg-emerald-500 hover:bg-emerald-600 scale-110 animate-pulse shadow-lg shadow-emerald-500/50' 
                : 'bg-blue-500 hover:bg-blue-600 animate-pulse shadow-lg shadow-blue-500/50'
              : permissionStatus === 'denied'
              ? 'bg-orange-500 hover:bg-orange-600'
              : 'bg-gray-600 hover:bg-gray-700'
          } ${!disabled && !isInitializing && !isProcessing ? 'active:scale-90' : ''}`}
          title={
            isListening 
              ? 'Click to stop (or pause speaking to auto-send)' 
              : permissionStatus === 'denied' 
              ? 'Click to allow microphone access' 
              : 'Click to start voice input'
          }
        >
          {getMicIcon()}
        </Button>

        {/* VAD Activity Ring */}
        {isListening && (
          <motion.div
            className={`absolute inset-0 rounded-full border-2 ${
              isUserSpeaking ? 'border-emerald-400' : 'border-blue-400'
            }`}
            animate={{
              scale: isUserSpeaking ? [1, 1.4, 1] : [1, 1.2, 1],
              opacity: [0.7, 0.3, 0.7],
            }}
            transition={{
              duration: isUserSpeaking ? 1 : 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </div>

      {/* Status Text */}
      <div className="text-xs text-center">
        <span className={`font-medium ${
          error ? 'text-red-600' :
          isProcessing ? 'text-orange-600' :
          isListening ? (isUserSpeaking ? 'text-emerald-600' : 'text-blue-600') :
          'text-gray-600'
        }`}>
          {getStatusText()}
        </span>
      </div>

      {/* Enhanced Voice Wave Animation */}
      <AnimatePresence>
        {isUserSpeaking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center space-x-1"
          >
            {[...Array(7)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-emerald-500 rounded-full"
                animate={{
                  height: [6, 20, 6],
                  opacity: [0.4, 1, 0.4]
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.08,
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
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-xs text-center bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-lg p-3 shadow-sm"
          >
            <p className="text-sm text-gray-800">
              <span className="font-medium text-emerald-700">{transcript}</span>
              <span className="text-blue-500 italic">{interimTranscript}</span>
            </p>
            {isListening && !isUserSpeaking && transcript && (
              <p className="text-xs text-gray-500 mt-1">
                Pause speaking to auto-send in {Math.ceil(pauseThreshold / 1000)}s
              </p>
            )}
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
            className="text-xs text-red-600 text-center max-w-xs bg-red-50 border border-red-200 rounded p-2"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Debug Info */}
      {showDebug && (
        <div className="text-xs text-gray-400 text-center max-w-xs">
          VAD: {vadIntervalRef.current ? 'Active' : 'Inactive'} | 
          Recognition: {isListening ? 'On' : 'Off'} | 
          Speaking: {isUserSpeaking ? 'Yes' : 'No'}
        </div>
      )}
    </div>
  );
}
