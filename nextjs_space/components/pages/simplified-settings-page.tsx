
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  User, 
  Bell, 
  Palette, 
  Crown,
  Camera,
  Save,
  Settings as SettingsIcon,
  CreditCard,
  Shield,
  Moon,
  Sun,
  Watch
} from "lucide-react"
import Image from "next/image"
import SimplifiedNav from "@/components/layout/simplified-nav"
import PersistentAvatar from "@/components/avatar/persistent-avatar"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"

interface SimplifiedSettingsPageProps {
  user: any
}

export default function SimplifiedSettingsPage({ user }: SimplifiedSettingsPageProps) {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  // Form states
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [playerRating, setPlayerRating] = useState(user?.playerRating || '2.0')
  const [skillLevel, setSkillLevel] = useState(user?.skillLevel || 'BEGINNER')
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC')
  
  // Avatar settings
  const [avatarName, setAvatarName] = useState(user?.avatarName || 'Coach')
  const [voiceEnabled, setVoiceEnabled] = useState(user?.avatarVoiceEnabled ?? true)
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [trainingReminders, setTrainingReminders] = useState(true)

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          playerRating,
          skillLevel,
          timezone,
          avatarName,
          avatarVoiceEnabled: voiceEnabled
        })
      })
      
      if (response.ok) {
        // Success feedback
        console.log('Profile updated successfully')
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const settingsSections = [
    {
      title: "Profile",
      icon: User,
      gradient: "from-blue-500 to-cyan-500",
      component: (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="playerRating">Player Rating</Label>
              <Select value={playerRating} onValueChange={setPlayerRating}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.0">1.0 - New to Pickleball</SelectItem>
                  <SelectItem value="2.0">2.0 - Beginner</SelectItem>
                  <SelectItem value="2.5">2.5 - Beginner+</SelectItem>
                  <SelectItem value="3.0">3.0 - Intermediate</SelectItem>
                  <SelectItem value="3.5">3.5 - Intermediate+</SelectItem>
                  <SelectItem value="4.0">4.0 - Advanced</SelectItem>
                  <SelectItem value="4.5">4.5 - Advanced+</SelectItem>
                  <SelectItem value="5.0">5.0 - Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="skillLevel">Skill Level</Label>
              <Select value={skillLevel} onValueChange={setSkillLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select skill level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                  <SelectItem value="PRO">Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button onClick={handleSaveProfile} disabled={isLoading} className="w-full md:w-auto">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      )
    },
    {
      title: "Avatar Coach",
      icon: Camera,
      gradient: "from-purple-500 to-pink-500",
      component: (
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-purple-500">
              <Image
                src={user?.avatarPhotoUrl || '/avatars/coach-female-1.jpg'}
                alt="Avatar"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Your AI Coach</h4>
              <p className="text-sm text-slate-600">Customize your coaching companion</p>
            </div>
          </div>
          
          <div>
            <Label htmlFor="avatarName">Coach Name</Label>
            <Input
              id="avatarName"
              value={avatarName}
              onChange={(e) => setAvatarName(e.target.value)}
              placeholder="Give your coach a name"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="voiceEnabled">Voice Coaching</Label>
              <p className="text-sm text-slate-600">Enable text-to-speech for your coach</p>
            </div>
            <Switch
              id="voiceEnabled"
              checked={voiceEnabled}
              onCheckedChange={setVoiceEnabled}
            />
          </div>
          
          <Button 
            onClick={() => router.push('/settings/avatar')}
            variant="outline"
            className="w-full"
          >
            <Camera className="h-4 w-4 mr-2" />
            Customize Avatar Appearance
          </Button>
        </div>
      )
    },
    {
      title: "Connect Devices",
      icon: Watch,
      gradient: "from-indigo-500 to-purple-500",
      component: (
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
              <Watch className="h-8 w-8 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Wearable Devices</h4>
              <p className="text-sm text-slate-600">Connect your fitness trackers for personalized coaching</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
            <p className="text-sm text-slate-700 mb-3">
              Connect devices like Apple Watch, Fitbit, Garmin, or Whoop to help Coach Kai provide insights based on your:
            </p>
            <ul className="text-sm text-slate-600 space-y-1 ml-4">
              <li>• Heart rate and recovery data</li>
              <li>• Sleep quality and patterns</li>
              <li>• Activity levels and readiness</li>
              <li>• Stress and HRV metrics</li>
            </ul>
          </div>
          
          <Button 
            onClick={() => router.push('/settings/devices')}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
          >
            <Watch className="h-4 w-4 mr-2" />
            Manage Connected Devices
          </Button>
        </div>
      )
    },
    {
      title: "Notifications",
      icon: Bell,
      gradient: "from-green-500 to-emerald-500",
      component: (
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center">
              <Bell className="h-8 w-8 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">Notification Preferences</h4>
              <p className="text-sm text-slate-600">Customize when and how you receive notifications</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-4">
            <p className="text-sm text-slate-700 mb-3">
              Manage notification preferences for:
            </p>
            <ul className="text-sm text-slate-600 space-y-1 ml-4">
              <li>• Goals & Training updates</li>
              <li>• Video Analysis insights</li>
              <li>• Tournament & Match alerts</li>
              <li>• Media Center content</li>
              <li>• Account & Achievements</li>
            </ul>
          </div>
          
          <Button 
            onClick={() => router.push('/settings/notifications')}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
          >
            <Bell className="h-4 w-4 mr-2" />
            Manage Notification Preferences
          </Button>
        </div>
      )
    },
    {
      title: "Appearance",
      icon: Palette,
      gradient: "from-orange-500 to-red-500",
      component: (
        <div className="space-y-4">
          <div>
            <Label>Theme Preference</Label>
            <div className="flex gap-3 mt-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
              >
                <Sun className="h-4 w-4 mr-2" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
              >
                <Moon className="h-4 w-4 mr-2" />
                Dark
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('system')}
              >
                <SettingsIcon className="h-4 w-4 mr-2" />
                System
              </Button>
            </div>
          </div>
          
          <div>
            <Label>Interface Density</Label>
            <p className="text-sm text-slate-600 mb-2">Choose your preferred layout style</p>
            <Select defaultValue="comfortable">
              <SelectTrigger>
                <SelectValue placeholder="Select density" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="comfortable">Comfortable</SelectItem>
                <SelectItem value="spacious">Spacious</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <SimplifiedNav />
      
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-600 to-slate-800 bg-clip-text text-transparent mb-2">
            Settings ⚙️
          </h1>
          <p className="text-slate-600 mb-4">
            Customize your Mindful Champion experience
          </p>

          {/* Subscription Status */}
          <Card className="bg-gradient-to-r from-teal-50 to-orange-50 border-teal-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-teal-800">
                      {user?.subscriptionTier || 'FREE'} Champion
                    </div>
                    <div className="text-sm text-teal-600">
                      {user?.isTrialActive ? 'Trial Active' : 'Subscription Active'}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/pricing')}
                  className="border-teal-200 text-teal-700 hover:bg-teal-50"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {settingsSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-0 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className={`w-8 h-8 bg-gradient-to-r ${section.gradient} rounded-lg flex items-center justify-center`}>
                      <section.icon className="w-4 h-4 text-white" />
                    </div>
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {section.component}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Advanced Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-slate-500 to-slate-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                Account & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                Export My Data
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Privacy Settings
              </Button>
              <Button variant="destructive" className="w-full justify-start">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Persistent Avatar */}
      <PersistentAvatar currentPage="settings" />
    </div>
  )
}
