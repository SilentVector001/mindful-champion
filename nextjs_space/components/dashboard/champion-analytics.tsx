
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  TrendingUp, 
  Trophy, 
  Target, 
  Plus,
  Calendar,
  User,
  Clock,
  BarChart3,
  PieChart,
  TrendingDown,
  Minus
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar } from 'recharts'

interface ChampionAnalyticsProps {
  user: any
}

const colors = ['#60B5FF', '#FF9149', '#FF9898', '#FF90BB', '#FF6363', '#80D8C3', '#A19AD3', '#72BF78']

export default function ChampionAnalytics({ user }: ChampionAnalyticsProps) {
  const [showMatchDialog, setShowMatchDialog] = useState(false)
  const [newMatch, setNewMatch] = useState({
    opponent: "",
    playerScore: "",
    opponentScore: "",
    result: "",
    duration: "",
    notes: ""
  })
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()

  // Handle client-side hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate win rate safely on client side only
  const winRate = mounted && user?.totalMatches 
    ? ((user?.totalWins || 0) / user.totalMatches * 100).toFixed(1)
    : "0"

  // Mock data for demonstration
  const performanceData = [
    { date: '10/1', winRate: 45, matches: 2 },
    { date: '10/8', winRate: 52, matches: 4 },
    { date: '10/15', winRate: 48, matches: 6 },
    { date: '10/22', winRate: 58, matches: 8 },
    { date: '10/29', winRate: 62, matches: 10 },
    { date: '11/5', winRate: 68, matches: 12 },
  ]

  const skillBreakdown = [
    { name: 'Serving', value: 75, color: colors[0] },
    { name: 'Returns', value: 68, color: colors[1] },
    { name: 'Dinking', value: 82, color: colors[2] },
    { name: 'Volleys', value: 71, color: colors[3] },
    { name: 'Strategy', value: 65, color: colors[4] },
  ]

  const recentMatches = user?.matches?.slice(0, 5) || []

  const handleLogMatch = async () => {
    if (!newMatch.opponent || !newMatch.playerScore || !newMatch.opponentScore) {
      toast({
        title: "Missing Information",
        description: "Please fill in opponent name and scores.",
        variant: "destructive",
      })
      return
    }

    const playerScore = parseInt(newMatch.playerScore)
    const opponentScore = parseInt(newMatch.opponentScore)
    const result = playerScore > opponentScore ? 'win' : 'loss'

    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMatch,
          playerScore,
          opponentScore,
          result,
          duration: parseInt(newMatch.duration) || null,
        }),
      })

      if (response.ok) {
        toast({
          title: "Match logged successfully! 🏓",
          description: `${result === 'win' ? 'Congratulations on your victory!' : 'Great effort! Learn from this experience.'}`,
        })
        setShowMatchDialog(false)
        setNewMatch({
          opponent: "",
          playerScore: "",
          opponentScore: "",
          result: "",
          duration: "",
          notes: ""
        })
        window.location.reload()
      } else {
        throw new Error('Failed to log match')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log match. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Champion Analytics
          </h2>
          <p className="text-slate-600 mt-2">
            Track your progress and discover insights to elevate your game
          </p>
        </div>
        <Dialog open={showMatchDialog} onOpenChange={setShowMatchDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="w-4 h-4 mr-2" />
              Log Match
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Log New Match</DialogTitle>
              <DialogDescription>
                Record your latest match results and track your progress
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="opponent">Opponent Name</Label>
                <Input
                  id="opponent"
                  value={newMatch.opponent}
                  onChange={(e) => setNewMatch(prev => ({ ...prev, opponent: e.target.value }))}
                  placeholder="Enter opponent's name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="playerScore">Your Score</Label>
                  <Input
                    id="playerScore"
                    type="number"
                    value={newMatch.playerScore}
                    onChange={(e) => setNewMatch(prev => ({ ...prev, playerScore: e.target.value }))}
                    placeholder="11"
                    min="0"
                    max="21"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="opponentScore">Opponent Score</Label>
                  <Input
                    id="opponentScore"
                    type="number"
                    value={newMatch.opponentScore}
                    onChange={(e) => setNewMatch(prev => ({ ...prev, opponentScore: e.target.value }))}
                    placeholder="9"
                    min="0"
                    max="21"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={newMatch.duration}
                  onChange={(e) => setNewMatch(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="45"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Input
                  id="notes"
                  value={newMatch.notes}
                  onChange={(e) => setNewMatch(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Great match, improved my third shot drop..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMatchDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleLogMatch} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Log Match
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: "Current Win Rate",
            value: `${winRate}%`,
            change: "+5.2%",
            changeType: "positive",
            icon: Trophy,
            gradient: "from-yellow-500 to-orange-500"
          },
          {
            title: "Total Matches",
            value: user?.totalMatches || 0,
            change: "+3 this week",
            changeType: "positive",
            icon: Target,
            gradient: "from-blue-500 to-cyan-500"
          },
          {
            title: "Average Duration",
            value: "42 min",
            change: "-2 min",
            changeType: "negative",
            icon: Clock,
            gradient: "from-green-500 to-emerald-500"
          },
          {
            title: "Skill Rating",
            value: user?.playerRating || "2.0",
            change: "+0.3",
            changeType: "positive",
            icon: TrendingUp,
            gradient: "from-purple-500 to-pink-500"
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden border-0 shadow-lg">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5`} />
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                    <div className="flex items-center mt-2">
                      {stat.changeType === 'positive' ? (
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm font-medium ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Performance Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                Performance Trend
              </CardTitle>
              <CardDescription>
                Your win rate progression over the last 6 weeks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id="colorWinRate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      domain={[0, 100]}
                    />
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <Area 
                      type="monotone" 
                      dataKey="winRate" 
                      stroke="#8B5CF6" 
                      fillOpacity={1} 
                      fill="url(#colorWinRate)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Skill Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-pink-500" />
                Skill Breakdown
              </CardTitle>
              <CardDescription>
                Performance analysis across different game aspects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {skillBreakdown.map((skill, index) => (
                  <div key={skill.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-700">{skill.name}</span>
                      <span className="text-sm font-bold text-slate-900">{skill.value}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <motion.div
                        className="h-2 rounded-full"
                        style={{ backgroundColor: skill.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.value}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Matches */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-orange-500" />
              Recent Matches
            </CardTitle>
            <CardDescription>
              Your latest game results and performance details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentMatches.length > 0 ? (
              <ScrollArea className="h-64">
                <div className="space-y-4">
                  {recentMatches.map((match: any, index: number) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          match.result === 'win' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {match.result === 'win' ? (
                            <Trophy className="w-5 h-5" />
                          ) : (
                            <Minus className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">vs {match.opponent}</p>
                          <p className="text-sm text-slate-600">
                            {new Date(match.date).toLocaleDateString()}
                            {match.duration && ` • ${match.duration} min`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={match.result === 'win' ? 'default' : 'secondary'} 
                               className={match.result === 'win' ? 'bg-green-500' : 'bg-red-500'}>
                          {match.playerScore} - {match.opponentScore}
                        </Badge>
                        <p className="text-sm text-slate-600 mt-1 capitalize">
                          {match.result}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">No matches logged yet</p>
                <p className="text-sm">Start tracking your games to see detailed analytics</p>
                <Button 
                  className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  onClick={() => setShowMatchDialog(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Log Your First Match
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
