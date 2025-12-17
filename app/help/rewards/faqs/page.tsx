'use client'

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  HelpCircle, 
  ArrowLeft,
  Star,
  Trophy,
  Gift,
  Users,
  MessageCircle,
  Mail,
  ExternalLink,
  Sparkles,
  ArrowRight
} from "lucide-react"
import MainNavigation from "@/components/navigation/main-navigation"
import Link from "next/link"
import { motion } from "framer-motion"

export default function RewardsFAQsPage() {
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

  const faqCategories = [
    {
      category: "Getting Started",
      icon: Star,
      color: "from-yellow-500 to-orange-500",
      questions: [
        {
          q: "How do I start earning points?",
          a: "Points are earned automatically as you complete activities like training sessions, achievements, community engagement, and sponsor interactions. Simply use the app as normal - your points balance updates in real-time. Check the 'Earning Points' guide for a complete list of point-earning activities."
        },
        {
          q: "Where can I see my current points balance?",
          a: "Your points balance is displayed in multiple places: the top navigation bar, your profile page, the Rewards Marketplace, and the Progress dashboard. Click on your balance anywhere to view a detailed transaction history."
        },
        {
          q: "Do my points expire?",
          a: "No! Your points never expire as long as your account remains active. However, if your account is inactive for 12+ months, we may retire unused points after providing 60 days notice."
        },
        {
          q: "Can I transfer points to another user?",
          a: "Points are non-transferable and tied to your individual account. However, you can gift rewards from the marketplace to other users once redeemed."
        }
      ]
    },
    {
      category: "Earning Points",
      icon: Trophy,
      color: "from-indigo-500 to-purple-500",
      questions: [
        {
          q: "What activities earn the most points?",
          a: "High-value activities include: Platinum achievements (1000 pts), completing training programs (500 pts), referring premium users (500 pts), and tournament victories (varies). Consistency matters too - daily streaks provide significant bonus points."
        },
        {
          q: "How does the Premium multiplier work?",
          a: "Premium members receive 1.5x points on all activities. For example, if an activity normally awards 100 points, Premium members receive 150 points. This applies automatically - no action needed!"
        },
        {
          q: "Are there point limits per day or month?",
          a: "No daily or monthly limits exist. You can earn unlimited points by actively engaging with the platform. Some activities have frequency limits (e.g., one video analysis reward per video), but overall earning is unrestricted."
        },
        {
          q: "When are points credited to my account?",
          a: "Most points are credited instantly upon completing an activity. Some activities like sponsor campaigns or tournament results may take 24-48 hours to process. You'll receive a notification when points are added."
        },
        {
          q: "What are weekend bonuses?",
          a: "Every Saturday and Sunday, training activities earn 2x points. This includes drills, programs, video analysis, and AI coach sessions. It's a great time to maximize your rewards!"
        }
      ]
    },
    {
      category: "Achievements",
      icon: Trophy,
      color: "from-amber-500 to-yellow-500",
      questions: [
        {
          q: "How many achievements are there?",
          a: "There are 70 total achievements across 4 tiers (Bronze, Silver, Gold, Platinum) and 5 categories (Training, Competition, Progress, Community, Special). New achievements are added regularly based on user feedback."
        },
        {
          q: "Can I unlock achievements retroactively?",
          a: "Yes! When new achievements are added, we review your historical activity and automatically unlock any you've already qualified for. You'll receive a notification with any retroactive unlocks."
        },
        {
          q: "What if I'm stuck on an achievement?",
          a: "Visit Progress → Achievements to see detailed progress bars and requirements for each achievement. If you're close but stuck, ask Coach Kai for tips or check the community forums for advice from other users."
        },
        {
          q: "Do hidden achievements exist?",
          a: "Yes! Several 'secret' achievements can only be unlocked through discovery. Pay attention to special events, seasonal activities, and creative ways to use the platform."
        }
      ]
    },
    {
      category: "Redeeming Rewards",
      icon: Gift,
      color: "from-emerald-500 to-teal-500",
      questions: [
        {
          q: "How do I redeem my points for rewards?",
          a: "Visit the Rewards Marketplace, browse available rewards, and click 'Redeem' on your chosen item. Confirm the redemption and points will be deducted immediately. Digital rewards are instant; physical items ship within 5-7 business days."
        },
        {
          q: "Can I cancel a redemption?",
          a: "Digital rewards cannot be refunded once claimed. For physical merchandise, you can cancel within 2 hours of redemption if the item hasn't shipped yet. Contact support for assistance."
        },
        {
          q: "What if a reward is out of stock?",
          a: "Popular rewards may temporarily go out of stock. You can add them to your wishlist and we'll notify you when they're available again. Your points are never lost waiting for restocks."
        },
        {
          q: "Are there shipping fees for physical rewards?",
          a: "Shipping is free for all rewards within the continental US. Alaska, Hawaii, and international shipping may incur additional fees displayed at checkout before redemption."
        },
        {
          q: "How do I track my reward orders?",
          a: "Visit Profile → My Rewards to see all your redemption history, current orders, and tracking information for shipped items. You'll also receive email updates at each shipping stage."
        }
      ]
    },
    {
      category: "Sponsor Program",
      icon: Users,
      color: "from-pink-500 to-rose-500",
      questions: [
        {
          q: "How do sponsor offers work?",
          a: "Sponsors provide exclusive offers (discounts, free samples, VIP access) to Mindful Champion members. Browse the Sponsors section, click on any offer, and follow the redemption instructions. You'll earn bonus points for engagement."
        },
        {
          q: "Are sponsor products vetted?",
          a: "Yes! All sponsor partners are carefully vetted to ensure quality products and services relevant to pickleball players. We only partner with brands we trust and believe add value to our community."
        },
        {
          q: "Can I opt out of sponsor content?",
          a: "Absolutely. Visit Settings → Preferences and toggle off 'Sponsor Content'. You'll still have access to the Sponsors section if you change your mind, but won't see sponsored content in your feed."
        },
        {
          q: "Do I have to purchase to earn sponsor points?",
          a: "No! While purchases earn bonus points, you can earn points simply by watching sponsored content, completing surveys, and engaging with offers - no purchase required."
        }
      ]
    },
    {
      category: "Account & Technical",
      icon: HelpCircle,
      color: "from-blue-500 to-cyan-500",
      questions: [
        {
          q: "What happens to my points if I cancel my subscription?",
          a: "Your points balance is preserved when downgrading from Premium to Free. However, you'll lose the 1.5x Premium multiplier on future earnings. You can still redeem existing points for rewards."
        },
        {
          q: "I didn't receive points for an activity. What should I do?",
          a: "First, check your transaction history (click your points balance) to confirm. Some activities have a 24-48 hour processing time. If points are still missing after 48 hours, contact support with details of the activity."
        },
        {
          q: "My points balance seems incorrect. How can I verify it?",
          a: "Visit your transaction history for a complete log of all points earned and spent. If you believe there's an error, contact support with specific transaction IDs and we'll investigate immediately."
        },
        {
          q: "Can I dispute a point deduction?",
          a: "If you believe points were incorrectly deducted (e.g., for a cancelled redemption), contact support within 30 days with your order number. We'll review and restore points if appropriate."
        },
        {
          q: "Is there a mobile app for tracking rewards?",
          a: "Yes! All rewards features are available in our mobile app for iOS and Android. Your points balance syncs instantly across all devices."
        }
      ]
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
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full blur-lg opacity-20" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <HelpCircle className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-light text-gray-900 mb-4">
            Rewards <span className="font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">FAQs</span>
          </h1>
          <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
            Find answers to common questions about earning points, unlocking achievements, and redeeming rewards
          </p>
        </motion.div>

        {/* FAQ Categories */}
        <div className="space-y-12">
          {faqCategories.map((category, idx) => (
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
                    <div>
                      <CardTitle className="text-2xl font-light">{category.category}</CardTitle>
                      <Badge className="mt-2 bg-gray-100 text-gray-700 border-gray-200">
                        {category.questions.length} questions
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {category.questions.map((faq, qIdx) => (
                      <AccordionItem key={qIdx} value={`${idx}-${qIdx}`} className="border-gray-200">
                        <AccordionTrigger className="text-left font-medium hover:text-teal-700 transition-colors">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-gray-600 leading-relaxed">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Still Have Questions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16"
        >
          <Card className="border-0 shadow-2xl backdrop-blur-sm bg-gradient-to-br from-teal-50/80 to-emerald-50/80">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500" />
            <CardContent className="pt-10">
              <div className="text-center">
                <Sparkles className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold mb-2">Still Have Questions?</h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Can't find the answer you're looking for? Our support team is here to help!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
                    onClick={() => window.location.href = 'mailto:support@mindfulchampion.ai?subject=Rewards Program Question&body=Hi Mindful Champion Support,%0A%0AI have a question about the Rewards Program:%0A%0A'}
                  >
                    <Mail className="mr-2 h-5 w-5" />
                    Email Support
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                  <Link href="/ai-coach">
                    <Button size="lg" variant="outline" className="border-teal-300 text-teal-700 hover:bg-teal-50">
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Ask Coach Kai
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
