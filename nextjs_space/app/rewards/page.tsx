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
      <div className="min-h-screen bg-[#0a0a0a]">
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
    <div className="min-h-screen bg-[#0a0a0a]">
      <MainNavigation user={user} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-12">
        {/* Background Glow Effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px]" />
          <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-1/2 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px]" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border border-cyan-500/30 mb-6"
            >
              <Gift className="w-5 h-5 text-cyan-400" />
              <span className="text-cyan-300 font-medium">Rewards Marketplace</span>
              <Sparkles className="w-4 h-4 text-teal-400" />
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-5">
              <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
                Earn & Redeem
              </span>
              <br />
              <span className="text-white">Awesome Rewards</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Turn your training achievements into premium pickleball gear, exclusive experiences, and partner products.
            </p>
          </motion.div>

          {/* Points Balance Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-lg mx-auto"
          >
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
              
              <Card className="relative bg-slate-900/90 backdrop-blur-xl border border-slate-700/50 overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-teal-500/5" />
                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm mb-1 flex items-center gap-2">
                        <Star className="w-4 h-4 text-cyan-500" />
                        Your Point Balance
                      </p>
                      <div className="flex items-baseline gap-3">
                        <motion.span 
                          key={userPoints}
                          initial={{ scale: 1.2 }}
                          animate={{ scale: 1 }}
                          className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent"
                        >
                          {userPoints.toLocaleString()}
                        </motion.span>
                        <span className="text-slate-500 text-lg">pts</span>
                      </div>
                    </div>
                    <motion.div
                      animate={{ 
                        boxShadow: ['0 0 20px rgba(20,184,166,0.3)', '0 0 40px rgba(20,184,166,0.5)', '0 0 20px rgba(20,184,166,0.3)']
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center"
                    >
                      <Trophy className="w-10 h-10 text-white" />
                    </motion.div>
                  </div>
                  <div className="mt-5 flex items-center gap-4">
                    <Link href="/train" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all text-sm font-medium">
                      <Zap className="w-4 h-4" /> Earn More
                    </Link>
                    <Link href="/rewards/my-redemptions" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 transition-all text-sm font-medium">
                      <Package className="w-4 h-4" /> My Redemptions
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300",
                activeCategory === cat.id
                  ? "bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-500/30"
                  : "bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800"
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  onMouseEnter={() => setHoveredReward(reward.id)}
                  onMouseLeave={() => setHoveredReward(null)}
                  className="group relative"
                >
                  {/* Card Glow */}
                  <div className={cn(
                    "absolute -inset-0.5 rounded-2xl transition-all duration-500",
                    isHovered 
                      ? "bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 opacity-50 blur-sm" 
                      : "opacity-0"
                  )} />
                  
                  <Card className={cn(
                    "relative overflow-hidden bg-slate-900/90 border transition-all duration-300 rounded-xl",
                    isHovered ? "border-cyan-500/50" : "border-slate-800",
                    reward.premium && "ring-1 ring-amber-500/30"
                  )}>
                    {/* Badges */}
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                      {reward.hot && (
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg shadow-orange-500/30">
                          <Flame className="w-3 h-3 mr-1" /> Hot
                        </Badge>
                      )}
                      {reward.popular && (
                        <Badge className="bg-gradient-to-r from-pink-500 to-purple-500 text-white border-0 shadow-lg shadow-pink-500/30">
                          <Heart className="w-3 h-3 mr-1" /> Popular
                        </Badge>
                      )}
                      {reward.premium && (
                        <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black border-0 shadow-lg shadow-amber-500/30">
                          <Crown className="w-3 h-3 mr-1" /> Premium
                        </Badge>
                      )}
                    </div>
                    
                    {/* Points Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <motion.div 
                        animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-lg",
                          canAfford 
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/30" 
                            : "bg-slate-800 text-cyan-400 border border-cyan-500/30"
                        )}
                      >
                        <Star className="w-3.5 h-3.5" />
                        {reward.points.toLocaleString()}
                      </motion.div>
                    </div>

                    {/* Image */}
                    <div className="relative h-52 bg-slate-800 overflow-hidden">
                      <Image
                        src={reward.image}
                        alt={reward.name}
                        fill
                        className={cn(
                          "object-cover transition-all duration-500",
                          isHovered && "scale-110 brightness-110"
                        )}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
                    </div>

                    {/* Content */}
                    <CardContent className="p-5">
                      {/* Brand */}
                      <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
                        {reward.brand}
                      </p>
                      
                      {/* Name */}
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                        {reward.name}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-slate-400 text-sm mb-5 line-clamp-2">
                        {reward.description}
                      </p>

                      {/* Value & Action */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-500">Retail Value</p>
                          <p className="text-xl font-bold text-white">${reward.retailValue.toFixed(2)}</p>
                        </div>
                        
                        {canAfford ? (
                          <Button className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white shadow-lg shadow-cyan-500/25 border-0">
                            Redeem <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        ) : (
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Need</p>
                            <p className="text-sm font-semibold text-cyan-400">
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

        {/* How to Earn Points */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-20"
        >
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">How to Earn Points</h2>
            <p className="text-slate-400">Every action on your pickleball journey earns rewards</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Target, action: 'Complete Training', points: '+10-50', gradient: 'from-emerald-500 to-teal-500' },
              { icon: Video, action: 'Video Analysis', points: '+25', gradient: 'from-cyan-500 to-blue-500' },
              { icon: Flame, action: 'Daily Streak', points: '+5/day', gradient: 'from-orange-500 to-amber-500' },
              { icon: Medal, action: 'Achievements', points: '+50-500', gradient: 'from-purple-500 to-pink-500' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group relative"
              >
                <div className={cn(
                  "absolute -inset-0.5 rounded-2xl bg-gradient-to-r opacity-0 group-hover:opacity-50 blur-sm transition-opacity",
                  item.gradient
                )} />
                <div className="relative p-6 rounded-2xl bg-slate-900/80 border border-slate-800 group-hover:border-slate-700 transition-all text-center">
                  <div className={cn(
                    "w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                    item.gradient
                  )}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <p className="font-semibold text-white mb-1">{item.action}</p>
                  <p className={cn(
                    "text-lg font-bold bg-gradient-to-r bg-clip-text text-transparent",
                    item.gradient
                  )}>
                    {item.points} pts
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Partner Sponsors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-20"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Our Partner Sponsors</h2>
            <p className="text-slate-400">Amazing brands that make these rewards possible</p>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 py-8 px-8 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800">
            {['Franklin Sports', 'Selkirk', 'Nike', 'HEAD', 'Mission'].map((brand, i) => (
              <motion.div
                key={brand}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                whileHover={{ scale: 1.1 }}
                className="px-6 py-3 text-slate-500 font-semibold text-lg hover:text-cyan-400 transition-colors cursor-pointer"
              >
                {brand}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-20"
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
            <Card className="relative bg-slate-900/90 border border-slate-700/50 p-10 text-center rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-teal-500/10" />
              <div className="relative">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/30"
                >
                  <Zap className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-3">Ready to Earn More?</h2>
                <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                  Start your next training session and watch your points grow. The more you train, the more you earn!
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/train">
                    <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white shadow-lg shadow-cyan-500/30 px-8">
                      <Zap className="w-5 h-5 mr-2" /> Start Training
                    </Button>
                  </Link>
                  <Link href="/progress/achievements">
                    <Button size="lg" variant="outline" className="border-2 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 px-8">
                      <Trophy className="w-5 h-5 mr-2" /> View Achievements
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
