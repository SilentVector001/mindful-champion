
"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Play, Sparkles, TrendingUp } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HeroSection() {
  return (
    <section className="relative min-h-screen bg-slate-900 text-white overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="relative w-full h-full">
          <Image
            src="https://cdn.abacus.ai/images/a206b575-3f1d-4b8e-bddc-100104912481.png"
            alt="Professional Pickleball Courts"
            fill
            className="object-cover opacity-40"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/95 to-teal-900/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30 px-4 py-1.5">
              <Sparkles className="w-3 h-3 mr-1.5" />
              AI-Powered Performance Platform
            </Badge>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
              Understand your{" "}
              <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                pickleball game
              </span>{" "}
              from the inside out
            </h1>

            <p className="text-xl text-slate-300 leading-relaxed max-w-2xl">
              From technique and strategy to mental performance and AI-powered insights, 
              Mindful Champion brings it all together — helping you make smarter decisions 
              today that add more wins to your game.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/auth/signup" className="hidden sm:block">
                <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-6 text-lg rounded-full">
                  Start Your 7-Day Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href="#features" className="hidden sm:block">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 bg-white/5 backdrop-blur-sm px-8 py-6 text-lg rounded-full transition-all"
                >
                  <Play className="mr-2 w-5 h-5" />
                  Watch Demo
                </Button>
              </a>
              
              {/* Mobile-only CTA pointing to bottom bar */}
              <div className="sm:hidden bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-2xl p-6 text-center">
                <p className="text-white text-lg font-semibold mb-2">Ready to get started?</p>
                <p className="text-slate-300 text-sm mb-4">Use the buttons below to sign up or sign in</p>
                <div className="animate-bounce">
                  <ArrowRight className="w-6 h-6 text-teal-400 mx-auto rotate-90" />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-400 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                No Credit Card Required
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                Cancel Anytime
              </div>
            </div>
          </motion.div>

          {/* Right Column - Product Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-teal-500/20 to-slate-800/20 p-8 backdrop-blur-sm border border-slate-700">
              <Image
                src="https://fox5sandiego.com/wp-content/uploads/sites/15/2022/07/jay-devilliers-pat-smith__FullRes_02790-e1658526406988.jpg"
                alt="Professional Pickleball Action - Player in Mid-Game"
                fill
                className="object-cover rounded-2xl"
              />
              
              {/* Floating Stats Cards */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="absolute top-8 right-8 bg-slate-900/90 backdrop-blur-xl rounded-2xl p-4 border border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Win Rate</p>
                    <p className="text-2xl font-bold text-white">+23%</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="absolute bottom-8 left-8 bg-slate-900/90 backdrop-blur-xl rounded-2xl p-4 border border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">AI Insights</p>
                    <p className="text-2xl font-bold text-white">24/7</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="w-6 h-10 border-2 border-slate-600 rounded-full flex items-start justify-center p-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-teal-500 rounded-full"
          />
        </div>
      </motion.div>
    </section>
  )
}
