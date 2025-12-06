
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { 
  Check, 
  Trophy, 
  Zap, 
  Crown, 
  ArrowRight,
  Star,
  Brain,
  Users,
  Bot,
  TrendingUp,
  Calendar
} from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"
import MainNavigation from "@/components/navigation/main-navigation"

const tiers = [
  {
    name: "Free",
    description: "Perfect for casual players getting started",
    monthlyPrice: 0,
    annualPrice: 0,
    icon: Trophy,
    gradient: "from-slate-500 to-slate-600",
    features: [
      "Basic AI coaching tips",
      "Limited match tracking (5 matches/month)",
      "Simple performance metrics",
      "Access to community challenges",
      "Basic mindfulness sessions (3/month)",
    ],
    limitations: [
      "Limited AI conversations",
      "No advanced analytics",
      "No priority support",
      "No video clip storage",
    ]
  },
  {
    name: "Premium",
    description: "Ideal for dedicated players seeking improvement",
    monthlyPrice: 29,
    annualPrice: 299,
    priceId: "price_1SKk9Z3ZJvYimaqqDm90FY5e",
    icon: Zap,
    gradient: "from-teal-500 to-orange-500",
    popular: true,
    features: [
      "Unlimited Coach Kai conversations",
      "Unlimited match tracking & analytics",
      "Advanced performance insights",
      "Weekly personalized training plans",
      "Full mental mastery program",
      "Video analysis (5/month)",
      "Video clip storage (100 clips)",
      "Priority community features",
      "Find playing partners",
      "Coach booking system",
      "Full training library access",
    ],
    savings: 49
  },
  {
    name: "Pro",
    description: "For competitive players who demand excellence",
    monthlyPrice: 49,
    annualPrice: 499,
    priceId: "price_1SKk9Z3ZJvYimaqqfqqeKzkm",
    icon: Crown,
    gradient: "from-purple-500 to-pink-500",
    features: [
      "Everything in Premium",
      "Unlimited video analysis",
      "Advanced AI strategy analysis",
      "Unlimited video clip storage",
      "Priority coach booking",
      "Live streaming capabilities",
      "Tournament preparation tools",
      "Performance comparison with pros",
      "Custom drill generation",
      "1-on-1 monthly coach consultation",
      "Priority customer support",
    ],
    savings: 89
  }
]

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)
  const { data: session, status } = useSession() || {}
  const { toast } = useToast()

  const handleSubscribe = async (tier: any) => {
    if (tier.name === "Free") {
      if (!session) {
        toast({
          title: "Sign Up Required",
          description: "Please create an account to start your free trial.",
        })
        return
      }
      toast({
        title: "Already on Free Plan",
        description: "You can upgrade anytime to unlock premium features!",
      })
      return
    }

    if (!session) {
      toast({
        title: "Sign Up Required",
        description: "Please create an account to start your 7-day free trial.",
      })
      return
    }

    try {
      // Get the price ID from the tier configuration
      const priceId = tier.priceId;

      if (!priceId) {
        throw new Error('Price configuration missing for this tier');
      }

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId,
          tier: tier.name.toUpperCase(),
        }),
      })

      const data = await response.json()

      if (response.ok && data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }
    } catch (error: any) {
      console.error('Checkout error:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Wait for session to load
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation - Full nav when logged in, simple nav when logged out */}
      {session ? (
        <MainNavigation user={session.user || {}} />
      ) : (
        <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-orange-600 bg-clip-text text-transparent">
                  Mindful Champion
                </span>
              </Link>
              <div className="flex items-center gap-4">
                <Link href="/auth/signin">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-gradient-to-r from-teal-600 to-orange-600 hover:from-teal-700 hover:to-orange-700">
                    Start Free Trial
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-4 bg-gradient-to-r from-teal-500 to-orange-500 text-white">
              Champion Pricing
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Choose Your{" "}
              <span className="bg-gradient-to-r from-teal-600 to-orange-600 bg-clip-text text-transparent">
                Champion Path
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8">
              Every plan includes a 7-day free trial. Upgrade, downgrade, or cancel anytime.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={`font-medium ${!isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
                Monthly
              </span>
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-teal-500 data-[state=checked]:to-orange-500"
              />
              <span className={`font-medium ${isAnnual ? 'text-slate-900' : 'text-slate-500'}`}>
                Annual
              </span>
              {isAnnual && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Save $10.88
                </Badge>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {tiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative"
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-teal-500 to-orange-500 text-white px-6 py-1">
                      <Star className="w-3 h-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <Card className={`h-full ${tier.popular ? 'ring-2 ring-teal-500 shadow-xl' : 'shadow-lg'} border-0 bg-white`}>
                  <CardHeader className="text-center pb-6">
                    <div className="flex justify-center mb-4">
                      <div className={`w-16 h-16 bg-gradient-to-br ${tier.gradient} rounded-2xl flex items-center justify-center`}>
                        <tier.icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">
                      {tier.name}
                    </h3>
                    <p className="text-sm mt-2 text-slate-600">
                      {tier.description}
                    </p>
                    
                    <div className="mt-6">
                      {tier.name === "Free" ? (
                        <div className="text-4xl font-bold text-slate-900">
                          Free
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-4xl font-bold text-slate-900">
                            ${isAnnual ? tier.annualPrice : tier.monthlyPrice}
                            <span className="text-lg font-normal text-slate-600">
                              {isAnnual ? '/year' : '/month'}
                            </span>
                          </div>
                          {isAnnual && tier.savings && (
                            <div className="text-sm text-green-600 font-medium">
                              Save ${tier.savings} annually
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {tier.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700">{feature}</span>
                      </div>
                    ))}
                    
                    {tier.limitations && (
                      <div className="pt-4 border-t border-slate-200">
                        <p className="text-sm mb-2 font-medium text-slate-700">Limitations:</p>
                        {tier.limitations.map((limitation, i) => (
                          <div key={i} className="flex items-start gap-3 mb-1">
                            <span className="text-sm text-slate-700">•</span>
                            <span className="text-sm text-slate-600">{limitation}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  
                  <CardFooter>
                    <Button
                      onClick={() => handleSubscribe(tier)}
                      className={`w-full text-white ${
                        tier.popular
                          ? 'bg-gradient-to-r from-teal-600 to-orange-600 hover:from-teal-700 hover:to-orange-700'
                          : tier.name === 'Free'
                          ? 'bg-slate-700 hover:bg-slate-800'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                      }`}
                      size="lg"
                    >
                      {tier.name === "Free" ? (
                        session ? "Current Plan" : "Start Free Trial"
                      ) : (
                        <>
                          {session ? "Upgrade Now" : "Start Free Trial"}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              What Makes Mindful Champion{" "}
              <span className="bg-gradient-to-r from-teal-600 to-orange-600 bg-clip-text text-transparent">
                Unique?
              </span>
            </h2>
            <p className="text-lg text-slate-600">
              The only platform combining AI coaching, mental training, and community features
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Bot,
                title: "Coach Kai",
                description: "Personalized coaching that learns from your playing style and provides targeted advice",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                icon: Brain,
                title: "Mental Mastery",
                description: "Unique mindfulness training specifically designed for pickleball performance",
                gradient: "from-green-500 to-emerald-500"
              },
              {
                icon: TrendingUp,
                title: "Champion Analytics",
                description: "Deep performance insights that track your improvement with precision",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                icon: Users,
                title: "Community Power",
                description: "Connect with players worldwide and participate in exciting challenges",
                gradient: "from-orange-500 to-red-500"
              },
              {
                icon: Calendar,
                title: "Elite Coaching Hub",
                description: "Book sessions with professional coaches and access exclusive content",
                gradient: "from-teal-500 to-blue-500"
              },
              {
                icon: Zap,
                title: "Live Command Center",
                description: "Real-time scoring and streaming capabilities for competitive play",
                gradient: "from-indigo-500 to-purple-500"
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 h-full bg-white shadow-md border-0">
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ or CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-6">
              Ready to Transform Your Game?
            </h2>
            <p className="text-xl text-slate-600 mb-8">
              Join thousands of players who've already elevated their pickleball mastery.
              Start your 7-day free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="bg-gradient-to-r from-teal-600 to-orange-600 hover:from-teal-700 hover:to-orange-700 px-8">
                  <Trophy className="mr-2 h-5 w-5" />
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/">
                <Button size="lg" variant="outline" className="px-8">
                  Learn More
                </Button>
              </Link>
            </div>
            <p className="text-sm text-slate-500 mt-4">
              No credit card required • Cancel anytime • 7-day money-back guarantee
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
