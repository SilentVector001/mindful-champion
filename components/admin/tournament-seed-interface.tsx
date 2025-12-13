"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Database, Trophy, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface TournamentSeedInterfaceProps {
  initialCount: number
}

export function TournamentSeedInterface({ initialCount }: TournamentSeedInterfaceProps) {
  const [isSeeding, setIsSeeding] = useState(false)
  const [seedResult, setSeedResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSeed = async () => {
    try {
      setIsSeeding(true)
      setError(null)
      setSeedResult(null)

      const response = await fetch('/api/tournaments/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to seed tournaments')
      }

      setSeedResult(data)
      toast.success(`Successfully seeded ${data.createdCount} tournaments!`)
      
      // Refresh the page to show updated count
      setTimeout(() => {
        router.refresh()
      }, 1000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-2">
          Tournament Data Seeding
        </h1>
        <p className="text-gray-400">
          Populate the database with 15 real pickleball tournaments from PPA Tour, APP Tour, MLP, and USA Pickleball
        </p>
      </motion.div>

      {/* Current Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-champion-green" />
              Current Status
            </CardTitle>
            <CardDescription className="text-gray-400">
              Database information and seeding controls
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current Count */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <div className="text-sm text-gray-400">Tournaments in Database</div>
                <div className="text-2xl font-bold text-white">{initialCount}</div>
              </div>
              <Trophy className="w-8 h-8 text-champion-gold" />
            </div>

            {/* Seed Button */}
            <Button
              onClick={handleSeed}
              disabled={isSeeding}
              className="w-full bg-champion-green hover:bg-champion-green/90 text-white h-12"
              size="lg"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Seeding Database...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Seed Tournament Data
                </>
              )}
            </Button>

            {/* Warning */}
            <Alert className="bg-yellow-500/10 border-yellow-500/30">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-200/90">
                <strong>Warning:</strong> This will DELETE all existing tournament data and replace it with 15 real tournaments from official sources.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </motion.div>

      {/* Success Result */}
      {seedResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Alert className="bg-green-500/10 border-green-500/30">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-200">
              <strong>Success!</strong> {seedResult.message}
              <div className="mt-2 text-sm text-green-300/80">
                Deleted: {seedResult.deletedCount} | Created: {seedResult.createdCount}
              </div>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Alert className="bg-red-500/10 border-red-500/30">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-red-200">
              <strong>Error:</strong> {error}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">What This Does</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-300">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-champion-green mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-white">Seeds 15 Real Tournaments</div>
                <div className="text-sm text-gray-400">From PPA Tour, APP Tour, MLP, and USA Pickleball</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-champion-green mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-white">Total Prize Money: $2,968,000</div>
                <div className="text-sm text-gray-400">Across all tournaments with proper formatting</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-champion-green mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-white">Complete Tournament Information</div>
                <div className="text-sm text-gray-400">Venue details, dates, registration, prize pools, entry fees</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-champion-green mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-semibold text-white">Verified Data Sources</div>
                <div className="text-sm text-gray-400">Official tournament websites and organizations</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tournament List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Tournaments to be Seeded</CardTitle>
            <CardDescription className="text-gray-400">
              15 real tournaments with dates from December 2025 - June 2026
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { name: 'PPA Tour Championship Finals', location: 'Las Vegas, NV', prize: '$283,000' },
                { name: 'APP Fort Lauderdale Open', location: 'Fort Lauderdale, FL', prize: '$125,000' },
                { name: 'PPA The Masters', location: 'Rancho Mirage, CA', prize: '$175,000' },
                { name: 'MLP Miami Slam', location: 'Miami Gardens, FL', prize: '$500,000' },
                { name: 'APP Daytona Beach Open', location: 'Holly Hill, FL', prize: '$100,000' },
                { name: 'PPA Southern California Open', location: 'Fountain Valley, CA', prize: '$150,000' },
                { name: 'US Open Pickleball Championships', location: 'Naples, FL', prize: '$350,000' },
                { name: 'PPA Arizona Grand Slam', location: 'Mesa, AZ', prize: '$200,000' },
                { name: 'APP Atlanta Open', location: 'Atlanta, GA', prize: '$100,000' },
                { name: 'PPA Texas Open', location: 'Austin, TX', prize: '$175,000' },
                { name: 'APP Chicago Open', location: 'Chicago, IL', prize: '$110,000' },
                { name: 'PPA New York City Open', location: 'Queens, NY', prize: '$250,000' },
                { name: 'APP Seattle Open', location: 'Seattle, WA', prize: '$100,000' },
                { name: 'PPA Denver Open', location: 'Denver, CO', prize: '$150,000' },
                { name: 'USA Pickleball Nationals', location: 'Indian Wells, CA', prize: '$200,000' },
              ].map((tournament, index) => (
                <div
                  key={index}
                  className="p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="font-semibold text-white text-sm">{tournament.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{tournament.location}</div>
                  <div className="text-xs text-champion-gold font-semibold mt-1">{tournament.prize}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
