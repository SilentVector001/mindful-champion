
"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  PlayCircle,
  Trophy,
  Calendar,
  Radio,
  ExternalLink,
  TrendingUp,
  Users,
  Sparkles,
  Zap,
  Clock,
  MapPin,
  DollarSign
} from 'lucide-react'

interface MediaAlert {
  id: string
  type: 'live_stream' | 'tournament' | 'event' | 'podcast' | 'news'
  title: string
  description: string
  link: string
  status: 'live' | 'upcoming' | 'register'
  priority: 'high' | 'medium' | 'low'
  metadata?: {
    viewers?: number
    date?: string
    location?: string
    prize?: string
    spotsLeft?: number
  }
}

const getAlertIcon = (type: string) => {
  switch (type) {
    case 'live_stream': return Radio
    case 'tournament': return Trophy
    case 'event': return Calendar
    case 'podcast': return PlayCircle
    case 'news': return TrendingUp
    default: return Sparkles
  }
}

const getAlertColor = (status: string, type: string) => {
  if (status === 'live') return 'from-red-500 to-orange-500'
  if (status === 'register') return 'from-champion-green to-emerald-600'
  if (type === 'tournament') return 'from-champion-gold to-yellow-600'
  return 'from-champion-blue to-cyan-600'
}

export default function MediaCenterAlerts() {
  const [alerts, setAlerts] = useState<MediaAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [flashCount, setFlashCount] = useState(0)
  const [isFlashing, setIsFlashing] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  // Flash animation control: exactly 5 flashes at 1 second each
  useEffect(() => {
    if (flashCount >= 5) {
      setIsFlashing(false)
      return
    }

    const timer = setTimeout(() => {
      setFlashCount(prev => prev + 1)
    }, 1000) // 1 second per flash

    return () => clearTimeout(timer)
  }, [flashCount])

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/dashboard/media-alerts')
      if (response.ok) {
        const data = await response.json()
        setAlerts(data.alerts || [])
      }
    } catch (error) {
      console.error('Failed to fetch media alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAlertClick = (alert: MediaAlert) => {
    if (alert.link.startsWith('http')) {
      window.open(alert.link, '_blank')
    } else {
      router.push(alert.link)
    }
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-champion-blue to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-champion-blue to-cyan-600 bg-clip-text text-transparent">
              Media Center
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-white to-gray-50 overflow-hidden relative">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-champion-blue/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-champion-gold/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      
      <CardHeader className="relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <motion.div 
              className="w-10 h-10 bg-gradient-to-br from-champion-blue to-cyan-600 rounded-xl flex items-center justify-center shadow-lg"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h3 className="bg-gradient-to-r from-champion-blue to-cyan-600 bg-clip-text text-transparent font-bold">
                Live & Upcoming
              </h3>
              <p className="text-xs text-gray-500 font-normal">Media Center Updates</p>
            </div>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-champion-blue hover:text-champion-blue hover:bg-champion-blue/10"
            onClick={() => router.push('/media')}
          >
            View All
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 relative z-10">
        <AnimatePresence>
          {alerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <PlayCircle className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm mb-3">No live events right now</p>
              <Button
                size="sm"
                className="bg-gradient-to-r from-champion-blue to-cyan-600 hover:shadow-lg"
                onClick={() => router.push('/media')}
              >
                Explore Media Center
              </Button>
            </motion.div>
          ) : (
            alerts.map((alert, index) => {
              const Icon = getAlertIcon(alert.type)
              const colorClass = getAlertColor(alert.status, alert.type)
              
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "group cursor-pointer relative overflow-hidden",
                    "bg-white rounded-xl border border-gray-200",
                    "hover:shadow-lg hover:border-champion-blue/30 transition-all duration-300",
                    "hover:-translate-y-1"
                  )}
                  onClick={() => handleAlertClick(alert)}
                >
                  {/* Gradient border effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-champion-blue/0 via-champion-blue/5 to-champion-blue/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  
                  <div className="p-4 relative z-10">
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <motion.div
                        className={cn(
                          "w-12 h-12 rounded-xl bg-gradient-to-br shadow-lg",
                          "flex items-center justify-center flex-shrink-0",
                          "group-hover:scale-110 transition-transform",
                          colorClass
                        )}
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </motion.div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-bold text-gray-900 group-hover:text-champion-blue transition-colors line-clamp-1">
                            {alert.title}
                          </h4>
                          {alert.status === 'live' && (
                            <Badge 
                              className={cn(
                                "bg-red-500 text-white text-xs flex items-center gap-1",
                                isFlashing && "animate-flash-1s"
                              )}
                            >
                              <div className={cn(
                                "w-1.5 h-1.5 bg-white rounded-full",
                                isFlashing && "animate-flash-1s"
                              )} />
                              LIVE
                            </Badge>
                          )}
                          {alert.status === 'register' && (
                            <Badge className="bg-champion-green text-white text-xs">
                              Register
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {alert.description}
                        </p>

                        {/* Metadata */}
                        {alert.metadata && (
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            {alert.metadata.viewers && (
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {alert.metadata.viewers.toLocaleString()} watching
                              </div>
                            )}
                            {alert.metadata.date && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {alert.metadata.date}
                              </div>
                            )}
                            {alert.metadata.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {alert.metadata.location}
                              </div>
                            )}
                            {alert.metadata.prize && (
                              <div className="flex items-center gap-1 text-champion-gold font-semibold">
                                <DollarSign className="w-3 h-3" />
                                {alert.metadata.prize}
                              </div>
                            )}
                            {alert.metadata.spotsLeft && (
                              <Badge variant="outline" className="text-xs border-red-300 text-red-600">
                                {alert.metadata.spotsLeft} spots left!
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <motion.div
                        initial={{ x: 0 }}
                        whileHover={{ x: 5 }}
                        className="text-gray-400 group-hover:text-champion-blue transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>

        {/* Quick Links */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
          {[
            { label: 'Live Streams', icon: Radio, path: '/media?tab=live' },
            { label: 'Events', icon: Calendar, path: '/media?tab=events' },
            { label: 'Podcasts', icon: PlayCircle, path: '/media?tab=podcasts' }
          ].map((link) => {
            const Icon = link.icon
            return (
              <Button
                key={link.label}
                variant="ghost"
                size="sm"
                className="flex flex-col h-auto py-2 px-2 gap-1 hover:bg-champion-blue/5 hover:text-champion-blue"
                onClick={() => router.push(link.path)}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium">{link.label}</span>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
