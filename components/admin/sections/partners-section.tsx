
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, Users, Clock, CheckCircle, XCircle } from "lucide-react"

export default function PartnersSection() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/partners')
      const json = await response.json()
      setData(json)
    } catch (error) {
      console.error("Failed to fetch partners data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-12">Loading partners data...</div>
  if (!data) return <div className="text-center py-12">No data available</div>

  const pendingRequests = data.requests?.filter((r: any) => r.status === 'PENDING').length || 0
  const acceptedRequests = data.requests?.filter((r: any) => r.status === 'ACCEPTED').length || 0

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Requests</p>
                <p className="text-3xl font-bold text-blue-900">{data.requests?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Pending</p>
                <p className="text-3xl font-bold text-orange-900">{pendingRequests}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active Connections</p>
                <p className="text-3xl font-bold text-green-900">{data.connections?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">Partner Requests</TabsTrigger>
          <TabsTrigger value="connections">Active Connections</TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>All Partner Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.requests?.map((request: any) => (
                  <div key={request.id} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-medium">
                            {request.sender?.firstName?.[0] || 'S'}
                          </div>
                          <div className="text-sm text-slate-600">→</div>
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                            {request.receiver?.firstName?.[0] || 'R'}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-slate-900">
                              {request.sender?.name || 'Unknown'}
                            </span>
                            <span className="text-slate-500">→</span>
                            <span className="font-medium text-slate-900">
                              {request.receiver?.name || 'Unknown'}
                            </span>
                            <Badge className={
                              request.status === 'ACCEPTED' ? 'bg-green-500' :
                              request.status === 'DECLINED' ? 'bg-red-500' :
                              'bg-orange-500'
                            }>
                              {request.status}
                            </Badge>
                          </div>
                          {request.message && (
                            <p className="text-sm text-slate-600 mt-1">{request.message}</p>
                          )}
                          <div className="flex gap-4 text-xs text-slate-500 mt-2">
                            <div>Sent: {new Date(request.createdAt).toLocaleString()}</div>
                            {request.respondedAt && (
                              <div>Responded: {new Date(request.respondedAt).toLocaleString()}</div>
                            )}
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

        <TabsContent value="connections">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Active Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.connections?.map((connection: any) => (
                  <div key={connection.id} className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-medium">
                            {connection.user1?.firstName?.[0] || 'U'}
                          </div>
                          <div className="text-green-600 font-bold">↔</div>
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium">
                            {connection.user2?.firstName?.[0] || 'U'}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">{connection.user1?.name || 'Unknown'}</span>
                            <span className="text-slate-500">&</span>
                            <span className="font-medium text-slate-900">{connection.user2?.name || 'Unknown'}</span>
                          </div>
                          <div className="flex gap-4 text-sm text-slate-600 mt-1">
                            <div>Matches Together: <span className="font-medium">{connection.totalMatches}</span></div>
                            <div>Connected: {new Date(connection.connectedAt).toLocaleDateString()}</div>
                            {connection.lastMatchDate && (
                              <div>Last Match: {new Date(connection.lastMatchDate).toLocaleDateString()}</div>
                            )}
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
