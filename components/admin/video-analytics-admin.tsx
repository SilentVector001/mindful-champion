
"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Video, BarChart3, Clock, HardDrive, Users, TrendingUp,
  Search, Filter, Download, Eye, Trash2, CheckCircle2,
  AlertCircle, Loader2, PlayCircle, XCircle, RefreshCw,
  FileVideo, Activity, Gauge, Trophy, Star, Calendar
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface VideoAnalyticsAdminProps {
  initialStats: {
    totalVideos: number
    totalAnalyzed: number
    pendingAnalyses: number
    failedAnalyses: number
    storageUsedMB: number
    avgProcessingTimeMinutes: number
    recentVideos: any[]
    topUploaders: any[]
  }
}

export default function VideoAnalyticsAdmin({ initialStats }: VideoAnalyticsAdminProps) {
  const [stats, setStats] = useState(initialStats)
  const [videos, setVideos] = useState<any[]>(initialStats.recentVideos)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedVideo, setSelectedVideo] = useState<any>(null)

  const refreshData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/video-analytics')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setVideos(data.videos || [])
      }
    } catch (error) {
      console.error('Failed to refresh data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredVideos = videos.filter(video => {
    const matchesSearch = searchQuery === '' || 
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
      video.analysisStatus.toLowerCase() === statusFilter.toLowerCase()
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>
      case 'PROCESSING':
        return <Badge className="bg-blue-500"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Processing</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'FAILED':
        return <Badge className="bg-red-500"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTierBadge = (tier: string) => {
    if (tier === 'PRO') {
      return <Badge className="bg-violet-500"><Trophy className="h-3 w-3 mr-1" />Pro</Badge>
    }
    return <Badge variant="secondary">Free</Badge>
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
              <Video className="h-6 w-6 text-white" />
            </div>
            Video Analytics Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage all video analyses across the platform
          </p>
        </div>
        <Button onClick={refreshData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Videos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.totalVideos}</div>
              <FileVideo className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All uploaded videos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Analyzed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-green-600">{stats.totalAnalyzed}</div>
              <CheckCircle2 className="h-8 w-8 text-green-500/50" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalVideos > 0 ? Math.round((stats.totalAnalyzed / stats.totalVideos) * 100) : 0}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending/Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-blue-600">{stats.pendingAnalyses}</div>
              <Loader2 className="h-8 w-8 text-blue-500/50 animate-spin" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              In queue or processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Storage Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{stats.storageUsedMB}</div>
              <HardDrive className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              MB total storage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div className="text-2xl font-bold">{stats.avgProcessingTimeMinutes}</div>
              <span className="text-sm text-muted-foreground">minutes</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Failed Analyses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div className="text-2xl font-bold text-red-600">{stats.failedAnalyses}</div>
              <span className="text-sm text-muted-foreground">errors</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div className="text-2xl font-bold text-green-600">
                {stats.totalVideos > 0 ? Math.round((stats.totalAnalyzed / stats.totalVideos) * 100) : 0}%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="videos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="videos">All Videos</TabsTrigger>
          <TabsTrigger value="users">Top Users</TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by title, user name, or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Videos Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Videos ({filteredVideos.length})</CardTitle>
              <CardDescription>
                Latest video analyses from all users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredVideos.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No videos found</p>
                  </div>
                ) : (
                  filteredVideos.map((video) => (
                    <div
                      key={video.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold truncate">{video.title}</h3>
                          {getStatusBadge(video.analysisStatus)}
                          {video.overallScore && (
                            <Badge variant="outline" className="ml-auto">
                              <Gauge className="h-3 w-3 mr-1" />
                              Score: {video.overallScore}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {video.user?.name || 'Unknown User'}
                          </span>
                          <span>{video.user?.email}</span>
                          {getTierBadge(video.user?.subscriptionTier || 'FREE')}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDistanceToNow(new Date(video.uploadedAt), { addSuffix: true })}
                          </span>
                          <span>{Math.round(video.fileSize / 1024 / 1024)} MB</span>
                          <span>{Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')} min</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Link href={`/admin/users/${video.userId}`}>
                          <Button variant="ghost" size="sm">
                            <Users className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Video Uploaders</CardTitle>
              <CardDescription>
                Users with the most video analyses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.topUploaders.map((uploader, index) => (
                  <div
                    key={uploader.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 font-bold text-violet-600 dark:text-violet-400">
                        #{index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold">{uploader.name || 'Unknown User'}</h3>
                        <p className="text-sm text-muted-foreground">{uploader.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getTierBadge(uploader.subscriptionTier || 'FREE')}
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        <FileVideo className="h-4 w-4 mr-2" />
                        {uploader.videoCount}
                      </Badge>
                      <Link href={`/admin/users/${uploader.id}`}>
                        <Button variant="outline" size="sm">
                          View User
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
