
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, MessageSquare, CheckCircle, AlertCircle, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface Ticket {
  id: string
  category: string
  subject: string
  description: string
  status: string
  priority: string
  createdAt: string
  responses: any[]
}

const statusConfig = {
  OPEN: { label: "Open", color: "bg-champion-blue text-white", icon: AlertCircle },
  IN_PROGRESS: { label: "In Progress", color: "bg-yellow-500 text-white", icon: Clock },
  WAITING_USER: { label: "Waiting for You", color: "bg-orange-500 text-white", icon: MessageSquare },
  RESOLVED: { label: "Resolved", color: "bg-champion-green text-white", icon: CheckCircle },
  CLOSED: { label: "Closed", color: "bg-gray-500 text-white", icon: CheckCircle }
}

const priorityColors = {
  LOW: "bg-gray-100 text-gray-700",
  MEDIUM: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700"
}

export default function MyTickets() {
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/support/tickets')
      if (!response.ok) throw new Error('Failed to fetch tickets')
      const { tickets } = await response.json()
      setTickets(tickets)
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 24) {
      return `${diffHours}h ago`
    } else if (diffDays < 7) {
      return `${diffDays}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Tickets Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You haven't submitted any support tickets yet.
          </p>
          <Button
            onClick={() => router.push('/help/submit-ticket')}
            className="bg-gradient-to-r from-champion-green to-emerald-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Submit Your First Ticket
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => {
        const statusInfo = statusConfig[ticket.status as keyof typeof statusConfig]
        const StatusIcon = statusInfo.icon

        return (
          <Card
            key={ticket.id}
            className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-champion-green/30"
            onClick={() => router.push(`/help/tickets/${ticket.id}`)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge className={statusInfo.color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusInfo.label}
                    </Badge>
                    <Badge variant="outline" className={priorityColors[ticket.priority as keyof typeof priorityColors]}>
                      {ticket.priority}
                    </Badge>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(ticket.createdAt)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {ticket.subject}
                  </h3>

                  {/* Category & Responses */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{ticket.category.replace(/_/g, ' ')}</span>
                    {ticket.responses.length > 0 && (
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {ticket.responses.length} response{ticket.responses.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
