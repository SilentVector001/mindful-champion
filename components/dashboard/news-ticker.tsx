
"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Play,
  Trophy,
  Users,
  TrendingUp,
  Radio,
  Calendar,
  ExternalLink,
  ChevronRight,
  Zap,
  Video,
  Podcast,
  MapPin,
  DollarSign,
  Sparkles,
  Clock
} from 'lucide-react'

interface NewsItem {
  id: string
  type: 'tournament' | 'stream' | 'podcast' | 'score' | 'community' | 'training'
  title: string
  subtitle: string
  priority: 'urgent' | 'high' | 'medium' | 'low'
  link: string
  icon: string
  status?: string
  viewers?: number
  daysUntil?: number
  activeMatches?: number
  timeAgo?: number
}

interface NewsTickerProps {
  className?: string
}

export default function NewsTicker({ className }: NewsTickerProps) {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const router = useRouter()

  // Fetch news data
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/dashboard/news-ticker')
        const data = await response.json()
        if (data.success) {
          setNewsItems(data.ticker.items || [])
        }
      } catch (error) {
        console.error('Failed to fetch news:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNews()
    const interval = setInterval(fetchNews, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  // Auto-rotate news items
  useEffect(() => {
    if (newsItems.length === 0 || isPaused) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % newsItems.length)
    }, 5000) // Change every 5 seconds

    return () => clearInterval(interval)
  }, [newsItems.length, isPaused])

  const handleNewsClick = (item: NewsItem) => {
    router.push(item.link)
  }

  if (isLoading || newsItems.length === 0) {
    return (
      <div className={cn("w-full relative overflow-hidden rounded-2xl shadow-xl", className)}>
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 pointer-events-none" />
        
        <div className="bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 p-5">
          <div className="flex items-center gap-4 animate-pulse">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="w-3/4 h-5 bg-white/20 backdrop-blur-sm rounded-lg" />
              <div className="w-1/2 h-4 bg-white/10 backdrop-blur-sm rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentItem = newsItems[currentIndex]

  const getIcon = () => {
    switch (currentItem.type) {
      case 'stream': return <Play className="w-5 h-5" />
      case 'tournament': return <Trophy className="w-5 h-5" />
      case 'podcast': return <Podcast className="w-5 h-5" />
      case 'score': return <TrendingUp className="w-5 h-5" />
      case 'training': return <Video className="w-5 h-5" />
      default: return <Sparkles className="w-5 h-5" />
    }
  }

  const getBgGradient = () => {
    if (currentItem.priority === 'urgent' || currentItem.status === 'live') {
      return "from-red-500 via-pink-500 to-red-600"
    }
    switch (currentItem.type) {
      case 'stream': return "from-red-500 via-rose-500 to-pink-500"
      case 'tournament': return "from-amber-500 via-yellow-500 to-orange-500"
      case 'podcast': return "from-purple-500 via-violet-500 to-purple-600"
      case 'score': return "from-blue-500 via-cyan-500 to-blue-600"
      case 'training': return "from-teal-500 via-cyan-500 to-blue-500"
      default: return "from-blue-500 via-cyan-500 to-blue-600"
    }
  }

  return (
    <motion.div
      className={cn("w-full relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300", className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      whileHover={{ scale: 1.01 }}
    >
      {/* Top accent bar - always visible */}
      <motion.div 
        className={cn("absolute top-0 left-0 right-0 h-2 bg-gradient-to-r pointer-events-none", getBgGradient())}
        animate={{ opacity: [1, 0.7, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* Animated background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30 pointer-events-none" />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className={cn("relative bg-gradient-to-r cursor-pointer group", getBgGradient())}
          onClick={() => handleNewsClick(currentItem)}
        >
          <div className="p-5 relative z-10">
            <div className="flex items-center gap-4">
              {/* Animated icon container */}
              <motion.div 
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform"
                whileHover={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-white drop-shadow-lg">
                  {getIcon()}
                </div>
                {currentItem.status === 'live' && (
                  <div className="absolute -top-1 -right-1">
                    <div className="relative">
                      <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {/* Badge */}
                  <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 transition-colors capitalize font-semibold text-xs px-2.5 py-0.5">
                    {currentItem.priority === 'urgent' || currentItem.status === 'live' ? (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        LIVE NOW
                      </span>
                    ) : currentItem.type}
                  </Badge>

                  {/* Metadata badges */}
                  {currentItem.viewers && (
                    <Badge className="bg-white/15 backdrop-blur-sm text-white border-white/25 text-xs">
                      <Users className="w-3 h-3 mr-1" />
                      {currentItem.viewers.toLocaleString()}
                    </Badge>
                  )}
                  
                  {currentItem.daysUntil && (
                    <Badge className="bg-white/15 backdrop-blur-sm text-white border-white/25 text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {currentItem.daysUntil}d
                    </Badge>
                  )}
                </div>

                <h3 className="font-bold text-lg text-white drop-shadow-lg truncate mb-0.5 group-hover:text-white/90 transition-colors">
                  {currentItem.title}
                </h3>
                <p className="text-sm text-white/90 drop-shadow truncate">
                  {currentItem.subtitle}
                </p>
              </div>

              {/* Action button */}
              <motion.div
                whileHover={{ x: 5 }}
                className="flex-shrink-0"
              >
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg group-hover:bg-white/30 transition-colors">
                  <ChevronRight className="w-5 h-5 text-white drop-shadow-lg" />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 overflow-hidden">
            <motion.div
              className="h-full bg-white/50 backdrop-blur-sm shadow-lg"
              initial={{ width: "0%" }}
              animate={{ width: isPaused ? "100%" : "100%" }}
              transition={{ duration: isPaused ? 0 : 5, ease: "linear" }}
              key={currentIndex}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation dots */}
      <div className="absolute bottom-3 right-5 flex items-center gap-2 z-20">
        {newsItems.map((_, index) => (
          <button
            key={index}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300 shadow-sm",
              index === currentIndex
                ? "bg-white w-8 shadow-md"
                : "bg-white/40 w-1.5 hover:bg-white/60"
            )}
            onClick={(e) => {
              e.stopPropagation()
              setCurrentIndex(index)
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}
