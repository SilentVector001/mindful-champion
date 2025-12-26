import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Target, 
  TrendingUp, 
  Award,
  CheckCircle2,
  ArrowLeft,
  Mail,
  ExternalLink,
  Sparkles,
  BarChart3,
  DollarSign,
  Globe,
  Zap,
  Heart,
  Trophy
} from 'lucide-react'
import Link from 'next/link'

export default async function PartnershipPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/help/sponsors/partnership')
  }

  const benefits = [
    {
      icon: Target,
      title: "Targeted Audience",
      description: "Reach thousands of active pickleball players who are passionate about improving their game"
    },
    {
      icon: TrendingUp,
      title: "High Engagement",
      description: "Our users spend an average of 45 minutes daily on the platform"
    },
    {
      icon: Award,
      title: "Brand Visibility",
      description: "Featured placement across app, emails, and community spaces"
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Detailed tracking of campaign performance and ROI metrics"
    }
  ]

  const partnershipTiers = [
    {
      tier: "Bronze Partner",
      price: "$2,500/month",
      color: "from-amber-600 to-orange-700",
      features: [
        "Logo in Sponsor Section",
        "1 Featured Offer/Month",
        "Basic Analytics Dashboard",
        "Community Forum Presence",
        "Monthly Performance Report"
      ]
    },
    {
      tier: "Silver Partner",
      price: "$5,000/month",
      color: "from-slate-400 to-gray-600",
      features: [
        "Everything in Bronze",
        "2 Featured Offers/Month",
        "Sponsored Content (1/week)",
        "Email Newsletter Feature",
        "Advanced Analytics",
        "Dedicated Account Manager"
      ],
      popular: true
    },
    {
      tier: "Gold Partner",
      price: "$10,000/month",
      color: "from-yellow-400 to-amber-500",
      features: [
        "Everything in Silver",
        "4 Featured Offers/Month",
        "Sponsored Content (2/week)",
        "Homepage Banner Placement",
        "Tournament Sponsorship",
        "Co-Branded Training Programs",
        "Priority Support"
      ]
    },
    {
      tier: "Platinum Partner",
      price: "Custom",
      color: "from-indigo-500 to-purple-600",
      features: [
        "Everything in Gold",
        "Unlimited Featured Offers",
        "Exclusive Brand Partnership",
        "Custom Integration Options",
        "White-Label Opportunities",
        "Executive Strategy Sessions",
        "Comprehensive Brand Integration"
      ]
    }
  ]

  const audienceStats = [
    { metric: "15,000+", label: "Active Users" },
    { metric: "45 min", label: "Avg. Daily Engagement" },
    { metric: "85%", label: "Monthly Active Rate" },
    { metric: "$75k", label: "Avg. Household Income" }
  ]

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-12">
      {/* Back Button */}
      <div>
        <Link href="/help/sponsors">
          <Button variant="outline" size="sm" className="hover:bg-gray-50">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sponsor Program
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="text-center">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full blur-lg opacity-20" />
          <div className="relative w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
            <Users className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-5xl font-light text-gray-900 mb-4">
          Sponsor <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Partnership</span>
        </h1>
        <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
          Connect your brand with thousands of passionate pickleball players and drive measurable results
        </p>
      </div>

      {/* Audience Stats */}
      <Card className="border-0 shadow-2xl backdrop-blur-sm bg-gradient-to-br from-teal-50/80 to-cyan-50/80">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-500" />
        <CardContent className="pt-10">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            {audienceStats.map((stat, idx) => (
              <div key={idx}>
                <div className="text-4xl font-bold text-teal-700 mb-2">{stat.metric}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Why Partner */}
      <div>
        <h2 className="text-3xl font-light text-gray-900 mb-8 text-center">
          Why <span className="font-semibold">Partner With Us</span>
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, idx) => (
            <Card key={idx} className="border-0 shadow-xl backdrop-blur-sm bg-white/80">
              <CardContent className="pt-6 text-center">
                <div className="relative inline-block mb-4">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl blur-sm opacity-20" />
                  <div className="relative bg-gradient-to-br from-purple-500 to-indigo-500 p-4 rounded-2xl shadow-lg">
                    <benefit.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Partnership Tiers */}
      <div>
        <h2 className="text-3xl font-light text-gray-900 mb-8 text-center">
          Partnership <span className="font-semibold">Tiers</span>
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {partnershipTiers.map((tier, idx) => (
            <Card 
              key={idx} 
              className={`border-0 shadow-xl backdrop-blur-sm bg-white/80 relative ${
                tier.popular ? 'ring-2 ring-indigo-500 scale-105' : ''
              }`}
            >
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tier.color}`} />
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-indigo-600 text-white px-4 py-1">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="pt-8">
                <CardTitle className="text-2xl font-light mb-2">{tier.tier}</CardTitle>
                <div className="text-3xl font-bold text-gray-900">{tier.price}</div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {tier.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Success Metrics */}
      <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/80">
        <CardHeader>
          <CardTitle className="text-3xl font-light text-center">
            What You'll <span className="font-semibold">Achieve</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full blur opacity-30" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Globe className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="font-semibold text-xl mb-2">Brand Awareness</h3>
              <p className="text-gray-600">Reach engaged players actively seeking gear and services</p>
            </div>
            
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full blur opacity-30" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="font-semibold text-xl mb-2">Sales Growth</h3>
              <p className="text-gray-600">Drive conversions through targeted offers and campaigns</p>
            </div>
            
            <div className="text-center">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur opacity-30" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Heart className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="font-semibold text-xl mb-2">Brand Loyalty</h3>
              <p className="text-gray-600">Build lasting relationships with your target audience</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact CTA */}
      <Card className="border-0 shadow-2xl backdrop-blur-sm bg-gradient-to-br from-indigo-50/80 to-purple-50/80">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
        <CardContent className="pt-10">
          <div className="text-center">
            <Trophy className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold mb-2">Ready to Get Started?</h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Let's discuss how a partnership can help your brand reach and engage our passionate pickleball community
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                onClick={() => window.location.href = 'mailto:partnerships@mindfulchampion.ai?subject=Sponsor Partnership Inquiry&body=Hi Mindful Champion Team,%0A%0AI am interested in learning more about sponsorship opportunities.%0A%0ACompany Name:%0AContact Name:%0AEmail:%0APhone:%0A%0APlease provide more information about partnership tiers and next steps.%0A%0AThank you!'}
              >
                <Mail className="mr-2 h-5 w-5" />
                Contact Partnership Team
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
              <Link href="/help/sponsors">
                <Button size="lg" variant="outline" className="border-indigo-300 text-indigo-700 hover:bg-indigo-50">
                  <Users className="mr-2 h-5 w-5" />
                  Learn About User Program
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
