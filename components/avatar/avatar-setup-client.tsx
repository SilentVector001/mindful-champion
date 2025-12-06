
"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Upload, Sparkles, User, Volume2, VolumeX, Check } from "lucide-react"
import Image from "next/image"
import AvatarCoach from "./avatar-coach"
import { useRouter } from "next/navigation"

interface AvatarSetupClientProps {
  user: {
    id: string
    subscriptionTier: string
    avatarEnabled?: boolean
    avatarType?: string | null
    avatarPhotoUrl?: string | null
    avatarName?: string | null
    avatarVoiceEnabled?: boolean
    avatarCustomization?: any
  }
}

const presetAvatars = [
  { id: "coach-female-1", name: "Coach Sarah", image: "/avatars/coach-female-1.jpg", description: "Professional & Encouraging" },
  { id: "coach-male-1", name: "Coach Mike", image: "/avatars/coach-male-1.jpg", description: "Athletic & Motivating" },
  { id: "coach-female-young", name: "Coach Emma", image: "/avatars/coach-female-young.jpg", description: "Energetic & Modern" },
  { id: "coach-male-senior", name: "Coach Tom", image: "/avatars/coach-male-senior.jpg", description: "Experienced & Wise" },
  { id: "coach-female-2", name: "Coach Maya", image: "/avatars/coach-female-2.jpg", description: "Confident & Inspiring" },
  { id: "coach-male-2", name: "Coach James", image: "/avatars/coach-male-2.jpg", description: "Friendly & Professional" },
]

export default function AvatarSetupClient({ user }: AvatarSetupClientProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatarType || presetAvatars[0].id)
  const [avatarName, setAvatarName] = useState(user.avatarName || "Coach")
  const [voiceEnabled, setVoiceEnabled] = useState(user.avatarVoiceEnabled ?? true)
  const [avatarEnabled, setAvatarEnabled] = useState(user.avatarEnabled ?? false)
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(user.avatarPhotoUrl || null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, etc.)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/avatar/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      setUploadedPhoto(data.url)
      setSelectedAvatar('photo')
      
      toast({
        title: "Photo uploaded! 📸",
        description: "Your custom avatar photo has been uploaded successfully.",
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const response = await fetch('/api/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          avatarEnabled,
          avatarType: selectedAvatar,
          avatarPhotoUrl: selectedAvatar === 'photo' ? uploadedPhoto : null,
          avatarName,
          avatarVoiceEnabled: voiceEnabled,
        }),
      })

      if (!response.ok) throw new Error('Save failed')

      toast({
        title: "Avatar saved! ✨",
        description: "Your AI coach is ready to motivate you!",
      })

      router.push('/dashboard')
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save avatar settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const selectedPreset = presetAvatars.find(a => a.id === selectedAvatar)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            Setup Your AI Coach Avatar
          </h1>
          <p className="text-slate-600">
            Customize Coach Kai's appearance and voice (Pro Feature)
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Configuration */}
          <div className="space-y-6">
            {/* Enable Avatar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-500" />
                  Enable AI Avatar Coach
                </CardTitle>
                <CardDescription>
                  Activate your personalized AI coaching companion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show avatar throughout app</p>
                    <p className="text-sm text-slate-600">Your coach will appear on dashboard and training pages</p>
                  </div>
                  <Switch
                    checked={avatarEnabled}
                    onCheckedChange={setAvatarEnabled}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preset Avatars */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-teal-500" />
                  Choose Your Coach
                </CardTitle>
                <CardDescription>
                  Select from our diverse coaching professionals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {presetAvatars.map((avatar) => (
                    <motion.button
                      key={avatar.id}
                      onClick={() => setSelectedAvatar(avatar.id)}
                      className={`relative group cursor-pointer ${
                        selectedAvatar === avatar.id
                          ? 'ring-2 ring-teal-500 ring-offset-2'
                          : 'hover:ring-2 hover:ring-slate-300 hover:ring-offset-2'
                      } rounded-lg transition-all`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                        <Image
                          src={avatar.image}
                          alt={avatar.name}
                          fill
                          className="object-cover"
                        />
                        {selectedAvatar === avatar.id && (
                          <div className="absolute inset-0 bg-teal-500/20 flex items-center justify-center">
                            <Check className="w-8 h-8 text-white drop-shadow-lg" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-medium mt-2 text-center">{avatar.name}</p>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upload Custom Photo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-teal-500" />
                  Upload Custom Photo
                </CardTitle>
                <CardDescription>
                  Use your own photo as your coach avatar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>Uploading...</>
                  ) : uploadedPhoto ? (
                    <>Change Photo</>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                    </>
                  )}
                </Button>
                {uploadedPhoto && (
                  <div className="mt-4 relative w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-teal-500">
                    <Image
                      src={uploadedPhoto}
                      alt="Uploaded avatar"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-500" />
                  Customize Coach
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Coach Name */}
                <div>
                  <Label htmlFor="avatarName">Coach Name</Label>
                  <Input
                    id="avatarName"
                    value={avatarName}
                    onChange={(e) => setAvatarName(e.target.value)}
                    placeholder="Coach"
                    className="mt-2"
                  />
                </div>

                {/* Voice Toggle */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    {voiceEnabled ? (
                      <Volume2 className="w-5 h-5 text-teal-500" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-slate-400" />
                    )}
                    <div>
                      <p className="font-medium">Enable Voice</p>
                      <p className="text-sm text-slate-600">Text-to-speech for coach messages</p>
                    </div>
                  </div>
                  <Switch
                    checked={voiceEnabled}
                    onCheckedChange={setVoiceEnabled}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white h-12 text-lg"
            >
              {isSaving ? "Saving..." : "Save & Activate Coach"}
            </Button>
          </div>

          {/* Right Column - Preview */}
          <div className="lg:sticky lg:top-8 h-fit">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  See how your coach will appear in the app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {avatarEnabled ? (
                  <>
                    <AvatarCoach
                      message={`Hi! I'm ${avatarName}, your personal AI pickleball coach. I'm here to help you improve your game, track your progress, and celebrate your victories! Let's work together to make you a champion! 🏆`}
                      avatarType={selectedAvatar === 'photo' ? undefined : selectedAvatar}
                      avatarPhotoUrl={selectedAvatar === 'photo' ? uploadedPhoto || undefined : undefined}
                      avatarName={avatarName}
                      voiceEnabled={voiceEnabled}
                      size="lg"
                    />
                    
                    <div className="pt-6 border-t">
                      <p className="text-sm font-medium text-slate-700 mb-4">
                        Your coach will appear:
                      </p>
                      <ul className="space-y-2 text-sm text-slate-600">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-teal-500" />
                          Dashboard welcome messages
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-teal-500" />
                          Training tips and guidance
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-teal-500" />
                          Match analysis insights
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-teal-500" />
                          Goal celebrations
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-teal-500" />
                          Motivational messages
                        </li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Avatar Disabled</p>
                    <p className="text-sm mt-2">Enable your AI coach to see the preview</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
