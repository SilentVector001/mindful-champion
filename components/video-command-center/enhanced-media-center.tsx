
"use client"

/**
 * Enhanced Media Center with Flow Improvements
 * 
 * Features:
 * - Dynamic status indicators (LIVE, ACTIVE, COMING UP, EXPIRED)
 * - Real-time content filtering
 * - Interactive live scores with view toggles
 * - Improved podcast and live feed integration
 * - Smart content expiration handling
 */

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Play,
  Pause,
  Video,
  Calendar,
  Clock,
  Users,
  Eye,
  EyeOff,
  Filter,
  Search,
  ExternalLink,
  Radio,
  Headphones,
  TrendingUp,
  Star,
  Bookmark,
  BookmarkCheck,
  Volume2,
  VolumeX,
  SkipForward,
  SkipBack,
  Download,
  Share2,
  Heart,
  MessageCircle,
  BarChart3,
  Zap,
  Trophy,
  Target,
  Activity,
  CheckCircle,
  AlertCircle,
  Info,
  MapPin,
  Bell
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface MediaItem {
  id: string
  title: string
  description?: string
  type: 'video' | 'podcast' | 'live_feed' | 'tournament' | 'news'
  status: 'LIVE' | 'ACTIVE' | 'COMING_UP' | 'AVAILABLE' | 'EXPIRED'
  url?: string
  thumbnail?: string
  duration?: number
  publishedAt: Date
  expiresAt?: Date
  viewCount?: number
  rating?: number
  tags?: string[]
  source?: string
  isBookmarked?: boolean
  progress?: number
}

interface LiveScore {
  id: string
  tournament: string
  players: { name: string; score: number }[]
  status: 'LIVE' | 'COMPLETED' | 'UPCOMING'
  court?: string
  startTime: Date
  videoUrl?: string
  hasVideo: boolean
}

const MOCK_MEDIA_CONTENT: MediaItem[] = [
  {
    id: '1',
    title: 'PPA Championship Finals - Live Now',
    description: 'Watch the championship finals live with expert commentary',
    type: 'live_feed',
    status: 'LIVE',
    url: 'https://example.com/ppa-finals',
    thumbnail: '/tournament.jpg',
    publishedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
    viewCount: 2847,
    source: 'PPA Tour'
  },
  {
    id: '2',
    title: 'Third Shot Strategy Masterclass',
    description: 'Advanced techniques for improving your third shot drop',
    type: 'video',
    status: 'ACTIVE',
    duration: 1800, // 30 minutes
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    rating: 4.8,
    tags: ['strategy', 'advanced', 'technique'],
    progress: 45
  },
  {
    id: '3',
    title: 'The Pickleball Show - Episode 127',
    description: 'Interview with Ben Johns about tournament preparation',
    type: 'podcast',
    status: 'ACTIVE',
    duration: 3600, // 60 minutes
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    rating: 4.9,
    isBookmarked: true
  },
  {
    id: '4',
    title: 'Major League Pickleball - Team Championship',
    description: 'Team finals scheduled for this weekend',
    type: 'tournament',
    status: 'COMING_UP',
    publishedAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    source: 'MLP'
  },
  {
    id: '5',
    title: 'Beginner Fundamentals Workshop',
    description: 'Basic techniques and rules - replay available',
    type: 'video',
    status: 'EXPIRED',
    duration: 2700, // 45 minutes
    publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    expiresAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Expired 7 days ago
    rating: 4.2
  }
]

const MOCK_LIVE_SCORES: LiveScore[] = [
  {
    id: '1',
    tournament: 'PPA Championship',
    players: [
      { name: 'Ben Johns / Collin Johns', score: 8 },
      { name: 'Riley Newman / Matt Wright', score: 6 }
    ],
    status: 'LIVE',
    court: 'Center Court',
    startTime: new Date(Date.now() - 45 * 60 * 1000), // 45 min ago
    hasVideo: true,
    videoUrl: 'https://example.com/live-match-1'
  },
  {
    id: '2',
    tournament: 'MLP Team Finals',
    players: [
      { name: 'Team Florida', score: 2 },
      { name: 'Team California', score: 1 }
    ],
    status: 'LIVE',
    court: 'Court 2',
    startTime: new Date(Date.now() - 20 * 60 * 1000), // 20 min ago
    hasVideo: false
  },
  {
    id: '3',
    tournament: 'APP Masters',
    players: [
      { name: 'Anna Leigh Waters / Catherine Parenteau', score: 11 },
      { name: 'Jessie Irvine / Jackie Kawamoto', score: 7 }
    ],
    status: 'COMPLETED',
    court: 'Championship Court',
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    hasVideo: true,
    videoUrl: 'https://example.com/completed-match-1'
  }
]

