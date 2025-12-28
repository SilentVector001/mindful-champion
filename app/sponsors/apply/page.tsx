'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  CheckCircle,
  Sparkles,
  TrendingUp,
  Users,
  Award,
  Building2,
  Zap,
  Target,
  Eye,
  Mail,
  Clock,
  Package,
  ArrowRight,
  ArrowLeft,
  Star,
  Trophy,
  Crown,
  Rocket,
  Info,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

const tiers = [
  {
    name: 'BRONZE',
    displayName: 'Bronze Partner',
    price: '$500',
    period: '/month',
    description: 'Perfect for small businesses getting started with pickleball marketing',
    features: [
      'Logo on rewards marketplace',
      'Up to 3 products in catalog',
      'Basic analytics dashboard',
      'Monthly performance reports',
      'Community spotlight feature',
      'Email support'
    ],
    color: 'from-amber-700 to-amber-900',
    bgGradient: 'from-amber-50 to-orange-50',
    borderColor: 'border-amber-500',
    accentColor: 'text-amber-700',
    icon: Award,
    impressions: '10K+',
    roi: '3-5x'
  },
  {
    name: 'SILVER',
    displayName: 'Silver Partner',
    price: '$1,500',
    period: '/month',
    description: 'Great for growing brands ready to scale their reach',
    features: [
      'Everything in Bronze',
      'Featured sponsor badge',
      'Up to 10 products in catalog',
      'Priority product placement',
      'Bi-weekly analytics & insights',
      'Email campaign inclusion',
      'Social media mentions'
    ],
    color: 'from-gray-400 to-gray-600',
    bgGradient: 'from-gray-50 to-slate-50',
    borderColor: 'border-gray-500',
    accentColor: 'text-gray-700',
    icon: Star,
    popular: true,
    impressions: '50K+',
    roi: '5-8x'
  },
  {
    name: 'GOLD',
    displayName: 'Gold Partner',
    price: '$3,500',
    period: '/month',
    description: 'For established brands seeking premium exposure and engagement',
    features: [
      'Everything in Silver',
      'Homepage hero logo placement',
      'Unlimited product listings',
      'Custom branded landing page',
      'Weekly analytics & strategy calls',
      'Dedicated account manager',
      'Co-branded social content',
      'Event sponsorship opportunities'
    ],
    color: 'from-yellow-400 to-yellow-600',
    bgGradient: 'from-yellow-50 to-amber-50',
    borderColor: 'border-yellow-500',
    accentColor: 'text-yellow-700',
    icon: Trophy,
    impressions: '100K+',
    roi: '8-12x'
  },
  {
    name: 'PLATINUM',
    displayName: 'Platinum Partner',
    price: '$7,500',
    period: '/month',
    description: 'Ultimate partnership for enterprise brands dominating the market',
    features: [
      'Everything in Gold',
      'Exclusive partnership status',
      'Co-branded feature development',
      'Major event naming rights',
      'Real-time analytics API access',
      'Custom integration & automation',
      'Quarterly executive reviews',
      'White-label opportunities'
    ],
    color: 'from-purple-500 to-indigo-600',
    bgGradient: 'from-purple-50 to-indigo-50',
    borderColor: 'border-purple-500',
    accentColor: 'text-purple-700',
    icon: Crown,
    impressions: '200K+',
    roi: '12-20x'
  }
];

const benefits = [
  {
    icon: Users,
    title: 'Engaged Community',
    description: '50,000+ active pickleball players and enthusiasts'
  },
  {
    icon: Target,
    title: 'Targeted Reach',
    description: 'Connect with players actively seeking pickleball products and services'
  },
  {
    icon: TrendingUp,
    title: 'Performance Tracking',
    description: 'Detailed analytics on impressions, clicks, and redemptions'
  },
  {
    icon: Eye,
    title: 'Brand Visibility',
    description: 'Premium placement in our marketplace and achievement rewards'
  }
];

