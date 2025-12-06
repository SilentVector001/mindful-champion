
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Download, Mail, Trophy, Target, Calendar } from "lucide-react"

export default function UsersSection() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [tierFilter, setTierFilter] = useState("all")
  const [skillFilter, setSkillFilter] = useState("all")

  useEffect(() => {
    fetchUsers()
  }, [tierFilter, skillFilter, search])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        ...(tierFilter !== 'all' && { tier: tierFilter }),
        ...(skillFilter !== 'all' && { skillLevel: skillFilter }),
        ...(search && { search }),
      })
      
      const response = await fetch(`/api/admin/users?${params}`)
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Subscription Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="FREE">Free</SelectItem>
                <SelectItem value="PREMIUM">Premium</SelectItem>
                <SelectItem value="PRO">Pro</SelectItem>
              </SelectContent>
            </Select>
            <Select value={skillFilter} onValueChange={setSkillFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Skill Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="BEGINNER">Beginner</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                <SelectItem value="ADVANCED">Advanced</SelectItem>
                <SelectItem value="PRO">Pro</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Users ({users.length})</CardTitle>
            <Badge variant="secondary">{users.filter(u => u.onboardingCompleted).length} completed onboarding</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-slate-600">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-slate-600">No users found</div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div 
                  key={user.id}
                  className="p-6 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all hover:shadow-md cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-16 h-16 bg-gradient-to-br ${
                        user.subscriptionTier === 'PRO' ? 'from-purple-500 to-pink-500' :
                        user.subscriptionTier === 'PREMIUM' ? 'from-orange-500 to-red-500' :
                        'from-blue-500 to-cyan-500'
                      } rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                        {user.firstName?.[0] || user.name?.[0] || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg text-slate-900">
                            {user.name || `${user.firstName} ${user.lastName}`}
                          </h3>
                          <Badge className={
                            user.subscriptionTier === 'PRO' ? 'bg-purple-500' :
                            user.subscriptionTier === 'PREMIUM' ? 'bg-orange-500' :
                            'bg-slate-500'
                          }>
                            {user.subscriptionTier}
                          </Badge>
                          {user.isTrialActive && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              Trial Active
                            </Badge>
                          )}
                          {user.duprConnected && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              DUPR Connected
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-3">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail className="w-4 h-4" />
                            {user.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Trophy className="w-4 h-4" />
                            {user.skillLevel} - {user.playerRating}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Target className="w-4 h-4" />
                            {user.totalMatches} matches ({user.totalWins} wins)
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="w-4 h-4" />
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Onboarding Data */}
                        {user.onboardingCompleted && (
                          <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200">
                            <div className="text-xs font-medium text-slate-500 mb-2">PROFILE</div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                              {user.ageRange && (
                                <div><span className="text-slate-500">Age:</span> <span className="font-medium">{user.ageRange}</span></div>
                              )}
                              {user.gender && (
                                <div><span className="text-slate-500">Gender:</span> <span className="font-medium">{user.gender}</span></div>
                              )}
                              {user.location && (
                                <div><span className="text-slate-500">Location:</span> <span className="font-medium">{user.location}</span></div>
                              )}
                              {user.playingFrequency && (
                                <div><span className="text-slate-500">Frequency:</span> <span className="font-medium">{user.playingFrequency}</span></div>
                              )}
                            </div>
                            {user.primaryGoals && Array.isArray(user.primaryGoals) && user.primaryGoals.length > 0 && (
                              <div className="mt-2">
                                <span className="text-xs text-slate-500">Goals:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {user.primaryGoals.map((goal: string, idx: number) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">{goal}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Stats */}
                        <div className="mt-3 flex gap-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-slate-900">{user.goals?.length || 0}</div>
                            <div className="text-xs text-slate-600">Goals</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-slate-900">{user.userAchievements?.length || 0}</div>
                            <div className="text-xs text-slate-600">Achievements</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-slate-900">{user.matches?.length || 0}</div>
                            <div className="text-xs text-slate-600">Recent Matches</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-slate-900">${((user.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) || 0) / 100).toFixed(0)}</div>
                            <div className="text-xs text-slate-600">Lifetime Value</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
