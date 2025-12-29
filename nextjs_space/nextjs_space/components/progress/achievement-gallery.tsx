
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Award, 
  Trophy, 
  Target, 
  Flame, 
  Star, 
  TrendingUp, 
  Zap,
  Medal,
  Crown,
  Heart,
  CheckCircle2,
  Lock
} from "lucide-react"
import { cn } from "@/lib/utils"

interface Achievement {
  id: string
  name: string
  description: string
  icon: any
  category: "milestone" | "streak" | "skill" | "social"
  rarity: "common" | "rare" | "epic" | "legendary"
  progress: number
  maxProgress: number
  earned: boolean
  earnedDate?: string
  points: number
}

const achievements: Achievement[] = [
  // Milestone Achievements
  {
    id: "first-match",
    name: "First Match",
    description: "Log your first match",
    icon: Trophy,
    category: "milestone",
    rarity: "common",
    progress: 1,
    maxProgress: 1,
    earned: true,
    earnedDate: "2025-10-18",
    points: 10
  },
  {
    id: "10-matches",
    name: "Getting Started",
    description: "Play 10 matches",
    icon: Target,
    category: "milestone",
    rarity: "common",
    progress: 7,
    maxProgress: 10,
    earned: false,
    points: 25
  },
  {
    id: "50-matches",
    name: "Dedicated Player",
    description: "Play 50 matches",
    icon: Medal,
    category: "milestone",
    rarity: "rare",
    progress: 7,
    maxProgress: 50,
    earned: false,
    points: 50
  },
  {
    id: "100-matches",
    name: "Century Club",
    description: "Play 100 matches",
    icon: Crown,
    category: "milestone",
    rarity: "epic",
    progress: 7,
    maxProgress: 100,
    earned: false,
    points: 100
  },

  // Streak Achievements
  {
    id: "3-day-streak",
    name: "Getting Consistent",
    description: "Train 3 days in a row",
    icon: Flame,
    category: "streak",
    rarity: "common",
    progress: 2,
    maxProgress: 3,
    earned: false,
    points: 15
  },
  {
    id: "7-day-streak",
    name: "Week Warrior",
    description: "Train 7 days in a row",
    icon: Flame,
    category: "streak",
    rarity: "rare",
    progress: 2,
    maxProgress: 7,
    earned: false,
    points: 35
  },
  {
    id: "30-day-streak",
    name: "Unstoppable",
    description: "Train 30 days in a row",
    icon: Flame,
    category: "streak",
    rarity: "legendary",
    progress: 2,
    maxProgress: 30,
    earned: false,
    points: 150
  },

  // Skill Achievements
  {
    id: "first-drill",
    name: "Training Begins",
    description: "Complete your first drill",
    icon: Zap,
    category: "skill",
    rarity: "common",
    progress: 1,
    maxProgress: 1,
    earned: true,
    earnedDate: "2025-10-17",
    points: 10
  },
  {
    id: "25-drills",
    name: "Practice Makes Perfect",
    description: "Complete 25 drills",
    icon: TrendingUp,
    category: "skill",
    rarity: "rare",
    progress: 15,
    maxProgress: 25,
    earned: false,
    points: 40
  },
  {
    id: "skill-master",
    name: "Skill Master",
    description: "Reach Advanced skill level",
    icon: Star,
    category: "skill",
    rarity: "epic",
    progress: 0,
    maxProgress: 1,
    earned: false,
    points: 75
  },

  // Social Achievements
  {
    id: "first-session",
    name: "Coach Connection",
    description: "Complete your first AI coaching session",
    icon: Heart,
    category: "social",
    rarity: "common",
    progress: 1,
    maxProgress: 1,
    earned: true,
    earnedDate: "2025-10-19",
    points: 10
  },
  {
    id: "goal-setter",
    name: "Goal Setter",
    description: "Set your training goals",
    icon: CheckCircle2,
    category: "social",
    rarity: "common",
    progress: 1,
    maxProgress: 1,
    earned: true,
    earnedDate: "2025-10-16",
    points: 10
  },
]

