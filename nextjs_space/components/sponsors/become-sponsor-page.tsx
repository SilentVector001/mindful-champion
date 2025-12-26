
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Target,
  Users,
  TrendingUp,
  Gift,
  Award,
  Zap,
  CheckCircle2,
  ArrowRight,
  Trophy,
  Star,
  Sparkles,
  BarChart3,
  ShoppingBag,
  Mail,
  Rocket,
  DollarSign,
  Globe,
  Megaphone,
  Eye,
  TrendingDown,
  Clock,
  Package,
  CheckCircle,
  AlertCircle,
  Loader2,
  Building2
} from 'lucide-react';
import Link from 'next/link';

const tiers = [
  {
    name: 'Bronze Partner',
    price: '$500',
    period: '/month',
    color: 'from-amber-700 to-amber-900',
    borderColor: 'border-amber-600',
    features: [
      'Logo on rewards marketplace',
      'Up to 3 products in catalog',
      'Basic analytics dashboard',
      'Monthly performance reports',
      'Community spotlight feature',
      'Email support'
    ],
    impressions: '10K+',
    icon: Award,
    roi: '3-5x',
    highlighted: false
  },
  {
    name: 'Silver Partner',
    price: '$1,500',
    period: '/month',
    color: 'from-gray-300 to-gray-500',
    borderColor: 'border-gray-400',
    features: [
      'Everything in Bronze',
      'Featured sponsor badge',
      'Up to 10 products in catalog',
      'Priority product placement',
      'Bi-weekly analytics & insights',
      'Email campaign inclusion',
      'Social media mentions'
    ],
    impressions: '50K+',
    icon: Star,
    popular: true,
    roi: '5-8x',
    highlighted: true
  },
  {
    name: 'Gold Partner',
    price: '$3,500',
    period: '/month',
    color: 'from-yellow-400 to-yellow-600',
    borderColor: 'border-yellow-500',
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
    impressions: '100K+',
    icon: Trophy,
    roi: '8-12x',
    highlighted: false
  },
  {
    name: 'Platinum Partner',
    price: 'Custom',
    period: 'pricing',
    color: 'from-purple-400 to-purple-600',
    borderColor: 'border-purple-500',
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
    impressions: '200K+',
    icon: Sparkles,
    roi: '12-20x',
    highlighted: false
  },
];

const benefits = [
  {
    icon: Users,
    title: 'Engaged Audience',
    description: 'Access 50,000+ passionate pickleball players who actively train, compete, and invest in improving their game every single day',
    stat: '50K+',
    statLabel: 'Active Users'
  },
  {
    icon: Target,
    title: 'Smart Targeting',
    description: 'Reach users based on skill level, training frequency, achievements, and purchase intent—connect with your ideal customers at the perfect moment',
    stat: '92%',
    statLabel: 'Match Rate'
  },
  {
    icon: TrendingUp,
    title: 'Proven ROI',
    description: 'Average partners see 5-8x return on investment within 90 days. Track every impression, click, and conversion with real-time analytics',
    stat: '5-8x',
    statLabel: 'Avg ROI'
  },
  {
    icon: Gift,
    title: 'Reward Integration',
    description: 'Your products become achievement rewards—players earn points through training and redeem them for your products, creating emotional connections',
    stat: '89%',
    statLabel: 'Redemption Rate'
  },
  {
    icon: BarChart3,
    title: 'Deep Insights',
    description: 'Understand what resonates with your audience through comprehensive analytics: demographics, engagement patterns, and conversion metrics',
    stat: '24/7',
    statLabel: 'Live Data'
  },
  {
    icon: Megaphone,
    title: 'Brand Authority',
    description: 'Position your brand as a trusted leader in the pickleball community. Build credibility through authentic partnership and community endorsement',
    stat: '95%',
    statLabel: 'Trust Score'
  },
];

