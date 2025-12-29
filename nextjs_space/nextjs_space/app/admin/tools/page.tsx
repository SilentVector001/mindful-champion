'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Shield, Database, CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function AdminToolsPage() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [seedResult, setSeedResult] = useState<any>(null)

  const handleSeedTournaments = async () => {
    try {
      setIsSeeding(true)
      setSeedResult(null)
      
      toast.info('🏓 Starting tournament database reseed...')

      const response = await fetch('/api/admin/seed-tournaments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setSeedResult(data)
        toast.success(`✅ Successfully seeded ${data.createdCount} tournaments!`)
      } else {
        setSeedResult({ error: data.error || 'Failed to seed tournaments' })
        toast.error(`❌ Error: ${data.error || 'Failed to seed tournaments'}`)
      }
    } catch (error: any) {
      console.error('Error seeding tournaments:', error)
      setSeedResult({ error: error.message })
      toast.error(`❌ Error: ${error.message}`)
    } finally {
      setIsSeeding(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-teal-400" />
          <h1 className="text-3xl font-bold text-white">Admin Tools</h1>
        </div>

        {/* Tournament Seed Card */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Database className="w-5 h-5 text-teal-400" />
              Tournament Database Reseed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">
              Reseed the tournament database with current December 2025+ tournament data.
              This will delete all existing tournaments and replace them with 15 real US pickleball tournaments.
            </p>

            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-200 text-sm">
                ⚠️ <strong>Warning:</strong> This action will delete all existing tournament data
                and replace it with current tournament information. This cannot be undone.
              </p>
            </div>

            <Button
              onClick={handleSeedTournaments}
              disabled={isSeeding}
              className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Seeding Database...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Reseed Tournament Database
                </>
              )}
            </Button>

            {/* Result Display */}
            {seedResult && (
              <div
                className={`mt-4 p-4 rounded-lg border ${
                  seedResult.error
                    ? 'bg-red-900/20 border-red-500/30'
                    : 'bg-green-900/20 border-green-500/30'
                }`}
              >
                {seedResult.error ? (
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-400 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-200">Error</h3>
                      <p className="text-red-300 text-sm mt-1">{seedResult.error}</p>
                      {seedResult.details && (
                        <p className="text-red-400 text-xs mt-2">{seedResult.details}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-200">Success!</h3>
                      <p className="text-green-300 text-sm mt-1">{seedResult.message}</p>
                      <div className="mt-2 space-y-1 text-xs text-green-400">
                        <p>• Deleted: {seedResult.deletedCount} old tournaments</p>
                        <p>• Created: {seedResult.createdCount} new tournaments</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 bg-gray-800/30 border-gray-700">
          <CardContent className="pt-6">
            <h3 className="text-white font-semibold mb-3">Tournament Data Includes:</h3>
            <ul className="text-gray-300 text-sm space-y-1 ml-4">
              <li>• PPA Tour Championship Finals (Las Vegas, Dec 12-15, 2025)</li>
              <li>• APP Fort Lauderdale Open (Florida, Dec 18-22, 2025)</li>
              <li>• PPA The Masters (California, Jan 6-12, 2026)</li>
              <li>• MLP Miami Slam (Florida, Jan 10-13, 2026)</li>
              <li>• APP Daytona Beach Open (Florida, Jan 15-19, 2026)</li>
              <li>• US Open Pickleball Championships (Naples, Feb 1-8, 2026)</li>
              <li>• PPA Arizona Grand Slam (Mesa, Feb 10-16, 2026)</li>
              <li>• ...and 8 more tournaments through May 2026</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
