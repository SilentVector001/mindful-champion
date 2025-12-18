'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Mic, Video, Trophy, TrendingUp, Target, Zap, Play, Sparkles, ChevronDown, Star, Users, BarChart3, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const heroWords = ['Analyzed', 'Perfected', 'Elevated', 'Mastered'];

export default function SimpleLandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

      {/* HERO - Compact, High Impact */}
      <section className="relative pt-24 pb-8 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/30 via-slate-950 to-slate-950" />
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-64 h-64 bg-teal-500/15 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 text-sm font-medium">AI-Powered Pickleball Training</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4 leading-[1.1]"
            >
              Transform Your Game
              <br />
              <span className="relative">
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

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-gray-300 mb-6 max-w-2xl mx-auto"
            >
              Any skill level. Any age. AI coaching that adapts to <span className="text-cyan-400 font-semibold">you</span>.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <Link href="/auth/signup">
                <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white px-8 py-6 text-lg font-bold rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transition-all">
                  <Play className="w-5 h-5 mr-2 fill-current" />
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <p className="text-sm text-gray-500 mt-3">No credit card required • 7-day free • Cancel anytime</p>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center gap-6 sm:gap-10"
            >
              {[
                { value: '10K+', label: 'Active Players' },
                { value: '95%', label: 'Improvement Rate' },
                { value: '4.9★', label: 'User Rating' },
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-2xl sm:text-3xl font-black text-cyan-400">{stat.value}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES - Compact 2x2 Grid */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
              Everything You Need to <span className="text-cyan-400">Dominate</span>
            </h2>
            <p className="text-gray-400 text-lg">Powerful tools designed to accelerate your improvement</p>
          </motion.div>

          {/* 2x2 Feature Grid */}
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {[
              {
                icon: Mic,
                title: 'Coach Kai',
                subtitle: 'AI Voice Coach',
                description: 'Talk to your personal AI coach. Get real-time advice, strategy tips, and technique feedback through natural conversation.',
                color: 'from-blue-500 to-cyan-500',
                bg: 'from-blue-500/10 to-cyan-500/10',
                border: 'border-blue-500/30 hover:border-blue-500/60',
              },
              {
                icon: Video,
                title: 'Video Analysis',
                subtitle: 'AI Shot Detection',
                description: 'Upload your match footage. AI detects every shot, scores your technique, and shows exactly where to improve.',
                color: 'from-purple-500 to-pink-500',
                bg: 'from-purple-500/10 to-pink-500/10',
                border: 'border-purple-500/30 hover:border-purple-500/60',
              },
              {
                icon: Calendar,
                title: 'Tournament Hub',
                subtitle: 'Find & Compete',
                description: 'Discover tournaments for all ages and skill levels. Watch live streams, find local events, and track your competition.',
                color: 'from-emerald-500 to-teal-500',
                bg: 'from-emerald-500/10 to-teal-500/10',
                border: 'border-emerald-500/30 hover:border-emerald-500/60',
              },
              {
                icon: TrendingUp,
                title: 'Progress Tracking',
                subtitle: 'Data-Driven Growth',
                description: 'Set goals, track stats, earn achievements. Watch your skills improve with detailed analytics and visual charts.',
                color: 'from-orange-500 to-red-500',
                bg: 'from-orange-500/10 to-red-500/10',
                border: 'border-orange-500/30 hover:border-orange-500/60',
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`group relative bg-gradient-to-br ${feature.bg} backdrop-blur-sm border ${feature.border} rounded-2xl p-6 transition-all hover:scale-[1.02]`}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                  <span className={`text-xs font-medium bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>{feature.subtitle}</span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF - Testimonials */}
      <section className="py-12 sm:py-16 bg-slate-900">
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

          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                quote: "Coach Kai is like having a pro in my pocket. My game has improved more in 2 months than 2 years of playing.",
                name: "Mike R.",
                rating: "4.0 → 4.5",
              },
              {
                quote: "The video analysis blew my mind. I never knew my serve had those issues. Fixed them in a week!",
                name: "Sarah T.",
                rating: "3.5 Player",
              },
              {
                quote: "Finally found tournaments perfect for my skill level. Won my first medal last month!",
                name: "James K.",
                rating: "Senior 55+",
              },
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5"
              >
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm mb-4 italic">"{testimonial.quote}"</p>
                <div className="flex items-center justify-between">
                  <span className="text-white font-semibold text-sm">{testimonial.name}</span>
                  <span className="text-cyan-400 text-xs font-medium">{testimonial.rating}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
              Ready to Play <span className="text-cyan-400">Smarter</span>?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of players who are transforming their game with AI-powered coaching.
            </p>

            <Link href="/auth/signup">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white px-10 py-6 text-lg font-bold rounded-xl shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transition-all">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>

            <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-cyan-500" /> 7-day free trial
              </span>
              <span className="flex items-center gap-1">
                <Target className="w-4 h-4 text-cyan-500" /> No credit card required
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4 text-cyan-500" /> Cancel anytime
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SPONSOR CTA - Compact */}
      <section className="py-12 bg-slate-950 border-t border-cyan-500/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-gray-400 mb-4">Interested in partnering with us?</p>
          <Link href="/auth/signin">
            <Button variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/50">
              Become a Sponsor
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-gray-600 text-sm">© 2025 Mindful Champion. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
