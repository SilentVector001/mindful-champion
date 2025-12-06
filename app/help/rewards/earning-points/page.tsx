'use client'

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Star, 
  ArrowLeft,
  Trophy,
  Video,
  Dumbbell,
  Users,
  MessageCircle,
  Share2,
  Calendar,
  CheckCircle2,
  Target,
  Zap,
  Gift,
  TrendingUp,
  Award,
  Sparkles,
  ArrowRight
} from "lucide-react"
import MainNavigation from "@/components/navigation/main-navigation"
import Link from "next/link"
import { motion } from "framer-motion"

export default function EarningPointsPage() {
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

  const earningMethods = [
    {
      category: "Training & Development",
      icon: Dumbbell,
      color: "from-orange-500 to-red-500",
      activities: [
        { name: "Complete Training Program Day", points: 50, frequency: "Daily" },
        { name: "Finish Full Training Program", points: 500, frequency: "Per Program" },
        { name: "Upload & Analyze Video", points: 100, frequency: "Per Video" },
        { name: "Complete Practice Drill", points: 25, frequency: "Per Drill" },
        { name: "7-Day Training Streak", points: 200, frequency: "Weekly Bonus" }
      ]
    },
    {
      category: "Achievements & Milestones",
      icon: Trophy,
      color: "from-amber-500 to-yellow-500",
      activities: [
        { name: "Bronze Achievement Unlock", points: 100, frequency: "Per Achievement" },
        { name: "Silver Achievement Unlock", points: 250, frequency: "Per Achievement" },
        { name: "Gold Achievement Unlock", points: 500, frequency: "Per Achievement" },
        { name: "Platinum Achievement Unlock", points: 1000, frequency: "Per Achievement" },
        { name: "Complete Achievement Tier", points: 300, frequency: "Per Tier" }
      ]
    },
    {
      category: "Community Engagement",
      icon: Users,
      color: "from-emerald-500 to-teal-500",
      activities: [
        { name: "Find Practice Partner", points: 30, frequency: "Per Match" },
        { name: "Join Tournament", points: 150, frequency: "Per Event" },
        { name: "Community Post Engagement", points: 10, frequency: "Per Action" },
        { name: "Helpful Comment/Tip", points: 15, frequency: "Per Post" },
        { name: "Monthly Community Champion", points: 500, frequency: "Monthly" }
      ]
    },
    {
      category: "Sponsor Interactions",
      icon: Gift,
      color: "from-pink-500 to-rose-500",
      activities: [
        { name: "Watch Sponsored Content", points: 20, frequency: "Per View" },
        { name: "Complete Sponsor Survey", points: 50, frequency: "Per Survey" },
        { name: "Redeem Sponsor Offer", points: 75, frequency: "Per Offer" },
        { name: "Sponsor Product Review", points: 100, frequency: "Per Review" },
        { name: "Featured Sponsor Campaign", points: 200, frequency: "Special Events" }
      ]
    },
    {
      category: "Profile & Progress",
      icon: Target,
      color: "from-blue-500 to-indigo-500",
      activities: [
        { name: "Complete Profile (100%)", points: 100, frequency: "One-time" },
        { name: "Update Weekly Goals", points: 25, frequency: "Weekly" },
        { name: "Log Match Result", points: 15, frequency: "Per Match" },
        { name: "Monthly Progress Review", points: 50, frequency: "Monthly" },
        { name: "Track 30-Day Streak", points: 300, frequency: "Milestone" }
      ]
    },
    {
      category: "Referrals & Social",
      icon: Share2,
      color: "from-purple-500 to-violet-500",
      activities: [
        { name: "Refer New User (Signup)", points: 200, frequency: "Per Referral" },
        { name: "Referral Upgrades to Pro", points: 500, frequency: "Bonus" },
        { name: "Share Achievement to Social", points: 20, frequency: "Per Share" },
        { name: "Tag @MindfulChampion", points: 30, frequency: "Per Post" },
        { name: "Monthly Social Ambassador", points: 1000, frequency: "Monthly" }
      ]
    }
  ]

  const bonusOpportunities = [
    {
      icon: Zap,
      title: "Premium Multiplier",
      description: "Premium members earn 1.5x points on all activities",
      badge: "PRO"
    },
    {
      icon: Calendar,
      title: "Weekend Bonus",
      description: "2x points for training activities on Saturdays & Sundays",
      badge: "2X"
    },
    {
      icon: TrendingUp,
      title: "Seasonal Challenges",
      description: "Complete special challenges for bonus point rewards",
      badge: "EVENT"
    },
    {
      icon: Award,
      title: "First-Time Bonuses",
      description: "Extra points for trying new features and activities",
      badge: "NEW"
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
          <Link href="/help/rewards">
            <Button variant="outline" size="sm" className="hover:bg-gray-50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Rewards
            </Button>
          </Link>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full blur-lg opacity-20" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <Star className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-light text-gray-900 mb-4">
            How to <span className="font-semibold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">Earn Points</span>
          </h1>
          <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
            Discover all the ways to accumulate reward points through training, achievements, community engagement, and sponsor interactions
          </p>
        </motion.div>

        {/* Quick Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <Card className="border-0 shadow-2xl backdrop-blur-sm bg-gradient-to-br from-teal-50/80 to-cyan-50/80">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-500" />
            <CardContent className="pt-10">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-4xl font-bold text-teal-700 mb-2">25+</div>
                  <div className="text-gray-600">Ways to Earn</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-cyan-700 mb-2">10,000+</div>
                  <div className="text-gray-600">Points Possible Monthly</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-teal-700 mb-2">1.5x</div>
                  <div className="text-gray-600">Premium Multiplier</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Earning Methods */}
        <div className="space-y-12 mb-16">
          {earningMethods.map((method, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
            >
              <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/80">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${method.color}`} />
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${method.color} rounded-xl blur-sm opacity-30`} />
                      <div className={`relative bg-gradient-to-br ${method.color} p-3 rounded-xl shadow-lg`}>
                        <method.icon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-light">{method.category}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {method.activities.map((activity, aIdx) => (
                      <div key={aIdx} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-teal-600" />
                          <div>
                            <div className="font-medium text-gray-900">{activity.name}</div>
                            <div className="text-sm text-gray-600">{activity.frequency}</div>
                          </div>
                        </div>
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-lg px-4 py-1">
                          +{activity.points}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bonus Opportunities */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-light text-gray-900 mb-8 text-center">
            Bonus <span className="font-semibold">Opportunities</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bonusOpportunities.map((bonus, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * idx }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="border-0 shadow-xl backdrop-blur-sm bg-gradient-to-br from-purple-50 to-pink-50 h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                        <bonus.icon className="h-6 w-6 text-white" />
                      </div>
                      <Badge className="bg-purple-600 text-white">{bonus.badge}</Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{bonus.title}</h3>
                    <p className="text-sm text-gray-600">{bonus.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="border-0 shadow-2xl backdrop-blur-sm bg-gradient-to-br from-amber-50/80 to-orange-50/80">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
            <CardContent className="pt-10">
              <div className="text-center">
                <Sparkles className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">Start Earning Today</h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  View your current point balance and start completing activities to unlock rewards
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/progress/achievements">
                    <Button size="lg" className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                      <Trophy className="mr-2 h-5 w-5" />
                      View Achievements
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/marketplace">
                    <Button size="lg" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                      <Gift className="mr-2 h-5 w-5" />
                      Browse Rewards
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
