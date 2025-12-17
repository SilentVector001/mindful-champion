
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Users,
  MapPin,
  Star,
  Trophy,
  Target,
  Calendar,
  MessageCircle,
  Search,
  Filter,
  Award,
  Zap,
  Crown,
  TrendingUp,
  UserPlus,
  Gift
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface CommunityHubProps {
  user: any
}

const activeChallenges = [
  {
    id: 1,
    name: "October Serve Challenge",
    description: "Perfect your serve consistency with daily practice goals",
    participants: 234,
    prize: "Free premium coaching session",
    progress: 65,
    daysLeft: 12,
    icon: Target,
    gradient: "from-blue-500 to-cyan-500",
    joined: true
  },
  {
    id: 2,
    name: "Dinking Master",
    description: "Master the art of dinking with precision drills",
    participants: 156,
    prize: "Champion paddle upgrade",
    progress: 0,
    daysLeft: 28,
    icon: Trophy,
    gradient: "from-green-500 to-emerald-500",
    joined: false
  },
  {
    id: 3,
    name: "30-Day Consistency",
    description: "Build consistent playing habits with daily training",
    participants: 389,
    prize: "Premium subscription discount",
    progress: 42,
    daysLeft: 18,
    icon: Calendar,
    gradient: "from-purple-500 to-pink-500",
    joined: true
  }
]

const nearbyPlayers = [
  {
    id: 1,
    name: "Alex Rivera",
    rating: 3.5,
    skillLevel: "Intermediate",
    location: "Austin, TX",
    distance: 2.3,
    isAvailable: true,
    lastSeen: "2 hours ago",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
  },
  {
    id: 2,
    name: "Jordan Kim",
    rating: 4.1,
    skillLevel: "Advanced",
    location: "Seattle, WA", 
    distance: 1.8,
    isAvailable: true,
    lastSeen: "30 minutes ago",
    image: "https://i.pinimg.com/736x/38/93/07/389307d6af5c4be0051b7d3c4f93bf3d.jpg"
  },
  {
    id: 3,
    name: "Casey Brown",
    rating: 2.8,
    skillLevel: "Beginner",
    location: "Denver, CO",
    distance: 5.2,
    isAvailable: false,
    lastSeen: "1 day ago",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face"
  },
  {
    id: 4,
    name: "Taylor Swift",
    rating: 3.9,
    skillLevel: "Intermediate",
    location: "Nashville, TN",
    distance: 3.1,
    isAvailable: true,
    lastSeen: "1 hour ago",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face"
  },
  {
    id: 5,
    name: "Morgan Lee",
    rating: 4.5,
    skillLevel: "Advanced",
    location: "Portland, OR",
    distance: 4.7,
    isAvailable: true,
    lastSeen: "15 minutes ago",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
  }
]