const successStories = [
  {
    company: 'ProPaddle Co.',
    tier: 'Gold Partner',
    result: '12x ROI in 6 months',
    quote: 'Best marketing decision we\'ve made. The engagement is incredible.',
    growth: '+340%',
    metric: 'Revenue Growth'
  },
  {
    company: 'Elite Pickleball Gear',
    tier: 'Silver Partner',
    result: '8.5x ROI in 90 days',
    quote: 'Our products reach exactly the right audience at the right time.',
    growth: '+250%',
    metric: 'Brand Awareness'
  },
  {
    company: 'Court Performance',
    tier: 'Platinum Partner',
    result: '20x ROI + Exclusivity',
    quote: 'The partnership transformed our entire marketing strategy.',
    growth: '+500%',
    metric: 'Customer Base'
  }
];

// Application Status View Component
function ApplicationStatusView({ application }: { application: any }) {
  const router = useRouter();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return {
          icon: CheckCircle,
          color: 'from-green-500 to-emerald-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-700',
          badgeColor: 'bg-green-100 text-green-700 border-green-300',
          title: '🎉 Congratulations! Your Application is Approved!',
          message: `Welcome to the Mindful Champion family, ${application.contactPerson}!`
        };
      case 'UNDER_REVIEW':
        return {
          icon: Clock,
          color: 'from-blue-500 to-cyan-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-700',
          badgeColor: 'bg-blue-100 text-blue-700 border-blue-300',
          title: '⏳ Your Application is Under Review',
          message: `Thank you for your patience, ${application.contactPerson}!`
        };
      case 'PENDING':
        return {
          icon: Clock,
          color: 'from-amber-500 to-yellow-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          textColor: 'text-amber-700',
          badgeColor: 'bg-amber-100 text-amber-700 border-amber-300',
          title: '⏰ Application Received - Pending Review',
          message: `Thank you for applying, ${application.contactPerson}!`
        };
      case 'REJECTED':
        return {
          icon: AlertCircle,
          color: 'from-red-500 to-rose-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-700',
          badgeColor: 'bg-red-100 text-red-700 border-red-300',
          title: 'Application Status Update',
          message: `Thank you for your interest, ${application.contactPerson}.`
        };
      case 'WAITLISTED':
        return {
          icon: Clock,
          color: 'from-purple-500 to-indigo-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          textColor: 'text-purple-700',
          badgeColor: 'bg-purple-100 text-purple-700 border-purple-300',
          title: '📋 You\'re on Our Waitlist!',
          message: `We appreciate your interest, ${application.contactPerson}!`
        };
      default:
        return {
          icon: Clock,
          color: 'from-gray-500 to-slate-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-700',
          badgeColor: 'bg-gray-100 text-gray-700 border-gray-300',
          title: 'Application Status',
          message: `Thank you, ${application.contactPerson}!`
        };
    }
  };

  const statusConfig = getStatusConfig(application.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Status Card */}
          <Card className={`text-center p-12 border-2 ${statusConfig.borderColor} mb-8`}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-block mb-6"
            >
              <div className={`w-24 h-24 rounded-full bg-gradient-to-r ${statusConfig.color} flex items-center justify-center mx-auto shadow-xl`}>
                <StatusIcon className="w-12 h-12 text-white" />
              </div>
            </motion.div>
            
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
              {statusConfig.title}
            </h1>
            
            <p className="text-gray-700 mb-4 text-lg">
              {statusConfig.message}
            </p>
            
            <p className="text-gray-600 mb-6 text-lg">
              Your application for <strong>{application.companyName}</strong> has been received.
            </p>

            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 mb-8" style={{
              backgroundColor: statusConfig.bgColor,
              borderColor: statusConfig.borderColor.replace('border-', '')
            }}>
              <Badge className={statusConfig.badgeColor}>
                {application.status.replace('_', ' ')}
              </Badge>
              <span className={`text-sm font-medium ${statusConfig.textColor}`}>
                Applied: {new Date(application.createdAt).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </span>
            </div>

            {application.reviewNotes && (
              <div className={`${statusConfig.bgColor} p-4 rounded-lg border ${statusConfig.borderColor} mb-6`}>
                <p className={`text-sm ${statusConfig.textColor}`}>
                  <strong>Note from our team:</strong> {application.reviewNotes}
                </p>
              </div>
            )}
          </Card>

          {/* How the Program Works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-8 border-2 border-teal-200 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-400 to-teal-600 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">How the Partnership Program Works</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Sponsor Portal Access</h3>
                      <p className="text-sm text-gray-600">
                        Once approved, you'll receive login credentials to access your dedicated sponsor dashboard where you can manage offers and track performance.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Create Your Offers</h3>
                      <p className="text-sm text-gray-600">
                        Upload products, set prices and point values, and design promotional campaigns that resonate with our passionate pickleball community.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Reach Engaged Players</h3>
                      <p className="text-sm text-gray-600">
                        Your offers appear in our marketplace and as achievement rewards, connecting you with 50,000+ active players at the perfect moment.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Track & Optimize</h3>
                      <p className="text-sm text-gray-600">
                        Monitor real-time analytics including impressions, clicks, conversions, and ROI to continuously improve your marketing strategy.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* What Happens Next - Dynamic based on status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {application.status === 'APPROVED' && (
              <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-emerald-600 flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">What Happens Next?</h2>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4 bg-white/70 p-5 rounded-lg border border-green-200">
                    <Package className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Check Your Email</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        We've sent your portal login credentials to <strong>{application.email}</strong>
                      </p>
                      <p className="text-xs text-gray-500 italic">
                        (Check your spam folder if you don't see it within 15 minutes)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 bg-white/70 p-5 rounded-lg border border-green-200">
                    <Building2 className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Access Your Portal</h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Log in to your sponsor dashboard and complete your profile setup to start creating offers.
                      </p>
                      <Button
                        onClick={() => router.push('/sponsors/portal')}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                      >
                        Go to Sponsor Portal
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 bg-white/70 p-5 rounded-lg border border-green-200">
                    <Users className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Onboarding Support</h3>
                      <p className="text-sm text-gray-600">
                        Our partnerships team will reach out to schedule a brief onboarding call and ensure you're set up for success!
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {(application.status === 'PENDING' || application.status === 'UNDER_REVIEW') && (
              <Card className="p-8 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-cyan-600 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">What Happens Next?</h2>
                </div>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Review Process (3-5 Business Days)</h3>
                      <p className="text-sm text-gray-600">
                        Our partnerships team is carefully reviewing your application, considering your company's alignment with our community values and the {application.interestedTier} tier you selected.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Personal Contact</h3>
                      <p className="text-sm text-gray-600">
                        We'll reach out directly to <strong>{application.email}</strong> with our decision. If approved, we'll schedule a brief onboarding call to get you started!
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Portal Access & Launch</h3>
                      <p className="text-sm text-gray-600">
                        Upon approval, you'll receive login credentials and a personalized guide to access your Sponsor Portal and start creating offers immediately.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {application.status === 'WAITLISTED' && (
              <Card className="p-8 bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-indigo-600 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">What Happens Next?</h2>
                </div>

                <p className="text-gray-600 mb-4">
                  We're currently at capacity for the {application.interestedTier} tier, but you're on our priority waitlist! We'll notify you as soon as a slot becomes available.
                </p>
                <p className="text-sm text-gray-600">
                  In the meantime, feel free to reach out to <a href="mailto:partnerships@mindfulchampion.com" className="text-teal-600 underline font-semibold">partnerships@mindfulchampion.com</a> with any questions.
                </p>
              </Card>
            )}

            {application.status === 'REJECTED' && (
              <Card className="p-8 bg-gradient-to-br from-gray-50 to-slate-50 border-2 border-gray-200 mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-400 to-slate-600 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">What Happens Next?</h2>
                </div>

                <p className="text-gray-600 mb-4">
                  After careful review, we've determined that we're not able to move forward with your application at this time. However, we encourage you to reapply in the future as your business grows or if circumstances change.
                </p>
                <p className="text-sm text-gray-600">
                  If you have questions about this decision, please reach out to <a href="mailto:partnerships@mindfulchampion.com" className="text-teal-600 underline font-semibold">partnerships@mindfulchampion.com</a>.
                </p>
              </Card>
            )}
          </motion.div>

          {/* Benefits Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-8 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-orange-600 flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">What You'll Get as a Partner</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 bg-white/70 p-4 rounded-lg border border-amber-200">
                  <Target className="w-5 h-5 text-teal-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Dedicated Portal Dashboard</h3>
                    <p className="text-sm text-gray-600">Manage all your offers and campaigns in one place</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/70 p-4 rounded-lg border border-amber-200">
                  <TrendingUp className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Real-Time Analytics</h3>
                    <p className="text-sm text-gray-600">Track impressions, clicks, conversions, and ROI</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/70 p-4 rounded-lg border border-amber-200">
                  <Users className="w-5 h-5 text-teal-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Access to 50K+ Players</h3>
                    <p className="text-sm text-gray-600">Connect with engaged, passionate pickleball enthusiasts</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/70 p-4 rounded-lg border border-amber-200">
                  <Sparkles className="w-5 h-5 text-pink-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Premium Brand Visibility</h3>
                    <p className="text-sm text-gray-600">Featured placement in marketplace and rewards</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <Card className="p-6 border-2 border-gray-200 mb-6">
              <Mail className="w-10 h-10 text-teal-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Questions in the Meantime?</h3>
              <p className="text-gray-600 mb-4">
                Feel free to reach out to our partnerships team anytime.
              </p>
              <Button
                onClick={() => window.location.href = 'mailto:partnerships@mindfulchampion.com'}
                variant="outline"
                className="border-2 border-teal-500 text-teal-600 hover:bg-teal-50"
              >
                <Mail className="mr-2 h-5 w-5" />
                Contact Partnerships Team
              </Button>
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

export default function BecomeSponsorPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only check for application if user is authenticated
    if (status === 'authenticated') {
      fetchApplication();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  const fetchApplication = async () => {
    try {
      const response = await fetch('/api/sponsors/apply');
      if (response.ok) {
        const data = await response.json();
        setApplication(data.application);
      }
    } catch (error) {
      console.error('Error fetching application:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = () => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/sponsors/apply');
    } else {
      router.push('/sponsors/apply');
    }
  };

  // Show loading state while checking authentication
  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  // If user has an application, show status view
  if (application) {
    return <ApplicationStatusView application={application} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50">
      {/* Hero Section - Enhanced */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-cyan-900 to-blue-900 text-white">
        <div className="absolute inset-0 bg-grid-white/5"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-teal-500/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-emerald-500/20 to-transparent"></div>
        
        <div className="container mx-auto px-4 py-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto"
          >
            {/* Badge */}
            <div className="text-center mb-8">
              <Badge className="mb-6 bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border-teal-500/50 px-6 py-2 text-base">
                <Rocket className="w-4 h-4 mr-2 inline" />
                Limited Partnership Slots Available
              </Badge>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-center leading-tight">
              Transform Your Brand into a{" "}
              <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                Pickleball Powerhouse
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 text-cyan-100 text-center max-w-4xl mx-auto leading-relaxed">
              Join the #1 AI-powered pickleball coaching platform and connect your brand with 50,000+ 
              passionate athletes who train daily, compete regularly, and actively invest in quality gear
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button
                size="lg"
                onClick={handleApplyClick}
                className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white text-lg px-10 py-7 shadow-2xl shadow-teal-500/50 transform hover:scale-105 transition-all"
              >
                <Sparkles className="mr-2 h-6 w-6" />
                Apply Now - Limited Spots
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
              <Button
                size="lg"
                onClick={() => window.location.href = 'mailto:partnerships@mindfulchampion.com'}
                className="border-2 border-white bg-transparent text-white hover:bg-white/20 hover:text-white text-lg px-10 py-7"
              >
                <Mail className="mr-2 h-5 w-5" />
                Contact Partnerships Team
              </Button>
            </div>

            {/* Stats Grid - Enhanced */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { value: '50K+', label: 'Active Players', icon: Users },
                { value: '500K+', label: 'Monthly Impressions', icon: Eye },
                { value: '5-8x', label: 'Average ROI', icon: TrendingUp },
                { value: '95%', label: 'Partner Satisfaction', icon: Trophy }
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center hover:bg-white/15 transition-all"
                >
                  <stat.icon className="w-8 h-8 mx-auto mb-3 text-teal-300" />
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-cyan-200 text-sm font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Philosophy Section - NEW */}
      <section className="py-20 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-teal-100 text-teal-700 border-teal-300">
                <Sparkles className="w-4 h-4 mr-2 inline" />
                Our Sponsorship Philosophy
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Value Through Connection, Not Interruption
              </h2>
            </div>

            <Card className="border-2 border-teal-300 shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Gift className="w-10 h-10 text-white" />
                  <h3 className="text-3xl font-bold text-white">What Makes Us Different</h3>
                </div>
              </div>
              <CardContent className="p-10">
                <div className="space-y-6 text-lg leading-relaxed text-gray-700">
                  <p className="text-xl font-semibold text-emerald-700">
                    <strong>Your sponsorship provides authentic brand exposure</strong> to thousands of engaged pickleball enthusiasts through our revolutionary approach to brand awareness.
                  </p>
                  
                  <p>
                    Unlike traditional advertising that interrupts and annoys, Mindful Champion creates <strong>genuine connections</strong> between sponsors and our passionate community through our innovative <strong>rewards program</strong>.
                  </p>

                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-xl border-l-4 border-teal-500">
                    <h4 className="font-bold text-xl mb-3 text-teal-800 flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6" />
                      How Our Rewards-Based System Works
                    </h4>
                    <p>
                      Your products and services are introduced to users in a <strong>welcoming, non-intrusive way</strong> that creates real value. Members earn rewards by engaging with our platform—training, achieving goals, and improving their game. They can then redeem those rewards for your offerings, creating a <strong>win-win relationship</strong> where users discover quality products they genuinely want, and you gain loyal customers who <em>chose</em> you.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-xl border-l-4 border-emerald-500">
                    <h4 className="font-bold text-xl mb-3 text-emerald-800 flex items-center gap-2">
                      <Sparkles className="w-6 h-6" />
                      Our Core Philosophy
                    </h4>
                    <p>
                      We believe in creating value through <strong>meaningful connections, not interruptions</strong>. Your brand reaches our community through our rewards program, which makes discovering new products and services an <strong>exciting benefit</strong> rather than an annoyance.
                    </p>
                  </div>

                  <p className="text-xl font-semibold text-center text-teal-700 pt-4">
                    This approach delivers superior brand awareness and customer acquisition because users are <strong>actively choosing</strong> to engage with your offerings—transforming your brand presence from advertisement to <strong>welcomed discovery</strong>.
                  </p>
                </div>

                {/* Visual Benefits Grid */}
                <div className="grid md:grid-cols-3 gap-6 mt-10">
                  <div className="text-center p-6 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-200">
                    <Users className="w-12 h-12 text-teal-600 mx-auto mb-3" />
                    <h5 className="font-bold text-gray-900 mb-2">Engaged Users</h5>
                    <p className="text-sm text-gray-600">Users discover your brand while earning rewards for their achievements</p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                    <Gift className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                    <h5 className="font-bold text-gray-900 mb-2">Welcomed Exposure</h5>
                    <p className="text-sm text-gray-600">Your products are rewards, not ads—creating positive brand associations</p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border border-cyan-200">
                    <TrendingUp className="w-12 h-12 text-cyan-600 mx-auto mb-3" />
                    <h5 className="font-bold text-gray-900 mb-2">Superior ROI</h5>
                    <p className="text-sm text-gray-600">Higher conversion rates from users who actively choose your brand</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Success Stories - NEW SECTION */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-teal-100 text-teal-700 border-teal-300">
              Partner Success Stories
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Real Partners, Real Results
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how leading pickleball brands are crushing their marketing goals with Mindful Champion
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {successStories.map((story, index) => (
              <motion.div
                key={story.company}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-2 hover:border-teal-500 transition-all hover:shadow-2xl">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-teal-100 text-teal-700">{story.tier}</Badge>
                      <Trophy className="w-6 h-6 text-yellow-500" />
                    </div>
                    <CardTitle className="text-2xl mb-2">{story.company}</CardTitle>
                    <div className="text-3xl font-bold text-teal-600 mb-2">{story.result}</div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600 italic">"{story.quote}"</p>
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{story.metric}</span>
                        <span className="text-2xl font-bold text-green-600">{story.growth}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid - Enhanced */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-cyan-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-cyan-100 text-cyan-700 border-cyan-300">
              Partnership Benefits
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Why Top Brands Choose Us
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              More than just advertising—a strategic partnership that drives measurable growth
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-2xl transition-all border-2 hover:border-teal-500 group">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <benefit.icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-teal-600">{benefit.stat}</div>
                        <div className="text-xs text-gray-500">{benefit.statLabel}</div>
                      </div>
                    </div>
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Enhanced */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-300">
              Simple Process, Maximum Impact
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Your Partnership Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From application to ROI in as little as 30 days
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto space-y-12">
            {/* Timeline for Sponsors */}
            <Card className="border-2 border-cyan-300 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6">
                <CardTitle className="text-2xl flex items-center gap-3 text-white">
                  <Rocket className="w-7 h-7" />
                  For Sponsors: Your Fast Track to Success
                </CardTitle>
              </div>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-4 gap-6">
                  {[
                    { 
                      step: '1', 
                      title: 'Apply in 5 Minutes',
                      desc: 'Submit your quick application with your brand info and product lineup',
                      time: 'Day 1'
                    },
                    { 
                      step: '2', 
                      title: 'Get Approved Fast',
                      desc: 'Our team reviews and approves qualified partners within 48 hours',
                      time: 'Day 2-3'
                    },
                    { 
                      step: '3', 
                      title: 'Launch Your Store',
                      desc: 'Upload products, set rewards, and go live in the marketplace',
                      time: 'Day 4-7'
                    },
                    { 
                      step: '4', 
                      title: 'Watch Growth Soar',
                      desc: 'Track real-time analytics as your brand reaches thousands daily',
                      time: 'Day 7+'
                    }
                  ].map((item) => (
                    <div key={item.step} className="relative">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-2xl shadow-lg">
                          {item.step}
                        </div>
                        <Badge className="bg-cyan-100 text-cyan-700">{item.time}</Badge>
                        <h3 className="font-bold text-lg">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Timeline for Users */}
            <Card className="border-2 border-blue-300 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
                <CardTitle className="text-2xl flex items-center gap-3 text-white">
                  <Trophy className="w-7 h-7" />
                  For Users: Earn Rewards, Discover Quality
                </CardTitle>
              </div>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-4 gap-6">
                  {[
                    { 
                      step: '1', 
                      title: 'Train & Excel',
                      desc: 'Complete training sessions, improve skills, and hit personal goals'
                    },
                    { 
                      step: '2', 
                      title: 'Unlock Achievements',
                      desc: 'Earn badges, medals, and reward points for every milestone reached'
                    },
                    { 
                      step: '3', 
                      title: 'Explore Premium Products',
                      desc: 'Browse curated sponsor products from trusted pickleball brands'
                    },
                    { 
                      step: '4', 
                      title: 'Redeem & Enjoy',
                      desc: 'Use your earned points to claim exclusive products and discounts'
                    }
                  ].map((item) => (
                    <div key={item.step} className="relative">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-2xl shadow-lg">
                          {item.step}
                        </div>
                        <h3 className="font-bold text-lg">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Tiers - Enhanced */}
      <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-teal-500/20 text-teal-300 border-teal-500/50">
              Flexible Investment Options
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Choose Your{" "}
              <span className="bg-gradient-to-r from-teal-300 to-emerald-300 bg-clip-text text-transparent">
                Partnership Tier
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Every tier delivers measurable ROI—scale up as your success grows
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-12">
            {tiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={tier.highlighted ? 'transform scale-105 z-10' : ''}
              >
                <Card className={`h-full relative ${
                  tier.highlighted 
                    ? 'border-3 border-teal-500 shadow-2xl shadow-teal-500/50 bg-slate-800' 
                    : `border-2 ${tier.borderColor} bg-slate-800/50`
                }`}>
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-6 py-2 text-base font-bold shadow-lg">
                        ⭐ MOST POPULAR
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <div className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-br ${tier.color} rounded-2xl flex items-center justify-center shadow-xl`}>
                      <tier.icon className="w-10 h-10 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-white mb-2">{tier.name}</CardTitle>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-white">{tier.price}</span>
                      <span className="text-slate-400">{tier.period}</span>
                    </div>
                    <div className="mt-3 space-y-1">
                      <p className="text-sm text-slate-300">{tier.impressions} monthly impressions</p>
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/50">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {tier.roi} ROI
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-3 mb-6">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-slate-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={handleApplyClick}
                      className={`w-full ${
                        tier.highlighted
                          ? 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600'
                          : 'bg-slate-700 hover:bg-slate-600'
                      } text-white py-6`}
                    >
                      Apply for {tier.name}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-slate-300"
          >
            <p className="text-lg">
              Not sure which tier is right for you?{" "}
              <a 
                href="mailto:partnerships@mindfulchampion.com" 
                className="text-teal-400 hover:text-teal-300 underline font-semibold"
              >
                Schedule a consultation call
              </a>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section - Enhanced */}
      <section className="py-24 bg-gradient-to-br from-cyan-600 via-teal-600 to-emerald-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <Sparkles className="w-16 h-16 mx-auto mb-6 text-yellow-300" />
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Ready to Dominate the Pickleball Market?
            </h2>
            <p className="text-2xl mb-10 text-cyan-50 leading-relaxed">
              Join 20+ leading brands already crushing their marketing goals with Mindful Champion. 
              Limited partnership slots available for 2025.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Button
                size="lg"
                onClick={handleApplyClick}
                className="bg-white text-cyan-700 hover:bg-cyan-50 text-xl px-12 py-8 shadow-2xl transform hover:scale-105 transition-all"
              >
                <Rocket className="mr-2 h-6 w-6" />
                Apply Now - Get Priority Review
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
              <Button
                size="lg"
                onClick={() => window.location.href = 'mailto:partnerships@mindfulchampion.com'}
                className="border-3 border-white bg-transparent text-white hover:bg-white/20 hover:text-white text-xl px-12 py-8"
              >
                <Mail className="mr-2 h-6 w-6" />
                Contact Partnerships Team
              </Button>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 inline-block">
              <p className="text-cyan-100 text-lg mb-2">
                <strong className="text-white">Questions? We're here to help!</strong>
              </p>
              <p className="text-cyan-50 text-base">
                Email:{" "}
                <a 
                  href="mailto:partnerships@mindfulchampion.com" 
                  className="text-yellow-300 hover:text-yellow-200 underline font-bold"
                >
                  partnerships@mindfulchampion.com
                </a>
              </p>
              <p className="text-cyan-50 text-sm mt-3">
                Average response time: Under 4 hours
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
