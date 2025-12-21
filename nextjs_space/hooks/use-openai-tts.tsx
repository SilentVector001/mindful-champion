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
  stop: () => void;
  pause: () => void;
  resume: () => void;
  unlockAudio: () => Promise<void>;
  isSpeaking: boolean;
  isPaused: boolean;
  isLoading: boolean;
  isAudioUnlocked: boolean;
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
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastSpokenTextRef = useRef<string>('');
  const lastSpokenMessageIdRef = useRef<string>('');
  const audioUrlRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Create AudioContext for iOS
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    }
    return audioContextRef.current;
  }, []);

  // Unlock audio for iOS - must be called on user gesture
  const unlockAudio = useCallback(async () => {
    if (isAudioUnlocked) return;

    console.log('🔓 TTS: Unlocking audio for iOS/Safari...');

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
        // Tiny silent WAV base64
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
      stop();
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
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    cleanupAudioUrl();
    if (isMountedRef.current) {
      setIsSpeaking(false);
      setIsPaused(false);
      setIsLoading(false);
    }
  }, [cleanupAudioUrl]);

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

      // Stop any current playback
      stop();

      // On iOS/Safari, ensure audio is unlocked
      const needsUnlock = (isIOS() || isSafari()) && !isAudioUnlocked;
      if (needsUnlock) {
        console.log('⚠️ TTS: Audio not unlocked on iOS. Attempting unlock...');
        await unlockAudio();
      }

      console.log(`🔊 TTS: Requesting speech for text: "${cleanedText.substring(0, 50)}..."`);

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
      
      // Verify we got valid audio
      if (audioBlob.size < 100) {
        throw new Error('Received invalid audio data');
      }

      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;

      // Create audio element with iOS-specific attributes
      const audio = new Audio();
      audio.src = audioUrl;
      audio.setAttribute('playsinline', 'true');
      audio.setAttribute('webkit-playsinline', 'true');
      audio.preload = 'auto';
      
      // For iOS, connect to AudioContext if available
      if ((isIOS() || isSafari()) && audioContextRef.current) {
        try {
          const source = audioContextRef.current.createMediaElementSource(audio);
          source.connect(audioContextRef.current.destination);
        } catch (e) {
          // May fail if already connected, that's ok
          console.log('AudioContext connection:', e);
        }
      }

      audioRef.current = audio;

      // Set up event listeners
      audio.oncanplaythrough = () => {
        console.log('🔊 TTS: Audio ready to play');
      };

      audio.onplay = () => {
        console.log('🔊 TTS: Playback started');
        if (isMountedRef.current) {
          setIsSpeaking(true);
          setIsLoading(false);
          setIsPaused(false);
        }
        lastSpokenTextRef.current = cleanedText;
        if (messageId) {
          lastSpokenMessageIdRef.current = messageId;
        }
        onStart?.();
      };

      audio.onended = () => {
        console.log('🔇 TTS: Playback ended');
        cleanupAudioUrl();
        if (isMountedRef.current) {
          setIsSpeaking(false);
          setIsPaused(false);
        }
        onEnd?.();
      };

      audio.onerror = (err) => {
        console.error('🚨 TTS: Audio playback error:', err, audio.error);
        const error = new Error(`Audio playback failed: ${audio.error?.message || 'Unknown error'}`);
        cleanupAudioUrl();
        if (isMountedRef.current) {
          setError(error.message);
          setIsSpeaking(false);
          setIsLoading(false);
        }
        onError?.(error);
      };

      // Wait for audio to be ready before playing (important for iOS)
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          resolve(); // Proceed anyway after timeout
        }, 3000);

        audio.oncanplaythrough = () => {
          clearTimeout(timeout);
          resolve();
        };

        audio.onerror = () => {
          clearTimeout(timeout);
          reject(new Error('Audio loading failed'));
        };

        audio.load();
      });

      // Start playback
      console.log('🔊 TTS: Starting playback...');
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        await playPromise;
      }

    } catch (err: any) {
      console.error('🚨 TTS: Speech generation error:', err);
      cleanupAudioUrl();
      if (isMountedRef.current) {
        setError(err.message || 'Failed to generate speech');
        setIsSpeaking(false);
        setIsLoading(false);
      }
      onError?.(err);
    }
  }, [voice, speed, stop, cleanupAudioUrl, onStart, onEnd, onError, isAudioUnlocked, unlockAudio]);

  return {
    speak,
    stop,
    pause,
    resume,
    unlockAudio,
    isSpeaking,
    isPaused,
    isLoading,
    isAudioUnlocked,
    error,
  };
}
