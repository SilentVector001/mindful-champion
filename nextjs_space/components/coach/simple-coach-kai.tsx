'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, MicOff, Sparkles, MessageCircle, Loader2 } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface UserContext {
  name: string
  firstName: string
  skillLevel: string
  playerRating: number
  primaryGoals: string[]
  biggestChallenges: string[]
}

interface SimpleCoachKaiProps {
  userContext: UserContext
}

const QUICK_PROMPTS = [
  { icon: '🎯', label: 'Serve Tips', prompt: 'Give me tips to improve my serve' },
  { icon: '🏓', label: 'Dinking', prompt: 'How can I improve my dinking?' },
  { icon: '🔥', label: 'Third Shot', prompt: 'Teach me the third shot drop' },
  { icon: '🧠', label: 'Mental Game', prompt: 'How do I stay mentally strong during tough matches?' },
]

export default function SimpleCoachKai({ userContext }: SimpleCoachKaiProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        setIsListening(false)
      }
      
      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }
      
      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  const toggleListening = () => {
    if (!recognitionRef.current) return
    
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: text.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai-coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          userContext,
          conversationHistory: messages.slice(-6)
        })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response || data.message || "I'm here to help! Could you rephrase that?",
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I had trouble connecting. Please try again!",
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Beta Banner */}
      <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border-b border-amber-500/30">
        <div className="max-w-4xl mx-auto px-4 py-3 text-center">
          <span className="text-amber-200 text-sm">
            🚧 <strong>Coach Kai Beta:</strong> Voice avatar is temporarily unavailable. Text chat and push-to-talk are fully functional!
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-600 py-4 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
            K
          </div>
          <div>
            <h1 className="text-white text-xl font-bold flex items-center gap-2">
              COACH KAI
              <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-medium">AI COACH</span>
            </h1>
            <p className="text-emerald-100 text-sm">Your personal pickleball mentor</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-[280px,1fr] gap-6">
          {/* Avatar Section */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 flex flex-col items-center">
            <motion.div 
              className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-5xl font-bold shadow-xl mb-4"
              animate={{ 
                scale: isLoading ? [1, 1.05, 1] : 1,
                boxShadow: isLoading 
                  ? ['0 0 0 0 rgba(16, 185, 129, 0.4)', '0 0 0 20px rgba(16, 185, 129, 0)', '0 0 0 0 rgba(16, 185, 129, 0.4)']
                  : '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
              transition={{ duration: 1.5, repeat: isLoading ? Infinity : 0 }}
            >
              K
            </motion.div>
            
            <p className="text-slate-300 text-sm text-center mb-4">
              {isLoading ? '💭 Thinking...' : isListening ? '🎤 Listening...' : '💬 Ready to help!'}
            </p>

            {/* Push-to-Talk Button */}
            <button
              onClick={toggleListening}
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              }`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              {isListening ? 'Stop Listening' : 'Push to Talk'}
            </button>
          </div>

          {/* Chat Section */}
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 flex flex-col h-[500px]">
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-slate-700/50 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              <span className="text-white font-medium">Conversation</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <Sparkles className="w-12 h-12 text-slate-600 mb-3" />
                  <p className="text-slate-400">Start a conversation with Coach Kai!</p>
                  <p className="text-slate-500 text-sm mt-1">Ask about technique, strategy, or mental game</p>
                </div>
              ) : (
                <AnimatePresence>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                        msg.role === 'user' 
                          ? 'bg-teal-600 text-white rounded-br-md' 
                          : 'bg-slate-700 text-slate-100 rounded-bl-md'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-700 text-slate-300 px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Coach Kai is typing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-700/50">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question..."
                  className="flex-1 bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-teal-600 hover:bg-teal-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Quick Prompts */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => sendMessage(prompt.prompt)}
              disabled={isLoading}
              className="bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl p-4 text-center transition-all disabled:opacity-50"
            >
              <span className="text-2xl block mb-1">{prompt.icon}</span>
              <span className="text-slate-200 text-sm font-medium">{prompt.label}</span>
            </button>
          ))}
        </div>

        {/* Footer Note */}
        <p className="text-center text-slate-500 text-sm mt-6">
          ⚡ Text chat is always free • Push-to-talk uses browser speech recognition
        </p>
      </div>
    </div>
  )
}
