// NOTE: Video tutorials are placeholders and will be replaced with actual training videos soon

'use client'

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { 
  Video, 
  ArrowRight, 
  Play, 
  Clock,
  Users,
  Star,
  ArrowLeft,
  ExternalLink,
  Sparkles,
  Target,
  TrendingUp,
  MessageCircle,
  Trophy,
  BookOpen,
  Monitor
} from "lucide-react"
import MainNavigation from "@/components/navigation/main-navigation"
import Link from "next/link"
import { motion } from "framer-motion"

export default function TutorialsPage() {
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

  const tutorialCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Essential tutorials to begin your journey',
      color: 'from-teal-500 to-emerald-500',
      icon: Sparkles,
      tutorials: [
        {
          title: 'Welcome to Mindful Champion',
          description: 'Complete walkthrough of all features and how to get started',
          duration: '8:45',
          difficulty: 'Beginner',
          views: '12.5k',
          thumbnail: 'https://cdn.abacus.ai/images/adc91d42-bb2a-41bf-82d8-653020294f19.png',
          videoUrl: '/tutorial-getting-started',
          featured: true
        },
        {
          title: 'Setting Up Your Profile',
          description: 'How to configure your skill level, goals, and preferences for personalized coaching',
          duration: '4:20',
          difficulty: 'Beginner',
          views: '8.2k',
          thumbnail: 'https://cdn.abacus.ai/images/adc91d42-bb2a-41bf-82d8-653020294f19.png',
          videoUrl: '/tutorial-profile-setup'
        },
        {
          title: 'Understanding Your Dashboard',
          description: 'Navigate your home dashboard and understand all the key metrics and features',
          duration: '6:15',
          difficulty: 'Beginner',
          views: '9.8k',
          thumbnail: 'https://cdn.abacus.ai/images/adc91d42-bb2a-41bf-82d8-653020294f19.png',
          videoUrl: '/tutorial-dashboard'
        }
      ]
    },
    {
      id: 'ai-coaching',
      title: 'AI Coaching',
      description: 'Master Coach Kai and get the best AI guidance',
      color: 'from-purple-500 to-pink-500',
      icon: MessageCircle,
      tutorials: [
        {
          title: 'Getting the Most from Coach Kai',
          description: 'Learn how to ask better questions and get more valuable coaching insights',
          duration: '7:30',
          difficulty: 'Beginner',
          views: '15.3k',
          thumbnail: 'https://cdn.abacus.ai/images/adc91d42-bb2a-41bf-82d8-653020294f19.png',
          videoUrl: '/tutorial-ai-coach',
          featured: true
        },
        {
          title: 'Voice Commands & Features',
          description: 'Use voice chat for hands-free coaching during practice sessions',
          duration: '5:45',
          difficulty: 'Intermediate',
          views: '6.7k',
          thumbnail: 'https://cdn.abacus.ai/images/adc91d42-bb2a-41bf-82d8-653020294f19.png',
          videoUrl: '/tutorial-voice-features'
        },
        {
          title: 'Mental Game Coaching',
          description: 'How Coach Kai helps with confidence, focus, and competitive mindset',
          duration: '9:20',
          difficulty: 'Intermediate',
          views: '11.2k',
          thumbnail: 'https://cdn.abacus.ai/images/adc91d42-bb2a-41bf-82d8-653020294f19.png',
          videoUrl: '/tutorial-mental-game'
        }
      ]
    },
    {
      id: 'video-analysis',
      title: 'Video Analysis',
      description: 'Upload and analyze your game footage effectively',
      color: 'from-blue-500 to-indigo-500',
      icon: Monitor,
      tutorials: [
        {
          title: 'Recording Quality Footage',
          description: 'Best practices for recording matches and practice sessions for analysis',
          duration: '6:50',
          difficulty: 'Beginner',
          views: '7.9k',
          thumbnail: 'https://cdn.abacus.ai/images/adc91d42-bb2a-41bf-82d8-653020294f19.png',
          videoUrl: '/tutorial-recording-tips'
        },
        {
          title: 'Understanding AI Analysis',
          description: 'How to interpret the feedback and suggestions from video analysis',
          duration: '8:15',
          difficulty: 'Intermediate',
          views: '10.4k',
          thumbnail: 'https://cdn.abacus.ai/images/adc91d42-bb2a-41bf-82d8-653020294f19.png',
          videoUrl: '/tutorial-analysis-interpretation',
          featured: true
        },
        {
          title: 'Tracking Improvement Over Time',
          description: 'Compare videos to see your progress and technique improvements',
          duration: '5:35',
          difficulty: 'Advanced',
          views: '4.8k',
          thumbnail: 'https://cdn.abacus.ai/images/adc91d42-bb2a-41bf-82d8-653020294f19.png',
          videoUrl: '/tutorial-progress-tracking'
        }
      ]
    },
    {
      id: 'progress-tracking',
      title: 'Progress & Goals',
      description: 'Track your improvement and achieve your objectives',
      color: 'from-orange-500 to-red-500',
      icon: TrendingUp,
      tutorials: [
        {
          title: 'Setting SMART Goals',
          description: 'Create specific, measurable, achievable goals that accelerate improvement',
          duration: '7:00',
          difficulty: 'Beginner',
          views: '8.7k',
          thumbnail: 'https://cdn.abacus.ai/images/adc91d42-bb2a-41bf-82d8-653020294f19.png',
          videoUrl: '/tutorial-goal-setting'
        },
        {
          title: 'Match Logging Best Practices',
          description: 'How to record matches for maximum insight and progress tracking',
          duration: '4:45',
          difficulty: 'Beginner',
          views: '6.3k',
          thumbnail: 'https://cdn.abacus.ai/images/adc91d42-bb2a-41bf-82d8-653020294f19.png',
          videoUrl: '/tutorial-match-logging'
        },
        {
          title: 'Understanding Your Analytics',
          description: 'Deep dive into your performance metrics and what they mean',
          duration: '9:10',
          difficulty: 'Intermediate',
          views: '5.9k',
          thumbnail: 'https://cdn.abacus.ai/images/adc91d42-bb2a-41bf-82d8-653020294f19.png',
          videoUrl: '/tutorial-analytics'
        }
      ]
    }
  ]

  const featuredTutorials = tutorialCategories
    .flatMap(category => category.tutorials)
    .filter(tutorial => tutorial.featured)

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
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-lg opacity-20" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                <Video className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-light text-gray-900 mb-4">
              Video <span className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Tutorials</span>
            </h1>
            <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto mb-8">
              Step-by-step video guides to help you master every feature of Mindful Champion and accelerate your pickleball improvement.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Badge className="bg-purple-50 text-purple-700 border-purple-200 px-4 py-2">
                12 Tutorials
              </Badge>
              <Badge className="bg-pink-50 text-pink-700 border-pink-200 px-4 py-2">
                HD Quality
              </Badge>
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 px-4 py-2">
                Expert Tips
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Featured Tutorials */}
        {featuredTutorials.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-light text-gray-900 mb-8 text-center">Featured Tutorials</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredTutorials.map((tutorial, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * idx }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="relative overflow-hidden border-0 shadow-2xl backdrop-blur-sm bg-white/90 hover:shadow-3xl transition-all duration-300 group">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                    
                    <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg overflow-hidden">
                      <img 
                        src={tutorial.thumbnail} 
                        alt={tutorial.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-7 h-7 text-purple-600 ml-1" />
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className="bg-purple-50 text-purple-700 border-purple-200">
                          {tutorial.difficulty}
                        </Badge>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {tutorial.duration}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {tutorial.views}
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-xl mb-2 text-gray-900 group-hover:text-purple-700 transition-colors">
                        {tutorial.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">
                        {tutorial.description}
                      </p>
                      
                      <Button 
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-purple-500/30"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Watch Tutorial
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tutorial Categories */}
        <div className="space-y-12">
          {tutorialCategories.map((category, idx) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 * idx }}
            >
              <Card className="relative overflow-hidden border-0 shadow-2xl backdrop-blur-sm bg-white/80">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${category.color}`} />
                
                <CardHeader className="pb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${category.color} rounded-xl blur-sm opacity-30`} />
                      <div className={`relative bg-gradient-to-br ${category.color} p-3 rounded-xl shadow-lg`}>
                        <category.icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-light text-gray-900">{category.title}</CardTitle>
                      <p className="text-gray-600 mt-1">{category.description}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {category.tutorials.map((tutorial, tutorialIdx) => (
                      <motion.div
                        key={tutorialIdx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.05 * tutorialIdx }}
                        whileHover={{ scale: 1.02 }}
                      >
                        <Card className="h-full border border-gray-200 hover:border-teal-300 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50 group">
                          <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg overflow-hidden">
                            <img 
                              src={tutorial.thumbnail} 
                              alt={tutorial.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Play className="w-5 h-5 text-teal-600 ml-0.5" />
                              </div>
                            </div>
                          </div>

                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <Badge variant="outline" className="text-xs">
                                {tutorial.difficulty}
                              </Badge>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {tutorial.duration}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {tutorial.views}
                                </div>
                              </div>
                            </div>
                            
                            <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-teal-700 transition-colors line-clamp-2">
                              {tutorial.title}
                            </h4>
                            <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">
                              {tutorial.description}
                            </p>
                            
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700"
                            >
                              <Play className="mr-2 h-3 w-3" />
                              Watch Now
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16"
        >
          <Card className="border-0 shadow-2xl backdrop-blur-sm bg-gradient-to-br from-teal-50/80 to-emerald-50/80 text-center">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500" />
            
            <CardContent className="p-12">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full blur opacity-30" />
                <div className="relative bg-white p-4 rounded-full shadow-lg">
                  <BookOpen className="w-10 h-10 text-teal-600" />
                </div>
              </div>
              
              <h3 className="text-3xl font-light text-gray-900 mb-4">Ready to Start Learning?</h3>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
                Begin with our featured tutorials or dive into the specific areas where you want to improve. Each video is designed to get you results fast.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/ai-coach">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-lg hover:shadow-teal-500/30"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Ask Coach Kai
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                
                <Link href="/help">
                  <Button 
                    size="lg"
                    variant="outline" 
                    className="border-teal-300 text-teal-700 hover:bg-teal-50 hover:border-teal-400"
                  >
                    More Help Resources
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
