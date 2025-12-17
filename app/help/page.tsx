
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
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { HelpCircle, Mail, MessageCircle, Book, Video, FileText, ExternalLink, ArrowRight, Sparkles, HeadphonesIcon, Users, Shield, Lightbulb, Phone, Clock, Trophy } from "lucide-react"
import MainNavigation from "@/components/navigation/main-navigation"
import Link from "next/link"
import { motion } from "framer-motion"

export default function HelpPage() {
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

  // Mock user data - in production this would come from props or API
  const userData = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    firstName: session.user.name?.split(' ')[0],
    subscriptionTier: 'PREMIUM', // Mock data
    role: 'USER'
  }

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "How do I set up my profile and preferences?",
          a: "Navigate to Settings > Profile to update your personal information, skill level, goals, and training preferences. This helps us personalize your coaching experience."
        },
        {
          q: "How does the AI coach work?",
          a: "Our AI coach uses your profile data, training history, and match performance to provide personalized coaching advice. Chat with it anytime under Train > AI Coach to ask questions or get guidance on technique, strategy, and mental game."
        },
        {
          q: "What is the Avatar Coach feature?",
          a: "Available for Pro users, Avatar Coach is your personalized AI coaching companion. Upload a photo or customize an avatar that provides voice guidance and appears throughout your app experience."
        }
      ]
    },
    {
      category: "Training & Drills",
      questions: [
        {
          q: "How do I find drills for my skill level?",
          a: "Go to Train > Drills Library and use the difficulty filters (Beginner, Intermediate, Advanced) to find drills appropriate for your level. You can also search by focus area like serving, dinking, or net play."
        },
        {
          q: "Can I create custom training plans?",
          a: "Currently, we offer structured training plans designed by professional coaches. Visit Train > Training Plans to browse programs ranging from 7-day beginner bootcamps to advanced tournament prep."
        },
        {
          q: "How do I use the video analysis feature?",
          a: "Upload your match or practice video under Train > Video Analysis. Our AI will analyze your technique, positioning, and strategy, providing detailed feedback on strengths and areas for improvement."
        }
      ]
    },
    {
      category: "Progress Tracking",
      questions: [
        {
          q: "How do I log matches?",
          a: "Navigate to Progress > Matches and click 'Log New Match'. Enter match details including opponent, score, and notes. Your stats will automatically update."
        },
        {
          q: "What metrics are tracked?",
          a: "We track wins/losses, win rate, current streak, match history, and progress toward your goals. Mental performance metrics like focus, stress, and confidence are also tracked through mental training sessions."
        },
        {
          q: "How often should I update my goals?",
          a: "Review and update your goals monthly or whenever your training focus changes. Go to Progress > Goals to manage your objectives."
        }
      ]
    },
    {
      category: "Rewards & Points",
      questions: [
        {
          q: "How do I earn points?",
          a: "Earn points through training activities, unlocking achievements, community engagement, and sponsor interactions. Points are credited automatically and never expire. Premium members get a 1.5x multiplier on all points."
        },
        {
          q: "What can I redeem points for?",
          a: "Use points for merchandise, tournament entries, premium content, and sponsor offers in the Rewards Marketplace. Browse available rewards and their point costs at any time."
        },
        {
          q: "How many achievement tiers are there?",
          a: "There are 70 achievements across 4 tiers: Bronze (100 pts), Silver (250 pts), Gold (500 pts), and Platinum (1000 pts). Track your progress in the Achievements section."
        },
        {
          q: "What are sponsor offers?",
          a: "Partner sponsors provide exclusive discounts, free samples, and VIP access to Mindful Champion members. Engaging with sponsors earns bonus points and gives you access to special deals."
        }
      ]
    },
    {
      category: "Subscription & Billing",
      questions: [
        {
          q: "What's included in the free trial?",
          a: "Your 7-day free trial includes access to all Premium features: unlimited AI coaching, drills library, training plans, progress tracking, and community features."
        },
        {
          q: "What are the subscription tiers?",
          a: "Free: Basic access and limited features. Premium ($19/mo): Full coaching suite, unlimited AI sessions, video analysis, and community. Pro ($39/mo): Everything in Premium plus Avatar Coach, priority support, and advanced analytics."
        },
        {
          q: "How do I cancel my subscription?",
          a: "Go to Settings > Subscription to manage or cancel your plan anytime. No questions asked!"
        }
      ]
    }
  ]

  const resources = [
    {
      icon: Book,
      title: "User Guide",
      description: "Complete guide to all features",
      badge: "PDF",
      href: "/help/user-guide",
      external: false
    },
    {
      icon: Video,
      title: "Video Analysis Guide",
      description: "AI-powered technique analysis help",
      badge: "Essential",
      href: "/help/video-analysis",
      external: false
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Step-by-step video walkthroughs",
      badge: "12 videos",
      href: "/help/tutorials",
      external: false
    },
    {
      icon: FileText,
      title: "Training Tips",
      description: "Expert articles and best practices",
      badge: "New",
      href: "/help/training-tips",
      external: false
    },
    {
      icon: Trophy,
      title: "Rewards Program",
      description: "Points, achievements & redemptions",
      badge: "Hot",
      href: "/help/rewards",
      external: false
    },
    {
      icon: Users,
      title: "Sponsor Program",
      description: "Partner offers and bonus points",
      badge: "Partners",
      href: "/help/sponsors",
      external: false
    },
    {
      icon: MessageCircle,
      title: "Submit Ticket",
      description: "Report issues or request features",
      badge: "Support",
      href: "/help/submit-ticket",
      external: false
    },
    {
      icon: FileText,
      title: "My Tickets",
      description: "Track your support requests",
      badge: "Track",
      href: "/help/tickets",
      external: false
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-white to-teal-50/30">
      <MainNavigation user={userData} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-16 text-center"
        >
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full blur-lg opacity-20" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <HelpCircle className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-light text-gray-900 mb-4">
            Help & <span className="font-semibold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">Support Center</span>
          </h1>
          <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto">
            Find answers, get support, and master your Mindful Champion experience
          </p>
        </motion.div>

        {/* Quick Access Resources */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-light text-gray-900 mb-8 text-center">Quick Access</h2>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-8">
            {resources.map((resource, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                whileHover={{ y: -5 }}
              >
                <InfoTooltip content={`Access ${resource.title.toLowerCase()} resources`}>
                  <Link href={resource.href} className="block group">
                    <Card className="relative overflow-hidden border-0 shadow-xl backdrop-blur-sm bg-white/80 hover:shadow-2xl transition-all duration-300 group-hover:scale-105 h-full">
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500" />
                      <CardContent className="pt-8">
                        <div className="flex items-start justify-between mb-4">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl blur-sm opacity-20 group-hover:opacity-40 transition-opacity" />
                            <div className="relative bg-gradient-to-br from-teal-50 to-emerald-50 p-3 rounded-2xl border border-teal-200 group-hover:scale-110 transition-transform">
                              <resource.icon className="h-8 w-8 text-teal-600" />
                            </div>
                          </div>
                          <Badge className="bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100">
                            {resource.badge}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-xl mb-2 text-gray-900 group-hover:text-teal-700 transition-colors">
                          {resource.title}
                        </h3>
                        <p className="text-gray-600 mb-4 leading-relaxed">{resource.description}</p>
                        <div className="flex items-center text-teal-600 font-medium">
                          <span>Explore</span>
                          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </InfoTooltip>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16"
        >
          <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/80">
            <CardHeader className="pb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl blur-sm opacity-30" />
                  <div className="relative bg-gradient-to-br from-indigo-500 to-purple-500 p-2 rounded-xl">
                    <Lightbulb className="w-6 h-6 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-light text-gray-900">Frequently Asked Questions</CardTitle>
              </div>
              <p className="text-gray-600">Find quick answers to common questions</p>
            </CardHeader>
            <CardContent>
              {faqs.map((category, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="mb-8 last:mb-0"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{idx + 1}</span>
                    </div>
                    <h3 className="font-semibold text-xl text-teal-700">{category.category}</h3>
                  </div>
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
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Card className="relative overflow-hidden border-0 shadow-2xl backdrop-blur-sm bg-gradient-to-br from-teal-50/80 to-emerald-50/80">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500" />
            
            <CardContent className="pt-10">
              <div className="text-center mb-8">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full blur opacity-30" />
                  <div className="relative bg-white p-3 rounded-full shadow-lg">
                    <Sparkles className="w-8 h-8 text-teal-600" />
                  </div>
                </div>
                <h3 className="font-semibold text-3xl text-teal-800 mb-2">Still need help?</h3>
                <p className="text-gray-700 text-lg max-w-2xl mx-auto">
                  Can't find what you're looking for? Our support team is here to help you succeed!
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {/* Email Support */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="text-center"
                >
                  <InfoTooltip content="Send us an email and we'll get back to you within 24 hours">
                    <Button 
                      size="lg"
                      className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-lg hover:shadow-teal-500/30 transition-all mb-3"
                      onClick={() => window.location.href = 'mailto:support@mindfulchampion.ai?subject=Help Request&body=Hi Mindful Champion Support Team,%0A%0APlease describe your question or issue below:%0A%0A'}
                    >
                      <Mail className="mr-2 h-5 w-5" />
                      Email Support
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </InfoTooltip>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Response within 24 hours</span>
                  </div>
                </motion.div>

                {/* Live Chat */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="text-center"
                >
                  <InfoTooltip content="Chat with Coach Kai, our AI assistant, for instant help">
                    <Link href="/ai-coach" className="block">
                      <Button 
                        size="lg"
                        variant="outline" 
                        className="w-full border-teal-300 text-teal-700 hover:bg-teal-50 hover:border-teal-400 shadow-sm hover:shadow-lg transition-all mb-3"
                      >
                        <MessageCircle className="mr-2 h-5 w-5" />
                        Chat with Coach Kai
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </InfoTooltip>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>Available 24/7</span>
                  </div>
                </motion.div>

                {/* Community Support */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="text-center"
                >
                  <InfoTooltip content="Get help from other players in our community">
                    <Link href="/connect/community" className="block">
                      <Button 
                        size="lg"
                        variant="outline" 
                        className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 shadow-sm hover:shadow-lg transition-all mb-3"
                      >
                        <Users className="mr-2 h-5 w-5" />
                        Community Help
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </InfoTooltip>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>Peer support network</span>
                  </div>
                </motion.div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-teal-200/50">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl">
                    <Lightbulb className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">Pro Tip</h4>
                    <p className="text-sm text-gray-700">
                      For the fastest response, try <strong>Coach Kai</strong> first! Our AI assistant can instantly help with training questions, feature explanations, and troubleshooting.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
