
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { motion, AnimatePresence } from 'framer-motion';

interface TextToSpeechProps {
  text?: string;
  messageId?: string; // CRITICAL: Track which specific message to prevent duplicate plays
  voice?: SpeechSynthesisVoice | null;
  rate?: number;
  pitch?: number;
  volume?: number;
  autoPlay?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onSpeakingChange?: (isSpeaking: boolean) => void;
  className?: string;
}

export default function TextToSpeech({
  text = '',
  messageId = '',
  voice = null,
  rate = 1,
  pitch = 1,
  volume = 1,
  autoPlay = false,
  onStart,
  onEnd,
  onSpeakingChange,
  className
}: TextToSpeechProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(voice);
  const [settings, setSettings] = useState({
    rate,
    pitch,
    volume
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const textRef = useRef<string>('');
  const hasSpokenRef = useRef<boolean>(false);
  const lastSpokenTextRef = useRef<string>(''); // Track what was actually spoken to prevent duplicates
  const lastSpokenMessageIdRef = useRef<string>(''); // CRITICAL: Track message ID to prevent duplicate plays
  const isSpeakingLockedRef = useRef<boolean>(false); // Lock to prevent concurrent speech attempts
  const lastSpeakTimeRef = useRef<number>(0); // Cooldown to prevent rapid-fire repetition

  // Initialize TTS
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      
      // Load voices
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        setAvailableVoices(voices);
        
        // Auto-select best English voice
        if (!currentVoice && voices.length > 0) {
          const englishVoice = voices.find(v => 
            v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Google'))
          ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
          
          setCurrentVoice(englishVoice);
        }
      };

      // Voices might load asynchronously
      if (speechSynthesis.getVoices().length > 0) {
        loadVoices();
      } else {
        speechSynthesis.addEventListener('voiceschanged', loadVoices);
        return () => speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      }
    }
  }, [currentVoice]);

  // Create utterance
  const createUtterance = useCallback((textToSpeak: string) => {
    if (!isSupported) return null;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    if (currentVoice) {
      utterance.voice = currentVoice;
    }
    
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = settings.volume;

    utterance.onstart = () => {
      console.log('🔊 TTS: Speech started');
      setIsSpeaking(true);
      setIsPaused(false);
      hasSpokenRef.current = true;
      onStart?.();
      onSpeakingChange?.(true);
    };

    utterance.onend = () => {
      console.log('🔇 TTS: Speech ended');
      setIsSpeaking(false);
      setIsPaused(false);
      
      // CRITICAL: Release the speaking lock after speech completes
      isSpeakingLockedRef.current = false;
      
      // DON'T reset lastSpokenTextRef or lastSpokenMessageIdRef here
      // This prevents immediate repetition of the same message
      // They will only be reset when user manually stops or a genuinely new message arrives
      
      onEnd?.();
      onSpeakingChange?.(false);
    };

    utterance.onerror = (event) => {
      console.error('🚨 TTS: Speech synthesis error:', event.error);
      setIsSpeaking(false);
      setIsPaused(false);
      
      // CRITICAL: Release lock on error
      isSpeakingLockedRef.current = false;
      
      onSpeakingChange?.(false);
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    return utterance;
  }, [isSupported, currentVoice, settings, onStart, onEnd, onSpeakingChange]);

  // Function to strip emojis and clean text for TTS
  const cleanTextForSpeech = (text: string): string => {
    return text
      // Remove ALL emojis using comprehensive regex
      .replace(/[\u{1F000}-\u{1F9FF}]/gu, '') // Emoticons, symbols, pictographs
      .replace(/[\u{2600}-\u{27BF}]/gu, '') // Miscellaneous symbols
      .replace(/[\u{2300}-\u{23FF}]/gu, '') // Miscellaneous technical
      .replace(/[\u{2B50}]/gu, '') // Star and other misc
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Symbols & Pictographs
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport & Map
      .replace(/[\u{1F700}-\u{1F77F}]/gu, '') // Alchemical
      .replace(/[\u{1F780}-\u{1F7FF}]/gu, '') // Geometric Shapes
      .replace(/[\u{1F800}-\u{1F8FF}]/gu, '') // Supplemental Arrows
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols
      .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Chess Symbols
      .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols and Pictographs Extended-A
      .replace(/[\uFE00-\uFE0F]/g, '') // Variation Selectors
      .replace(/\u200D/g, '') // Zero Width Joiner
      .replace(/\u20E3/g, '') // Combining Enclosing Keycap
      // Remove any remaining emoji-like unicode
      .replace(/[^\p{L}\p{N}\p{P}\p{Z}^$\n]/gu, '')
      // Clean up extra whitespace
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Speak function with COMPREHENSIVE anti-repetition protection
  const speak = useCallback((textToSpeak?: string, forceMessageId?: string) => {
    if (!isSupported) {
      console.log('🚫 TTS: Not supported');
      return;
    }

    // PROTECTION 1: Check if already speaking (lock)
    if (isSpeakingLockedRef.current) {
      console.log('🚫 TTS: Speaking locked - already processing speech');
      return;
    }

    const finalText = textToSpeak || text;
    const finalMessageId = forceMessageId || messageId;
    
    if (!finalText.trim()) {
      console.log('🚫 TTS: Empty text');
      return;
    }

    // Clean text by removing emojis
    const cleanedText = cleanTextForSpeech(finalText);
    if (!cleanedText.trim()) {
      console.log('🚫 TTS: Empty after cleaning');
      return;
    }

    // PROTECTION 2: Check if we already spoke this exact message ID
    if (finalMessageId && finalMessageId === lastSpokenMessageIdRef.current) {
      console.log('🚫 TTS: Already spoke message ID:', finalMessageId);
      return;
    }

    // PROTECTION 3: Check if we already spoke this exact text
    if (cleanedText === lastSpokenTextRef.current) {
      console.log('🚫 TTS: Already spoke this exact text, skipping to prevent repetition');
      return;
    }

    // PROTECTION 4: Cooldown check (prevent rapid-fire repetition within 2 seconds)
    const now = Date.now();
    const timeSinceLastSpeak = now - lastSpeakTimeRef.current;
    if (timeSinceLastSpeak < 2000 && lastSpokenTextRef.current === cleanedText) {
      console.log('🚫 TTS: Cooldown active - only', timeSinceLastSpeak, 'ms since last speak');
      return;
    }

    console.log('🔊 TTS: ✅ ALL CHECKS PASSED - Speaking new message');
    console.log('   Message ID:', finalMessageId);
    console.log('   Text preview:', cleanedText.substring(0, 50) + '...');

    // Lock to prevent concurrent attempts
    isSpeakingLockedRef.current = true;

    // Stop any current speech
    speechSynthesis.cancel();

    // Create and start new utterance
    const utterance = createUtterance(cleanedText);
    if (utterance) {
      utteranceRef.current = utterance;
      textRef.current = cleanedText;
      lastSpokenTextRef.current = cleanedText; // Track what we're speaking
      lastSpokenMessageIdRef.current = finalMessageId; // Track message ID
      lastSpeakTimeRef.current = now; // Track when we started
      speechSynthesis.speak(utterance);
    } else {
      // Failed to create utterance, release lock
      isSpeakingLockedRef.current = false;
    }
  }, [isSupported, text, messageId, createUtterance]);

  // Stop function - allows user to manually stop and reset
  const stop = useCallback(() => {
    if (!isSupported) return;
    
    console.log('🛑 TTS: Manual stop triggered');
    
    speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    
    // Reset all tracking - allows message to be replayed if needed
    hasSpokenRef.current = false;
    lastSpokenTextRef.current = '';
    lastSpokenMessageIdRef.current = '';
    isSpeakingLockedRef.current = false; // Release lock
    
    onSpeakingChange?.(false);
  }, [isSupported, onSpeakingChange]);

  // Pause/Resume functions
  const pause = useCallback(() => {
    if (!isSupported || !isSpeaking) return;
    speechSynthesis.pause();
  }, [isSupported, isSpeaking]);

  const resume = useCallback(() => {
    if (!isSupported || !isPaused) return;
    speechSynthesis.resume();
  }, [isSupported, isPaused]);

  // Auto-play effect with BULLETPROOF repetition prevention
  useEffect(() => {
    if (!autoPlay || !text) {
      return;
    }

    const trimmedText = text.trim();
    if (!trimmedText) {
      return;
    }

    // Clean the text first (same as speak() will do)
    const cleanedText = cleanTextForSpeech(trimmedText);
    if (!cleanedText) {
      return;
    }

    // COMPREHENSIVE CHECKS before attempting to speak
    const isNewMessageId = messageId && messageId !== lastSpokenMessageIdRef.current;
    const isNewText = cleanedText !== lastSpokenTextRef.current;
    const isNotCurrentlySpeaking = !isSpeaking;
    const isNotLocked = !isSpeakingLockedRef.current;
    
    console.log('🔍 TTS: Auto-play effect triggered');
    console.log('   New Message ID:', isNewMessageId, `(${messageId} vs ${lastSpokenMessageIdRef.current})`);
    console.log('   New Text:', isNewText);
    console.log('   Not Speaking:', isNotCurrentlySpeaking);
    console.log('   Not Locked:', isNotLocked);
    
    // Only play if it's genuinely a new message
    if ((isNewMessageId || isNewText) && isNotCurrentlySpeaking && isNotLocked) {
      console.log('✅ TTS: Conditions met - will auto-play');
      
      // Use a small delay to ensure the component is stable and to debounce rapid changes
      const timeoutId = setTimeout(() => {
        // Final safety check before speaking
        const stillNew = messageId ? messageId !== lastSpokenMessageIdRef.current : cleanedText !== lastSpokenTextRef.current;
        const stillNotSpeaking = !isSpeaking && !isSpeakingLockedRef.current;
        
        if (stillNew && stillNotSpeaking) {
          console.log('✅ TTS: Final checks passed - calling speak()');
          speak();
        } else {
          console.log('🚫 TTS: Final check failed - another process took over');
        }
      }, 150); // Slightly longer delay for better stability
      
      return () => {
        console.log('🧹 TTS: Cleaning up auto-play timeout');
        clearTimeout(timeoutId);
      };
    } else {
      console.log('🚫 TTS: Skipping auto-play');
      if (!isNewMessageId && !isNewText) {
        console.log('   Reason: Already spoke this message');
      }
      if (!isNotCurrentlySpeaking) {
        console.log('   Reason: Currently speaking');
      }
      if (!isNotLocked) {
        console.log('   Reason: Speaking is locked');
      }
    }
  }, [text, messageId, autoPlay, isSpeaking, speak]); // Include all relevant dependencies

  // Voice wave animation component
  const VoiceWave = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="flex items-center space-x-1"
    >
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-green-500 rounded-full"
          animate={{
            height: [4, 12, 4],
            opacity: [0.4, 1, 0.4]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut'
          }}
        />
      ))}
    </motion.div>
  );

  if (!isSupported) {
    return (
      <div className={`text-xs text-gray-500 ${className}`}>
        Text-to-speech not supported
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Main Control Button */}
      <Button
        variant={isSpeaking ? 'secondary' : 'default'}
        size="sm"
        onClick={isSpeaking ? stop : () => speak()}
        disabled={!text.trim()}
        className={`${
          isSpeaking 
            ? 'bg-green-100 hover:bg-green-200 text-green-700' 
            : 'bg-green-600 hover:bg-green-700'
        }`}
        title={isSpeaking ? 'Stop speaking' : 'Speak text'}
      >
        {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </Button>

      {/* Pause/Resume Button (only when speaking) */}
      <AnimatePresence>
        {isSpeaking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={isPaused ? resume : pause}
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Wave Animation */}
      <AnimatePresence>
        {isSpeaking && !isPaused && <VoiceWave />}
      </AnimatePresence>
    </div>
  );
}

