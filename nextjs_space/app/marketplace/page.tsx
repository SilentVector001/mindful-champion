// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  ShoppingCart,
  Award,
  TrendingUp,
  Package,
  Search,
  Filter,
  Tag,
  MapPin,
  Calendar,
  DollarSign,
  Sparkles,
  Star,
  Check,
  X,
  Loader2,
  Gift,
  Crown,
  Zap,
  Trophy,
  Target,
  ArrowRight,
  Clock,
  Lock,
  ChevronRight,
  Video,
  Dumbbell,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import MainNavigation from '@/components/navigation/main-navigation';
import Link from 'next/link';

// Reward tiers configuration
const REWARD_TIERS = [
  {
    name: 'Bronze',
    icon: '🥉',
    minPoints: 0,
    maxPoints: 499,
    color: 'from-amber-600 to-amber-800',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    textColor: 'text-amber-800',
    benefits: ['Access to basic rewards', 'Monthly newsletter perks', 'Community badge']
  },
  {
    name: 'Silver',
    icon: '🥈',
    minPoints: 500,
    maxPoints: 1499,
    color: 'from-slate-400 to-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-300',
    textColor: 'text-slate-700',
    benefits: ['All Bronze benefits', '10% bonus on redemptions', 'Early access to new offers', 'Priority support']
  },
  {
    name: 'Gold',
    icon: '🥇',
    minPoints: 1500,
    maxPoints: 4999,
    color: 'from-yellow-400 to-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-400',
    textColor: 'text-yellow-800',
    benefits: ['All Silver benefits', '20% bonus on redemptions', 'Exclusive partner deals', 'Free shipping on physical rewards']
  },
  {
    name: 'Platinum',
    icon: '💎',
    minPoints: 5000,
    maxPoints: Infinity,
    color: 'from-purple-500 to-indigo-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-400',
    textColor: 'text-purple-800',
    benefits: ['All Gold benefits', '30% bonus on redemptions', 'VIP tournament access', 'Personal account manager', 'Exclusive merchandise']
  }
];

// How to earn points data
const EARN_METHODS = [
  { icon: Video, title: 'Upload Videos', points: '10-50 pts', description: 'Get AI analysis on your gameplay', color: 'text-blue-500', bg: 'bg-blue-50' },
  { icon: Target, title: 'Complete Goals', points: '25-100 pts', description: 'Set and achieve training targets', color: 'text-green-500', bg: 'bg-green-50' },
  { icon: Trophy, title: 'Win Matches', points: '15-75 pts', description: 'Log victories in your match history', color: 'text-orange-500', bg: 'bg-orange-50' },
  { icon: Dumbbell, title: 'Training Programs', points: '50-200 pts', description: 'Complete daily training sessions', color: 'text-purple-500', bg: 'bg-purple-50' },
  { icon: MessageSquare, title: 'Coach Kai Sessions', points: '5-20 pts', description: 'Learn from your AI coach', color: 'text-pink-500', bg: 'bg-pink-50' },
  { icon: Star, title: 'Daily Streaks', points: '10-50 pts', description: 'Maintain consecutive training days', color: 'text-amber-500', bg: 'bg-amber-50' },
];

// Coming soon rewards (placeholder content)
const COMING_SOON_REWARDS = [
  { 
    title: 'Pro Paddle Package', 
    brand: 'Selkirk',
    points: 2500, 
    value: '$149.99',
    image: '🏓',
    category: 'Equipment',
    launchDate: 'January 2025'
  },
  { 
    title: '1-on-1 Pro Coaching Session', 
    brand: 'Mindful Champion',
    points: 1500, 
    value: '$99.00',
    image: '🎯',
    category: 'Training',
    launchDate: 'January 2025'
  },
  { 
    title: 'Premium Apparel Set', 
    brand: 'Joola',
    points: 1000, 
    value: '$79.99',
    image: '👕',
    category: 'Apparel',
    launchDate: 'February 2025'
  },
  { 
    title: 'Tournament Entry Fee', 
    brand: 'APP Tour',
    points: 3000, 
    value: '$200.00',
    image: '🏆',
    category: 'Events',
    launchDate: 'February 2025'
  },
  { 
    title: 'Training Ball Set (100ct)', 
    brand: 'Franklin',
    points: 400, 
    value: '$29.99',
    image: '🎾',
    category: 'Equipment',
    launchDate: 'January 2025'
  },
  { 
    title: 'Mindful Champion Pro Membership', 
    brand: 'Mindful Champion',
    points: 800, 
    value: '$49.99/mo',
    image: '⭐',
    category: 'Subscription',
    launchDate: 'January 2025'
  },
];

