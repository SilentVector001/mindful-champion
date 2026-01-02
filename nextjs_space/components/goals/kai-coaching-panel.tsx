'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Target, TrendingUp, Trophy, Flame, ChevronRight, MessageCircle, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import AskKaiButton from './ask-kai-button';

interface KaiCoachingPanelProps {
  userId?: string;
  onRefresh?: () => void;
}

interface GoalInsight {
  type: 'tip' | 'celebration' | 'reminder' | 'suggestion';
  title: string;
  message: string;
  goalId?: string;
  goalTitle?: string;
  action?: { label: string; href: string };
}

export default function KaiCoachingPanel({ userId, onRefresh }: KaiCoachingPanelProps) {
  const [insights, setInsights] = useState<GoalInsight[]>([]);
  const [goalStats, setGoalStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeInsightIndex, setActiveInsightIndex] = useState(0);

  useEffect(() => {
    fetchGoalContext();
  }, []);

  const fetchGoalContext = async () => {
    try {
      const res = await fetch('/api/coach-kai/goal-operations');
      if (res.ok) {
        const data = await res.json();
        setGoalStats(data);
        generateInsights(data);
      }
    } catch (error) {
      console.error('Error fetching goal context:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = (data: any) => {
    const newInsights: GoalInsight[] = [];

    // Check for next milestone
    if (data.nextMilestone) {
      newInsights.push({
        type: 'reminder',
        title: 'Next Up',
        message: `Focus on "${data.nextMilestone.title}" for your ${data.nextMilestone.goalTitle} goal. You're making great progress!`,
        goalId: data.nextMilestone.goalId,
        goalTitle: data.nextMilestone.goalTitle,
        action: { label: 'View Goal', href: '/progress/goals' }
      });
    }

    // Progress encouragement
    if (data.totalProgress > 0 && data.totalProgress < 100) {
      const encouragement = data.totalProgress < 30 
        ? "You're building momentum! Every practice counts." 
        : data.totalProgress < 60
        ? "Halfway there! Your dedication is paying off."
        : data.totalProgress < 90
        ? "Almost there! Push through to the finish!"
        : "So close! One final push!";
      
      newInsights.push({
        type: 'tip',
        title: `${Math.round(data.totalProgress)}% Progress`,
        message: encouragement
      });
    }

    // Recent completions celebration
    if (data.recentlyCompleted?.length > 0) {
      const lastCompleted = data.recentlyCompleted[0];
      newInsights.push({
        type: 'celebration',
        title: 'Recent Win! 🎉',
        message: `Congratulations on completing "${lastCompleted.title}"! Keep that momentum going!`,
        goalTitle: lastCompleted.title
      });
    }

    // Streak motivation
    if (data.streak > 0) {
      newInsights.push({
        type: 'celebration',
        title: `${data.streak} Goal Streak! 🔥`,
        message: `You've completed ${data.streak} goals recently. You're on fire!`
      });
    }

    // Suggestion for new goals
    if (!data.activeGoals?.length) {
      newInsights.push({
        type: 'suggestion',
        title: 'Ready for a Challenge?',
        message: "Let's set your first goal together! I can help you create a personalized plan.",
        action: { label: 'Create Goal', href: '/progress/goals' }
      });
    } else if (data.activeGoals.length < 3) {
      newInsights.push({
        type: 'suggestion',
        title: 'Add More Goals',
        message: 'Consider adding another goal to balance your training. Mix skill work with fitness!'
      });
    }

    setInsights(newInsights.length > 0 ? newInsights : [{
      type: 'tip',
      title: 'Coach Kai Says',
      message: "I'm here to help you reach your pickleball potential! Ask me anything about your goals."
    }]);
  };

  // Rotate through insights
  useEffect(() => {
    if (insights.length <= 1) return;
    const interval = setInterval(() => {
      setActiveInsightIndex(prev => (prev + 1) % insights.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [insights.length]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'tip': return Lightbulb;
      case 'celebration': return Trophy;
      case 'reminder': return Target;
      case 'suggestion': return Sparkles;
      default: return MessageCircle;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'tip': return 'from-amber-500 to-orange-500';
      case 'celebration': return 'from-emerald-500 to-teal-500';
      case 'reminder': return 'from-blue-500 to-cyan-500';
      case 'suggestion': return 'from-purple-500 to-pink-500';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700/50 animate-pulse">
        <CardContent className="p-6">
          <div className="h-24 bg-slate-700/50 rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const currentInsight = insights[activeInsightIndex] || insights[0];
  const InsightIcon = currentInsight ? getInsightIcon(currentInsight.type) : MessageCircle;

  return (
    <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 overflow-hidden relative">
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 animate-pulse" />
      
      <CardHeader className="pb-2 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20"
            >
              <span className="text-white font-bold text-lg">K</span>
            </motion.div>
            <div>
              <CardTitle className="text-white text-lg">Coach Kai's Insights</CardTitle>
              <p className="text-xs text-emerald-400">Personalized coaching tips</p>
            </div>
          </div>
          <AskKaiButton variant="compact" onGoalCreated={onRefresh} onProgressUpdated={onRefresh} />
        </div>
      </CardHeader>

      <CardContent className="relative">
        {/* Goal Stats Row */}
        {goalStats && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-slate-700/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-white">{goalStats.activeGoals?.length || 0}</div>
              <div className="text-xs text-slate-400">Active Goals</div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-emerald-400">{Math.round(goalStats.totalProgress || 0)}%</div>
              <div className="text-xs text-slate-400">Progress</div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-amber-400 flex items-center justify-center gap-1">
                {goalStats.streak || 0}
                <Flame className="w-4 h-4" />
              </div>
              <div className="text-xs text-slate-400">Streak</div>
            </div>
          </div>
        )}

        {/* Insight Card */}
        <AnimatePresence mode="wait">
          {currentInsight && (
            <motion.div
              key={activeInsightIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className={`p-4 rounded-xl bg-gradient-to-br ${getInsightColor(currentInsight.type)} bg-opacity-10 border border-white/10`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${getInsightColor(currentInsight.type)}`}>
                  <InsightIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-1">{currentInsight.title}</h4>
                  <p className="text-slate-300 text-sm">{currentInsight.message}</p>
                  {currentInsight.action && (
                    <Button
                      variant="link"
                      className="text-emerald-400 hover:text-emerald-300 p-0 h-auto mt-2"
                      onClick={() => window.location.href = currentInsight.action!.href}
                    >
                      {currentInsight.action.label}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Insight Dots */}
        {insights.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {insights.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveInsightIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === activeInsightIndex 
                    ? 'bg-emerald-500 w-6' 
                    : 'bg-slate-600 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
