
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Shield, CheckCircle, XCircle, Clock, Eye } from "lucide-react"
import { toast } from "sonner"

export default function ModerationSection() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/moderation')
      const json = await response.json()
      setData(json)
    } catch (error) {
      console.error("Failed to fetch moderation data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (suggestionId: string, status: string, adminNotes: string) => {
    setUpdating(suggestionId)
    try {
      const response = await fetch('/api/admin/moderation', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestionId, status, adminNotes }),
      })

      if (response.ok) {
        toast.success(`Video suggestion ${status.toLowerCase()}`)
        fetchData()
      } else {
        toast.error('Failed to update suggestion')
      }
    } catch (error) {
      console.error("Failed to update suggestion:", error)
      toast.error('Failed to update suggestion')
    } finally {
      setUpdating(null)
    }
  }

  if (loading) return <div className="text-center py-12">Loading moderation data...</div>
  if (!data) return <div className="text-center py-12">No data available</div>

  const pendingSuggestions = data.suggestions?.filter((s: any) => s.status === 'PENDING').length || 0
  const approvedSuggestions = data.suggestions?.filter((s: any) => s.status === 'APPROVED').length || 0
  const rejectedSuggestions = data.suggestions?.filter((s: any) => s.status === 'REJECTED').length || 0

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Suggestions</p>
                <p className="text-3xl font-bold text-slate-900">{data.suggestions?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-slate-700 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Pending</p>
                <p className="text-3xl font-bold text-orange-900">{pendingSuggestions}</p>
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
                <p className="text-sm font-medium text-green-600">Approved</p>
                <p className="text-3xl font-bold text-green-900">{approvedSuggestions}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-rose-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Rejected</p>
                <p className="text-3xl font-bold text-red-900">{rejectedSuggestions}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Video Suggestions */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-slate-600" />
            Video Suggestions for Review
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.suggestions?.map((suggestion: any) => (
              <SuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onUpdate={handleUpdateStatus}
                updating={updating === suggestion.id}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SuggestionCard({ suggestion, onUpdate, updating }: any) {
  const [adminNotes, setAdminNotes] = useState(suggestion.adminNotes || '')

  return (
    <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
      <div className="flex items-start gap-4">
        {/* User Info */}
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white font-medium">
          {suggestion.user?.firstName?.[0] || 'U'}
        </div>

        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-semibold text-slate-900">{suggestion.user?.name || 'Unknown User'}</h4>
              <p className="text-sm text-slate-600">{suggestion.user?.email}</p>
            </div>
            <Badge className={
              suggestion.status === 'APPROVED' ? 'bg-green-500' :
              suggestion.status === 'REJECTED' ? 'bg-red-500' :
              suggestion.status === 'UNDER_REVIEW' ? 'bg-blue-500' :
              'bg-orange-500'
            }>
              {suggestion.status}
            </Badge>
          </div>

          {/* Video URL */}
          <div className="mb-3 p-3 bg-white rounded-lg border border-slate-200">
            <div className="text-xs font-medium text-slate-500 mb-1">VIDEO URL</div>
            <a 
              href={suggestion.videoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm break-all flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {suggestion.videoUrl}
            </a>
          </div>

          {/* User Reason */}
          <div className="mb-3 p-3 bg-white rounded-lg border border-slate-200">
            <div className="text-xs font-medium text-slate-500 mb-1">USER REASON</div>
            <p className="text-sm text-slate-700">{suggestion.reason}</p>
          </div>

          {/* Admin Notes */}
          <div className="mb-3">
            <label className="text-xs font-medium text-slate-500 mb-1 block">ADMIN NOTES</label>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add admin notes..."
              className="text-sm"
              rows={2}
              disabled={updating}
            />
          </div>

          {/* Action Buttons */}
          {suggestion.status === 'PENDING' || suggestion.status === 'UNDER_REVIEW' ? (
            <div className="flex gap-3">
              <Button
                size="sm"
                className="bg-green-500 hover:bg-green-600"
                onClick={() => onUpdate(suggestion.id, 'APPROVED', adminNotes)}
                disabled={updating}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdate(suggestion.id, 'UNDER_REVIEW', adminNotes)}
                disabled={updating}
              >
                <Clock className="w-4 h-4 mr-2" />
                Under Review
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onUpdate(suggestion.id, 'REJECTED', adminNotes)}
                disabled={updating}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </div>
          ) : (
            <div className="text-sm text-slate-600">
              Decision made on {new Date(suggestion.updatedAt).toLocaleString()}
            </div>
          )}

          {/* Timestamps */}
          <div className="mt-3 text-xs text-slate-500">
            Submitted: {new Date(suggestion.createdAt).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  )
}
