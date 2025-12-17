

"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  MessageSquare, 
  Minimize2, 
  Maximize2, 
  Send, 
  Loader2,
  Sparkles,
  Heart,
  Target,
  Trophy,
  Brain,
  Users,
  Volume2,
  VolumeX,
  Settings as SettingsIcon,
  Mic,
  MicOff
} from "lucide-react"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import SpeechToText from "../voice/speech-to-text"
import VoiceSettingsModal, { VoicePreferences } from "../voice/voice-settings-modal"

// Avatar emotional states
export type AvatarEmotion = 
  | 'neutral' 
  | 'encouraging' 
  | 'analytical' 
  | 'celebrating' 
  | 'concerned' 
  | 'motivating'

interface PersistentAvatarProps {
  currentPage?: string
  className?: string
}

const defaultVoicePreferences: VoicePreferences = {
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

// Quick action buttons based on current page
const getQuickActions = (page: string) => {
  const commonActions = [
    { icon: MessageSquare, label: "Ask anything", action: "chat" },
    { icon: Target, label: "Suggest drill", action: "suggest_drill" },
  ]

  switch (page) {
    case 'home':
      return [
        ...commonActions,
        { icon: Trophy, label: "Today's goal", action: "daily_goal" },
        { icon: Sparkles, label: "Quick tip", action: "quick_tip" },
      ]
    case 'train':
      return [
        ...commonActions,
        { icon: Brain, label: "Form check", action: "form_analysis" },
        { icon: Target, label: "Next drill", action: "next_drill" },
      ]
    case 'progress':
      return [
        ...commonActions,
        { icon: Trophy, label: "Analyze stats", action: "analyze_stats" },
        { icon: Sparkles, label: "Improvement plan", action: "improvement_plan" },
      ]
    case 'connect':
      return [
        ...commonActions,
        { icon: Users, label: "Find partners", action: "find_partners" },
        { icon: Heart, label: "Match advice", action: "match_advice" },
      ]
    default:
      return commonActions
  }
}

// Avatar personality responses based on emotion and context
const getContextualGreeting = (emotion: AvatarEmotion, user: any, currentPage: string) => {
  const name = user?.firstName || 'Champion'
  
  const greetings = {
    neutral: {
      home: `Hey ${name}! Coach Kai here. Ready to work on your game today? 🏓`,
      train: `Time to level up, ${name}! What skill should we focus on? 💪`,
      progress: `Let's dive into your stats, ${name}. I see some great improvements! 📊`,
      connect: `Looking for practice partners, ${name}? I can help you find the perfect match! 👥`,
      default: `Hi ${name}! Coach Kai ready to help elevate your pickleball game today! 🏆`
    },
    encouraging: {
      home: `You're doing amazing, ${name}! Your dedication shows. Let's crush today's goals! 🔥`,
      train: `I love your commitment, ${name}! Ready for an awesome training session? ⚡`,
      progress: `${name}, your progress is incredible! Look at how far you've come! 🌟`,
      connect: `You're such a positive player, ${name}. Others love playing with champions like you! 💫`,
      default: `${name}, you're absolutely crushing it! What's next on our champion journey? 🚀`
    },
    analytical: {
      home: `${name}, Coach Kai here. I've been analyzing your recent matches. I have some insights to share! 🧠`,
      train: `Based on your last sessions, ${name}, I think we should focus on specific techniques today 🎯`,
      progress: `${name}, the data shows interesting patterns. Let me break down your performance trends 📈`,
      connect: `${name}, I've identified players who match your style and skill level perfectly! 🔍`,
      default: `${name}, I've been reviewing your game data. Ready for some strategic insights? 📊`
    },
    celebrating: {
      home: `${name}! That last match was INCREDIBLE! You're on fire! 🎉`,
      train: `YES, ${name}! Your technique improvements are paying off big time! 🎊`,
      progress: `${name}, these numbers are FANTASTIC! You've leveled up significantly! 🏆`,
      connect: `${name}, your playing partners keep praising your improved game! 👏`,
      default: `${name}, I'm so proud of your progress! You're becoming a true champion! 🌟`
    },
    concerned: {
      home: `${name}, Coach Kai checking in. I noticed you haven't been on the court lately. Everything okay? 😊`,
      train: `${name}, let's take it easy today. What's been challenging you recently? 🤗`,
      progress: `${name}, I see some areas where we can help you break through plateaus 💝`,
      connect: `${name}, feeling stuck? Sometimes a fresh practice partner makes all the difference! 💪`,
      default: `${name}, I'm here to support you through any challenges. What's on your mind? 💙`
    },
    motivating: {
      home: `${name}! Coach Kai here - Today is THE day to push your limits! Are you ready to dominate? ⚡`,
      train: `${name}, I can feel your champion energy! Let's turn that drive into skill! 🔥`,
      progress: `${name}, you're SO close to your next breakthrough! Let's make it happen! 🚀`,
      connect: `${name}, it's time to level up your game with some competitive matches! 💪`,
      default: `${name}, I believe in you completely! Let's show the court what champions are made of! 🏆`
    }
  }
  
  return greetings[emotion][currentPage as keyof typeof greetings.neutral] || 
         greetings[emotion].default
}

export default function PersistentAvatar({ currentPage = 'home', className }: PersistentAvatarProps) {
  const { data: session } = useSession() || {}
  const [isExpanded, setIsExpanded] = useState(false)
  const [emotion, setEmotion] = useState<AvatarEmotion>('neutral')
  const [message, setMessage] = useState('')
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string, timestamp: Date}>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechEnabled, setSpeechEnabled] = useState(true)
  
  // Voice-related state
  const [voicePreferences, setVoicePreferences] = useState<VoicePreferences>(defaultVoicePreferences)
  const [isListening, setIsListening] = useState(false)
  const [showVoiceSettings, setShowVoiceSettings] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isInitialMountRef = useRef(true) // Track if it's the initial mount to prevent auto-scroll
  const hasScrolledOnceRef = useRef(false) // Prevent scroll until user interacts

  // Determine avatar emotion based on user data and context
  useEffect(() => {
    if (session?.user) {
      const userData = session.user as any
      const winRate = userData?.totalMatches ? (userData.totalWins / userData.totalMatches) : 0
      const streak = userData?.currentStreak || 0
      const lastActive = userData?.lastActiveDate ? new Date(userData.lastActiveDate) : new Date()
      const daysSinceActive = Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24))

      if (daysSinceActive > 3) {
        setEmotion('concerned')
      } else if (winRate > 0.7 || streak >= 5) {
        setEmotion('celebrating')
      } else if (currentPage === 'progress' || currentPage === 'train') {
        setEmotion('analytical')
      } else if (Math.random() > 0.6) {
        setEmotion('encouraging')
      } else {
        setEmotion('neutral')
      }
    }
  }, [session, currentPage])

  // Load voice preferences on mount
  useEffect(() => {
    const loadVoicePreferences = async () => {
      try {
        const response = await fetch('/api/user/voice-preferences');
        if (response.ok) {
          const data = await response.json();
          if (data.preferences) {
            setVoicePreferences({ ...defaultVoicePreferences, ...data.preferences });
          }
        }
      } catch (error) {
        console.error('Failed to load voice preferences:', error);
      }
    };

    if (session?.user) {
      loadVoicePreferences();
    }
  }, [session]);

  // Scroll to bottom of chat - but ONLY when user actively sends messages
  useEffect(() => {
    // Skip scroll on initial mount
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false
      return
    }
    
    // Only scroll if chat is expanded AND user has sent at least one message
    if (isExpanded && chatMessages.length > 0 && hasScrolledOnceRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, isExpanded])

  // Handle voice input
  // Handle voice input - AUTO-SEND IMMEDIATELY
  const handleVoiceInput = (text: string) => {
    if (text.trim()) {
      // Stop any speaking immediately when user starts talking
      if (isSpeaking && typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      
      // Set message and send immediately
      setMessage(text);
      // Use setTimeout with 0ms to ensure state is updated before sending
      setTimeout(() => sendMessage(), 0);
    }
  };

  // Handle listening state change
  const handleListeningChange = (listening: boolean) => {
    setIsListening(listening);
  };

  // Interrupt TTS - allow user to stop Coach Kai from speaking
  const interruptSpeech = () => {
    if (isSpeaking && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Handle voice settings update
  const handleVoiceSettingsChange = (newPreferences: VoicePreferences) => {
    setVoicePreferences(newPreferences);
  };

  const avatarSrc = (session?.user as any)?.avatarPhotoUrl || '/avatars/coach-female-1.jpg'
  const avatarName = 'Coach Kai'

  const sendMessage = async (quickAction?: string) => {
    if ((!message.trim() && !quickAction) || isLoading) return

    // Enable scrolling after first user interaction
    hasScrolledOnceRef.current = true

    const userMessage = quickAction ? getQuickActionMessage(quickAction) : message
    const newUserMessage = { role: 'user' as const, content: userMessage, timestamp: new Date() }
    
    setChatMessages(prev => [...prev, newUserMessage])
    setMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          actionType: quickAction || 'general',
          currentPage,
          emotion
        }),
      })

      if (!response.ok) throw new Error('Failed to get response')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      const assistantMessage = { role: 'assistant' as const, content: '', timestamp: new Date() }
      setChatMessages(prev => [...prev, assistantMessage])

      while (true) {
        const { done, value } = await reader?.read() ?? { done: true, value: undefined }
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                assistantContent += parsed.content
                setChatMessages(prev => {
                  const updated = [...prev]
                  updated[updated.length - 1].content = assistantContent
                  return updated
                })
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      // Auto-speak response if speech is enabled
      if (speechEnabled && assistantContent && voicePreferences.textToSpeechEnabled) {
        speakText(assistantContent)
      }

    } catch (error) {
      console.error('Chat error:', error)
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having trouble connecting right now. Please try again in a moment!", 
        timestamp: new Date() 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const getQuickActionMessage = (action: string) => {
    const messages = {
      chat: message,
      suggest_drill: "Can you suggest a drill I should practice based on my current skill level?",
      daily_goal: "What should my main focus be for today's practice session?",
      quick_tip: "Give me a quick tip to improve my game right now!",
      form_analysis: "Can you help me analyze my form and technique?",
      next_drill: "What drill should I do next in my training session?",
      analyze_stats: "Please analyze my recent performance and stats",
      improvement_plan: "Create an improvement plan based on my progress",
      find_partners: "Help me find good practice partners in my area",
      match_advice: "Give me some pre-match strategy and mental prep tips"
    }
    return messages[action as keyof typeof messages] || message
  }

  const speakText = (text: string) => {
    if (!speechEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return
    
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95
    utterance.pitch = 1.0
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    
    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  const getEmotionColor = (emotion: AvatarEmotion) => {
    const colors = {
      neutral: 'from-slate-500 to-slate-600',
      encouraging: 'from-green-500 to-emerald-600',
      analytical: 'from-blue-500 to-blue-600',
      celebrating: 'from-yellow-500 to-orange-500',
      concerned: 'from-purple-500 to-pink-500',
      motivating: 'from-red-500 to-red-600'
    }
    return colors[emotion]
  }

  if (!session?.user) return null

  return (
    <div className={cn("fixed bottom-4 right-4 z-50", className)}>
      <AnimatePresence>
        {!isExpanded ? (
          // Minimized floating avatar
          <motion.div
            key="minimized"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="relative"
          >
            <Button
              onClick={() => setIsExpanded(true)}
              className="w-16 h-16 rounded-full p-0 shadow-lg hover:shadow-xl transition-all border-2 border-white relative overflow-hidden"
            >
              <div className="relative w-full h-full">
                <Image
                  src={avatarSrc}
                  alt={avatarName}
                  fill
                  className="object-cover rounded-full"
                />
                {/* Emotion indicator */}
                <div className={`absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r ${getEmotionColor(emotion)} rounded-full border-2 border-white`} />
                {/* Speaking indicator */}
                {isSpeaking && (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-2 border-teal-500"
                  />
                )}
              </div>
            </Button>
            
            {/* Quick chat bubble */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-0 right-20 bg-white rounded-lg shadow-lg p-3 max-w-48 border"
            >
              <div className="text-xs font-medium text-teal-600 mb-1">{avatarName}</div>
              <div className="text-sm text-slate-700">
                {getContextualGreeting(emotion, session.user, currentPage)}
              </div>
              <div className="absolute bottom-4 -right-2 w-0 h-0 border-l-8 border-l-white border-t-4 border-t-transparent border-b-4 border-b-transparent" />
            </motion.div>
          </motion.div>
        ) : (
          // Expanded chat interface
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-96 h-[32rem]"
          >
            <Card className="h-full flex flex-col shadow-2xl border-0 bg-white">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10">
                    <Image
                      src={avatarSrc}
                      alt={avatarName}
                      fill
                      className="object-cover rounded-full"
                    />
                    <div className={`absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r ${getEmotionColor(emotion)} rounded-full border border-white`} />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{avatarName}</div>
                    <Badge variant="secondary" className="text-xs">
                      {emotion === 'encouraging' ? '😊 Encouraging' :
                       emotion === 'analytical' ? '🧠 Analyzing' :
                       emotion === 'celebrating' ? '🎉 Celebrating' :
                       emotion === 'concerned' ? '💙 Caring' :
                       emotion === 'motivating' ? '🔥 Motivating' : '💬 Ready'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={speechEnabled ? stopSpeaking : () => setSpeechEnabled(!speechEnabled)}
                    className="h-8 w-8 p-0"
                  >
                    {speechEnabled ? (
                      isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />
                    ) : (
                      <VolumeX className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                  
                  {/* Voice Settings Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowVoiceSettings(true)}
                    className="h-8 w-8 p-0"
                    title="Voice Settings"
                  >
                    <SettingsIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(false)}
                    className="h-8 w-8 p-0"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 && (
                  <div className="text-center text-slate-500 py-8">
                    <div className="text-lg mb-2">
                      {getContextualGreeting(emotion, session.user, currentPage)}
                    </div>
                    <div className="text-sm">Try asking me about drills, strategy, or your progress!</div>
                  </div>
                )}
                
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex",
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg p-3 text-sm",
                        msg.role === 'user'
                          ? 'bg-teal-600 text-white rounded-br-none'
                          : 'bg-slate-100 text-slate-900 rounded-bl-none'
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 rounded-lg rounded-bl-none p-3 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-slate-600">Coach Kai is thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              <div className="p-3 border-t bg-slate-50">
                <div className="text-xs font-medium text-slate-600 mb-2">Quick Actions</div>
                <div className="grid grid-cols-2 gap-2">
                  {getQuickActions(currentPage).map((action, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => sendMessage(action.action)}
                      className="justify-start gap-2 h-8 text-xs"
                      disabled={isLoading}
                    >
                      <action.icon className="h-3 w-3" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="p-4 border-t bg-white">
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={voicePreferences.speechToTextEnabled ? "Type or speak..." : "Ask Coach Kai anything about pickleball..."}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1 text-sm"
                    disabled={isLoading}
                  />
                  
                  {/* Voice Input Button */}
                  {voicePreferences.voiceEnabled && voicePreferences.speechToTextEnabled && (
                    <div className="relative">
                      <SpeechToText
                        onTranscript={handleVoiceInput}
                        onListeningChange={handleListeningChange}
                        disabled={isLoading}
                        language={voicePreferences.language}
                      />
                    </div>
                  )}
                  
                  <Button
                    onClick={() => sendMessage()}
                    disabled={!message.trim() || isLoading}
                    size="sm"
                    className="px-3"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Voice Settings Modal */}
      <VoiceSettingsModal
        isOpen={showVoiceSettings}
        onClose={() => setShowVoiceSettings(false)}
        currentSettings={voicePreferences}
        onSettingsChange={handleVoiceSettingsChange}
      />
    </div>
  )
}
