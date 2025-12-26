'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseElevenLabsTTSProps {
  voice?: 'rachel' | 'sarah' | 'charlotte' | 'emily';
  autoPlay?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

interface UseElevenLabsTTSReturn {
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

export function useElevenLabsTTS({
  voice = 'rachel',
  autoPlay = false,
  onStart,
  onEnd,
  onError,
}: UseElevenLabsTTSProps = {}): UseElevenLabsTTSReturn {
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

    console.log('🔓 ElevenLabs TTS: Unlocking audio...');

    try {
      // Resume AudioContext
      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        await ctx.resume();
        console.log('🔓 ElevenLabs TTS: AudioContext resumed');
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
      console.log('✅ ElevenLabs TTS: Audio unlocked successfully');
    } catch (err) {
      console.warn('⚠️ ElevenLabs TTS: Could not unlock audio:', err);
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
    console.log('🛑 ElevenLabs TTS: Stopping playback');
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
        cleanupAudioUrl();
        
        const audioUrl = URL.createObjectURL(blob);
        audioUrlRef.current = audioUrl;
        
        console.log('🔊 ElevenLabs TTS: Creating audio element, blob size:', blob.size);

        const audio = new Audio();
        audio.preload = 'auto';
        audio.setAttribute('playsinline', 'true');
        audio.setAttribute('webkit-playsinline', 'true');
        audio.volume = 1.0;
        
        audioRef.current = audio;

        audio.onplay = () => {
          console.log('🔊 ElevenLabs TTS: Playback STARTED');
          if (isMountedRef.current) {
            setIsSpeaking(true);
            setIsLoading(false);
            setIsPaused(false);
            setError(null);
          }
          onStart?.();
        };

        audio.onended = () => {
          console.log('🔇 ElevenLabs TTS: Playback ENDED');
          if (isMountedRef.current) {
            setIsSpeaking(false);
            setIsPaused(false);
          }
          onEnd?.();
          resolve();
        };

        audio.onerror = (e) => {
          const errorMsg = `Audio error: ${audio.error?.message || 'Unknown error'}`;
          console.error('🚨 ElevenLabs TTS: Audio error:', errorMsg);
          if (isMountedRef.current) {
            setError(errorMsg);
            setIsSpeaking(false);
            setIsLoading(false);
          }
          onError?.(new Error(errorMsg));
          reject(new Error(errorMsg));
        };

        audio.src = audioUrl;
        audio.load();

        // Wait for canplaythrough
        await new Promise<void>((waitResolve) => {
          const timeout = setTimeout(() => waitResolve(), 5000);
          audio.addEventListener('canplaythrough', () => {
            clearTimeout(timeout);
            waitResolve();
          }, { once: true });
        });

        console.log('🎵 ElevenLabs TTS: Attempting playback...');
        
        try {
          await audio.play();
          console.log('✅ ElevenLabs TTS: Play() succeeded');
        } catch (playError: any) {
          console.error('🚨 ElevenLabs TTS: Play() failed:', playError.message);
          
          if (playError.name === 'NotAllowedError') {
            setError('Tap to hear Coach Kai');
            setHasAudioReady(true);
            setIsLoading(false);
            return;
          }
          
          throw playError;
        }
        
      } catch (err: any) {
        console.error('🚨 ElevenLabs TTS: playAudioFromBlob error:', err);
        reject(err);
      }
    });
  }, [cleanupAudioUrl, onStart, onEnd, onError]);

  const replay = useCallback(async () => {
    console.log('🔄 ElevenLabs TTS: Replay requested');
    
    if (audioRef.current && audioUrlRef.current) {
      try {
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
        setHasAudioReady(false);
        setError(null);
        console.log('✅ ElevenLabs TTS: Replay succeeded');
      } catch (err: any) {
        console.error('🚨 ElevenLabs TTS: Replay failed:', err);
        setError('Playback failed: ' + err.message);
        onError?.(err);
      }
    } else if (audioBlobRef.current) {
      try {
        await playAudioFromBlob(audioBlobRef.current);
        setHasAudioReady(false);
      } catch (err: any) {
        console.error('🚨 ElevenLabs TTS: Replay from blob failed:', err);
        setError('Playback failed: ' + err.message);
        onError?.(err);
      }
    } else {
      setError('No audio available to replay');
    }
  }, [playAudioFromBlob, onError]);

  const speak = useCallback(async (text: string, messageId?: string) => {
    if (messageId && messageId === lastSpokenMessageIdRef.current) {
      console.log('🚫 ElevenLabs TTS: Already spoke message ID:', messageId);
      return;
    }

    const cleanedText = text.trim();
    if (!cleanedText) return;

    if (cleanedText === lastSpokenTextRef.current && !messageId) {
      console.log('🚫 ElevenLabs TTS: Already spoke this text');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setHasAudioReady(false);

      stop();

      if (!isAudioUnlocked) {
        await unlockAudio();
      }

      const ctx = getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        await ctx.resume();
      }

      console.log(`🔊 ElevenLabs TTS: Fetching audio for: "${cleanedText.substring(0, 50)}..."`);

      const response = await fetch('/api/tts/elevenlabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanedText, voice }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`TTS API error: ${response.status} - ${errorText}`);
      }

      const audioBlob = await response.blob();
      
      console.log('📦 ElevenLabs TTS: Received blob:', audioBlob.size, 'bytes');
      
      if (audioBlob.size < 100) {
        throw new Error('Received invalid audio data');
      }

      audioBlobRef.current = audioBlob;
      lastSpokenTextRef.current = cleanedText;
      if (messageId) {
        lastSpokenMessageIdRef.current = messageId;
      }

      await playAudioFromBlob(audioBlob);

    } catch (err: any) {
      console.error('🚨 ElevenLabs TTS: Speech generation error:', err);
      if (isMountedRef.current) {
        setError(err.message || 'Failed to generate speech');
        setIsSpeaking(false);
        setIsLoading(false);
      }
      onError?.(err);
    }
  }, [voice, stop, unlockAudio, isAudioUnlocked, getAudioContext, playAudioFromBlob, onError]);

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
