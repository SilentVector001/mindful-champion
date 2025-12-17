
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, TrendingUp, Users, Calendar } from "lucide-react"

export default function MatchesSection() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/matches')
      const json = await response.json()
      setData(json)
    } catch (error) {
      console.error("Failed to fetch matches data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-12">Loading matches data...</div>
  if (!data) return <div className="text-center py-12">No data available</div>

  const totalMatches = data.matches?.length || 0
  const wins = data.matches?.filter((m: any) => m.result === 'WIN').length || 0
  const losses = totalMatches - wins

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Total Matches</p>
                <p className="text-3xl font-bold text-orange-900">{totalMatches}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Wins / Losses</p>
                <p className="text-3xl font-bold text-green-900">{wins} / {losses}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">DUPR Connected</p>
                <p className="text-3xl font-bold text-blue-900">{data.duprStats?._count || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Matches List */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>All Matches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.matches?.map((match: any) => (
              <div key={match.id} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      match.result === 'WIN' ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 'bg-gradient-to-br from-red-500 to-rose-500'
                    }`}>
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-semibold text-slate-900">{match.user?.name || 'Unknown User'}</h4>
                        <Badge className={match.result === 'WIN' ? 'bg-green-500' : 'bg-red-500'}>
                          {match.result}
                        </Badge>
                        {match.duprSynced && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">DUPR</Badge>
                        )}
                      </div>
                      <div className="flex gap-4 text-sm text-slate-600">
                        <div>
                          <span className="text-slate-500">vs</span> <span className="font-medium">{match.opponent}</span>
                        </div>
                        {match.score && (
                          <div>
                            <span className="text-slate-500">Score:</span> <span className="font-medium">{match.score}</span>
                          </div>
                        )}
                        {match.location && (
                          <div>
                            <span className="text-slate-500">Location:</span> <span className="font-medium">{match.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(match.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {match.notes && (
                        <p className="text-sm text-slate-600 mt-2">{match.notes}</p>
                      )}
                    </div>
                  </div>
                  {match.duprRatingChange !== null && (
                    <div className={`text-right ${match.duprRatingChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      <div className="text-lg font-bold">
                        {match.duprRatingChange > 0 ? '+' : ''}{match.duprRatingChange}
                      </div>
                      <div className="text-xs">DUPR Change</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
