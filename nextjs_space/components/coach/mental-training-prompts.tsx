"use client"

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Brain,
  Target,
  Zap,
  Heart,
  Shield,
  TrendingUp,
  Star,
  Sparkles,
  ChevronRight,
  LightbulbIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MentalPrompt {
  id: string
  category: 'focus' | 'confidence' | 'resilience' | 'motivation' | 'composure' | 'mindset'
  title: string
  prompt: string
  icon: React.ReactNode
  color: string
  bgColor: string
  tips: string[]
}

const mentalPrompts: MentalPrompt[] = [
  {
    id: '1',
    category: 'focus',
    title: 'Stay in the Moment',
    prompt: 'Focus only on this point. Not the last one, not the next one. Just this one.',
    icon: <Target className="w-5 h-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 border-blue-200',
    tips: [
      'Take a deep breath between points',
      'Reset your mindset after each rally',
      'Focus on your breathing rhythm',
      'Let go of mistakes immediately'
    ]
  },
  {
    id: '2',
    category: 'confidence',
    title: 'Believe in Your Game',
    prompt: 'You\'ve practiced this shot a thousand times. Trust your training.',
    icon: <Star className="w-5 h-5" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200',
    tips: [
      'Recall your best performances',
      'Visualize successful shots',
      'Affirm your skills and abilities',
      'Celebrate small victories'
    ]
  },
  {
    id: '3',
    category: 'resilience',
    title: 'Bounce Back Strong',
    prompt: 'Champions aren\'t made in perfect games. They\'re forged in comebacks.',
    icon: <Shield className="w-5 h-5" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    tips: [
      'View challenges as opportunities',
      'Learn from every mistake',
      'Stay positive when behind',
      'Remember past comebacks'
    ]
  },
  {
    id: '4',
    category: 'composure',
    title: 'Control Your Energy',
    prompt: 'Stay calm, stay focused, stay aggressive. Composure wins matches.',
    icon: <Heart className="w-5 h-5" />,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50 border-rose-200',
    tips: [
      'Practice tactical breathing',
      'Maintain consistent body language',
      'Use positive self-talk',
      'Channel emotions productively'
    ]
  },
  {
    id: '5',
    category: 'motivation',
    title: 'Push Your Limits',
    prompt: 'Every match is a chance to become a better player. Give it everything.',
    icon: <Zap className="w-5 h-5" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 border-purple-200',
    tips: [
      'Set specific goals for each match',
      'Focus on process, not outcome',
      'Embrace the challenge',
      'Find joy in competition'
    ]
  },
  {
    id: '6',
    category: 'mindset',
    title: 'Growth Mindset',
    prompt: 'Win or learn. There is no losing, only growing as a player.',
    icon: <TrendingUp className="w-5 h-5" />,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50 border-teal-200',
    tips: [
      'Embrace mistakes as learning',
      'Track your improvement',
      'Seek feedback actively',
      'Focus on long-term development'
    ]
  }
]

const affirmations = [
  "I am a confident and skilled pickleball player.",
  "I stay calm under pressure and make smart decisions.",
  "I trust my training and my instincts on the court.",
  "I compete with focus, energy, and joy.",
  "Every match makes me a stronger player.",
  "I control my emotions and maintain composure.",
  "I am mentally tough and resilient.",
  "I play my best when it matters most."
]

export default function MentalTrainingPrompts({ onPromptSelect }: { onPromptSelect?: (prompt: string) => void }) {
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null)
  const [showAffirmations, setShowAffirmations] = useState(false)

  const handlePromptClick = (prompt: MentalPrompt) => {
    setSelectedPrompt(prompt.id === selectedPrompt ? null : prompt.id)
  }

  const askCoachKai = (question: string) => {
    if (onPromptSelect) {
      onPromptSelect(question)
    }
  }

  return (
    <div className="space-y-4">
      {/* Simplified Mental Game Prompts - Cleaner Cards */}
      <div className="space-y-3">
        {mentalPrompts.map((prompt) => (
          <Card
            key={prompt.id}
            className={cn(
              "p-4 cursor-pointer transition-all duration-200 hover:shadow-lg border",
              selectedPrompt === prompt.id 
                ? "shadow-lg ring-2 ring-purple-200 bg-gradient-to-r from-white to-purple-50" 
                : "bg-white hover:bg-gray-50",
              "rounded-xl"
            )}
            onClick={() => handlePromptClick(prompt)}
          >
            <div className="flex items-start gap-3">
              <div className={cn("p-2.5 rounded-lg shadow-sm", prompt.bgColor)}>
                <div className={prompt.color}>{prompt.icon}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-900 text-sm">{prompt.title}</h3>
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
                    {prompt.category}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 italic mb-2 line-clamp-2">
                  "{prompt.prompt}"
                </p>
                
                {selectedPrompt === prompt.id && (
                  <div className="mt-3 space-y-2 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                      <LightbulbIcon className="w-3 h-3 text-amber-500" />
                      <span>Quick Tips:</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {prompt.tips.slice(0, 3).map((tip, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <ChevronRight className="w-3 h-3 mt-0.5 text-teal-600 flex-shrink-0" />
                          <span className="line-clamp-2">{tip}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-2 h-8 text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        askCoachKai(`Help me with ${prompt.category} - give me quick tips and exercises.`)
                      }}
                    >
                      <Sparkles className="w-3 h-3 mr-2" />
                      Ask Coach Kai
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Daily Affirmations Section - Simplified */}
      <Card className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-semibold text-slate-900">Daily Affirmations</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => setShowAffirmations(!showAffirmations)}
          >
            {showAffirmations ? 'Hide' : 'Show'}
          </Button>
        </div>
        
        {showAffirmations && (
          <div className="space-y-2 animate-in slide-in-from-top-2">
            <p className="text-xs text-slate-600 mb-3">
              Quick affirmations to build mental strength:
            </p>
            <div className="space-y-1.5">
              {affirmations.slice(0, 4).map((affirmation, index) => (
                <div
                  key={index}
                  className="p-2 bg-white rounded-lg border border-indigo-200 text-xs text-slate-700"
                >
                  <span className="font-medium text-indigo-600 mr-1">•</span>
                  {affirmation}
                </div>
              ))}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full mt-3 h-8 text-xs"
              onClick={() => askCoachKai("Create personalized affirmations for my game.")}
            >
              <Sparkles className="w-3 h-3 mr-2" />
              Custom Affirmations
            </Button>
          </div>
        )}
      </Card>

      {/* Quick Mental Game Questions for Coach Kai */}
      <Card className="p-4 border border-slate-200 rounded-xl">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Quick Mental Training Questions</h3>
        <div className="space-y-2">
          {[
            "How do I stay calm under pressure?",
            "Tips for handling frustration?",
            "Build confidence after losses?",
            "Focus during long rallies?",
            "Tournament mental prep?",
            "Overcome match anxiety?"
          ].map((question, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="justify-start text-left w-full h-8 px-3"
              onClick={() => askCoachKai(question)}
            >
              <ChevronRight className="w-3 h-3 mr-2 flex-shrink-0 text-teal-600" />
              <span className="text-xs truncate">{question}</span>
            </Button>
          ))}
        </div>
      </Card>
    </div>
  )
}
