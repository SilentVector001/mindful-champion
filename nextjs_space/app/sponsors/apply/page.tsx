// @ts-nocheck
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import MainNavigation from '@/components/navigation/main-navigation'
import {
  CheckCircle, Sparkles, TrendingUp, Users, Award,
  Building2, Target, Eye, Mail, Clock, ArrowRight,
  ArrowLeft, Star, Trophy, Rocket, Zap, Globe,
  BarChart3, Gift, Heart
} from 'lucide-react'
import { cn } from '@/lib/utils'

const tiers = [
  {
    id: 'community',
    name: 'Community Partner',
    tagline: 'Support the Movement',
    description: 'Perfect for local businesses and brands passionate about growing the pickleball community.',
    icon: Heart,
    gradient: 'from-emerald-500 to-teal-500',
    color: 'emerald',
    benefits: [
      'Logo featured in our marketplace',
      'Up to 5 product listings',
      'Monthly performance insights',
      'Community newsletter features',
      'Dedicated partner badge'
    ],
    reach: '10K+ Monthly Impressions'
  },
  {
    id: 'growth',
    name: 'Growth Partner',
    tagline: 'Scale Your Reach',
    description: 'For brands ready to expand their presence and connect with engaged pickleball enthusiasts.',
    icon: TrendingUp,
    gradient: 'from-cyan-500 to-purple-500',
    color: 'cyan',
    popular: true,
    benefits: [
      'Everything in Community tier',
      'Featured sponsor placement',
      'Unlimited product catalog',
      'Bi-weekly analytics reports',
      'Social media co-promotion',
      'Email campaign inclusion',
      'Event sponsorship priority'
    ],
    reach: '50K+ Monthly Impressions'
  },
  {
    id: 'enterprise',
    name: 'Enterprise Partner',
    tagline: 'Lead the Industry',
    description: 'Premium partnership for major brands seeking maximum visibility and deep community integration.',
    icon: Rocket,
    gradient: 'from-amber-500 to-orange-500',
    color: 'amber',
    benefits: [
      'Everything in Growth tier',
      'Homepage hero placement',
      'Custom branded experiences',
      'Dedicated account manager',
      'Real-time analytics dashboard',
      'Co-branded content creation',
      'Exclusive naming rights',
      'Quarterly strategy reviews'
    ],
    reach: '200K+ Monthly Impressions'
  }
]

const whyPartner = [
  { icon: Users, title: '50,000+ Active Players', description: 'Engaged community of pickleball enthusiasts' },
  { icon: Target, title: 'Targeted Reach', description: 'Connect with players actively seeking products' },
  { icon: BarChart3, title: 'Measurable Results', description: 'Track every impression, click, and conversion' },
  { icon: Globe, title: 'Growing Sport', description: 'Fastest growing sport in America - get in early' },
]