export default function SponsorApplicationPage() {
  const router = useRouter();
  const [step, setStep] = useState<'tier-selection' | 'application' | 'submitted'>('tier-selection');
  const [selectedTier, setSelectedTier] = useState<typeof tiers[0] | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    email: '',
    phone: '',
    contactPerson: '',
    industry: '',
    description: '',
    yearsInBusiness: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: '',
      linkedin: ''
    },
    interestedTier: '',
    marketingGoals: '',
    targetAudience: ''
  });

  const handleTierSelect = (tier: typeof tiers[0]) => {
    setSelectedTier(tier);
    setFormData({ ...formData, interestedTier: tier.name });
    setStep('application');
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Prevent double submission
    if (loading) {
      console.warn('⚠️ Submission already in progress');
      toast.warning('Please wait, your application is being submitted...');
      return;
    }

    // Client-side validation
    if (!formData.companyName?.trim()) {
      toast.error('Please enter your company name');
      return;
    }
    if (!formData.email?.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    if (!formData.contactPerson?.trim()) {
      toast.error('Please enter a contact person name');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email?.trim() || '')) {
      toast.error('Please enter a valid email address');
      return;
    }

    console.log('📝 Starting form submission...', {
      companyName: formData.companyName,
      email: formData.email,
      tier: formData.interestedTier
    });

    setLoading(true);

    try {
      console.log('🌐 Sending fetch request to /api/sponsors/apply');
      
      const response = await fetch('/api/sponsors/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      console.log('📡 Response received:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      // Try to parse response as JSON
      let data;
      try {
        const text = await response.text();
        console.log('📄 Raw response:', text.substring(0, 200));
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error('❌ Failed to parse response JSON:', parseError);
        toast.error('Server returned an invalid response. Please try again or contact support.');
        return;
      }

      // Handle error responses
      if (!response.ok) {
        const errorMessage = data?.error || data?.message || `Server error (${response.status}). Please try again.`;
        console.error('❌ API returned error:', errorMessage);
        toast.error(errorMessage, {
          duration: 5000,
          description: 'If this issue persists, please contact our partnerships team.'
        });
        return;
      }

      // Success!
      console.log('✅ Application submitted successfully!', data);
      toast.success(data?.message || 'Application submitted successfully!', {
        duration: 6000,
        description: 'Check your email for confirmation and next steps.'
      });
      
      // Small delay before showing success screen to ensure toast is visible
      setTimeout(() => {
        setStep('submitted');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 500);
      
    } catch (error: any) {
      console.error('❌ Form submission error:', error);
      const errorMessage = error?.message || 'Network error. Please check your connection and try again.';
      toast.error(errorMessage, {
        duration: 5000,
        description: 'If you continue to experience issues, please contact partnerships@mindfulchampion.com'
      });
    } finally {
      setLoading(false);
      console.log('🏁 Form submission complete, loading set to false');
    }
  };

  // STEP 3: Success/Submitted View
  if (step === 'submitted') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-purple-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Main Success Card */}
            <Card className="text-center p-12 border-2 border-teal-200 mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="inline-block mb-6"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-teal-400 to-teal-600 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
              </motion.div>
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
                🎉 Application Received!
              </h2>
              <p className="text-gray-700 mb-4 text-lg">
                Thank you, <strong>{formData.contactPerson}</strong>!
              </p>
              <p className="text-gray-600 mb-6 text-lg">
                We're <strong>thrilled</strong> that <strong>{formData.companyName}</strong> wants to join the Mindful Champion family!
              </p>
              <div className="inline-flex items-center gap-2 bg-teal-50 px-6 py-3 rounded-full border border-teal-200 mb-8">
                <Mail className="w-5 h-5 text-teal-600" />
                <p className="text-sm text-teal-700 font-medium">
                  Confirmation email sent to <strong>{formData.email}</strong>
                </p>
              </div>
            </Card>

            {/* What Happens Next */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-8 border-2 border-purple-200 mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">What Happens Next?</h3>
                </div>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Review Process (3-5 Business Days)</h4>
                      <p className="text-gray-600 text-sm">
                        Our partnerships team will carefully review your application, considering your company's alignment with our community values and the tier you're interested in.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Personal Contact</h4>
                      <p className="text-gray-600 text-sm">
                        We'll reach out directly to <strong>{formData.email}</strong> with our decision. If approved, we'll schedule a brief onboarding call to get you set up for success!
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Portal Access & Onboarding</h4>
                      <p className="text-gray-600 text-sm">
                        Upon approval, you'll receive login credentials and a personalized guide to access your Sponsor Portal and start creating offers immediately.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* What You'll Get */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-8 bg-gradient-to-br from-amber-50 to-pink-50 border-2 border-amber-200 mb-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-pink-600 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Once Approved, You'll Get:</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 bg-white/70 p-4 rounded-lg border border-amber-200">
                    <Target className="w-5 h-5 text-teal-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Sponsor Portal Access</h4>
                      <p className="text-sm text-gray-600">Your own dashboard to create and manage offers in real-time</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white/70 p-4 rounded-lg border border-amber-200">
                    <TrendingUp className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Real-Time Analytics</h4>
                      <p className="text-sm text-gray-600">Track views, clicks, and redemptions with detailed insights</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white/70 p-4 rounded-lg border border-amber-200">
                    <Package className="w-5 h-5 text-pink-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Offer Creation Tools</h4>
                      <p className="text-sm text-gray-600">Upload products, set prices, and design promotions easily</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-white/70 p-4 rounded-lg border border-amber-200">
                    <Users className="w-5 h-5 text-teal-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Direct Communication</h4>
                      <p className="text-sm text-gray-600">Coordinate directly with our partnerships team for support</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Portal Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-8 bg-gray-50 border-2 border-gray-200 mb-6">
                <div className="text-center">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Your Portal Will Be At:</h3>
                  <div className="inline-block bg-white px-6 py-3 rounded-lg border-2 border-gray-300 mb-3">
                    <code className="text-teal-600 font-mono font-semibold">
                      mindful-champion-2hzb4j.abacusai.app/sponsors/portal
                    </code>
                  </div>
                  <p className="text-sm text-gray-500 italic">
                    (Login credentials will be provided upon approval)
                  </p>
                </div>
              </Card>
            </motion.div>

            {/* Questions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <Card className="p-6 border-2 border-gray-200 mb-6">
                <p className="text-gray-700 mb-4">
                  <strong>Questions in the meantime?</strong>
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Feel free to reply to the confirmation email or reach out to our partnerships team directly.
                </p>
                <p className="text-lg font-bold text-gray-900">
                  We can't wait to partner with you! 🤝
                </p>
              </Card>
              <Button
                onClick={() => router.push('/')}
                size="lg"
                className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white px-8"
              >
                Return to Home
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // STEP 1: Tier Selection View
  if (step === 'tier-selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-purple-50">
        {/* Hero Section */}
        <section className="py-20 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-teal-50/30 to-transparent pointer-events-none"></div>
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-6 bg-teal-100 text-teal-700 border-teal-300 px-6 py-2 text-base">
                <Rocket className="w-4 h-4 mr-2 inline" />
                Step 1 of 2: Choose Your Partnership Tier
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-teal-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Select Your Partnership Level
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Choose the sponsorship tier that aligns with your business goals and budget. Each tier is designed to deliver maximum ROI.
              </p>
            </motion.div>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-4 gap-6 mt-12">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="h-full"
                >
                  <Card className="p-6 h-full bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 backdrop-blur-sm" style={{
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08), 0 1px 8px rgba(0, 0, 0, 0.05)'
                  }}>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-teal-400 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <benefit.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-gray-900">{benefit.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{benefit.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Tiers with Select Buttons */}
        <section className="py-16 px-4 bg-gradient-to-b from-white/80 via-gray-50/40 to-white/80 relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.05),transparent_50%)] pointer-events-none"></div>
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold mb-4 text-gray-900">Partnership Tiers</h2>
              <p className="text-xl text-gray-600">
                Select the tier that best fits your brand's ambitions
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {tiers.map((tier, index) => (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                  whileHover={{ 
                    y: -12, 
                    scale: tier.popular ? 1.03 : 1.02,
                    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
                  }}
                  className={tier.popular ? 'lg:scale-105 z-10' : ''}
                >
                  <Card 
                    className={`relative h-full flex flex-col bg-white rounded-2xl backdrop-blur-sm ${
                      tier.popular 
                        ? 'border-2 border-teal-400' 
                        : `border ${tier.borderColor}`
                    } transition-all duration-400`}
                    style={{
                      boxShadow: tier.popular 
                        ? '0 20px 60px rgba(20, 184, 166, 0.25), 0 8px 20px rgba(0, 0, 0, 0.12)' 
                        : '0 15px 40px rgba(0, 0, 0, 0.1), 0 5px 15px rgba(0, 0, 0, 0.06)'
                    }}
                  >
                    {tier.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                        <Badge className="bg-gradient-to-r from-teal-500 to-purple-500 text-white px-6 py-2 text-sm font-bold shadow-xl backdrop-blur-md">
                          ⭐ MOST POPULAR
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-4">
                      <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${tier.color} flex items-center justify-center mb-4 shadow-lg`}>
                        <tier.icon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl mb-2 text-gray-900">{tier.displayName}</CardTitle>
                      <div className="flex items-baseline justify-center gap-1 my-3">
                        <span className="text-5xl font-bold text-gray-900">{tier.price}</span>
                        <span className="text-gray-600 text-lg">{tier.period}</span>
                      </div>
                      <div className="space-y-2 mt-3">
                        <Badge variant="outline" className="border-gray-300 text-gray-700">
                          <Eye className="w-3 h-3 mr-1" />
                          {tier.impressions} impressions/mo
                        </Badge>
                        <Badge className="bg-green-100 text-green-700 border-green-300">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {tier.roi} ROI
                        </Badge>
                      </div>
                      <CardDescription className="mt-3 text-gray-600">{tier.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex-1 flex flex-col">
                      <ul className="space-y-3 mb-6 flex-1">
                        {tier.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button
                        onClick={() => handleTierSelect(tier)}
                        className={`w-full py-6 text-base font-semibold ${
                          tier.popular
                            ? 'bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white shadow-lg'
                            : 'bg-gray-900 hover:bg-gray-800 text-white'
                        }`}
                      >
                        Select {tier.displayName}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center mt-12"
            >
              <p className="text-gray-600 text-lg">
                Need help choosing?{" "}
                <a 
                  href="mailto:partnerships@mindfulchampion.com" 
                  className="text-teal-600 hover:text-teal-700 underline font-semibold"
                >
                  Contact our partnerships team
                </a>
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    );
  }

  // STEP 2: Application Form View
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-purple-50">
      {/* Selected Tier Banner */}
      <AnimatePresence>
        {selectedTier && (
          <motion.section
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`py-8 px-4 bg-gradient-to-r ${selectedTier.bgGradient} border-b-4 ${selectedTier.borderColor}`}
          >
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${selectedTier.color} flex items-center justify-center shadow-xl`}>
                    <selectedTier.icon className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <Badge className="mb-2 bg-teal-600 text-white">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Selected Tier
                    </Badge>
                    <h2 className="text-3xl font-bold text-gray-900">{selectedTier.displayName}</h2>
                    <p className={`text-xl font-semibold ${selectedTier.accentColor}`}>
                      {selectedTier.price}{selectedTier.period}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 text-center md:text-right">
                  <div className="flex items-center gap-2 justify-center md:justify-end">
                    <Eye className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700 font-semibold">{selectedTier.impressions} impressions/month</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center md:justify-end">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-green-700 font-semibold">{selectedTier.roi} Expected ROI</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setStep('tier-selection')}
                    className="border-2 border-gray-400 hover:bg-gray-100 mt-2"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Change Tier
                  </Button>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Application Form */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-300 px-6 py-2 text-base">
                <Building2 className="w-4 h-4 mr-2 inline" />
                Step 2 of 2: Complete Your Application
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
                Partnership Application
              </h1>
              <p className="text-lg text-gray-600">
                Tell us about your company and we'll get back to you within 3-5 business days
              </p>
            </div>

            {/* Sponsor Help Link Banner */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <Card className="border-2 border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                      <Info className="w-6 h-6 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        Learn More About Our Sponsor Program
                      </h3>
                      <p className="text-sm text-gray-700 mb-3">
                        Before applying, we recommend reviewing our comprehensive sponsor program guide to understand how partnerships work, point earning opportunities, and the benefits you'll receive.
                      </p>
                      <Link href="/help/sponsors">
                        <Button
                          variant="outline"
                          className="border-2 border-teal-500 text-teal-700 hover:bg-teal-50 font-semibold"
                        >
                          <Info className="mr-2 h-4 w-4" />
                          View Sponsor Program Guide
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <Card className="border-2 border-teal-200 shadow-2xl">
              <CardContent className="pt-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-teal-600" />
                    Company Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        required
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        placeholder="Acme Pickleball Co."
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="industry">Industry *</Label>
                      <Input
                        id="industry"
                        required
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        placeholder="Sports Equipment, Apparel, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="yearsInBusiness">Years in Business</Label>
                      <Input
                        id="yearsInBusiness"
                        type="number"
                        min="0"
                        value={formData.yearsInBusiness}
                        onChange={(e) => setFormData({ ...formData, yearsInBusiness: e.target.value })}
                        placeholder="5"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Company Description *</Label>
                    <Textarea
                      id="description"
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Tell us about your company, products, and what makes you unique..."
                      rows={4}
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-teal-600" />
                    Contact Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactPerson">Contact Person *</Label>
                      <Input
                        id="contactPerson"
                        required
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>

                {/* Social Media */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-teal-600" />
                    Social Media (Optional)
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        value={formData.socialMedia.facebook}
                        onChange={(e) => setFormData({
                          ...formData,
                          socialMedia: { ...formData.socialMedia, facebook: e.target.value }
                        })}
                        placeholder="facebook.com/yourcompany"
                      />
                    </div>
                    <div>
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        value={formData.socialMedia.instagram}
                        onChange={(e) => setFormData({
                          ...formData,
                          socialMedia: { ...formData.socialMedia, instagram: e.target.value }
                        })}
                        placeholder="@yourcompany"
                      />
                    </div>
                    <div>
                      <Label htmlFor="twitter">Twitter/X</Label>
                      <Input
                        id="twitter"
                        value={formData.socialMedia.twitter}
                        onChange={(e) => setFormData({
                          ...formData,
                          socialMedia: { ...formData.socialMedia, twitter: e.target.value }
                        })}
                        placeholder="@yourcompany"
                      />
                    </div>
                    <div>
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={formData.socialMedia.linkedin}
                        onChange={(e) => setFormData({
                          ...formData,
                          socialMedia: { ...formData.socialMedia, linkedin: e.target.value }
                        })}
                        placeholder="linkedin.com/company/yourcompany"
                      />
                    </div>
                  </div>
                </div>

                {/* Partnership Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Target className="w-5 h-5 text-teal-600" />
                    Partnership Details
                  </h3>
                  
                  {/* Selected Tier Display - Read Only */}
                  {selectedTier && (
                    <div className={`p-4 rounded-lg border-2 ${selectedTier.borderColor} bg-gradient-to-r ${selectedTier.bgGradient}`}>
                      <Label className="text-sm text-gray-600 mb-2 block">Selected Partnership Tier</Label>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${selectedTier.color} flex items-center justify-center`}>
                          <selectedTier.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className={`font-bold text-lg ${selectedTier.accentColor}`}>
                            {selectedTier.displayName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {selectedTier.price}{selectedTier.period}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="marketingGoals">Marketing Goals</Label>
                    <Textarea
                      id="marketingGoals"
                      value={formData.marketingGoals}
                      onChange={(e) => setFormData({ ...formData, marketingGoals: e.target.value })}
                      placeholder="What do you hope to achieve through this partnership?"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="targetAudience">Target Audience</Label>
                    <Textarea
                      id="targetAudience"
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                      placeholder="Describe your ideal customer within the pickleball community..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="space-y-4 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white text-lg py-7 shadow-lg font-semibold"
                  >
                    {loading ? (
                      <>
                        <Clock className="mr-2 h-5 w-5 animate-spin" />
                        Submitting Application...
                      </>
                    ) : (
                      <>
                        <Rocket className="mr-2 h-5 w-5" />
                        Submit Application
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                  
                  <div className="text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setStep('tier-selection')}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Tier Selection
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center"
          >
            <Card className="border-2 border-gray-200 bg-gray-50 p-6">
              <p className="text-gray-700 mb-2">
                <strong>Questions about the application?</strong>
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Our partnerships team is here to help you every step of the way.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Link href="/help/sponsors">
                  <Button
                    variant="outline"
                    className="border-2 border-purple-500 text-purple-600 hover:bg-purple-50"
                  >
                    <Info className="mr-2 h-5 w-5" />
                    Sponsor Program Guide
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = 'mailto:partnerships@mindfulchampion.com'}
                  className="border-2 border-teal-500 text-teal-600 hover:bg-teal-50"
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Contact Partnerships Team
                </Button>
              </div>
            </Card>
          </motion.div>
        </motion.div>
        </div>
      </section>
    </div>
  );
}
