
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Calendar,
  Zap,
  Timer,
  Award,
  BarChart3
} from "lucide-react"

interface PerformanceCardsProps {
  user: any
}

export default function PerformanceCards({ user }: PerformanceCardsProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Calculate win rate safely on client side only
  const winRate = mounted && user?.totalMatches ? ((user?.totalWins || 0) / user.totalMatches * 100) : 0
  
  // Calculate improvement based on recent trend (deterministic, no Math.random)
  const recentWinRate = mounted && user?.recentWins && user?.recentMatches 
    ? (user.recentWins / user.recentMatches * 100) 
    : winRate
  const improvementRate = mounted ? Math.min(95, Math.max(0, recentWinRate)) : 0
  
  const performanceCards = [
    {
      title: "Win Rate",
      value: `${winRate.toFixed(1)}%`,
      description: `${user?.totalWins || 0} wins out of ${user?.totalMatches || 0} matches`,
      progress: winRate,
      icon: Trophy,
      gradient: winRate >= 60 ? "from-green-500 to-emerald-500" : winRate >= 40 ? "from-yellow-500 to-orange-500" : "from-red-500 to-rose-500",
      trend: winRate >= 50 ? "up" : "stable"
    },
    {
      title: "Total Matches",
      value: user?.totalMatches || 0,
      description: "Games played this season",
      progress: Math.min(100, (user?.totalMatches || 0) * 2),
      icon: Target,
      gradient: "from-blue-500 to-cyan-500",
      trend: "up"
    },
    {
      title: "Improvement Rate",
      value: `${improvementRate.toFixed(0)}%`,
      description: "Performance growth this month",
      progress: improvementRate,
      icon: TrendingUp,
      gradient: "from-purple-500 to-pink-500",
      trend: "up"
    },
    {
      title: "Active Streak",
      value: `${user?.currentStreak || 0} days`,
      description: "Consecutive days of training",
      progress: Math.min(100, (user?.currentStreak || 0) * 10),
      icon: Zap,
      gradient: "from-orange-500 to-red-500",
      trend: user?.currentStreak > 5 ? "up" : "stable"
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {performanceCards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -2 }}
        >
          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-5`} />
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient}`} />
            
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {card.title}
              </CardTitle>
              <div className={`w-8 h-8 bg-gradient-to-br ${card.gradient} rounded-lg flex items-center justify-center`}>
                <card.icon className="w-4 h-4 text-white" />
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="flex items-baseline justify-between mb-2">
                <div className="text-2xl font-bold text-slate-900">
                  {card.value}
                </div>
                {card.trend === "up" && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Trending up
                  </Badge>
                )}
              </div>
              
              <p className="text-xs text-slate-600 mb-3">
                {card.description}
              </p>
              
              <Progress 
                value={card.progress} 
                className="h-2 mb-2"
              />
              
              <div className="flex justify-between text-xs text-slate-500">
                <span>Progress</span>
                <span>{card.progress.toFixed(0)}%</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
