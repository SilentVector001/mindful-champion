'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Trophy,
  ExternalLink,
  Mail,
  Phone,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  XCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface TournamentDetailProps {
  tournament: {
    id: string
    name: string
    description: string | null
    organizerName: string
    organizerEmail: string | null
    organizerPhone: string | null
    venueName: string
    address: string
    city: string
    state: string
    zipCode: string
    startDate: string
    endDate: string
    registrationStart: string
    registrationEnd: string
    status: string
    skillLevels: string[]
    format: string[]
    entryFee: number | null
    prizePool: number | null
    maxParticipants: number | null
    currentRegistrations: number
    spotsAvailable: number | null
    websiteUrl: string | null
    registrationUrl: string | null
    imageUrl: string | null
    isRegistered: boolean
    distance: number | null
  }
  open: boolean
  onClose: () => void
  onRegistrationUpdate: (tournamentId: string, registered: boolean) => void
}

export function TournamentDetail({ tournament, open, onClose, onRegistrationUpdate }: TournamentDetailProps) {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  // Form state
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('')
  const [selectedFormat, setSelectedFormat] = useState('')
  const [partnerName, setPartnerName] = useState('')
  const [partnerEmail, setPartnerEmail] = useState('')
  const [notes, setNotes] = useState('')

  const startDate = new Date(tournament.startDate)
  const endDate = new Date(tournament.endDate)
  const regStart = new Date(tournament.registrationStart)
  const regEnd = new Date(tournament.registrationEnd)

  const canRegister = 
    tournament.status === 'REGISTRATION_OPEN' &&
    (!tournament.maxParticipants || tournament.currentRegistrations < tournament.maxParticipants) &&
    !tournament.isRegistered

  const handleRegister = async () => {
    if (!selectedSkillLevel || !selectedFormat) {
      toast.error('Please select skill level and format')
      return
    }

    try {
      setRegistering(true)
      const response = await fetch('/api/tournaments/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournamentId: tournament.id,
          skillLevel: selectedSkillLevel,
          format: selectedFormat,
          partnerName: partnerName || undefined,
          partnerEmail: partnerEmail || undefined,
          notes: notes || undefined
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Registration failed')
      }

      toast.success('Successfully registered for tournament!')
      setShowRegistrationForm(false)
      onRegistrationUpdate(tournament.id, true)
      
      // Reset form
      setSelectedSkillLevel('')
      setSelectedFormat('')
      setPartnerName('')
      setPartnerEmail('')
      setNotes('')
    } catch (error: any) {
      console.error('Registration error:', error)
      toast.error(error.message || 'Failed to register')
    } finally {
      setRegistering(false)
    }
  }

  const handleCancelRegistration = async () => {
    try {
      setCancelling(true)
      const response = await fetch(`/api/tournaments/register?tournamentId=${tournament.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to cancel registration')
      }

      toast.success('Registration cancelled')
      onRegistrationUpdate(tournament.id, false)
    } catch (error: any) {
      console.error('Cancellation error:', error)
      toast.error(error.message || 'Failed to cancel registration')
    } finally {
      setCancelling(false)
    }
  }

  const formatSkillLevel = (level: string) => {
    return level.charAt(0) + level.slice(1).toLowerCase()
  }

  const formatFormatType = (format: string) => {
    return format.split('_').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ')
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            {tournament.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image */}
          {tournament.imageUrl && (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100">
              <Image
                src={tournament.imageUrl}
                alt={tournament.name}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Status and Registration Status */}
          <div className="flex gap-2">
            <Badge className={
              tournament.status === 'REGISTRATION_OPEN' 
                ? 'bg-green-500/10 text-green-700 border-green-200' 
                : 'bg-slate-500/10 text-slate-700 border-slate-200'
            }>
              {tournament.status.replace(/_/g, ' ')}
            </Badge>
            {tournament.isRegistered && (
              <Badge className="bg-teal-500 text-white">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                You're Registered
              </Badge>
            )}
            {tournament.distance && (
              <Badge variant="outline">
                <MapPin className="w-3 h-3 mr-1" />
                {tournament.distance.toFixed(1)} miles away
              </Badge>
            )}
          </div>

          {/* Description */}
          {tournament.description && (
            <p className="text-slate-700 leading-relaxed">
              {tournament.description}
            </p>
          )}

          <Separator />

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date & Time */}
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                Tournament Dates
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-600">Event:</span>
                  <div className="font-medium text-slate-900">
                    {format(startDate, 'MMMM d, yyyy')} - {format(endDate, 'MMMM d, yyyy')}
                  </div>
                </div>
                <div>
                  <span className="text-slate-600">Registration:</span>
                  <div className="font-medium text-slate-900">
                    {format(regStart, 'MMM d')} - {format(regEnd, 'MMM d, yyyy')}
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-600" />
                Location
              </h3>
              <div className="text-sm space-y-1">
                <div className="font-medium text-slate-900">{tournament.venueName}</div>
                <div className="text-slate-600">{tournament.address}</div>
                <div className="text-slate-600">
                  {tournament.city}, {tournament.state} {tournament.zipCode}
                </div>
              </div>
            </div>

            {/* Organizer */}
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                Organizer
              </h3>
              <div className="text-sm space-y-2">
                <div className="font-medium text-slate-900">{tournament.organizerName}</div>
                {tournament.organizerEmail && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${tournament.organizerEmail}`} className="hover:text-teal-600">
                      {tournament.organizerEmail}
                    </a>
                  </div>
                )}
                {tournament.organizerPhone && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${tournament.organizerPhone}`} className="hover:text-teal-600">
                      {tournament.organizerPhone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Participants & Fees */}
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-teal-600" />
                Tournament Info
              </h3>
              <div className="text-sm space-y-2">
                <div>
                  <span className="text-slate-600">Participants:</span>
                  <div className="font-medium text-slate-900">
                    {tournament.currentRegistrations}
                    {tournament.maxParticipants && ` / ${tournament.maxParticipants}`}
                    {tournament.spotsAvailable !== null && tournament.spotsAvailable > 0 && (
                      <span className="text-teal-600 ml-2">
                        ({tournament.spotsAvailable} spots left)
                      </span>
                    )}
                  </div>
                </div>
                {tournament.entryFee !== null && (
                  <div>
                    <span className="text-slate-600">Entry Fee:</span>
                    <div className="font-medium text-slate-900">${tournament.entryFee.toFixed(2)}</div>
                  </div>
                )}
                {tournament.prizePool && (
                  <div>
                    <span className="text-slate-600">Prize Pool:</span>
                    <div className="font-medium text-amber-600">
                      ${tournament.prizePool.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Skill Levels */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Skill Levels</h3>
            <div className="flex flex-wrap gap-2">
              {tournament.skillLevels.map((level) => (
                <Badge key={level} variant="secondary" className="text-sm px-3 py-1">
                  {formatSkillLevel(level)}
                </Badge>
              ))}
            </div>
          </div>

          {/* Formats */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Formats Available</h3>
            <div className="flex flex-wrap gap-2">
              {tournament.format.map((format) => (
                <Badge key={format} variant="outline" className="text-sm px-3 py-1">
                  {formatFormatType(format)}
                </Badge>
              ))}
            </div>
          </div>

          {/* Links */}
          {(tournament.websiteUrl || tournament.registrationUrl) && (
            <>
              <Separator />
              <div className="flex gap-3">
                {tournament.websiteUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={tournament.websiteUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Tournament Website
                    </a>
                  </Button>
                )}
                {tournament.registrationUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a href={tournament.registrationUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      External Registration
                    </a>
                  </Button>
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Registration Section */}
          {tournament.isRegistered ? (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <CheckCircle2 className="w-6 h-6 text-teal-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-teal-900 text-lg">You're Registered!</h3>
                  <p className="text-teal-700 text-sm mt-1">
                    You'll receive confirmation details via email.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
                onClick={handleCancelRegistration}
                disabled={cancelling}
              >
                {cancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Registration
                  </>
                )}
              </Button>
            </div>
          ) : showRegistrationForm ? (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-slate-900 text-lg">Registration Form</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="skillLevel">Your Skill Level *</Label>
                  <Select value={selectedSkillLevel} onValueChange={setSelectedSkillLevel}>
                    <SelectTrigger id="skillLevel">
                      <SelectValue placeholder="Select your skill level" />
                    </SelectTrigger>
                    <SelectContent>
                      {tournament.skillLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {formatSkillLevel(level)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="format">Preferred Format *</Label>
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger id="format">
                      <SelectValue placeholder="Select tournament format" />
                    </SelectTrigger>
                    <SelectContent>
                      {tournament.format.map((format) => (
                        <SelectItem key={format} value={format}>
                          {formatFormatType(format)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {(selectedFormat === 'DOUBLES' || selectedFormat === 'MIXED_DOUBLES') && (
                  <>
                    <div>
                      <Label htmlFor="partnerName">Partner Name (Optional)</Label>
                      <Input
                        id="partnerName"
                        placeholder="Enter partner's name"
                        value={partnerName}
                        onChange={(e) => setPartnerName(e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="partnerEmail">Partner Email (Optional)</Label>
                      <Input
                        id="partnerEmail"
                        type="email"
                        placeholder="partner@email.com"
                        value={partnerEmail}
                        onChange={(e) => setPartnerEmail(e.target.value)}
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requests or information..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleRegister}
                  disabled={registering || !selectedSkillLevel || !selectedFormat}
                  className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
                >
                  {registering ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowRegistrationForm(false)}
                  disabled={registering}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : canRegister ? (
            <Button
              onClick={() => setShowRegistrationForm(true)}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
              size="lg"
            >
              Register for Tournament
            </Button>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-slate-500 mt-1" />
                <div>
                  <h3 className="font-semibold text-slate-900">Registration Not Available</h3>
                  <p className="text-slate-600 text-sm mt-1">
                    {tournament.status === 'REGISTRATION_CLOSED' 
                      ? 'Registration for this tournament has closed.'
                      : tournament.maxParticipants && tournament.currentRegistrations >= tournament.maxParticipants
                      ? 'This tournament is full.'
                      : 'Registration is not currently open for this tournament.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
