
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma as db } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function OnboardingStatusDebugPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin')
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

  const timestamp = new Date().toISOString()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🔍 Onboarding Status Debug Page</CardTitle>
            <p className="text-sm text-gray-500">Generated at: {timestamp}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Session Data */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Session Data</h3>
              <div className="bg-gray-100 p-4 rounded-lg space-y-1 font-mono text-sm">
                <div><strong>User ID:</strong> {session.user.id}</div>
                <div><strong>Email:</strong> {session.user.email}</div>
                <div><strong>Name:</strong> {session.user.name || 'Not set'}</div>
              </div>
            </div>

            {/* Database Data */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Database Data (Fresh Query)</h3>
              {user ? (
                <div className="bg-gray-100 p-4 rounded-lg space-y-1 font-mono text-sm">
                  <div><strong>User ID:</strong> {user.id}</div>
                  <div><strong>Email:</strong> {user.email}</div>
                  <div><strong>Name:</strong> {user.name || 'Not set'}</div>
                  <div className="pt-2 border-t border-gray-300 mt-2">
                    <strong>Onboarding Completed:</strong>{' '}
                    <span className={user.onboardingCompleted ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                      {user.onboardingCompleted ? '✅ TRUE' : '❌ FALSE'}
                    </span>
                  </div>
                  <div>
                    <strong>Completed At:</strong> {user.onboardingCompletedAt?.toISOString() || 'Not completed'}
                  </div>
                  <div><strong>Skill Level:</strong> {user.skillLevel || 'Not set'}</div>
                  <div><strong>Primary Goals:</strong> {Array.isArray(user.primaryGoals) ? user.primaryGoals.length : 0} goals</div>
                  <div><strong>Biggest Challenges:</strong> {Array.isArray(user.biggestChallenges) ? user.biggestChallenges.length : 0} challenges</div>
                  <div className="pt-2 border-t border-gray-300 mt-2">
                    <strong>Created:</strong> {user.createdAt.toISOString()}
                  </div>
                  <div><strong>Updated:</strong> {user.updatedAt.toISOString()}</div>
                </div>
              ) : (
                <div className="bg-red-100 p-4 rounded-lg text-red-600">
                  ❌ User not found in database
                </div>
              )}
            </div>

            {/* Status Analysis */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Status Analysis</h3>
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                {user?.onboardingCompleted ? (
                  <>
                    <div className="text-green-600 font-semibold">
                      ✅ Onboarding is COMPLETED in database
                    </div>
                    <div className="text-sm text-gray-600">
                      You should have access to the dashboard. If you're stuck on the onboarding page:
                    </div>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      <li>Try navigating directly to <Link href="/dashboard" className="text-blue-600 underline">/dashboard</Link></li>
                      <li>Do a hard refresh (Ctrl+Shift+R or Cmd+Shift+R)</li>
                      <li>Clear your browser cookies and log in again</li>
                      <li>Use the force-complete endpoint below as a last resort</li>
                    </ul>
                  </>
                ) : (
                  <>
                    <div className="text-red-600 font-semibold">
                      ❌ Onboarding is NOT COMPLETED
                    </div>
                    <div className="text-sm text-gray-600">
                      You need to complete the onboarding process before accessing the dashboard.
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Link href="/dashboard">
                <Button variant="default">Go to Dashboard</Button>
              </Link>
              <Link href="/onboarding">
                <Button variant="outline">Go to Onboarding</Button>
              </Link>
              <form action="/api/auth/force-complete-onboarding" method="POST">
                <Button 
                  type="submit" 
                  variant="destructive"
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Force Complete Onboarding (Emergency)
                </Button>
              </form>
            </div>

            {/* Instructions */}
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Emergency Fix Instructions</h4>
              <div className="text-sm text-gray-600 space-y-2">
                <p>If you're stuck in a redirect loop, click "Force Complete Onboarding" above.</p>
                <p>This will:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Set onboardingCompleted = true in the database</li>
                  <li>Clear all page caches</li>
                  <li>Provide instructions for next steps</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
