
'use client'

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { 
  Book, 
  ArrowRight, 
  Home, 
  Dumbbell, 
  TrendingUp, 
  Users, 
  Settings,
  Video,
  Target,
  Trophy,
  MessageCircle,
  Calendar,
  Award,
  HelpCircle,
  Sparkles,
  Download,
  CheckCircle,
  ArrowLeft
} from "lucide-react"
import MainNavigation from "@/components/navigation/main-navigation"
import Link from "next/link"
import { motion } from "framer-motion"

export default function UserGuidePage() {
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

  // Mock user data
  const userData = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    firstName: session.user.name?.split(' ')[0],
    subscriptionTier: 'PREMIUM',
    role: 'USER'
  }

  const guidesections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Sparkles,
      description: 'Set up your profile and begin your coaching journey',
      color: 'from-teal-500 to-emerald-500',
      items: [
        {
          title: 'Complete Your Profile',
          description: 'Set your skill level, goals, and playing preferences',
          link: '/profile',
          completed: true
        },
        {
          title: 'Take the Onboarding Quiz',
          description: 'Help us understand your game and create personalized recommendations',
          link: '/onboarding',
          completed: true
        },
        {
          title: 'Set Your Training Goals',
          description: 'Define what you want to achieve with Mindful Champion',
          link: '/progress/goals',
          completed: false
        }
      ]
    },
    {
      id: 'training-features',
      title: 'Training Features',
      icon: Dumbbell,
      description: 'Master all the training tools at your disposal',
      color: 'from-orange-500 to-red-500',
      items: [
        {
          title: 'AI Coach Sessions',
          description: 'Chat with Coach Kai for personalized guidance and answers',
          link: '/ai-coach',
          completed: false
        },
        {
          title: 'Video Analysis',
          description: 'Upload match footage for AI-powered technique feedback',
          link: '/train/video',
          completed: false
        },
        {
          title: 'Drill Library',
          description: 'Access hundreds of drills organized by skill level',
          link: '/train/drills',
          completed: false
        },
        {
          title: 'Training Programs',
          description: 'Follow structured programs designed by pro coaches',
          link: '/train/programs',
          completed: false
        },
        {
          title: 'Quick Practice Sessions',
          description: 'Start a 15-minute focused training session',
          link: '/train/quick',
          completed: false
        }
      ]
    },
    {
      id: 'progress-tracking',
      title: 'Progress Tracking',
      icon: TrendingUp,
      description: 'Monitor your improvement and celebrate achievements',
      color: 'from-blue-500 to-indigo-500',
      items: [
        {
          title: 'Performance Dashboard',
          description: 'View your stats, trends, and key metrics',
          link: '/progress',
          completed: false
        },
        {
          title: 'Match Logging',
          description: 'Record match results and track your win rate',
          link: '/progress/matches',
          completed: false
        },
        {
          title: 'Achievement System',
          description: 'Earn badges and unlock rewards for milestones',
          link: '/progress/achievements',
          completed: false
        },
        {
          title: 'Goal Management',
          description: 'Set, track, and achieve your pickleball objectives',
          link: '/progress/goals',
          completed: false
        }
      ]
    },
    {
      id: 'community-features',
      title: 'Community & Social',
      icon: Users,
      description: 'Connect with other players and join the community',
      color: 'from-emerald-500 to-teal-500',
      items: [
        {
          title: 'Find Practice Partners',
          description: 'Get matched with players at your skill level',
          link: '/connect/partners',
          completed: false
        },
        {
          title: 'Community Board',
          description: 'Share tips, ask questions, and connect with others',
          link: '/connect/community',
          completed: false
        },
        {
          title: 'Tournament Hub',
          description: 'Find and register for local tournaments',
          link: '/connect/tournaments',
          completed: false
        },
        {
          title: 'Expert Coaches',
          description: 'Book private lessons with certified instructors',
          link: '/coaches',
          completed: false
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/50 via-white to-teal-50/30">
      <MainNavigation user={userData} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12"
        >
          <div className="flex items-center gap-4 mb-6">
            <Link href="/help">
              <Button variant="outline" size="sm" className="hover:bg-gray-50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Help Center
              </Button>
            </Link>
          </div>

          <div className="text-center">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full blur-lg opacity-20" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                <Book className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-light text-gray-900 mb-4">
              User <span className="font-semibold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">Guide</span>
            </h1>
            <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto mb-8">
              Everything you need to know to get the most out of Mindful Champion. Follow this comprehensive guide to master all features and accelerate your pickleball improvement.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Badge className="bg-teal-50 text-teal-700 border-teal-200 px-4 py-2">
                Complete Guide
              </Badge>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 px-4 py-2">
                Step-by-Step
              </Badge>
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 px-4 py-2">
                Interactive Links
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Guide Sections */}
        <div className="space-y-12">
          {guidesections.map((section, idx) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 * idx }}
            >
              <Card className="relative overflow-hidden border-0 shadow-2xl backdrop-blur-sm bg-white/80">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${section.color}`} />
                
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${section.color} rounded-xl blur-sm opacity-30`} />
                      <div className={`relative bg-gradient-to-br ${section.color} p-3 rounded-xl shadow-lg`}>
                        <section.icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-light text-gray-900">{section.title}</CardTitle>
                      <p className="text-gray-600 mt-1">{section.description}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {section.items.map((item, itemIdx) => (
                      <motion.div
                        key={itemIdx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.05 * itemIdx }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <Link href={item.link} className="block group">
                          <Card className="h-full border border-gray-200 hover:border-teal-300 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-teal-700 transition-colors">
                                    {item.title}
                                  </h4>
                                  <p className="text-sm text-gray-600 leading-relaxed">
                                    {item.description}
                                  </p>
                                </div>
                                {item.completed ? (
                                  <div className="ml-3 flex-shrink-0">
                                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                    </div>
                                  </div>
                                ) : (
                                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all ml-3 flex-shrink-0" />
                                )}
                              </div>
                              
                              <div className="flex items-center text-teal-600 text-sm font-medium mt-4">
                                <span>{item.completed ? 'Completed' : 'Get Started'}</span>
                                {!item.completed && <ArrowRight className="w-3 h-3 ml-1" />}
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16"
        >
          <Card className="border-0 shadow-2xl backdrop-blur-sm bg-gradient-to-br from-indigo-50/80 to-purple-50/80">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
            
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur opacity-30" />
                  <div className="relative bg-white p-3 rounded-full shadow-lg">
                    <HelpCircle className="w-8 h-8 text-indigo-600" />
                  </div>
                </div>
                <h3 className="text-3xl font-light text-gray-900 mb-2">Pro Tips for Success</h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Get the most out of your Mindful Champion experience with these expert recommendations
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Start with Coach Kai</h4>
                      <p className="text-gray-600 text-sm">Begin each session by asking our AI coach about your goals for the day.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Log Every Match</h4>
                      <p className="text-gray-600 text-sm">Consistent tracking leads to better insights and faster improvement.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Use Video Analysis</h4>
                      <p className="text-gray-600 text-sm">Upload footage regularly to identify and fix technique issues early.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Join the Community</h4>
                      <p className="text-gray-600 text-sm">Connect with other players for motivation, tips, and practice partners.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">5</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Set Weekly Goals</h4>
                      <p className="text-gray-600 text-sm">Break down larger objectives into achievable weekly milestones.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-bold">6</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">Practice Consistency</h4>
                      <p className="text-gray-600 text-sm">15 minutes daily beats 2 hours once a week for skill development.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center mt-8">
                <Link href="/help">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-indigo-500/30"
                  >
                    <HelpCircle className="mr-2 h-5 w-5" />
                    More Help Resources
                    <ArrowRight className="ml-2 h-4 w-4" />
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
