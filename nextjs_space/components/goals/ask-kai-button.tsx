'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Sparkles, X, Send, Loader2, Target, TrendingUp, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface AskKaiButtonProps {
  goalContext?: {
    goalId?: string;
    goalTitle?: string;
    goalProgress?: number;
    category?: string;
  };
  variant?: 'floating' | 'inline' | 'compact';
  onGoalCreated?: () => void;
  onProgressUpdated?: () => void;
}

export default function AskKaiButton({ 
  goalContext, 
  variant = 'inline',
  onGoalCreated,
  onProgressUpdated 
}: AskKaiButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const quickPrompts = goalContext?.goalId ? [
    { icon: TrendingUp, text: 'Log progress', prompt: `I practiced my ${goalContext.goalTitle || 'goal'} today` },
    { icon: Target, text: 'Get tips', prompt: `What drills can help me with ${goalContext.goalTitle || 'this goal'}?` },
    { icon: Trophy, text: 'Check status', prompt: `How am I doing on ${goalContext.goalTitle || 'my goal'}?` }
  ] : [
    { icon: Target, text: 'Set a goal', prompt: 'Help me set a goal to improve my serve' },
    { icon: TrendingUp, text: 'Track progress', prompt: 'I completed my drill practice today' },
    { icon: Trophy, text: 'Get motivated', prompt: 'Give me some motivation for my training' }
  ];

  const handleSend = async (message?: string) => {
    const text = message || input;
    if (!text.trim()) return;
    
    setIsLoading(true);
    setResponse(null);
    
    try {
      const res = await fetch('/api/coach-kai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: text }],
          goalContext: goalContext || {}
        })
      });
      
      if (!res.ok) throw new Error('Failed to get response');
      
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';
      
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
                if (data.type === 'text') {
                  fullResponse += data.content;
                  setResponse(fullResponse);
                } else if (data.type === 'actions') {
                  // Handle goal actions
                  const goalAction = data.suggestions?.find((s: any) => 
                    s.type === 'goal_create' || s.type === 'goal_progress' || s.type === 'milestone_complete'
                  );
                  if (goalAction) {
                    handleGoalAction(goalAction);
                  }
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setResponse('Sorry, I had trouble responding. Please try again!');
    } finally {
      setIsLoading(false);
      setInput('');
    }
  };

  const handleGoalAction = async (action: any) => {
    try {
      const res = await fetch('/api/coach-kai/goal-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action.type === 'goal_create' ? 'create_goal' 
            : action.type === 'goal_progress' ? 'update_progress'
            : 'complete_milestone',
          ...action.data
        })
      });
      
      if (res.ok) {
        const result = await res.json();
        
        // Show celebration for completions
        if (result.celebration) {
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 3000);
        }
        
        // Trigger parent callbacks
        if (action.type === 'goal_create' && onGoalCreated) {
          onGoalCreated();
        } else if (onProgressUpdated) {
          onProgressUpdated();
        }
      }
    } catch (error) {
      console.error('Goal action error:', error);
    }
  };

  if (variant === 'compact') {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white gap-2"
        size="sm"
      >
        <MessageCircle className="w-4 h-4" />
        Ask Kai
      </Button>
    );
  }

  return (
    <>
      {/* Trigger Button */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={variant === 'floating' ? 'fixed bottom-6 right-6 z-50' : ''}
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20 gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {goalContext?.goalTitle ? `Ask Kai about "${goalContext.goalTitle.substring(0, 20)}..."` : 'Ask Coach Kai'}
        </Button>
      </motion.div>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg"
            >
              <Card className="bg-slate-900/95 border-slate-700/50 backdrop-blur-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <span className="text-white font-bold">K</span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Coach Kai</h3>
                      <p className="text-xs text-emerald-400">Your AI Pickleball Coach</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="w-5 h-5 text-slate-400" />
                  </Button>
                </div>

                {/* Goal Context Badge */}
                {goalContext?.goalTitle && (
                  <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700/50">
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                      <Target className="w-3 h-3 mr-1" />
                      Discussing: {goalContext.goalTitle}
                      {goalContext.goalProgress !== undefined && (
                        <span className="ml-2">({goalContext.goalProgress}% complete)</span>
                      )}
                    </Badge>
                  </div>
                )}

                {/* Quick Prompts */}
                <div className="p-4 space-y-3">
                  <p className="text-sm text-slate-400">Quick actions:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickPrompts.map((prompt, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSend(prompt.prompt)}
                        disabled={isLoading}
                        className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                      >
                        <prompt.icon className="w-3 h-3 mr-1" />
                        {prompt.text}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Response Area */}
                {(response || isLoading) && (
                  <div className="px-4 pb-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700/30">
                      {isLoading && !response ? (
                        <div className="flex items-center gap-2 text-slate-400">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Kai is thinking...</span>
                        </div>
                      ) : (
                        <p className="text-slate-200 whitespace-pre-wrap">{response}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className="p-4 border-t border-slate-700/50">
                  <div className="flex gap-2">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask Kai about your goals, progress, or training..."
                      className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 min-h-[60px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                    />
                    <Button
                      onClick={() => handleSend()}
                      disabled={isLoading || !input.trim()}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="text-center"
            >
              <div className="text-8xl mb-4">🎉</div>
              <div className="text-3xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                Goal Achieved!
              </div>
            </motion.div>
            {/* Confetti particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 1, 
                  x: 0, 
                  y: 0,
                  scale: 1
                }}
                animate={{ 
                  opacity: 0,
                  x: (Math.random() - 0.5) * 400,
                  y: (Math.random() - 0.5) * 400,
                  scale: 0
                }}
                transition={{ duration: 1.5, delay: i * 0.05 }}
                className="absolute text-2xl"
                style={{ left: '50%', top: '50%' }}
              >
                {['⭐', '🎯', '🏆', '✨', '🎾'][i % 5]}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
