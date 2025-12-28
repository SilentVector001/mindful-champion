
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Video, Play, Users, TrendingUp, BookOpen } from "lucide-react"

export default function TrainingSection() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/training')
      const json = await response.json()
      setData(json)
    } catch (error) {
      console.error("Failed to fetch training data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-12">Loading training data...</div>
  if (!data) return <div className="text-center py-12">No data available</div>

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Training Videos</p>
                <p className="text-3xl font-bold text-blue-900">{data.videos?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Training Programs</p>
                <p className="text-3xl font-bold text-purple-900">{data.programs?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Active Enrollments</p>
                <p className="text-3xl font-bold text-orange-900">{data.userPrograms?.filter((up: any) => up.status === 'IN_PROGRESS').length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="videos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="enrollments">User Enrollments</TabsTrigger>
        </TabsList>

        <TabsContent value="videos">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>All Training Videos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.videos?.map((video: any) => (
                  <div key={video.id} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-slate-200 rounded-lg flex items-center justify-center">
                        <Play className="w-8 h-8 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{video.title}</h4>
                        <p className="text-sm text-slate-600 line-clamp-2 mt-1">{video.description}</p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="secondary">{video.skillLevel}</Badge>
                          <Badge variant="outline">{video.primaryTopic}</Badge>
                          <Badge variant="outline">{video.duration}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900">{video.userVideoProgress?.length || 0}</div>
                        <div className="text-xs text-slate-600">views</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programs">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Training Programs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.programs?.map((program: any) => (
                  <div key={program.id} className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-slate-900">{program.name}</h3>
                          <Badge>{program.skillLevel}</Badge>
                          {!program.isActive && <Badge variant="destructive">Inactive</Badge>}
                        </div>
                        {program.tagline && (
                          <p className="text-sm text-slate-600 italic mb-2">{program.tagline}</p>
                        )}
                        <p className="text-sm text-slate-700">{program.description}</p>
                        <div className="flex gap-4 mt-4 text-sm">
                          <div>
                            <span className="text-slate-500">Duration:</span> <span className="font-medium">{program.durationDays} days</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Videos:</span> <span className="font-medium">{program.programVideos?.length || 0}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Enrollments:</span> <span className="font-medium">{program.userPrograms?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-center ml-4">
                        <div className="text-3xl font-bold text-slate-900">{program.userPrograms?.filter((up: any) => up.status === 'COMPLETED').length || 0}</div>
                        <div className="text-xs text-slate-600">Completed</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enrollments">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>User Enrollments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.userPrograms?.map((enrollment: any) => (
                  <div key={enrollment.id} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                          {enrollment.user?.firstName?.[0] || 'U'}
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900">{enrollment.user?.name || 'Unknown User'}</h4>
                          <p className="text-sm text-slate-600">{enrollment.program?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="text-sm text-slate-600">Day {enrollment.currentDay} of {enrollment.program?.durationDays}</div>
                          <div className="w-32 bg-slate-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                              style={{ width: `${enrollment.completionPercentage}%` }}
                            />
                          </div>
                        </div>
                        <Badge className={
                          enrollment.status === 'COMPLETED' ? 'bg-green-500' :
                          enrollment.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                          'bg-slate-500'
                        }>
                          {enrollment.status}
                        </Badge>
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
