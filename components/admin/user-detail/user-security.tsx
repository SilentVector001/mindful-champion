
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react"

export default function UserSecurity({ data, onAction }: { data: any, onAction: (action: string, data?: any) => void }) {
  const { user, securityLogs, sessions } = data

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'bg-red-500'
      case 'MEDIUM': return 'bg-orange-500'
      case 'LOW': return 'bg-blue-500'
      default: return 'bg-slate-500'
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            Security Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {securityLogs.length === 0 ? (
            <p className="text-slate-600">No security events</p>
          ) : (
            <div className="space-y-2">
              {securityLogs.map((log: any) => (
                <div key={log.id} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getSeverityColor(log.severity)}>
                      {log.severity}
                    </Badge>
                    <span className="text-sm font-medium text-slate-900">
                      {log.eventType.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 mb-1">{log.description}</p>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <div className="flex flex-col gap-0.5">
                      <span>{log.timestampFormatted || new Date(log.timestamp).toLocaleString()}</span>
                      {log.relativeTime && <span className="text-slate-500">{log.relativeTime}</span>}
                    </div>
                    {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-500" />
            Recent Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-slate-600">No sessions found</p>
          ) : (
            <div className="space-y-2">
              {sessions.map((session: any) => (
                <div key={session.id} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-900">
                      {session.deviceType || 'Unknown'} • {session.browser || 'Unknown'}
                    </span>
                    {session.duration && (
                      <Badge variant="secondary">
                        {Math.round(session.duration / 60)}m
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <div className="flex items-center gap-2">
                      <span>Started: {session.startTimeFormatted || new Date(session.startTime).toLocaleString()}</span>
                      {session.startTimeRelative && <span className="text-slate-500">({session.startTimeRelative})</span>}
                    </div>
                    {session.endTime && (
                      <div>Ended: {session.endTimeFormatted || new Date(session.endTime).toLocaleString()}</div>
                    )}
                    {session.ipAddress && <div>IP: {session.ipAddress}</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
