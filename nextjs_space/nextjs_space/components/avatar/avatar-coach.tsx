

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  MessageCircle, 
  X, 
  Send, 
  Sparkles,
  Trophy,
  TrendingUp,
  Users,
  Video,
  Target,
  Minimize2,
  Maximize2
} from "lucide-react"
import { cn } from "@/lib/utils"

type AvatarEmotion = 'neutral' | 'encouraging' | 'analytical' | 'celebrating' | 'concerned' | 'motivating'

interface Message {
  id: string
  role: 'user' | 'coach'
  content: string
  timestamp: Date
}

interface AvatarCoachProps {
  userName?: string
  context?: string
  className?: string
  // Legacy props for backwards compatibility
  message?: string
  avatarType?: string
  avatarPhotoUrl?: string
  avatarName?: string
  voiceEnabled?: boolean
  size?: string
}

export default function AvatarCoach({ userName = "Champion", context = "home", className }: AvatarCoachProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [emotion, setEmotion] = useState<AvatarEmotion>('neutral')
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  // Context-aware greeting - more energetic and personal
  const getContextGreeting = () => {
    const greetings = {
      home: `What's up, ${userName}! 🏓 Coach Kai here - let's crush it today! What are we working on?`,
      train: `Hey ${userName}! 💪 Ready to train? Upload that match video and I'll break down your technique like a pro!`,
      progress: `${userName}! 🔥 Checking in on your progress - you're leveling up fast! Let's see those stats!`,
      connect: `Looking for someone to play with, ${userName}? 🎯 I'll help you find the perfect partner - let's do this!`,
      video: `Coach Kai ready! 📹 Drop that match footage and I'll spot every opportunity to improve. Let's go!`,
    }
    return greetings[context as keyof typeof greetings] || greetings.home
  }

  // Quick action suggestions based on context
  const getQuickActions = () => {
    const actions = {
      home: [
        { icon: Target, label: "Show me a drill", action: "drill" },
        { icon: TrendingUp, label: "Analyze my progress", action: "progress" },
        { icon: Users, label: "Find a partner", action: "partner" },
      ],
      train: [
        { icon: Video, label: "Upload video", action: "upload" },
        { icon: Target, label: "Browse drills", action: "drills" },
        { icon: Trophy, label: "Quick practice", action: "practice" },
      ],
      progress: [
        { icon: TrendingUp, label: "View trends", action: "trends" },
        { icon: Trophy, label: "My goals", action: "goals" },
        { icon: Sparkles, label: "Achievements", action: "achievements" },
      ],
      connect: [
        { icon: Users, label: "Find partners", action: "partners" },
        { icon: Trophy, label: "Join tournament", action: "tournament" },
        { icon: MessageCircle, label: "Community", action: "community" },
      ],
    }
    return actions[context as keyof typeof actions] || actions.home
  }

  // Initialize with greeting
  useEffect(() => {
    if (isExpanded && messages.length === 0) {
      setMessages([{
        id: '1',
        role: 'coach',
        content: getContextGreeting(),
        timestamp: new Date()
      }])
    }
  }, [isExpanded])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)
    setEmotion('analytical')

    try {
      // Call the REAL Coach Kai API with streaming
      const response = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputValue,
          actionType: 'general',
          currentPage: context,
          emotion: emotion,
          conversationHistory: messages.map(m => ({
            role: m.role === 'coach' ? 'assistant' : m.role,
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  aiContent += data.content;
                  // Update message in real-time
                  setMessages(prev => {
                    const lastMsg = prev[prev.length - 1];
                    if (lastMsg?.role === 'coach' && lastMsg.id === 'streaming') {
                      return [
                        ...prev.slice(0, -1),
                        { ...lastMsg, content: aiContent }
                      ];
                    }
                    return [...prev, {
                      id: 'streaming',
                      role: 'coach' as const,
                      content: aiContent,
                      timestamp: new Date()
                    }];
                  });
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      // Finalize message with proper ID
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== 'streaming');
        return [...filtered, {
          id: Date.now().toString(),
          role: 'coach' as const,
          content: aiContent,
          timestamp: new Date()
        }];
      });
      
      setIsTyping(false);
      setEmotion('encouraging');
    } catch (error) {
      console.error('Coach Kai error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'coach',
        content: "Sorry, I'm having trouble right now. Try again? 🔄",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
      setEmotion('concerned');
    }
  }

  const generateCoachResponse = (userInput: string): string => {
    // Enhanced personality - direct, motivating, like talking to a friend
    const input = userInput.toLowerCase()
    
    if (input.includes('serve') || input.includes('serving')) {
      return `${userName}, let's nail that serve! 🎯 Here's the deal: toss height + paddle angle = power. I've got the perfect drill for you - "Serve Accuracy Challenge" in your library. 10 minutes a day and you'll be crushing it. Ready?`
    } 
    
    if (input.includes('backhand') || input.includes('back hand')) {
      return `Backhand game needs work? I got you! 💪 Focus on paddle position and footwork. Third shot drops are where the magic happens. Let's run through some drills - I'll show you exactly what to practice. Sound good?`
    } 
    
    if (input.includes('partner') || input.includes('play') || input.includes('match')) {
      return `Looking for a playing partner? Perfect! 🏓 I found Sarah M. (4.0 rating) - she's available this weekend and has your aggressive net style. Super compatible! Want me to connect you?`
    }
    
    if (input.includes('help') || input.includes('improve') || input.includes('better')) {
      return `${userName}, I'm here for you! 🔥 Based on your game, let's focus on consistency first, then power. I can see you're putting in the work. What specific shot or technique are you struggling with most?`
    }
    
    if (input.includes('drill') || input.includes('practice') || input.includes('train')) {
      return `Time to level up! 💯 I've got custom drills based on your play style. Let me guess... you want to work on: consistency, power, or strategy? Tell me what you need and I'll hook you up with the perfect routine.`
    }
    
    if (input.includes('hey') || input.includes('hi') || input.includes('hello')) {
      return `Hey ${userName}! 😊 Good to see you! What are we working on today? Serves? Dinking? Or ready to analyze that latest match? I'm all ears!`
    }
    
    // Default - personal and encouraging
    return `I'm listening, ${userName}! 🎯 Whatever you're working on, we'll crush it together. Your game's been improving - I can see it in the data. What's on your mind? Let me help you break through!`
  }

  const handleQuickAction = (action: string) => {
    console.log('Quick action:', action)
    // Handle quick actions based on context
  }

  // Avatar face based on emotion
  const getAvatarFace = () => {
    const faces = {
      neutral: "😊",
      encouraging: "💪",
      analytical: "🤔",
      celebrating: "🎉",
      concerned: "🤗",
      motivating: "🔥"
    }
    return faces[emotion]
  }

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={cn("fixed bottom-6 right-6 z-50", className)}
      >
        <Button
          onClick={() => {
            setIsMinimized(false)
            setIsExpanded(true)
          }}
          size="lg"
          className="h-16 w-16 rounded-full bg-gradient-to-br from-champion-green to-champion-gold shadow-2xl hover:shadow-champion-green/50 transition-all duration-300 hover:scale-110 animate-breathing"
        >
          <div className="text-2xl">{getAvatarFace()}</div>
        </Button>
      </motion.div>
    )
  }

  return (
    <div className={cn("fixed bottom-6 right-6 z-50", className)}>
      <AnimatePresence>
        {!isExpanded ? (
          // Collapsed state - floating button
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Button
              onClick={() => setIsExpanded(true)}
              size="lg"
              className="h-20 w-20 rounded-full bg-gradient-to-br from-champion-green to-champion-gold shadow-2xl hover:shadow-champion-green/50 transition-all duration-300 hover:scale-110 animate-breathing"
            >
              <div className="flex flex-col items-center justify-center">
                <div className="text-3xl mb-1">{getAvatarFace()}</div>
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </Button>
          </motion.div>
        ) : (
          // Expanded state - chat interface (DYNAMIC HEIGHT)
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="w-[400px] max-h-[85vh] bg-white dark:bg-champion-charcoal rounded-2xl shadow-2xl border-2 border-champion-green/20 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-champion-green to-champion-gold p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-4xl animate-breathing">{getAvatarFace()}</div>
                <div>
                  <h3 className="text-white font-bold text-lg">Coach Kai</h3>
                  <p className="text-white/80 text-xs">Always here to help</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsExpanded(false)
                    setIsMinimized(true)
                  }}
                  className="h-8 w-8 text-white hover:bg-white/20"
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(false)}
                  className="h-8 w-8 text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages - Compact spacing */}
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-2">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === 'coach' && (
                      <div className="text-2xl flex-shrink-0">{getAvatarFace()}</div>
                    )}
                    <div
                      className={cn(
                        "rounded-2xl px-3 py-2 max-w-[80%]",
                        message.role === 'user'
                          ? "bg-champion-green text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                      )}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <div className="text-2xl">{getAvatarFace()}</div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-champion-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-champion-green rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-champion-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Quick Actions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-3 border-t dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 mt-3">Quick Actions:</p>
                <div className="flex flex-wrap gap-2">
                  {getQuickActions().map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction(action.action)}
                      className="text-xs hover:bg-champion-green/10 hover:border-champion-green hover:text-champion-green transition-colors"
                    >
                      <action.icon className="w-3 h-3 mr-1" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input - Compact & Engaging */}
            <div className="p-3 border-t dark:border-gray-700">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={`What's up, ${userName}? Ask me anything! 💬`}
                  className="flex-1 text-sm focus:border-champion-green focus-visible:ring-champion-green/20"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  size="sm"
                  className="bg-champion-green hover:bg-champion-green/90 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