export default function SponsorApplicationPage() {
  const router = useRouter()
  const [step, setStep] = useState<'select' | 'apply' | 'success'>('select')
  const [selectedTier, setSelectedTier] = useState<typeof tiers[0] | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    email: '',
    contactPerson: '',
    industry: '',
    description: '',
    interestedTier: '',
    marketingGoals: ''
  })

  const handleTierSelect = (tier: typeof tiers[0]) => {
    setSelectedTier(tier)
    setFormData({ ...formData, interestedTier: tier.id })
    setStep('apply')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    if (!formData.companyName?.trim() || !formData.email?.trim() || !formData.contactPerson?.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/sponsors/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('Application submitted successfully!')
        setStep('success')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        const data = await response.json()
        toast.error(data.error || 'Something went wrong')
      }
    } catch (error) {
      toast.error('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // SUCCESS VIEW
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-slate-950">
        <MainNavigation />
        <div className="pt-24 pb-16 px-4 max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-white mb-4">Application Received! 🎉</h1>
          <p className="text-slate-400 mb-8">
            Thank you, <span className="text-white font-semibold">{formData.contactPerson}</span>! 
            We're excited about partnering with <span className="text-cyan-400 font-semibold">{formData.companyName}</span>.
          </p>

          <Card className="bg-slate-900/60 border-slate-700/50 mb-8">
            <CardContent className="p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" /> What Happens Next?
              </h3>
              <div className="space-y-4 text-left">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold flex-shrink-0">1</div>
                  <div>
                    <p className="text-white font-medium">Review (3-5 business days)</p>
                    <p className="text-slate-400 text-sm">Our partnerships team will review your application</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold flex-shrink-0">2</div>
                  <div>
                    <p className="text-white font-medium">Discovery Call</p>
                    <p className="text-slate-400 text-sm">We'll schedule a call to discuss your goals and partnership details</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold flex-shrink-0">3</div>
                  <div>
                    <p className="text-white font-medium">Onboarding</p>
                    <p className="text-slate-400 text-sm">Get portal access and start reaching our community!</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-2 text-slate-400 text-sm mb-8">
            <Mail className="w-4 h-4" />
            Confirmation sent to <span className="text-white">{formData.email}</span>
          </div>

          <Button onClick={() => router.push('/')} className="bg-gradient-to-r from-cyan-500 to-purple-500">
            Return to Home
          </Button>
        </div>
      </div>
    )
  }

  // TIER SELECTION VIEW
  if (step === 'select') {
    return (
      <div className="min-h-screen bg-slate-950">
        <MainNavigation />
        
        {/* Background */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative pt-24 pb-16 px-4 max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge className="mb-4 bg-cyan-500/20 text-cyan-400 border-cyan-500/30 px-4 py-1">
              <Sparkles className="w-4 h-4 mr-2" /> Partner With Us
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">
                Become a Mindful Champion Partner
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Join the fastest-growing pickleball community and put your brand in front of passionate players.
            </p>
          </motion.div>

          {/* Why Partner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          >
            {whyPartner.map((item, i) => (
              <div key={i} className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <p className="text-white font-semibold text-sm">{item.title}</p>
                <p className="text-slate-500 text-xs mt-1">{item.description}</p>
              </div>
            ))}
          </motion.div>

          {/* Partnership Tiers */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {tiers.map((tier, index) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className={cn("relative", tier.popular && "md:-mt-4 md:mb-4")}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-1">
                      <Star className="w-3 h-3 mr-1 fill-current" /> Recommended
                    </Badge>
                  </div>
                )}
                
                <Card className={cn(
                  "h-full bg-slate-900/60 border-2 transition-all duration-300",
                  tier.popular 
                    ? "border-cyan-500/50 shadow-lg shadow-cyan-500/20" 
                    : "border-slate-700/50 hover:border-slate-600"
                )}>
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="text-center mb-6">
                      <div className={cn(
                        "w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br flex items-center justify-center mb-4",
                        tier.gradient
                      )}>
                        <tier.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-1">{tier.name}</h3>
                      <p className={cn(
                        "text-sm font-medium bg-gradient-to-r bg-clip-text text-transparent",
                        tier.gradient
                      )}>
                        {tier.tagline}
                      </p>
                    </div>
                    
                    <p className="text-slate-400 text-sm text-center mb-4">
                      {tier.description}
                    </p>
                    
                    {/* Reach Badge */}
                    <div className="flex justify-center mb-6">
                      <Badge variant="outline" className="border-slate-600 text-slate-300">
                        <Eye className="w-3 h-3 mr-1" /> {tier.reach}
                      </Badge>
                    </div>

                    {/* Benefits */}
                    <ul className="space-y-3 mb-6">
                      {tier.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-300 text-sm">{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Button
                      onClick={() => handleTierSelect(tier)}
                      className={cn(
                        "w-full py-6 text-base font-semibold",
                        tier.popular
                          ? "bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                          : "bg-slate-800 hover:bg-slate-700 border border-slate-700"
                      )}
                    >
                      Apply Now <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-slate-500 text-sm"
          >
            Partnership pricing is customized based on your goals. We'll discuss details during our discovery call.
          </motion.p>
        </div>
      </div>
    )
  }

  // APPLICATION FORM VIEW
  return (
    <div className="min-h-screen bg-slate-950">
      <MainNavigation />
      
      <div className="pt-24 pb-16 px-4 max-w-2xl mx-auto">
        {/* Selected Tier Banner */}
        {selectedTier && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-xl bg-slate-900/60 border border-slate-700/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
                  selectedTier.gradient
                )}>
                  <selectedTier.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-slate-400 text-xs">Applying for</p>
                  <p className="text-white font-semibold">{selectedTier.name}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep('select')} className="text-slate-400">
                <ArrowLeft className="w-4 h-4 mr-1" /> Change
              </Button>
            </div>
          </motion.div>
        )}

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold text-white mb-2">Tell Us About Your Brand</h2>
          <p className="text-slate-400 mb-8">We'll review your application and get back to you within 3-5 business days.</p>
          
          <Card className="bg-slate-900/60 border-slate-700/50">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Company Name *</Label>
                    <Input
                      required
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="Acme Pickleball"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Website</Label>
                    <Input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://example.com"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Contact Person *</Label>
                    <Input
                      required
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      placeholder="Jane Smith"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Email *</Label>
                    <Input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jane@example.com"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-slate-300">Industry *</Label>
                  <Input
                    required
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="Sports Equipment, Apparel, Health & Wellness, etc."
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div>
                  <Label className="text-slate-300">Tell us about your company</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What does your company do? What products/services do you offer?"
                    rows={3}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div>
                  <Label className="text-slate-300">What are your marketing goals?</Label>
                  <Textarea
                    value={formData.marketingGoals}
                    onChange={(e) => setFormData({ ...formData, marketingGoals: e.target.value })}
                    placeholder="What do you hope to achieve through this partnership?"
                    rows={3}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-lg font-semibold"
                >
                  {loading ? (
                    <>Processing...</>
                  ) : (
                    <>Submit Application <ArrowRight className="w-5 h-5 ml-2" /></>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
