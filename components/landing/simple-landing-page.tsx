'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Upload, Brain, TrendingUp, Target, Trophy, Zap, Video, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import WelcomeVideoCarousel from '@/components/landing/welcome-video-carousel';

export default function SimpleLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900/20 to-slate-900">
      {/* Navigation - Minimal & Clean */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-slate-900/80 border-b border-emerald-500/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/50">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <span className="text-white font-bold text-xl">Mindful Champion</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-white hover:text-emerald-400">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/50 px-6">
                  Start Free
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900/95 backdrop-blur-lg border-t border-emerald-500/20">
            <div className="px-6 py-6 space-y-4">
              <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full text-white hover:text-emerald-400">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg">
                  Start Free
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* HERO SECTION - Full Viewport Impact */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-sm px-4 py-2 rounded-full mb-8">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-semibold">AI-Powered Pickleball Training</span>
            </div>

            {/* Main Headline - HUGE & BOLD */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-[1.1] tracking-tight">
              Your Pickleball Game,{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Elevated by AI
              </span>
            </h1>

            {/* Challenge Subheadline */}
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-300 mb-4 font-medium">
              Don't miss out on the tools that make champions
            </p>

            {/* Support Text */}
            <p className="text-base md:text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
              Transform your game with AI analysis, personalized coaching, and instant feedback
            </p>

            {/* Primary CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Link href="/auth/signup">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-2xl shadow-emerald-500/50 px-12 py-7 text-xl font-bold rounded-xl hover:scale-105 transition-transform"
                >
                  Start Your Free Analysis
                  <ArrowRight className="w-6 h-6 ml-3" />
                </Button>
              </Link>
              <p className="text-sm text-gray-500 mt-4">No credit card required • 7-day free trial</p>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <span className="text-xs uppercase tracking-wider">See how it works</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="w-5 h-5 rotate-90" />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* COACH KAI VIDEO CAROUSEL */}
      <WelcomeVideoCarousel />

      {/* THE SYSTEM - How It Works (Compact, Visual) */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4">
              The System That Makes{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Champions
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
              Four simple steps. Infinite improvement.
            </p>
          </motion.div>

          {/* 4-Step Journey */}
          <div className="grid md:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                step: '01',
                icon: Upload,
                title: 'Upload',
                description: 'Record or upload your gameplay',
                color: 'from-blue-500 to-cyan-500',
              },
              {
                step: '02',
                icon: Brain,
                title: 'AI Analyzes',
                description: 'Our AI detects every shot & movement',
                color: 'from-purple-500 to-pink-500',
              },
              {
                step: '03',
                icon: Target,
                title: 'Get Insights',
                description: 'Receive detailed feedback & scores',
                color: 'from-orange-500 to-red-500',
              },
              {
                step: '04',
                icon: TrendingUp,
                title: 'Improve',
                description: 'Apply insights & dominate the court',
                color: 'from-emerald-500 to-teal-500',
              },
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Connection Line (Desktop) */}
                {idx < 3 && (
                  <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-emerald-500/50 to-transparent -translate-y-1/2 z-0"></div>
                )}

                {/* Card */}
                <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-8 hover:border-emerald-500/50 transition-all group hover:scale-105 shadow-xl">
                  {/* Step Number */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-emerald-500/30 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-emerald-400 font-black text-sm">{step.step}</span>
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURE SECTIONS WITH VISUAL TEASERS */}
      
      {/* 1. COACH KAI & VIDEO ANALYSIS - Image Left, Text Right */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-b from-slate-800 via-slate-900 to-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-emerald-500/30 group-hover:border-emerald-500/60 transition-all">
                <img 
                  src="/images/landing/coach-kai.jpg" 
                  alt="Coach Kai AI Interface" 
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                {/* Badge */}
                <div className="absolute top-6 left-6 bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 rounded-full">
                  <span className="text-white font-bold text-sm">AI-Powered</span>
                </div>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 px-4 py-2 rounded-full mb-6">
                <Brain className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 font-semibold text-sm uppercase tracking-wide">AI Video Analysis</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                Coach Kai Analyzes{' '}
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Every Shot
                </span>
              </h2>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                Upload your match footage and watch as our advanced AI breaks down every aspect of your game. From shot detection to technique scoring, Coach Kai provides instant, actionable feedback.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  'Real-time shot detection (serves, volleys, smashes)',
                  'Detailed technique scoring (0-100 scale)',
                  'Movement pattern analysis',
                  'Personalized improvement recommendations'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-6 text-lg font-bold rounded-xl shadow-lg shadow-blue-500/50 hover:scale-105 transition-transform">
                  Try Video Analysis Free
                  <Video className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. TRAINING PROGRAMS - Image Right, Text Left */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-b from-black via-purple-900/10 to-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 px-4 py-2 rounded-full mb-6">
                <Target className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 font-semibold text-sm uppercase tracking-wide">Structured Training</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                Professional Training{' '}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Programs
                </span>
              </h2>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                Follow expertly crafted training programs designed for every skill level. From beginner fundamentals to advanced tournament prep, our programs guide you step-by-step.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  '7 professional training programs (Beginner to Pro)',
                  'Day-by-day structured curriculum',
                  'Video tutorials and practice drills',
                  'Progress tracking with completion rewards'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-6 text-lg font-bold rounded-xl shadow-lg shadow-purple-500/50 hover:scale-105 transition-transform">
                  Start Training Today
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative group order-1 lg:order-2"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-purple-500/30 group-hover:border-purple-500/60 transition-all">
                <img 
                  src="/images/landing/training-programs.jpg" 
                  alt="Training Programs" 
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute top-6 right-6 bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 rounded-full">
                  <span className="text-white font-bold text-sm">7 Programs</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. GOALS & ACHIEVEMENTS - Image Left, Text Right */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-b from-slate-900 via-orange-900/10 to-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-orange-500/30 group-hover:border-orange-500/60 transition-all">
                <img 
                  src="/images/landing/progress-achievements.jpg" 
                  alt="Progress and Achievements" 
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute top-6 left-6 bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 rounded-full">
                  <span className="text-white font-bold text-sm">Track Everything</span>
                </div>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 px-4 py-2 rounded-full mb-6">
                <TrendingUp className="w-4 h-4 text-orange-400" />
                <span className="text-orange-400 font-semibold text-sm uppercase tracking-wide">Progress Tracking</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                See Your Progress{' '}
                <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  In Real-Time
                </span>
              </h2>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                Set personalized goals and track your journey with detailed analytics. Watch your skills improve through data-driven insights and visual progress charts.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  'Customizable skill improvement goals',
                  'Detailed performance analytics & charts',
                  'Achievement system with rewards',
                  'Historical data comparison'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-6 text-lg font-bold rounded-xl shadow-lg shadow-orange-500/50 hover:scale-105 transition-transform">
                  Track Your Progress
                  <TrendingUp className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. MILESTONES & REWARDS - Image Right, Text Left */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-b from-black via-yellow-900/10 to-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/30 px-4 py-2 rounded-full mb-6">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-semibold text-sm uppercase tracking-wide">Gamification</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                Earn Rewards &{' '}
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Celebrate Wins
                </span>
              </h2>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                Stay motivated with our comprehensive reward system. Unlock achievements, earn badges, and celebrate every milestone on your journey to becoming a champion.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  'Achievement badges for skill milestones',
                  'Tiered reward system (Bronze, Silver, Gold)',
                  'Streak tracking and bonus rewards',
                  'Leaderboards and community recognition'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <span className="text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-6 text-lg font-bold rounded-xl shadow-lg shadow-yellow-500/50 hover:scale-105 transition-transform">
                  Start Earning Rewards
                  <Trophy className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative group order-1 lg:order-2"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-yellow-500/30 group-hover:border-yellow-500/60 transition-all">
                <img 
                  src="/images/landing/milestones-rewards.jpg" 
                  alt="Milestones and Rewards" 
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute top-6 right-6 bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 rounded-full">
                  <span className="text-white font-bold text-sm">100+ Badges</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. TOURNAMENT DISCOVERY - Full Width, Emphasized */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-b from-slate-900 via-emerald-900/20 to-black">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 rounded-full mb-6">
              <Trophy className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-semibold text-sm uppercase tracking-wide">Watch & Compete</span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
              Discover Tournaments{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                For Every Level
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-12">
              Whether you're a senior player, junior champion, recreational enthusiast, or competitive athlete, 
              find and watch live pickleball tournaments from PPA, MLP, and more.
            </p>
          </motion.div>

          {/* Tournament Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative group mb-12"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-emerald-500/40 group-hover:border-emerald-500/70 transition-all">
              <img 
                src="/images/landing/tournament-discovery.jpg" 
                alt="Tournament Discovery" 
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none"></div>
              
              {/* Overlay Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                <div className="max-w-4xl">
                  <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
                    Tournaments for All Ages & Skill Levels
                  </h3>
                  <p className="text-lg text-gray-200 mb-6">
                    Explore tournaments across all categories, from seniors and juniors to recreational and competitive leagues. 
                    Watch live streams, learn from the pros, and find events near you.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {['Seniors 50+', 'Juniors U18', 'Recreational', 'Competitive 3.5-5.0', 'Pro Leagues', 'Local Events'].map((tag, idx) => (
                      <span key={idx} className="bg-emerald-500/30 backdrop-blur-sm border border-emerald-400/50 px-4 py-2 rounded-full text-emerald-300 font-semibold text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tournament Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
            {[
              {
                title: 'All Skill Levels',
                description: 'From beginners to pros, find tournaments that match your rating and experience',
                icon: Target,
              },
              {
                title: 'Age Categories',
                description: 'Seniors, juniors, and adult divisions ensure fair and fun competition',
                icon: Trophy,
              },
              {
                title: 'Live Streaming',
                description: 'Watch PPA, MLP, and regional tournaments live or on-demand',
                icon: Video,
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-6 hover:border-emerald-500/50 transition-all"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">{feature.title}</h4>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Link href="/auth/signup">
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-10 py-6 text-lg font-bold rounded-xl shadow-lg shadow-emerald-500/50 hover:scale-105 transition-transform">
                Explore Tournaments
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CHALLENGE/CTA - Final Push */}
      <section className="relative py-24 lg:py-32 bg-gradient-to-b from-slate-900 to-black">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            {/* Challenge Question */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
              Ready to Play{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Smarter?
              </span>
            </h2>

            {/* FOMO Element */}
            <p className="text-xl md:text-2xl text-gray-300 mb-4">
              Join <span className="text-emerald-400 font-bold">10,000+ players</span> already improving their game
            </p>

            {/* Social Proof Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              {[
                { value: '50K+', label: 'Videos Analyzed' },
                { value: '95%', label: 'Accuracy Rate' },
                { value: '3x', label: 'Faster Improvement' },
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-3xl md:text-4xl font-black text-emerald-400 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-500 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Primary CTA */}
            <Link href="/auth/signup">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-2xl shadow-emerald-500/50 px-12 py-7 text-xl font-bold rounded-xl hover:scale-105 transition-transform mb-4"
              >
                Get Started Free
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            </Link>

            <p className="text-sm text-gray-500">
              Start your 7-day free trial • No credit card required • Cancel anytime
            </p>

            {/* Testimonial Snippet (Optional Social Proof) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="mt-16 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-8 max-w-2xl mx-auto"
            >
              <div className="flex items-center justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-xl">★</span>
                ))}
              </div>
              <p className="text-gray-300 text-lg italic mb-4">
                "This app transformed my game in weeks. The AI feedback is spot-on and Coach Kai feels like having a pro in my pocket."
              </p>
              <p className="text-emerald-400 font-semibold">— Sarah M., 4.0 Player</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* BECOME A SPONSOR SECTION */}
      <section className="relative py-20 lg:py-24 bg-gradient-to-b from-black via-slate-900 to-black border-y border-emerald-500/10">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            {/* Background Glow Effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 blur-3xl opacity-30 pointer-events-none"></div>
            
            <div className="relative">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 px-5 py-2 rounded-full mb-6">
                <Trophy className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-400 font-bold text-sm uppercase tracking-wide">Partnership Opportunities</span>
              </div>

              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                Become a{' '}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  Sponsor
                </span>
              </h2>

              <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
                Join the fastest-growing pickleball platform and connect with thousands of passionate players. 
                Partner with us to elevate your brand in the pickleball community.
              </p>

              {/* Benefits Grid */}
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {[
                  {
                    title: 'Reach',
                    value: '10K+',
                    description: 'Active Players',
                  },
                  {
                    title: 'Engagement',
                    value: '50K+',
                    description: 'Monthly Sessions',
                  },
                  {
                    title: 'Growth',
                    value: '3x',
                    description: 'YoY Expansion',
                  },
                ].map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6 hover:border-emerald-500/40 transition-all"
                  >
                    <div className="text-3xl md:text-4xl font-black text-emerald-400 mb-2">{stat.value}</div>
                    <div className="text-sm text-gray-400 uppercase tracking-wider mb-1">{stat.title}</div>
                    <div className="text-gray-500 text-sm">{stat.description}</div>
                  </motion.div>
                ))}
              </div>

              {/* CTA Button */}
              <Link href="/auth/signin">
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-10 py-6 text-lg font-bold rounded-xl shadow-2xl shadow-emerald-500/50 hover:scale-105 transition-transform">
                  Explore Sponsorship Opportunities
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>

              <p className="text-sm text-gray-500 mt-4">
                Sign in to access our partnership portal and learn more about sponsorship packages
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="bg-black border-t border-emerald-500/20 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 Mindful Champion. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
