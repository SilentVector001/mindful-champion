
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, Search, Flag, Eye, AlertTriangle, 
  Calendar, User, MessageCircle, Filter, ChevronRight
} from "lucide-react"
import { format } from "date-fns"
import ConversationDetailModal from "../modals/conversation-detail-modal"

interface KaiConversationsSectionProps {
  data?: any
}

export default function KaiConversationsSection({ data }: KaiConversationsSectionProps) {
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [flaggedOnly, setFlaggedOnly] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchConversations()
  }, [page, flaggedOnly, searchTerm])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        flaggedOnly: flaggedOnly.toString(),
        ...(searchTerm && { search: searchTerm })
      })
      
      const response = await fetch(`/api/admin/conversations?${params}`, {
        credentials: 'include', // Include session cookies
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (!response.ok) {
        console.error('API Error:', response.status, response.statusText)
        const errorData = await response.json()
        console.error('Error details:', errorData)
        setConversations([])
        return
      }
      
      const data = await response.json()
      
      if (data.success) {
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  const handleViewConversation = (conversationId: string) => {
    setSelectedConversation(conversationId)
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              Coach Kai Conversations
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Monitor and review AI coaching conversations
            </p>
          </div>
          <Button
            onClick={fetchConversations}
            variant="outline"
            size="sm"
          >
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by user name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant={flaggedOnly ? "default" : "outline"}
                onClick={() => setFlaggedOnly(!flaggedOnly)}
                className="gap-2"
              >
                <Flag className="w-4 h-4" />
                {flaggedOnly ? "Showing Flagged" : "Show Flagged Only"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Conversations List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-slate-600">Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600">No conversations found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {conversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        {/* User Info */}
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {conversation.user?.firstName?.[0] || conversation.user?.name?.[0] || 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-slate-900">
                                {conversation.user?.firstName && conversation.user?.lastName 
                                  ? `${conversation.user.firstName} ${conversation.user.lastName}`
                                  : conversation.user?.name || 'Unknown User'
                                }
                              </h3>
                              {conversation.user?.accountLocked && (
                                <Badge variant="destructive" className="text-xs">
                                  Locked
                                </Badge>
                              )}
                              {conversation.flaggedCount > 0 && (
                                <Badge variant="destructive" className="gap-1 text-xs">
                                  <Flag className="w-3 h-3" />
                                  {conversation.flaggedCount} Flagged
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-600">
                              {conversation.user?.email}
                            </p>
                          </div>
                        </div>

                        {/* Conversation Stats */}
                        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {conversation.messageCount} messages
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {conversation.user?.skillLevel || 'Beginner'} Level
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Last: {format(new Date(conversation.updatedAt), 'MMM d, yyyy')}
                          </div>
                        </div>

                        {/* Recent Messages Preview */}
                        {conversation.messages && conversation.messages.length > 0 ? (
                          <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                            <p className="text-xs font-medium text-slate-700">Recent Messages:</p>
                            {conversation.messages.slice(0, 2).map((msg: any, idx: number) => (
                              <div key={idx} className="text-xs">
                                <span className={`font-medium ${
                                  msg.role === 'user' ? 'text-blue-600' : 'text-purple-600'
                                }`}>
                                  {msg.role === 'user' ? 'User' : 'Coach Kai'}:
                                </span>
                                <span className="text-slate-600 ml-1">
                                  {msg.content.length > 100 
                                    ? `${msg.content.substring(0, 100)}...` 
                                    : msg.content
                                  }
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                            <p className="text-xs text-amber-700 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              No messages yet - Conversation started but user hasn&apos;t sent any messages
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <Button
                        onClick={() => handleViewConversation(conversation.id)}
                        className="gap-2 whitespace-nowrap"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Conversation Detail Modal */}
      <ConversationDetailModal
        conversationId={selectedConversation || ''}
        isOpen={!!selectedConversation}
        onClose={() => setSelectedConversation(null)}
        onRefresh={fetchConversations}
      />
    </>
  )
}
