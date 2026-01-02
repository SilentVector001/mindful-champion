"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Globe,
  Loader2,
  CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
]

export function CreateTournamentForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    venueName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    startDate: "",
    endDate: "",
    registrationStart: "",
    registrationEnd: "",
    format: ["SINGLES"],
    skillLevels: ["INTERMEDIATE"],
    bracketFormat: "SINGLE_ELIMINATION",
    maxParticipants: "32",
    entryFee: "",
    prizePool: "",
    websiteUrl: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/tournaments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to create tournament')
      }

      toast.success('Tournament created successfully!', {
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      })

      // Redirect to tournament page
      router.push(`/tournaments/${data.tournament?.id}`)
    } catch (error) {
      console.error('Error creating tournament:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create tournament')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-slate-800/80 border-white/10 shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-white">Create Tournament</CardTitle>
                <p className="text-sm text-slate-400 mt-1">Set up your pickleball tournament</p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-cyan-400" />
                  Tournament Details
                </h3>

                <div>
                  <Label htmlFor="name" className="text-slate-300">Tournament Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., Spring Championship 2025"
                    required
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-slate-300">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Describe your tournament..."
                    rows={3}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Venue Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-emerald-400" />
                  Venue Information
                </h3>

                <div>
                  <Label htmlFor="venueName" className="text-slate-300">Venue Name *</Label>
                  <Input
                    id="venueName"
                    value={formData.venueName}
                    onChange={(e) => handleChange('venueName', e.target.value)}
                    placeholder="e.g., Riverside Pickleball Complex"
                    required
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="text-slate-300">Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="123 Main Street"
                    required
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-slate-300">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      placeholder="City"
                      required
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="state" className="text-slate-300">State *</Label>
                    <Select value={formData.state} onValueChange={(value) => handleChange('state', value)}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        {US_STATES.map((state) => (
                          <SelectItem key={state} value={state} className="text-white hover:bg-slate-700">
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="zipCode" className="text-slate-300">Zip Code *</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => handleChange('zipCode', e.target.value)}
                      placeholder="12345"
                      required
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-400" />
                  Tournament Schedule
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="registrationStart" className="text-slate-300">Registration Opens *</Label>
                    <Input
                      id="registrationStart"
                      type="datetime-local"
                      value={formData.registrationStart}
                      onChange={(e) => handleChange('registrationStart', e.target.value)}
                      required
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="registrationEnd" className="text-slate-300">Registration Closes *</Label>
                    <Input
                      id="registrationEnd"
                      type="datetime-local"
                      value={formData.registrationEnd}
                      onChange={(e) => handleChange('registrationEnd', e.target.value)}
                      required
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="startDate" className="text-slate-300">Tournament Starts *</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => handleChange('startDate', e.target.value)}
                      required
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate" className="text-slate-300">Tournament Ends *</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => handleChange('endDate', e.target.value)}
                      required
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Tournament Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-400" />
                  Tournament Settings
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bracketFormat" className="text-slate-300">Bracket Format *</Label>
                    <Select value={formData.bracketFormat} onValueChange={(value) => handleChange('bracketFormat', value)}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        <SelectItem value="SINGLE_ELIMINATION" className="text-white hover:bg-slate-700">
                          Single Elimination
                        </SelectItem>
                        <SelectItem value="DOUBLE_ELIMINATION" className="text-white hover:bg-slate-700">
                          Double Elimination
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="maxParticipants" className="text-slate-300">Max Participants *</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) => handleChange('maxParticipants', e.target.value)}
                      min="2"
                      max="128"
                      required
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="entryFee" className="text-slate-300">Entry Fee ($)</Label>
                    <Input
                      id="entryFee"
                      type="number"
                      value={formData.entryFee}
                      onChange={(e) => handleChange('entryFee', e.target.value)}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <Label htmlFor="prizePool" className="text-slate-300">Prize Pool ($)</Label>
                    <Input
                      id="prizePool"
                      type="number"
                      value={formData.prizePool}
                      onChange={(e) => handleChange('prizePool', e.target.value)}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="websiteUrl" className="text-slate-300">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e) => handleChange('websiteUrl', e.target.value)}
                    placeholder="https://..."
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1 bg-slate-700/50 border-slate-600 text-white hover:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Trophy className="h-5 w-5 mr-2" />
                      Create Tournament
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
