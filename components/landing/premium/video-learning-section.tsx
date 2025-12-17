
"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Clock, TrendingUp, Target, Sparkles, Video, Cpu, Eye, Star, Award } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const analysisFeatures = [
  {
    title: "Shot Detection & Tracking",
    description: "Automatically identifies every serve, dink, volley, and drive with frame-perfect accuracy",
    icon: Target,
    color: "teal"
  },
  {
    title: "Biomechanical Analysis",
    description: "Deep insights into paddle angle, body positioning, footwork, and timing",
    icon: Eye,
    color: "emerald"
  },
  {
    title: "Personalized Recommendations",
    description: "AI-powered coaching tailored to your playing style and skill level",
    icon: Sparkles,
    color: "amber"
  }
]

export default function VideoLearningSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/4 w-1/2 h-full bg-gradient-to-br from-teal-500/10 to-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -left-1/4 w-1/2 h-full bg-gradient-to-tr from-teal-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-teal-500/20 text-teal-300 border-teal-500/30 px-4 py-1.5">
            <Star className="w-3 h-3 mr-1.5 fill-teal-300" />
            #1 AI-Powered Video Analysis
          </Badge>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
          >
            See What You{" "}
            <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent">
              Can't See
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl sm:text-2xl text-slate-300 leading-relaxed max-w-3xl mx-auto"
          >
            Industry-leading AI technology analyzes every shot, movement, and decision—revealing hidden flaws and unlocking your breakthrough performance.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left Column - Features */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {analysisFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-slate-800/50 border-slate-700/50 hover:border-teal-500/50 transition-all p-6 group hover:shadow-lg hover:shadow-teal-500/10">
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br from-${feature.color}-500/20 to-${feature.color}-500/5 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-white mb-2 group-hover:text-teal-400 transition-colors">
                        {feature.title}
                      </h4>
                      <p className="text-slate-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Right Column - Video Demo Visual */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 p-8 overflow-hidden">
              {/* Mock Video Analysis Interface */}
              <div className="aspect-video bg-slate-900/80 rounded-xl overflow-hidden border-2 border-slate-700/50 relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-emerald-500/10"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-teal-500/50 hover:scale-110 transition-transform cursor-pointer">
                    <Play className="w-10 h-10 text-white ml-1" />
                  </div>
                </div>
                
                {/* Analysis Overlays */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className="bg-teal-500/90 text-white border-0">
                    <Cpu className="w-3 h-3 mr-1" />
                    AI Analyzing...
                  </Badge>
                </div>
                
                <div className="absolute bottom-4 left-4 right-4 space-y-2">
                  <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-slate-200">Shot detected: Third shot drop</span>
                    <Badge className="ml-auto bg-emerald-500/20 text-emerald-300 border-0 text-xs">95% accuracy</Badge>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs">
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                    <span className="text-slate-200">Paddle angle: 42° (optimal)</span>
                    <Badge className="ml-auto bg-teal-500/20 text-teal-300 border-0 text-xs">Excellent</Badge>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                  <div className="text-2xl font-bold text-teal-400 mb-1">10K+</div>
                  <div className="text-xs text-slate-400">Videos Analyzed</div>
                </div>
                <div className="text-center p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                  <div className="text-2xl font-bold text-emerald-400 mb-1">98%</div>
                  <div className="text-xs text-slate-400">Accuracy Rate</div>
                </div>
                <div className="text-center p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                  <div className="text-2xl font-bold text-amber-400 mb-1">4.9★</div>
                  <div className="text-xs text-slate-400">User Rating</div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h3 className="text-2xl sm:text-3xl font-bold mb-8">How It Works</h3>
          <div className="grid sm:grid-cols-3 gap-8 mb-12">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-lg">1. Upload</h4>
              <p className="text-slate-400">
                Record with your phone—no special equipment needed
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <Cpu className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-lg">2. AI Analyzes</h4>
              <p className="text-slate-400">
                Advanced algorithms detect every shot and movement pattern
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h4 className="font-semibold text-lg">3. Improve</h4>
              <p className="text-slate-400">
                Get personalized insights and watch your game transform
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:opacity-90 text-white px-8 py-6 text-lg rounded-full shadow-xl shadow-teal-500/20">
                <Sparkles className="w-5 h-5 mr-2" />
                Try Video Analysis Free
              </Button>
            </Link>
            <Link href="/train/video">
              <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800 px-8 py-6 text-lg rounded-full">
                See How It Works
              </Button>
            </Link>
          </div>

          <p className="text-sm text-slate-500 mt-6">
            No credit card required • 7-day free trial • Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  )
}
