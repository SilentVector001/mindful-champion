
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Target, Award, TrendingUp, CheckCircle } from "lucide-react"

export default function GoalsSection() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/goals')
      const json = await response.json()
      setData(json)
    } catch (error) {
      console.error("Failed to fetch goals data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-12">Loading goals data...</div>
  if (!data) return <div className="text-center py-12">No data available</div>

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active Goals</p>
                <p className="text-3xl font-bold text-green-900">{data.goals?.filter((g: any) => g.status === 'ACTIVE').length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Achievements</p>
                <p className="text-3xl font-bold text-blue-900">{data.achievements?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Skill Tracking</p>
                <p className="text-3xl font-bold text-purple-900">{data.skillProgress?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="goals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="goals">User Goals</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="skills">Skill Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="goals">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>User Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.goals?.map((goal: any) => (
                  <div key={goal.id} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-slate-900">{goal.title}</h4>
                          <Badge className={
                            goal.status === 'COMPLETED' ? 'bg-green-500' :
                            goal.status === 'ACTIVE' ? 'bg-blue-500' :
                            goal.status === 'PAUSED' ? 'bg-orange-500' :
                            'bg-slate-500'
                          }>
                            {goal.status}
                          </Badge>
                          <Badge variant="outline">{goal.category}</Badge>
                        </div>
                        {goal.description && (
                          <p className="text-sm text-slate-600 mb-2">{goal.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">User:</span> <span className="font-medium">{goal.user?.name || 'Unknown'}</span>
                          </div>
                          {goal.targetDate && (
                            <div>
                              <span className="text-slate-500">Target:</span> <span className="font-medium">{new Date(goal.targetDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-slate-500">Milestones:</span> <span className="font-medium">{goal.milestones?.length || 0}</span>
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-slate-600">Progress</span>
                            <span className="font-medium">{goal.progress.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements">
          <div className="space-y-6">
            {/* Achievement Stats by Tier */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'].map((tier) => {
                const tierAchievements = data.achievements?.filter((a: any) => a.tier === tier) || []
                const totalUnlocked = tierAchievements.reduce((sum: number, a: any) => sum + (a.userAchievements?.length || 0), 0)
                return (
                  <Card key={tier} className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-slate-600">{tier} Tier</p>
                          <p className="text-2xl font-bold text-slate-900">{tierAchievements.length}</p>
                        </div>
                        <Badge className={
                          tier === 'BRONZE' ? 'bg-amber-600' :
                          tier === 'SILVER' ? 'bg-slate-400' :
                          tier === 'GOLD' ? 'bg-yellow-500' :
                          'bg-cyan-500'
                        }>
                          {totalUnlocked} unlocked
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600">
                        {tierAchievements.length > 0 
                          ? `Avg ${(totalUnlocked / tierAchievements.length).toFixed(1)} per achievement`
                          : 'No achievements'
                        }
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* All Achievements List */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>All Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {data.achievements?.map((achievement: any) => (
                    <div key={achievement.id} className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{achievement.icon || '🏆'}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="font-bold text-slate-900">{achievement.name}</h4>
                            <Badge className={
                              achievement.tier === 'BRONZE' ? 'bg-amber-600' :
                              achievement.tier === 'SILVER' ? 'bg-slate-400' :
                              achievement.tier === 'GOLD' ? 'bg-yellow-500' :
                              achievement.tier === 'PLATINUM' ? 'bg-cyan-500' :
                              'bg-slate-500'
                            }>
                              {achievement.tier || 'NONE'}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{achievement.description}</p>
                          <div className="flex items-center gap-4 text-sm flex-wrap">
                            <div>
                              <span className="text-slate-500">Type:</span> <span className="font-medium">{achievement.type}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Points:</span> <span className="font-medium">{achievement.points}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="font-medium text-green-700">{achievement.userAchievements?.length || 0} users</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="skills">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Skill Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.skillProgress?.map((skill: any) => (
                  <div key={skill.id} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                            {skill.user?.firstName?.[0] || 'U'}
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900">{skill.user?.name || 'Unknown User'}</h4>
                            <p className="text-sm text-slate-600">{skill.skillName}</p>
                          </div>
                        </div>
                        <div className="flex gap-6 mt-2 text-sm">
                          <div>
                            <span className="text-slate-500">Proficiency:</span> <span className="font-medium">{skill.proficiency.toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Sessions:</span> <span className="font-medium">{skill.totalSessions}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Improvement:</span> <span className="font-medium">{skill.improvementRate.toFixed(1)}%</span>
                          </div>
                          {skill.lastPracticed && (
                            <div>
                              <span className="text-slate-500">Last:</span> <span className="font-medium">{new Date(skill.lastPracticed).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-3">
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                              style={{ width: `${skill.proficiency}%` }}
                            />
                          </div>
                        </div>
                      </div>
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
