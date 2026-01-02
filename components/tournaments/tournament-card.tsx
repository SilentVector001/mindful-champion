"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  Radio,
  ArrowRight
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TournamentCardProps {
  tournament: {
    id: string
    name: string
    description?: string
    status: string
    venueName: string
    city: string
    state: string
    startDate: string | Date
    endDate: string | Date
    bracketFormat: string
    currentRegistrations: number
    maxParticipants?: number | null
    prizePool?: number | null
    entryFee?: number | null
    bracketGenerated: boolean
  }
  index?: number
}

export function TournamentCard({ tournament, index = 0 }: TournamentCardProps) {
  const startDate = new Date(tournament.startDate)
  const endDate = new Date(tournament.endDate)
  const now = new Date()

  const daysUntil = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const isUpcoming = tournament.status === 'UPCOMING' || tournament.status === 'REGISTRATION_OPEN'
  const isInProgress = tournament.status === 'IN_PROGRESS'
  const isCompleted = tournament.status === 'COMPLETED'

  const statusConfig = {
    UPCOMING: { color: 'from-blue-500 to-cyan-500', icon: Clock, text: 'Upcoming' },
    REGISTRATION_OPEN: { color: 'from-emerald-500 to-teal-500', icon: Users, text: 'Open' },
    REGISTRATION_CLOSED: { color: 'from-orange-500 to-amber-500', icon: Clock, text: 'Closed' },
    IN_PROGRESS: { color: 'from-red-500 to-pink-500', icon: Radio, text: 'Live' },
    COMPLETED: { color: 'from-purple-500 to-indigo-500', icon: CheckCircle2, text: 'Complete' },
  }

  const config = statusConfig[tournament.status as keyof typeof statusConfig] ?? statusConfig.UPCOMING
  const StatusIcon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <Link href={`/tournaments/${tournament.id}`}>
        <Card className="group bg-slate-800/80 border-white/10 hover:border-cyan-500/50 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-cyan-500/20">
          {/* Status Banner */}
          <div className={cn(
            "h-2 bg-gradient-to-r",
            config.color
          )} />

          <CardContent className="p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
                  {tournament.name}
                </h3>
                {tournament.description && (
                  <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                    {tournament.description}
                  </p>
                )}
              </div>

              <Badge
                className={cn(
                  "flex items-center gap-1 bg-gradient-to-r text-white font-semibold shadow-lg",
                  config.color,
                  isInProgress && "animate-pulse"
                )}
              >
                <StatusIcon className="h-3 w-3" />
                {config.text}
              </Badge>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Calendar className="h-4 w-4 text-cyan-400" />
                <span>
                  {startDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                  {startDate.getTime() !== endDate.getTime() && (
                    <span className="text-slate-500"> - {endDate.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}</span>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-300">
                <MapPin className="h-4 w-4 text-emerald-400" />
                <span className="truncate">{tournament.city}, {tournament.state}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Users className="h-4 w-4 text-blue-400" />
                <span>
                  {tournament.currentRegistrations}
                  {tournament.maxParticipants && `/${tournament.maxParticipants}`} players
                </span>
              </div>

              {tournament.prizePool && tournament.prizePool > 0 && (
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <DollarSign className="h-4 w-4 text-yellow-400" />
                  <span>${tournament.prizePool.toLocaleString()} prize</span>
                </div>
              )}
            </div>

            {/* Venue */}
            <div className="pt-3 border-t border-slate-700/50">
              <p className="text-sm text-slate-400">
                <Trophy className="h-3 w-3 inline mr-1 text-cyan-400" />
                {tournament.venueName}
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-slate-700/50 text-slate-300 border-slate-600">
                  {tournament.bracketFormat.replace('_', ' ')}
                </Badge>
                {tournament.bracketGenerated && (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                    <Trophy className="h-3 w-3 mr-1" />
                    Bracket Ready
                  </Badge>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
              >
                View Details
                <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Countdown for upcoming tournaments */}
            {isUpcoming && daysUntil > 0 && daysUntil <= 30 && (
              <div className="pt-2">
                <div className="flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 rounded-lg border border-cyan-500/20">
                  <Clock className="h-4 w-4 text-cyan-400" />
                  <span className="text-sm font-medium text-cyan-300">
                    {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow!' : `${daysUntil} days until start`}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  )
}
