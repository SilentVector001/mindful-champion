
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Video, BookOpen, Clock } from "lucide-react"

export default function UserActivity({ data }: { data: any }) {
  const { pageViews, videoInteractions, drillCompletions } = data

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-500" />
            Most Viewed Pages
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {pageViews.slice(0, 10).map((pv: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-900">{pv.path}</span>
                <Badge variant="secondary">{pv._count.path} views</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-purple-500" />
            Video Interactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {videoInteractions.slice(0, 10).map((vi: any) => (
              <div key={vi.id} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-900 truncate">
                    {vi.videoTitle || vi.videoId}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {vi.interactionType}
                  </Badge>
                </div>
                <div className="text-xs text-slate-600 flex items-center gap-2">
                  <span>{new Date(vi.timestamp).toLocaleString('en-US', { 
                    month: '2-digit', 
                    day: '2-digit', 
                    year: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    second: '2-digit',
                    hour12: true 
                  })}</span>
                  {vi.watchPercentage && (
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded">
                      {Math.round(vi.watchPercentage)}% watched
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-green-500" />
            Drill Completions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {drillCompletions.map((dc: any) => (
              <div key={dc.id} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-900">{dc.drillName}</span>
                  <Badge variant={
                    dc.status === 'COMPLETED' ? 'default' :
                    dc.status === 'IN_PROGRESS' ? 'secondary' :
                    'outline'
                  }>
                    {dc.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm text-slate-600">
                  <div>
                    <span className="font-medium">Category:</span> {dc.drillCategory}
                  </div>
                  <div>
                    <span className="font-medium">Level:</span> {dc.skillLevel}
                  </div>
                  {dc.timeSpent && (
                    <div>
                      <span className="font-medium">Time:</span> {Math.round(dc.timeSpent / 60)}m
                    </div>
                  )}
                  {dc.performanceScore && (
                    <div>
                      <span className="font-medium">Score:</span> {Math.round(dc.performanceScore)}/100
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
