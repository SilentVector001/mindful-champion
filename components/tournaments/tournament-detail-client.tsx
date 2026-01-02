"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  ArrowLeft,
  CheckCircle2,
  UserPlus,
  Loader2,
  Play,
  Clock,
  Share2,
  Globe,
  Target
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BracketTree } from "@/components/tournaments/bracket-tree"
import { MatchScoreDialog } from "@/components/tournaments/match-score-dialog"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface TournamentDetailClientProps {
  tournament: any
  userRegistration: any
  isLoggedIn: boolean
}

export function TournamentDetailClient({
  tournament,
  userRegistration: initialRegistration,
  isLoggedIn
}: TournamentDetailClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [userRegistration, setUserRegistration] = useState(initialRegistration)
  const [bracketData, setBracketData] = useState<any>(null)
  const [selectedMatch, setSelectedMatch] = useState<any>(null)
  const [showScoreDialog, setShowScoreDialog] = useState(false)

  // Fetch bracket data
  useEffect(() => {
    if (tournament.bracketGenerated) {
      fetchBracket()
    }
  }, [tournament.id, tournament.bracketGenerated])

  const fetchBracket = async () => {
    try {
      const response = await fetch(`/api/tournaments/${tournament.id}/bracket`)
      const data = await response.json()
      setBracketData(data)
    } catch (error) {
      console.error('Error fetching bracket:', error)
    }
  }

  const handleRegister = async () => {
    if (!isLoggedIn) {
      toast.error('Please sign in to register')
      router.push('/auth/signin')
      return
    }

    setRegistering(true)

    try {
      const response = await fetch(`/api/tournaments/${tournament.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: 'SINGLES',
          skillLevel: 'INTERMEDIATE'
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to register')
      }

      toast.success('Registered successfully!', {
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      })

      setUserRegistration(data.registration)
      router.refresh()
    } catch (error) {
      console.error('Error registering:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to register')
    } finally {
      setRegistering(false)
    }
  }

  const handleGenerateBracket = async () => {
    setLoading(true)

    try {
      const response = await fetch(
        `/api/tournaments/${tournament.id}/bracket/generate`,
        {
          method: 'POST'
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to generate bracket')
      }

      toast.success('Bracket generated successfully!', {
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      })

      await fetchBracket()
      router.refresh()
    } catch (error) {
      console.error('Error generating bracket:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate bracket')
    } finally {
      setLoading(false)
    }
  }

  const handleMatchClick = async (matchId: string) => {
    try {
      const response = await fetch(
        `/api/tournaments/${tournament.id}/matches/${matchId}`
      )
      const data = await response.json()

      if (data.match) {
        setSelectedMatch(data.match)
        setShowScoreDialog(true)
      }
    } catch (error) {
      console.error('Error fetching match:', error)
    }
  }

  const handleMatchUpdate = () => {
    fetchBracket()
    router.refresh()
  }

  const startDate = new Date(tournament.startDate)
  const endDate = new Date(tournament.endDate)
  const now = new Date()
  const daysUntil = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  const registrationOpen = tournament.status === 'REGISTRATION_OPEN'
  const canRegister = registrationOpen && !userRegistration && tournament.currentRegistrations < (tournament.maxParticipants ?? Infinity)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto p-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/tournaments')}
            className="text-slate-300 hover:text-white mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Tournaments
          </Button>

          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-white mb-2">
                {tournament.name}
              </h1>
              {tournament.description && (
                <p className="text-lg text-slate-300 mb-4">
                  {tournament.description}
                </p>
              )}

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="h-5 w-5 text-cyan-400" />
                  <span>
                    {startDate.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="h-5 w-5 text-emerald-400" />
                  <span>{tournament.venueName}, {tournament.city}, {tournament.state}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-300">
                  <Users className="h-5 w-5 text-blue-400" />
                  <span>
                    {tournament.currentRegistrations}
                    {tournament.maxParticipants && `/${tournament.maxParticipants}`} Registered
                  </span>
                </div>

                {tournament.prizePool && tournament.prizePool > 0 && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <DollarSign className="h-5 w-5 text-yellow-400" />
                    <span>${tournament.prizePool.toLocaleString()} Prize Pool</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              {canRegister && (
                <Button
                  onClick={handleRegister}
                  disabled={registering}
                  className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white"
                >
                  {registering ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5 mr-2" />
                      Register Now
                    </>
                  )}
                </Button>
              )}

              {userRegistration && (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-sm py-2 px-4">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  You're Registered!
                </Badge>
              )}

              {!tournament.bracketGenerated && tournament.currentRegistrations >= 2 && (
                <Button
                  onClick={handleGenerateBracket}
                  disabled={loading}
                  variant="outline"
                  className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2" />
                      Generate Bracket
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="bracket" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="bracket" className="data-[state=active]:bg-cyan-500/20">
              <Trophy className="h-4 w-4 mr-2" />
              Bracket
            </TabsTrigger>
            <TabsTrigger value="players" className="data-[state=active]:bg-cyan-500/20">
              <Users className="h-4 w-4 mr-2" />
              Players ({tournament.currentRegistrations})
            </TabsTrigger>
            <TabsTrigger value="details" className="data-[state=active]:bg-cyan-500/20">
              <Clock className="h-4 w-4 mr-2" />
              Details
            </TabsTrigger>
          </TabsList>

          {/* Bracket Tab */}
          <TabsContent value="bracket" className="space-y-6">
            {tournament.bracketGenerated && bracketData ? (
              <>
                {/* Progress Card */}
                <Card className="bg-slate-800/80 border-white/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Tournament Progress</h3>
                        <p className="text-sm text-slate-400">Track match completion</p>
                      </div>
                      <Badge className="bg-cyan-500/20 text-cyan-400 text-lg px-4 py-2">
                        {bracketData.bracket?.progress ?? 0}%
                      </Badge>
                    </div>
                    <Progress
                      value={bracketData.bracket?.progress ?? 0}
                      className="h-3 bg-slate-700"
                    />
                    <div className="flex items-center justify-between mt-3 text-sm text-slate-400">
                      <span>
                        {bracketData.bracket?.completedMatches ?? 0} / {bracketData.bracket?.totalMatches ?? 0} matches complete
                      </span>
                      {bracketData.bracket?.liveMatches > 0 && (
                        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 animate-pulse">
                          {bracketData.bracket.liveMatches} live
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Bracket Tree */}
                <Card className="bg-slate-800/80 border-white/10">
                  <CardContent className="p-6">
                    <BracketTree
                      rounds={bracketData.bracket?.rounds ?? []}
                      onMatchClick={handleMatchClick}
                    />
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="bg-slate-800/80 border-white/10">
                <CardContent className="p-12 text-center">
                  <Trophy className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Bracket Not Generated
                  </h3>
                  <p className="text-slate-400 mb-6">
                    {tournament.currentRegistrations < 2
                      ? 'Waiting for more players to register...'
                      : 'Ready to generate the tournament bracket!'}
                  </p>
                  {tournament.currentRegistrations >= 2 && (
                    <Button
                      onClick={handleGenerateBracket}
                      disabled={loading}
                      className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5 mr-2" />
                          Generate Bracket Now
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Players Tab */}
          <TabsContent value="players">
            <Card className="bg-slate-800/80 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Registered Players</CardTitle>
              </CardHeader>
              <CardContent>
                {tournament.registrations && tournament.registrations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tournament.registrations.map((reg: any, index: number) => (
                      <motion.div
                        key={reg.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 bg-slate-700/50 rounded-lg border border-slate-600/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-cyan-500/20 rounded-full">
                            <Users className="h-5 w-5 text-cyan-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white truncate">
                              {reg.user?.name ?? 'Player'}
                            </p>
                            <p className="text-sm text-slate-400">
                              {reg.user?.skillLevel ?? 'Unknown'}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No players registered yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800/80 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-cyan-400" />
                    Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-slate-300">
                  <div>
                    <p className="text-sm text-slate-400">Registration Opens</p>
                    <p className="font-semibold">
                      {new Date(tournament.registrationStart).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Registration Closes</p>
                    <p className="font-semibold">
                      {new Date(tournament.registrationEnd).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Tournament Dates</p>
                    <p className="font-semibold">
                      {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/80 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-emerald-400" />
                    Venue
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-slate-300">
                  <div>
                    <p className="font-semibold">{tournament.venueName}</p>
                    <p className="text-sm text-slate-400">{tournament.address}</p>
                    <p className="text-sm text-slate-400">
                      {tournament.city}, {tournament.state} {tournament.zipCode}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/80 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    Tournament Info
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Format:</span>
                    <span className="font-semibold">
                      {tournament.bracketFormat?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Entry Fee:</span>
                    <span className="font-semibold">
                      {tournament.entryFee ? `$${tournament.entryFee}` : 'Free'}
                    </span>
                  </div>
                  {tournament.prizePool && tournament.prizePool > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Prize Pool:</span>
                      <span className="font-semibold text-yellow-400">
                        ${tournament.prizePool.toLocaleString()}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Match Score Dialog */}
      <MatchScoreDialog
        match={selectedMatch}
        tournamentId={tournament.id}
        open={showScoreDialog}
        onOpenChange={setShowScoreDialog}
        onUpdate={handleMatchUpdate}
      />
    </div>
  )
}
