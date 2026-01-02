"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Bell, Mail, MessageSquare, Trophy, Target, Sparkles, Check, Phone, Shield } from "lucide-react"
import { toast } from "sonner"

interface NotificationPrefs {
  emailEnabled: boolean
  smsEnabled: boolean
  goalDeadlines: boolean
  progressUpdates: boolean
  achievementUnlocks: boolean
  dailyMotivation: boolean
}

export default function GoalNotificationPrefs({ userId }: { userId?: string }) {
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    emailEnabled: true,
    smsEnabled: false,
    goalDeadlines: true,
    progressUpdates: true,
    achievementUnlocks: true,
    dailyMotivation: false
  })
  const [phoneNumber, setPhoneNumber] = useState('')
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [showVerification, setShowVerification] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/notifications/preferences')
      if (response.ok) {
        const data = await response.json()
        if (data?.preferences) {
          setPrefs(prev => ({ ...prev, ...data.preferences }))
        }
        if (data?.phoneNumber) {
          setPhoneNumber(data.phoneNumber)
          setPhoneVerified(data.phoneNumberVerified ?? false)
        }
      }
    } catch (error) {
      console.error('Error fetching preferences:', error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: prefs })
      })
      if (response.ok) {
        toast.success('Notification preferences saved!')
      }
    } catch (error) {
      toast.error('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  const sendVerificationCode = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number')
      return
    }
    setSendingCode(true)
    try {
      const response = await fetch('/api/notifications/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      })
      if (response.ok) {
        setShowVerification(true)
        toast.success('Verification code sent!')
      } else {
        const data = await response.json()
        toast.error(data?.error ?? 'Failed to send code')
      }
    } catch (error) {
      toast.error('Failed to send verification code')
    } finally {
      setSendingCode(false)
    }
  }

  const verifyCode = async () => {
    try {
      const response = await fetch('/api/notifications/phone', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, code: verificationCode })
      })
      if (response.ok) {
        setPhoneVerified(true)
        setShowVerification(false)
        toast.success('Phone number verified!')
      } else {
        toast.error('Invalid verification code')
      }
    } catch (error) {
      toast.error('Verification failed')
    }
  }

  const categories = [
    { key: 'goalDeadlines', label: 'Goal Deadlines', icon: Target, description: 'Reminders before goal due dates', color: 'text-amber-400' },
    { key: 'progressUpdates', label: 'Progress Updates', icon: Sparkles, description: 'Weekly progress summaries', color: 'text-blue-400' },
    { key: 'achievementUnlocks', label: 'Achievement Unlocks', icon: Trophy, description: 'Celebrate when you hit milestones', color: 'text-emerald-400' },
    { key: 'dailyMotivation', label: 'Daily Motivation', icon: Bell, description: 'Inspirational tips from Coach Kai', color: 'text-purple-400' },
  ]

  return (
    <Card className="bg-slate-800/70 backdrop-blur-sm border-slate-700">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
          <Bell className="h-5 w-5 text-teal-400" />
          Goal Notification Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Delivery Channels */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Email */}
          <div className={`p-4 rounded-lg border transition-all ${
            prefs.emailEnabled 
              ? 'bg-teal-500/10 border-teal-500/30' 
              : 'bg-slate-700/50 border-slate-600'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${prefs.emailEnabled ? 'bg-teal-500/20' : 'bg-slate-600'}`}>
                  <Mail className={`h-5 w-5 ${prefs.emailEnabled ? 'text-teal-400' : 'text-slate-400'}`} />
                </div>
                <div>
                  <h4 className="font-medium text-white">Email Notifications</h4>
                  <p className="text-xs text-slate-400">Receive updates via email</p>
                </div>
              </div>
              <Switch
                checked={prefs.emailEnabled}
                onCheckedChange={(checked) => setPrefs({ ...prefs, emailEnabled: checked })}
              />
            </div>
          </div>

          {/* SMS */}
          <div className={`p-4 rounded-lg border transition-all ${
            prefs.smsEnabled 
              ? 'bg-purple-500/10 border-purple-500/30' 
              : 'bg-slate-700/50 border-slate-600'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${prefs.smsEnabled ? 'bg-purple-500/20' : 'bg-slate-600'}`}>
                  <MessageSquare className={`h-5 w-5 ${prefs.smsEnabled ? 'text-purple-400' : 'text-slate-400'}`} />
                </div>
                <div>
                  <h4 className="font-medium text-white">SMS Notifications</h4>
                  <p className="text-xs text-slate-400">
                    {phoneVerified ? 'Phone verified ✓' : 'Requires phone verification'}
                  </p>
                </div>
              </div>
              <Switch
                checked={prefs.smsEnabled}
                onCheckedChange={(checked) => setPrefs({ ...prefs, smsEnabled: checked })}
                disabled={!phoneVerified}
              />
            </div>

            {/* Phone verification */}
            {!phoneVerified && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-4 pt-4 border-t border-slate-600"
              >
                <div className="flex gap-2 mb-2">
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pl-10 bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                  <Button
                    onClick={sendVerificationCode}
                    disabled={sendingCode}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {sendingCode ? 'Sending...' : 'Verify'}
                  </Button>
                </div>

                {showVerification && (
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="bg-slate-800 border-slate-600 text-white"
                      maxLength={6}
                    />
                    <Button onClick={verifyCode} size="sm" variant="outline" className="border-slate-600 text-white">
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Notification Categories */}
        <div>
          <h4 className="text-sm font-semibold text-slate-400 mb-3">NOTIFICATION CATEGORIES</h4>
          <div className="space-y-3">
            {categories.map(cat => (
              <div
                key={cat.key}
                className={`p-4 rounded-lg border transition-all ${
                  prefs[cat.key as keyof NotificationPrefs]
                    ? 'bg-slate-700/50 border-slate-600'
                    : 'bg-slate-800/50 border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <cat.icon className={`h-5 w-5 ${cat.color}`} />
                    <div>
                      <h5 className="font-medium text-white">{cat.label}</h5>
                      <p className="text-xs text-slate-400">{cat.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={prefs[cat.key as keyof NotificationPrefs] as boolean}
                    onCheckedChange={(checked) => setPrefs({ ...prefs, [cat.key]: checked })}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </CardContent>
    </Card>
  )
}
