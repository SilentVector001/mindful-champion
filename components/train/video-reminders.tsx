
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, X, Play, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function VideoReminders() {
  const [reminders, setReminders] = useState<any[]>([])
  const [dismissed, setDismissed] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    checkReminders()
  }, [])

  const checkReminders = async () => {
    try {
      const response = await fetch('/api/training/check-reminders')
      const data = await response.json()
      if (data.reminders && data.reminders.length > 0) {
        setReminders(data.reminders)
      }
    } catch (error) {
      console.error('Error checking reminders:', error)
    }
  }

  const dismissReminder = (videoId: string) => {
    setDismissed([...dismissed, videoId])
  }

  const continueWatching = (videoId: string) => {
    // Navigate to the video - implementation depends on your routing structure
    router.push(`/train/video/${videoId}`)
  }

  const visibleReminders = reminders.filter(r => !dismissed.includes(r.videoId))

  if (visibleReminders.length === 0) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-6"
      >
        <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-amber-900">
              <Clock className="w-5 h-5 text-amber-600" />
              Continue Your Training
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-800 mb-4">
              You have {visibleReminders.length} unfinished training {visibleReminders.length === 1 ? 'video' : 'videos'}. Pick up where you left off!
            </p>
            
            <div className="space-y-3">
              {visibleReminders.map((reminder, index) => (
                <motion.div
                  key={reminder.videoId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-amber-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {reminder.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs border-emerald-300 text-emerald-700">
                        {Math.floor(reminder.watchPercentage)}% complete
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Started {new Date(reminder.startedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => continueWatching(reminder.videoId)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Continue
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dismissReminder(reminder.videoId)}
                    className="shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
