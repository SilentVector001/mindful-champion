// @ts-nocheck
"use client"

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import MainNavigation from '@/components/navigation/main-navigation'
import Link from 'next/link'
import {
  Zap, Crown, Rocket, CheckCircle, ArrowRight,
  Video, Brain, Target, Trophy, Users, Sparkles,
  Star, TrendingUp, Play, Lock
} from 'lucide-react'
import { cn } from '@/lib/utils'

const tiers = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Begin Your Journey',
    description: 'Perfect for players just getting into pickleball who want to build solid fundamentals.',
    icon: Zap,
    gradient: 'from-emerald-500 to-teal-500',
    bgGlow: 'bg-emerald-500/20',
    features: [
      { text: 'Access to beginner training programs', included: true },
      { text: 'Basic video analysis (3/month)', included: true },
      { text: 'Community forum access', included: true },
      { text: 'Weekly skill tips via email', included: true },
      { text: 'Progress tracking dashboard', included: true },
      { text: 'AI Coach Kai - limited sessions', included: true },
      { text: 'Tournament finder', included: false },
      { text: 'Advanced analytics', included: false },
    ],
    cta: 'Start Free Trial',
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Elevate Your Game',
    description: 'For competitive players ready to take their skills to the next level with AI-powered coaching.',
    icon: Crown,
    gradient: 'from-cyan-500 to-purple-500',
    bgGlow: 'bg-cyan-500/20',
    features: [
      { text: 'All Starter features', included: true },
      { text: 'Unlimited video analysis', included: true },
      { text: 'Full AI Coach Kai access', included: true },
      { text: 'Advanced training programs', included: true },
      { text: 'Shot-by-shot breakdowns', included: true },
      { text: 'Performance heat maps', included: true },
      { text: 'Tournament calendar & alerts', included: true },
      { text: 'Priority support', included: true },
    ],
    cta: 'Go Pro',
    popular: true
  },
  {
    id: 'elite',
    name: 'Elite',
    tagline: 'Compete at the Highest Level',
    description: 'The ultimate package for serious competitors and aspiring professionals.',
    icon: Rocket,
    gradient: 'from-amber-500 to-orange-500',
    bgGlow: 'bg-amber-500/20',
    features: [
      { text: 'All Pro features', included: true },
      { text: '1-on-1 coaching sessions', included: true },
      { text: 'Custom training plans', included: true },
      { text: 'Match strategy analysis', included: true },
      { text: 'Mental game coaching', included: true },
      { text: 'Exclusive elite community', included: true },
      { text: 'Sponsor connection opportunities', included: true },
      { text: 'Tournament prep support', included: true },
    ],
    cta: 'Go Elite',
    popular: false
  }
]

const benefits = [
  { icon: Video, title: 'AI Video Analysis', description: 'Get instant feedback on your technique' },
  { icon: Brain, title: 'Smart Coaching', description: 'Personalized drills based on your weaknesses' },
  { icon: Target, title: 'Goal Tracking', description: 'Set and achieve measurable milestones' },
  { icon: Trophy, title: 'Compete & Win', description: 'Find tournaments and track your ranking' },
]

export default function SubscriptionPage() {
  const { data: session } = useSession() || {}
  const [selectedTier, setSelectedTier] = useState<string | null>(null)

  const handleSelectTier = (tierId: string) => {
    setSelectedTier(tierId)
    // Could navigate to checkout or show more details
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <MainNavigation />
      
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-cyan-500/20 text-cyan-400 border-cyan-500/30 px-4 py-1">
            <Sparkles className="w-4 h-4 mr-2" />
            Transform Your Game
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">
              Choose Your Path to Mastery
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Every champion started somewhere. Pick the plan that matches your ambition and let's elevate your pickleball game together.
          </p>
        </motion.div>

        {/* Benefits Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {benefits.map((benefit, i) => (
            <div key={i} className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-800">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <benefit.icon className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">{benefit.title}</p>
                <p className="text-slate-500 text-xs">{benefit.description}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Pricing Tiers */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className={cn(
                "relative",
                tier.popular && "md:-mt-4 md:mb-4"
              )}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-1 shadow-lg">
                    <Star className="w-3 h-3 mr-1 fill-current" /> Most Popular
                  </Badge>
                </div>
              )}
              
              <Card className={cn(
                "h-full bg-slate-900/60 border-2 transition-all duration-300 overflow-hidden",
                tier.popular 
                  ? "border-cyan-500/50 shadow-lg shadow-cyan-500/20" 
                  : "border-slate-700/50 hover:border-slate-600",
                selectedTier === tier.id && "ring-2 ring-cyan-500"
              )}>
                {/* Glow effect */}
                <div className={cn(
                  "absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-3xl opacity-50",
                  tier.bgGlow
                )} />
                
                <CardContent className="relative p-6">
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className={cn(
                      "w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4",
                      tier.gradient
                    )}>
                      <tier.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">{tier.name}</h3>
                    <p className={cn(
                      "text-sm font-medium bg-gradient-to-r bg-clip-text text-transparent",
                      tier.gradient
                    )}>
                      {tier.tagline}
                    </p>
                  </div>
                  
                  <p className="text-slate-400 text-sm text-center mb-6">
                    {tier.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        {feature.included ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Lock className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={cn(
                          "text-sm",
                          feature.included ? "text-slate-300" : "text-slate-600"
                        )}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleSelectTier(tier.id)}
                    className={cn(
                      "w-full py-6 text-base font-semibold transition-all",
                      tier.popular
                        ? "bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-lg"
                        : "bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                    )}
                  >
                    {tier.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-6 p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <span className="text-slate-300 text-sm">5,000+ Active Players</span>
            </div>
            <div className="w-px h-6 bg-slate-700" />
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span className="text-slate-300 text-sm">Avg 0.5 DUPR Improvement</span>
            </div>
            <div className="w-px h-6 bg-slate-700" />
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              <span className="text-slate-300 text-sm">4.9/5 User Rating</span>
            </div>
          </div>
          
          <p className="mt-6 text-slate-500 text-sm">
            All plans include a 7-day free trial. Cancel anytime.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
