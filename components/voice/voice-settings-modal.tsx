
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Mic, Volume2, Palette, Save, X, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useSession } from 'next-auth/react';
import { VoiceSelector, VoiceSettings } from './text-to-speech';
import TextToSpeech from './text-to-speech';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: VoicePreferences;
  onSettingsChange: (settings: VoicePreferences) => void;
}

export interface VoicePreferences {
  voiceEnabled: boolean;
  speechToTextEnabled: boolean;
  textToSpeechEnabled: boolean;
  voiceName?: string;
  rate: number;
  pitch: number;
  volume: number;
  interactionMode: 'text' | 'voice' | 'both';
  avatarName: string;
  avatarType: string;
  autoSpeak: boolean;
  language: string;
}

const defaultSettings: VoicePreferences = {
  voiceEnabled: true,
  speechToTextEnabled: true,
  textToSpeechEnabled: true,
  rate: 1,
  pitch: 1,
  volume: 0.8,
  interactionMode: 'both',
  avatarName: 'Coach Kai',
  avatarType: 'default',
  autoSpeak: false,
  language: 'en-US'
};

export default function VoiceSettingsModal({
  isOpen,
  onClose,
  currentSettings,
  onSettingsChange
}: VoiceSettingsModalProps) {
  const { data: session } = useSession() || {};
  const [settings, setSettings] = useState<VoicePreferences>(currentSettings);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [testText, setTestText] = useState("Hey there! This is how I'll sound when we chat. Pretty cool, right?");
  const [isSaving, setIsSaving] = useState(false);

  // Load voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        setAvailableVoices(voices);
        
        // Find current voice or select default
        const voice = voices.find(v => v.name === settings.voiceName) || 
                     voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) ||
                     voices.find(v => v.lang.startsWith('en')) ||
                     voices[0];
        
        setSelectedVoice(voice);
      };

      if (speechSynthesis.getVoices().length > 0) {
        loadVoices();
      } else {
        speechSynthesis.addEventListener('voiceschanged', loadVoices);
        return () => speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      }
    }
  }, [settings.voiceName]);

  const handleSettingChange = (key: keyof VoicePreferences, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleVoiceChange = (voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice);
    setSettings(prev => ({ ...prev, voiceName: voice.name }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/voice-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: {
            ...settings,
            voiceName: selectedVoice?.name
          }
        })
      });

      if (!response.ok) throw new Error('Failed to save preferences');

      onSettingsChange(settings);
      onClose();
    } catch (error) {
      console.error('Error saving voice preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings(defaultSettings);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          <Card className="bg-white dark:bg-gray-800 shadow-2xl border-0">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Voice & Avatar Settings
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Customize your Coach Kai experience
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="max-h-[calc(90vh-140px)] overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Quick Toggles */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Mic className="w-4 h-4 text-blue-600" />
                          <h3 className="font-semibold text-sm">Speech-to-Text</h3>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Speak your messages
                        </p>
                      </div>
                      <Switch
                        checked={settings.speechToTextEnabled}
                        onCheckedChange={(checked) => 
                          handleSettingChange('speechToTextEnabled', checked)
                        }
                      />
                    </div>
                  </Card>

                  <Card className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Volume2 className="w-4 h-4 text-emerald-600" />
                          <h3 className="font-semibold text-sm">Text-to-Speech</h3>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Coach Kai speaks
                        </p>
                      </div>
                      <Switch
                        checked={settings.textToSpeechEnabled}
                        onCheckedChange={(checked) => 
                          handleSettingChange('textToSpeechEnabled', checked)
                        }
                      />
                    </div>
                  </Card>
                </div>

                <Separator />

                <Tabs defaultValue="voice" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="voice" className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4" />
                      Voice Settings
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Advanced
                    </TabsTrigger>
                  </TabsList>

                  {/* Voice Settings Tab */}
                  <TabsContent value="voice" className="space-y-5">
                    {settings.textToSpeechEnabled && (
                      <>
                        <VoiceSelector
                          voices={availableVoices}
                          selectedVoice={selectedVoice}
                          onVoiceChange={handleVoiceChange}
                        />

                        <VoiceSettings
                          rate={settings.rate}
                          pitch={settings.pitch}
                          volume={settings.volume}
                          onRateChange={(rate) => handleSettingChange('rate', rate)}
                          onPitchChange={(pitch) => handleSettingChange('pitch', pitch)}
                          onVolumeChange={(volume) => handleSettingChange('volume', volume)}
                        />

                        <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border-amber-200 dark:border-amber-800">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <TestTube className="w-4 h-4 text-amber-600" />
                              <span className="text-sm font-semibold">Test Voice</span>
                            </div>
                          </div>
                          <TextToSpeech
                            text={testText}
                            voice={selectedVoice}
                            rate={settings.rate}
                            pitch={settings.pitch}
                            volume={settings.volume}
                          />
                        </Card>
                      </>
                    )}
                  </TabsContent>

                  {/* Advanced Settings Tab */}
                  <TabsContent value="advanced" className="space-y-5">
                    <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Auto-speak responses</h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Coach Kai automatically speaks new messages
                        </p>
                      </div>
                      <Switch
                        checked={settings.autoSpeak}
                        onCheckedChange={(checked) => 
                          handleSettingChange('autoSpeak', checked)
                        }
                      />
                    </div>

                    {settings.speechToTextEnabled && (
                      <div>
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                          Speech Language
                        </label>
                        <select
                          value={settings.language}
                          onChange={(e) => handleSettingChange('language', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 font-medium"
                        >
                          <option value="en-US">🇺🇸 English (US)</option>
                          <option value="en-GB">🇬🇧 English (UK)</option>
                          <option value="es-ES">🇪🇸 Spanish</option>
                          <option value="fr-FR">🇫🇷 French</option>
                          <option value="de-DE">🇩🇪 German</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                        Coach Name
                      </label>
                      <input
                        type="text"
                        value={settings.avatarName}
                        onChange={(e) => handleSettingChange('avatarName', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg dark:border-gray-600 dark:bg-gray-800 font-medium"
                        placeholder="Coach Kai"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={resetToDefaults}>
                Reset Defaults
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
