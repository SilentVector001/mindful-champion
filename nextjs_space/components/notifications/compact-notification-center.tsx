'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Bell,
  PlayCircle,
  Trophy,
  Calendar,
  Radio,
  ExternalLink,
  TrendingUp,
  Users,
  Sparkles,
  Clock,
  MapPin,
  DollarSign,
  X,
  BellOff
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

interface CompactNotificationCenterProps {
  className?: string
  position?: 'fixed' | 'relative'
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

export default function CompactNotificationCenter({ 
  className,
  position = 'fixed' 
}: CompactNotificationCenterProps) {
  const [alerts, setAlerts] = useState<MediaAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [hasNew, setHasNew] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/dashboard/media-alerts')
      if (response.ok) {
        const data = await response.json()
        setAlerts(data.alerts || [])
        // Check if there are high-priority or live alerts
        const hasHighPriority = data.alerts?.some((a: MediaAlert) => 
          a.status === 'live' || a.priority === 'high'
        )
        setHasNew(hasHighPriority)
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
    setOpen(false)
  }

  const handleClearAll = () => {
    setHasNew(false)
  }

  const liveCount = alerts.filter(a => a.status === 'live').length
  const totalCount = alerts.length

  return (
    <div className={cn(position === 'fixed' && 'fixed', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "relative h-10 w-10 rounded-full",
                "bg-white shadow-lg border-2 border-gray-200",
                "hover:bg-gradient-to-br hover:from-champion-blue hover:to-cyan-600",
                "hover:border-champion-blue hover:text-white",
                "transition-all duration-300",
                hasNew && "animate-pulse border-red-500"
              )}
            >
              <Bell className="h-5 w-5" />
              <AnimatePresence>
                {totalCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Badge 
                      className={cn(
                        "h-5 min-w-5 px-1 text-xs font-bold",
                        "flex items-center justify-center",
                        liveCount > 0 
                          ? "bg-red-500 animate-pulse" 
                          : "bg-champion-blue"
                      )}
                    >
                      {liveCount > 0 ? liveCount : totalCount}
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </PopoverTrigger>

        <PopoverContent 
          className="w-[380px] p-0 shadow-2xl border-2 border-gray-200"
          align="end"
          sideOffset={8}
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-champion-blue to-cyan-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Bell className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Media Center</h3>
                  <p className="text-xs text-white/80">
                    {totalCount === 0 
                      ? 'No notifications' 
                      : `${totalCount} notification${totalCount > 1 ? 's' : ''}`
                    }
                  </p>
                </div>
              </div>
              {totalCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-white hover:bg-white/20 hover:text-white"
                  onClick={handleClearAll}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Notifications List */}
          <ScrollArea className="h-[400px]">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : alerts.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <BellOff className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm mb-3">No notifications</p>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-champion-blue to-cyan-600"
                  onClick={() => {
                    router.push('/media')
                    setOpen(false)
                  }}
                >
                  Explore Media Center
                </Button>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                <AnimatePresence>
                  {alerts.map((alert, index) => {
                    const Icon = getAlertIcon(alert.type)
                    const colorClass = getAlertColor(alert.status, alert.type)
                    
                    return (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <button
                          onClick={() => handleAlertClick(alert)}
                          className={cn(
                            "w-full p-3 rounded-lg text-left",
                            "bg-white hover:bg-gray-50",
                            "border border-gray-200 hover:border-champion-blue",
                            "transition-all duration-200",
                            "hover:shadow-md"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            {/* Icon */}
                            <div className={cn(
                              "w-10 h-10 rounded-lg bg-gradient-to-br flex-shrink-0",
                              "flex items-center justify-center shadow-sm",
                              colorClass
                            )}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">
                                  {alert.title}
                                </h4>
                                {alert.status === 'live' && (
                                  <Badge className="bg-red-500 text-white text-xs flex-shrink-0 animate-pulse">
                                    LIVE
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                                {alert.description}
                              </p>

                              {/* Metadata */}
                              {alert.metadata && (
                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                  {alert.metadata.viewers && (
                                    <div className="flex items-center gap-1">
                                      <Users className="w-3 h-3" />
                                      {alert.metadata.viewers.toLocaleString()}
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
                                </div>
                              )}
                            </div>

                            <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                          </div>
                        </button>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </ScrollArea>

          <Separator />

          {/* Footer */}
          <div className="p-3 bg-gray-50">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center text-champion-blue hover:bg-champion-blue/10 hover:text-champion-blue"
              onClick={() => {
                router.push('/media')
                setOpen(false)
              }}
            >
              View All in Media Center
              <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
