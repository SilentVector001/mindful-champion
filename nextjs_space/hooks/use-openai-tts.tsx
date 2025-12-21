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
  isSpeaking: boolean;
  isPaused: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useOpenAITTS({
  voice = 'nova', // Nova voice is warm and natural
  speed = 1.0,
  autoPlay = false,
  onStart,
  onEnd,
  onError,
}: UseOpenAITTSProps = {}): UseOpenAITTSReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSpokenTextRef = useRef<string>('');
  const lastSpokenMessageIdRef = useRef<string>('');
  const audioUrlRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      stop();
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
    // Don't reset lastSpokenTextRef to prevent immediate re-speak
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
        throw new Error(`TTS API error: ${response.status}`);
      }

      // Get audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;

      // Create audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Set up event listeners
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
        console.error('🚨 TTS: Audio playback error:', err);
        const error = new Error('Audio playback failed');
        cleanupAudioUrl();
        if (isMountedRef.current) {
          setError(error.message);
          setIsSpeaking(false);
          setIsLoading(false);
        }
        onError?.(error);
      };

      // Start playback
      await audio.play();

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
  }, [voice, speed, stop, cleanupAudioUrl, onStart, onEnd, onError]);

  return {
    speak,
    stop,
    pause,
    resume,
    isSpeaking,
    isPaused,
    isLoading,
    error,
  };
}
