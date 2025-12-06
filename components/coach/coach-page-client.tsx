"use client"

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkles, Brain, MessageSquare } from 'lucide-react'
import AICoachChat from '@/components/coach/ai-coach-chat'
import MentalTrainingPrompts from '@/components/coach/mental-training-prompts'

export default function CoachPageClient() {
  const [selectedPrompt, setSelectedPrompt] = useState<string>('')
  const [activeTab, setActiveTab] = useState('chat')

  const handlePromptSelect = (prompt: string) => {
    setSelectedPrompt(prompt)
    setActiveTab('chat') // Switch to chat tab when a prompt is selected
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-teal-600" />
          <h1 className="text-3xl font-bold text-slate-900">Coach Kai - AI Coaching Session</h1>
        </div>
        <p className="text-slate-600">Get technical advice and mental game coaching from your AI coach</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            AI Chat
          </TabsTrigger>
          <TabsTrigger value="mental" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Mental Training
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-0">
          <div className="max-w-5xl">
            <AICoachChat initialPrompt={selectedPrompt} />
          </div>
        </TabsContent>

        <TabsContent value="mental" className="mt-0">
          <div className="max-w-6xl">
            <MentalTrainingPrompts onPromptSelect={handlePromptSelect} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
