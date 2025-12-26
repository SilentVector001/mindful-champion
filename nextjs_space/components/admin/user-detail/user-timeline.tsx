
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Shield, DollarSign, Award, Trophy } from "lucide-react"

export default function UserTimeline({ data }: { data: any }) {
  const { timeline } = data

  const getIcon = (type: string) => {
    switch (type) {
      case 'security': return <Shield className="w-4 h-4" />
      case 'payment': return <DollarSign className="w-4 h-4" />
      case 'achievement': return <Award className="w-4 h-4" />
      case 'match': return <Trophy className="w-4 h-4" />
      default: return <Calendar className="w-4 h-4" />
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case 'security': return 'from-red-500 to-rose-500'
      case 'payment': return 'from-green-500 to-emerald-500'
      case 'achievement': return 'from-yellow-500 to-orange-500'
      case 'match': return 'from-purple-500 to-pink-500'
      default: return 'from-blue-500 to-cyan-500'
    }
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-500" />
          Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {timeline.length === 0 ? (
          <p className="text-slate-600">No activity yet</p>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-200" />

            {/* Timeline items */}
            <div className="space-y-4">
              {timeline.map((item: any, idx: number) => (
                <div key={idx} className="relative flex gap-4">
                  <div className={`w-10 h-10 bg-gradient-to-br ${getColor(item.type)} rounded-full flex items-center justify-center text-white flex-shrink-0 z-10`}>
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {item.category || item.type}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {item.timestampFormatted || new Date(item.timestamp).toLocaleString()}
                        </span>
                        {item.relativeTime && (
                          <span className="text-xs text-slate-400">
                            • {item.relativeTime}
                          </span>
                        )}
                      </div>
                      <div className="mb-1">
                        <span className="text-sm font-medium text-slate-900">{item.title}</span>
                      </div>
                      <p className="text-sm text-slate-700">{item.description}</p>
                      {item.metadata && Object.keys(item.metadata).some(key => item.metadata[key]) && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {Object.entries(item.metadata).map(([key, value]: [string, any]) => 
                            value && (
                              <span key={key} className="text-xs px-2 py-1 bg-white rounded border border-slate-200">
                                {key}: {String(value)}
                              </span>
                            )
                          )}
                        </div>
                      )}
                      {item.data?.severity && (
                        <Badge className={`mt-2 ${
                          item.data.severity === 'HIGH' || item.data.severity === 'CRITICAL' ? 'bg-red-500' :
                          item.data.severity === 'MEDIUM' ? 'bg-orange-500' :
                          'bg-blue-500'
                        }`}>
                          {item.data.severity}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
