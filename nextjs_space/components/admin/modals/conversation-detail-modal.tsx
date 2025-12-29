
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  MessageSquare, Flag, FileText, AlertTriangle, X,
  User, Calendar, Mail, Trophy, Lock, Unlock
} from "lucide-react"
import { format } from "date-fns"
import AddNoteModal from "./add-note-modal"
import SendWarningModal from "./send-warning-modal"
import FlagMessageModal from "./flag-message-modal"

interface ConversationDetailModalProps {
  conversationId: string
  isOpen: boolean
  onClose: () => void
  onRefresh: () => void
}

export default function ConversationDetailModal({
  conversationId,
  isOpen,
  onClose,
  onRefresh
}: ConversationDetailModalProps) {
  const [loading, setLoading] = useState(true)
  const [conversation, setConversation] = useState<any>(null)
  const [showAddNote, setShowAddNote] = useState(false)
  const [showSendWarning, setShowSendWarning] = useState(false)
  const [showFlagMessage, setShowFlagMessage] = useState<any>(null)

  useEffect(() => {
    if (isOpen && conversationId && conversationId.trim() !== '') {
      fetchConversationDetails()
    }
  }, [isOpen, conversationId])

  const fetchConversationDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/conversations/${conversationId}`)
      const data = await response.json()
      
      if (data.success) {
        setConversation(data)
      }
    } catch (error) {
      console.error('Error fetching conversation details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleAccountLock = async () => {
    try {
      const response = await fetch(`/api/admin/users/${conversation.conversation.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountLocked: !conversation.conversation.user.accountLocked,
          accountLockedReason: conversation.conversation.user.accountLocked 
            ? null 
            : 'Locked by admin for review'
        })
      })

      if (response.ok) {
        fetchConversationDetails()
        onRefresh()
      }
    } catch (error) {
      console.error('Error toggling account lock:', error)
    }
  }

  // Don't render anything if not open or no valid conversation ID
  if (!isOpen || !conversationId || conversationId.trim() === '') {
    return null
  }

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!conversation) {
    return null
  }

  const user = conversation.conversation.user

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    {user.firstName?.[0] || user.name?.[0] || 'U'}
                  </div>
                  <div>
                    <DialogTitle className="text-xl flex items-center gap-2">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user.name || 'Unknown User'
                      }
                      {user.accountLocked && (
                        <Badge variant="destructive" className="gap-1">
                          <Lock className="w-3 h-3" />
                          Locked
                        </Badge>
                      )}
                    </DialogTitle>
                    <DialogDescription className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        {user.skillLevel || 'Beginner'} ({user.playerRating || '2.0'})
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Joined {format(new Date(user.createdAt), 'MMM yyyy')}
                      </span>
                    </DialogDescription>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAddNote(true)}
                    className="gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Add Note
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowSendWarning(true)}
                    className="gap-2"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Send Warning
                  </Button>
                  <Button
                    size="sm"
                    variant={user.accountLocked ? "default" : "destructive"}
                    onClick={handleToggleAccountLock}
                    className="gap-2"
                  >
                    {user.accountLocked ? (
                      <>
                        <Unlock className="w-4 h-4" />
                        Unlock Account
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Lock Account
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogHeader>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              <Tabs defaultValue="messages" className="h-full flex flex-col">
                <TabsList className="mx-6 mt-4">
                  <TabsTrigger value="messages" className="gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Messages ({conversation.conversation.messageCount})
                  </TabsTrigger>
                  <TabsTrigger value="notes" className="gap-2">
                    <FileText className="w-4 h-4" />
                    Admin Notes ({conversation.adminNotes.length})
                  </TabsTrigger>
                  <TabsTrigger value="warnings" className="gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Warnings ({conversation.userWarnings.length})
                  </TabsTrigger>
                  <TabsTrigger value="flagged" className="gap-2">
                    <Flag className="w-4 h-4" />
                    Flagged ({conversation.flaggedMessages.length})
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-hidden px-6 pb-6">
                  {/* Messages Tab */}
                  <TabsContent value="messages" className="h-full mt-0">
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-4">
                        {conversation.conversation.messages.map((msg: any) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[70%] ${
                              msg.role === 'user' 
                                ? 'bg-blue-50 border-blue-200' 
                                : 'bg-purple-50 border-purple-200'
                            } rounded-lg border p-4 relative group`}>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <Badge variant="outline" className="text-xs">
                                  {msg.role === 'user' ? 'User' : 'Coach Kai'}
                                </Badge>
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-slate-500">
                                    {format(new Date(msg.createdAt), 'MMM d, h:mm a')}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                    onClick={() => setShowFlagMessage(msg)}
                                  >
                                    <Flag className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-sm text-slate-700">{msg.content}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* Notes Tab */}
                  <TabsContent value="notes" className="h-full mt-0">
                    <ScrollArea className="h-[500px] pr-4">
                      {conversation.adminNotes.length === 0 ? (
                        <div className="text-center py-12">
                          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-600">No admin notes yet</p>
                          <Button
                            onClick={() => setShowAddNote(true)}
                            className="mt-4"
                            size="sm"
                          >
                            Add First Note
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {conversation.adminNotes.map((note: any) => (
                            <motion.div
                              key={note.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="bg-slate-50 rounded-lg border p-4"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <Badge variant="outline" className="mb-2">
                                    {note.category}
                                  </Badge>
                                  <Badge 
                                    variant={
                                      note.severity === 'CRITICAL' ? 'destructive' :
                                      note.severity === 'HIGH' ? 'default' : 'secondary'
                                    }
                                    className="mb-2 ml-2"
                                  >
                                    {note.severity}
                                  </Badge>
                                </div>
                                <span className="text-xs text-slate-500">
                                  {format(new Date(note.createdAt), 'MMM d, yyyy h:mm a')}
                                </span>
                              </div>
                              <p className="text-sm text-slate-700 mb-2">{note.note}</p>
                              <p className="text-xs text-slate-500">By: {note.adminName}</p>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>

                  {/* Warnings Tab */}
                  <TabsContent value="warnings" className="h-full mt-0">
                    <ScrollArea className="h-[500px] pr-4">
                      {conversation.userWarnings.length === 0 ? (
                        <div className="text-center py-12">
                          <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-600">No warnings issued</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {conversation.userWarnings.map((warning: any) => (
                            <motion.div
                              key={warning.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="bg-orange-50 border border-orange-200 rounded-lg p-4"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <Badge variant="outline" className="mb-2">
                                    {warning.warningType}
                                  </Badge>
                                  <Badge 
                                    variant="destructive"
                                    className="mb-2 ml-2"
                                  >
                                    {warning.severity}
                                  </Badge>
                                  {warning.acknowledged && (
                                    <Badge variant="secondary" className="mb-2 ml-2">
                                      Acknowledged
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-xs text-slate-500">
                                  {format(new Date(warning.createdAt), 'MMM d, yyyy h:mm a')}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-slate-900 mb-2">
                                Reason: {warning.reason}
                              </p>
                              <p className="text-sm text-slate-700 mb-2 bg-white p-3 rounded border">
                                {warning.message}
                              </p>
                              <p className="text-xs text-slate-500">Issued by: {warning.adminName}</p>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>

                  {/* Flagged Messages Tab */}
                  <TabsContent value="flagged" className="h-full mt-0">
                    <ScrollArea className="h-[500px] pr-4">
                      {conversation.flaggedMessages.length === 0 ? (
                        <div className="text-center py-12">
                          <Flag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-600">No flagged messages</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {conversation.flaggedMessages.map((flag: any) => (
                            <motion.div
                              key={flag.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="bg-red-50 border border-red-200 rounded-lg p-4"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <Badge variant="destructive">
                                  {flag.reason}
                                </Badge>
                                <Badge variant="outline">
                                  {flag.status}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-500 mb-2">
                                Flagged on {format(new Date(flag.createdAt), 'MMM d, yyyy h:mm a')}
                              </p>
                              {flag.reviewNotes && (
                                <p className="text-sm text-slate-700 bg-white p-3 rounded border">
                                  {flag.reviewNotes}
                                </p>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sub-modals */}
      {showAddNote && (
        <AddNoteModal
          userId={user.id}
          isOpen={showAddNote}
          onClose={() => setShowAddNote(false)}
          onSuccess={() => {
            setShowAddNote(false)
            fetchConversationDetails()
          }}
        />
      )}

      {showSendWarning && (
        <SendWarningModal
          userId={user.id}
          userName={user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}`
            : user.name || 'User'
          }
          conversationId={conversationId}
          isOpen={showSendWarning}
          onClose={() => setShowSendWarning(false)}
          onSuccess={() => {
            setShowSendWarning(false)
            fetchConversationDetails()
          }}
        />
      )}

      {showFlagMessage && (
        <FlagMessageModal
          message={showFlagMessage}
          conversationId={conversationId}
          userId={user.id}
          isOpen={!!showFlagMessage}
          onClose={() => setShowFlagMessage(null)}
          onSuccess={() => {
            setShowFlagMessage(null)
            fetchConversationDetails()
          }}
        />
      )}
    </>
  )
}
