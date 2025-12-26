'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Sparkles,
  Video,
  Brain,
  Trophy,
  Users,
  Calendar,
  X,
  CheckCircle2,
  ArrowRight,
  PlayCircle,
  Dumbbell,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface GettingStartedGuideProps {
  onDismiss?: () => void;
  userName?: string;
}

const quickStartSteps = [
  {
    id: 'video-analysis',
    title: 'Upload Your First Video',
    description: 'Get AI-powered analysis of your pickleball game',
    icon: Video,
    color: 'from-purple-500 to-pink-500',
    link: '/train/video',
    action: 'Upload Video'
  },
  {
    id: 'coach-kai',
    title: 'Talk to Coach Kai',
    description: 'Ask questions and get personalized coaching advice',
    icon: Brain,
    color: 'from-teal-500 to-cyan-500',
    link: '/train/coach',
    action: 'Chat Now'
  },
  {
    id: 'training-program',
    title: 'Start a Training Program',
    description: 'Follow structured daily workouts to improve',
    icon: Dumbbell,
    color: 'from-orange-500 to-red-500',
    link: '/train',
    action: 'Browse Programs'
  },
  {
    id: 'practice-drills',
    title: 'Try Practice Drills',
    description: 'Learn specific skills with guided exercises',
    icon: Target,
    color: 'from-green-500 to-emerald-500',
    link: '/train/drills',
    action: 'View Drills'
  },
  {
    id: 'tournaments',
    title: 'Watch Tournaments',
    description: 'Follow live events and professional matches',
    icon: Trophy,
    color: 'from-yellow-500 to-amber-500',
    link: '/media',
    action: 'Explore Events'
  },
  {
    id: 'connect',
    title: 'Find Practice Partners',
    description: 'Connect with players at your skill level',
    icon: Users,
    color: 'from-blue-500 to-indigo-500',
    link: '/connect',
    action: 'Find Partners'
  },
];

function Target({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
}

export default function GettingStartedGuide({ onDismiss, userName }: GettingStartedGuideProps) {
  const [dismissed, setDismissed] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
    // Store dismissal in localStorage
    localStorage.setItem('getting-started-dismissed', 'true');
  };

  const handleStepClick = (stepId: string) => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(stepId);
    setCompletedSteps(newCompleted);
    localStorage.setItem('getting-started-completed', JSON.stringify(Array.from(newCompleted)));
  };

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="relative overflow-hidden border-2 border-teal-200 bg-gradient-to-br from-teal-50/50 via-white to-cyan-50/50">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-teal-100/20 to-cyan-100/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-100/20 to-pink-100/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <CardHeader className="relative pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    Welcome{userName ? `, ${userName}` : ''}! 👋
                  </CardTitle>
                  <p className="text-sm text-slate-600 mt-1">
                    Here's how to get started with Mindful Champion
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="hover:bg-slate-100 rounded-full h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="relative space-y-4">
            {/* Progress indicator */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedSteps.size / quickStartSteps.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-xs font-medium text-slate-600 whitespace-nowrap">
                {completedSteps.size}/{quickStartSteps.length} explored
              </span>
            </div>

            {/* Quick start steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {quickStartSteps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = completedSteps.has(step.id);

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={step.link}
                      onClick={() => handleStepClick(step.id)}
                      className="block"
                    >
                      <Card className={cn(
                        "h-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer group",
                        isCompleted && "bg-teal-50 border-teal-200"
                      )}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br",
                              step.color,
                              "shadow-md group-hover:shadow-lg transition-shadow"
                            )}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-sm text-slate-900 line-clamp-1">
                                  {step.title}
                                </h3>
                                {isCompleted && (
                                  <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                                {step.description}
                              </p>
                              <div className="flex items-center gap-1 text-xs font-medium text-teal-600 group-hover:gap-2 transition-all">
                                {step.action}
                                <ArrowRight className="w-3 h-3" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom CTA */}
            <div className="mt-6 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-100">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <PlayCircle className="w-8 h-8 text-teal-600" />
                  <div>
                    <p className="font-medium text-slate-900">Need a quick tour?</p>
                    <p className="text-xs text-slate-600">Watch our 2-minute getting started video</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-teal-300 hover:bg-teal-50 whitespace-nowrap"
                  onClick={() => setIsVideoOpen(true)}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  View Guide
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Video Modal */}
        <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
          <DialogContent className="max-w-4xl p-0 bg-black">
            <DialogHeader className="p-4 pb-0 bg-black">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-white">Getting Started with Mindful Champion</DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsVideoOpen(false)}
                  className="h-8 w-8 rounded-full hover:bg-white/10 text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </DialogHeader>
            <div className="aspect-video w-full bg-black relative">
              <video
                key={isVideoOpen ? 'playing' : 'stopped'}
                controls
                autoPlay
                className="w-full h-full"
                src="/videos/getting-started-guide.mp4"
                preload="auto"
                controlsList="nodownload"
                onError={(e) => {
                  console.error('Video failed to load:', e);
                }}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </AnimatePresence>
  );
}
