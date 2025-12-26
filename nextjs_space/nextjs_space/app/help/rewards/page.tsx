'use client'

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Gift, 
  ArrowRight, 
  Trophy, 
  Star, 
  Target,
  Users,
  Award,
  Sparkles,
  ArrowLeft,
  TrendingUp,
  Zap,
  Heart,
  ShoppingBag,
  Check
} from "lucide-react"
import MainNavigation from "@/components/navigation/main-navigation"
import Link from "next/link"
import { motion } from "framer-motion"

export default function RewardsOverviewPage() {
  const { data: session, status } = useSession() || {}
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (status === 'loading' || !mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-white to-teal-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    )
  }
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  const userData = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    firstName: session.user.name?.split(' ')[0],
    subscriptionTier: 'PREMIUM',
    role: 'USER'
  }

  const features = [
    {
      icon: Star,
      title: "Earn Points",
      description: "Complete achievements, participate in tournaments, and engage with sponsors to accumulate reward points.",
      link: "/help/rewards/earning-points",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Trophy,
      title: "Achievement System",
      description: "Unlock badges across Bronze, Silver, Gold, and Platinum tiers for reaching training milestones.",
      link: "/help/rewards/achievements",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: ShoppingBag,
      title: "Redeem Rewards",
      description: "Use your points to get exclusive merchandise, tournament entries, training content, and sponsor offers.",
      link: "/help/rewards/redeeming",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: Users,
      title: "Sponsor Program",
      description: "Engage with partner sponsors to earn bonus points and access exclusive community benefits.",
      link: "/help/sponsors",
      color: "from-pink-500 to-rose-500"
    }
  ]

  const benefits = [
    {
      icon: Zap,
      title: "Instant Rewards",
      description: "Points are credited immediately when you complete qualifying activities"
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "View your points balance, transaction history, and redemption options in real-time"
    },
    {
      icon: Heart,
      title: "Exclusive Access",
      description: "Premium members get bonus point multipliers and early access to new rewards"
    },
    {
      icon: Award,
      title: "No Expiration",
      description: "Your points never expire as long as your account remains active"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-white to-teal-50/30">
      <MainNavigation user={userData} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link href="/help">
            <Button variant="outline" size="sm" className="hover:bg-gray-50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Help Center
            </Button>
          </Link>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full blur-lg opacity-20" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <Gift className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-light text-gray-900 mb-4">
            Points & <span className="font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Rewards System</span>
          </h1>
          <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto mb-8">
            Turn your training progress into tangible rewards. Earn points through achievements, community engagement, and sponsor interactions - then redeem them for exclusive benefits.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Badge className="bg-amber-50 text-amber-700 border-amber-200 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Active Rewards Program
            </Badge>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 px-4 py-2">
              <Check className="w-4 h-4 mr-2" />
              Instant Point Credits
            </Badge>
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 px-4 py-2">
              <Trophy className="w-4 h-4 mr-2" />
              No Expiration
            </Badge>
          </div>
        </motion.div>

        {/* Quick Action to View Rewards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <Card className="relative overflow-hidden border-0 shadow-2xl backdrop-blur-sm bg-gradient-to-br from-amber-50/80 to-orange-50/80">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
            <CardContent className="pt-10">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full blur opacity-30" />
                  <div className="relative bg-white p-3 rounded-full shadow-lg">
                    <Sparkles className="w-8 h-8 text-amber-600" />
                  </div>
                </div>
                <h3 className="font-semibold text-2xl text-amber-800 mb-2">Ready to Start Earning?</h3>
                <p className="text-gray-700 text-lg max-w-2xl mx-auto mb-6">
                  View your current points balance, recent transactions, and available redemption options
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/marketplace">
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg"
                    >
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      Browse Rewards Marketplace
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/progress/achievements">
                    <Button 
                      size="lg"
                      variant="outline"
                      className="border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      <Trophy className="mr-2 h-5 w-5" />
                      View Achievements
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-light text-gray-900 mb-8 text-center">How It Works</h2>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                whileHover={{ y: -5 }}
              >
                <Link href={feature.link} className="block group h-full">
                  <Card className="relative overflow-hidden border-0 shadow-xl backdrop-blur-sm bg-white/80 hover:shadow-2xl transition-all duration-300 h-full">
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.color}`} />
                    <CardContent className="pt-8">
                      <div className="relative inline-block mb-4">
                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl blur-sm opacity-20 group-hover:opacity-40 transition-opacity`} />
                        <div className={`relative bg-gradient-to-br ${feature.color} p-3 rounded-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                          <feature.icon className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <h3 className="font-semibold text-xl mb-2 text-gray-900 group-hover:text-amber-700 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                      <div className="flex items-center text-amber-600 font-medium">
                        <span>Learn More</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/80">
            <CardHeader>
              <CardTitle className="text-3xl font-light text-gray-900 text-center">
                Program <span className="font-semibold">Benefits</span>
              </CardTitle>
              <p className="text-gray-600 text-center max-w-2xl mx-auto">
                Built-in features that make earning and redeeming points effortless
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                {benefits.map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className="flex items-start gap-4"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl blur-sm opacity-20" />
                      <div className="relative bg-gradient-to-br from-teal-50 to-emerald-50 p-3 rounded-xl border border-teal-200">
                        <benefit.icon className="h-6 w-6 text-teal-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{benefit.title}</h4>
                      <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Resources */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-0 shadow-2xl backdrop-blur-sm bg-gradient-to-br from-indigo-50/80 to-purple-50/80">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
            <CardContent className="pt-10">
              <h3 className="font-semibold text-2xl text-center text-gray-900 mb-6">Additional Resources</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/help/rewards/faqs">
                  <Button 
                    variant="outline"
                    className="w-full justify-between border-purple-200 hover:bg-purple-50 text-left h-auto py-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-semibold">FAQs</div>
                        <div className="text-xs text-gray-600">Common questions answered</div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                
                <Link href="/help/rewards/terms">
                  <Button 
                    variant="outline"
                    className="w-full justify-between border-purple-200 hover:bg-purple-50 text-left h-auto py-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Target className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-semibold">Terms & Conditions</div>
                        <div className="text-xs text-gray-600">Program rules and policies</div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
