
"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  Handshake, 
  TrendingUp, 
  Users, 
  Mail,
  ArrowRight,
  Target,
  Award,
  Sparkles
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const benefits = [
  {
    icon: Users,
    title: "Reach 50K+ Active Players",
    description: "Connect with passionate pickleball enthusiasts actively training and improving their game every single day"
  },
  {
    icon: Target,
    title: "Targeted Brand Exposure",
    description: "Your products featured as achievement rewards, creating meaningful connections at the perfect moment"
  },
  {
    icon: TrendingUp,
    title: "Measurable Growth",
    description: "Track real-time engagement, impressions, and conversions with comprehensive analytics dashboards"
  },
  {
    icon: Award,
    title: "Community Authority",
    description: "Position your brand as a trusted partner in the fastest-growing pickleball community"
  }
]

export default function PartnerBenefitsSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-white/5"></div>
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-teal-500/10 to-transparent"></div>
      <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-emerald-500/10 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 rounded-full px-6 py-2 mb-6">
            <Handshake className="w-5 h-5 text-teal-400" />
            <span className="text-teal-400 font-semibold">Partnership Opportunities</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Grow Your Brand with{" "}
            <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              Mindful Champion
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Partner with the #1 AI-powered pickleball platform and connect your brand with thousands of 
            dedicated athletes eager to discover quality products and services
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-slate-800/50 border-slate-700 hover:border-teal-500/50 transition-all h-full backdrop-blur-sm">
                  <div className="p-6 space-y-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      {benefit.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Featured Partnership Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/30 rounded-2xl p-8 md:p-12"
        >
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-teal-400" />
                <h3 className="text-3xl font-bold text-white">
                  Become a Featured Sponsor
                </h3>
              </div>
              <p className="text-lg text-slate-300 leading-relaxed">
                Join our exclusive partnership program and unlock unprecedented access to engaged pickleball players. 
                Your products become achievement rewards, creating authentic connections that drive real results.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-slate-300">
                  <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                  <span>Logo placement on homepage and rewards marketplace</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                  <span>Dedicated account manager and analytics dashboard</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                  <span>Custom integration and co-branded content opportunities</span>
                </li>
              </ul>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/partners/become-sponsor">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white px-8 py-6 text-lg w-full sm:w-auto"
                  >
                    <Handshake className="w-5 h-5 mr-2" />
                    Partner with Us
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <a href="mailto:partnerships@mindfulchampion.com">
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-2 border-slate-600 text-white hover:bg-slate-800 px-8 py-6 text-lg w-full sm:w-auto"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Contact Us
                  </Button>
                </a>
              </div>
            </div>

            <div className="relative aspect-square md:aspect-auto md:h-[400px] rounded-xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2940"
                alt="Partnership opportunities"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-teal-400">50K+</div>
                    <div className="text-sm text-slate-300 mt-1">Active Users</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-emerald-400">500K+</div>
                    <div className="text-sm text-slate-300 mt-1">Monthly Visits</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-teal-400">95%</div>
                    <div className="text-sm text-slate-300 mt-1">Engagement</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-slate-400">
            Questions about partnership opportunities?{" "}
            <a 
              href="mailto:partnerships@mindfulchampion.com" 
              className="text-teal-400 hover:text-teal-300 underline font-semibold"
            >
              Get in touch with our partnerships team
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