export default function AchievementGallery() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [totalPoints, setTotalPoints] = useState(0)
  const [userRewardPoints, setUserRewardPoints] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const points = achievements
      .filter(a => a.earned)
      .reduce((sum, a) => sum + a.points, 0)
    setTotalPoints(points)
    
    // Fetch user's actual reward points from API
    const fetchUserPoints = async () => {
      try {
        const response = await fetch('/api/rewards/user-stats')
        if (response.ok) {
          const data = await response.json()
          setUserRewardPoints(data.points || data.stats?.rewardPoints || 0)
        }
      } catch (error) {
        console.error('Failed to fetch user reward points:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchUserPoints()
  }, [])

  const filteredAchievements = selectedCategory === "all" 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory)

  const earnedCount = achievements.filter(a => a.earned).length
  const totalCount = achievements.length

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "from-slate-400 to-slate-600"
      case "rare": return "from-blue-400 to-blue-600"
      case "epic": return "from-purple-400 to-purple-600"
      case "legendary": return "from-amber-400 to-amber-600"
      default: return "from-slate-400 to-slate-600"
    }
  }

  const getRarityBadgeColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "bg-slate-100 text-slate-700 border-slate-200"
      case "rare": return "bg-blue-100 text-blue-700 border-blue-200"
      case "epic": return "bg-purple-100 text-purple-700 border-purple-200"
      case "legendary": return "bg-amber-100 text-amber-700 border-amber-200"
      default: return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  const categories = [
    { value: "all", label: "All", icon: Award },
    { value: "milestone", label: "Milestones", icon: Trophy },
    { value: "streak", label: "Streaks", icon: Flame },
    { value: "skill", label: "Skills", icon: Star },
    { value: "social", label: "Social", icon: Heart },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-8 h-8 text-teal-600" />
            <h1 className="text-3xl font-bold text-slate-900">Achievement Gallery</h1>
          </div>
          <p className="text-slate-600">Celebrate your badges, streaks, and accomplishments</p>
        </div>

        {/* Your Total Reward Points - Prominent Display */}
        <Card className="mb-6 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-600" />
              <CardTitle className="text-lg font-bold text-amber-900">
                Your Total Reward Points
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="text-5xl font-black text-amber-600">
                {loading ? "..." : userRewardPoints.toLocaleString()}
              </div>
              <Trophy className="w-8 h-8 text-amber-500 animate-pulse" />
            </div>
            <p className="text-sm text-amber-700 mt-2 font-medium">
              🎉 Use these points in the Rewards Marketplace to redeem awesome prizes!
            </p>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Achievements Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-teal-600">
                {earnedCount}/{totalCount}
              </div>
              <Progress 
                value={(earnedCount / totalCount) * 100} 
                className="mt-2 h-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-teal-600">
                {totalPoints}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {achievements.reduce((sum, a) => sum + a.points, 0)} total available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-teal-600">
                {Math.round((earnedCount / totalCount) * 100)}%
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Keep grinding!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
          <TabsList className="grid w-full grid-cols-5">
            {categories.map(cat => {
              const Icon = cat.icon
              return (
                <TabsTrigger key={cat.value} value={cat.value} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{cat.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>

        {/* Achievements Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAchievements.map(achievement => {
            const Icon = achievement.icon
            const progressPercent = (achievement.progress / achievement.maxProgress) * 100

            return (
              <Card 
                key={achievement.id}
                className={cn(
                  "relative overflow-hidden transition-all hover:shadow-lg",
                  achievement.earned ? "border-teal-200" : "border-slate-200 opacity-75"
                )}
              >
                {/* Rarity Gradient Background */}
                <div className={cn(
                  "absolute inset-0 opacity-5 bg-gradient-to-br",
                  getRarityColor(achievement.rarity)
                )} />

                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className={cn(
                      "p-3 rounded-lg bg-gradient-to-br",
                      achievement.earned 
                        ? getRarityColor(achievement.rarity)
                        : "from-slate-300 to-slate-400"
                    )}>
                      {achievement.earned ? (
                        <Icon className="h-6 w-6 text-white" />
                      ) : (
                        <Lock className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <Badge className={cn("text-xs capitalize", getRarityBadgeColor(achievement.rarity))}>
                      {achievement.rarity}
                    </Badge>
                  </div>

                  <CardTitle className="text-lg flex items-center gap-2">
                    {achievement.name}
                    {achievement.earned && (
                      <CheckCircle2 className="h-4 w-4 text-teal-600" />
                    )}
                  </CardTitle>
                  <CardDescription>{achievement.description}</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {!achievement.earned && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-600">Progress</span>
                          <span className="font-medium text-slate-900">
                            {achievement.progress}/{achievement.maxProgress}
                          </span>
                        </div>
                        <Progress value={progressPercent} className="h-2" />
                      </div>
                    )}

                    {achievement.earned && achievement.earnedDate && (
                      <div className="flex items-center justify-between text-sm text-slate-600">
                        <span>Earned on</span>
                        <span className="font-medium">
                          {new Date(achievement.earnedDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-semibold text-slate-900">
                          {achievement.points} points
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {achievement.category}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-12">
            <Award className="h-12 w-12 mx-auto text-slate-400 mb-3" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No achievements found</h3>
            <p className="text-slate-600">Try selecting a different category</p>
          </div>
        )}
      </div>
    </div>
  )
}
