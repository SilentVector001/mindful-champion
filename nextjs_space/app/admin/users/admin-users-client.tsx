// @ts-nocheck
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { format, formatDistanceToNow } from "date-fns"
import {
  Users, Search, Mail, Shield, Crown, Clock, Activity,
  ChevronRight, Eye, BarChart3, Target, Trophy, Video,
  ArrowLeft, Filter, Calendar, TrendingUp, CheckCircle, XCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminUsersClient({ users, emailLogs }: any) {
  const [search, setSearch] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [tab, setTab] = useState("users")

  const filteredUsers = users.filter((u: any) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const getRoleBadge = (role: string, tier: string) => {
    if (role === 'ADMIN') return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><Shield className="w-3 h-3 mr-1" />Admin</Badge>
    if (tier === 'PRO') return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30"><Crown className="w-3 h-3 mr-1" />Pro</Badge>
    return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Free</Badge>
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="text-slate-400">
              <ArrowLeft className="w-4 h-4 mr-2" />Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>
        <Badge className="bg-cyan-500/20 text-cyan-400">{users.length} Total Users</Badge>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="bg-slate-800/50">
          <TabsTrigger value="users"><Users className="w-4 h-4 mr-2" />All Users</TabsTrigger>
          <TabsTrigger value="activity"><Activity className="w-4 h-4 mr-2" />Activity Log</TabsTrigger>
          <TabsTrigger value="analytics"><BarChart3 className="w-4 h-4 mr-2" />Analytics</TabsTrigger>
          <TabsTrigger value="emails"><Mail className="w-4 h-4 mr-2" />Email History</TabsTrigger>
        </TabsList>

        {/* USERS TAB */}
        <TabsContent value="users" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700"
            />
          </div>

          <div className="grid gap-3">
            {filteredUsers.map((user: any) => (
              <Card key={user.id} className="bg-slate-800/50 border-slate-700 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center font-bold">
                      {user.name?.[0] || user.email?.[0] || '?'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.name || 'No Name'}</span>
                        {getRoleBadge(user.role, user.subscriptionTier)}
                        {user.welcomeEmailSent && <CheckCircle className="w-4 h-4 text-green-400" />}
                      </div>
                      <div className="text-sm text-slate-400">{user.email}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        Joined {format(new Date(user.createdAt), 'MMM d, yyyy')} • 
                        Last active {user.SecurityLog?.[0] ? formatDistanceToNow(new Date(user.SecurityLog[0].createdAt), { addSuffix: true }) : 'Never'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-sm">
                      <div className="text-slate-400">{user.Match?.length || 0} matches</div>
                      <div className="text-slate-400">{user.Goal?.length || 0} goals</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                      className="text-cyan-400"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Link href={`/admin/users/${user.id}`}>
                      <Button variant="ghost" size="sm">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Expanded Activity */}
                <AnimatePresence>
                  {selectedUser?.id === user.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-4 pt-4 border-t border-slate-700"
                    >
                      <h4 className="text-sm font-medium mb-3 text-cyan-400">Recent Activity Timeline</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {user.SecurityLog?.slice(0, 15).map((log: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 text-sm">
                            <div className="w-2 h-2 rounded-full bg-cyan-500" />
                            <span className="text-slate-500 w-32">
                              {format(new Date(log.createdAt), 'MMM d, h:mm a')}
                            </span>
                            <span className="text-slate-300">{log.action}</span>
                            {log.details && <span className="text-slate-500">- {log.details}</span>}
                          </div>
                        ))}
                        {!user.SecurityLog?.length && (
                          <div className="text-slate-500">No activity recorded</div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ACTIVITY TAB */}
        <TabsContent value="activity" className="space-y-4">
          <h3 className="text-lg font-semibold">All User Activity</h3>
          <div className="space-y-2">
            {users.flatMap((u: any) =>
              (u.SecurityLog || []).map((log: any) => ({ ...log, userName: u.name, userEmail: u.email }))
            ).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 100).map((log: any, i: number) => (
              <Card key={i} className="bg-slate-800/50 border-slate-700 p-3">
                <div className="flex items-center gap-4">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-500 w-36">{format(new Date(log.createdAt), 'MMM d, h:mm a')}</span>
                  <span className="font-medium text-cyan-400">{log.userName || log.userEmail}</span>
                  <span className="text-slate-300">{log.action}</span>
                  {log.details && <span className="text-slate-500">{log.details}</span>}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ANALYTICS TAB */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-slate-800/50 border-slate-700 p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-cyan-400" />
              <div className="text-2xl font-bold">{users.length}</div>
              <div className="text-sm text-slate-400">Total Users</div>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700 p-4 text-center">
              <Crown className="w-6 h-6 mx-auto mb-2 text-amber-400" />
              <div className="text-2xl font-bold">{users.filter((u: any) => u.subscriptionTier === 'PRO').length}</div>
              <div className="text-sm text-slate-400">Pro Users</div>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700 p-4 text-center">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-green-400" />
              <div className="text-2xl font-bold">{users.reduce((sum: number, u: any) => sum + (u.Match?.length || 0), 0)}</div>
              <div className="text-sm text-slate-400">Total Matches</div>
            </Card>
            <Card className="bg-slate-800/50 border-slate-700 p-4 text-center">
              <Video className="w-6 h-6 mx-auto mb-2 text-purple-400" />
              <div className="text-2xl font-bold">{users.reduce((sum: number, u: any) => sum + (u.VideoAnalysis?.length || 0), 0)}</div>
              <div className="text-sm text-slate-400">Video Analyses</div>
            </Card>
          </div>

          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <h3 className="font-semibold mb-4">User Signups by Day (Last 7 Days)</h3>
            <div className="flex items-end gap-2 h-32">
              {Array.from({ length: 7 }).map((_, i) => {
                const date = new Date()
                date.setDate(date.getDate() - (6 - i))
                const count = users.filter((u: any) => {
                  const created = new Date(u.createdAt)
                  return created.toDateString() === date.toDateString()
                }).length
                const height = Math.max(10, (count / Math.max(...Array.from({ length: 7 }).map((_, j) => {
                  const d = new Date()
                  d.setDate(d.getDate() - (6 - j))
                  return users.filter((u: any) => new Date(u.createdAt).toDateString() === d.toDateString()).length
                }), 1)) * 100)
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-cyan-500/80 rounded-t" style={{ height: `${height}%` }} />
                    <div className="text-xs text-slate-500 mt-1">{format(date, 'EEE')}</div>
                    <div className="text-xs text-slate-400">{count}</div>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <h3 className="font-semibold mb-4">Top Active Users</h3>
            <div className="space-y-2">
              {users
                .sort((a: any, b: any) => (b.SecurityLog?.length || 0) - (a.SecurityLog?.length || 0))
                .slice(0, 10)
                .map((user: any, i: number) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 w-6">#{i + 1}</span>
                      <span>{user.name || user.email}</span>
                    </div>
                    <span className="text-cyan-400">{user.SecurityLog?.length || 0} actions</span>
                  </div>
                ))}
            </div>
          </Card>
        </TabsContent>

        {/* EMAILS TAB */}
        <TabsContent value="emails" className="space-y-4">
          <h3 className="text-lg font-semibold">Email History ({emailLogs.length} sent)</h3>
          {emailLogs.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700 p-8 text-center">
              <Mail className="w-12 h-12 mx-auto mb-4 text-slate-500" />
              <p className="text-slate-400">No emails have been sent yet</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {emailLogs.map((log: any) => (
                <Card key={log.id} className="bg-slate-800/50 border-slate-700 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        {log.status === 'SENT' ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className="font-medium">{log.type}</span>
                        <Badge variant="outline" className="text-xs">{log.status}</Badge>
                      </div>
                      <div className="text-sm text-slate-400 mt-1">To: {log.recipientEmail}</div>
                      {log.subject && <div className="text-sm text-slate-500">Subject: {log.subject}</div>}
                    </div>
                    <div className="text-right text-sm text-slate-500">
                      {format(new Date(log.sentAt), 'MMM d, yyyy h:mm a')}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
