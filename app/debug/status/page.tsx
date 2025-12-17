
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma as db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DebugStatusPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="w-6 h-6 text-red-500" />
              Not Authenticated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">You are not logged in. Please sign in to view your status.</p>
            <a href="/auth/signin" className="text-blue-600 hover:underline mt-4 inline-block">
              Go to Sign In
            </a>
          </CardContent>
        </Card>
      </div>
    )
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      onboardingCompleted: true,
      onboardingCompletedAt: true,
      skillLevel: true,
      primaryGoals: true,
      biggestChallenges: true,
      createdAt: true,
      updatedAt: true
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              User Status Debug Page
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Session Info</h3>
              <div className="bg-slate-100 p-4 rounded-lg space-y-1 font-mono text-sm">
                <div><span className="font-semibold">User ID:</span> {session.user.id}</div>
                <div><span className="font-semibold">Email:</span> {session.user.email}</div>
                <div><span className="font-semibold">Name:</span> {session.user.name}</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Database Record</h3>
              {user ? (
                <div className="bg-slate-100 p-4 rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Onboarding Status:</span>
                    {user.onboardingCompleted ? (
                      <Badge className="bg-green-500">Completed ✓</Badge>
                    ) : (
                      <Badge variant="destructive">Not Completed</Badge>
                    )}
                  </div>
                  {user.onboardingCompletedAt && (
                    <div className="font-mono text-sm">
                      <span className="font-semibold">Completed At:</span> {user.onboardingCompletedAt.toLocaleString()}
                    </div>
                  )}
                  <div className="font-mono text-sm">
                    <span className="font-semibold">Skill Level:</span> {user.skillLevel || 'Not set'}
                  </div>
                  <div className="font-mono text-sm">
                    <span className="font-semibold">Primary Goals:</span> {Array.isArray(user.primaryGoals) ? user.primaryGoals.length : 0} goals set
                  </div>
                  <div className="font-mono text-sm">
                    <span className="font-semibold">Biggest Challenges:</span> {Array.isArray(user.biggestChallenges) ? user.biggestChallenges.length : 0} challenges
                  </div>
                </div>
              ) : (
                <p className="text-red-600">User record not found in database!</p>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Recommendation</h3>
              <div className={`p-4 rounded-lg ${user?.onboardingCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {user?.onboardingCompleted ? (
                  <>
                    <p className="font-semibold">✅ You should have access to the dashboard</p>
                    <a href="/dashboard" className="text-blue-600 hover:underline mt-2 inline-block">
                      → Go to Dashboard
                    </a>
                  </>
                ) : (
                  <>
                    <p className="font-semibold">⚠️ You need to complete onboarding first</p>
                    <a href="/onboarding" className="text-blue-600 hover:underline mt-2 inline-block">
                      → Complete Onboarding
                    </a>
                  </>
                )}
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">
                Last updated: {new Date().toLocaleString()}
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="text-blue-600 hover:underline text-sm mt-2"
              >
                Refresh Status
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
