
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Settings, MessageCircle, Phone, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import SpeechToText from './speech-to-text';
import TextToSpeech from './text-to-speech';
import { VoicePreferences } from './voice-settings-modal';

interface VoiceChatControlsProps {
  preferences: VoicePreferences;
  isListening: boolean;
  isSpeaking: boolean;
  onVoiceInput: (text: string) => void;
  onListeningChange: (listening: boolean) => void;
  onSpeakingChange: (speaking: boolean) => void;
  onOpenSettings: () => void;
  lastMessage?: string;
  disabled?: boolean;
}

export default function VoiceChatControls({
  preferences,
  isListening,
  isSpeaking,
  onVoiceInput,
  onListeningChange,
  onSpeakingChange,
  onOpenSettings,
  lastMessage,
  disabled = false
}: VoiceChatControlsProps) {
  const [voiceMode, setVoiceMode] = useState<'text' | 'voice'>('text');
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  // Load voice from preferences
  useState(() => {
    if (typeof window !== 'undefined' && preferences.voiceName) {
      const voices = speechSynthesis.getVoices();
      const voice = voices.find(v => v.name === preferences.voiceName);
      if (voice) setSelectedVoice(voice);
    }
  });

  const handleModeToggle = (mode: 'text' | 'voice') => {
    setVoiceMode(mode);
    // Stop any ongoing speech when switching modes
    if (mode === 'text' && isSpeaking) {
      speechSynthesis.cancel();
    }
  };

  const getVoiceModeIcon = () => {
    switch (voiceMode) {
      case 'voice':
        return isListening ? <Phone className="w-4 h-4" /> : <Headphones className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    if (isListening) return 'Listening...';
    if (isSpeaking) return 'Speaking...';
    if (voiceMode === 'voice') return 'Voice Mode';
    return 'Text Mode';
  };

  const getStatusColor = () => {
    if (isListening) return 'text-green-600';
    if (isSpeaking) return 'text-blue-600';
    if (voiceMode === 'voice') return 'text-purple-600';
    return 'text-gray-600';
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-blue-50/30 dark:from-gray-800 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700">
      {/* Left: Voice Mode Toggle */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 p-1 bg-white dark:bg-gray-700 rounded-lg border">
          <Button
            variant={voiceMode === 'text' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleModeToggle('text')}
            disabled={disabled}
            className="h-8 px-3 text-xs"
          >
            <MessageCircle className="w-3 h-3 mr-1" />
            Text
          </Button>
          <Button
            variant={voiceMode === 'voice' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleModeToggle('voice')}
            disabled={disabled || !preferences.voiceEnabled}
            className="h-8 px-3 text-xs"
          >
            <Headphones className="w-3 h-3 mr-1" />
            Voice
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded-full ${
            isListening ? 'bg-green-100 text-green-600' :
            isSpeaking ? 'bg-blue-100 text-blue-600' :
            voiceMode === 'voice' ? 'bg-purple-100 text-purple-600' :
            'bg-gray-100 text-gray-600'
          }`}>
            {getVoiceModeIcon()}
          </div>
          <span className={`text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      {/* Center: Voice Controls (when in voice mode) */}
      <AnimatePresence>
        {voiceMode === 'voice' && preferences.voiceEnabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-2"
          >
            {/* Speech-to-Text Control */}
            {preferences.speechToTextEnabled && (
              <SpeechToText
                onTranscript={onVoiceInput}
                onListeningChange={onListeningChange}
                disabled={disabled}
                language={preferences.language}
              />
            )}

            {/* Text-to-Speech Control */}
            {preferences.textToSpeechEnabled && lastMessage && (
              <>
                <Separator orientation="vertical" className="h-6" />
                <TextToSpeech
                  text={lastMessage}
                  voice={selectedVoice}
                  rate={preferences.rate}
                  pitch={preferences.pitch}
                  volume={preferences.volume}
                  autoPlay={preferences.autoSpeak && !isListening}
                  onSpeakingChange={onSpeakingChange}
                />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right: Settings Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onOpenSettings}
        className="h-8 px-3 text-xs"
        title="Voice & Avatar Settings"
      >
        <Settings className="w-3 h-3 mr-1" />
        Settings
      </Button>
    </div>
  );
}
