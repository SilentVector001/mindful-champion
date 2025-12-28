
"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, Zap, Trophy, ExternalLink, CreditCard, Calendar, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function SubscriptionStatus() {
  const { data: session } = useSession() || {}
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  // Mock user data - in real app, this would come from the session or API
  const subscriptionTier = (session?.user as any)?.subscriptionTier || "FREE"
  const subscriptionStatus = (session?.user as any)?.subscriptionStatus || "ACTIVE"

  const tierConfig = {
    FREE: {
      name: "Free",
      icon: Trophy,
      gradient: "from-slate-500 to-slate-600",
      color: "bg-slate-100 text-slate-800",
    },
    PREMIUM: {
      name: "Premium",
      icon: Zap,
      gradient: "from-teal-500 to-orange-500",
      color: "bg-gradient-to-r from-teal-500 to-orange-500 text-white",
    },
    PRO: {
      name: "Pro",
      icon: Crown,
      gradient: "from-purple-500 to-pink-500",
      color: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
    },
  }

  const currentTier = tierConfig[subscriptionTier as keyof typeof tierConfig] || tierConfig.FREE

  const handleManageSubscription = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to open billing portal')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to open billing portal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Subscription</CardTitle>
            <CardDescription>Manage your subscription and billing</CardDescription>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${currentTier.gradient}`}>
            <currentTier.icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Plan */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Current Plan</span>
            <Badge className={currentTier.color}>
              {currentTier.name}
            </Badge>
          </div>

          {subscriptionStatus !== "ACTIVE" && subscriptionStatus !== "TRIALING" && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900">
                  Subscription Issue
                </p>
                <p className="text-sm text-amber-700">
                  {subscriptionStatus === "PAST_DUE"
                    ? "Your payment is past due. Please update your payment method."
                    : "Your subscription has been canceled."}
                </p>
              </div>
            </div>
          )}

          {subscriptionStatus === "TRIALING" && (
            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  Free Trial Active
                </p>
                <p className="text-sm text-blue-700">
                  You're currently on a 7-day free trial. Your first payment will be processed after the trial ends.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {subscriptionTier === "FREE" ? (
            <Link href="/pricing" className="block">
              <Button className="w-full bg-gradient-to-r from-teal-600 to-orange-600 hover:from-teal-700 hover:to-orange-700">
                <Crown className="mr-2 h-4 w-4" />
                Upgrade to Premium
              </Button>
            </Link>
          ) : (
            <Button
              onClick={handleManageSubscription}
              disabled={loading}
              className="w-full"
              variant="outline"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900 mr-2"></div>
                  Opening...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage Subscription
                  <ExternalLink className="ml-2 h-3 w-3" />
                </>
              )}
            </Button>
          )}

          {subscriptionTier !== "PRO" && subscriptionTier !== "FREE" && (
            <Link href="/pricing" className="block">
              <Button className="w-full" variant="outline">
                <Crown className="mr-2 h-4 w-4" />
                Upgrade to Pro
              </Button>
            </Link>
          )}
        </div>

        {/* Features Info */}
        <div className="pt-4 border-t">
          <p className="text-sm text-slate-600 mb-3">Your plan includes:</p>
          <ul className="space-y-2">
            {subscriptionTier === "FREE" && (
              <>
                <li className="text-sm text-slate-700">• Basic AI coaching tips</li>
                <li className="text-sm text-slate-700">• Limited match tracking (5/month)</li>
                <li className="text-sm text-slate-700">• Community access</li>
              </>
            )}
            {subscriptionTier === "PREMIUM" && (
              <>
                <li className="text-sm text-slate-700">• Unlimited AI coaching</li>
                <li className="text-sm text-slate-700">• Full training library</li>
                <li className="text-sm text-slate-700">• Video analysis (5/month)</li>
                <li className="text-sm text-slate-700">• Advanced analytics</li>
              </>
            )}
            {subscriptionTier === "PRO" && (
              <>
                <li className="text-sm text-slate-700">• Everything in Premium</li>
                <li className="text-sm text-slate-700">• Unlimited video analysis</li>
                <li className="text-sm text-slate-700">• Personal AI coach</li>
                <li className="text-sm text-slate-700">• Priority support</li>
              </>
            )}
          </ul>
        </div>

        {/* Billing Portal Info */}
        {subscriptionTier !== "FREE" && (
          <div className="pt-4 border-t">
            <p className="text-xs text-slate-500">
              Click "Manage Subscription" to update your payment method, view invoices, or cancel your subscription through Stripe's secure billing portal.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
