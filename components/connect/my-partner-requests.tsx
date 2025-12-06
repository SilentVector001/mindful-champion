
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  UserPlus, 
  UserCheck, 
  Clock, 
  CheckCircle2, 
  XCircle,
  MessageSquare,
  Send,
  Star,
  MapPin,
  Calendar,
  AlertCircle,
  Sparkles,
  Mail,
  UserX
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "react-hot-toast"
import { formatDistanceToNow } from "date-fns"

interface RequestData {
  id: string
  partnerId?: string
  partnerName?: string
  senderId?: string
  senderName?: string
  skillLevel?: string
  rating?: string
  location?: string
  message?: string
  responseMessage?: string
  status: string
  createdAt: string
  respondedAt?: string
}

interface MyPartnerRequestsProps {
  user: any
}

export default function MyPartnerRequests({ user }: MyPartnerRequestsProps) {
  const [sentRequests, setSentRequests] = useState<RequestData[]>([])
  const [receivedRequests, setReceivedRequests] = useState<RequestData[]>([])
  const [connections, setConnections] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(null)
  const [showResponseDialog, setShowResponseDialog] = useState(false)
  const [responseMessage, setResponseMessage] = useState('')
  const [responseAction, setResponseAction] = useState<'accept' | 'decline' | 'counter'>('accept')

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    setIsLoading(true)
    await Promise.all([
      loadRequests(),
      loadConnections()
    ])
    setIsLoading(false)
  }

  const loadRequests = async () => {
    try {
      const response = await fetch('/api/partners/requests')
      if (response.ok) {
        const data = await response.json()
        setSentRequests(data.sent || [])
        setReceivedRequests(data.received || [])
      }
    } catch (error) {
      console.error('Failed to load requests:', error)
      toast.error('Failed to load requests')
    }
  }

  const loadConnections = async () => {
    try {
      // You might want to create this endpoint
      const response = await fetch('/api/partners/connections')
      if (response.ok) {
        const data = await response.json()
        setConnections(data.connections || [])
      }
    } catch (error) {
      console.error('Failed to load connections:', error)
    }
  }

  const handleAccept = async (requestId: string) => {
    try {
      const response = await fetch(`/api/partners/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ACCEPT' })
      })

      if (response.ok) {
        toast.success('✅ Partner request accepted!')
        loadAllData()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to accept request')
      }
    } catch (error) {
      console.error('Failed to accept request:', error)
      toast.error('Failed to accept request')
    }
  }

  const handleDecline = async (requestId: string) => {
    try {
      const response = await fetch(`/api/partners/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DECLINE' })
      })

      if (response.ok) {
        toast.success('Request declined')
        loadAllData()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to decline request')
      }
    } catch (error) {
      console.error('Failed to decline request:', error)
      toast.error('Failed to decline request')
    }
  }

  const handleCounterOffer = async () => {
    if (!selectedRequest || !responseMessage.trim()) {
      toast.error('Please enter a message')
      return
    }

    try {
      const response = await fetch(`/api/partners/requests/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'COUNTER_OFFER',
          message: responseMessage 
        })
      })

      if (response.ok) {
        toast.success('💬 Counter offer sent!')
        setShowResponseDialog(false)
        setResponseMessage('')
        loadAllData()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to send counter offer')
      }
    } catch (error) {
      console.error('Failed to send counter offer:', error)
      toast.error('Failed to send counter offer')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'DECLINED':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <CheckCircle2 className="h-4 w-4" />
      case 'PENDING':
        return <Clock className="h-4 w-4" />
      case 'DECLINED':
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
        <p className="text-slate-600 mt-4">Loading your requests...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Mail className="h-6 w-6" />
              </div>
              <span className="text-3xl font-bold">{receivedRequests.length}</span>
            </div>
            <h3 className="text-lg font-semibold">Received</h3>
            <p className="text-white/80 text-sm">Pending your response</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-500 to-cyan-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Send className="h-6 w-6" />
              </div>
              <span className="text-3xl font-bold">{sentRequests.length}</span>
            </div>
            <h3 className="text-lg font-semibold">Sent</h3>
            <p className="text-white/80 text-sm">Awaiting response</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <UserCheck className="h-6 w-6" />
              </div>
              <span className="text-3xl font-bold">
                {[...sentRequests, ...receivedRequests].filter(r => r.status === 'ACCEPTED').length}
              </span>
            </div>
            <h3 className="text-lg font-semibold">Accepted</h3>
            <p className="text-white/80 text-sm">Active connections</p>
          </CardContent>
        </Card>
      </div>

      {/* Requests Tabs */}
      <Tabs defaultValue="received" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2 mb-6">
          <TabsTrigger value="received" className="gap-2">
            <Mail className="h-4 w-4" />
            Received ({receivedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="sent" className="gap-2">
            <Send className="h-4 w-4" />
            Sent ({sentRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-4">
          {receivedRequests.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                  <Mail className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">No received requests</h3>
                <p className="text-slate-600 mb-6">
                  When other players send you practice partner requests, they'll appear here
                </p>
                <Button
                  onClick={() => window.location.href = '/connect/partners'}
                  className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Find Partners
                </Button>
              </CardContent>
            </Card>
          ) : (
            receivedRequests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 flex-wrap">
                      <Avatar className="h-16 w-16 ring-4 ring-purple-100">
                        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xl font-bold">
                          {request.senderName?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3 gap-4">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">{request.senderName}</h3>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {request.skillLevel && (
                                <Badge className="bg-gradient-to-r from-teal-600 to-cyan-600">
                                  {request.skillLevel}
                                </Badge>
                              )}
                              {request.rating && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="font-semibold">{request.rating}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className={getStatusColor(request.status)}>
                            {getStatusIcon(request.status)}
                            <span className="ml-1">{request.status}</span>
                          </Badge>
                        </div>

                        {request.location && (
                          <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                            <MapPin className="h-4 w-4 text-teal-600" />
                            <span>{request.location}</span>
                          </div>
                        )}

                        {request.message && (
                          <div className="bg-slate-50 rounded-lg p-4 mb-4">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="h-4 w-4 text-slate-500 mt-1 flex-shrink-0" />
                              <p className="text-slate-700 text-sm">{request.message}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</span>
                        </div>

                        {request.status === 'PENDING' && (
                          <div className="flex gap-2 flex-wrap">
                            <Button
                              onClick={() => handleAccept(request.id)}
                              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            >
                              <UserCheck className="h-4 w-4 mr-2" />
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedRequest(request)
                                setResponseAction('counter')
                                setShowResponseDialog(true)
                              }}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Counter Offer
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleDecline(request.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          {sentRequests.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center">
                  <Send className="h-10 w-10 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">No sent requests</h3>
                <p className="text-slate-600 mb-6">
                  Start connecting with practice partners to see your sent requests here
                </p>
                <Button
                  onClick={() => window.location.href = '/connect/partners'}
                  className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Find Partners
                </Button>
              </CardContent>
            </Card>
          ) : (
            sentRequests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 flex-wrap">
                      <Avatar className="h-16 w-16 ring-4 ring-teal-100">
                        <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white text-xl font-bold">
                          {request.partnerName?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3 gap-4">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">{request.partnerName}</h3>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {request.skillLevel && (
                                <Badge className="bg-gradient-to-r from-teal-600 to-cyan-600">
                                  {request.skillLevel}
                                </Badge>
                              )}
                              {request.rating && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="font-semibold">{request.rating}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className={getStatusColor(request.status)}>
                            {getStatusIcon(request.status)}
                            <span className="ml-1">{request.status}</span>
                          </Badge>
                        </div>

                        {request.location && (
                          <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                            <MapPin className="h-4 w-4 text-teal-600" />
                            <span>{request.location}</span>
                          </div>
                        )}

                        {request.message && (
                          <div className="bg-slate-50 rounded-lg p-4 mb-3">
                            <div className="text-xs text-slate-500 font-medium mb-1">Your message:</div>
                            <p className="text-slate-700 text-sm">{request.message}</p>
                          </div>
                        )}

                        {request.responseMessage && (
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-3 border border-purple-200">
                            <div className="flex items-start gap-2">
                              <Sparkles className="h-4 w-4 text-purple-600 mt-1 flex-shrink-0" />
                              <div>
                                <div className="text-xs text-purple-700 font-medium mb-1">Their response:</div>
                                <p className="text-purple-900 text-sm">{request.responseMessage}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Calendar className="h-3 w-3" />
                          <span>Sent {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</span>
                          {request.respondedAt && (
                            <>
                              <span>•</span>
                              <span>Responded {formatDistanceToNow(new Date(request.respondedAt), { addSuffix: true })}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Response Dialog */}
      <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              Send Counter Offer
            </DialogTitle>
            <DialogDescription>
              Suggest alternative times or arrangements to {selectedRequest?.senderName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="response" className="text-sm font-medium mb-2 block">
                Your message
              </Label>
              <Textarea
                id="response"
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Thanks for reaching out! I'm usually available on weekends in the morning. Would that work for you?"
                rows={5}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowResponseDialog(false)
              setResponseMessage('')
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleCounterOffer}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Counter Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
