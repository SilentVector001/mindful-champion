"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function SeedProgramsPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    programs?: any[]
  } | null>(null)

  const handleSeed = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/admin/seed-programs', {
        method: 'POST'
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>🚨 Emergency: Seed Training Programs</CardTitle>
            <CardDescription>
              This is a temporary administrative tool to seed the training programs database.
              Click the button below to populate 7 training programs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button
              onClick={handleSeed}
              disabled={loading}
              size="lg"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Seeding Programs...
                </>
              ) : (
                <>
                  🌱 Seed Training Programs
                </>
              )}
            </Button>

            {result && (
              <Alert variant={result.success ? 'default' : 'destructive'}>
                <div className="flex items-start gap-2">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div className="flex-1">
                    <AlertDescription>
                      <p className="font-semibold mb-2">{result.message}</p>
                      {result.programs && (
                        <div className="mt-4">
                          <p className="font-medium mb-2">Created Programs:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {result.programs.map((prog: any, i: number) => (
                              <li key={i} className="text-sm">
                                {prog.name} ({prog.level}) - {prog.days} days
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
              <p className="font-medium text-yellow-900 mb-2">⚠️ Note:</p>
              <ul className="list-disc list-inside text-yellow-800 space-y-1">
                <li>This will DELETE all existing training programs</li>
                <li>7 new programs will be created (2 Beginner, 2 Intermediate, 2 Advanced, 1 Pro)</li>
                <li>After seeding, navigate to /train/progress to see the programs</li>
                <li>This page should be deleted after use</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
