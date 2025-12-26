
"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Lightbulb
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface VictoryCoachProps {
  user: any
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
}

const quickActions = [
  {
    label: "Analyze Last Match",
    prompt: "Can you analyze my recent match performance and provide insights for improvement?",
    icon: TrendingUp,
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    label: "Suggest Drills",
    prompt: "What specific drills should I practice based on my current skill level and playing style?",
    icon: Target,
    gradient: "from-green-500 to-emerald-500"
  },
  {
    label: "Strategy Tips",
    prompt: "Give me strategic advice for my current playing level and recent challenges.",
    icon: Lightbulb,
    gradient: "from-yellow-500 to-orange-500"
  },
  {
    label: "Design Weekly Plan",
    prompt: "Create a personalized weekly training plan based on my goals and current performance.",
    icon: Calendar,
    gradient: "from-purple-500 to-pink-500"
  },
  {
    label: "Third Shot Drop Tips",
    prompt: "Help me master the third shot drop technique. What are the key fundamentals and practice methods?",
    icon: Zap,
    gradient: "from-teal-500 to-blue-500"
  }
]

export default function VictoryCoach({ user }: VictoryCoachProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Welcome back, ${user?.firstName || 'Champion'}! 🏆 I'm Coach Kai, here to help elevate your pickleball game. I can analyze your performance, suggest personalized drills, provide strategic advice, and create training plans tailored just for you.\n\nWhat would you like to work on today?`,
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isInitialLoadRef = useRef(true) // Track if it's the initial page load to prevent auto-scroll
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    // Skip auto-scroll on the very first render (initial page load)
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false
      return
    }
    // Only scroll when new messages are added (after initial load)
    scrollToBottom()
  }, [messages])

  const sendMessage = async (message: string, actionType?: string) => {
    if (!message.trim() || isLoading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message,
          actionType
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
        title: "Error",
        description: "Failed to get AI coaching response. Please try again.",
        variant: "destructive",
      })
      setMessages(prev => prev.slice(0, -1)) // Remove the empty assistant message
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = (action: typeof quickActions[0]) => {
    sendMessage(action.prompt, action.label.toLowerCase().replace(/\s+/g, '_'))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputMessage)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Coach Kai
          </h2>
          <p className="text-slate-600 mt-2">
            Your personal AI coach analyzing your game and providing championship strategies
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-slate-600">AI Coach Online</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant="outline"
                  className="w-full justify-start text-left p-4 h-auto hover:shadow-md transition-all"
                  onClick={() => handleQuickAction(action)}
                  disabled={isLoading}
                >
                  <div className={`w-8 h-8 bg-gradient-to-br ${action.gradient} rounded-lg flex items-center justify-center mr-3 flex-shrink-0`}>
                    <action.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-slate-900">{action.label}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Get personalized coaching advice
                    </div>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>

          {/* User Stats Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-800">
                Your Champion Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Skill Level:</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {user?.skillLevel || 'BEGINNER'}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Player Rating:</span>
                <span className="font-medium text-slate-900">{user?.playerRating || '2.0'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Total Matches:</span>
                <span className="font-medium text-slate-900">{user?.totalMatches || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Win Rate:</span>
                <span className="font-medium text-slate-900">
                  {user?.totalMatches ? ((user?.totalWins || 0) / user.totalMatches * 100).toFixed(1) : 0}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-cyan-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Coach Kai</CardTitle>
                  <CardDescription className="text-sm">
                    Powered by advanced AI • Personalized for your game
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-teal-500 to-orange-500 text-white'
                            : 'bg-slate-100 text-slate-900'
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </div>
                        {message.timestamp && (
                          <div
                            className={`text-xs mt-2 ${
                              message.role === 'user'
                                ? 'text-white/70'
                                : 'text-slate-500'
                            }`}
                          >
                            {message.timestamp.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-slate-100 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                        <span className="text-sm text-slate-600">Coach Kai is thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask Coach Kai anything about pickleball..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !inputMessage.trim()}
                  className="bg-gradient-to-r from-teal-500 to-orange-500 hover:from-teal-600 hover:to-orange-600"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
