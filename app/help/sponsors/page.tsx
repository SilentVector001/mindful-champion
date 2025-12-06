'use client'

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  ArrowLeft,
  Gift,
  Star,
  Video,
  ShoppingBag,
  TrendingUp,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Target,
  Zap,
  Heart,
  MessageSquare,
  Calendar,
  Package
} from "lucide-react"
import MainNavigation from "@/components/navigation/main-navigation"
import Link from "next/link"
import { motion } from "framer-motion"

export default function SponsorProgramPage() {
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

  const sponsorBenefits = [
    {
      icon: Gift,
      title: "Exclusive Offers",
      description: "Access special discounts and promotions from partner brands",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: Star,
      title: "Bonus Points",
      description: "Earn extra reward points through sponsor interactions",
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: Package,
      title: "Free Products",
      description: "Receive sample products and gear from sponsors",
      color: "from-blue-500 to-indigo-500"
    },
    {
      icon: Award,
      title: "VIP Access",
      description: "Get early access to new products and special events",
      color: "from-purple-500 to-violet-500"
    }
  ]

  const engagementMethods = [
    {
      category: "Content Engagement",
      icon: Video,
      color: "from-red-500 to-orange-500",
      activities: [
        { action: "Watch Sponsored Video", points: 20, description: "View training content from partners" },
        { action: "Complete Sponsor Tutorial", points: 50, description: "Follow along with sponsored drill" },
        { action: "Share Sponsored Content", points: 30, description: "Share to your social media" }
      ]
    },
    {
      category: "Surveys & Feedback",
      icon: MessageSquare,
      color: "from-emerald-500 to-teal-500",
      activities: [
        { action: "Complete Product Survey", points: 50, description: "Share your opinions on gear" },
        { action: "Write Product Review", points: 100, description: "Review sponsor equipment" },
        { action: "Provide Feedback", points: 25, description: "Quick feedback on offers" }
      ]
    },
    {
      category: "Offer Redemptions",
      icon: ShoppingBag,
      color: "from-blue-500 to-cyan-500",
      activities: [
        { action: "Redeem Discount Code", points: 75, description: "Use sponsor discount" },
        { action: "Purchase Sponsor Product", points: 150, description: "Bonus for buying partner gear" },
        { action: "Claim Free Sample", points: 40, description: "Redeem sample offer" }
      ]
    },
    {
      category: "Events & Campaigns",
      icon: Calendar,
      color: "from-purple-500 to-pink-500",
      activities: [
        { action: "Attend Sponsor Event", points: 200, description: "Join sponsored tournament" },
        { action: "Participate in Campaign", points: 100, description: "Join seasonal campaigns" },
        { action: "Brand Ambassador Action", points: 500, description: "Featured activities" }
      ]
    }
  ]

  const currentSponsors = [
    {
      name: "PicklePro Gear",
      category: "Equipment",
      offers: "20% off paddles, Free shipping",
      points: "150 bonus points"
    },
    {
      name: "FitFuel Nutrition",
      category: "Sports Nutrition",
      offers: "Sample packs, 15% discount",
      points: "100 bonus points"
    },
    {
      name: "CourtVision Apparel",
      category: "Clothing",
      offers: "Buy 1 Get 1 Free, VIP access",
      points: "200 bonus points"
    },
    {
      name: "AthleticEdge Training",
      category: "Fitness Programs",
      offers: "30-day free trial",
      points: "175 bonus points"
    }
  ]

  const howItWorks = [
    {
      step: "1",
      title: "Browse Sponsor Offers",
      description: "Check the Sponsors section to see current partners, their offers, and available point opportunities",
      icon: Target
    },
    {
      step: "2",
      title: "Engage with Content",
      description: "Watch videos, complete surveys, and interact with sponsor content to earn points",
      icon: Video
    },
    {
      step: "3",
      title: "Redeem Exclusive Offers",
      description: "Use your points or claim special discounts available only to Mindful Champion members",
      icon: Gift
    },
    {
      step: "4",
      title: "Earn Bonus Rewards",
      description: "Get extra points for purchases, reviews, and participation in sponsor campaigns",
      icon: TrendingUp
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
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full blur-lg opacity-20" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-pink-600 to-rose-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <Users className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-light text-gray-900 mb-4">
            Sponsor <span className="font-semibold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Program</span>
          </h1>
          <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto mb-8">
            Connect with trusted partner brands to unlock exclusive offers, earn bonus points, and access premium products and services
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Badge className="bg-pink-50 text-pink-700 border-pink-200 px-4 py-2">
              <Heart className="w-4 h-4 mr-2" />
              Trusted Partners
            </Badge>
            <Badge className="bg-rose-50 text-rose-700 border-rose-200 px-4 py-2">
              <Gift className="w-4 h-4 mr-2" />
              Exclusive Offers
            </Badge>
            <Badge className="bg-amber-50 text-amber-700 border-amber-200 px-4 py-2">
              <Star className="w-4 h-4 mr-2" />
              Bonus Points
            </Badge>
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-light text-gray-900 mb-8 text-center">
            Program <span className="font-semibold">Benefits</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sponsorBenefits.map((benefit, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * idx }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="border-0 shadow-xl backdrop-blur-sm bg-white/80 h-full">
                  <CardContent className="pt-6 text-center">
                    <div className="relative inline-block mb-4">
                      <div className={`absolute inset-0 bg-gradient-to-br ${benefit.color} rounded-2xl blur-sm opacity-20`} />
                      <div className={`relative bg-gradient-to-br ${benefit.color} p-4 rounded-2xl shadow-lg`}>
                        <benefit.icon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-light text-gray-900 mb-8 text-center">
            How It <span className="font-semibold">Works</span>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
              >
                <Card className="border-0 shadow-xl backdrop-blur-sm bg-gradient-to-br from-purple-50 to-pink-50 h-full">
                  <CardContent className="pt-6">
                    <div className="text-center mb-4">
                      <div className="relative inline-block mb-4">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur opacity-30" />
                        <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                          <span className="text-white text-2xl font-bold">{item.step}</span>
                        </div>
                      </div>
                      <item.icon className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                    </div>
                    <h4 className="font-semibold text-center mb-2">{item.title}</h4>
                    <p className="text-sm text-gray-600 text-center">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Engagement Methods */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-light text-gray-900 mb-8 text-center">
            Ways to <span className="font-semibold">Engage</span>
          </h2>
          
          <div className="space-y-12">
            {engagementMethods.map((method, idx) => (
              <Card key={idx} className="border-0 shadow-2xl backdrop-blur-sm bg-white/80">
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
                  <div className="grid md:grid-cols-3 gap-4">
                    {method.activities.map((activity, aIdx) => (
                      <div key={aIdx} className="p-4 rounded-lg border border-gray-200 hover:border-pink-300 hover:shadow-lg transition-all bg-gradient-to-br from-white to-gray-50">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{activity.action}</h4>
                          <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0">
                            +{activity.points}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Current Sponsors */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-light text-gray-900 mb-8 text-center">
            Current <span className="font-semibold">Partners</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {currentSponsors.map((sponsor, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * idx }}
              >
                <Card className="border-0 shadow-xl backdrop-blur-sm bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-2xl transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{sponsor.name}</h3>
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                          {sponsor.category}
                        </Badge>
                      </div>
                      <Sparkles className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-start gap-2">
                        <Gift className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-700">Offers</div>
                          <div className="text-sm text-gray-600">{sponsor.offers}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Star className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-gray-700">Bonus</div>
                          <div className="text-sm text-gray-600">{sponsor.points}</div>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                      View Offers
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* For Businesses CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <Card className="border-0 shadow-2xl backdrop-blur-sm bg-gradient-to-br from-emerald-50/80 to-teal-50/80">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <CardContent className="pt-10">
              <div className="text-center">
                <Users className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">Interested in Becoming a Sponsor?</h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Learn how your brand can reach our engaged community of pickleball players
                </p>
                <Link href="/help/sponsors/partnership">
                  <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                    <Users className="mr-2 h-5 w-5" />
                    Partnership Information
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="border-0 shadow-2xl backdrop-blur-sm bg-gradient-to-br from-pink-50/80 to-rose-50/80">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-rose-500" />
            <CardContent className="pt-10">
              <div className="text-center">
                <Gift className="w-12 h-12 text-pink-600 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">Start Earning with Sponsors</h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Browse current sponsor offers and start earning bonus points today
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/sponsors">
                    <Button size="lg" className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700">
                      <Users className="mr-2 h-5 w-5" />
                      View All Sponsors
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/help/rewards/earning-points">
                    <Button size="lg" variant="outline" className="border-pink-300 text-pink-700 hover:bg-pink-50">
                      <Star className="mr-2 h-5 w-5" />
                      Ways to Earn Points
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
