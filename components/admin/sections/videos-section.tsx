
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Video, Play, Download, Eye } from "lucide-react"

export default function VideosSection() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/videos')
      const json = await response.json()
      setData(json)
    } catch (error) {
      console.error("Failed to fetch videos data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-12">Loading videos data...</div>
  if (!data) return <div className="text-center py-12">No data available</div>

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Clips</p>
                <p className="text-3xl font-bold text-purple-900">{data.clips?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Storage</p>
                <p className="text-3xl font-bold text-blue-900">
                  {((data.clips?.reduce((sum: number, clip: any) => sum + (clip.size || 0), 0) || 0) / (1024 * 1024 * 1024)).toFixed(2)} GB
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Download className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Avg Duration</p>
                <p className="text-3xl font-bold text-orange-900">
                  {data.clips?.length > 0 
                    ? Math.floor((data.clips?.reduce((sum: number, clip: any) => sum + (clip.duration || 0), 0) || 0) / data.clips.length / 60)
                    : 0} min
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Play className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Video Clips List */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Uploaded Video Clips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.clips?.map((clip: any) => (
              <div key={clip.id} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-20 bg-slate-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {clip.thumbnailUrl ? (
                      <img src={clip.thumbnailUrl} alt={clip.title} className="w-full h-full object-cover" />
                    ) : (
                      <Play className="w-8 h-8 text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold text-slate-900">{clip.title}</h4>
                      <Badge variant="secondary">{clip.user?.name || 'Unknown User'}</Badge>
                    </div>
                    {clip.description && (
                      <p className="text-sm text-slate-600 mb-2">{clip.description}</p>
                    )}
                    <div className="flex gap-4 text-sm text-slate-600">
                      {clip.duration && (
                        <div>Duration: <span className="font-medium">{Math.floor(clip.duration / 60)}:{(clip.duration % 60).toString().padStart(2, '0')}</span></div>
                      )}
                      {clip.size && (
                        <div>Size: <span className="font-medium">{(clip.size / (1024 * 1024)).toFixed(2)} MB</span></div>
                      )}
                      <div>Uploaded: {new Date(clip.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <a 
                      href={clip.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
