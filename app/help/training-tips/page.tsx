
'use client'

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { 
  Lightbulb, 
  ArrowRight, 
  Target,
  Trophy,
  Users,
  Clock,
  ArrowLeft,
  BookOpen,
  TrendingUp,
  MessageCircle,
  Star,
  Heart,
  Brain,
  Zap,
  Shield,
  CheckCircle,
  ThumbsUp
} from "lucide-react"
import MainNavigation from "@/components/navigation/main-navigation"
import Link from "next/link"
import { motion } from "framer-motion"

export default function TrainingTipsPage() {
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

  const tipCategories = [
    {
      id: 'fundamentals',
      title: 'Fundamentals & Technique',
      description: 'Master the core skills that make great players',
      color: 'from-teal-500 to-emerald-500',
      icon: Target,
      tips: [
        {
          title: 'Perfect Your Ready Position',
          content: 'Stand with feet shoulder-width apart, knees slightly bent, paddle up and out front. This athletic position allows you to move quickly in any direction and react faster to your opponent\'s shots.',
          difficulty: 'Beginner',
          readTime: '2 min',
          author: 'Coach Sarah',
          featured: true
        },
        {
          title: 'The Art of the Soft Game',
          content: 'Master dinking by keeping your paddle face open and making contact below the waist. Focus on placement over power - aim for your opponent\'s feet or just over the net to force difficult returns.',
          difficulty: 'Intermediate',
          readTime: '3 min',
          author: 'Pro Player Mike'
        },
        {
          title: 'Third Shot Drop Mastery',
          content: 'The key to a successful third shot drop is the follow-through. Keep your paddle moving low to high, and aim for the kitchen line. Practice hitting from different positions on the court.',
          difficulty: 'Advanced',
          readTime: '4 min',
          author: 'Coach Alex'
        }
      ]
    },
    {
      id: 'strategy',
      title: 'Strategy & Game IQ',
      description: 'Think smarter, not harder on the court',
      color: 'from-purple-500 to-pink-500',
      icon: Brain,
      tips: [
        {
          title: 'Court Positioning Fundamentals',
          content: 'Always move as a team. When your partner moves forward, you move forward. When they move back, you move back. Maintain parallel positioning to cover the court effectively and avoid being split.',
          difficulty: 'Intermediate',
          readTime: '3 min',
          author: 'Strategy Expert Lisa',
          featured: true
        },
        {
          title: 'Reading Your Opponent',
          content: 'Watch your opponent\'s paddle face and body language. Early preparation and consistent patterns often reveal their next shot. Use this information to anticipate and position yourself advantageously.',
          difficulty: 'Advanced',
          readTime: '4 min',
          author: 'Mental Game Coach Tom'
        },
        {
          title: 'When to Attack vs Defend',
          content: 'Attack when balls are hit high and you\'re in good position. Defend when you\'re out of position or the ball is low. Patience wins more points than aggression - wait for the right opportunity.',
          difficulty: 'Intermediate',
          readTime: '3 min',
          author: 'Tournament Pro Emma'
        }
      ]
    },
    {
      id: 'mental-game',
      title: 'Mental Game & Focus',
      description: 'Develop the champion mindset',
      color: 'from-blue-500 to-indigo-500',
      icon: Heart,
      tips: [
        {
          title: 'Managing Match Pressure',
          content: 'Use breathing techniques between points. Take 3 deep breaths and visualize your next shot. Focus on process (technique and positioning) rather than outcome (winning or losing the point).',
          difficulty: 'Intermediate',
          readTime: '4 min',
          author: 'Sports Psychologist Dr. Chen'
        },
        {
          title: 'Staying Focused Under Pressure',
          content: 'Develop pre-shot routines. Bounce the ball the same number of times, take the same breathing pattern. Consistency in routine creates consistency in performance, especially in crucial moments.',
          difficulty: 'Advanced',
          readTime: '5 min',
          author: 'Mental Performance Coach Rachel',
          featured: true
        },
        {
          title: 'Learning from Losses',
          content: 'After each match, identify 2-3 specific things that went well and 1-2 areas for improvement. Focus on process improvements rather than dwelling on mistakes. Every loss is a learning opportunity.',
          difficulty: 'Beginner',
          readTime: '2 min',
          author: 'Mindful Champion Team'
        }
      ]
    },
    {
      id: 'practice',
      title: 'Practice & Improvement',
      description: 'Train smarter to get better faster',
      color: 'from-orange-500 to-red-500',
      icon: TrendingUp,
      tips: [
        {
          title: 'Quality Over Quantity',
          content: '30 minutes of focused, deliberate practice beats 2 hours of mindless hitting. Set specific goals for each session and track your progress. Practice with purpose, not just for time.',
          difficulty: 'Beginner',
          readTime: '3 min',
          author: 'Training Specialist Mark'
        },
        {
          title: 'Building Muscle Memory',
          content: 'Repeat the same motion slowly and correctly 100 times before speeding up. Your brain needs consistent repetition to automate movements. Start slow, focus on form, then gradually increase pace.',
          difficulty: 'Intermediate',
          readTime: '4 min',
          author: 'Technique Coach Jennifer',
          featured: true
        },
        {
          title: 'Recovery and Injury Prevention',
          content: 'Stretch for 10 minutes after every session, focusing on shoulders, wrists, and calves. Hydrate well and listen to your body. Small discomforts addressed early prevent major injuries later.',
          difficulty: 'Beginner',
          readTime: '3 min',
          author: 'Physical Therapist Dr. Kim'
        }
      ]
    }
  ]

  const featuredTips = tipCategories
    .flatMap(category => category.tips)
    .filter(tip => tip.featured)

  const quickTips = [
    {
      icon: Zap,
      tip: "Keep your paddle up and ready between shots - it saves precious milliseconds in reaction time.",
      category: "Fundamentals"
    },
    {
      icon: Target,
      tip: "Aim for your opponent's feet when dinking - it's the most difficult position to return from.",
      category: "Strategy"
    },
    {
      icon: Brain,
      tip: "Change the pace occasionally - mixing up shot speed keeps opponents off balance.",
      category: "Strategy"
    },
    {
      icon: Heart,
      tip: "Celebrate small wins during matches - positive self-talk improves performance.",
      category: "Mental Game"
    },
    {
      icon: Shield,
      tip: "Practice shadow swings at home - 5 minutes daily builds muscle memory without a court.",
      category: "Practice"
    },
    {
      icon: Clock,
      tip: "Warm up for 5-10 minutes before playing - cold muscles are injury-prone muscles.",
      category: "Injury Prevention"
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
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-full blur-lg opacity-20" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-orange-600 to-red-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                <Lightbulb className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-light text-gray-900 mb-4">
              Training <span className="font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Tips</span>
            </h1>
            <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto mb-8">
              Expert insights and proven strategies from top coaches and players. Accelerate your improvement with these professional tips and techniques.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Badge className="bg-orange-50 text-orange-700 border-orange-200 px-4 py-2">
                Expert Insights
              </Badge>
              <Badge className="bg-red-50 text-red-700 border-red-200 px-4 py-2">
                Proven Strategies
              </Badge>
              <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 px-4 py-2">
                Quick Wins
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Quick Tips Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16"
        >
          <Card className="border-0 shadow-xl backdrop-blur-sm bg-gradient-to-r from-yellow-50/80 to-orange-50/80">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 to-orange-500" />
            
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-light text-gray-900">Quick Tips</CardTitle>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickTips.map((tip, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * idx }}
                    className="flex items-start gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-yellow-200/50 hover:bg-white/80 transition-colors"
                  >
                    <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-lg flex-shrink-0">
                      <tip.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-800 leading-relaxed">{tip.tip}</p>
                      <Badge variant="outline" className="mt-2 text-xs">
                        {tip.category}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Featured Tips */}
        {featuredTips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-light text-gray-900 mb-8 text-center">Featured Expert Tips</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {featuredTips.map((tip, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * idx }}
                  whileHover={{ y: -3 }}
                >
                  <Card className="relative overflow-hidden border-0 shadow-2xl backdrop-blur-sm bg-white/90 hover:shadow-3xl transition-all duration-300 h-full">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500" />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-0">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    </div>
                    
                    <CardContent className="p-8">
                      <div className="flex items-center justify-between mb-4">
                        <Badge className="bg-teal-50 text-teal-700 border-teal-200">
                          {tip.difficulty}
                        </Badge>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {tip.readTime}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {tip.author}
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-2xl mb-4 text-gray-900">
                        {tip.title}
                      </h3>
                      <p className="text-gray-700 leading-relaxed text-lg">
                        {tip.content}
                      </p>
                      
                      <div className="flex items-center gap-3 mt-6">
                        <Button size="sm" className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700">
                          <ThumbsUp className="mr-2 h-4 w-4" />
                          Helpful
                        </Button>
                        <Button size="sm" variant="outline">
                          <BookOpen className="mr-2 h-4 w-4" />
                          Save Tip
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tip Categories */}
        <div className="space-y-12">
          {tipCategories.map((category, idx) => (
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
                  <div className="space-y-6">
                    {category.tips.map((tip, tipIdx) => (
                      <motion.div
                        key={tipIdx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * tipIdx }}
                        className="group"
                      >
                        <Card className="border border-gray-200 hover:border-teal-300 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-4 mb-3">
                                  <h4 className="font-semibold text-xl text-gray-900 group-hover:text-teal-700 transition-colors">
                                    {tip.title}
                                  </h4>
                                  {tip.featured && (
                                    <Badge className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-0 text-xs">
                                      Featured
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                  {tip.content}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <Badge variant="outline" className="text-xs">
                                  {tip.difficulty}
                                </Badge>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {tip.readTime}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {tip.author}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" className="hover:bg-teal-50 hover:border-teal-300">
                                  <ThumbsUp className="mr-2 h-3 w-3" />
                                  Helpful
                                </Button>
                                <Button size="sm" variant="outline" className="hover:bg-gray-50">
                                  <BookOpen className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
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
                  <Trophy className="w-10 h-10 text-teal-600" />
                </div>
              </div>
              
              <h3 className="text-3xl font-light text-gray-900 mb-4">Ready to Implement These Tips?</h3>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
                The best tip is worthless without practice. Start applying these strategies in your next session and watch your game improve rapidly.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/train">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-lg hover:shadow-teal-500/30"
                  >
                    <Target className="mr-2 h-5 w-5" />
                    Start Training
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                
                <Link href="/ai-coach">
                  <Button 
                    size="lg"
                    variant="outline" 
                    className="border-teal-300 text-teal-700 hover:bg-teal-50 hover:border-teal-400"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Ask Coach Kai
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
