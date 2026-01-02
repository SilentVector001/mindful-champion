"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Trophy,
  X,
  CheckCircle2,
  Loader2,
  Calendar,
  MapPin
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Match {
  id: string
  player1Name: string | null
  player2Name: string | null
  player1Score: number | null
  player2Score: number | null
  status: string
  courtNumber: string | null
  courtLocation: string | null
  scheduledTime: string | null
  notes: string | null
}

interface MatchScoreDialogProps {
  match: Match | null
  tournamentId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

export function MatchScoreDialog({
  match,
  tournamentId,
  open,
  onOpenChange,
  onUpdate
}: MatchScoreDialogProps) {
  const [loading, setLoading] = useState(false)
  const [player1Score, setPlayer1Score] = useState(match?.player1Score?.toString() ?? "")
  const [player2Score, setPlayer2Score] = useState(match?.player2Score?.toString() ?? "")
  const [courtNumber, setCourtNumber] = useState(match?.courtNumber ?? "")
  const [courtLocation, setCourtLocation] = useState(match?.courtLocation ?? "")
  const [notes, setNotes] = useState(match?.notes ?? "")

  const handleSubmit = async (status: 'IN_PROGRESS' | 'COMPLETED') => {
    if (!match) return

    setLoading(true)

    try {
      const response = await fetch(
        `/api/tournaments/${tournamentId}/matches/${match.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            player1Score: player1Score || null,
            player2Score: player2Score || null,
            status,
            courtNumber: courtNumber || null,
            courtLocation: courtLocation || null,
            notes: notes || null
          })
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to update match')
      }

      toast.success(
        status === 'COMPLETED' ? 'Match completed!' : 'Match updated!',
        {
          icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        }
      )

      onUpdate()
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating match:', error)
      toast.error(
        error instanceof Error ? error.message : 'Failed to update match'
      )
    } finally {
      setLoading(false)
    }
  }

  if (!match) return null

  const canComplete = player1Score && player2Score && player1Score !== player2Score

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Trophy className="h-6 w-6 text-cyan-400" />
            Update Match
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Players */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
              <div>
                <p className="text-sm text-slate-400">Player 1</p>
                <p className="text-lg font-semibold">{match.player1Name ?? 'TBD'}</p>
              </div>
              <div className="flex flex-col items-end">
                <Label className="text-xs text-slate-400 mb-1">Score</Label>
                <Input
                  type="number"
                  value={player1Score}
                  onChange={(e) => setPlayer1Score(e.target.value)}
                  min="0"
                  max="21"
                  className="w-20 text-center text-2xl font-bold bg-slate-600 border-slate-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-center">
              <span className="text-sm font-medium text-slate-400">VS</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
              <div>
                <p className="text-sm text-slate-400">Player 2</p>
                <p className="text-lg font-semibold">{match.player2Name ?? 'TBD'}</p>
              </div>
              <div className="flex flex-col items-end">
                <Label className="text-xs text-slate-400 mb-1">Score</Label>
                <Input
                  type="number"
                  value={player2Score}
                  onChange={(e) => setPlayer2Score(e.target.value)}
                  min="0"
                  max="21"
                  className="w-20 text-center text-2xl font-bold bg-slate-600 border-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Court Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Court Number</Label>
              <Input
                value={courtNumber}
                onChange={(e) => setCourtNumber(e.target.value)}
                placeholder="e.g., 1"
                className="bg-slate-700/50 border-slate-600"
              />
            </div>

            <div>
              <Label className="text-slate-300">Court Location</Label>
              <Input
                value={courtLocation}
                onChange={(e) => setCourtLocation(e.target.value)}
                placeholder="e.g., North"
                className="bg-slate-700/50 border-slate-600"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label className="text-slate-300">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Match notes..."
              rows={3}
              className="bg-slate-700/50 border-slate-600"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-slate-700/50 border-slate-600 hover:bg-slate-700"
            >
              Cancel
            </Button>

            {match.status !== 'COMPLETED' && (
              <Button
                onClick={() => handleSubmit('IN_PROGRESS')}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Update'
                )}
              </Button>
            )}

            <Button
              onClick={() => handleSubmit('COMPLETED')}
              disabled={loading || !canComplete}
              className={cn(
                "flex-1",
                canComplete
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-slate-600 cursor-not-allowed"
              )}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Complete
                </>
              )}
            </Button>
          </div>

          {!canComplete && (
            <p className="text-xs text-slate-400 text-center">
              Enter scores for both players to complete the match
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
