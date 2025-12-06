
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Gift,
  Trophy,
  CheckCircle2,
  Sparkles,
  DollarSign,
  Calendar,
  Target,
  ArrowRight,
  Video,
  Brain,
  Dumbbell,
  Users,
  Tv,
  MessageSquare,
  Star,
} from 'lucide-react';
import Link from 'next/link';

interface BetaWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  promoCodeDetails: {
    durationDays: number;
    rewardAmount: number;
    isBetaTester: boolean;
  };
}

const betaTasks = [
  {
    id: 'upload-video',
    title: 'Upload Your First Video',
    description: 'Get AI-powered analysis',
    icon: Video,
    path: '/train/video',
  },
  {
    id: 'start-training',
    title: 'Start a Training Program',
    description: 'Follow a structured plan',
    icon: Dumbbell,
    path: '/train',
  },
  {
    id: 'ask-coach-kai',
    title: 'Ask Coach Kai a Question',
    description: 'Get personalized coaching',
    icon: Brain,
    path: '/train/coach',
  },
  {
    id: 'complete-drill',
    title: 'Complete a Practice Drill',
    description: 'Improve your skills',
    icon: Target,
    path: '/train/drills',
  },
  {
    id: 'find-partner',
    title: 'Find a Practice Partner',
    description: 'Connect with players',
    icon: Users,
    path: '/connect',
  },
  {
    id: 'watch-tournament',
    title: 'Watch Tournament Content',
    description: 'Learn from the pros',
    icon: Tv,
    path: '/media',
  },
  {
    id: 'leave-feedback',
    title: 'Leave Feedback',
    description: 'Help us improve',
    icon: MessageSquare,
    path: '/beta',
  },
];

export default function BetaWelcomeModal({
  isOpen,
  onClose,
  promoCodeDetails,
}: BetaWelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!promoCodeDetails.isBetaTester) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="relative">
          {/* Decorative background */}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 opacity-50 rounded-lg" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-teal-200/20 to-cyan-200/20 rounded-full blur-3xl" />
          
          <div className="relative">
            <DialogHeader className="space-y-4">
              {/* Icon Header */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.5 }}
                className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-xl"
              >
                <Gift className="w-10 h-10 text-white" />
              </motion.div>

              <DialogTitle className="text-center">
                <span className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Welcome to Beta Testing! 🎉
                </span>
              </DialogTitle>
              
              <DialogDescription className="text-center text-base">
                You've been selected to help shape the future of Mindful Champion
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 space-y-6">
              {/* Benefits Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* PRO Access Card */}
                <Card className="p-6 border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 mb-1">
                        {promoCodeDetails.durationDays} Days PRO Access
                      </h3>
                      <p className="text-sm text-slate-600">
                        Unlock all premium features including unlimited video analysis, advanced training programs, and Coach Kai
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Reward Card */}
                <Card className="p-6 border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 mb-1">
                        ${promoCodeDetails.rewardAmount} Amazon Gift Card
                      </h3>
                      <p className="text-sm text-slate-600">
                        Complete 7 simple tasks and earn your reward as a thank you for your feedback
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Tasks Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-5 h-5 text-teal-600" />
                  <h3 className="font-bold text-lg text-slate-900">
                    Complete These 7 Tasks to Earn Your Reward:
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {betaTasks.map((task, index) => {
                    const Icon = task.icon;
                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="p-4 hover:shadow-lg transition-all duration-300 cursor-pointer group border-l-4 border-l-teal-500">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 text-xs font-bold flex items-center justify-center">
                                  {index + 1}
                                </span>
                                <h4 className="font-semibold text-sm text-slate-900">
                                  {task.title}
                                </h4>
                              </div>
                              <p className="text-xs text-slate-600 mt-1">
                                {task.description}
                              </p>
                            </div>
                            <CheckCircle2 className="w-5 h-5 text-slate-300 flex-shrink-0" />
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Important Notes */}
              <Card className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                <div className="flex gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm space-y-2">
                    <p className="font-semibold text-slate-900">Important Notes:</p>
                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                      <li>Tasks are automatically tracked as you use the platform</li>
                      <li>Visit the <Link href="/beta" className="text-teal-600 font-semibold hover:underline">Beta Dashboard</Link> anytime to check your progress</li>
                      <li>You'll receive your gift card within 5 business days after completing all tasks</li>
                      <li>Your PRO access starts immediately and lasts {promoCodeDetails.durationDays} days</li>
                    </ul>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={onClose}
                  className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Let's Get Started!
                </Button>
                <Link href="/beta" className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full border-teal-300 hover:bg-teal-50"
                    size="lg"
                  >
                    View Beta Dashboard
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
