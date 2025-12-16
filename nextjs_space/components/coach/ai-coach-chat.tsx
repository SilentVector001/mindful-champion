

"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AICoachChatProps {
  initialPrompt?: string
  onInputChange?: (value: string) => void
}

export default function AICoachChat({ initialPrompt, onInputChange }: AICoachChatProps = {}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hey there! 👋 I'm Coach Kai, your AI pickleball coach.\n\nI'm here to help you improve your game, answer questions about technique, suggest drills, or just chat about pickleball strategy. 🏓\n\nWhat would you like to work on today? 🔥"
    }
  ])
  const [input, setInput] = useState(initialPrompt || '')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const isInitialMountRef = useRef(true)
  const hasUserInteractedRef = useRef(false)

  // Handle external prompt changes
  useEffect(() => {
    if (initialPrompt) {
      setInput(initialPrompt)
      if (onInputChange) {
        onInputChange(initialPrompt)
      }
    }
  }, [initialPrompt, onInputChange])

  // Only scroll after user has interacted
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false
      return
    }
    
    // Only scroll if user has sent a message
    if (scrollRef.current && hasUserInteractedRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Enable auto-scroll after first user interaction
    hasUserInteractedRef.current = true

    const userMessage = input.trim()
    setInput('')
    
    // Add user message
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }]
    setMessages(newMessages)
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''
      let partialRead = ''

      // Add placeholder for assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader!.read()
        if (done) break

        partialRead += decoder.decode(value, { stream: true })
        let lines = partialRead.split('\n')
        partialRead = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content || ''
              assistantMessage += content
              
              // Update the last message
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1].content = assistantMessage
                return updated
              })
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: "I'm having trouble connecting right now. Please try again in a moment." }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
        <div className="space-y-4 pb-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex gap-3",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8 border-2 border-teal-200">
                  <AvatarFallback className="bg-gradient-to-br from-teal-500 to-emerald-600">
                    <Bot className="h-4 w-4 text-white" />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div
                className={cn(
                  "rounded-2xl px-5 py-3.5 max-w-[85%] shadow-sm",
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-teal-600 to-teal-700 text-white'
                    : 'bg-gradient-to-br from-white to-slate-50 text-slate-900 border border-slate-200'
                )}
              >
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap font-normal" 
                   style={{ 
                     lineHeight: '1.6',
                     letterSpacing: '0.01em'
                   }}>
                  {message.content}
                </p>
              </div>

              {message.role === 'user' && (
                <Avatar className="h-8 w-8 border-2 border-teal-200">
                  <AvatarFallback className="bg-gradient-to-br from-slate-500 to-slate-600">
                    <User className="h-4 w-4 text-white" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <Avatar className="h-8 w-8 border-2 border-teal-200">
                <AvatarFallback className="bg-gradient-to-br from-teal-500 to-emerald-600">
                  <Bot className="h-4 w-4 text-white" />
                </AvatarFallback>
              </Avatar>
              <div className="rounded-2xl px-4 py-3 bg-slate-100">
                <Loader2 className="h-4 w-4 animate-spin text-teal-600" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Coach Kai anything about pickleball..."
          className="min-h-[60px] max-h-[120px] resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit(e)
            }
          }}
        />
        <Button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 px-6"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {[
          "How do I improve my third shot drop?",
          "What drills should I focus on?",
          "Tips for playing at the net?",
          "How to stay mentally strong in pressure situations?"
        ].map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => setInput(suggestion)}
            className="text-xs"
            disabled={isLoading}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  )
}
