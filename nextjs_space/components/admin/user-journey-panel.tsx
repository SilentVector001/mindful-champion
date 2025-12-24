"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  X, Clock, Eye, ArrowRight, MapPin, Calendar,
  Smartphone, Monitor, Tablet, Globe, RefreshCw,
  TrendingUp, Activity
} from "lucide-react"
import { cn } from "@/lib/utils"

interface UserJourneyPanelProps {
  userId: string
  userName?: string
  onClose: () => void
}

export default function UserJourneyPanel({ userId, userName, onClose }: UserJourneyPanelProps) {
  const [loading, setLoading] = useState(true)
  const [journeyData, setJourneyData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(7)
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchJourney()
  }, [userId, days])

  const fetchJourney = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/tracking/user-journey?userId=${userId}&days=${days}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setJourneyData(data)
        // Expand all sessions by default
        const allSessionIds = new Set(data.journey.map((s: any) => s.sessionId))
        setExpandedSessions(allSessionIds)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch journey' }))
        setError(errorData.error || 'Failed to load user journey')
      }
    } catch (error) {
      console.error('Error fetching user journey:', error)
      setError('Network error while loading journey')
    } finally {
      setLoading(false)
    }
  }

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return Smartphone
      case 'tablet':
        return Tablet
      case 'desktop':
        return Monitor
      default:
        return Globe
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0s'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  const formatPath = (path: string) => {
    // Remove query params for cleaner display
    const cleanPath = path.split('?')[0]
    // Capitalize and format
    return cleanPath
      .split('/')
      .filter(Boolean)
      .map(p => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' / ') || 'Home'
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">User Journey</h2>
                  <p className="text-indigo-100">{userName || 'Loading...'}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-xl"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Time Range Selector */}
            <div className="flex gap-2 mt-4">
              {[7, 14, 30].map(d => (
                <Button
                  key={d}
                  size="sm"
                  variant={days === d ? "secondary" : "ghost"}
                  onClick={() => setDays(d)}
                  className={cn(
                    "text-white",
                    days === d ? "bg-white/20" : "hover:bg-white/10"
                  )}
                >
                  Last {d} days
                </Button>
              ))}
              <Button
                size="sm"
                variant="ghost"
                onClick={fetchJourney}
                className="ml-auto text-white hover:bg-white/10"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-slate-600">Loading journey...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <X className="w-8 h-8 text-red-600" />
                  </div>
                  <p className="text-red-600 font-medium">{error}</p>
                </div>
              </div>
            )}

            {!loading && !error && journeyData && (
              <div className="space-y-6">
                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Activity className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-slate-900">{journeyData.stats.totalSessions}</p>
                          <p className="text-xs text-slate-600">Sessions</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Eye className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-slate-900">{journeyData.stats.totalPageViews}</p>
                          <p className="text-xs text-slate-600">Page Views</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-slate-900">{journeyData.stats.avgPagesPerSession}</p>
                          <p className="text-xs text-slate-600">Avg Pages/Session</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-slate-900">
                            {Math.round(journeyData.journey.reduce((acc: number, s: any) => 
                              acc + (s.duration || 0), 0) / 60)}m
                          </p>
                          <p className="text-xs text-slate-600">Total Time</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Most Visited Pages */}
                {journeyData.stats.mostVisitedPages.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Most Visited Pages</CardTitle>
                      <CardDescription>Top pages in the last {days} days</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {journeyData.stats.mostVisitedPages.slice(0, 5).map((page: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-semibold text-sm">
                                {idx + 1}
                              </div>
                              <span className="font-medium text-slate-900">{formatPath(page.path)}</span>
                            </div>
                            <Badge variant="secondary">{page.count} views</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Session Timeline */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-slate-900">Session History</h3>
                  
                  {journeyData.journey.length === 0 && (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <p className="text-slate-600">No sessions found in the last {days} days</p>
                      </CardContent>
                    </Card>
                  )}

                  {journeyData.journey.map((session: any, idx: number) => {
                    const DeviceIcon = getDeviceIcon(session.deviceType)
                    const isExpanded = expandedSessions.has(session.sessionId)
                    
                    const toggleExpanded = () => {
                      const newSet = new Set(expandedSessions)
                      if (isExpanded) {
                        newSet.delete(session.sessionId)
                      } else {
                        newSet.add(session.sessionId)
                      }
                      setExpandedSessions(newSet)
                    }
                    
                    return (
                      <Card key={session.sessionId} className="overflow-hidden">
                        <CardHeader 
                          className="bg-gradient-to-r from-slate-50 to-slate-100 pb-3 cursor-pointer hover:from-slate-100 hover:to-slate-200 transition-colors"
                          onClick={toggleExpanded}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                <DeviceIcon className="w-5 h-5 text-slate-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <CardTitle className="text-base">Session {journeyData.journey.length - idx}</CardTitle>
                                  <Badge 
                                    variant="outline" 
                                    className={cn(
                                      "text-xs",
                                      session.totalPages === 0 ? "bg-yellow-50 text-yellow-700 border-yellow-300" : "bg-green-50 text-green-700 border-green-300"
                                    )}
                                  >
                                    {session.totalPages} page{session.totalPages !== 1 ? 's' : ''}
                                  </Badge>
                                </div>
                                <CardDescription className="text-xs">
                                  {new Date(session.startTime).toLocaleString()} • {session.browser || 'Unknown'} • {session.os || 'Unknown'}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {session.duration && (
                                <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {formatDuration(session.duration)}
                                </Badge>
                              )}
                              <motion.div
                                animate={{ rotate: isExpanded ? 90 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ArrowRight className="w-4 h-4 text-slate-600" />
                              </motion.div>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <CardContent className="p-4">
                                {session.pageViews.length === 0 ? (
                                  <div className="text-center py-8 text-slate-500">
                                    <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No page views recorded for this session</p>
                                    <p className="text-xs mt-1">User may have closed the browser before tracking completed</p>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {session.pageViews.map((pv: any, pvIdx: number) => (
                                      <div key={pvIdx} className="flex items-start gap-3">
                                        <div className="flex flex-col items-center">
                                          <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                                          {pvIdx < session.pageViews.length - 1 && (
                                            <div className="w-0.5 h-full bg-gradient-to-b from-indigo-300 to-transparent min-h-[30px]" />
                                          )}
                                        </div>
                                        <div className="flex-1 pb-3">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-medium text-slate-900 text-sm">
                                              {pv.title || formatPath(pv.path)}
                                            </span>
                                            {pv.duration && pv.duration > 0 && (
                                              <Badge variant="secondary" className="text-xs">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {formatDuration(pv.duration)}
                                              </Badge>
                                            )}
                                          </div>
                                          <p className="text-xs text-slate-500 mt-1">
                                            {new Date(pv.timestamp).toLocaleTimeString()}
                                            {pv.path !== '/' && (
                                              <span className="ml-2 font-mono bg-slate-100 px-2 py-0.5 rounded">
                                                {pv.path}
                                              </span>
                                            )}
                                          </p>
                                          {pv.referrer && pv.referrer !== pv.path && (
                                            <p className="text-xs text-slate-400 mt-1">
                                              From: {pv.referrer}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </CardContent>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
