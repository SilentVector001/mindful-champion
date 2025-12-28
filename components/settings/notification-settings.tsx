"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell, Mail, MessageSquare, Smartphone, Check, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface NotificationPrefs {
  email: boolean
  push: boolean
  inApp: boolean
  sms: boolean
  frequency: string
  timezone: string
}

interface PhoneStatus {
  number: string | null
  verified: boolean
}

export default function NotificationSettings() {
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    email: true,
    push: true,
    inApp: true,
    sms: false,
    frequency: 'DAILY',
    timezone: 'America/New_York'
  })
  const [phone, setPhone] = useState<PhoneStatus>({ number: null, verified: false })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Phone verification state
  const [showPhoneInput, setShowPhoneInput] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [showVerification, setShowVerification] = useState(false)
  const [sendingCode, setSendingCode] = useState(false)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    fetchPreferences()
  }, [])

  const fetchPreferences = async () => {
    try {
      const res = await fetch('/api/notifications/preferences')
      if (res.ok) {
        const data = await res.json()
        setPrefs(data.preferences)
        setPhone(data.phone)
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const savePreferences = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs)
      })
      
      if (res.ok) {
        const data = await res.json()
        if (data.warning) {
          toast.warning(data.warning)
        } else {
          toast.success('Notification preferences saved!')
        }
      } else {
        toast.error('Failed to save preferences')
      }
    } catch (error) {
      toast.error('An error occurred')
    } finally {
      setSaving(false)
    }
  }

  const sendVerificationCode = async () => {
    if (!phoneNumber.match(/^\+?1?\d{10,14}$/)) {
      toast.error('Please enter a valid phone number')
      return
    }
    
    setSendingCode(true)
    try {
      const res = await fetch('/api/notifications/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      })
      
      if (res.ok) {
        toast.success('Verification code sent!')
        setShowVerification(true)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to send code')
      }
    } catch (error) {
      toast.error('Failed to send verification code')
    } finally {
      setSendingCode(false)
    }
  }

  const verifyCode = async () => {
    if (verificationCode.length !== 6) {
      toast.error('Please enter the 6-digit code')
      return
    }
    
    setVerifying(true)
    try {
      const res = await fetch('/api/notifications/phone', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode })
      })
      
      if (res.ok) {
        toast.success('Phone number verified!')
        setPhone({ number: phoneNumber.replace(/(.{3})(.*)(.{2})/, '$1*****$3'), verified: true })
        setShowPhoneInput(false)
        setShowVerification(false)
        setPhoneNumber('')
        setVerificationCode('')
        setPrefs(prev => ({ ...prev, sms: true }))
      } else {
        const data = await res.json()
        toast.error(data.error || 'Verification failed')
      }
    } catch (error) {
      toast.error('Verification failed')
    } finally {
      setVerifying(false)
    }
  }

  const removePhone = async () => {
    try {
      const res = await fetch('/api/notifications/phone', { method: 'DELETE' })
      if (res.ok) {
        toast.success('Phone number removed')
        setPhone({ number: null, verified: false })
        setPrefs(prev => ({ ...prev, sms: false }))
      }
    } catch (error) {
      toast.error('Failed to remove phone number')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-teal-500" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Choose how you want to receive updates about your goals and training
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* In-App Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
              <Bell className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <Label className="font-medium">In-App Notifications</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Show notifications within the app</p>
            </div>
          </div>
          <Switch
            checked={prefs.inApp}
            onCheckedChange={(checked) => setPrefs(prev => ({ ...prev, inApp: checked }))}
          />
        </div>

        {/* Email Notifications */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <Label className="font-medium">Email Notifications</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates via email</p>
            </div>
          </div>
          <Switch
            checked={prefs.email}
            onCheckedChange={(checked) => setPrefs(prev => ({ ...prev, email: checked }))}
          />
        </div>

        {/* SMS Notifications */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Smartphone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <Label className="font-medium">SMS Notifications</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {phone.verified 
                    ? `Sending to ${phone.number}` 
                    : 'Get text message reminders'}
                </p>
              </div>
            </div>
            <Switch
              checked={prefs.sms && phone.verified}
              disabled={!phone.verified}
              onCheckedChange={(checked) => setPrefs(prev => ({ ...prev, sms: checked }))}
            />
          </div>

          {/* Phone number setup */}
          {!phone.verified && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="pl-12"
            >
              {!showPhoneInput ? (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowPhoneInput(true)}
                >
                  Add Phone Number
                </Button>
              ) : !showVerification ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="(555) 123-4567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="max-w-[200px]"
                  />
                  <Button 
                    size="sm" 
                    onClick={sendVerificationCode}
                    disabled={sendingCode}
                  >
                    {sendingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Code'}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setShowPhoneInput(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="max-w-[150px]"
                  />
                  <Button 
                    size="sm" 
                    onClick={verifyCode}
                    disabled={verifying}
                  >
                    {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                  </Button>
                </div>
              )}
            </motion.div>
          )}

          {phone.verified && (
            <div className="pl-12">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={removePhone}
              >
                Remove Phone Number
              </Button>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t">
          <Button onClick={savePreferences} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
