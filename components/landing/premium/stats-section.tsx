
"use client"

import { motion } from "framer-motion"
import { TrendingUp, Users, Award, Zap } from "lucide-react"

const stats = [
  {
    icon: TrendingUp,
    value: "23%",
    label: "Average Win Rate Increase",
    description: "Members see dramatic improvement in their first 30 days"
  },
  {
    icon: Users,
    value: "50K+",
    label: "Active Players",
    description: "Join a thriving community of dedicated athletes"
  },
  {
    icon: Award,
    value: "1M+",
    label: "Training Sessions",
    description: "Collective hours of AI-powered coaching delivered"
  },
  {
    icon: Zap,
    value: "40%",
    label: "Faster Skill Growth",
    description: "Compared to traditional training methods"
  }
]

export default function StatsSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Results that speak for{" "}
            <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              themselves
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Thousands of players are already transforming their game with Mindful Champion
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center space-y-4"
              >
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-4xl font-bold text-slate-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-lg font-semibold text-slate-900 mb-2">
                    {stat.label}
                  </div>
                  <div className="text-sm text-slate-600">
                    {stat.description}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
