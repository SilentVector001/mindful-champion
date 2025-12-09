'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Award, 
  TrendingUp, 
  Gift, 
  Sparkles, 
  Lock, 
  Check, 
  ChevronRight,
  Star,
  Crown,
  Zap,
  Trophy,
  ShoppingBag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import TierUnlockCelebration from '@/app/components/tier-unlock-celebration';
import { toast } from 'sonner';
import Image from 'next/image';

export default function RewardsCenter() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tierData, setTierData] = useState<any>(null);
  const [sponsorOffers, setSponsorOffers] = useState<any[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    } else if (status === 'authenticated') {
      loadData();
      checkForNewUnlocks();
    }
  }, [status, router]);

  const loadData = async () => {
    try {
      // Load tier data
      const tierRes = await fetch('/api/rewards/current-tier');
      if (tierRes?.ok) {
        const data = await tierRes.json();
        setTierData(data);
      }

      // Load sponsor offers
      const offersRes = await fetch('/api/sponsors/offers');
      if (offersRes?.ok) {
        const data = await offersRes.json();
        setSponsorOffers(data?.offers ?? []);
      }
    } catch (error) {
      console.error('Error loading rewards data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkForNewUnlocks = async () => {
    try {
      const res = await fetch('/api/rewards/check-unlock', { method: 'POST' });
      if (res?.ok) {
        const data = await res.json();
        if (data?.hasNewUnlocks && data?.unlocks?.[0]) {
          const unlock = data.unlocks[0];
          const tier = unlock?.tier;
          
          setCelebrationData({
            tierDisplayName: tier?.displayName ?? '',
            tierIcon: tier?.icon ?? '🏆',
            tierColor: tier?.colorPrimary ?? '#FFD700',
            pointsAtUnlock: unlock?.pointsAtUnlock ?? 0,
            benefits: (tier?.benefits as string[]) ?? [],
            nextTierName: tier?.nextTierName,
            nextTierPoints: tier?.nextTierPoints
          });
          setShowCelebration(true);
          
          // Mark as shown
          await fetch('/api/rewards/celebration-shown', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ unlockId: unlock?.id })
          });
        }
      }
    } catch (error) {
      console.error('Error checking unlocks:', error);
    }
  };

  const handleCloseCelebration = () => {
    setShowCelebration(false);
    loadData(); // Refresh data
    router.push('/marketplace'); // Redirect to marketplace
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-cyan-50">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Award className="w-12 h-12 text-teal-500 mx-auto" />
          </motion.div>
          <p className="mt-4 text-gray-600">Loading rewards...</p>
        </div>
      </div>
    );
  }

  const currentTier = tierData?.currentTier;
  const nextTier = tierData?.nextTier;
  const allTiers = tierData?.allTiers ?? [];
  const userPoints = tierData?.userPoints ?? 0;
  const progressPercentage = tierData?.progressPercentage ?? 0;
  const pointsToNext = tierData?.pointsToNext ?? 0;

  // Filter offers by tier
  const getOffersForTier = (tierName: string) => {
    return sponsorOffers?.filter?.(offer => {
      // This would need to be updated based on how you link offers to tiers
      // For now, return all offers
      return true;
    })?.slice?.(0, 3) ?? [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      {/* Celebration Modal */}
      {showCelebration && celebrationData && (
        <TierUnlockCelebration
          isOpen={showCelebration}
          onClose={handleCloseCelebration}
          tierData={celebrationData}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-10 h-10 text-teal-500" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Rewards Center
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Earn points, unlock tiers, and redeem exclusive rewards from our partner sponsors
          </p>
        </motion.div>

        {/* Prominent Points Display at Top */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="border-0 shadow-xl overflow-hidden bg-gradient-to-r from-teal-500 to-cyan-500">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center gap-4 mb-2">
                <Sparkles className="w-10 h-10 text-white animate-pulse" />
                <div>
                  <p className="text-white/90 text-sm font-medium uppercase tracking-wider mb-1">
                    Your Points Balance
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-6xl font-extrabold text-white drop-shadow-lg">
                      {userPoints?.toLocaleString?.() ?? 0}
                    </span>
                    <Star className="w-8 h-8 text-yellow-300 animate-pulse" />
                  </div>
                </div>
              </div>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => router.push('/progress/achievements')}
                className="mt-4 bg-white hover:bg-gray-100 text-teal-600 font-semibold shadow-lg"
              >
                <Award className="w-5 h-5 mr-2" />
                Earn More Points
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Current Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Card className="border-0 shadow-2xl overflow-hidden">
            <div 
              className="h-2"
              style={{
                background: `linear-gradient(to right, ${currentTier?.colorPrimary ?? '#14b8a6'}, ${currentTier?.colorSecondary ?? '#06b6d4'})`
              }}
            />
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-8">
                {/* Current Tier */}
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Current Tier</p>
                  <div className="text-6xl mb-3">{currentTier?.icon ?? '🏆'}</div>
                  <h3 className="text-2xl font-bold" style={{ color: currentTier?.colorPrimary ?? '#14b8a6' }}>
                    {currentTier?.displayName ?? 'Getting Started'}
                  </h3>
                  <p className="text-gray-600 mt-2">{currentTier?.description ?? 'Start your journey'}</p>
                </div>

                {/* Points */}
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Your Points</p>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Sparkles className="w-8 h-8 text-teal-500" />
                    <span className="text-5xl font-bold text-gray-900">
                      {userPoints?.toLocaleString?.() ?? 0}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/progress/achievements')}
                    className="mt-2"
                  >
                    <Award className="w-4 h-4 mr-2" />
                    Earn More Points
                  </Button>
                </div>

                {/* Next Tier */}
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">
                    {nextTier ? 'Next Tier' : 'Max Tier Reached!'}
                  </p>
                  {nextTier ? (
                    <>
                      <div className="text-6xl mb-3">{nextTier?.icon ?? '🏆'}</div>
                      <h3 className="text-2xl font-bold" style={{ color: nextTier?.colorPrimary ?? '#F59E0B' }}>
                        {nextTier?.displayName ?? ''}
                      </h3>
                      <div className="mt-4">
                        <Progress value={progressPercentage} className="h-3 mb-2" />
                        <p className="text-sm text-gray-600">
                          <strong>{pointsToNext?.toLocaleString?.() ?? 0}</strong> points to go
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-3" />
                      <p className="text-lg font-semibold text-gray-700">You've reached the highest tier!</p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 3 Tier Cards */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Star className="w-8 h-8 text-teal-500" />
            Reward Tiers
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {allTiers?.map?.((tier: any, index: number) => {
              const isUnlocked = (userPoints ?? 0) >= (tier?.minPoints ?? 0);
              const benefits = (tier?.benefits as string[]) ?? [];
              
              return (
                <motion.div
                  key={tier?.id ?? index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Card 
                    className={`border-2 transition-all hover:shadow-2xl ${
                      isUnlocked ? 'border-teal-500' : 'border-gray-200'
                    }`}
                    style={{
                      borderColor: isUnlocked ? tier?.colorPrimary : undefined
                    }}
                  >
                    <CardHeader 
                      className="text-center pb-4"
                      style={{
                        background: isUnlocked 
                          ? `linear-gradient(135deg, ${tier?.colorPrimary ?? '#14b8a6'}20, ${tier?.colorSecondary ?? '#06b6d4'}20)`
                          : '#f9fafb'
                      }}
                    >
                      <div className="relative">
                        <div className="text-6xl mb-3">{tier?.icon ?? '🏆'}</div>
                        {isUnlocked && (
                          <Badge 
                            className="absolute top-0 right-0"
                            style={{ 
                              backgroundColor: tier?.colorPrimary ?? '#14b8a6',
                              color: '#ffffff'
                            }}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Unlocked
                          </Badge>
                        )}
                      </div>
                      <CardTitle 
                        className="text-2xl font-bold"
                        style={{ color: tier?.colorPrimary ?? '#14b8a6' }}
                      >
                        {tier?.displayName ?? ''}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-2">
                        {tier?.minPoints?.toLocaleString?.() ?? 0}+ points
                      </p>
                    </CardHeader>
                    <CardContent className="p-6">
                      <p className="text-gray-700 mb-4 text-sm">{tier?.description ?? ''}</p>
                      <div className="space-y-2">
                        {benefits?.slice?.(0, 4)?.map?.((benefit: string, i: number) => (
                          <div 
                            key={i} 
                            className="flex items-start gap-2 text-sm"
                          >
                            {isUnlocked ? (
                              <Check 
                                className="w-4 h-4 mt-0.5 flex-shrink-0" 
                                style={{ color: tier?.colorPrimary ?? '#14b8a6' }}
                              />
                            ) : (
                              <Lock className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                            )}
                            <span className={isUnlocked ? 'text-gray-700' : 'text-gray-400'}>
                              {benefit}
                            </span>
                          </div>
                        )) ?? null}
                      </div>
                      {isUnlocked && (
                        <Button
                          className="w-full mt-4"
                          style={{
                            backgroundColor: tier?.colorPrimary ?? '#14b8a6',
                            color: '#ffffff'
                          }}
                          onClick={() => router.push('/marketplace')}
                        >
                          <ShoppingBag className="w-4 h-4 mr-2" />
                          Browse Rewards
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            }) ?? null}
          </div>
        </div>

        {/* Featured Offers */}
        {sponsorOffers?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Gift className="w-8 h-8 text-teal-500" />
                Featured Rewards
              </h2>
              <Button
                variant="outline"
                onClick={() => router.push('/marketplace')}
              >
                View All
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {sponsorOffers?.slice?.(0, 3)?.map?.((offer: any, index: number) => (
                <motion.div
                  key={offer?.id ?? index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <Card className="hover:shadow-xl transition-all cursor-pointer group">
                    {offer?.imageUrl && (
                      <div className="relative aspect-video bg-gray-100 overflow-hidden">
                        <Image
                          src={offer.imageUrl}
                          alt={offer?.title ?? ''}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-2 flex-1">
                          {offer?.title ?? ''}
                        </h3>
                        {offer?.isFeatured && (
                          <Badge className="bg-yellow-500 text-white ml-2 flex-shrink-0">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {offer?.shortDescription ?? offer?.description ?? ''}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="w-5 h-5 text-teal-500" />
                          <span className="font-bold text-teal-600 text-lg">
                            {offer?.pointsCost?.toLocaleString?.() ?? 0} pts
                          </span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => router.push(`/marketplace`)}
                        >
                          View
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )) ?? null}
            </div>
          </motion.div>
        )}

        {/* How to Earn Points */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0 shadow-xl">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <TrendingUp className="w-8 h-8" />
                How to Earn Points
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-start gap-4">
                  <Award className="w-8 h-8 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-lg mb-2">Complete Achievements</h3>
                    <p className="text-teal-50 text-sm">Earn points by completing training programs, tracking practice, and hitting milestones.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Zap className="w-8 h-8 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-lg mb-2">Daily Activities</h3>
                    <p className="text-teal-50 text-sm">Log practice sessions, watch training videos, and engage with Coach Kai for daily points.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Trophy className="w-8 h-8 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-lg mb-2">Tournament Participation</h3>
                    <p className="text-teal-50 text-sm">Compete in tournaments and track your match results to earn bonus points.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
