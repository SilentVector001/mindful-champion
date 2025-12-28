'use client'

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Gift, 
  ArrowLeft,
  ShoppingBag,
  Trophy,
  Video,
  Book,
  Ticket,
  Star,
  Package,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Award,
  Crown,
  Zap,
  Users
} from "lucide-react"
import MainNavigation from "@/components/navigation/main-navigation"
import Link from "next/link"
import { motion } from "framer-motion"

export default function RedeemingRewardsPage() {
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

  const rewardCategories = [
    {
      category: "Merchandise & Gear",
      icon: ShoppingBag,
      color: "from-blue-500 to-indigo-500",
      items: [
        { name: "Mindful Champion T-Shirt", points: 500, description: "Premium cotton with logo" },
        { name: "Performance Paddle", points: 2000, description: "Pro-grade carbon fiber paddle" },
        { name: "Training Ball Set (12)", points: 300, description: "Official tournament balls" },
        { name: "Water Bottle", points: 250, description: "Insulated stainless steel" },
        { name: "Gym Bag", points: 800, description: "Spacious with paddle compartment" }
      ]
    },
    {
      category: "Tournament Entries",
      icon: Trophy,
      color: "from-amber-500 to-orange-500",
      items: [
        { name: "Local Tournament Entry", points: 400, description: "Free entry to partner tournament" },
        { name: "Regional Championship", points: 1000, description: "Entry + travel voucher" },
        { name: "Training Camp Pass", points: 1500, description: "3-day intensive camp" },
        { name: "Private Coaching Session", points: 800, description: "1-hour with pro coach" },
        { name: "Tournament VIP Package", points: 2500, description: "Premium seating + swag" }
      ]
    },
    {
      category: "Premium Content",
      icon: Video,
      color: "from-purple-500 to-pink-500",
      items: [
        { name: "Pro Strategy Course", points: 600, description: "12-video masterclass" },
        { name: "Technique Analysis Pack", points: 400, description: "10 additional analyses" },
        { name: "Elite Training Program", points: 1200, description: "Advanced 30-day program" },
        { name: "Podcast Series Access", points: 300, description: "Exclusive interview series" },
        { name: "E-Book Bundle", points: 500, description: "5 strategy guides" }
      ]
    },
    {
      category: "Sponsor Offers",
      icon: Gift,
      color: "from-emerald-500 to-teal-500",
      items: [
        { name: "Equipment Discount (20%)", points: 200, description: "Sponsor partner gear" },
        { name: "Nutrition Sample Pack", points: 150, description: "Sports nutrition products" },
        { name: "Fitness App Premium", points: 400, description: "6-month subscription" },
        { name: "Sports Massage Gift Card", points: 500, description: "$50 value" },
        { name: "Partner Venue Free Court", points: 300, description: "2-hour court rental" }
      ]
    }
  ]

  const redemptionSteps = [
    {
      step: "1",
      title: "Browse the Marketplace",
      description: "Explore available rewards in the Rewards Marketplace. Filter by points, category, or what you can afford.",
      icon: ShoppingBag
    },
    {
      step: "2",
      title: "Select Your Reward",
      description: "Click on any reward to view full details including required points, shipping info, and availability.",
      icon: Package
    },
    {
      step: "3",
      title: "Confirm Redemption",
      description: "Review your selection and confirm. Points will be deducted immediately upon confirmation.",
      icon: CheckCircle2
    },
    {
      step: "4",
      title: "Receive Your Reward",
      description: "Digital rewards are instant. Physical items ship within 5-7 business days. Track status in My Rewards.",
      icon: Award
    }
  ]

  const tips = [
    {
      icon: Star,
      title: "Save for Big Items",
      description: "High-value rewards offer better overall value. Set a savings goal and work toward it."
    },
    {
      icon: Zap,
      title: "Watch for Specials",
      description: "Some rewards go on sale during promotional periods - follow announcements for deals."
    },
    {
      icon: TrendingUp,
      title: "Prioritize Wisely",
      description: "Focus on rewards that directly enhance your training or competition experience first."
    },
    {
      icon: Users,
      title: "Sponsor Offers",
      description: "Sponsor rewards often provide the best point-to-value ratio - check them first."
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
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full blur-lg opacity-20" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <Gift className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-light text-gray-900 mb-4">
            Redeeming <span className="font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Rewards</span>
          </h1>
          <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
            Turn your hard-earned points into amazing rewards - from gear and tournament entries to exclusive content and sponsor offers
          </p>
        </motion.div>

        {/* Quick Access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <Card className="border-0 shadow-2xl backdrop-blur-sm bg-gradient-to-br from-emerald-50/80 to-teal-50/80">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <CardContent className="pt-10">
              <div className="text-center">
                <Sparkles className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">Start Redeeming Today</h3>
                <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                  Browse the complete rewards marketplace and find the perfect reward for your points
                </p>
                <Link href="/marketplace">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg"
                  >
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Browse Rewards Marketplace
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reward Categories */}
        <div className="mb-16">
          <h2 className="text-3xl font-light text-gray-900 mb-8 text-center">
            Available <span className="font-semibold">Rewards</span>
          </h2>
          
          <div className="space-y-12">
            {rewardCategories.map((category, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
              >
                <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/80">
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${category.color}`} />
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className={`absolute inset-0 bg-gradient-to-br ${category.color} rounded-xl blur-sm opacity-30`} />
                        <div className={`relative bg-gradient-to-br ${category.color} p-3 rounded-xl shadow-lg`}>
                          <category.icon className="h-8 w-8 text-white" />
                        </div>
                      </div>
                      <CardTitle className="text-2xl font-light">{category.category}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.items.map((item, iIdx) => (
                        <div key={iIdx} className="p-4 rounded-lg border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all bg-gradient-to-br from-white to-gray-50">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-semibold text-gray-900">{item.name}</h4>
                            <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0">
                              {item.points}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Redemption Process */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-light text-gray-900 mb-8 text-center">
            How to <span className="font-semibold">Redeem</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {redemptionSteps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
              >
                <Card className="border-0 shadow-xl backdrop-blur-sm bg-gradient-to-br from-purple-50 to-indigo-50 h-full">
                  <CardContent className="pt-6">
                    <div className="text-center mb-4">
                      <div className="relative inline-block mb-4">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full blur opacity-30" />
                        <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                          <span className="text-white text-2xl font-bold">{step.step}</span>
                        </div>
                      </div>
                      <step.icon className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                    </div>
                    <h4 className="font-semibold text-center mb-2">{step.title}</h4>
                    <p className="text-sm text-gray-600 text-center">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tips & Best Practices */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/80">
            <CardHeader>
              <CardTitle className="text-3xl font-light text-center">
                Redemption <span className="font-semibold">Tips</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {tips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl blur-sm opacity-20" />
                      <div className="relative bg-gradient-to-br from-teal-50 to-emerald-50 p-3 rounded-xl border border-teal-200">
                        <tip.icon className="h-6 w-6 text-teal-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{tip.title}</h4>
                      <p className="text-gray-600 text-sm">{tip.description}</p>
                    </div>
                  </div>
                ))}
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
          <Card className="border-0 shadow-2xl backdrop-blur-sm bg-gradient-to-br from-amber-50/80 to-orange-50/80">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
            <CardContent className="pt-10">
              <div className="text-center">
                <Crown className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">Ready to Claim Your Rewards?</h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Browse the marketplace and start redeeming your points for amazing rewards
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/marketplace">
                    <Button size="lg" className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      Open Marketplace
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/help/rewards/earning-points">
                    <Button size="lg" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                      <Star className="mr-2 h-5 w-5" />
                      Earn More Points
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
