
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle2,
  Circle,
  Trophy,
  Target,
  Sparkles,
  Gift,
  Loader2,
  Clock,
  Award,
  PlayCircle,
  MessageSquare,
  Users,
  Video,
  Dumbbell,
  Tv,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { PromoCodeRedemption } from '@/components/promo/promo-code-redemption';

interface BetaTask {
  id: string;
  title: string;
  description: string;
  category: string;
  required: boolean;
  completed: boolean;
  orderIndex: number;
  icon?: string;
  actionPath?: string;
}

interface BetaTesterData {
  id: string;
  status: string;
  totalTasksCompleted: number;
  totalTasksRequired: number;
  rewardEligible: boolean;
  rewardClaimed: boolean;
  rewardAmount?: number;
  startedAt: Date;
  completedAt?: Date;
  taskProgress: BetaTask[];
}

const getTaskIcon = (category: string) => {
  switch (category) {
    case 'video_analysis': return Video;
    case 'training': return Dumbbell;
    case 'practice': return Target;
    case 'ai_coach': return MessageSquare;
    case 'community': return Users;
    case 'media': return Tv;
    default: return Circle;
  }
};

export function BetaTestingDashboard() {
  const [betaData, setBetaData] = useState<BetaTesterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBetaTester, setIsBetaTester] = useState(false);

  useEffect(() => {
    fetchBetaStatus();
  }, []);

  const fetchBetaStatus = async () => {
    try {
      const response = await fetch('/api/beta/status');
      const data = await response.json();

      if (data.isBetaTester) {
        setIsBetaTester(true);
        setBetaData(data.betaTester);
      } else {
        setIsBetaTester(false);
      }
    } catch (error) {
      console.error('Error fetching beta status:', error);
      toast.error('Failed to load beta testing status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-teal-500" />
            <p className="text-gray-600">Loading beta testing dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isBetaTester) {
    return (
      <div className="container max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Beta Testing Program
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join our exclusive beta testing program and help shape the future of Mindful Champion
          </p>
        </div>

        <PromoCodeRedemption />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-teal-500" />
              Beta Tester Benefits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 bg-teal-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-teal-600" />
                  <h3 className="font-semibold text-teal-900">30 Days PRO Access</h3>
                </div>
                <p className="text-sm text-teal-700">
                  Full access to all premium features
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">$25 Amazon Gift Card</h3>
                </div>
                <p className="text-sm text-green-700">
                  Upon completing all beta tasks
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Early Access</h3>
                </div>
                <p className="text-sm text-blue-700">
                  Be first to try new features
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-900">Shape the Future</h3>
                </div>
                <p className="text-sm text-purple-700">
                  Your feedback matters
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progressPercentage = betaData 
    ? (betaData.totalTasksCompleted / betaData.totalTasksRequired) * 100 
    : 0;

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-full border border-teal-200">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span className="text-sm font-medium text-teal-700">Beta Tester</span>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
          Beta Testing Dashboard
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Complete all tasks to earn your $25 Amazon gift card reward!
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 opacity-50" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-teal-500" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="relative space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-900">
                {betaData?.totalTasksCompleted || 0} / {betaData?.totalTasksRequired || 7}
              </div>
              <div className="text-sm text-gray-600">Tasks Completed</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-teal-600">
                {Math.round(progressPercentage)}%
              </div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>

          <Progress value={progressPercentage} className="h-3" />

          {betaData?.rewardEligible && !betaData.rewardClaimed && (
            <Alert className="border-green-500/50 bg-green-50/50">
              <Trophy className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800">
                <span className="font-semibold">Congratulations!</span> You've completed all tasks and are eligible for your reward. Check your email for next steps.
              </AlertDescription>
            </Alert>
          )}

          {betaData?.rewardClaimed && (
            <Alert className="border-blue-500/50 bg-blue-50/50">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <span className="font-semibold">Reward Claimed!</span> Thank you for being an amazing beta tester!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Beta Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-teal-500" />
            Beta Testing Tasks
          </CardTitle>
          <CardDescription>
            Complete these tasks to explore all major features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <AnimatePresence>
            {betaData?.taskProgress?.map((task, index) => {
              const IconComponent = getTaskIcon(task.category);
              
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={`p-4 rounded-lg border-2 transition-all ${
                    task.completed 
                      ? 'bg-green-50/50 border-green-200' 
                      : 'bg-white border-gray-200 hover:border-teal-200'
                  }`}>
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 ${task.completed ? 'text-green-600' : 'text-gray-400'}`}>
                        {task.completed ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          <Circle className="w-6 h-6" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <IconComponent className="w-4 h-4 text-teal-500" />
                          <h3 className={`font-semibold ${
                            task.completed ? 'text-green-900' : 'text-gray-900'
                          }`}>
                            {task.title}
                          </h3>
                          {task.completed && (
                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                              Completed
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {task.description}
                        </p>
                        {!task.completed && task.actionPath && (
                          <Link href={task.actionPath}>
                            <Button 
                              size="sm" 
                              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                            >
                              <PlayCircle className="w-3 h-3 mr-1" />
                              Start Task
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </Button>
                          </Link>
                        )}
                      </div>

                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <span>#{index + 1}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Beta Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Started
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-lg font-semibold">
                {betaData?.startedAt 
                  ? new Date(betaData.startedAt).toLocaleDateString() 
                  : 'N/A'
                }
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Reward Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-green-500" />
              <span className="text-lg font-semibold text-green-600">
                ${betaData?.rewardAmount || 25}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge 
              className={`${
                betaData?.status === 'COMPLETED' 
                  ? 'bg-green-500' 
                  : 'bg-blue-500'
              } text-white`}
            >
              {betaData?.status || 'ACTIVE'}
            </Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
