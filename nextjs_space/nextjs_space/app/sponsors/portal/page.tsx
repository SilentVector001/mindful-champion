'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  BarChart3,
  Package,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  MousePointer,
  ShoppingCart,
  Plus,
  Settings,
  Award,
  AlertCircle,
  Loader2
} from 'lucide-react';
import SponsorOffersTab from '@/components/sponsors/SponsorOffersTab';
import SponsorAnalyticsTab from '@/components/sponsors/SponsorAnalyticsTab';
import SponsorProfileTab from '@/components/sponsors/SponsorProfileTab';

export default function SponsorPortalPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchProfile();
      fetchAnalytics();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/sponsors/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.sponsorProfile);
        
        if (!data.sponsorProfile) {
          toast.error('No sponsor profile found. Please contact support.');
        } else if (!data.sponsorProfile.isApproved) {
          toast.info('Your sponsor profile is pending approval.');
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/sponsors/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <CardTitle className="text-center">No Sponsor Profile Found</CardTitle>
            <CardDescription className="text-center">
              You don't have a sponsor profile yet. Please apply to become a sponsor.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push('/sponsors/apply')}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-700"
            >
              Apply to Become a Sponsor
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile.isApproved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <AlertCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <CardTitle className="text-center">Application Pending</CardTitle>
            <CardDescription className="text-center">
              Your sponsor application is currently under review. We'll notify you once it's approved!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-teal-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Company:</strong> {profile.companyName}
              </p>
              <p className="text-sm text-gray-700 mt-2">
                <strong>Tier:</strong> {profile.partnershipTier}
              </p>
            </div>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="w-full"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tierColors = {
    BRONZE: 'from-orange-400 to-orange-600',
    SILVER: 'from-gray-400 to-gray-600',
    GOLD: 'from-yellow-400 to-yellow-600',
    PLATINUM: 'from-purple-400 to-purple-600'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
                  Sponsor Portal
                </h1>
                <p className="text-gray-600">
                  Welcome back, {profile.companyName}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge
                  className={`bg-gradient-to-r ${
                    tierColors[profile.partnershipTier as keyof typeof tierColors]
                  } text-white px-4 py-2 text-sm`}
                >
                  <Award className="w-4 h-4 mr-2" />
                  {profile.partnershipTier} TIER
                </Badge>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Stats */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Total Offers"
              value={analytics.overview.totalOffers}
              subtitle={`${analytics.overview.activeOffers} active`}
              icon={Package}
              gradient="from-blue-400 to-blue-600"
            />
            <StatCard
              title="Total Views"
              value={analytics.overview.totalViews.toLocaleString()}
              subtitle="Impressions"
              icon={Eye}
              gradient="from-green-400 to-green-600"
            />
            <StatCard
              title="Redemptions"
              value={analytics.overview.totalRedemptions}
              subtitle={`${analytics.overview.avgConversionRate}% conversion`}
              icon={ShoppingCart}
              gradient="from-purple-400 to-purple-600"
            />
            <StatCard
              title="Total Value"
              value={`$${analytics.overview.totalValue.toLocaleString()}`}
              subtitle="Revenue generated"
              icon={DollarSign}
              gradient="from-yellow-400 to-yellow-600"
            />
          </div>
        )}

        {/* Tabs */}
        <Card className="border-2 border-teal-200">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardHeader className="border-b">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="offers">Offers</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="p-6">
              <TabsContent value="overview" className="space-y-6 mt-0">
                <OverviewTab profile={profile} analytics={analytics} />
              </TabsContent>

              <TabsContent value="offers" className="mt-0">
                <SponsorOffersTab profile={profile} onUpdate={fetchAnalytics} />
              </TabsContent>

              <TabsContent value="analytics" className="mt-0">
                <SponsorAnalyticsTab analytics={analytics} />
              </TabsContent>

              <TabsContent value="profile" className="mt-0">
                <SponsorProfileTab profile={profile} onUpdate={fetchProfile} />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  gradient: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function OverviewTab({ profile, analytics }: { profile: any; analytics: any }) {
  return (
    <div className="space-y-6">
      {/* Tier Benefits */}
      <Card className="bg-gradient-to-r from-teal-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-teal-600" />
            Your Tier Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-teal-600" />
              <div>
                <p className="font-semibold">Active Offers</p>
                <p className="text-sm text-gray-600">
                  {analytics?.overview?.activeOffers || 0} / {profile.maxActiveOffers}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-teal-600" />
              <div>
                <p className="font-semibold">Analytics Access</p>
                <p className="text-sm text-gray-600">
                  {profile.analyticsAccess ? 'Full Access' : 'Basic'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              <div>
                <p className="font-semibold">Featured Offers</p>
                <p className="text-sm text-gray-600">
                  {profile.canFeatureOffers ? 'Enabled' : 'Not Available'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-teal-600" />
              <div>
                <p className="font-semibold">Custom Branding</p>
                <p className="text-sm text-gray-600">
                  {profile.customBranding ? 'Enabled' : 'Not Available'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with these common tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button className="bg-gradient-to-r from-teal-500 to-teal-700 h-auto py-6">
            <Plus className="w-5 h-5 mr-2" />
            Create New Offer
          </Button>
          <Button variant="outline" className="h-auto py-6">
            <BarChart3 className="w-5 h-5 mr-2" />
            View Analytics
          </Button>
          <Button variant="outline" className="h-auto py-6">
            <Settings className="w-5 h-5 mr-2" />
            Edit Profile
          </Button>
        </CardContent>
      </Card>

      {/* Recent Performance */}
      {analytics && analytics.offers?.topPerforming?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Offers</CardTitle>
            <CardDescription>Your best offers this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.offers.topPerforming.slice(0, 5).map((offer: any, index: number) => (
                <div
                  key={offer.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{offer.title}</p>
                      <p className="text-sm text-gray-600">{offer.redemptions} redemptions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">${offer.revenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">{offer.conversionRate}% conversion</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