export default function CommunityHub({ user }: CommunityHubProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [skillFilter, setSkillFilter] = useState("all")
  const [distanceFilter, setDistanceFilter] = useState("all")
  const [joinedChallenges, setJoinedChallenges] = useState<number[]>([1, 3])
  const { toast } = useToast()

  const filteredPlayers = nearbyPlayers.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSkill = skillFilter === "all" || player.skillLevel.toLowerCase() === skillFilter
    const matchesDistance = distanceFilter === "all" || player.distance <= parseInt(distanceFilter)
    
    return matchesSearch && matchesSkill && matchesDistance
  })

  const handleJoinChallenge = async (challengeId: number) => {
    try {
      setJoinedChallenges(prev => [...prev, challengeId])
      
      toast({
        title: "Challenge Joined! 🎉",
        description: "You've successfully joined the challenge. Good luck, Champion!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join challenge. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleLeaveChallenge = async (challengeId: number) => {
    try {
      setJoinedChallenges(prev => prev.filter(id => id !== challengeId))
      
      toast({
        title: "Left Challenge",
        description: "You've left the challenge. You can rejoin anytime!",
      })
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to leave challenge. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleConnectPlayer = (player: any) => {
    toast({
      title: `Connection request sent to ${player.name}! 🤝`,
      description: "They'll be notified and can accept to start planning matches together.",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Community Hub
          </h2>
          <p className="text-slate-600 mt-2">
            Connect with fellow champions and compete in exciting challenges
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-slate-600">Community Online</span>
        </div>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Players", value: "12.5K", icon: Users, color: "from-blue-500 to-cyan-500" },
          { label: "Challenges Won", value: user?.challengesWon || "3", icon: Trophy, color: "from-yellow-500 to-orange-500" },
          { label: "Connections", value: "47", icon: UserPlus, color: "from-green-500 to-emerald-500" },
          { label: "Community Rank", value: "#234", icon: Crown, color: "from-purple-500 to-pink-500" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-4 border-0 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-sm text-slate-600">{stat.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Active Challenges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-500" />
              Active Challenges
            </CardTitle>
            <CardDescription>
              Join community challenges to compete with players worldwide and win amazing prizes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeChallenges.map((challenge, index) => {
                const isJoined = joinedChallenges.includes(challenge.id)
                
                return (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    <Card className={`p-6 transition-all hover:shadow-md ${
                      isJoined ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200' : 'border-slate-200'
                    }`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`w-12 h-12 bg-gradient-to-br ${challenge.gradient} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <challenge.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold text-slate-900">
                                {challenge.name}
                              </h3>
                              {isJoined && (
                                <Badge className="bg-orange-500 text-white">
                                  <Crown className="w-3 h-3 mr-1" />
                                  Joined
                                </Badge>
                              )}
                            </div>
                            <p className="text-slate-600 mb-3">
                              {challenge.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{challenge.participants} participants</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{challenge.daysLeft} days left</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Gift className="w-4 h-4" />
                                <span>{challenge.prize}</span>
                              </div>
                            </div>
                            
                            {isJoined && challenge.progress > 0 && (
                              <div className="space-y-2 mb-3">
                                <div className="flex justify-between text-sm">
                                  <span className="text-slate-600">Your Progress</span>
                                  <span className="font-medium text-slate-900">{challenge.progress}%</span>
                                </div>
                                <Progress value={challenge.progress} className="h-2" />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                          {isJoined ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleLeaveChallenge(challenge.id)}
                              >
                                Leave Challenge
                              </Button>
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                              >
                                <TrendingUp className="w-4 h-4 mr-1" />
                                View Progress
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                              onClick={() => handleJoinChallenge(challenge.id)}
                            >
                              <Zap className="w-4 h-4 mr-1" />
                              Join Challenge
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Find Playing Partners */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Find Playing Partners
            </CardTitle>
            <CardDescription>
              Connect with players near you and arrange matches based on skill level
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search players by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={skillFilter} onValueChange={setSkillFilter}>
                <SelectTrigger className="sm:w-48">
                  <SelectValue placeholder="Skill Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              <Select value={distanceFilter} onValueChange={setDistanceFilter}>
                <SelectTrigger className="sm:w-48">
                  <SelectValue placeholder="Distance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Distance</SelectItem>
                  <SelectItem value="5">Within 5 miles</SelectItem>
                  <SelectItem value="10">Within 10 miles</SelectItem>
                  <SelectItem value="25">Within 25 miles</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Players Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlayers.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-4 hover:shadow-md transition-all border-slate-200">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full overflow-hidden">
                          <Image
                            src={player.image}
                            alt={player.name}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                          player.isAvailable ? 'bg-green-400' : 'bg-slate-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{player.name}</h4>
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium text-slate-700">
                            {player.rating}
                          </span>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {player.skillLevel}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="w-3 h-3" />
                          <span>{player.distance} miles away</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-xs text-slate-500">
                        Last seen: {player.lastSeen}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                          onClick={() => handleConnectPlayer(player)}
                          disabled={!player.isAvailable}
                        >
                          <UserPlus className="w-3 h-3 mr-1" />
                          Connect
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="px-3"
                        >
                          <MessageCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
            
            {filteredPlayers.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">No players found</p>
                <p className="text-sm">Try adjusting your search filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