export default function EnhancedMediaCenter() {
  const [activeTab, setActiveTab] = useState('training-library')
  const [mediaContent, setMediaContent] = useState<MediaItem[]>(MOCK_MEDIA_CONTENT)
  const [liveScores, setLiveScores] = useState<LiveScore[]>(MOCK_LIVE_SCORES)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showExpired, setShowExpired] = useState(false)
  const [scoreViewMode, setScoreViewMode] = useState<'scores' | 'video'>('scores')
  const [playingContent, setPlayingContent] = useState<string | null>(null)

  // Filter content based on search, status, and expiration settings
  const filteredContent = mediaContent.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || item.status.toLowerCase() === statusFilter.toLowerCase()
    
    const shouldShowExpired = showExpired || item.status !== 'EXPIRED'
    
    return matchesSearch && matchesStatus && shouldShowExpired
  })

  // Get status badge properties
  const getStatusBadge = (status: string) => {
    const configs = {
      LIVE: { 
        variant: 'destructive' as const, 
        icon: '🔴', 
        class: 'bg-red-500 animate-pulse' 
      },
      ACTIVE: { 
        variant: 'default' as const, 
        icon: '✅', 
        class: 'bg-green-500' 
      },
      COMING_UP: { 
        variant: 'secondary' as const, 
        icon: '📅', 
        class: 'bg-blue-500' 
      },
      AVAILABLE: { 
        variant: 'outline' as const, 
        icon: '📺', 
        class: 'bg-gray-500' 
      },
      EXPIRED: { 
        variant: 'outline' as const, 
        icon: '⏰', 
        class: 'bg-gray-400' 
      }
    }
    return configs[status as keyof typeof configs] || configs.AVAILABLE
  }

  // Handle content interaction
  const handlePlayContent = (item: MediaItem) => {
    if (item.status === 'EXPIRED') {
      toast.error('This content has expired and is no longer available')
      return
    }
    
    if (item.status === 'COMING_UP') {
      toast.info(`This content will be available ${item.publishedAt.toLocaleDateString()}`)
      return
    }

    setPlayingContent(item.id)
    toast.success(`Playing: ${item.title}`)
  }

  const handleBookmark = (itemId: string) => {
    setMediaContent(prev => prev.map(item => 
      item.id === itemId ? { ...item, isBookmarked: !item.isBookmarked } : item
    ))
    toast.success('Bookmark updated')
  }

  const handleScoreViewToggle = (matchId: string, mode: 'scores' | 'video') => {
    const match = liveScores.find(s => s.id === matchId)
    if (mode === 'video' && !match?.hasVideo) {
      toast.error('Video not available for this match')
      return
    }
    setScoreViewMode(mode)
    
    if (mode === 'video' && match?.videoUrl) {
      window.open(match.videoUrl, '_blank')
    }
  }

  // Format duration helper
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-champion-blue to-cyan-600 rounded-xl flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              Enhanced Media Center
            </h1>
            <p className="text-xl text-gray-600">Your complete pickleball content hub with live updates</p>
          </div>
          
          {/* Live Indicator */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-red-600">
              {mediaContent.filter(item => item.status === 'LIVE').length} Live Now
            </span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Content</SelectItem>
              <SelectItem value="live">🔴 Live</SelectItem>
              <SelectItem value="active">✅ Active</SelectItem>
              <SelectItem value="coming_up">📅 Coming Up</SelectItem>
              <SelectItem value="available">📺 Available</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <Switch
              id="show-expired"
              checked={showExpired}
              onCheckedChange={setShowExpired}
            />
            <Label htmlFor="show-expired" className="text-sm">
              Show expired content
            </Label>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="training-library" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Training Library
          </TabsTrigger>
          <TabsTrigger value="podcast-studio" className="flex items-center gap-2">
            <Headphones className="w-4 h-4" />
            Podcast Studio
          </TabsTrigger>
          <TabsTrigger value="live-feed" className="flex items-center gap-2">
            <Radio className="w-4 h-4" />
            Live Feed
          </TabsTrigger>
          <TabsTrigger value="live-scores" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Live Scores
          </TabsTrigger>
          <TabsTrigger value="my-library" className="flex items-center gap-2">
            <Bookmark className="w-4 h-4" />
            My Library
          </TabsTrigger>
        </TabsList>

        {/* Training Library */}
        <TabsContent value="training-library">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent
              .filter(item => item.type === 'video')
              .map((item, index) => {
                const statusConfig = getStatusBadge(item.status)
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-all group">
                      {/* Status Indicator */}
                      <div className={cn("h-1", statusConfig.class)} />
                      
                      <div className="aspect-video bg-gray-100 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Button
                            size="lg"
                            className="rounded-full"
                            onClick={() => handlePlayContent(item)}
                            disabled={item.status === 'EXPIRED'}
                          >
                            <Play className="w-6 h-6" />
                          </Button>
                        </div>
                        
                        {/* Status Badge */}
                        <Badge 
                          className={cn("absolute top-2 left-2", statusConfig.class)}
                        >
                          {statusConfig.icon} {item.status}
                        </Badge>
                        
                        {/* Duration */}
                        {item.duration && (
                          <Badge variant="secondary" className="absolute bottom-2 right-2">
                            {formatDuration(item.duration)}
                          </Badge>
                        )}
                      </div>
                      
                      <CardContent className="p-4">
                        <h3 className="font-bold text-lg mb-2 line-clamp-2">{item.title}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                        
                        {/* Progress bar for active content */}
                        {item.progress && item.status === 'ACTIVE' && (
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Progress</span>
                              <span>{item.progress}%</span>
                            </div>
                            <Progress value={item.progress} className="h-1" />
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {item.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs">{item.rating}</span>
                              </div>
                            )}
                            {item.viewCount && (
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{item.viewCount.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleBookmark(item.id)}
                          >
                            {item.isBookmarked ? (
                              <BookmarkCheck className="w-4 h-4 text-champion-blue" />
                            ) : (
                              <Bookmark className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
          </div>
        </TabsContent>

        {/* Live Scores with Enhanced Interactions */}
        <TabsContent value="live-scores">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Tournament Scores</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant={scoreViewMode === 'scores' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setScoreViewMode('scores')}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Scores
                </Button>
                <Button
                  variant={scoreViewMode === 'video' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setScoreViewMode('video')}
                >
                  <Video className="w-4 h-4 mr-2" />
                  Video View
                </Button>
              </div>
            </div>
            
            <div className="grid gap-4">
              {liveScores.map((score, index) => (
                <motion.div
                  key={score.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={cn(
                    "overflow-hidden",
                    score.status === 'LIVE' && "border-red-500 shadow-lg"
                  )}>
                    {score.status === 'LIVE' && (
                      <div className="h-1 bg-gradient-to-r from-red-500 to-pink-500" />
                    )}
                    
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-lg">{score.tournament}</h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <MapPin className="w-3 h-3" />
                            {score.court}
                            <Clock className="w-3 h-3 ml-2" />
                            {score.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        
                        <Badge 
                          className={cn(
                            score.status === 'LIVE' && "bg-red-500 animate-pulse",
                            score.status === 'COMPLETED' && "bg-green-500",
                            score.status === 'UPCOMING' && "bg-blue-500"
                          )}
                        >
                          {score.status === 'LIVE' && '🔴'} {score.status}
                        </Badge>
                      </div>
                      
                      {/* Score Display */}
                      <div className="space-y-2 mb-4">
                        {score.players.map((player, playerIndex) => (
                          <div key={playerIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="font-medium">{player.name}</span>
                            <span className="text-2xl font-bold text-champion-blue">{player.score}</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Interactive Controls */}
                      <div className="flex items-center gap-2">
                        {score.hasVideo && (
                          <Button
                            size="sm"
                            onClick={() => handleScoreViewToggle(score.id, 'video')}
                            className="bg-champion-green hover:bg-champion-green/90"
                          >
                            <Video className="w-4 h-4 mr-2" />
                            Watch Video
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toast.info('Score notifications enabled')}
                        >
                          <Bell className="w-4 h-4 mr-2" />
                          Follow
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.share?.({
                              title: `${score.tournament} - Live Score`,
                              text: `${score.players[0].name}: ${score.players[0].score} vs ${score.players[1].name}: ${score.players[1].score}`,
                              url: window.location.href
                            })
                          }}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Other tabs with similar enhancements... */}
        <TabsContent value="podcast-studio">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredContent
              .filter(item => item.type === 'podcast')
              .map((item, index) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <Headphones className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge className={getStatusBadge(item.status).class}>
                            {getStatusBadge(item.status).icon} {item.status}
                          </Badge>
                          <Button size="sm" onClick={() => handlePlayContent(item)}>
                            <Play className="w-4 h-4 mr-2" />
                            Listen
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* Placeholder for other tabs */}
        <TabsContent value="live-feed">
          <div>Live Feed content with enhanced status indicators...</div>
        </TabsContent>

        <TabsContent value="my-library">
          <div>Bookmarked and saved content...</div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
