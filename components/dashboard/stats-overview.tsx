
"use client"

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Trophy,
  Flame,
  Star
} from 'lucide-react'

interface StatItem {
  label: string
  value: number
  trend?: number
  icon: React.ComponentType<any>
  gradient: string
  format?: 'number' | 'percentage' | 'days'
}

interface StatsOverviewProps {
  stats: {
    trainingSessions: { count: number; trend: number }
    achievements: { count: number; trend: number }
    rewardPoints: { count: number; trend: number }
    dayStreak: { count: number; trend: number }
  }
  className?: string
}

const formatValue = (value: number, format: string = 'number') => {
  switch (format) {
    case 'percentage':
      return `${value}%`
    case 'days':
      return `${value}`
    default:
      return value.toLocaleString()
  }
}

export default function StatsOverview({ stats, className }: StatsOverviewProps) {
  const statItems: StatItem[] = [
    {
      label: 'Training Sessions',
      value: stats.trainingSessions.count,
      trend: stats.trainingSessions.trend,
      icon: Activity,
      gradient: 'from-green-500 to-emerald-600',
    },
    {
      label: 'Achievements',
      value: stats.achievements.count,
      trend: stats.achievements.trend,
      icon: Trophy,
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      label: 'Reward Points',
      value: stats.rewardPoints.count,
      trend: stats.rewardPoints.trend,
      icon: Star,
      gradient: 'from-blue-500 to-cyan-600',
    },
    {
      label: 'Day Streak',
      value: stats.dayStreak.count,
      trend: stats.dayStreak.trend,
      icon: Flame,
      gradient: 'from-orange-500 to-red-600',
      format: 'days'
    },
  ]

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mx-auto max-w-7xl", className)}>
      {statItems.map((stat, index) => {
        const Icon = stat.icon

        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.03, y: -5 }}
          >
            <Card className="relative overflow-hidden border-0 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer">
              {/* Top accent bar - like admin dashboard */}
              <div className={cn("absolute top-0 left-0 right-0 h-2 bg-gradient-to-r pointer-events-none", stat.gradient)} />
              
              {/* Subtle gradient background overlay */}
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none", stat.gradient)} />
              
              <CardContent className="p-5 relative">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{stat.label}</p>
                    <div className="flex items-baseline gap-2 mb-2">
                      <p className="text-3xl font-black text-slate-900">
                        {formatValue(stat.value, stat.format)}
                      </p>
                      {stat.format === 'days' && (
                        <span className="text-sm font-medium text-slate-600">days</span>
                      )}
                    </div>
                    
                    {/* Trend indicator - only show if value > 0 AND trend exists */}
                    {stat.value > 0 && stat.trend !== undefined && stat.trend !== 0 && (
                      <div className="flex items-center gap-1.5">
                        {stat.trend > 0 ? (
                          <>
                            <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                            <span className="text-xs font-bold text-green-600">+{stat.trend}%</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                            <span className="text-xs font-bold text-red-600">{stat.trend}%</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Icon with gradient - like admin dashboard */}
                  <motion.div 
                    className={cn("w-14 h-14 bg-gradient-to-br rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all", stat.gradient)}
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Icon className="w-7 h-7 text-white drop-shadow-lg" />
                  </motion.div>
                </div>

                {/* Progress bar at bottom */}
                <div className="mt-4 h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                  <motion.div 
                    className={cn("h-full bg-gradient-to-r rounded-full", stat.gradient)}
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
