// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import MainNavigation from '@/components/navigation/main-navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Trophy, Star, Crown, Gift, TrendingUp, Target,
  Flame, Sparkles, Award, Gem, ChevronRight, CheckCircle,
  ShoppingBag, Zap, Heart, Tag, Package, ArrowRight,
  Lock, Medal, Users, Video
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface UserStats {
  totalPoints: number
  totalAchievements: number
  bronzeMedals: number
  silverMedals: number
  goldMedals: number
  rewardPoints: number
  currentStreak: number
}

// Vibrant marketplace rewards with partner branding
const featuredRewards = [
  {
    id: '1',
    name: 'Premium Pickleball 6-Pack',
    brand: 'Franklin Sports',
    description: 'Tournament-grade indoor/outdoor balls used by the pros',
    points: 500,
    retailValue: 24.99,
    image: 'https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=600&q=80',
    category: 'Equipment',
    inStock: true,
    hot: true
  },
  {
    id: '2',
    name: 'Pro Overgrip 3-Pack',
    brand: 'Selkirk',
    description: 'Maximum tackiness and sweat absorption',
    points: 350,
    retailValue: 14.99,
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&q=80',
    category: 'Accessories',
    inStock: true
  },
  {
    id: '3',
    name: 'Performance Wristbands',
    brand: 'Nike',
    description: 'Moisture-wicking comfort during intense play',
    points: 400,
    retailValue: 18.00,
    image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600&q=80',
    category: 'Apparel',
    inStock: true
  },
  {
    id: '4',
    name: 'Pickleball Sling Bag',
    brand: 'HEAD',
    description: 'Stylish bag fits 2 paddles + accessories',
    points: 1200,
    retailValue: 49.99,
    image: 'https://images.unsplash.com/photo-1622260614153-03223fb72052?w=600&q=80',
    category: 'Bags',
    inStock: true,
    popular: true
  },
  {
    id: '5',
    name: 'Cooling Towel Set',
    brand: 'Mission',
    description: 'Instant cooling technology for hot court days',
    points: 600,
    retailValue: 29.99,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
    category: 'Accessories',
    inStock: true
  },
  {
    id: '6',
    name: '1-Hour Pro Coaching',
    brand: 'Mindful Champion',
    description: 'Private session with a certified coach',
    points: 3000,
    retailValue: 150.00,
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80',
    category: 'Experiences',
    inStock: true,
    premium: true
  }
]

const categories = [
  { id: 'all', name: 'All Rewards', icon: Gift, count: 6 },
  { id: 'equipment', name: 'Equipment', icon: Target, count: 1 },
  { id: 'accessories', name: 'Accessories', icon: Sparkles, count: 2 },
  { id: 'apparel', name: 'Apparel', icon: ShoppingBag, count: 1 },
  { id: 'experiences', name: 'Experiences', icon: Star, count: 1 },
]

