
"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Sparkles, Zap } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "Basic AI Coach access",
      "5 drills per month",
      "Performance tracking",
      "Community access",
      "Limited video content"
    ],
    cta: "Start Free",
    href: "/auth/signup",
    popular: false,
    gradient: "from-slate-500 to-slate-600"
  },
  {
    name: "Premium",
    price: "$19",
    period: "/month",
    description: "For serious players",
    badge: "Most Popular",
    features: [
      "Unlimited AI Coach",
      "Unlimited drills library",
      "Full video analysis",
      "Advanced analytics",
      "Full video library",
      "Priority support"
    ],
    cta: "Start 7-Day Trial",
    href: "/auth/signup",
    popular: true,
    gradient: "from-teal-500 to-emerald-500"
  },
  {
    name: "Pro",
    price: "$39",
    period: "/month",
    description: "Maximum performance",
    badge: "Pro",
    features: [
      "Everything in Premium",
      "Pro Avatar Companion",
      "Unlimited video analysis",
      "1-on-1 coach consultations",
      "Custom training plans",
      "Early feature access"
    ],
    cta: "Start 7-Day Trial",
    href: "/auth/signup",
    popular: false,
    gradient: "from-purple-500 to-pink-500"
  }
]

export default function PricingCTASection() {
  return (
    <section className="py-24 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Choose your{" "}
            <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              championship path
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Start with a 7-day free trial. No credit card required. Cancel anytime.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative overflow-hidden h-full ${
                plan.popular 
                  ? "bg-slate-800 border-teal-500 border-2" 
                  : "bg-slate-800/50 border-slate-700"
              }`}>
                {plan.badge && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                    {plan.badge}
                  </div>
                )}

                <div className="p-8 space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-slate-400">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-bold text-white">{plan.price}</span>
                    <span className="text-slate-400">{plan.period}</span>
                  </div>

                  <Link href={plan.href}>
                    <Button
                      size="lg"
                      className={`w-full ${
                        plan.popular
                          ? "bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white"
                          : "bg-slate-700 hover:bg-slate-600 text-white"
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>

                  <ul className="space-y-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-r ${plan.gradient}`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12 text-slate-400"
        >
          <p>
            All plans include a 7-day free trial. Need more? {" "}
            <Link href="/pricing" className="text-teal-400 hover:text-teal-300">
              Compare plans in detail
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
