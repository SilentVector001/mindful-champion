// @ts-nocheck
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { SimliClient } from 'simli-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, VideoOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SimliAvatarProps {
  isActive: boolean;
  textToSpeak?: string; // Text for the avatar to speak via TTS
  onError?: (error: string) => void;
  onReady?: () => void;
  onSpeakingStart?: () => void;
  onSpeakingEnd?: () => void;
  className?: string;
}

// Generate silent PCM16 audio (16-bit, 16kHz mono)
function generateSilentAudio(durationMs: number = 100): Uint8Array {
  const sampleRate = 16000;
  const numSamples = Math.floor((sampleRate * durationMs) / 1000);
  // PCM16 = 2 bytes per sample
  return new Uint8Array(numSamples * 2);
}

export default function SimliAvatar({ 
  isActive, 
  textToSpeak, 
  onError, 
  onReady,
  onSpeakingStart,
  onSpeakingEnd,
  className = '' 
}: SimliAvatarProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const simliClientRef = useRef<SimliClient | null>(null);
  const keepAliveRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpokenTextRef = useRef<string>('');
  
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoHidden, setIsVideoHidden] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start keep-alive interval (send silent audio every 2 seconds)
  const startKeepAlive = useCallback(() => {
    if (keepAliveRef.current) return;
    
    keepAliveRef.current = setInterval(() => {
      if (simliClientRef.current && isConnected && !isSpeaking) {
        const silentAudio = generateSilentAudio(100);
        simliClientRef.current.sendAudioData(silentAudio);
      }
    }, 2000);
  }, [isConnected, isSpeaking]);

  // Stop keep-alive
  const stopKeepAlive = useCallback(() => {
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
  }, []);

  // Convert text to speech and send to avatar
  const speakText = useCallback(async (text: string) => {
    if (!simliClientRef.current || !isConnected || !text.trim()) return;
    if (text === lastSpokenTextRef.current) return; // Avoid repeating
    
    lastSpokenTextRef.current = text;
    setIsSpeaking(true);
    onSpeakingStart?.();
    
    try {
      // Get TTS audio from our API
      const response = await fetch('/api/simli/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        console.warn('[Simli] TTS failed, avatar will stay idle');
        setIsSpeaking(false);
        onSpeakingEnd?.();
        return;
      }

      const audioBuffer = await response.arrayBuffer();
      const audioData = new Uint8Array(audioBuffer);
      
      // Send audio to Simli
      simliClientRef.current.sendAudioData(audioData);
      
      // Estimate speaking duration (roughly 150 words per minute)
      const wordCount = text.split(/\s+/).length;
      const durationMs = Math.max(1000, (wordCount / 150) * 60 * 1000);
      
      setTimeout(() => {
        setIsSpeaking(false);
        onSpeakingEnd?.();
      }, durationMs);
      
    } catch (err) {
      console.error('[Simli] TTS error:', err);
      setIsSpeaking(false);
      onSpeakingEnd?.();
    }
  }, [isConnected, onSpeakingStart, onSpeakingEnd]);

  // Initialize Simli client
  const initializeSimli = useCallback(async () => {
    if (!videoRef.current || !audioRef.current) return;
    if (isConnecting || isConnected) return;

    setIsConnecting(true);
    setError(null);

    try {
      // Get session from our API
      const response = await fetch('/api/simli/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const data = await response.json();
      
      if (data.fallback || !response.ok) {
        setError('Avatar unavailable - using text mode');
        onError?.('Avatar service unavailable');
        setIsConnecting(false);
        return;
      }

      // Initialize SimliClient
      const simliClient = new SimliClient();
      
      simliClient.Initialize({
        apiKey: data.apiKey || '',
        faceID: data.faceId,
        handleSilence: true,
        videoRef: videoRef,
        audioRef: audioRef
      });

      // Set up event handlers
      simliClient.on('connected', () => {
        console.log('[Simli] Connected');
        setIsConnected(true);
        setIsConnecting(false);
        onReady?.();
        
        // Send initial silent audio to keep connection alive
        const silentAudio = generateSilentAudio(500);
        simliClient.sendAudioData(silentAudio);
      });

      simliClient.on('disconnected', () => {
        console.log('[Simli] Disconnected');
        setIsConnected(false);
        stopKeepAlive();
      });

      simliClient.on('failed', () => {
        console.error('[Simli] Connection failed');
        setError('Avatar connection failed');
        setIsConnecting(false);
        stopKeepAlive();
        onError?.('Connection failed');
      });

      // Start the connection
      await simliClient.start();
      simliClientRef.current = simliClient;

    } catch (err: any) {
      console.error('[Simli] Init error:', err);
      setError('Failed to initialize avatar');
      setIsConnecting(false);
      onError?.(err.message);
    }
  }, [isConnecting, isConnected, onError, onReady, stopKeepAlive]);

  // Connect when active
  useEffect(() => {
    if (isActive && !isConnected && !isConnecting) {
      initializeSimli();
    }
  }, [isActive, isConnected, isConnecting, initializeSimli]);

  // Start keep-alive when connected
  useEffect(() => {
    if (isConnected) {
      startKeepAlive();
    }
    return () => stopKeepAlive();
  }, [isConnected, startKeepAlive, stopKeepAlive]);

  // Speak text when it changes
  useEffect(() => {
    if (textToSpeak && isConnected) {
      speakText(textToSpeak);
    }
  }, [textToSpeak, isConnected, speakText]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopKeepAlive();
      if (simliClientRef.current) {
        simliClientRef.current.close();
        simliClientRef.current = null;
      }
    };
  }, [stopKeepAlive]);

  // Toggle mute
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  // Toggle video visibility
  const toggleVideo = () => {
    setIsVideoHidden(!isVideoHidden);
  };

  // If not active or has error, show placeholder
  if (!isActive || error) {
    return (
      <div className={`relative rounded-full overflow-hidden bg-gradient-to-br from-teal-400 to-teal-600 ${className}`}>
        <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
          K
        </div>
        {error && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-xs text-center py-1 text-white/80">
            Text mode
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-slate-800 ${className}`}>
      {/* Video element for avatar */}
      <AnimatePresence>
        {!isVideoHidden && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full"
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }} // Mirror the avatar
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio element (hidden) */}
      <audio ref={audioRef} autoPlay className="hidden" />

      {/* Loading overlay */}
      {isConnecting && (
        <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-teal-400 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Connecting avatar...</p>
          </div>
        </div>
      )}

      {/* Controls overlay */}
      {isConnected && (
        <div className="absolute bottom-2 right-2 flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleMute}
            className="w-8 h-8 bg-black/50 hover:bg-black/70 text-white"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={toggleVideo}
            className="w-8 h-8 bg-black/50 hover:bg-black/70 text-white"
          >
            {isVideoHidden ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
          </Button>
        </div>
      )}

      {/* Fallback "K" when video is hidden */}
      {isVideoHidden && isConnected && (
        <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-4xl font-bold">
          K
        </div>
      )}
    </div>
  );
}
