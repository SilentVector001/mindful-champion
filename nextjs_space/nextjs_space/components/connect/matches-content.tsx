
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import SimplifiedNav from "@/components/layout/simplified-nav"
import {
  Calendar,
  Trophy,
  Users,
  TrendingUp,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Search,
  Plus,
  MapPin,
  Star,
  Activity,
  BarChart3,
  Clock,
  Target,
  Zap,
  Crown,
  RefreshCw,
  ExternalLink,
  Filter,
  Download,
  Upload
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { format } from "date-fns"

interface Match {
  id: string
  date: Date
  opponent: string
  score: string | null
  result: string
  location?: string | null
  duprRatingChange?: number | null
}

interface User {
  id: string
  name: string | null
  email: string
  subscriptionTier: string
  duprId: string | null
  duprRating: number | null
  duprConnected: boolean
  skillLevel: string | null
}

interface MatchesContentProps {
  user: User | null
  initialMatches: Match[]
}

export default function MatchesContent({ user, initialMatches }: MatchesContentProps) {
  const [duprId, setDuprId] = useState(user?.duprId || "")
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(user?.duprConnected || false)
  const [syncing, setSyncing] = useState(false)
  const [matches, setMatches] = useState(initialMatches)
  const [searchQuery, setSearchQuery] = useState("")
  const [ratingFilter, setRatingFilter] = useState("all")

  const subscriptionTier = user?.subscriptionTier || 'FREE'
  const isPremium = subscriptionTier === 'PREMIUM'
  const isPro = subscriptionTier === 'PRO'

  const connectDUPR = async () => {
    if (!duprId) return
    
    setConnecting(true)
    try {
      const response = await fetch('/api/dupr/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ duprId })
      })

      if (response.ok) {
        const data = await response.json()
        setConnected(true)
        // Update user data
        window.location.reload()
      } else {
        throw new Error('Failed to connect DUPR account')
      }
    } catch (error) {
      console.error('DUPR connection error:', error)
      alert('Failed to connect DUPR account. Please check your DUPR ID and try again.')
    } finally {
      setConnecting(false)
    }
  }

  const syncMatches = async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/dupr/sync-matches', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setMatches(data.matches)
      }
    } catch (error) {
      console.error('Sync error:', error)
    } finally {
      setSyncing(false)
    }
  }

  const disconnectDUPR = async () => {
    try {
      await fetch('/api/dupr/disconnect', {
        method: 'POST'
      })
      setConnected(false)
      setDuprId("")
      window.location.reload()
    } catch (error) {
      console.error('Disconnect error:', error)
    }
  }

  return (
    <>
      <SimplifiedNav />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
        <div className="container mx-auto py-8 px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-orange-500 rounded-xl blur-md opacity-50" />
                    <div className="relative w-12 h-12 bg-gradient-to-br from-teal-500 to-orange-500 rounded-xl flex items-center justify-center">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-orange-600 bg-clip-text text-transparent">
                      My Matches
                    </h1>
                    <p className="text-slate-600 text-sm mt-1">
                      Track matches, connect with DUPR, and find opponents
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge
                  className={cn(
                    "gap-1 items-center h-8 px-4",
                    isPro
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : isPremium
                      ? 'bg-gradient-to-r from-teal-500 to-orange-500 text-white'
                      : 'bg-slate-500 text-white'
                  )}
                >
                  {isPro && <Crown className="w-4 h-4" />}
                  {subscriptionTier} Plan
                </Badge>
              </div>
            </div>
          </div>

          {/* DUPR Connection Card */}
          {!connected ? (
            <Card className="mb-6 border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-teal-600" />
                  <span className="bg-gradient-to-r from-teal-600 to-orange-600 bg-clip-text text-transparent">
                    Connect Your DUPR Account
                  </span>
                </CardTitle>
                <CardDescription>
                  Link your DUPR account to import matches, track ratings, and find opponents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-teal-200">
                    <Trophy className="h-5 w-5 text-teal-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm">Official Rating</h4>
                      <p className="text-xs text-slate-600">Track your DUPR rating changes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-teal-200">
                    <Activity className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm">Match History</h4>
                      <p className="text-xs text-slate-600">Import all your match results</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-teal-200">
                    <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm">Find Opponents</h4>
                      <p className="text-xs text-slate-600">Connect with players by rating</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="duprId">DUPR ID or Username</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="duprId"
                        placeholder="Enter your DUPR ID or username"
                        value={duprId}
                        onChange={(e) => setDuprId(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={connectDUPR}
                        disabled={!duprId || connecting}
                        className="bg-gradient-to-r from-teal-600 to-orange-600 hover:from-teal-700 hover:to-orange-700"
                      >
                        {connecting ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <LinkIcon className="mr-2 h-4 w-4" />
                            Connect
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Don't have a DUPR account?{" "}
                      <a
                        href="https://mydupr.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:underline inline-flex items-center gap-1"
                      >
                        Sign up on DUPR
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-6 border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-green-700">DUPR Connected</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={syncMatches}
                      disabled={syncing}
                      size="sm"
                      variant="outline"
                      className="border-green-300"
                    >
                      {syncing ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Sync Matches
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={disconnectDUPR}
                      size="sm"
                      variant="ghost"
                      className="text-slate-600"
                    >
                      Disconnect
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Your DUPR account is linked • ID: {user?.duprId}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-white rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span className="text-xs text-slate-600">DUPR Rating</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {user?.duprRating?.toFixed(2) || "N/A"}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="h-4 w-4 text-teal-500" />
                      <span className="text-xs text-slate-600">Total Matches</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{matches.length}</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="h-4 w-4 text-green-500" />
                      <span className="text-xs text-slate-600">Win Rate</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {matches.length > 0
                        ? `${Math.round((matches.filter(m => m.result === 'WIN').length / matches.length) * 100)}%`
                        : "0%"}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-orange-500" />
                      <span className="text-xs text-slate-600">Recent Trend</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">+0.08</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Content Tabs */}
          <Tabs defaultValue="matches" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="matches">
                <Calendar className="h-4 w-4 mr-2" />
                My Matches
              </TabsTrigger>
              <TabsTrigger value="find">
                <Search className="h-4 w-4 mr-2" />
                Find Opponents
              </TabsTrigger>
              <TabsTrigger value="schedule">
                <Plus className="h-4 w-4 mr-2" />
                Schedule Match
              </TabsTrigger>
            </TabsList>

            {/* My Matches Tab */}
            <TabsContent value="matches" className="space-y-4 mt-6">
              {matches.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Trophy className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <h3 className="text-xl font-semibold mb-2 text-slate-900">No Matches Yet</h3>
                    <p className="text-slate-600 mb-6">
                      {connected
                        ? "Click 'Sync Matches' above to import your DUPR match history"
                        : "Connect your DUPR account to import your match history"}
                    </p>
                    {connected && (
                      <Button
                        onClick={syncMatches}
                        disabled={syncing}
                        className="bg-gradient-to-r from-teal-600 to-orange-600"
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Sync Matches from DUPR
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {matches.map((match) => (
                    <Card key={match.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className={cn(
                              "w-16 h-16 rounded-full flex items-center justify-center text-white font-bold",
                              match.result === 'WIN' ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-orange-600'
                            )}>
                              {match.result === 'WIN' ? 'W' : 'L'}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-lg text-slate-900">
                                  vs {match.opponent}
                                </h3>
                                {match.score && (
                                  <Badge variant="outline" className="text-xs">
                                    {match.score}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-slate-600">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {format(new Date(match.date), 'MMM dd, yyyy')}
                                </div>
                                {match.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {match.location}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          {match.duprRatingChange && (
                            <div className={cn(
                              "text-right",
                              match.duprRatingChange > 0 ? 'text-green-600' : 'text-red-600'
                            )}>
                              <div className="text-xs font-medium">Rating Change</div>
                              <div className="text-lg font-bold">
                                {match.duprRatingChange > 0 ? '+' : ''}{match.duprRatingChange.toFixed(2)}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Find Opponents Tab */}
            <TabsContent value="find" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-teal-600" />
                    Find Players Near You
                  </CardTitle>
                  <CardDescription>
                    Search for opponents by rating, location, and availability
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Rating Range</Label>
                      <Select value={ratingFilter} onValueChange={setRatingFilter}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Ratings</SelectItem>
                          <SelectItem value="2.0-2.5">2.0 - 2.5</SelectItem>
                          <SelectItem value="2.5-3.0">2.5 - 3.0</SelectItem>
                          <SelectItem value="3.0-3.5">3.0 - 3.5</SelectItem>
                          <SelectItem value="3.5-4.0">3.5 - 4.0</SelectItem>
                          <SelectItem value="4.0-4.5">4.0 - 4.5</SelectItem>
                          <SelectItem value="4.5+">4.5+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input placeholder="City or ZIP code" />
                    </div>
                    <div>
                      <Label>Distance</Label>
                      <Select defaultValue="25">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">Within 10 miles</SelectItem>
                          <SelectItem value="25">Within 25 miles</SelectItem>
                          <SelectItem value="50">Within 50 miles</SelectItem>
                          <SelectItem value="100">Within 100 miles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-teal-600 to-orange-600">
                    <Search className="mr-2 h-4 w-4" />
                    Search Players
                  </Button>

                  {!connected && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Connect your DUPR account to access player search and matchmaking features
                      </AlertDescription>
                    </Alert>
                  )}

                  {connected && (
                    <div className="pt-4 border-t">
                      <p className="text-center text-slate-500 py-8">
                        Search for players using the filters above
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Schedule Match Tab */}
            <TabsContent value="schedule" className="space-y-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-teal-600" />
                    Schedule a New Match
                  </CardTitle>
                  <CardDescription>
                    Log a match or schedule an upcoming game
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Opponent Name</Label>
                      <Input placeholder="Enter opponent's name" />
                    </div>
                    <div>
                      <Label>Match Date</Label>
                      <Input type="date" />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input placeholder="Court or facility name" />
                    </div>
                    <div>
                      <Label>Match Type</Label>
                      <Select defaultValue="singles">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="singles">Singles</SelectItem>
                          <SelectItem value="doubles">Doubles</SelectItem>
                          <SelectItem value="mixed">Mixed Doubles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Your Score</Label>
                      <Input type="number" placeholder="11" />
                    </div>
                    <div>
                      <Label>Opponent Score</Label>
                      <Input type="number" placeholder="9" />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button className="flex-1 bg-gradient-to-r from-teal-600 to-orange-600">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Save Match
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload to DUPR
                    </Button>
                  </div>

                  {!connected && (
                    <Alert className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Connect DUPR to automatically sync your matches and update your rating
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  )
}
