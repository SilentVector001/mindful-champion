
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  User, Mail, MapPin, Calendar, TrendingUp, 
  Trophy, Target, Settings, Edit 
} from "lucide-react"
import Link from "next/link"
import MainNavigation from "@/components/navigation/main-navigation"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      matches: {
        orderBy: { date: 'desc' },
        take: 5
      }
    }
  })

  if (!user) {
    redirect("/auth/signin")
  }

  const firstName = user.firstName || user.name?.split(' ')[0] || 'Player'
  const initials = firstName.substring(0, 2).toUpperCase()
  const winRate = user.totalMatches > 0 ? Math.round((user.totalWins / user.totalMatches) * 100) : 0

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'PRO': return 'bg-gradient-to-r from-amber-500 to-orange-500'
      case 'PREMIUM': return 'bg-gradient-to-r from-teal-500 to-emerald-500'
      default: return 'bg-gradient-to-r from-slate-500 to-slate-600'
    }
  }

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'PRO': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'PREMIUM': return 'bg-teal-100 text-teal-700 border-teal-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
      <MainNavigation user={user} />
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex gap-6 items-center">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.image || undefined} />
                    <AvatarFallback className={getTierColor(user.subscriptionTier)}>
                      <span className="text-2xl font-bold text-white">{initials}</span>
                    </AvatarFallback>
                  </Avatar>
                  <Badge className={`absolute -bottom-2 left-1/2 -translate-x-1/2 ${getTierBadge(user.subscriptionTier)}`}>
                    {user.subscriptionTier}
                  </Badge>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    {user.firstName || ''} {user.lastName || user.name}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {user.email}
                    </div>
                    {user.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {user.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Link href="/settings">
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t">
              <div>
                <p className="text-sm text-slate-500 mb-1">Skill Level</p>
                <p className="text-2xl font-bold text-slate-900">{user.skillLevel}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Rating</p>
                <p className="text-2xl font-bold text-slate-900">{user.playerRating}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Win Rate</p>
                <p className="text-2xl font-bold text-green-600">{winRate}%</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Streak</p>
                <p className="text-2xl font-bold text-teal-600">{user.currentStreak}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Performance Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-teal-600" />
                Performance Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Total Matches</span>
                <span className="font-semibold">{user.totalMatches}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Total Wins</span>
                <span className="font-semibold text-green-600">{user.totalWins}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Losses</span>
                <span className="font-semibold text-red-600">{user.totalMatches - user.totalWins}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Current Streak</span>
                <span className="font-semibold text-teal-600">{user.currentStreak} wins</span>
              </div>
            </CardContent>
          </Card>

          {/* Mental Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-teal-600" />
                Mental Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Focus Score</span>
                  <span className="font-semibold">{user.focusScore}/10</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 rounded-full" 
                    style={{ width: `${(user.focusScore / 10) * 100}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Confidence Score</span>
                  <span className="font-semibold">{user.confidenceScore}/10</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 rounded-full" 
                    style={{ width: `${(user.confidenceScore / 10) * 100}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Stress Management</span>
                  <span className="font-semibold">{user.stressScore}/10</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 rounded-full" 
                    style={{ width: `${(user.stressScore / 10) * 100}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Matches */}
        {user.matches.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-teal-600" />
                Recent Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {user.matches.map((match) => (
                  <div key={match.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold">{match.opponent || 'Unknown'}</p>
                      <p className="text-sm text-slate-600">
                        {new Date(match.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{match.playerScore} - {match.opponentScore}</p>
                      <Badge variant={match.result === 'WIN' ? 'default' : 'destructive'}>
                        {match.result}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/progress/matches">
                <Button variant="outline" className="w-full mt-4">
                  View All Matches
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