export default function MarketplacePage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [offers, setOffers] = useState<any[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [pointsFilter, setPointsFilter] = useState('all');
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [showRedeemDialog, setShowRedeemDialog] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchOffers();
      fetchUserPoints();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status, categoryFilter]);

  const fetchOffers = async () => {
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.append('category', categoryFilter);

      const response = await fetch(`/api/sponsors/offers?${params}`);
      if (response.ok) {
        const data = await response.json();
        setOffers(data.offers || []);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPoints = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUserPoints(data.user?.rewardPoints || 0);
      }
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  };

  // Get current tier
  const getCurrentTier = () => {
    return REWARD_TIERS.find(tier => userPoints >= tier.minPoints && userPoints <= tier.maxPoints) || REWARD_TIERS[0];
  };

  // Get next tier
  const getNextTier = () => {
    const currentIndex = REWARD_TIERS.findIndex(tier => userPoints >= tier.minPoints && userPoints <= tier.maxPoints);
    return currentIndex < REWARD_TIERS.length - 1 ? REWARD_TIERS[currentIndex + 1] : null;
  };

  // Calculate progress to next tier
  const getProgressToNextTier = () => {
    const currentTier = getCurrentTier();
    const nextTier = getNextTier();
    if (!nextTier) return 100;
    const pointsInTier = userPoints - currentTier.minPoints;
    const tierRange = nextTier.minPoints - currentTier.minPoints;
    return Math.min(Math.round((pointsInTier / tierRange) * 100), 100);
  };

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();
  const progressToNext = getProgressToNextTier();

  const filteredOffers = offers
    .filter(offer => {
      const matchesSearch = offer.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPoints = pointsFilter === 'all' || 
        (pointsFilter === 'affordable' && offer.pointsCost <= userPoints) ||
        (pointsFilter === 'saving' && offer.pointsCost > userPoints);
      return matchesSearch && matchesPoints;
    })
    .sort((a, b) => {
      const aAffordable = a.pointsCost <= userPoints ? 1 : 0;
      const bAffordable = b.pointsCost <= userPoints ? 1 : 0;
      if (aAffordable !== bAffordable) return bAffordable - aAffordable;
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      return a.pointsCost - b.pointsCost;
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-purple-50">
      <MainNavigation user={session?.user} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-teal-600 via-purple-600 to-pink-600 text-white py-16 px-4 overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              initial={{ 
                x: Math.random() * 100 + '%', 
                y: Math.random() * 100 + '%',
                scale: Math.random() * 0.5 + 0.5
              }}
              animate={{ 
                y: [null, '-20%'],
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{ 
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          ))}
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4 flex items-center justify-center gap-4">
              <Gift className="w-12 h-12 md:w-16 md:h-16" />
              Rewards Marketplace
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Redeem your achievement points for exclusive offers from our partners
            </p>
            
            {/* Points Display */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-4 bg-white/20 backdrop-blur-sm px-8 py-4 rounded-full"
            >
              <Award className="w-8 h-8" />
              <div className="text-left">
                <p className="text-sm opacity-75">Your Points</p>
                <p className="text-3xl font-bold">{userPoints.toLocaleString()}</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Current Tier & Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="border-2 border-teal-200 shadow-xl overflow-hidden">
            <div className={`h-2 bg-gradient-to-r ${currentTier.color}`} />
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6 items-center">
                {/* Current Tier */}
                <div className="text-center md:text-left">
                  <p className="text-sm text-gray-500 mb-1">Your Current Tier</p>
                  <div className="flex items-center gap-3 justify-center md:justify-start">
                    <span className="text-4xl">{currentTier.icon}</span>
                    <div>
                      <h3 className={`text-2xl font-bold ${currentTier.textColor}`}>{currentTier.name}</h3>
                      <p className="text-sm text-gray-600">{userPoints.toLocaleString()} points</p>
                    </div>
                  </div>
                </div>

                {/* Progress to Next Tier */}
                <div className="text-center">
                  {nextTier ? (
                    <>
                      <p className="text-sm text-gray-500 mb-2">Progress to {nextTier.name}</p>
                      <div className="relative">
                        <Progress value={progressToNext} className="h-4" />
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-700">
                          {progressToNext}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-semibold text-teal-600">{(nextTier.minPoints - userPoints).toLocaleString()}</span> points to go
                      </p>
                    </>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Crown className="w-6 h-6 text-purple-500" />
                      <span className="font-semibold text-purple-700">Max Tier Reached!</span>
                    </div>
                  )}
                </div>

                {/* Earn More CTA */}
                <div className="text-center md:text-right">
                  <Button
                    onClick={() => router.push('/progress/achievements')}
                    className="bg-gradient-to-r from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Earn More Points
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Reward Tiers Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <Crown className="w-8 h-8 text-purple-500" />
            <h2 className="text-2xl font-bold text-gray-900">Reward Tiers</h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4">
            {REWARD_TIERS.map((tier, index) => {
              const isCurrentTier = tier.name === currentTier.name;
              const isUnlocked = userPoints >= tier.minPoints;
              
              return (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className={`h-full relative overflow-hidden ${
                    isCurrentTier ? `border-2 ${tier.borderColor} shadow-lg` : 'border border-gray-200'
                  } ${!isUnlocked ? 'opacity-60' : ''}`}>
                    {isCurrentTier && (
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tier.color}`} />
                    )}
                    <CardHeader className={`pb-3 ${tier.bgColor}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-4xl">{tier.icon}</span>
                        {isCurrentTier && (
                          <Badge className="bg-gradient-to-r from-teal-500 to-teal-700 text-white">
                            Current
                          </Badge>
                        )}
                        {!isUnlocked && (
                          <Lock className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <CardTitle className={`text-xl ${tier.textColor}`}>{tier.name}</CardTitle>
                      <CardDescription className="text-gray-600">
                        {tier.minPoints.toLocaleString()}+ points
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <ul className="space-y-2">
                        {tier.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isUnlocked ? 'text-green-500' : 'text-gray-300'}`} />
                            <span className={isUnlocked ? 'text-gray-700' : 'text-gray-400'}>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* How to Earn Points Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <Card className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0 shadow-xl overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-8 h-8" />
                <h2 className="text-2xl font-bold">How to Earn Points</h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                {EARN_METHODS.map((method, index) => (
                  <motion.div
                    key={method.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ scale: 1.03 }}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/20 transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg ${method.bg} flex items-center justify-center flex-shrink-0`}>
                        <method.icon className={`w-5 h-5 ${method.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{method.title}</h3>
                        <p className="text-xs text-white/70 mb-1">{method.description}</p>
                        <Badge className="bg-white/20 text-white text-xs">
                          {method.points}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <Button
                  onClick={() => router.push('/dashboard')}
                  variant="secondary"
                  className="bg-white text-teal-600 hover:bg-gray-100"
                >
                  Start Earning Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Coming Soon Rewards Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-500" />
              <h2 className="text-2xl font-bold text-gray-900">Coming Soon</h2>
              <Badge className="bg-purple-100 text-purple-700">Preview</Badge>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {COMING_SOON_REWARDS.map((reward, index) => (
              <motion.div
                key={reward.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full border-2 border-dashed border-gray-300 hover:border-purple-300 transition-all relative overflow-hidden group">
                  {/* Coming Soon Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-transparent to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                    <Badge className="bg-white text-purple-700">
                      <Clock className="w-3 h-3 mr-1" />
                      {reward.launchDate}
                    </Badge>
                  </div>
                  
                  <CardHeader className="text-center pb-2">
                    <div className="text-5xl mb-2">{reward.image}</div>
                    <Badge variant="outline" className="mb-2 mx-auto">{reward.category}</Badge>
                    <CardTitle className="text-lg">{reward.title}</CardTitle>
                    <CardDescription className="text-sm">{reward.brand}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-purple-500" />
                      <span className="font-bold text-purple-600 text-lg">{reward.points.toLocaleString()} pts</span>
                    </div>
                    <p className="text-sm text-gray-500">Value: {reward.value}</p>
                    <Button
                      disabled
                      className="w-full mt-4 bg-gray-200 text-gray-500 cursor-not-allowed"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Coming Soon
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Available Offers Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <Gift className="w-8 h-8 text-teal-500" />
            <h2 className="text-2xl font-bold text-gray-900">Available Rewards</h2>
          </div>

          {/* Filters */}
          <Card className="mb-6 border-2 border-teal-200">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-5">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Search offers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="md:col-span-4">
                  <Select value={pointsFilter} onValueChange={setPointsFilter}>
                    <SelectTrigger className="border-2 border-teal-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Offers</SelectItem>
                      <SelectItem value="affordable">I Can Afford</SelectItem>
                      <SelectItem value="saving">Saving For</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-3">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Equipment">Equipment</SelectItem>
                      <SelectItem value="Apparel">Apparel</SelectItem>
                      <SelectItem value="Coaching">Coaching</SelectItem>
                      <SelectItem value="Events">Events</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Offers Grid or Empty State */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-teal-600" />
            </div>
          ) : filteredOffers.length === 0 ? (
            <Card className="p-12 text-center border-2 border-dashed border-gray-300">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No Offers Available Yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  We're partnering with top pickleball brands to bring you amazing rewards. 
                  Keep earning points and check back soon!
                </p>
                
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                  <Badge className="bg-teal-100 text-teal-700 px-4 py-2">Equipment Coming</Badge>
                  <Badge className="bg-purple-100 text-purple-700 px-4 py-2">Apparel Coming</Badge>
                  <Badge className="bg-orange-100 text-orange-700 px-4 py-2">Events Coming</Badge>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                  <Button
                    onClick={() => router.push('/progress/achievements')}
                    className="bg-gradient-to-r from-teal-500 to-teal-700"
                  >
                    <Award className="w-4 h-4 mr-2" />
                    Earn Points Now
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </motion.div>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOffers.map((offer, index) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  index={index}
                  userPoints={userPoints}
                  isAuthenticated={status === 'authenticated'}
                  onSelect={() => {
                    setSelectedOffer(offer);
                    setShowRedeemDialog(true);
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Redeem Dialog */}
        {selectedOffer && (
          <RedeemDialog
            open={showRedeemDialog}
            onClose={() => {
              setShowRedeemDialog(false);
              setSelectedOffer(null);
            }}
            offer={selectedOffer}
            userPoints={userPoints}
            onSuccess={() => {
              fetchUserPoints();
              setShowRedeemDialog(false);
              setSelectedOffer(null);
            }}
          />
        )}
      </div>

      {/* Not Logged In Banner */}
      {status === 'unauthenticated' && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-teal-600 to-purple-600 text-white p-4 shadow-lg z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="font-semibold mb-1">Sign in to redeem rewards</p>
              <p className="text-sm opacity-90">Join Mindful Champion to earn points and unlock exclusive offers</p>
            </div>
            <Button
              onClick={() => router.push('/auth/signin')}
              className="bg-white text-teal-600 hover:bg-gray-100"
            >
              Sign In
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function OfferCard({ offer, index, userPoints, isAuthenticated, onSelect }: any) {
  const canAfford = userPoints >= offer.pointsCost;
  const pointsNeeded = offer.pointsCost - userPoints;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      <Card className={`h-full border-2 ${
        canAfford ? 'border-green-300 hover:border-green-400' : 'border-orange-200 hover:border-orange-300'
      } transition-all shadow-lg hover:shadow-xl`}>
        <div className="relative aspect-video bg-gradient-to-r from-teal-100 to-purple-100 overflow-hidden">
          {offer.imageUrl ? (
            <Image src={offer.imageUrl} alt={offer.title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-16 h-16 text-gray-300" />
            </div>
          )}
          <div className="absolute top-3 right-3">
            <Badge className={`${
              canAfford ? 'bg-green-500' : 'bg-orange-500'
            } text-white text-lg font-bold px-3 py-1`}>
              {offer.pointsCost} pts
            </Badge>
          </div>
        </div>
        <CardHeader>
          <CardTitle className="text-lg line-clamp-2">{offer.title}</CardTitle>
          <CardDescription className="line-clamp-2">{offer.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-green-600">${offer.retailValue} Value</span>
            <Badge variant="outline">{offer.category}</Badge>
          </div>
          
          {!canAfford && (
            <div className="mb-4">
              <Progress value={(userPoints / offer.pointsCost) * 100} className="h-2 mb-1" />
              <p className="text-xs text-gray-500">{pointsNeeded.toLocaleString()} more points needed</p>
            </div>
          )}

          <Button
            onClick={onSelect}
            disabled={!canAfford || !isAuthenticated}
            className={`w-full ${
              canAfford
                ? 'bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800'
                : 'bg-gray-300'
            }`}
          >
            {canAfford ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Redeem Now
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 mr-2" />
                {pointsNeeded} pts to go
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function RedeemDialog({ open, onClose, offer, userPoints, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [needsShipping, setNeedsShipping] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '', address: '', city: '', state: '', zip: '', phone: ''
  });

  const handleRedeem = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sponsors/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId: offer.id,
          shippingAddress: needsShipping ? shippingInfo : null
        })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || 'Offer redeemed successfully!');
        onSuccess();
      } else {
        toast.error(data.error || 'Failed to redeem offer');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Confirm Redemption</DialogTitle>
          <DialogDescription>Review your redemption details</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card className="bg-gradient-to-r from-teal-50 to-purple-50">
            <CardContent className="p-4">
              <h3 className="font-bold text-lg mb-1">{offer.title}</h3>
              <div className="flex items-center gap-2">
                <Badge>{offer.pointsCost} pts</Badge>
                <span className="text-green-600 font-semibold">${offer.retailValue} Value</span>
              </div>
            </CardContent>
          </Card>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span>Current Balance:</span>
              <span className="font-bold">{userPoints.toLocaleString()} pts</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Cost:</span>
              <span className="font-bold text-red-600">-{offer.pointsCost} pts</span>
            </div>
            <div className="border-t pt-2 flex justify-between">
              <span className="font-semibold">Remaining:</span>
              <span className="font-bold text-teal-600">{(userPoints - offer.pointsCost).toLocaleString()} pts</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button
              onClick={handleRedeem}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-teal-500 to-teal-700"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
