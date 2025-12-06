"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { 
  Sparkles, 
  Check, 
  X, 
  Crown,
  Video, 
  Brain,
  TrendingUp,
  Users,
  Zap,
  Shield,
  Clock,
  ChevronRight
} from "lucide-react"

export default function UpgradePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [trialStatus, setTrialStatus] = useState<any>(null)

  useEffect(() => {
    if (session?.user) {
      fetchTrialStatus()
    }
  }, [session])

  const fetchTrialStatus = async () => {
    try {
      const res = await fetch('/api/user/trial-status')
      const data = await res.json()
      setTrialStatus(data)
    } catch (error) {
      console.error('Error fetching trial status:', error)
    }
  }

  const handleUpgrade = async (tier: 'PREMIUM' | 'PRO') => {
    setLoading(true)
    try {
      // TODO: Integrate with Stripe
      const response = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier })
      })
      
      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Error creating checkout:', error)
      alert('Something went wrong. Please try again or contact support.')
    } finally {
      setLoading(false)
    }
  }

  const plans = [
    {
      name: "Free Trial",
      tier: "FREE",
      price: "$0",
      period: "7 days",
      description: "Try all premium features",
      icon: Sparkles,
      color: "from-gray-500 to-gray-600",
      features: [
        { name: "Video Analysis", included: true },
        { name: "Coach Kai AI Assistant", included: true },
        { name: "Pro-Level Insights", included: true },
        { name: "Training Programs", included: true },
        { name: "Community Access", included: true },
        { name: "Priority Support", included: false },
        { name: "Advanced Analytics", included: false },
        { name: "Wearable Integration", included: false }
      ],
      cta: "Current Plan",
      disabled: true
    },
    {
      name: "Premium",
      tier: "PREMIUM",
      price: "$29",
      period: "per month",
      description: "For serious players",
      icon: Crown,
      color: "from-blue-500 to-purple-600",
      popular: true,
      features: [
        { name: "Unlimited Video Analysis", included: true },
        { name: "Advanced Coach Kai AI", included: true },
        { name: "Pro-Level Insights", included: true },
        { name: "Custom Training Programs", included: true },
        { name: "Community Access", included: true },
        { name: "Priority Support", included: true },
        { name: "Advanced Analytics", included: true },
        { name: "Wearable Integration", included: true }
      ],
      cta: "Upgrade to Premium",
      disabled: false
    },
    {
      name: "Pro",
      tier: "PRO",
      price: "$99",
      period: "per month",
      description: "For elite athletes",
      icon: Zap,
      color: "from-orange-500 to-red-600",
      features: [
        { name: "Everything in Premium", included: true },
        { name: "1-on-1 Coaching Sessions", included: true },
        { name: "Tournament Preparation", included: true },
        { name: "Mental Performance Coaching", included: true },
        { name: "Personalized Training Plans", included: true },
        { name: "24/7 Priority Support", included: true },
        { name: "Exclusive Pro Community", included: true },
        { name: "White-Glove Onboarding", included: true }
      ],
      cta: "Upgrade to Pro",
      disabled: false
    }
  ]

  const benefits = [
    {
      icon: Video,
      title: "Unlimited Video Analysis",
      description: "Upload and analyze as many videos as you want with AI-powered insights"
    },
    {
      icon: Brain,
      title: "Advanced AI Coaching",
      description: "Get personalized recommendations from Coach Kai based on your gameplay"
    },
    {
      icon: TrendingUp,
      title: "Track Your Progress",
      description: "Detailed analytics showing your improvement over time"
    },
    {
      icon: Users,
      title: "Community Access",
      description: "Connect with other players, share tips, and learn from the best"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            {trialStatus?.isExpired && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-full mb-6">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Your trial has expired</span>
              </div>
            )}
            
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Unlock Your Full Potential
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
              Continue your journey to becoming a Mindful Champion with unlimited access to 
              pro-level coaching, AI analysis, and community support.
            </p>

            {trialStatus && (
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {trialStatus.daysRemaining > 0 ? (
                    <>
                      <strong>{trialStatus.daysRemaining}</strong> days left in your trial
                    </>
                  ) : (
                    <>Trial ended on {new Date(trialStatus.trialEndDate).toLocaleDateString()}</>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {benefit.description}
                </p>
              </div>
            )
          })}
        </div>

        {/* Pricing Plans */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Choose Your Plan
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Select the perfect plan for your pickleball journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => {
            const Icon = plan.icon
            return (
              <div
                key={index}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden ${
                  plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
                    Most Popular
                  </div>
                )}

                <div className={`bg-gradient-to-r ${plan.color} p-6 text-white`}>
                  <Icon className="w-10 h-10 mb-3" />
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-sm opacity-90">/{plan.period}</span>
                  </div>
                  <p className="text-sm opacity-90">{plan.description}</p>
                </div>

                <div className="p-6">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm ${
                          feature.included 
                            ? 'text-gray-700 dark:text-gray-300' 
                            : 'text-gray-400 dark:text-gray-600'
                        }`}>
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => !plan.disabled && handleUpgrade(plan.tier as any)}
                    disabled={plan.disabled || loading}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                      plan.disabled
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                        : plan.popular
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                        : 'bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600'
                    }`}
                  >
                    {loading ? 'Processing...' : plan.cta}
                    {!plan.disabled && <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* FAQ or Support Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Have Questions?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Our team is here to help you choose the right plan and answer any questions.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="mailto:support@mindfulchampion.com"
              className="px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Contact Support
            </a>
            <button
              onClick={() => router.push('/help')}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              View Help Center
            </button>
          </div>
        </div>
      </div>

      {/* Money-back guarantee */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
          <Shield className="w-5 h-5" />
          <span className="text-sm">
            30-day money-back guarantee • Cancel anytime • Secure payment
          </span>
        </div>
      </div>
    </div>
  )
}
