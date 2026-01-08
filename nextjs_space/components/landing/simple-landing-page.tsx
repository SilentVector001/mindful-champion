// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Mic, Video, Trophy, TrendingUp, Target, Zap, Play, Sparkles, Star, Users, BarChart3, Calendar, CheckCircle2, Award, BookOpen, Dumbbell, Activity, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

const heroWords = ['Analyzed', 'Perfected', 'Elevated', 'Mastered'];

export default function SimpleLandingPage() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % heroWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-950/90 border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg">Mindful Champion</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/auth/signin">
                <Button variant="ghost" className="text-white hover:text-cyan-400 text-sm px-3">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white text-sm px-4 py-2 h-9">
                  Start Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO - Full Visual Impact with Pickleball Action */}
      <section className="relative pt-16 min-h-[85vh] flex items-center overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1761644658016-324918bc373c?w=1920&q=80"
            alt="Pickleball players competing in an intense match"
            fill
            className="object-cover opacity-70"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 bg-cyan-500/20 border border-cyan-500/40 px-4 py-2 rounded-full mb-6"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400 text-sm font-semibold">AI-Powered Pickleball Training</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-[1.1]"
              >
                Master Your Game.
                <br />
                <span className="relative inline-block">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={currentWordIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent"
                    >
                      {heroWords[currentWordIndex]}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-gray-300 mb-8 max-w-xl"
              >
                Structured programs. AI coaching. Real results.
                <br className="hidden sm:block" />
                <span className="text-cyan-400 font-semibold">Any skill level. Any age.</span>
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 mb-8"
              >
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white px-8 py-6 text-lg font-bold rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transition-all w-full sm:w-auto">
                    <Play className="w-5 h-5 mr-2 fill-current" />
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="#programs">
                  <Button size="lg" variant="outline" className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400 px-8 py-6 text-lg font-semibold rounded-xl w-full sm:w-auto backdrop-blur-sm">
                    See Programs
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap gap-6 text-sm text-gray-400"
              >
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500" /> No credit card required
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500" /> 7-day free trial
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500" /> Cancel anytime
                </span>
              </motion.div>
            </div>

            {/* Right: App Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative hidden lg:block"
            >
              <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl border border-cyan-500/30 p-4 shadow-2xl shadow-cyan-500/20">
                <motion.div 
                  className="absolute -top-3 -right-3 bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-1.5 rounded-full text-white text-sm font-bold shadow-lg"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(6, 182, 212, 0.5)',
                      '0 0 30px rgba(20, 184, 166, 0.7)',
                      '0 0 20px rgba(6, 182, 212, 0.5)',
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ✨ Coach Kai Ready
                </motion.div>
                <div className="relative aspect-video">
                  <Image
                    src="https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&q=80"
                    alt="Female athlete in powerful tennis swing motion"
                    fill
                    className="rounded-xl object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TRAINING PROGRAMS - Key Value Prop with Visual */}
      <section id="programs" className="py-20 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden border border-cyan-500/20 shadow-2xl">
                <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 rounded-full text-white font-bold shadow-lg">
                  7 Programs
                </div>
                <Image
                  src="https://images.unsplash.com/photo-1761644518970-2ed0ab543e1b?w=700&q=80"
                  alt="Pickleball coaching session with players learning technique"
                  width={600}
                  height={400}
                  className="w-full object-cover"
                />
              </div>
            </motion.div>

            {/* Right: Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 rounded-full mb-4">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-sm font-semibold">STRUCTURED TRAINING</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                Professional Training
                <br />
                <span className="text-emerald-400">Programs</span>
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                Follow expertly crafted training programs designed for every skill level. From beginner fundamentals to advanced tournament prep, our programs guide you step-by-step.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  '7 professional training programs (Beginner to Pro)',
                  'Day-by-day structured curriculum',
                  'Video tutorials and practice drills',
                  'Progress tracking with completion rewards',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-semibold">
                  Start Training Today
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* AI VIDEO ANALYSIS - New Section */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950 relative overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Visual Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative order-2 lg:order-1"
            >
              {/* Main video analysis mockup */}
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-2 border-purple-500/40 p-6 shadow-2xl shadow-purple-500/20">
                <motion.div 
                  className="absolute -top-3 left-6 bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-1.5 rounded-full text-white text-sm font-bold shadow-lg shadow-purple-500/50"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(168, 85, 247, 0.5)',
                      '0 0 40px rgba(99, 102, 241, 0.7)',
                      '0 0 20px rgba(168, 85, 247, 0.5)',
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🎥 AI Analysis - LIVE
                </motion.div>

                {/* Video frame mockup */}
                <div className="relative rounded-xl overflow-hidden mb-4">
                  <Image
                    src="https://images.unsplash.com/photo-1761644658016-324918bc373c?w=600&q=80"
                    alt="AI Video Analysis Interface"
                    width={600}
                    height={400}
                    className="w-full rounded-xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  
                  {/* AI overlay indicators */}
                  <motion.div 
                    className="absolute top-4 left-4 bg-purple-500/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-xs font-bold"
                    animate={{ opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Brain className="w-3 h-3 inline mr-1" />
                    Analyzing Form...
                  </motion.div>

                  {/* Shot detection indicator */}
                  <motion.div 
                    className="absolute top-4 right-4 bg-emerald-500/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-xs font-bold"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Shot Detected: Serve
                  </motion.div>

                  {/* Professional Pose Detection Overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Motion tracking lines - subtle */}
                    <svg className="absolute inset-0 w-full h-full opacity-60" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <motion.path
                        d="M 30 70 Q 35 50 45 40 T 60 30"
                        stroke="url(#trackGradient)"
                        strokeWidth="0.5"
                        fill="none"
                        strokeDasharray="2 2"
                        animate={{ pathLength: [0, 1], opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <defs>
                        <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#22d3ee" />
                          <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Analysis callout boxes */}
                    <motion.div 
                      className="absolute top-1/4 left-4 bg-slate-900/90 backdrop-blur-sm border border-cyan-500/50 rounded-lg p-2 text-xs max-w-[140px]"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                    >
                      <div className="text-cyan-400 font-bold mb-1">⚡ Swing Arc</div>
                      <div className="text-white">Elbow angle: <span className="text-emerald-400">142°</span></div>
                      <div className="text-slate-400 text-[10px]">Optimal: 135-150°</div>
                    </motion.div>

                    <motion.div 
                      className="absolute bottom-1/4 right-4 bg-slate-900/90 backdrop-blur-sm border border-emerald-500/50 rounded-lg p-2 text-xs max-w-[140px]"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                    >
                      <div className="text-emerald-400 font-bold mb-1">🦶 Footwork</div>
                      <div className="text-white">Stance width: <span className="text-cyan-400">Good</span></div>
                      <div className="text-slate-400 text-[10px]">Weight transfer detected</div>
                    </motion.div>

                    {/* Joint tracking points - small, professional */}
                    {[
                      { top: '35%', left: '45%', label: 'Shoulder' },
                      { top: '28%', left: '55%', label: 'Elbow' },
                      { top: '55%', left: '42%', label: 'Hip' },
                    ].map((point, i) => (
                      <motion.div
                        key={i}
                        className="absolute"
                        style={{ top: point.top, left: point.left }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      >
                        <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50" />
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Analysis results cards */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Form Score', value: '8.5/10', color: 'from-green-500 to-emerald-500', icon: '✓' },
                    { label: 'Power Rating', value: '92%', color: 'from-orange-500 to-red-500', icon: '⚡' },
                    { label: 'Accuracy', value: '87%', color: 'from-blue-500 to-cyan-500', icon: '🎯' },
                    { label: 'Technique', value: 'Good', color: 'from-purple-500 to-pink-500', icon: '⭐' },
                  ].map((metric, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-slate-700/30 border border-purple-500/20 rounded-lg p-3 hover:border-purple-500/40 transition-all"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-400 text-xs">{metric.label}</span>
                        <span className="text-lg">{metric.icon}</span>
                      </div>
                      <div className={`text-white font-bold text-lg bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}>
                        {metric.value}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Progress indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 flex items-center gap-2 text-xs text-gray-400"
                >
                  <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                      initial={{ width: 0 }}
                      whileInView={{ width: '75%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5 }}
                    />
                  </div>
                  <span>Processing: 75%</span>
                </motion.div>
              </div>

              {/* Feature badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap gap-3 mt-4"
              >
                {['Pose Detection', 'Shot Tracking', 'Form Analysis'].map((badge, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-800/50 border border-purple-500/30 px-4 py-2 rounded-full text-purple-300 text-sm font-medium"
                  >
                    {badge}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/40 px-3 py-1.5 rounded-full mb-4 shadow-lg shadow-purple-500/20">
                <Video className="w-4 h-4 text-purple-400 animate-pulse" />
                <span className="text-purple-400 text-sm font-semibold">AI VIDEO ANALYSIS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                Master Your Technique
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">With AI-Powered Video Analysis</span>
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                Upload your game footage and our AI instantly detects <span className="text-purple-400 font-semibold">17 body keypoints</span> to analyze your swing mechanics, footwork, and court positioning. Get frame-by-frame breakdowns showing exactly where your technique needs work.
              </p>

              {/* What We Analyze */}
              <div className="mb-6">
                <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  What Our AI Detects
                </h3>
                <ul className="space-y-2.5">
                  {[
                    { text: 'Elbow & wrist angles during serve (optimal: 135-150°)', detail: true },
                    { text: 'Paddle face angle at contact point', detail: true },
                    { text: 'Hip rotation speed and timing', detail: true },
                    { text: 'Stance width and weight distribution', detail: true },
                    { text: 'Shot type detection: serves, dinks, drives, volleys', detail: false },
                    { text: 'Ball trajectory and spin analysis', detail: false },
                  ].map((item, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-3 text-gray-300"
                    >
                      <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${item.detail ? 'text-emerald-500' : 'text-purple-500'}`} />
                      <span>{item.text}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* Benefits */}
              <div className="mb-8">
                <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  Benefits
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { text: 'Improve technique faster', icon: Zap },
                    { text: 'Identify weaknesses', icon: Target },
                    { text: 'Track progress over time', icon: TrendingUp },
                    { text: 'Get personalized feedback', icon: Sparkles },
                    { text: 'Learn from your mistakes', icon: BookOpen },
                  ].map((benefit, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center gap-2 p-2.5 bg-slate-800/30 border border-purple-500/10 rounded-lg hover:border-purple-500/30 transition-all group"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <benefit.icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{benefit.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <Link href="/train/video">
                <Button className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 transition-all">
                  <Video className="w-5 h-5 mr-2" />
                  Start Video Analysis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* DRILL LIBRARY - Visual Grid */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/40 px-3 py-1.5 rounded-full mb-4">
              <Dumbbell className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 text-sm font-semibold">DRILL LIBRARY</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              100+ Drills for <span className="text-orange-400">Every Skill</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Master every aspect of your game with our comprehensive drill library
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { name: 'Serve', image: 'https://images.unsplash.com/photo-1761644789725-98e84ef4b8c8?w=300&q=80', count: '25+' },
              { name: 'Dink', image: 'https://images.unsplash.com/photo-1761644658016-324918bc373c?w=300&q=80', count: '30+' },
              { name: 'Volley', image: 'https://images.unsplash.com/photo-1693142517898-2f986215e412?w=300&q=80', count: '20+' },
              { name: 'Footwork', image: 'https://images.unsplash.com/photo-1761644518970-2ed0ab543e1b?w=300&q=80', count: '15+' },
              { name: 'Strategy', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&q=80', count: '20+' },
            ].map((drill, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group relative rounded-xl overflow-hidden border border-slate-700 hover:border-orange-500/50 transition-all cursor-pointer"
              >
                <div className="aspect-square relative">
                  <Image
                    src={drill.image}
                    alt={drill.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="text-white font-bold text-lg">{drill.name}</div>
                    <div className="text-orange-400 text-sm font-medium">{drill.count} drills</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Link href="/auth/signup">
              <Button variant="outline" className="border-orange-500/40 text-orange-400 hover:bg-orange-500/10 px-6 py-3 rounded-xl font-semibold">
                Explore All Drills
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* COACH KAI - AI Coach Visual - ENHANCED WITH DYNAMIC EFFECTS */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950 relative overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/40 px-3 py-1.5 rounded-full mb-4 shadow-lg shadow-blue-500/20">
                <Mic className="w-4 h-4 text-blue-400 animate-pulse" />
                <span className="text-blue-400 text-sm font-semibold">AI VOICE COACH</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                Meet Coach Kai
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">Your Personal AI Coach</span>
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                Talk to Coach Kai anytime, anywhere. Get instant answers about technique, strategy, rules, and training. It's like having a pro coach in your pocket.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Voice-activated coaching on any device',
                  'Real-time strategy and technique tips',
                  'Personalized training recommendations',
                  'Available 24/7 - on court or off',
                ].map((item, idx) => (
                  <motion.li 
                    key={idx} 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3 text-gray-300"
                  >
                    <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    {item}
                  </motion.li>
                ))}
              </ul>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all">
                  <Mic className="w-5 h-5 mr-2" />
                  Talk to Coach Kai
                </Button>
              </Link>
            </motion.div>

            {/* Right: Coach Kai Interface Mockup - ENHANCED */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Glowing border effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 rounded-2xl blur opacity-30 group-hover:opacity-50 animate-pulse" />
              
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-2 border-blue-500/40 p-6 shadow-2xl shadow-blue-500/20">
                {/* Animated badge */}
                <motion.div 
                  className="absolute -top-3 left-6 bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-1.5 rounded-full text-white text-sm font-bold shadow-lg shadow-blue-500/50"
                  animate={{ 
                    boxShadow: [
                      '0 0 20px rgba(59, 130, 246, 0.5)',
                      '0 0 40px rgba(6, 182, 212, 0.7)',
                      '0 0 20px rgba(59, 130, 246, 0.5)',
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🎙️ Coach Kai - LIVE
                </motion.div>

                <div className="space-y-4 pt-4">
                  {/* Coach message */}
                  <motion.div 
                    className="flex gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <motion.div 
                      className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                      animate={{ 
                        boxShadow: [
                          '0 0 0px rgba(59, 130, 246, 0.5)',
                          '0 0 20px rgba(6, 182, 212, 0.8)',
                          '0 0 0px rgba(59, 130, 246, 0.5)',
                        ]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      K
                    </motion.div>
                    <motion.div 
                      className="flex-1 bg-blue-500/10 border border-blue-500/30 rounded-2xl rounded-tl-none p-4 shadow-lg"
                      whileHover={{ scale: 1.02, borderColor: 'rgba(59, 130, 246, 0.5)' }}
                    >
                      <p className="text-gray-200">Hey! I'm Coach Kai. What would you like to work on today? I can help with technique, strategy, or recommend drills!</p>
                    </motion.div>
                  </motion.div>

                  {/* User message */}
                  <motion.div 
                    className="flex gap-3 justify-end"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.div 
                      className="bg-slate-700/50 rounded-2xl rounded-tr-none p-4 max-w-[80%]"
                      whileHover={{ scale: 1.02, backgroundColor: 'rgba(51, 65, 85, 0.6)' }}
                    >
                      <p className="text-gray-300">How do I improve my third shot drop?</p>
                    </motion.div>
                  </motion.div>

                  {/* Coach response */}
                  <motion.div 
                    className="flex gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                  >
                    <motion.div 
                      className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                      animate={{ 
                        boxShadow: [
                          '0 0 0px rgba(59, 130, 246, 0.5)',
                          '0 0 20px rgba(6, 182, 212, 0.8)',
                          '0 0 0px rgba(59, 130, 246, 0.5)',
                        ]
                      }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                    >
                      K
                    </motion.div>
                    <motion.div 
                      className="flex-1 bg-blue-500/10 border border-blue-500/30 rounded-2xl rounded-tl-none p-4 shadow-lg"
                      whileHover={{ scale: 1.02, borderColor: 'rgba(59, 130, 246, 0.5)' }}
                    >
                      <p className="text-gray-200">Great question! The third shot drop is crucial for transitioning to the kitchen. Focus on a soft, open paddle face and follow through toward your target...</p>
                    </motion.div>
                  </motion.div>
                </div>

                {/* Voice input with animated waves */}
                <motion.div 
                  className="mt-6 flex items-center gap-3 bg-slate-700/50 rounded-xl p-3 border border-blue-500/20 hover:border-blue-500/40 transition-all"
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div 
                    className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center relative shadow-lg shadow-blue-500/50"
                    animate={{ 
                      boxShadow: [
                        '0 0 20px rgba(59, 130, 246, 0.5)',
                        '0 0 40px rgba(6, 182, 212, 0.8)',
                        '0 0 20px rgba(59, 130, 246, 0.5)',
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Mic className="w-6 h-6 text-white" />
                    {/* Animated voice waves */}
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-blue-400"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.8, 0, 0.8],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-cyan-400"
                      animate={{
                        scale: [1, 1.8, 1],
                        opacity: [0.6, 0, 0.6],
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                    />
                  </motion.div>
                  <div className="flex-1">
                    <div className="text-white font-medium mb-1">Voice Active</div>
                    <div className="flex gap-1 items-center">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-full"
                          animate={{
                            height: [8, 20, 8],
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.1,
                          }}
                        />
                      ))}
                      <span className="text-blue-400 text-sm ml-2">Listening...</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PROGRESS TRACKING - Dashboard Visual - ENHANCED WITH PERSONALITY */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Dashboard Preview with Animated Charts */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative order-2 lg:order-1"
            >
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/30 p-6 shadow-2xl shadow-cyan-500/10">
                <motion.div 
                  className="absolute -top-3 left-6 bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-1.5 rounded-full text-white text-sm font-bold shadow-lg"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(6, 182, 212, 0.5)',
                      '0 0 30px rgba(20, 184, 166, 0.7)',
                      '0 0 20px rgba(6, 182, 212, 0.5)',
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  📊 Live Analytics
                </motion.div>

                {/* Animated Progress Bars */}
                <div className="space-y-6 pt-4">
                  {/* Skill metrics */}
                  {[
                    { skill: 'Serve Accuracy', value: 85, color: 'from-orange-500 to-red-500', icon: '🎯' },
                    { skill: 'Dink Control', value: 72, color: 'from-blue-500 to-cyan-500', icon: '💧' },
                    { skill: 'Court Coverage', value: 90, color: 'from-green-500 to-emerald-500', icon: '⚡' },
                    { skill: 'Shot Selection', value: 68, color: 'from-purple-500 to-pink-500', icon: '🧠' },
                  ].map((metric, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{metric.icon}</span>
                          <span className="text-white font-semibold text-sm">{metric.skill}</span>
                        </div>
                        <motion.span 
                          className="text-cyan-400 font-bold text-sm"
                          initial={{ opacity: 0 }}
                          whileInView={{ opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.1 + 0.5 }}
                        >
                          {metric.value}%
                        </motion.span>
                      </div>
                      <div className="relative h-3 bg-slate-700/50 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${metric.color} rounded-full relative`}
                          initial={{ width: 0 }}
                          whileInView={{ width: `${metric.value}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, delay: idx * 0.1, ease: 'easeOut' }}
                        >
                          <motion.div
                            className="absolute inset-0 bg-white/20"
                            animate={{
                              x: ['-100%', '100%'],
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: 'linear',
                            }}
                          />
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Stats Cards */}
                  <div className="grid grid-cols-3 gap-3 mt-6">
                    {[
                      { label: 'Training Days', value: '47', trend: '+12%', icon: '📅' },
                      { label: 'Drills Done', value: '156', trend: '+28%', icon: '🏋️' },
                      { label: 'Avg. Score', value: '4.2', trend: '+0.8', icon: '⭐' },
                    ].map((stat, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + idx * 0.1 }}
                        className="bg-slate-700/30 border border-cyan-500/20 rounded-xl p-3 hover:border-cyan-500/40 hover:scale-105 transition-all"
                        whileHover={{ y: -5 }}
                      >
                        <div className="text-2xl mb-1">{stat.icon}</div>
                        <div className="text-white font-bold text-lg">{stat.value}</div>
                        <div className="text-gray-400 text-xs mb-1">{stat.label}</div>
                        <motion.div 
                          className="text-green-400 text-xs font-semibold flex items-center gap-1"
                          animate={{ opacity: [1, 0.6, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <TrendingUp className="w-3 h-3" />
                          {stat.trend}
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Chart visualization mockup */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 }}
                    className="mt-4 bg-slate-700/20 border border-cyan-500/20 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white text-sm font-semibold">Weekly Progress</span>
                      <Activity className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="flex items-end justify-between h-24 gap-2">
                      {[40, 65, 52, 78, 85, 72, 90].map((height, idx) => (
                        <motion.div
                          key={idx}
                          className="flex-1 bg-gradient-to-t from-cyan-500 to-teal-400 rounded-t"
                          initial={{ height: 0 }}
                          whileInView={{ height: `${height}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: 0.9 + idx * 0.05 }}
                          whileHover={{ opacity: 0.8, scale: 1.05 }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Right: Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div className="inline-flex items-center gap-2 bg-cyan-500/20 border border-cyan-500/40 px-3 py-1.5 rounded-full mb-4 shadow-lg shadow-cyan-500/20">
                <TrendingUp className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="text-cyan-400 text-sm font-semibold">PROGRESS TRACKING</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                See Your Progress
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">In Real-Time</span>
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                Set personalized goals and track your journey with detailed analytics. Watch your skills improve through data-driven insights and visual progress charts.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  { text: 'Customizable skill improvement goals', icon: Target },
                  { text: 'Detailed performance analytics & charts', icon: BarChart3 },
                  { text: 'Achievement system with rewards', icon: Award },
                  { text: 'Historical data comparison', icon: Calendar },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-slate-800/30 border border-cyan-500/10 rounded-lg hover:border-cyan-500/30 hover:bg-slate-800/50 transition-all group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-300 group-hover:text-white transition-colors">{item.text}</span>
                  </motion.div>
                ))}
              </div>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-semibold shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transition-all">
                  Track Your Progress
                  <TrendingUp className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* GAMIFICATION - Badges Visual - ENHANCED WITH 3D EFFECTS */}
      <section className="py-20 bg-gradient-to-b from-slate-950 to-slate-900 relative overflow-hidden">
        {/* Sparkle particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-20 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-10 left-20 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/40 px-3 py-1.5 rounded-full mb-4 shadow-lg shadow-yellow-500/20">
                <Award className="w-4 h-4 text-yellow-400 animate-pulse" />
                <span className="text-yellow-400 text-sm font-semibold">GAMIFICATION</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                Earn Rewards &
                <br />
                <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent">Celebrate Wins</span>
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                Stay motivated with our comprehensive reward system. Unlock achievements, earn badges, and celebrate every milestone on your journey to becoming a champion.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  { text: 'Achievement badges for skill milestones', icon: Star },
                  { text: 'Tiered reward system (Bronze, Silver, Gold)', icon: Award },
                  { text: 'Streak tracking and bonus rewards', icon: Zap },
                  { text: 'Leaderboards and community recognition', icon: Users },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-slate-800/30 border border-yellow-500/10 rounded-lg hover:border-yellow-500/30 hover:bg-slate-800/50 transition-all group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-gray-300 group-hover:text-white transition-colors">{item.text}</span>
                  </motion.div>
                ))}
              </div>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-semibold shadow-xl shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:scale-105 transition-all">
                  Start Earning Rewards
                  <Award className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>

            {/* Right: Badges Display - ENHANCED WITH 3D EFFECTS */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <motion.div 
                className="absolute -top-3 right-6 bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-1.5 rounded-full text-white text-sm font-bold z-10 shadow-lg shadow-yellow-500/50"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(234, 179, 8, 0.5)',
                    '0 0 30px rgba(249, 115, 22, 0.7)',
                    '0 0 20px rgba(234, 179, 8, 0.5)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ✨ 100+ Badges
              </motion.div>
              <div className="grid grid-cols-3 gap-4 pt-6">
                {[
                  { emoji: '🏆', name: 'Champion', color: 'from-yellow-500/30 to-orange-500/30', borderColor: 'yellow-500', shadowColor: 'yellow' },
                  { emoji: '🎯', name: 'Sharpshooter', color: 'from-red-500/30 to-pink-500/30', borderColor: 'red-500', shadowColor: 'red' },
                  { emoji: '⚡', name: 'Speed Demon', color: 'from-blue-500/30 to-cyan-500/30', borderColor: 'blue-500', shadowColor: 'blue' },
                  { emoji: '🔥', name: 'On Fire', color: 'from-orange-500/30 to-red-500/30', borderColor: 'orange-500', shadowColor: 'orange' },
                  { emoji: '💪', name: 'Consistent', color: 'from-green-500/30 to-emerald-500/30', borderColor: 'green-500', shadowColor: 'green' },
                  { emoji: '🌟', name: 'Rising Star', color: 'from-purple-500/30 to-pink-500/30', borderColor: 'purple-500', shadowColor: 'purple' },
                ].map((badge, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.5, rotateY: -180 }}
                    whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                    viewport={{ once: true }}
                    transition={{ 
                      delay: idx * 0.15, 
                      type: 'spring',
                      stiffness: 200,
                      damping: 15 
                    }}
                    whileHover={{ 
                      scale: 1.15, 
                      rotateY: 15,
                      rotateX: 10,
                      transition: { duration: 0.3 }
                    }}
                    className={`relative bg-gradient-to-br ${badge.color} border-2 border-${badge.borderColor}/40 rounded-xl p-6 text-center cursor-pointer group`}
                    style={{
                      transformStyle: 'preserve-3d',
                      perspective: '1000px'
                    }}
                  >
                    {/* Glow effect on hover */}
                    <motion.div
                      className={`absolute inset-0 rounded-xl bg-gradient-to-br ${badge.color} blur opacity-0 group-hover:opacity-60 transition-opacity -z-10`}
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: idx * 0.2
                      }}
                    />
                    
                    {/* Badge content */}
                    <motion.div
                      className="relative"
                      animate={{
                        y: [0, -5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: idx * 0.3
                      }}
                    >
                      <div className="text-5xl mb-2 filter drop-shadow-lg">{badge.emoji}</div>
                      <div className="text-white text-sm font-bold">{badge.name}</div>
                    </motion.div>

                    {/* Sparkle effect */}
                    <motion.div
                      className="absolute -top-2 -right-2 text-yellow-400"
                      animate={{
                        scale: [0, 1.5, 0],
                        rotate: [0, 180, 360],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: idx * 0.5
                      }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </motion.div>

                    {/* Shine effect */}
                    <motion.div
                      className="absolute inset-0 rounded-xl overflow-hidden"
                      initial={{ x: '-100%' }}
                      whileHover={{
                        x: '100%',
                        transition: { duration: 0.6, ease: 'easeInOut' }
                      }}
                    >
                      <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                    </motion.div>
                  </motion.div>
                ))}
              </div>

              {/* Tier indicators */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 }}
                className="flex justify-center gap-4 mt-6"
              >
                {['Bronze', 'Silver', 'Gold'].map((tier, idx) => (
                  <motion.div
                    key={tier}
                    className="flex items-center gap-2 bg-slate-800/50 border border-yellow-500/20 px-4 py-2 rounded-full"
                    whileHover={{ scale: 1.1, borderColor: 'rgba(234, 179, 8, 0.4)' }}
                  >
                    <motion.div
                      className={`w-3 h-3 rounded-full ${
                        tier === 'Bronze' ? 'bg-orange-600' :
                        tier === 'Silver' ? 'bg-gray-400' :
                        'bg-yellow-400'
                      }`}
                      animate={{
                        boxShadow: [
                          '0 0 5px rgba(234, 179, 8, 0.3)',
                          '0 0 15px rgba(234, 179, 8, 0.6)',
                          '0 0 5px rgba(234, 179, 8, 0.3)',
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
                    />
                    <span className="text-white text-sm font-medium">{tier}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TOURNAMENTS - Real Action */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/40 px-3 py-1.5 rounded-full mb-4">
              <Trophy className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 text-sm font-semibold">WATCH & COMPETE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Discover Tournaments <span className="text-purple-400">For Every Level</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Whether you're a senior player, junior champion, recreational enthusiast, or competitive athlete, find and watch live pickleball tournaments from PPA, MLP, and more.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden border border-purple-500/20 shadow-2xl shadow-purple-500/10"
          >
            <Image
              src="https://images.unsplash.com/photo-1761644658016-324918bc373c?w=1200&q=80"
              alt="Pickleball tournament competition action"
              width={1200}
              height={500}
              className="w-full h-[400px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">Tournaments for All Ages & Skill Levels</h3>
              <p className="text-gray-300 mb-6 max-w-2xl">
                Explore tournaments across all categories, from seniors and juniors to recreational and competitive leagues. Watch live streams, learn from the pros, and find events near you.
              </p>
              <div className="flex flex-wrap gap-3">
                {['Seniors 50+', 'Juniors U18', 'Recreational', 'Competitive 3.5-5.0', 'Pro Leagues', 'Local Events'].map((cat, idx) => (
                  <motion.span 
                    key={idx} 
                    className="bg-purple-500/20 border border-purple-500/40 px-4 py-2 rounded-full text-purple-300 text-sm font-medium hover:bg-purple-500/30 hover:scale-105 transition-all cursor-pointer"
                    whileHover={{ y: -2 }}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + idx * 0.05 }}
                  >
                    {cat}
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* BEFORE/AFTER TRANSFORMATION */}
      <section className="py-20 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500/20 to-emerald-500/20 border border-white/20 px-4 py-2 rounded-full mb-4">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-white text-sm font-semibold">VISIBLE IMPROVEMENT</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              See the <span className="bg-gradient-to-r from-red-400 via-yellow-400 to-emerald-400 bg-clip-text text-transparent">Transformation</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Our AI analysis identifies technique issues and guides you to proper form. Watch how players improve their stance, grip, and overall performance.
            </p>
          </motion.div>

          {/* Before/After Comparison */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Before */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="relative bg-slate-800/90 border border-red-500/30 rounded-2xl overflow-hidden">
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                    BEFORE
                  </span>
                </div>
                <div className="relative aspect-[4/3]">
                  <Image
                    src="https://cdn.abacus.ai/images/2852a913-6784-41b2-9abf-85a2d94c8d18.png"
                    alt="Player demonstrating common technique mistakes - poor posture and incorrect paddle position"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent">
                  <h3 className="text-red-400 font-bold mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    Common Issues Detected
                  </h3>
                  <ul className="text-gray-400 text-sm space-y-1">
                    <li>• Poor posture and bent back</li>
                    <li>• Incorrect paddle grip angle</li>
                    <li>• Unbalanced stance</li>
                    <li>• Tension in shoulders</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* After */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative group"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="relative bg-slate-800/90 border border-emerald-500/30 rounded-2xl overflow-hidden">
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-emerald-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                    AFTER
                  </span>
                </div>
                <div className="relative aspect-[4/3]">
                  <Image
                    src="https://cdn.abacus.ai/images/567b4691-30cb-4ef6-94b9-3af2089849cf.png"
                    alt="Player demonstrating excellent technique - proper athletic stance and correct paddle position"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4 bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent">
                  <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Technique Corrected
                  </h3>
                  <ul className="text-gray-400 text-sm space-y-1">
                    <li>✓ Athletic stance with proper balance</li>
                    <li>✓ Correct continental paddle grip</li>
                    <li>✓ Weight on balls of feet</li>
                    <li>✓ Relaxed, ready position</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-10"
          >
            <Link href="/auth/signup">
              <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 transition-all">
                Start Your Transformation
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
              Loved by <span className="text-cyan-400">Players</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { quote: "Coach Kai is like having a pro in my pocket. My game has improved more in 2 months than 2 years of playing.", name: "Mike R.", rating: "4.0 → 4.5" },
              { quote: "The training programs are incredibly well-structured. I finally feel like I'm making real progress.", name: "Sarah T.", rating: "Beginner → 3.5" },
              { quote: "Found my first tournament through the app and won a medal! The journey features kept me motivated.", name: "James K.", rating: "Senior 55+" },
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">"{testimonial.quote}"</p>
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold">{testimonial.name}</span>
                  <span className="text-cyan-400 text-sm font-medium">{testimonial.rating}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=1920&q=80"
            alt="Celebration"
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
              Ready to Play <span className="text-cyan-400">Smarter</span>?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of players who are transforming their game with AI-powered coaching and structured training.
            </p>

            <Link href="/auth/signup">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white px-12 py-7 text-xl font-bold rounded-xl shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transition-all">
                Get Started Free
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
            </Link>

            <div className="flex flex-wrap justify-center gap-8 mt-8 text-gray-400">
              <span className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-500" /> 7-day free trial
              </span>
              <span className="flex items-center gap-2">
                <Target className="w-5 h-5 text-cyan-500" /> No credit card required
              </span>
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-500" /> Cancel anytime
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-lg flex items-center justify-center">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold">Mindful Champion</span>
            </div>
            <p className="text-gray-500 text-sm">© 2025 Mindful Champion. All rights reserved.</p>
            <Link href="/auth/signin">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-cyan-400">
                Become a Sponsor
              </Button>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
