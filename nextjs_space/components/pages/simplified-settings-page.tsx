// @ts-nocheck
"use client"

import { useState, useEffect } from "react"
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
  Mail,
  Phone,
  Crown,
  Save,
  Settings as SettingsIcon,
  Target,
  Zap,
  CheckCircle,
  AlertCircle,
  Sparkles
} from "lucide-react"
import MainNavigation from "@/components/navigation/main-navigation"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface SimplifiedSettingsPageProps {
  user: any
}

export default function SimplifiedSettingsPage({ user }: SimplifiedSettingsPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  
  // Profile form states
  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [email, setEmail] = useState(user?.email || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [playerRating, setPlayerRating] = useState(user?.playerRating || '2.0')
  const [skillLevel, setSkillLevel] = useState(user?.skillLevel || 'BEGINNER')
  
  // Email preference states (from notificationPreferences JSON)
  const prefs = user?.notificationPreferences as any
  const [goalReminders, setGoalReminders] = useState(prefs?.emailGoalReminders ?? true)
  const [weeklyProgress, setWeeklyProgress] = useState(prefs?.emailWeeklyProgress ?? true)
  const [tournamentAlerts, setTournamentAlerts] = useState(prefs?.emailTournamentAlerts ?? true)
  const [coachTips, setCoachTips] = useState(prefs?.emailCoachTips ?? true)

  const handleSaveProfile = async () => {
    setIsLoading(true)
    setSaveSuccess(false)
    try {
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          playerRating,
          skillLevel,
          emailGoalReminders: goalReminders,
          emailWeeklyProgress: weeklyProgress,
          emailTournamentAlerts: tournamentAlerts,
          emailCoachTips: coachTips
        })
      })
      
      if (response.ok) {
        setSaveSuccess(true)
        toast({
          title: "Settings Saved!",
          description: "Your profile has been updated successfully."
        })
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Subscription info
  const subscriptionTier = user?.subscriptionTier || 'FREE'
  const trialEndsAt = user?.trialEndsAt ? new Date(user.trialEndsAt) : null
  const isTrialActive = trialEndsAt && trialEndsAt > new Date()
  const daysLeft = trialEndsAt ? Math.ceil((trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <MainNavigation user={user} />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Settings</h1>
              <p className="text-gray-400">Manage your profile and preferences</p>
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          {/* Subscription Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 border-slate-700/50 backdrop-blur-xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-emerald-500 to-amber-500" />
              <CardContent className="p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                      <Crown className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-white">
                          {subscriptionTier === 'PRO' ? 'Pro Member' : isTrialActive ? 'Free Trial' : 'Free Plan'}
                        </h3>
                        {isTrialActive && (
                          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                            <Sparkles className="w-3 h-3 mr-1" />
                            {daysLeft} days left
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mt-1">
                        {subscriptionTier === 'PRO' 
                          ? 'Full access to all features'
                          : isTrialActive 
                            ? 'Enjoying full Pro features during your trial'
                            : 'Upgrade for full access'}
                      </p>
                    </div>
                  </div>
                  {subscriptionTier !== 'PRO' && (
                    <Button 
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg"
                      onClick={() => router.push('/pricing')}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Upgrade to Pro
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-xl">
              <CardHeader className="border-b border-slate-700/50">
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-cyan-400" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-gray-300">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Your first name"
                      className="mt-1.5 bg-slate-800/50 border-slate-600 text-white focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-gray-300">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Your last name"
                      className="mt-1.5 bg-slate-800/50 border-slate-600 text-white focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="text-gray-300 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-cyan-400" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      disabled
                      className="mt-1.5 bg-slate-800/30 border-slate-700 text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Contact support to change email</p>
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-gray-300 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-400" />
                      Phone Number
                      <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400 ml-1">
                        Beta
                      </Badge>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="mt-1.5 bg-slate-800/50 border-slate-600 text-white focus:border-cyan-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">For SMS notifications (coming soon)</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="playerRating" className="text-gray-300">Player Rating (DUPR)</Label>
                    <Select value={playerRating} onValueChange={setPlayerRating}>
                      <SelectTrigger className="mt-1.5 bg-slate-800/50 border-slate-600 text-white">
                        <SelectValue placeholder="Select rating" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="1.0">1.0 - New to Pickleball</SelectItem>
                        <SelectItem value="2.0">2.0 - Beginner</SelectItem>
                        <SelectItem value="2.5">2.5 - Beginner+</SelectItem>
                        <SelectItem value="3.0">3.0 - Intermediate</SelectItem>
                        <SelectItem value="3.5">3.5 - Intermediate+</SelectItem>
                        <SelectItem value="4.0">4.0 - Advanced</SelectItem>
                        <SelectItem value="4.5">4.5 - Advanced+</SelectItem>
                        <SelectItem value="5.0">5.0+ - Expert/Pro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="skillLevel" className="text-gray-300">Skill Level</Label>
                    <Select value={skillLevel} onValueChange={setSkillLevel}>
                      <SelectTrigger className="mt-1.5 bg-slate-800/50 border-slate-600 text-white">
                        <SelectValue placeholder="Select skill level" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="BEGINNER">Beginner</SelectItem>
                        <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                        <SelectItem value="ADVANCED">Advanced</SelectItem>
                        <SelectItem value="PRO">Professional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Email Preferences Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur-xl">
              <CardHeader className="border-b border-slate-700/50">
                <CardTitle className="text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-cyan-400" />
                  Email Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-700/30">
                  <div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-400" />
                      <span className="text-white font-medium">Goal Reminders</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Get reminded about your training goals and milestones</p>
                  </div>
                  <Switch
                    checked={goalReminders}
                    onCheckedChange={setGoalReminders}
                    className="data-[state=checked]:bg-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-slate-700/30">
                  <div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span className="text-white font-medium">Weekly Progress Reports</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Receive a summary of your weekly training progress</p>
                  </div>
                  <Switch
                    checked={weeklyProgress}
                    onCheckedChange={setWeeklyProgress}
                    className="data-[state=checked]:bg-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-slate-700/30">
                  <div>
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-purple-400" />
                      <span className="text-white font-medium">Tournament Alerts</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Get notified about upcoming tournaments in your area</p>
                  </div>
                  <Switch
                    checked={tournamentAlerts}
                    onCheckedChange={setTournamentAlerts}
                    className="data-[state=checked]:bg-cyan-500"
                  />
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span className="text-white font-medium">Coach Tips & Updates</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Personalized tips from Coach Kai and product updates</p>
                  </div>
                  <Switch
                    checked={coachTips}
                    onCheckedChange={setCoachTips}
                    className="data-[state=checked]:bg-cyan-500"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-end"
          >
            <Button 
              onClick={handleSaveProfile} 
              disabled={isLoading}
              className={`px-8 py-3 font-semibold shadow-lg transition-all ${
                saveSuccess 
                  ? 'bg-emerald-500 hover:bg-emerald-600' 
                  : 'bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600'
              }`}
            >
              {isLoading ? (
                <><span className="animate-spin mr-2">⏳</span> Saving...</>
              ) : saveSuccess ? (
                <><CheckCircle className="w-5 h-5 mr-2" /> Saved!</>
              ) : (
                <><Save className="w-5 h-5 mr-2" /> Save Changes</>
              )}
            </Button>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
