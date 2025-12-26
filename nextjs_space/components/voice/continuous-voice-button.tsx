'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, Phone, PhoneOff, Loader2, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useMicVAD } from '@ricky0123/vad-react';

interface ContinuousVoiceButtonProps {
  onTranscript: (text: string) => void;
  onSessionChange: (active: boolean) => void;
  onSpeakingChange: (speaking: boolean) => void;
  disabled?: boolean;
  language?: string;
  pauseThreshold?: number; // milliseconds of silence before auto-sending
}

export default function ContinuousVoiceButton({
  onTranscript,
  onSessionChange,
  onSpeakingChange,
  disabled = false,
  language = 'en-US',
  pauseThreshold = 1500
}: ContinuousVoiceButtonProps) {
  const [sessionActive, setSessionActive] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptBufferRef = useRef<string>('');

  // Initialize VAD
  const vad = useMicVAD({
    startOnLoad: false,
    onSpeechStart: () => {
      console.log('🎤 Speech started (VAD)');
      setIsUserSpeaking(true);
      onSpeakingChange(true);
      
      // Clear silence timer when user starts speaking
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }

      // Start speech recognition if not already listening
      if (!isListening && recognitionRef.current && sessionActive) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (err) {
          console.log('Recognition already started or error:', err);
        }
      }
    },
    onSpeechEnd: (audio: Float32Array) => {
      console.log('🔇 Speech ended (VAD)', audio.length, 'samples');
      setIsUserSpeaking(false);
      onSpeakingChange(false);

      // Start silence timer
      if (sessionActive && transcriptBufferRef.current.trim()) {
        silenceTimerRef.current = setTimeout(() => {
          console.log('⏰ Silence threshold reached, sending transcript');
          sendTranscript();
        }, pauseThreshold);
      }
    },
    onVADMisfire: () => {
      console.log('⚠️ VAD misfire detected');
      setIsUserSpeaking(false);
      onSpeakingChange(false);
    },
    baseAssetPath: '/',
    onnxWASMBasePath: '/',
    positiveSpeechThreshold: 0.8,
    negativeSpeechThreshold: 0.5,
    redemptionMs: 256,  // Grace period before finalizing speech end (ms)
    minSpeechMs: 250,   // Minimum speech duration to be considered valid (ms)
    preSpeechPadMs: 300, // Audio to prepend before speech starts (ms)
  });

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Voice input not supported in this browser. Use Chrome for best experience.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🎤 Speech recognition started');
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      console.log('🛑 Speech recognition ended');
      setIsListening(false);

      // Restart if session is still active
      if (sessionActive && !error) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (err) {
            console.log('Could not restart recognition:', err);
          }
        }, 100);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('🚨 Speech recognition error:', event.error);

      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow access and try again.');
        setPermissionGranted(false);
        stopSession();
      } else if (event.error === 'no-speech') {
        // Ignore no-speech errors in continuous mode
        console.log('No speech detected, continuing...');
      } else if (event.error === 'aborted') {
        // Normal when stopping manually
        console.log('Recognition aborted (normal)');
      } else {
        console.warn('Recognition error:', event.error);
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
      if (finalText) {
        transcriptBufferRef.current += finalText;
        setCurrentTranscript(transcriptBufferRef.current);
        console.log('📝 Final transcript:', finalText);
      }

      setInterimTranscript(interimText);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [language, sessionActive, error]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      if (vad.listening) {
        vad.pause();
      }
    };
  }, [vad]);

  const sendTranscript = useCallback(() => {
    const fullTranscript = transcriptBufferRef.current.trim();
    
    if (fullTranscript) {
      console.log('📤 Sending transcript:', fullTranscript);
      onTranscript(fullTranscript);
      
      // Clear transcript buffer
      transcriptBufferRef.current = '';
      setCurrentTranscript('');
      setInterimTranscript('');
    }
  }, [onTranscript]);

  const startSession = useCallback(async () => {
    try {
      setError(null);
      
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionGranted(true);

      // Start VAD
      await vad.start();

      // Start session
      setSessionActive(true);
      onSessionChange(true);
      
      console.log('✅ Continuous conversation session started');
    } catch (err: any) {
      console.error('Failed to start session:', err);
      
      if (err.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone.');
      } else {
        setError('Failed to start voice session. Please try again.');
      }
      
      setPermissionGranted(false);
    }
  }, [vad, onSessionChange]);

  const stopSession = useCallback(() => {
    console.log('🛑 Stopping continuous conversation session');

    // Send any remaining transcript
    if (transcriptBufferRef.current.trim()) {
      sendTranscript();
    }

    // Clear timers
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    // Stop VAD
    if (vad.listening) {
      vad.pause();
    }

    // Stop speech recognition
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.log('Error stopping recognition:', err);
      }
    }

    // Reset state
    setSessionActive(false);
    setIsListening(false);
    setIsUserSpeaking(false);
    onSessionChange(false);
    onSpeakingChange(false);
    transcriptBufferRef.current = '';
    setCurrentTranscript('');
    setInterimTranscript('');
  }, [vad, isListening, sendTranscript, onSessionChange, onSpeakingChange]);

  const toggleSession = () => {
    if (sessionActive) {
      stopSession();
    } else {
      startSession();
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Large Round Microphone Button */}
      <motion.div
        animate={
          isUserSpeaking
            ? {
                scale: [1, 1.1, 1],
                boxShadow: [
                  '0 0 0 0 rgba(16, 185, 129, 0.4)',
                  '0 0 0 20px rgba(16, 185, 129, 0)',
                  '0 0 0 0 rgba(16, 185, 129, 0)',
                ],
              }
            : {}
        }
        transition={{
          duration: 1,
          repeat: isUserSpeaking ? Infinity : 0,
          ease: 'easeInOut',
        }}
        className="relative"
      >
        <Button
          onClick={toggleSession}
          disabled={disabled}
          className={`relative h-20 w-20 rounded-full transition-all duration-300 ${
            sessionActive
              ? isUserSpeaking
                ? 'bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/50'
                : 'bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/50'
              : 'bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 shadow-lg'
          }`}
          title={
            sessionActive
              ? 'End conversation session'
              : 'Start conversation session'
          }
        >
          <motion.div
            animate={sessionActive ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 0.3 }}
          >
            {sessionActive ? (
              isUserSpeaking ? (
                <Volume2 className="w-10 h-10 text-white" />
              ) : (
                <Mic className="w-10 h-10 text-white" />
              )
            ) : (
              <MicOff className="w-10 h-10 text-white" />
            )}
          </motion.div>
        </Button>

        {/* Session Status Ring */}
        {sessionActive && (
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-emerald-500"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.2, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </motion.div>

      {/* Status Text */}
      <AnimatePresence>
        {sessionActive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center"
          >
            <p className="text-xs font-medium text-emerald-600">
              {isUserSpeaking ? '🎤 Listening...' : '🤖 Ready for your voice'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Transcript */}
      <AnimatePresence>
        {(currentTranscript || interimTranscript) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-xs bg-white border-2 border-emerald-200 rounded-lg p-3 shadow-lg"
          >
            <p className="text-sm text-gray-800">
              <span className="font-medium">{currentTranscript}</span>
              <span className="text-gray-400 italic">{interimTranscript}</span>
            </p>
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

      {/* Visual Voice Wave */}
      <AnimatePresence>
        {isUserSpeaking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center justify-center gap-1 h-8"
          >
            {[...Array(7)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-emerald-500 rounded-full"
                animate={{
                  height: [8, 24, 8],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.08,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