export default function RewardsMarketplace() {
  const { data: session, status } = useSession() || {}
  const [stats, setStats] = useState<UserStats | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [hoveredReward, setHoveredReward] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status])

  const fetchData = async () => {
    try {
      const [userRes, statsRes] = await Promise.all([
        fetch('/api/user/update'),
        fetch('/api/achievements/user')
      ])
      if (userRes.ok) {
        const data = await userRes.json()
        setUser(data.user)
      }
      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data.stats)
      }
    } catch (e) {
      console.error('Error:', e)
    } finally {
      setLoading(false)
    }
  }

  const userPoints = stats?.rewardPoints || user?.rewardPoints || 0

  const filteredRewards = activeCategory === 'all' 
    ? featuredRewards 
    : featuredRewards.filter(r => r.category.toLowerCase() === activeCategory)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
        <div className="flex items-center justify-center h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <MainNavigation user={user} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-12">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-400/20 rounded-full blur-[100px]" />
          <div className="absolute top-40 right-20 w-96 h-96 bg-purple-400/15 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-400/10 rounded-full blur-[100px]" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <Badge className="mb-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 px-4 py-1.5 text-sm">
              <Gift className="w-4 h-4 mr-2" />
              Rewards Marketplace
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-600 via-purple-600 to-amber-500 bg-clip-text text-transparent">
                Turn Your Achievements Into Rewards
              </span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              You've earned it! Redeem your hard-won points for premium pickleball gear, 
              exclusive experiences, and partner products.
            </p>
          </motion.div>

          {/* Points Balance Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="max-w-md mx-auto"
          >
            <Card className="bg-white/80 backdrop-blur-xl border-2 border-amber-200 shadow-xl shadow-amber-500/10 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-transparent to-orange-500/5" />
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Your Balance</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                        {userPoints.toLocaleString()}
                      </span>
                      <span className="text-slate-500 text-lg">points</span>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30"
                  >
                    <Star className="w-8 h-8 text-white" />
                  </motion.div>
                </div>
                <div className="mt-4 flex items-center gap-4 text-sm">
                  <Link href="/train" className="flex items-center gap-1 text-cyan-600 hover:text-cyan-700 transition-colors">
                    <Zap className="w-4 h-4" /> Earn More
                  </Link>
                  <span className="text-slate-300">•</span>
                  <Link href="/progress/achievements" className="flex items-center gap-1 text-purple-600 hover:text-purple-700 transition-colors">
                    <Trophy className="w-4 h-4" /> Achievements
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all",
                activeCategory === cat.id
                  ? "bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-cyan-500/25"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              )}
            >
              <cat.icon className="w-4 h-4" />
              {cat.name}
            </button>
          ))}
        </motion.div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredRewards.map((reward, index) => {
              const canAfford = userPoints >= reward.points
              const isHovered = hoveredReward === reward.id
              
              return (
                <motion.div
                  key={reward.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  onMouseEnter={() => setHoveredReward(reward.id)}
                  onMouseLeave={() => setHoveredReward(null)}
                  className="group"
                >
                  <Card className={cn(
                    "relative overflow-hidden bg-white border-2 transition-all duration-300",
                    isHovered ? "border-cyan-400 shadow-2xl shadow-cyan-500/20 -translate-y-2" : "border-slate-100 shadow-lg",
                    reward.premium && "ring-2 ring-amber-400/50"
                  )}>
                    {/* Badges */}
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                      {reward.hot && (
                        <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0">
                          <Flame className="w-3 h-3 mr-1" /> Hot
                        </Badge>
                      )}
                      {reward.popular && (
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                          <Heart className="w-3 h-3 mr-1" /> Popular
                        </Badge>
                      )}
                      {reward.premium && (
                        <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0">
                          <Crown className="w-3 h-3 mr-1" /> Premium
                        </Badge>
                      )}
                    </div>
                    
                    {/* Points Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <div className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1",
                        canAfford 
                          ? "bg-emerald-500 text-white" 
                          : "bg-slate-800 text-white"
                      )}>
                        <Star className="w-3.5 h-3.5" />
                        {reward.points.toLocaleString()}
                      </div>
                    </div>

                    {/* Image */}
                    <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
                      <Image
                        src={reward.image}
                        alt={reward.name}
                        fill
                        className={cn(
                          "object-cover transition-transform duration-500",
                          isHovered && "scale-110"
                        )}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    </div>

                    {/* Content */}
                    <CardContent className="p-5">
                      {/* Brand */}
                      <p className="text-xs font-semibold text-cyan-600 uppercase tracking-wider mb-1">
                        {reward.brand}
                      </p>
                      
                      {/* Name */}
                      <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-cyan-700 transition-colors">
                        {reward.name}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                        {reward.description}
                      </p>

                      {/* Value & Action */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-400">Retail Value</p>
                          <p className="text-lg font-bold text-slate-700">${reward.retailValue.toFixed(2)}</p>
                        </div>
                        
                        {canAfford ? (
                          <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white shadow-lg shadow-cyan-500/25">
                            Redeem <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        ) : (
                          <div className="text-right">
                            <p className="text-xs text-slate-400">Need</p>
                            <p className="text-sm font-semibold text-slate-600">
                              {(reward.points - userPoints).toLocaleString()} more
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Partner Sponsors Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Our Partner Sponsors</h2>
            <p className="text-slate-500">Amazing brands that make these rewards possible</p>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 py-6 px-8 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200">
            {['Franklin Sports', 'Selkirk', 'Nike', 'HEAD', 'Mission'].map((brand, i) => (
              <motion.div
                key={brand}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="px-6 py-3 text-slate-400 font-semibold text-lg hover:text-cyan-600 transition-colors cursor-pointer"
              >
                {brand}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16"
        >
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">How to Earn Points</h2>
            <p className="text-slate-500">Every action on your pickleball journey earns you rewards</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Target, action: 'Complete Training', points: '+10-50', color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50' },
              { icon: Video, action: 'Video Analysis', points: '+25', color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50' },
              { icon: Flame, action: 'Daily Streak', points: '+5/day', color: 'from-orange-500 to-amber-500', bg: 'bg-orange-50' },
              { icon: Medal, action: 'Achievements', points: '+50-500', color: 'from-purple-500 to-pink-500', bg: 'bg-purple-50' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className={cn(
                  "p-6 rounded-2xl text-center transition-all",
                  item.bg, "border border-slate-100"
                )}
              >
                <div className={cn(
                  "w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br flex items-center justify-center",
                  item.color
                )}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <p className="font-semibold text-slate-800 mb-1">{item.action}</p>
                <p className={cn(
                  "text-lg font-bold bg-gradient-to-r bg-clip-text text-transparent",
                  item.color
                )}>
                  {item.points} pts
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-16 text-center"
        >
          <Card className="bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 border-0 p-8 text-white">
            <h2 className="text-2xl font-bold mb-3">Ready to Earn More?</h2>
            <p className="text-white/80 mb-6 max-w-lg mx-auto">
              Start your next training session and watch your points grow. 
              The more you train, the more you earn!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/train">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 shadow-lg">
                  <Zap className="w-5 h-5 mr-2" /> Start Training
                </Button>
              </Link>
              <Link href="/progress/achievements">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/20">
                  <Trophy className="w-5 h-5 mr-2" /> View Achievements
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </section>
    </div>
  )
}
