"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Trophy,
  Plus,
  Search,
  Filter,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Clock,
  Radio
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TournamentCard } from "@/components/tournaments/tournament-card"

interface TournamentsHubClientProps {
  tournaments: any[]
}

export function TournamentsHubClient({ tournaments }: TournamentsHubClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Filter tournaments
  const filteredTournaments = tournaments?.filter((tournament) => {
    const matchesSearch = tournament.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tournament.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tournament.state?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || tournament.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Categorize tournaments
  const upcomingTournaments = filteredTournaments?.filter(
    (t) => t.status === 'UPCOMING' || t.status === 'REGISTRATION_OPEN' || t.status === 'REGISTRATION_CLOSED'
  )
  const liveTournaments = filteredTournaments?.filter(
    (t) => t.status === 'IN_PROGRESS'
  )
  const completedTournaments = filteredTournaments?.filter(
    (t) => t.status === 'COMPLETED'
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border-b border-white/10">
        <div className="max-w-7xl mx-auto p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  <Trophy className="h-10 w-10 text-cyan-400" />
                  Tournaments
                </h1>
                <p className="text-lg text-slate-300">
                  Compete, conquer, and climb the ranks
                </p>
              </div>

              <Button
                onClick={() => router.push('/tournaments/create')}
                className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Tournament
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card className="bg-slate-800/80 border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/20 rounded-xl">
                    <Calendar className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{upcomingTournaments?.length ?? 0}</p>
                    <p className="text-sm text-slate-400">Upcoming</p>
                  </div>
                </div>
              </Card>

              <Card className="bg-slate-800/80 border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-500/20 rounded-xl">
                    <Radio className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{liveTournaments?.length ?? 0}</p>
                    <p className="text-sm text-slate-400">Live Now</p>
                  </div>
                </div>
              </Card>

              <Card className="bg-slate-800/80 border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/20 rounded-xl">
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{completedTournaments?.length ?? 0}</p>
                    <p className="text-sm text-slate-400">Completed</p>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search tournaments by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-400"
            />
          </div>

          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList className="bg-slate-800/50 border border-slate-700">
              <TabsTrigger value="all" className="data-[state=active]:bg-cyan-500/20">
                All
              </TabsTrigger>
              <TabsTrigger value="REGISTRATION_OPEN" className="data-[state=active]:bg-cyan-500/20">
                Open
              </TabsTrigger>
              <TabsTrigger value="IN_PROGRESS" className="data-[state=active]:bg-cyan-500/20">
                Live
              </TabsTrigger>
              <TabsTrigger value="COMPLETED" className="data-[state=active]:bg-cyan-500/20">
                Completed
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Live Tournaments */}
        {liveTournaments && liveTournaments.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-1 w-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full" />
              <h2 className="text-2xl font-bold text-white">Live Now</h2>
              <Badge className="bg-red-500 text-white animate-pulse">
                <Radio className="h-3 w-3 mr-1" />
                {liveTournaments.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveTournaments.map((tournament, index) => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Tournaments */}
        {upcomingTournaments && upcomingTournaments.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-1 w-12 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full" />
              <h2 className="text-2xl font-bold text-white">Upcoming Tournaments</h2>
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                {upcomingTournaments.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingTournaments.map((tournament, index) => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Tournaments */}
        {completedTournaments && completedTournaments.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-1 w-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" />
              <h2 className="text-2xl font-bold text-white">Past Tournaments</h2>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                {completedTournaments.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedTournaments.map((tournament, index) => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredTournaments && filteredTournaments.length === 0 && (
          <Card className="bg-slate-800/80 border-white/10 p-12">
            <div className="text-center">
              <Trophy className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No tournaments found
              </h3>
              <p className="text-slate-400 mb-6">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Be the first to create a tournament!'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button
                  onClick={() => router.push('/tournaments/create')}
                  className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Tournament
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
