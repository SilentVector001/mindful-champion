
"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Video, 
  Brain, 
  TrendingUp, 
  Users, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Crown
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const features = [
  {
    id: "video-analysis",
    icon: Video,
    title: "AI Video Analysis",
    subtitle: "Dissect every shot, every move",
    description: "Upload your gameplay and get frame-by-frame AI analysis of technique, positioning, and strategy. Identify weaknesses and track improvement over time.",
    image: "https://cdn.abacus.ai/images/e682d18e-14a8-4301-b23d-e8c14764c952.png",
    badge: "Premium Feature",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    link: "/train/video"
  },
  {
    id: "ai-coach",
    icon: Sparkles,
    title: "Coach Kai",
    subtitle: "24/7 personalized guidance",
    description: "Chat with Coach Kai, your intelligent AI coach that knows your game inside-out. Get instant answers, drill recommendations, and strategic advice tailored to your skill level.",
    image: "https://cdn.abacus.ai/images/137ff25d-9756-4ce6-a97b-fc0d03553e8e.png",
    badge: "All Plans",
    badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    link: "/train/coach"
  },
  {
    id: "pro-avatar",
    icon: Crown,
    title: "Pro Avatar Companion",
    subtitle: "Your personal coaching partner",
    description: "Create a photo-realistic avatar that becomes your training companion. Communicate naturally, track progress together, and get real-time feedback during practice.",
    image: "https://cdn.abacus.ai/images/d46a7758-55bf-456a-9a65-6e7d0567ad2b.png",
    badge: "Pro Only",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    link: "/avatar-studio"
  },
  {
    id: "performance",
    icon: TrendingUp,
    title: "Performance Analytics",
    subtitle: "Data that drives results",
    description: "Track every metric that matters - win rate, shot selection, court coverage, and mental resilience. Beautiful visualizations show exactly where you're improving.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2940",
    badge: "All Plans",
    badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    link: "/progress"
  },
  {
    id: "mental-game",
    icon: Brain,
    title: "Mental Training",
    subtitle: "Master the mind game",
    description: "Develop unshakeable focus, manage match pressure, and build confidence with guided mindfulness sessions and mental performance tracking.",
    image: "https://cdn.abacus.ai/images/13ed1cb7-35e8-45b5-8479-6e32948a6bc1.png",
    badge: "Premium Feature",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    link: "/dashboard"
  },
  {
    id: "community",
    icon: Users,
    title: "Champion Community",
    subtitle: "Connect and compete",
    description: "Find playing partners, join challenges, enter tournaments, and share your journey with thousands of players improving their game.",
    image: "https://cdn.abacus.ai/images/b1fae521-555e-4098-8fdc-b469313ffd8b.png",
    badge: "All Plans",
    badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    link: "/connect"
  }
]

export default function FeaturesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth * 0.8
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      })
    }
  }

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-bold mb-4"
          >
            <span className="text-slate-900">Transform your game daily,{" "}</span>
            <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              improve faster
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-700 max-w-3xl mx-auto"
          >
            Daily Mindful Champion training is linked to 23% higher win rates, 
            40% faster skill progression, and consistently better shot selection
          </motion.p>
        </div>

        {/* Features Carousel */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -ml-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow border border-slate-200"
          >
            <ChevronLeft className="w-6 h-6 text-slate-900" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 -mr-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow border border-slate-200"
          >
            <ChevronRight className="w-6 h-6 text-slate-900" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex-shrink-0 w-[380px] snap-start"
                >
                  <Card className="overflow-hidden h-full hover:shadow-2xl transition-shadow group">
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      
                      {/* Badge */}
                      <div className="absolute top-4 left-4">
                        <Badge className={`${feature.badgeColor}`}>
                          {feature.badge}
                        </Badge>
                      </div>

                      {/* Icon */}
                      <div className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Icon className="w-6 h-6 text-teal-600" />
                      </div>
                    </div>

                    <div className="p-6 space-y-4 bg-white">
                      <div>
                        <h3 className="text-2xl font-bold mb-1 text-slate-900">
                          {feature.title}
                        </h3>
                        <p className="text-sm font-medium text-slate-600">
                          {feature.subtitle}
                        </p>
                      </div>

                      <p className="leading-relaxed text-slate-700">
                        {feature.description}
                      </p>

                      <Link href={feature.link}>
                        <Button variant="ghost" className="w-full hover:bg-teal-50 hover:text-teal-700 text-slate-900 font-medium">
                          Learn More
                          <ChevronRight className="ml-2 w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (scrollRef.current) {
                    const scrollAmount = scrollRef.current.offsetWidth * 0.8 * index
                    scrollRef.current.scrollTo({
                      left: scrollAmount,
                      behavior: "smooth"
                    })
                  }
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? "bg-teal-600 w-8" 
                    : "bg-slate-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Link href="/auth/signup">
            <Button size="lg" className="bg-slate-900 hover:bg-slate-800 text-white px-12 py-6 text-lg rounded-full">
              Start Your Free Trial
            </Button>
          </Link>
        </motion.div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  )
}
