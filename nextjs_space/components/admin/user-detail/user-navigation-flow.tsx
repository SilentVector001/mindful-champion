"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navigation, ArrowRight, TrendingUp } from "lucide-react"

export default function UserNavigationFlow({ data }: { data: any }) {
  const { topNavigationPaths, topPages } = data

  // Group navigation paths by frequency
  const getPathFrequencyColor = (count: number, maxCount: number) => {
    const ratio = count / maxCount
    if (ratio > 0.7) return 'bg-green-500'
    if (ratio > 0.4) return 'bg-blue-500'
    if (ratio > 0.2) return 'bg-yellow-500'
    return 'bg-gray-500'
  }

  const maxPathCount = topNavigationPaths.length > 0 ? topNavigationPaths[0].count : 1

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Navigation Paths */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-indigo-500" />
            Common Navigation Flows
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topNavigationPaths && topNavigationPaths.length > 0 ? (
            <div className="space-y-3">
              {topNavigationPaths.map((path: any, index: number) => {
                const [from, to] = path.path.split(' → ')
                return (
                  <div key={index} className="p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Badge className={`${getPathFrequencyColor(path.count, maxPathCount)} text-white`}>
                          {path.count}x
                        </Badge>
                        <span className={`w-2 h-2 rounded-full ${getPathFrequencyColor(path.count, maxPathCount)}`} />
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-700 truncate">{from}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-700 truncate">{to}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No navigation data available</p>
          )}
        </CardContent>
      </Card>

      {/* Top Pages */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Most Visited Pages
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topPages && topPages.length > 0 ? (
            <div className="space-y-2">
              {topPages.map((page: any, index: number) => {
                const maxCount = topPages[0].count
                const percentage = (page.count / maxCount) * 100
                
                return (
                  <div key={index} className="relative">
                    <div 
                      className="absolute inset-0 bg-green-50 rounded"
                      style={{ width: `${percentage}%` }}
                    />
                    <div className="relative flex items-center justify-between p-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Badge variant="outline" className="font-mono">
                          #{index + 1}
                        </Badge>
                        <span className="text-sm text-slate-900 truncate">{page.path}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-500">
                          {page.count} views
                        </Badge>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No page view data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
