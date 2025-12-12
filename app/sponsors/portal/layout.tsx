'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  Settings,
  Award,
  Target,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const tierColors = {
  BRONZE: 'from-orange-400 to-orange-600',
  SILVER: 'from-gray-400 to-gray-600',
  GOLD: 'from-yellow-400 to-yellow-600',
  PLATINUM: 'from-purple-400 to-purple-600'
};

const tierFeatures = {
  BRONZE: {
    displayName: 'FREE',
    maxProducts: 0,
    analytics: 'Basic',
    description: 'Get started with basic features'
  },
  SILVER: {
    displayName: 'PREMIUM',
    maxProducts: 5,
    analytics: 'Standard',
    description: 'Perfect for growing businesses'
  },
  GOLD: {
    displayName: 'PRO',
    maxProducts: Infinity,
    analytics: 'Advanced',
    description: 'Unlimited potential'
  },
  PLATINUM: {
    displayName: 'PRO PLUS',
    maxProducts: Infinity,
    analytics: 'Premium',
    description: 'Everything + priority support'
  }
};

export default function SponsorPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/sponsors/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.sponsorProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  const navItems = [
    { href: '/sponsors/portal', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/sponsors/portal/products', label: 'Products', icon: Package },
    { href: '/sponsors/portal/point-levels', label: 'Point Levels', icon: Target },
    { href: '/sponsors/portal/analytics', label: 'Analytics', icon: TrendingUp },
    { href: '/sponsors/portal/settings', label: 'Settings', icon: Settings },
  ];

  const currentTier = profile?.partnershipTier || 'BRONZE';
  const tierInfo = tierFeatures[currentTier as keyof typeof tierFeatures];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-purple-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-white border-r border-gray-200 p-6">
          {/* Sponsor Header */}
          <div className="mb-8">
            <Link href="/sponsors/portal">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Sponsor Portal
              </h2>
            </Link>
            {profile && (
              <>
                <p className="text-sm text-gray-600 mb-3">{profile.companyName}</p>
                <Badge
                  className={`bg-gradient-to-r ${tierColors[currentTier as keyof typeof tierColors]} text-white text-xs px-3 py-1`}
                >
                  <Award className="w-3 h-3 mr-1" />
                  {tierInfo.displayName}
                </Badge>
              </>
            )}
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* Tier Info Card */}
          {profile && (
            <div className="mt-8 p-4 bg-gradient-to-br from-teal-50 to-purple-50 rounded-lg border border-teal-200">
              <h3 className="font-bold text-sm mb-2">{tierInfo.displayName} Features</h3>
              <div className="space-y-2 text-xs text-gray-700">
                <div className="flex justify-between">
                  <span>Products:</span>
                  <span className="font-semibold">
                    {tierInfo.maxProducts === Infinity ? 'Unlimited' : tierInfo.maxProducts}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Analytics:</span>
                  <span className="font-semibold">{tierInfo.analytics}</span>
                </div>
              </div>
              {currentTier === 'BRONZE' && (
                <Button
                  size="sm"
                  className="w-full mt-4 bg-gradient-to-r from-teal-500 to-purple-500 text-white"
                  onClick={() => router.push('/sponsors/portal/settings?tab=billing')}
                >
                  Upgrade Now
                </Button>
              )}
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
