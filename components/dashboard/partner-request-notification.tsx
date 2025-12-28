
"use client"

import { useEffect, useState } from "react"
import { Bell, X, Users, CheckCircle, XCircle, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"

interface PartnerRequest {
  id: string
  senderId: string
  senderName: string
  skillLevel?: string
  rating?: number
  location?: string
  message?: string | null
  createdAt: string
}

interface PartnerRequestNotificationProps {
  requests: PartnerRequest[]
  onClose?: () => void
}

export default function PartnerRequestNotification({ requests, onClose }: PartnerRequestNotificationProps) {
  const [visible, setVisible] = useState(true)
  const [activeRequest, setActiveRequest] = useState<PartnerRequest | null>(null)
  const [counterOfferMessage, setCounterOfferMessage] = useState("")
  const [isResponding, setIsResponding] = useState(false)
  const router = useRouter()

  if (!visible || requests.length === 0) return null

  const handleClose = () => {
    setVisible(false)
    onClose?.()
  }

  const handleAccept = async (requestId: string) => {
    setIsResponding(true)
    try {
      const res = await fetch(`/api/partners/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ACCEPT' })
      })

      if (!res.ok) throw new Error('Failed to accept request')

      toast.success("Partner request accepted! 🎉", {
        description: "You can now connect with your new practice partner."
      })

      router.refresh()
      setActiveRequest(null)
    } catch (error) {
      toast.error("Failed to accept request")
    } finally {
      setIsResponding(false)
    }
  }

  const handleDecline = async (requestId: string) => {
    setIsResponding(true)
    try {
      const res = await fetch(`/api/partners/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DECLINE' })
      })

      if (!res.ok) throw new Error('Failed to decline request')

      toast.success("Partner request declined")
      router.refresh()
      setActiveRequest(null)
    } catch (error) {
      toast.error("Failed to decline request")
    } finally {
      setIsResponding(false)
    }
  }

  const handleCounterOffer = async (requestId: string) => {
    if (!counterOfferMessage.trim()) {
      toast.error("Please enter a message for your counter offer")
      return
    }

    setIsResponding(true)
    try {
      const res = await fetch(`/api/partners/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'COUNTER_OFFER',
          message: counterOfferMessage 
        })
      })

      if (!res.ok) throw new Error('Failed to send counter offer')

      toast.success("Counter offer sent! 💬")
      router.refresh()
      setActiveRequest(null)
      setCounterOfferMessage("")
    } catch (error) {
      toast.error("Failed to send counter offer")
    } finally {
      setIsResponding(false)
    }
  }

  const handleViewAll = () => {
    router.push('/connect/partners?tab=requests')
    handleClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-teal-500/20">
        <CardHeader className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {requests.length === 1 ? 'New Partner Request!' : `${requests.length} New Partner Requests!`}
                </CardTitle>
                <CardDescription className="text-teal-50">
                  Someone wants to connect with you! 🏓
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-4">
          {!activeRequest ? (
            // List view
            <>
              {requests.map((request) => (
                <Card key={request.id} className="border-2 border-slate-200 hover:border-teal-500/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg text-slate-900">
                            {request.senderName}
                          </h3>
                          {request.skillLevel && (
                            <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                              {request.skillLevel} {request.rating && `• ${request.rating}`}
                            </Badge>
                          )}
                        </div>
                        {request.location && (
                          <p className="text-sm text-slate-600 mb-2">📍 {request.location}</p>
                        )}
                        {request.message && (
                          <div className="mt-3 p-3 bg-teal-50 border-l-4 border-teal-500 rounded">
                            <p className="text-sm text-slate-700 italic">"{request.message}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={() => handleAccept(request.id)}
                        disabled={isResponding}
                        className="flex-1 bg-teal-600 hover:bg-teal-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        onClick={() => setActiveRequest(request)}
                        disabled={isResponding}
                        variant="outline"
                        className="flex-1 border-slate-300"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Counter Offer
                      </Button>
                      <Button
                        onClick={() => handleDecline(request.id)}
                        disabled={isResponding}
                        variant="outline"
                        className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            // Counter offer view
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={() => setActiveRequest(null)}
                className="mb-2"
              >
                ← Back to requests
              </Button>
              
              <Card className="border-2 border-slate-200">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg text-slate-900 mb-2">
                    Counter offer to {activeRequest.senderName}
                  </h3>
                  {activeRequest.message && (
                    <div className="mb-4 p-3 bg-slate-50 border-l-4 border-slate-300 rounded">
                      <p className="text-sm text-slate-600">Their message:</p>
                      <p className="text-sm text-slate-700 italic mt-1">"{activeRequest.message}"</p>
                    </div>
                  )}
                  <Textarea
                    placeholder="Send them a message with your availability, preferred times, or other details..."
                    value={counterOfferMessage}
                    onChange={(e) => setCounterOfferMessage(e.target.value)}
                    rows={4}
                    className="mb-4"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleCounterOffer(activeRequest.id)}
                      disabled={isResponding || !counterOfferMessage.trim()}
                      className="flex-1 bg-teal-600 hover:bg-teal-700"
                    >
                      Send Counter Offer
                    </Button>
                    <Button
                      onClick={() => setActiveRequest(null)}
                      variant="outline"
                      disabled={isResponding}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>

        {!activeRequest && (
          <CardFooter className="bg-slate-50 border-t flex justify-between items-center">
            <p className="text-sm text-slate-600">
              You can also manage requests from the Connect section
            </p>
            <Button
              onClick={handleViewAll}
              variant="outline"
              className="border-teal-600 text-teal-600 hover:bg-teal-50"
            >
              View All Requests
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
