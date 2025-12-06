"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Bot, 
  Send, 
  TrendingUp, 
  Target, 
  Calendar,
  Zap,
  Trophy,
  MessageSquare,
  Loader2,
  Lightbulb,
  Brain,
  Sparkles,
  Activity
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface EnhancedVictoryCoachProps {
  user: any
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
}

const quickPrompts = [
  {
    label: "💪 Improve My Serve",
    prompt: "I want to improve my serve power and consistency. What should I focus on?",
    icon: Activity,
    gradient: "from-orange-500 to-red-500"
  },
  {
    label: "🎯 Master Third Shot",
    prompt: "Help me master the third shot drop. What's the secret?",
    icon: Target,
    gradient: "from-emerald-500 to-teal-500"
  },
  {
    label: "🧠 Mental Game",
    prompt: "I get nervous in competitive matches. How can I stay focused and confident?",
    icon: Brain,
    gradient: "from-purple-500 to-pink-500"
  },
  {
    label: "📊 Analyze My Game",
    prompt: "Based on my profile, what areas should I focus on to improve fastest?",
    icon: TrendingUp,
    gradient: "from-blue-500 to-cyan-500"
  }
]

export default function EnhancedVictoryCoach({ user }: EnhancedVictoryCoachProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hey ${user?.firstName || 'there'}! 👋 I'm Coach Kai, your AI pickleball coach.\n\nI'm here to help you improve your game, answer questions about technique, suggest drills, or just chat about pickleball strategy. 🏓\n\nWhat would you like to work on today? 🔥`,
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const isInitialLoadRef = useRef(true) // Track if it's the initial page load to prevent auto-scroll
  const { toast } = useToast()

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight
        }
      }
    }, 100)
  }

  useEffect(() => {
    // Skip auto-scroll on the very first render (initial page load)
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false
      return
    }
    // Only scroll when new messages are added (after initial load)
    scrollToBottom()
  }, [messages, isLoading])

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)
    setIsTyping(true)

    try {
      const response = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message,
          conversationHistory: messages.slice(-10) // Last 10 messages for context
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      let assistantContent = ""
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: "",
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
      setIsTyping(false)

      while (true) {
        const { done, value } = await reader?.read() ?? { done: true, value: undefined }
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              setIsLoading(false)
              return
            }

            try {
              const parsed = JSON.parse(data)
              const content = parsed.content || ""
              if (content) {
                assistantContent += content
                setMessages(prev => 
                  prev.map((msg, index) => 
                    index === prev.length - 1 
                      ? { ...msg, content: assistantContent }
                      : msg
                  )
                )
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: "Connection Error",
        description: "Failed to reach Coach Kai. Please try again.",
        variant: "destructive",
      })
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputMessage)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputMessage)
    }
  }

  return (
    <div className="space-y-6">
      {/* Animated Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 p-6 text-white"
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center border-2 border-white/30"
              >
                <Bot className="w-8 h-8" />
              </motion.div>
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-2">
                  Coach Kai <Sparkles className="w-6 h-6" />
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  Your AI coach • Powered by advanced sports psychology
                </p>
              </div>
            </div>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm font-medium">Online</span>
            </motion.div>
          </div>
        </div>
        
        {/* Animated background elements */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full"
        />
        <motion.div
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -bottom-10 -left-10 w-32 h-32 bg-white rounded-full"
        />
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Quick Prompts - Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Quick Start
          </h3>
          <div className="space-y-3">
            {quickPrompts.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => sendMessage(action.prompt)}
                disabled={isLoading}
                className={cn(
                  "w-full text-left p-4 rounded-xl transition-all",
                  "bg-white border-2 border-slate-200 hover:border-slate-300",
                  "hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${action.gradient} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 text-sm">
                      {action.label}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* User Profile Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Level:</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {user?.skillLevel || 'BEGINNER'}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Rating:</span>
                <span className="font-medium text-slate-900">{user?.playerRating || '2.0'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Matches:</span>
                <span className="font-medium text-slate-900">{user?.totalMatches || 0}</span>
              </div>
              {user?.ageRange && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Age:</span>
                  <span className="font-medium text-slate-900">{user.ageRange}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col shadow-xl border-2">
            {/* Messages */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      className={cn(
                        "flex gap-3",
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      {message.role === 'assistant' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 border-3 border-white shadow-lg"
                        >
                          <Bot className="w-5 h-5 text-white" />
                        </motion.div>
                      )}
                      
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={cn(
                          "rounded-2xl px-5 py-3.5 max-w-[75%] shadow-md",
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-teal-500 to-cyan-500 text-white'
                            : 'bg-white text-slate-900 border-2 border-slate-100'
                        )}
                      >
                        <div className={`text-[15px] leading-relaxed prose prose-sm max-w-none ${
                          message.role === 'user' 
                            ? 'prose-invert prose-headings:text-white prose-p:text-white prose-strong:text-white prose-ul:text-white prose-ol:text-white prose-li:text-white' 
                            : 'prose-headings:text-slate-900 prose-p:text-slate-900 prose-strong:text-slate-900 prose-ul:text-slate-900 prose-ol:text-slate-900'
                        }`}
                           style={{ 
                             lineHeight: '1.7',
                             letterSpacing: '0.01em'
                           }}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                        {message.timestamp && (
                          <p className={cn(
                            "text-xs mt-2",
                            message.role === 'user' ? 'text-white/70' : 'text-slate-400'
                          )}>
                            {message.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        )}
                      </motion.div>

                      {message.role === 'user' && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center flex-shrink-0 border-3 border-white shadow-lg"
                        >
                          <span className="text-white font-semibold text-sm">
                            {user?.firstName?.[0] || 'U'}
                          </span>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {/* Typing Indicator */}
                <AnimatePresence>
                  {(isLoading || isTyping) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex gap-3 justify-start"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="bg-white rounded-2xl px-5 py-4 shadow-md border-2 border-slate-100">
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.1 }}
                            className="w-2 h-2 bg-blue-500 rounded-full"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2, repeatDelay: 0.1 }}
                            className="w-2 h-2 bg-cyan-500 rounded-full"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4, repeatDelay: 0.1 }}
                            className="w-2 h-2 bg-teal-500 rounded-full"
                          />
                          <span className="text-sm text-slate-600 ml-2">
                            {isTyping ? "Coach Kai is thinking..." : "Processing..."}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Dynamic Input Area */}
            <motion.div
              layout
              className="border-t-2 p-5 bg-gradient-to-r from-slate-50 to-blue-50"
            >
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex gap-3">
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Coach Kai anything about your game..."
                    disabled={isLoading}
                    className="flex-1 min-h-[60px] max-h-[120px] resize-none border-2 focus:border-blue-400 bg-white"
                    rows={2}
                  />
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      type="submit" 
                      disabled={isLoading || !inputMessage.trim()}
                      className="h-full px-6 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-lg"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </Button>
                  </motion.div>
                </div>
                <p className="text-xs text-slate-500 text-center">
                  Press <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-xs font-mono">Enter</kbd> to send • 
                  <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-xs font-mono mx-1">Shift + Enter</kbd> for new line
                </p>
              </form>
            </motion.div>
          </Card>
        </div>
      </div>
    </div>
  )
}
