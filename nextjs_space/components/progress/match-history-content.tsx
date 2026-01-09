// @ts-nocheck
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Trophy, TrendingUp, Calendar, Plus, Search, Filter,
  CheckCircle, XCircle, ChevronLeft
} from "lucide-react"
import Link from "next/link"

interface MatchHistoryContentProps {
  user: any
  matches: any[]
}

export default function MatchHistoryContent({ user, matches }: MatchHistoryContentProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterResult, setFilterResult] = useState<'all' | 'win' | 'loss'>('all')
  const [showAddMatch, setShowAddMatch] = useState(false)
  const [newMatch, setNewMatch] = useState({
    opponent: '',
    score: '',
    result: 'WIN',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  })
  const [saving, setSaving] = useState(false)

  const filteredMatches = matches.filter(match => {
    const matchesSearch = (match.opponent || match.opponentName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (match.score || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterResult === 'all' || match.result?.toLowerCase() === filterResult
    return matchesSearch && matchesFilter
  })

  const winRate = matches.length > 0 
    ? (matches.filter(m => m.result?.toLowerCase() === 'win').length / matches.length * 100).toFixed(0)
    : 0

  const handleAddMatch = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMatch)
      })
      if (res.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Error adding match:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/progress">
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Progress
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Match History</h1>
          <p className="text-slate-400">Track your games and analyze performance</p>
        </div>
        <Button 
          onClick={() => setShowAddMatch(!showAddMatch)}
          className="bg-cyan-500 hover:bg-cyan-600"
        >
          <Plus className="w-4 h-4 mr-1" /> Log Match
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-white">{matches.length}</p>
            <p className="text-slate-400 text-sm">Total Matches</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-500/10 border-emerald-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-emerald-400">{matches.filter(m => m.result?.toLowerCase() === 'win').length}</p>
            <p className="text-slate-400 text-sm">Wins</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-cyan-400">{winRate}%</p>
            <p className="text-slate-400 text-sm">Win Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Match Form */}
      {showAddMatch && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-slate-800 border-slate-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Log New Match</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">Opponent Name</label>
                  <Input
                    placeholder="Enter opponent's name"
                    value={newMatch.opponent}
                    onChange={e => setNewMatch({...newMatch, opponent: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">Score</label>
                  <Input
                    placeholder="e.g., 11-7, 11-9"
                    value={newMatch.score}
                    onChange={e => setNewMatch({...newMatch, score: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">Result</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={newMatch.result === 'WIN' ? 'default' : 'outline'}
                      onClick={() => setNewMatch({...newMatch, result: 'WIN'})}
                      className={newMatch.result === 'WIN' ? 'bg-emerald-500' : 'border-slate-600 text-slate-300'}
                    >
                      Win
                    </Button>
                    <Button
                      type="button"
                      variant={newMatch.result === 'LOSS' ? 'default' : 'outline'}
                      onClick={() => setNewMatch({...newMatch, result: 'LOSS'})}
                      className={newMatch.result === 'LOSS' ? 'bg-red-500' : 'border-slate-600 text-slate-300'}
                    >
                      Loss
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-slate-400 text-sm mb-1 block">Date</label>
                  <Input
                    type="date"
                    value={newMatch.date}
                    onChange={e => setNewMatch({...newMatch, date: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-sm mb-1 block">Notes (optional)</label>
                <Input
                  placeholder="Match notes..."
                  value={newMatch.notes}
                  onChange={e => setNewMatch({...newMatch, notes: e.target.value})}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddMatch} disabled={saving} className="bg-cyan-500 hover:bg-cyan-600">
                  {saving ? 'Saving...' : 'Save Match'}
                </Button>
                <Button variant="ghost" onClick={() => setShowAddMatch(false)} className="text-slate-400">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search matches..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'win', 'loss'].map(filter => (
            <Button
              key={filter}
              variant={filterResult === filter ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setFilterResult(filter as any)}
              className={filterResult === filter 
                ? filter === 'win' ? 'bg-emerald-500' : filter === 'loss' ? 'bg-red-500' : 'bg-cyan-500'
                : 'text-slate-400 hover:text-white'
              }
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Match List */}
      <div className="space-y-3">
        {filteredMatches.length > 0 ? filteredMatches.map((match, index) => (
          <motion.div
            key={match.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      match.result?.toLowerCase() === 'win' ? 'bg-emerald-500' : 'bg-red-500'
                    }`}>
                      {match.result?.toLowerCase() === 'win' ? (
                        <CheckCircle className="w-6 h-6 text-white" />
                      ) : (
                        <XCircle className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium">
                          vs {match.opponent || match.opponentName || 'Unknown Opponent'}
                        </p>
                        <Badge className={match.result?.toLowerCase() === 'win' 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-red-500/20 text-red-400'
                        }>
                          {match.result?.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm">
                        Score: {match.score || 'Not recorded'}
                      </p>
                      {match.notes && (
                        <p className="text-slate-500 text-xs mt-1">{match.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-slate-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      {new Date(match.date).toLocaleDateString()}
                    </div>
                    {match.matchType && (
                      <Badge variant="outline" className="mt-1 border-slate-600 text-slate-400 text-xs">
                        {match.matchType}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )) : (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="py-12 text-center">
              <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-white font-medium mb-2">
                {matches.length === 0 ? 'No matches logged yet' : 'No matches found'}
              </p>
              <p className="text-slate-400 text-sm mb-4">
                {matches.length === 0 
                  ? 'Start tracking your games to see your progress'
                  : 'Try adjusting your search or filters'
                }
              </p>
              {matches.length === 0 && (
                <Button onClick={() => setShowAddMatch(true)} className="bg-cyan-500 hover:bg-cyan-600">
                  <Plus className="w-4 h-4 mr-1" /> Log Your First Match
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
