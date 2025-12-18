'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Mic, Video, Trophy, TrendingUp, Target, Zap, Play, Sparkles, Star, Users, BarChart3, Calendar, CheckCircle2, Award, BookOpen, Dumbbell } from 'lucide-react';
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
            src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1920&q=80"
            alt="Pickleball action"
            fill
            className="object-cover opacity-40"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
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
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl w-full sm:w-auto">
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
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-1.5 rounded-full text-white text-sm font-bold shadow-lg">
                  Coach Kai Ready
                </div>
                <Image
                  src="https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&q=80"
                  alt="Training dashboard preview"
                  width={500}
                  height={350}
                  className="rounded-xl w-full"
                />
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
                  src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=700&q=80"
                  alt="Professional pickleball training"
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
              { name: 'Serve', image: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=300&q=80', count: '25+' },
              { name: 'Dink', image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=300&q=80', count: '30+' },
              { name: 'Volley', image: 'https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?w=300&q=80', count: '20+' },
              { name: 'Footwork', image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=300&q=80', count: '15+' },
              { name: 'Strategy', image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=300&q=80', count: '20+' },
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

      {/* COACH KAI - AI Coach Visual */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/40 px-3 py-1.5 rounded-full mb-4">
                <Mic className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 text-sm font-semibold">AI VOICE COACH</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                Meet Coach Kai
                <br />
                <span className="text-blue-400">Your Personal AI Coach</span>
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
                  <li key={idx} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold">
                  <Mic className="w-5 h-5 mr-2" />
                  Talk to Coach Kai
                </Button>
              </Link>
            </motion.div>

            {/* Right: Coach Kai Interface Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-blue-500/30 p-6 shadow-2xl shadow-blue-500/10">
                <div className="absolute -top-3 left-6 bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-1.5 rounded-full text-white text-sm font-bold">
                  🎙️ Coach Kai
                </div>
                <div className="space-y-4 pt-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">K</div>
                    <div className="flex-1 bg-blue-500/10 border border-blue-500/20 rounded-2xl rounded-tl-none p-4">
                      <p className="text-gray-200">Hey! I'm Coach Kai. What would you like to work on today? I can help with technique, strategy, or recommend drills!</p>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <div className="bg-slate-700/50 rounded-2xl rounded-tr-none p-4 max-w-[80%]">
                      <p className="text-gray-300">How do I improve my third shot drop?</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">K</div>
                    <div className="flex-1 bg-blue-500/10 border border-blue-500/20 rounded-2xl rounded-tl-none p-4">
                      <p className="text-gray-200">Great question! The third shot drop is crucial for transitioning to the kitchen. Focus on a soft, open paddle face and follow through toward your target...</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-3 bg-slate-700/50 rounded-xl p-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center animate-pulse">
                    <Mic className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-gray-400">Press to talk...</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* PROGRESS TRACKING - Dashboard Visual */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative order-2 lg:order-1"
            >
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-500/20 p-4 shadow-2xl">
                <div className="absolute -top-3 left-6 bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-1.5 rounded-full text-white text-sm font-bold">
                  Track Everything
                </div>
                <Image
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80"
                  alt="Progress dashboard"
                  width={550}
                  height={350}
                  className="rounded-xl w-full"
                />
              </div>
            </motion.div>

            {/* Right: Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div className="inline-flex items-center gap-2 bg-cyan-500/20 border border-cyan-500/40 px-3 py-1.5 rounded-full mb-4">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span className="text-cyan-400 text-sm font-semibold">PROGRESS TRACKING</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                See Your Progress
                <br />
                <span className="text-cyan-400">In Real-Time</span>
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                Set personalized goals and track your journey with detailed analytics. Watch your skills improve through data-driven insights and visual progress charts.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Customizable skill improvement goals',
                  'Detailed performance analytics & charts',
                  'Achievement system with rewards',
                  'Historical data comparison',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-semibold">
                  Track Your Progress
                  <TrendingUp className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* GAMIFICATION - Badges Visual */}
      <section className="py-20 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-500/40 px-3 py-1.5 rounded-full mb-4">
                <Award className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 text-sm font-semibold">GAMIFICATION</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                Earn Rewards &
                <br />
                <span className="text-yellow-400">Celebrate Wins</span>
              </h2>
              <p className="text-gray-300 text-lg mb-6">
                Stay motivated with our comprehensive reward system. Unlock achievements, earn badges, and celebrate every milestone on your journey to becoming a champion.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Achievement badges for skill milestones',
                  'Tiered reward system (Bronze, Silver, Gold)',
                  'Streak tracking and bonus rewards',
                  'Leaderboards and community recognition',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-300">
                    <CheckCircle2 className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl font-semibold">
                  Start Earning Rewards
                  <Award className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>

            {/* Right: Badges Display */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -top-3 right-6 bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-1.5 rounded-full text-white text-sm font-bold z-10">
                100+ Badges
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { emoji: '🏆', name: 'Champion', color: 'from-yellow-500/20 to-orange-500/20' },
                  { emoji: '🎯', name: 'Sharpshooter', color: 'from-red-500/20 to-pink-500/20' },
                  { emoji: '⚡', name: 'Speed Demon', color: 'from-blue-500/20 to-cyan-500/20' },
                  { emoji: '🔥', name: 'On Fire', color: 'from-orange-500/20 to-red-500/20' },
                  { emoji: '💪', name: 'Consistent', color: 'from-green-500/20 to-emerald-500/20' },
                  { emoji: '🌟', name: 'Rising Star', color: 'from-purple-500/20 to-pink-500/20' },
                ].map((badge, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className={`bg-gradient-to-br ${badge.color} border border-yellow-500/20 rounded-xl p-4 text-center hover:scale-105 transition-transform`}
                  >
                    <div className="text-4xl mb-2">{badge.emoji}</div>
                    <div className="text-white text-sm font-medium">{badge.name}</div>
                  </motion.div>
                ))}
              </div>
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
            className="relative rounded-2xl overflow-hidden border border-purple-500/20"
          >
            <Image
              src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200&q=80"
              alt="Tournament action"
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
                  <span key={idx} className="bg-purple-500/20 border border-purple-500/40 px-4 py-2 rounded-full text-purple-300 text-sm font-medium">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
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
