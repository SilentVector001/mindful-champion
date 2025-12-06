import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FileText, 
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react'
import Link from 'next/link'

export default async function RewardsTermsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/help/rewards/terms')
  }

  const lastUpdated = "November 27, 2025"

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Back Button */}
      <div>
        <Link href="/help/rewards">
          <Button variant="outline" size="sm" className="hover:bg-gray-50">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Rewards
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="text-center">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-500 to-gray-600 rounded-full blur-lg opacity-20" />
          <div className="relative w-20 h-20 bg-gradient-to-br from-slate-600 to-gray-700 rounded-full flex items-center justify-center mx-auto shadow-2xl">
            <FileText className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-5xl font-light text-gray-900 mb-4">
          Rewards Program <span className="font-semibold">Terms & Conditions</span>
        </h1>
        <Badge className="bg-gray-100 text-gray-700 border-gray-300">
          Last Updated: {lastUpdated}
        </Badge>
      </div>

      {/* Important Notice */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          By participating in the Mindful Champion Rewards Program, you agree to these terms and conditions. 
          Please read them carefully before earning or redeeming points.
        </AlertDescription>
      </Alert>

      {/* Terms Sections */}
      <div className="space-y-8">
        {/* Section 1 */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">1</span>
              </div>
              Program Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              The Mindful Champion Rewards Program ("Program") allows registered users to earn points through various activities and redeem them for rewards. The Program is operated by Mindful Champion, Inc. ("Company," "we," "us," or "our").
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Program participation is free and voluntary</li>
              <li>Available to all registered users age 13 and older</li>
              <li>One account per person; duplicate accounts may be suspended</li>
              <li>Points have no cash value and cannot be sold or transferred</li>
              <li>We reserve the right to modify or terminate the Program at any time</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 2 */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">2</span>
              </div>
              Earning Points
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              Points are earned through qualifying activities as described in the Program documentation. Point values are determined by the Company and subject to change.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Automatic Crediting:</strong> Most points are credited instantly upon activity completion
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Processing Time:</strong> Some activities may take up to 48 hours for point processing
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Fraudulent Activity:</strong> Points earned through fraudulent means will be revoked and may result in account suspension
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Limitations:</strong> Certain activities may have daily, weekly, or monthly earning caps
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3 */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">3</span>
              </div>
              Point Expiration & Account Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Active Accounts:</strong> Points never expire while your account remains active</li>
              <li><strong>Inactive Accounts:</strong> After 12 consecutive months of inactivity, we may expire points with 60 days notice</li>
              <li><strong>Account Closure:</strong> If you close your account, all unredeemed points are forfeited</li>
              <li><strong>Subscription Changes:</strong> Downgrading subscription tiers preserves points but removes Premium multipliers</li>
              <li><strong>Violations:</strong> Account suspension or termination for Terms of Service violations forfeits all points</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 4 */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">4</span>
              </div>
              Redeeming Rewards
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              Points can be redeemed for rewards available in the Rewards Marketplace. Reward availability, point costs, and terms are subject to change.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Availability:</strong> Rewards are offered subject to inventory availability
                </div>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Non-Refundable:</strong> Digital rewards cannot be refunded once claimed
                </div>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Physical Items:</strong> Merchandise can be cancelled within 2 hours if not yet shipped
                </div>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Shipping:</strong> Free shipping in continental US; additional fees may apply elsewhere
                </div>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Delivery:</strong> Physical rewards ship within 5-7 business days; we're not responsible for carrier delays
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 5 */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">5</span>
              </div>
              Sponsor Program
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              The Sponsor Program connects users with partner brands. Sponsor offers and content are provided by third parties.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sponsor offers are subject to sponsor terms and conditions</li>
              <li>We are not responsible for sponsor products, services, or fulfillment</li>
              <li>Points for sponsor activities are awarded by us, not sponsors</li>
              <li>Sponsors may change or withdraw offers at any time</li>
              <li>You can opt out of sponsor content in Settings</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 6 */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">6</span>
              </div>
              Program Changes & Termination
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              We reserve the right to modify or terminate the Rewards Program at our discretion.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Point values and earning opportunities may be adjusted</li>
              <li>Reward availability and costs may change</li>
              <li>Program rules may be modified with reasonable notice</li>
              <li>If the Program is terminated, we'll provide at least 90 days notice and a redemption period</li>
              <li>Changes will be posted on this page with updated effective date</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 7 */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">7</span>
              </div>
              Prohibited Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>The following activities are prohibited and may result in point forfeiture and account suspension:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Creating multiple accounts to earn extra points</li>
              <li>Using bots, scripts, or automation to earn points</li>
              <li>Exploiting bugs or glitches in the point system</li>
              <li>Transferring or selling points or accounts</li>
              <li>Fraudulent activity or misrepresentation</li>
              <li>Violating sponsor terms or abusing offers</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 8 */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">8</span>
              </div>
              Liability & Disclaimers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <ul className="list-disc pl-6 space-y-2">
              <li>The Program is provided "as is" without warranties of any kind</li>
              <li>We're not liable for technical issues preventing point earning or redemption</li>
              <li>Rewards are provided by third parties; we're not responsible for quality or satisfaction</li>
              <li>Maximum liability for Program issues limited to the value of points in question</li>
              <li>Points have no cash value and cannot be redeemed for cash</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 9 */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">9</span>
              </div>
              Disputes & Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              For questions or disputes regarding the Rewards Program:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Contact support at: <a href="mailto:rewards@mindfulchampion.ai" className="text-teal-600 hover:underline">rewards@mindfulchampion.ai</a></li>
              <li>Disputes must be raised within 30 days of the issue</li>
              <li>We'll investigate and respond within 10 business days</li>
              <li>Decisions regarding point awards and redemptions are final</li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 10 */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">10</span>
              </div>
              Governing Law
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700">
            <p>
              These terms are governed by the laws of the State of California, USA. By participating in the Program, you agree to the exclusive jurisdiction of courts in California for any disputes.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contact Card */}
      <Card className="border-0 shadow-2xl backdrop-blur-sm bg-gradient-to-br from-teal-50/80 to-emerald-50/80">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500" />
        <CardContent className="pt-10">
          <div className="text-center">
            <Info className="w-12 h-12 text-teal-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Questions About These Terms?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              If you have questions about the Rewards Program Terms & Conditions, please contact our support team
            </p>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
              onClick={() => window.location.href = 'mailto:rewards@mindfulchampion.ai?subject=Rewards Terms Question'}
            >
              Contact Rewards Team
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
