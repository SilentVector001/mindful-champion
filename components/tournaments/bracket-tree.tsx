"use client"

import { motion } from "framer-motion"
import { Trophy, Clock, Users, CheckCircle2, Circle, Radio } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Match {
  id: string
  roundNumber: number
  matchNumber: number
  bracketPosition: string
  isWinnerBracket: boolean
  player1Id: string | null
  player1Name: string | null
  player1Score: number | null
  player2Id: string | null
  player2Name: string | null
  player2Score: number | null
  winnerId: string | null
  winnerName: string | null
  status: string
  isLive: boolean
  courtNumber: string | null
  scheduledTime: string | null
}

interface Round {
  roundNumber: number
  roundName: string
  isWinnerBracket: boolean
  matches: Match[]
  completedMatches: number
  totalMatches: number
}

interface BracketTreeProps {
  rounds: Round[]
  onMatchClick?: (matchId: string) => void
}

export function BracketTree({ rounds, onMatchClick }: BracketTreeProps) {
  if (!rounds || rounds.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="h-16 w-16 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">No bracket generated yet</p>
      </div>
    )
  }

  // Separate winner and loser brackets
  const winnerRounds = rounds.filter((r) => r.isWinnerBracket)
  const loserRounds = rounds.filter((r) => !r.isWinnerBracket)

  return (
    <div className="space-y-8">
      {/* Winner Bracket */}
      {winnerRounds.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-1 w-12 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full" />
            <h3 className="text-xl font-bold text-white">Championship Bracket</h3>
          </div>

          <div className="overflow-x-auto pb-4">
            <div className="inline-flex gap-8 min-w-full">
              {winnerRounds.map((round) => (
                <RoundColumn
                  key={round.roundNumber}
                  round={round}
                  onMatchClick={onMatchClick}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loser Bracket */}
      {loserRounds.length > 0 && (
        <div className="space-y-4 mt-12">
          <div className="flex items-center gap-2">
            <div className="h-1 w-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full" />
            <h3 className="text-xl font-bold text-white">Loser Bracket</h3>
          </div>

          <div className="overflow-x-auto pb-4">
            <div className="inline-flex gap-8 min-w-full">
              {loserRounds.map((round) => (
                <RoundColumn
                  key={round.roundNumber}
                  round={round}
                  onMatchClick={onMatchClick}
                  isLoserBracket
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function RoundColumn({
  round,
  onMatchClick,
  isLoserBracket = false
}: {
  round: Round
  onMatchClick?: (matchId: string) => void
  isLoserBracket?: boolean
}) {
  return (
    <div className="flex flex-col min-w-[280px]">
      {/* Round Header */}
      <div className="mb-4 sticky top-0 bg-slate-900/95 backdrop-blur py-3 z-10">
        <h4 className="text-lg font-semibold text-white mb-1">
          {round.roundName}
        </h4>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <CheckCircle2 className="h-4 w-4" />
          <span>{round.completedMatches}/{round.totalMatches} complete</span>
        </div>
      </div>

      {/* Matches */}
      <div className="space-y-6 flex-1">
        {round.matches?.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            onClick={onMatchClick}
            isLoserBracket={isLoserBracket}
          />
        ))}
      </div>
    </div>
  )
}

function MatchCard({
  match,
  onClick,
  isLoserBracket = false
}: {
  match: Match
  onClick?: (matchId: string) => void
  isLoserBracket?: boolean
}) {
  const hasPlayers = match.player1Id || match.player2Id
  const isComplete = match.status === 'COMPLETED'
  const isLive = match.isLive
  const isEmpty = !match.player1Name && !match.player2Name

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: onClick ? 1.02 : 1 }}
      transition={{ duration: 0.2 }}
      onClick={() => onClick?.(match.id)}
      className={cn(
        "relative",
        onClick && "cursor-pointer"
      )}
    >
      <Card
        className={cn(
          "overflow-hidden border-2 transition-all duration-200",
          isEmpty && "bg-slate-800/30 border-slate-700/50",
          !isEmpty && !isComplete && !isLive && "bg-slate-800/60 border-slate-600/50 hover:border-slate-500",
          isLive && "bg-gradient-to-br from-red-900/30 to-orange-900/30 border-red-500/50 shadow-lg shadow-red-500/20",
          isComplete && "bg-gradient-to-br from-emerald-900/30 to-cyan-900/30 border-emerald-500/50",
          isLoserBracket && "border-orange-500/30"
        )}
      >
        {/* Live Badge */}
        {isLive && (
          <div className="absolute top-2 right-2 z-10">
            <Badge className="bg-red-500 text-white animate-pulse">
              <Radio className="h-3 w-3 mr-1" />
              LIVE
            </Badge>
          </div>
        )}

        {/* Court Number */}
        {match.courtNumber && (
          <div className="absolute top-2 left-2 z-10">
            <Badge variant="outline" className="bg-slate-800/80 text-slate-300 border-slate-600">
              Court {match.courtNumber}
            </Badge>
          </div>
        )}

        <div className="p-4 space-y-2">
          {/* Player 1 */}
          <PlayerRow
            name={match.player1Name}
            score={match.player1Score}
            isWinner={match.winnerId === match.player1Id}
            isComplete={isComplete}
            isEmpty={!match.player1Name}
          />

          {/* VS Divider */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-slate-600" />
            <span className="text-xs text-slate-500 font-medium">VS</span>
            <div className="flex-1 h-px bg-slate-600" />
          </div>

          {/* Player 2 */}
          <PlayerRow
            name={match.player2Name}
            score={match.player2Score}
            isWinner={match.winnerId === match.player2Id}
            isComplete={isComplete}
            isEmpty={!match.player2Name}
          />

          {/* Match Info */}
          {match.scheduledTime && !isComplete && (
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-700/50">
              <Clock className="h-3 w-3" />
              <span>{new Date(match.scheduledTime).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}</span>
            </div>
          )}

          {/* Empty State */}
          {isEmpty && (
            <div className="text-center py-4">
              <Users className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">TBD</p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

function PlayerRow({
  name,
  score,
  isWinner,
  isComplete,
  isEmpty
}: {
  name: string | null
  score: number | null
  isWinner: boolean
  isComplete: boolean
  isEmpty: boolean
}) {
  if (isEmpty) {
    return (
      <div className="flex items-center justify-between py-2 px-3 bg-slate-700/20 rounded-lg">
        <span className="text-sm text-slate-500">Waiting...</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between py-2 px-3 rounded-lg transition-colors",
        isWinner && isComplete && "bg-emerald-500/10 border border-emerald-500/30",
        !isWinner && isComplete && "bg-slate-700/20",
        !isComplete && "bg-slate-700/30"
      )}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {isComplete && (
          <div className="flex-shrink-0">
            {isWinner ? (
              <Trophy className="h-4 w-4 text-emerald-400" />
            ) : (
              <Circle className="h-3 w-3 text-slate-600" />
            )}
          </div>
        )}
        <span
          className={cn(
            "text-sm truncate",
            isWinner && isComplete ? "text-white font-semibold" : "text-slate-300",
            !isComplete && "text-slate-400"
          )}
        >
          {name ?? 'TBD'}
        </span>
      </div>

      {score !== null && (
        <span
          className={cn(
            "text-lg font-bold ml-2 flex-shrink-0",
            isWinner && isComplete ? "text-emerald-400" : "text-slate-400"
          )}
        >
          {score}
        </span>
      )}
    </div>
  )
}
