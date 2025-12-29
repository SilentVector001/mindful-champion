'use client'

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Trophy, 
  ArrowLeft,
  Award,
  Star,
  Target,
  TrendingUp,
  Zap,
  Medal,
  Crown,
  Gem,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock
} from "lucide-react"
import MainNavigation from "@/components/navigation/main-navigation"
import Link from "next/link"
import { motion } from "framer-motion"

export default function AchievementsPage() {
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

  const achievementTiers = [
    {
      tier: "Bronze",
      icon: Award,
      color: "from-amber-600 to-orange-700",
      bgColor: "from-amber-50 to-orange-50",
      textColor: "text-amber-700",
      borderColor: "border-amber-300",
      points: "100",
      description: "Foundation achievements for getting started",
      examples: [
        { name: "First Steps", desc: "Complete your profile" },
        { name: "Getting Started", desc: "Watch your first training video" },
        { name: "Practice Makes Perfect", desc: "Complete 5 practice drills" },
        { name: "Social Butterfly", desc: "Find your first practice partner" },
        { name: "Match Day", desc: "Log your first match result" }
      ],
      totalBadges: 25
    },
    {
      tier: "Silver",
      icon: Medal,
      color: "from-slate-400 to-gray-500",
      bgColor: "from-slate-50 to-gray-50",
      textColor: "text-slate-700",
      borderColor: "border-slate-300",
      points: "250",
      description: "Intermediate achievements for consistent training",
      examples: [
        { name: "Weekly Warrior", desc: "Complete 7-day training streak" },
        { name: "Video Analyst", desc: "Upload and analyze 3 videos" },
        { name: "Program Graduate", desc: "Complete your first training program" },
        { name: "Community Helper", desc: "Provide 10 helpful tips to others" },
        { name: "Tournament Ready", desc: "Join your first tournament" }
      ],
      totalBadges: 20
    },
    {
      tier: "Gold",
      icon: Star,
      color: "from-yellow-400 to-amber-500",
      bgColor: "from-yellow-50 to-amber-50",
      textColor: "text-yellow-700",
      borderColor: "border-yellow-300",
      points: "500",
      description: "Advanced achievements for dedicated players",
      examples: [
        { name: "Elite Trainer", desc: "Complete 5 training programs" },
        { name: "Video Pro", desc: "Analyze 25 videos" },
        { name: "30-Day Champion", desc: "Maintain 30-day training streak" },
        { name: "Tournament Victor", desc: "Win a local tournament" },
        { name: "Community Leader", desc: "Earn 50 helpful votes" }
      ],
      totalBadges: 15
    },
    {
      tier: "Platinum",
      icon: Crown,
      color: "from-indigo-500 to-purple-600",
      bgColor: "from-indigo-50 to-purple-50",
      textColor: "text-indigo-700",
      borderColor: "border-indigo-300",
      points: "1000",
      description: "Elite achievements for top performers",
      examples: [
        { name: "Master Coach", desc: "Complete all training programs" },
        { name: "Video Legend", desc: "Analyze 100 videos" },
        { name: "Unbreakable", desc: "Maintain 90-day training streak" },
        { name: "Regional Champion", desc: "Win a regional tournament" },
        { name: "Mindful Master", desc: "Reach Level 10 in all categories" }
      ],
      totalBadges: 10
    }
  ]

  const categories = [
    { icon: Target, name: "Training", count: 18 },
    { icon: Trophy, name: "Competition", count: 12 },
    { icon: Zap, name: "Progress", count: 15 },
    { icon: Sparkles, name: "Community", count: 14 },
    { icon: Gem, name: "Special", count: 11 }
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
          className="mb-16 text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full blur-lg opacity-20" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <Trophy className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-light text-gray-900 mb-4">
            Achievement <span className="font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">System</span>
          </h1>
          <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
            Unlock badges, earn points, and track your progress across Bronze, Silver, Gold, and Platinum achievement tiers
          </p>
        </motion.div>

        {/* Achievement Overview */}
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
                  <div className="text-4xl font-bold text-teal-700 mb-2">70</div>
                  <div className="text-gray-600">Total Achievements</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-cyan-700 mb-2">4</div>
                  <div className="text-gray-600">Achievement Tiers</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-teal-700 mb-2">5</div>
                  <div className="text-gray-600">Categories</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Achievement Tiers */}
        <div className="space-y-12 mb-16">
          {achievementTiers.map((tier, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
            >
              <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/80 overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tier.color}`} />
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-br ${tier.color} rounded-xl blur-sm opacity-30`} />
                        <div className={`relative bg-gradient-to-br ${tier.color} p-3 rounded-xl shadow-lg`}>
                          <tier.icon className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <div>
                        <CardTitle className="text-3xl font-light flex items-center gap-3">
                          {tier.tier}
                          <Badge className={`${tier.textColor} bg-gradient-to-r ${tier.bgColor} border ${tier.borderColor}`}>
                            {tier.totalBadges} Badges
                          </Badge>
                        </CardTitle>
                        <p className="text-gray-600 mt-1">{tier.description}</p>
                      </div>
                    </div>
                    <Badge className={`text-xl px-4 py-2 bg-gradient-to-r ${tier.color} text-white border-0`}>
                      +{tier.points} pts
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold text-gray-900 mb-4">Example Achievements:</h4>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tier.examples.map((example, eIdx) => (
                      <div key={eIdx} className={`p-4 rounded-lg border-2 ${tier.borderColor} bg-gradient-to-br ${tier.bgColor} hover:shadow-lg transition-shadow`}>
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className={`w-5 h-5 ${tier.textColor} mt-1`} />
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-1">{example.name}</h5>
                            <p className="text-sm text-gray-600">{example.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Achievement Categories */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-light text-gray-900 mb-8 text-center">
            Achievement <span className="font-semibold">Categories</span>
          </h2>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((category, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * idx }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="border-0 shadow-xl backdrop-blur-sm bg-gradient-to-br from-purple-50 to-indigo-50 text-center">
                  <CardContent className="pt-6">
                    <div className="relative inline-block mb-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl blur-sm opacity-20" />
                      <div className="relative bg-gradient-to-br from-purple-500 to-indigo-500 p-3 rounded-xl shadow-lg">
                        <category.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                      {category.count} badges
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Progress Tracking */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/80">
            <CardHeader>
              <CardTitle className="text-3xl font-light text-center">
                How to Track Your <span className="font-semibold">Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">View Your Achievements Dashboard</h4>
                    <p className="text-gray-600 mb-3">Navigate to Progress → Achievements to see all available badges, your unlocked achievements, and progress toward locked achievements.</p>
                    <Link href="/progress/achievements">
                      <Button size="sm" className="bg-gradient-to-r from-teal-600 to-emerald-600">
                        <Trophy className="mr-2 h-4 w-4" />
                        View My Achievements
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Monitor Real-Time Progress</h4>
                    <p className="text-gray-600">Progress bars show how close you are to unlocking each achievement. Some achievements have multiple milestones (e.g., Level 1, 2, 3...).</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Earn Points Automatically</h4>
                    <p className="text-gray-600">When you unlock an achievement, points are automatically credited to your rewards balance. You'll receive an instant notification.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-2">Share Your Success</h4>
                    <p className="text-gray-600">Share unlocked achievements to social media and earn bonus points for spreading the word about your progress.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="border-0 shadow-2xl backdrop-blur-sm bg-gradient-to-br from-purple-50/80 to-indigo-50/80">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500" />
            <CardContent className="pt-10">
              <div className="text-center">
                <Crown className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">Start Unlocking Achievements</h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Begin your journey toward becoming a Mindful Champion with 70 achievements waiting to be unlocked
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/progress/achievements">
                    <Button size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                      <Trophy className="mr-2 h-5 w-5" />
                      View All Achievements
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/help/rewards/earning-points">
                    <Button size="lg" variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                      <Star className="mr-2 h-5 w-5" />
                      How to Earn Points
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
