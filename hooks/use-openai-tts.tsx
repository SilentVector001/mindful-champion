'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseOpenAITTSProps {
  voice?: 'nova' | 'alloy' | 'echo' | 'fable' | 'onyx' | 'shimmer';
  speed?: number;
  autoPlay?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

interface UseOpenAITTSReturn {
  speak: (text: string, messageId?: string) => Promise<void>;
  replay: () => Promise<void>;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  unlockAudio: () => Promise<void>;
  isSpeaking: boolean;
  isPaused: boolean;
  isLoading: boolean;
  isAudioUnlocked: boolean;
  hasAudioReady: boolean;
  error: string | null;
}

// Detect iOS/Safari
const isIOS = () => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

const isSafari = () => {
  if (typeof window === 'undefined') return false;
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

export function useOpenAITTS({
  voice = 'nova',
  speed = 1.0,
  autoPlay = false,
  onStart,
  onEnd,
  onError,
}: UseOpenAITTSProps = {}): UseOpenAITTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const [hasAudioReady, setHasAudioReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastSpokenTextRef = useRef<string>('');
  const lastSpokenMessageIdRef = useRef<string>('');
  const audioUrlRef = useRef<string | null>(null);
  const audioBlobRef = useRef<Blob | null>(null);
  const isMountedRef = useRef(true);
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);
  const playAttemptRef = useRef(0);

  // Create AudioContext for better playback
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    }
    return audioContextRef.current;
  }, []);

  // Unlock audio - must be called on user gesture
  const unlockAudio = useCallback(async () => {
    if (isAudioUnlocked) return;

    console.log('🔓 TTS: Unlocking audio...');

    try {
      // Resume AudioContext
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        await ctx.resume();
        console.log('🔓 TTS: AudioContext resumed');
      }

      // Play silent audio to unlock
      if (!silentAudioRef.current) {
        silentAudioRef.current = new Audio();
        silentAudioRef.current.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
        silentAudioRef.current.volume = 0.01;
        silentAudioRef.current.setAttribute('playsinline', 'true');
      }

      await silentAudioRef.current.play();
      silentAudioRef.current.pause();

      setIsAudioUnlocked(true);
      console.log('✅ TTS: Audio unlocked successfully');
    } catch (err) {
      console.warn('⚠️ TTS: Could not unlock audio:', err);
    }
  }, [isAudioUnlocked, getAudioContext]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const cleanupAudioUrl = useCallback(() => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    console.log('🛑 TTS: Stopping playback');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (isMountedRef.current) {
      setIsSpeaking(false);
      setIsPaused(false);
      setIsLoading(false);
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current && isSpeaking && !isPaused) {
      audioRef.current.pause();
      setIsPaused(true);
    }
  }, [isSpeaking, isPaused]);

  const resume = useCallback(() => {
    if (audioRef.current && isSpeaking && isPaused) {
      audioRef.current.play().catch((err) => {
        console.error('Failed to resume audio:', err);
        setError('Failed to resume playback');
        onError?.(err);
      });
      setIsPaused(false);
    }
  }, [isSpeaking, isPaused, onError]);

  // Create and play audio from blob
  const playAudioFromBlob = useCallback(async (blob: Blob): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        // Cleanup previous URL
        cleanupAudioUrl();
        
        // Create new URL
        const audioUrl = URL.createObjectURL(blob);
        audioUrlRef.current = audioUrl;
        
        console.log('🔊 TTS: Creating audio element, blob size:', blob.size, 'type:', blob.type);

        // Create new audio element
        const audio = new Audio();
        audio.preload = 'auto';
        audio.setAttribute('playsinline', 'true');
        audio.setAttribute('webkit-playsinline', 'true');
        audio.volume = 1.0;
        
        // Store reference
        audioRef.current = audio;
        
        // Setup event handlers BEFORE setting src
        audio.onloadeddata = () => {
          console.log('🔊 TTS: Audio data loaded, duration:', audio.duration);
        };
        
        audio.oncanplaythrough = () => {
          console.log('🔊 TTS: Audio can play through');
        };

        audio.onplay = () => {
          console.log('🔊 TTS: Playback STARTED');
          if (isMountedRef.current) {
            setIsSpeaking(true);
            setIsLoading(false);
            setIsPaused(false);
            setError(null);
          }
          onStart?.();
        };

        audio.onended = () => {
          console.log('🔇 TTS: Playback ENDED');
          if (isMountedRef.current) {
            setIsSpeaking(false);
            setIsPaused(false);
          }
          onEnd?.();
          resolve();
        };

        audio.onerror = (e) => {
          const errorMsg = `Audio error: ${audio.error?.message || 'Unknown error'} (code: ${audio.error?.code})`;
          console.error('🚨 TTS: Audio error:', errorMsg, e);
          if (isMountedRef.current) {
            setError(errorMsg);
            setIsSpeaking(false);
            setIsLoading(false);
          }
          onError?.(new Error(errorMsg));
          reject(new Error(errorMsg));
        };

        audio.onabort = () => {
          console.log('⚠️ TTS: Audio aborted');
        };

        audio.onstalled = () => {
          console.log('⚠️ TTS: Audio stalled');
        };

        audio.onwaiting = () => {
          console.log('⏳ TTS: Audio waiting for data');
        };

        // Set source
        audio.src = audioUrl;
        
        // Load the audio
        audio.load();

        // Wait for canplaythrough event before playing
        await new Promise<void>((waitResolve) => {
          const timeout = setTimeout(() => {
            console.log('⏰ TTS: Timeout waiting for canplaythrough, attempting play anyway');
            waitResolve();
          }, 5000);

          audio.addEventListener('canplaythrough', () => {
            clearTimeout(timeout);
            waitResolve();
          }, { once: true });
        });

        // Attempt to play
        console.log('🎵 TTS: Attempting playback...');
        playAttemptRef.current++;
        
        try {
          await audio.play();
          console.log('✅ TTS: Play() succeeded');
        } catch (playError: any) {
          console.error('🚨 TTS: Play() failed:', playError.name, playError.message);
          
          // Handle NotAllowedError (autoplay blocked)
          if (playError.name === 'NotAllowedError') {
            setError('Click "Play Response" to hear Coach Kai');
            setHasAudioReady(true);
            setIsLoading(false);
            // Don't reject - audio is ready for manual play
            return;
          }
          
          throw playError;
        }
        
      } catch (err: any) {
        console.error('🚨 TTS: playAudioFromBlob error:', err);
        reject(err);
      }
    });
  }, [cleanupAudioUrl, onStart, onEnd, onError]);

  // Replay the last audio
  const replay = useCallback(async () => {
    console.log('🔄 TTS: Replay requested');
    
    // If we have a ready audio element, try to play it
    if (audioRef.current && audioUrlRef.current) {
      try {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
        setHasAudioReady(false);
        setError(null);
        console.log('✅ TTS: Replay succeeded');
      } catch (err: any) {
        console.error('🚨 TTS: Replay failed:', err);
        setError('Playback failed: ' + err.message);
        onError?.(err);
      }
    } else if (audioBlobRef.current) {
      // Re-create audio from stored blob
      try {
        await playAudioFromBlob(audioBlobRef.current);
        setHasAudioReady(false);
      } catch (err: any) {
        console.error('🚨 TTS: Replay from blob failed:', err);
        setError('Playback failed: ' + err.message);
        onError?.(err);
      }
    } else {
      console.warn('⚠️ TTS: No audio to replay');
      setError('No audio available to replay');
    }
  }, [playAudioFromBlob, onError]);

  const speak = useCallback(async (text: string, messageId?: string) => {
    // Prevent duplicate speech
    if (messageId && messageId === lastSpokenMessageIdRef.current) {
      console.log('🚫 TTS: Already spoke message ID:', messageId);
      return;
    }

    const cleanedText = text.trim();
    if (!cleanedText) {
      console.log('🚫 TTS: Empty text');
      return;
    }

    if (cleanedText === lastSpokenTextRef.current && !messageId) {
      console.log('🚫 TTS: Already spoke this text');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setHasAudioReady(false);

      // Stop any current playback
      stop();

      // Unlock audio if needed
      if (!isAudioUnlocked) {
        console.log('⚠️ TTS: Attempting to unlock audio...');
        await unlockAudio();
      }

      // Resume AudioContext if suspended (important for Chrome)
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        console.log('🔄 TTS: Resuming AudioContext...');
        await ctx.resume();
      }

      console.log(`🔊 TTS: Fetching audio for: "${cleanedText.substring(0, 50)}..."`);

      // Call our OpenAI TTS API
      const response = await fetch('/api/tts/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: cleanedText,
          voice,
          speed,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`TTS API error: ${response.status} - ${errorText}`);
      }

      // Get audio blob
      const audioBlob = await response.blob();
      
      console.log('📦 TTS: Received blob:', audioBlob.size, 'bytes, type:', audioBlob.type);
      
      // Verify we got valid audio
      if (audioBlob.size < 100) {
        throw new Error('Received invalid audio data (too small)');
      }

      // Store the blob for replay
      audioBlobRef.current = audioBlob;
      
      // Store text tracking
      lastSpokenTextRef.current = cleanedText;
      if (messageId) {
        lastSpokenMessageIdRef.current = messageId;
      }

      // Play the audio
      await playAudioFromBlob(audioBlob);

    } catch (err: any) {
      console.error('🚨 TTS: Speech generation error:', err);
      if (isMountedRef.current) {
        setError(err.message || 'Failed to generate speech');
        setIsSpeaking(false);
        setIsLoading(false);
      }
      onError?.(err);
    }
  }, [voice, speed, stop, unlockAudio, isAudioUnlocked, getAudioContext, playAudioFromBlob, onError]);

  return {
    speak,
    replay,
    stop,
    pause,
    resume,
    unlockAudio,
    isSpeaking,
    isPaused,
    isLoading,
    isAudioUnlocked,
    hasAudioReady,
    error,
  };
}
