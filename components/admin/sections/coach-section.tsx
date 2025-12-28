
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Users, Activity, TrendingUp } from "lucide-react"

export default function CoachSection() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/coach')
      const json = await response.json()
      setData(json)
    } catch (error) {
      console.error("Failed to fetch coach data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-12">Loading AI Coach data...</div>
  if (!data) return <div className="text-center py-12">No data available</div>

  const totalMessages = data.messages?.length || 0
  const userMessages = data.messages?.filter((m: any) => m.role === 'user').length || 0
  const assistantMessages = totalMessages - userMessages

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Messages</p>
                <p className="text-3xl font-bold text-blue-900">{totalMessages}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Active Users</p>
                <p className="text-3xl font-bold text-purple-900">{data.userStats?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Avg per User</p>
                <p className="text-3xl font-bold text-orange-900">
                  {data.userStats?.length > 0 ? Math.floor(totalMessages / data.userStats.length) : 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="conversations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="conversations">Recent Conversations</TabsTrigger>
          <TabsTrigger value="users">User Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="conversations">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Recent AI Coach Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {data.messages?.slice(0, 50).map((message: any) => (
                  <div 
                    key={message.id} 
                    className={`p-4 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-blue-50 border-l-4 border-blue-500' 
                        : 'bg-slate-50 border-l-4 border-slate-400'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
                          : 'bg-gradient-to-br from-slate-500 to-slate-700'
                      }`}>
                        <span className="text-white font-medium">
                          {message.role === 'user' ? (message.user?.firstName?.[0] || 'U') : 'AI'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={message.role === 'user' ? 'default' : 'secondary'}>
                            {message.role === 'user' ? message.user?.name || 'User' : 'Coach Kai'}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {new Date(message.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>User Engagement Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.userStats?.map((stat: any) => (
                  <div key={stat.user.id} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                          {stat.user?.firstName?.[0] || 'U'}
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900">{stat.user.name}</h4>
                          <p className="text-sm text-slate-600">{stat.user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900">{stat.totalMessages}</div>
                        <div className="text-xs text-slate-600">messages</div>
                        <div className="text-xs text-slate-500 mt-1">
                          Last: {new Date(stat.lastMessage).toLocaleDateString()}
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
