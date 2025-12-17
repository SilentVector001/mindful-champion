
"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertTriangle, X, Mail, CheckCircle } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

interface Warning {
  id: string
  reason: string
  warningType: string
  severity: string
  message: string
  quotedContent?: string
  emailSent: boolean
  notificationSeen: boolean
  acknowledged: boolean
  createdAt: string
}

export default function WarningNotificationPopup() {
  const { data: session, status } = useSession() || {}
  const [warnings, setWarnings] = useState<Warning[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hasChecked, setHasChecked] = useState(false)

  useEffect(() => {
    // Only check for warnings ONCE when user is logged in and is NOT an admin
    // Add a delay to avoid conflicts with other modals opening
    if (status === 'authenticated' && session?.user && session.user.role !== 'ADMIN' && !hasChecked) {
      const timer = setTimeout(() => {
        checkForUnreadWarnings()
        setHasChecked(true)
      }, 1000) // 1 second delay to avoid conflicts with page load/modals

      return () => clearTimeout(timer)
    }
  }, [status, session, hasChecked])

  const checkForUnreadWarnings = async () => {
    try {
      const response = await fetch('/api/user/warnings?unreadOnly=true', {
        credentials: 'include'
      })

      if (!response.ok) return

      const data = await response.json()

      if (data.success && data.warnings.length > 0) {
        setWarnings(data.warnings)
        setIsOpen(true)
      }
    } catch (error) {
      console.error('Error checking warnings:', error)
    }
  }

  const handleMarkAsSeen = async (warningId: string) => {
    try {
      const response = await fetch(`/api/user/warnings/${warningId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markSeen' }),
        credentials: 'include'
      })

      if (response.ok) {
        setWarnings(prev => prev.filter(w => w.id !== warningId))
        if (warnings.length <= 1) {
          setIsOpen(false)
        }
      }
    } catch (error) {
      console.error('Error marking warning as seen:', error)
    }
  }

  const handleAcknowledge = async (warningId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/user/warnings/${warningId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'acknowledge' }),
        credentials: 'include'
      })

      if (response.ok) {
        toast.success("Notice acknowledged")
        setWarnings(prev => prev.filter(w => w.id !== warningId))
        if (warnings.length <= 1) {
          setIsOpen(false)
        }
      }
    } catch (error) {
      console.error('Error acknowledging warning:', error)
      toast.error("Failed to acknowledge notice")
    } finally {
      setLoading(false)
    }
  }

  const getSeverityConfig = (severity: string) => {
    const configs = {
      LOW: { color: 'bg-blue-100 text-blue-800 border-blue-300', emoji: '💙', label: 'Advisory Notice' },
      MEDIUM: { color: 'bg-orange-100 text-orange-800 border-orange-300', emoji: '⚠️', label: 'Important Notice' },
      HIGH: { color: 'bg-red-100 text-red-800 border-red-300', emoji: '🚨', label: 'Urgent Notice' },
      FINAL: { color: 'bg-red-200 text-red-900 border-red-400', emoji: '⛔', label: 'Final Warning' }
    }
    return configs[severity as keyof typeof configs] || configs.LOW
  }

  if (warnings.length === 0) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="px-6 py-5 border-b bg-gradient-to-r from-orange-50 to-red-50">
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                  Important Notice{warnings.length > 1 ? 's' : ''}
                </DialogTitle>
                <DialogDescription className="mt-2">
                  You have {warnings.length} unread notice{warnings.length > 1 ? 's' : ''} from our team
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Content */}
          <ScrollArea className="flex-1 px-6 py-6 max-h-[calc(90vh-200px)]">
            <div className="space-y-6">
              {warnings.map((warning, index) => {
                const config = getSeverityConfig(warning.severity)
                return (
                  <motion.div
                    key={warning.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`border-2 rounded-lg ${config.color} p-5`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{config.emoji}</span>
                          <h3 className="text-lg font-bold">{config.label}</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            {warning.warningType.replace('_', ' ')}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {format(new Date(warning.createdAt), 'MMM d, yyyy h:mm a')}
                          </Badge>
                          {warning.emailSent && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <Mail className="w-3 h-3" />
                              Email Sent
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMarkAsSeen(warning.id)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Reason */}
                    {warning.reason && (
                      <div className="mb-4 p-3 bg-white/60 rounded border">
                        <p className="text-sm font-medium">
                          <span className="text-gray-600">Regarding:</span> {warning.reason}
                        </p>
                      </div>
                    )}

                    {/* Quoted Content */}
                    {warning.quotedContent && (
                      <div className="mb-4 p-4 bg-white rounded-lg border-2 border-gray-300">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                          Reference from conversation:
                        </p>
                        <p className="text-sm italic text-gray-800">
                          "{warning.quotedContent}"
                        </p>
                      </div>
                    )}

                    {/* Main Message */}
                    <div className="mb-4 p-4 bg-white rounded-lg border-2">
                      <p className="text-sm leading-relaxed text-gray-800">
                        {warning.message}
                      </p>
                    </div>

                    {/* Final Warning Alert */}
                    {warning.severity === 'FINAL' && (
                      <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                        <p className="text-sm font-bold text-red-900 mb-2">
                          ⚠️ FINAL WARNING
                        </p>
                        <p className="text-xs text-red-800">
                          This is your final warning. Continued violations may result in account suspension or termination. We value you as a member of our community and hope to resolve this matter amicably.
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAsSeen(warning.id)}
                        disabled={loading}
                      >
                        Dismiss
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAcknowledge(warning.id)}
                        disabled={loading}
                        className="gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Acknowledge & Understood
                      </Button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="px-6 py-4 border-t bg-gray-50">
            <p className="text-sm text-gray-600 text-center">
              If you have any questions or concerns, please contact support at{' '}
              <a href="mailto:deansnow59@gmail.com" className="text-green-600 font-medium hover:underline">
                deansnow59@gmail.com
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
