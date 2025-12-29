
'use client'

import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Trophy,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { format } from 'date-fns'
import { formatPrizeMoney } from '@/lib/format-prize'

interface TournamentCardProps {
  tournament: {
    id: string
    name: string
    description: string | null
    venueName: string
    city: string
    state: string
    startDate: string
    endDate: string
    status: string
    skillLevels: string[]
    format: string[]
    entryFee: number | null
    prizePool: number | null
    maxParticipants: number | null
    currentRegistrations: number
    spotsAvailable: number | null
    imageUrl: string | null
    isRegistered: boolean
    distance: number | null
  }
  onClick: () => void
}

export function TournamentCard({ tournament, onClick }: TournamentCardProps) {
  const startDate = new Date(tournament.startDate)
  const endDate = new Date(tournament.endDate)
  const isSameDay = format(startDate, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'REGISTRATION_OPEN':
        return 'bg-green-500/10 text-green-700 border-green-200'
      case 'REGISTRATION_CLOSED':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
      case 'IN_PROGRESS':
        return 'bg-blue-500/10 text-blue-700 border-blue-200'
      case 'COMPLETED':
        return 'bg-slate-500/10 text-slate-700 border-slate-200'
      default:
        return 'bg-slate-500/10 text-slate-700 border-slate-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'REGISTRATION_OPEN':
        return 'Open for Registration'
      case 'REGISTRATION_CLOSED':
        return 'Registration Closed'
      case 'IN_PROGRESS':
        return 'In Progress'
      case 'COMPLETED':
        return 'Completed'
      case 'UPCOMING':
        return 'Upcoming'
      default:
        return status
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
    <Card 
      className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-slate-200 overflow-hidden"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative aspect-video bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
        {tournament.imageUrl ? (
          <Image
            src={tournament.imageUrl}
            alt={tournament.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Trophy className="w-16 h-16 text-slate-400" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={`${getStatusColor(tournament.status)} border`}>
            {getStatusLabel(tournament.status)}
          </Badge>
        </div>

        {/* Registered Badge */}
        {tournament.isRegistered && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-teal-500/90 text-white border-0">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Registered
            </Badge>
          </div>
        )}

        {/* Distance Badge */}
        {tournament.distance && (
          <div className="absolute bottom-3 right-3">
            <Badge className="bg-white/90 text-slate-900 border-0">
              <MapPin className="w-3 h-3 mr-1" />
              {tournament.distance.toFixed(1)} mi
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-5 space-y-4">
        {/* Title and Prize Pool - At Top */}
        <div className="space-y-2 border-b border-slate-200 pb-3">
          <h3 className="font-bold text-xl text-slate-900 line-clamp-2 group-hover:text-teal-600 transition-colors">
            {tournament.name}
          </h3>
          {tournament.prizePool && (
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <span className="text-2xl font-bold text-amber-600">
                {formatPrizeMoney(tournament.prizePool)}
              </span>
              <span className="text-sm text-slate-500">prize pool</span>
            </div>
          )}
          {tournament.description && (
            <p className="text-sm text-slate-600 line-clamp-2 mt-2">
              {tournament.description}
            </p>
          )}
        </div>

        {/* Details */}
        <div className="space-y-2">
          {/* Date */}
          <div className="flex items-start gap-2 text-sm">
            <Calendar className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
            <div className="text-slate-700">
              {isSameDay ? (
                format(startDate, 'MMM d, yyyy')
              ) : (
                <>
                  {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
                </>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
            <div className="text-slate-700">
              {tournament.venueName}
              <div className="text-xs text-slate-500">
                {tournament.city}, {tournament.state}
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <div className="text-slate-700">
              {tournament.currentRegistrations}
              {tournament.maxParticipants && ` / ${tournament.maxParticipants}`} registered
              {tournament.spotsAvailable !== null && tournament.spotsAvailable > 0 && (
                <span className="text-xs text-teal-600 ml-2">
                  ({tournament.spotsAvailable} spots left)
                </span>
              )}
            </div>
          </div>

          {/* Entry Fee */}
          {tournament.entryFee && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <div className="text-slate-700">
                <span className="font-medium">${tournament.entryFee.toLocaleString()}</span>
                <span className="text-slate-500 ml-1">entry fee</span>
              </div>
            </div>
          )}
        </div>

        {/* Skill Levels & Formats */}
        <div className="flex flex-wrap gap-2">
          {tournament.skillLevels.slice(0, 3).map((level) => (
            <Badge key={level} variant="secondary" className="text-xs">
              {formatSkillLevel(level)}
            </Badge>
          ))}
          {tournament.format.slice(0, 2).map((format) => (
            <Badge key={format} variant="outline" className="text-xs">
              {formatFormatType(format)}
            </Badge>
          ))}
        </div>

        {/* Action Button */}
        <Button 
          className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  )
}