// Voice selector component
interface VoiceSelectorProps {
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  onVoiceChange: (voice: SpeechSynthesisVoice) => void;
}

export function VoiceSelector({ voices, selectedVoice, onVoiceChange }: VoiceSelectorProps) {
  const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
  
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Voice Selection
      </label>
      <select
        value={selectedVoice?.name || ''}
        onChange={(e) => {
          const voice = voices.find(v => v.name === e.target.value);
          if (voice) onVoiceChange(voice);
        }}
        className="w-full p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-800"
      >
        {englishVoices.map((voice) => (
          <option key={voice.name} value={voice.name}>
            {voice.name} ({voice.lang})
          </option>
        ))}
      </select>
    </div>
  );
}

// Voice settings component
interface VoiceSettingsProps {
  rate: number;
  pitch: number;
  volume: number;
  onRateChange: (rate: number) => void;
  onPitchChange: (pitch: number) => void;
  onVolumeChange: (volume: number) => void;
}

export function VoiceSettings({
  rate,
  pitch,
  volume,
  onRateChange,
  onPitchChange,
  onVolumeChange
}: VoiceSettingsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Speed: {rate.toFixed(1)}x
        </label>
        <Slider
          value={[rate]}
          onValueChange={([value]) => onRateChange(value)}
          min={0.5}
          max={2}
          step={0.1}
          className="mt-2"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Pitch: {pitch.toFixed(1)}
        </label>
        <Slider
          value={[pitch]}
          onValueChange={([value]) => onPitchChange(value)}
          min={0.5}
          max={2}
          step={0.1}
          className="mt-2"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Volume: {Math.round(volume * 100)}%
        </label>
        <Slider
          value={[volume]}
          onValueChange={([value]) => onVolumeChange(value)}
          min={0}
          max={1}
          step={0.1}
          className="mt-2"
        />
      </div>
    </div>
  );
}
