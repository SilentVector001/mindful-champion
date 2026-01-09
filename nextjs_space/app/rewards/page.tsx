// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import MainNavigation from '@/components/navigation/main-navigation';
import {
  Trophy, Star, Crown, Medal, Shield, Gift,
  TrendingUp, Target, Flame, Video, Users,
  Calendar, Zap, ChevronRight, Sparkles, Lock,
  Award, Gem, Clock, ArrowRight, CheckCircle, Info
} from 'lucide-react';

interface Achievement {
  id: string;
  achievementId: string;
  name: string;
  description: string;
  tier: string;
  category: string;
  icon: string;
  points: number;
  rarity: string;
  unlocked?: boolean;
  unlockedAt?: string;
  progress?: { currentValue: number; targetValue: number; percentage: number };
}

interface UserStats {
  totalPoints: number;
  totalAchievements: number;
  bronzeMedals: number;
  silverMedals: number;
  goldMedals: number;
  badges: number;
  hasCrown: boolean;
  rank: string;
  currentStreak: number;
  rewardPoints: number;
}

// Enhanced tier config with vibrant, readable colors
const tierConfig = {
  BRONZE: { 
    color: 'from-orange-600 via-amber-500 to-yellow-600', 
    bg: 'bg-gradient-to-br from-orange-900/40 to-amber-900/40',
    border: 'border-orange-500/50',
    icon: '🥉', 
    textColor: 'text-orange-300',
    glow: 'shadow-orange-500/30'
  },
  SILVER: { 
    color: 'from-slate-300 via-gray-200 to-slate-400', 
    bg: 'bg-gradient-to-br from-slate-700/50 to-gray-800/50',
    border: 'border-slate-400/50',
    icon: '🥈', 
    textColor: 'text-slate-200',
    glow: 'shadow-slate-400/30'
  },
  GOLD: { 
    color: 'from-yellow-400 via-amber-300 to-yellow-500', 
    bg: 'bg-gradient-to-br from-yellow-900/40 to-amber-900/40',
    border: 'border-yellow-500/50',
    icon: '🥇', 
    textColor: 'text-yellow-300',
    glow: 'shadow-yellow-500/40'
  },
  PLATINUM: { 
    color: 'from-cyan-300 via-blue-200 to-purple-300', 
    bg: 'bg-gradient-to-br from-cyan-900/40 to-purple-900/40',
    border: 'border-cyan-400/50',
    icon: '💎', 
    textColor: 'text-cyan-200',
    glow: 'shadow-cyan-400/40'
  },
  BADGE: { 
    color: 'from-indigo-400 via-purple-400 to-pink-400', 
    bg: 'bg-gradient-to-br from-indigo-900/40 to-purple-900/40',
    border: 'border-purple-500/50',
    icon: '🛡️', 
    textColor: 'text-purple-300',
    glow: 'shadow-purple-500/30'
  },
  CROWN: { 
    color: 'from-fuchsia-400 via-pink-400 to-rose-400', 
    bg: 'bg-gradient-to-br from-fuchsia-900/40 to-pink-900/40',
    border: 'border-pink-500/50',
    icon: '👑', 
    textColor: 'text-pink-300',
    glow: 'shadow-pink-500/40'
  },
};

// Sample rewards data for marketplace
const marketplaceRewards = [
  {
    id: '1',
    name: 'Pickleball Training Ball Set',
    description: '6-pack of indoor/outdoor pickleballs',
    points: 500,
    tier: 'BRONZE',
    image: 'https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?w=400&h=300&fit=crop',
    available: true
  },
  {
    id: '2', 
    name: 'Pro Paddle Grip Tape',
    description: 'Premium overgrip for better control',
    points: 750,
    tier: 'BRONZE',
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=300&fit=crop',
    available: true
  },
  {
    id: '3',
    name: 'Champion Wristbands',
    description: 'Moisture-wicking performance wristbands',
    points: 1000,
    tier: 'SILVER',
    image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&h=300&fit=crop',
    available: true
  },
  {
    id: '4',
    name: 'Court Bag',
    description: 'Spacious bag for all your gear',
    points: 2000,
    tier: 'GOLD',
    image: 'https://images.unsplash.com/photo-1622260614153-03223fb72052?w=400&h=300&fit=crop',
    available: false,
    comingSoon: true
  },
  {
    id: '5',
    name: 'Private Coaching Session',
    description: '1-hour with certified coach',
    points: 5000,
    tier: 'PLATINUM',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
    available: false,
    comingSoon: true
  },
];

const categoryConfig: Record<string, { name: string; icon: any; color: string }> = {
  GENERAL: { name: 'General', icon: Trophy, color: 'emerald' },
  PRACTICE: { name: 'Practice & Streaks', icon: Flame, color: 'orange' },
  VIDEO: { name: 'Video Analysis', icon: Video, color: 'blue' },
  SERVING: { name: 'Serving', icon: Target, color: 'teal' },
  DINKING: { name: 'Dinking', icon: Target, color: 'cyan' },
  THIRD_SHOT: { name: 'Third Shot', icon: Target, color: 'green' },
  VOLLEY: { name: 'Volleys', icon: Target, color: 'indigo' },
  FOOTWORK: { name: 'Footwork', icon: Target, color: 'pink' },
  STRATEGY: { name: 'Strategy', icon: Target, color: 'violet' },
  RETURN_OF_SERVE: { name: 'Return of Serve', icon: Target, color: 'rose' },
  MENTAL_GAME: { name: 'Mental Game', icon: Target, color: 'amber' },
  MULTI_SECTION: { name: 'Multi-Section', icon: Award, color: 'purple' },
  ULTIMATE: { name: 'Ultimate', icon: Crown, color: 'yellow' },
};

export default function RewardsHubPage() {
  const { data: session, status } = useSession() || {};
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentUnlocks, setRecentUnlocks] = useState<Achievement[]>([]);
  const [nearUnlocks, setNearUnlocks] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'marketplace' | 'tiers'>('overview');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
      fetchUser();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/user/update');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (e) {
      console.error('Error fetching user:', e);
    }
  };

  const fetchData = async () => {
    try {
      const [achRes, statsRes] = await Promise.all([
        fetch('/api/achievements?userId=current'),
        fetch('/api/achievements/user'),
      ]);

      if (achRes.ok) {
        const achData = await achRes.json();
        setAchievements(achData.achievements || []);
        
        // Get recently unlocked
        const unlocked = (achData.achievements || []).filter((a: Achievement) => a.unlocked);
        const sorted = unlocked.sort((a: Achievement, b: Achievement) => 
          new Date(b.unlockedAt || 0).getTime() - new Date(a.unlockedAt || 0).getTime()
        );
        setRecentUnlocks(sorted.slice(0, 5));
        
        // Get near unlocks (>50% progress)
        const near = (achData.achievements || []).filter(
          (a: Achievement) => !a.unlocked && a.progress && a.progress.percentage >= 50
        ).sort((a: Achievement, b: Achievement) => 
          (b.progress?.percentage || 0) - (a.progress?.percentage || 0)
        );
        setNearUnlocks(near.slice(0, 4));
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }
    } catch (e) {
      console.error('Error fetching data:', e);
    } finally {
      setLoading(false);
    }
  };

  const groupedAchievements = achievements.reduce((acc, ach) => {
    const cat = ach.category || 'GENERAL';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(ach);
    return acc;
  }, {} as Record<string, Achievement[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
        </div>
      </div>
    );
  }

  const totalAchievements = achievements.length;
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const progressPercent = totalAchievements > 0 ? Math.round((unlockedCount / totalAchievements) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <MainNavigation user={user} />
      
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Branded Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-900/30 via-slate-900 to-purple-900/30 border border-amber-500/20 p-6 md:p-8"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-conic from-amber-500/10 via-transparent to-purple-500/10"
            />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-5xl"
                  >
                    🏆
                  </motion.div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white">My Rewards</h1>
                    <p className="text-amber-300/80 text-sm md:text-base">Earn points, unlock tiers, redeem prizes</p>
                  </div>
                </div>
                <p className="text-slate-300 text-sm max-w-xl">
                  Complete training sessions, achieve milestones, and climb through Bronze, Silver, Gold, and Platinum tiers. 
                  Your dedication pays off with exclusive rewards and recognition!
                </p>
              </div>
              
              {/* Points Display Card */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-br from-amber-500/20 to-yellow-600/20 backdrop-blur-sm rounded-xl p-4 border border-amber-500/30 min-w-[200px]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    <Star className="w-8 h-8 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-amber-300/70 text-xs uppercase tracking-wider">Your Points</p>
                    <p className="text-3xl font-bold text-white">
                      {(stats?.rewardPoints || user?.rewardPoints || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 flex-wrap">
          {(['overview', 'marketplace', 'tiers'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-5 py-3 rounded-xl font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              {tab === 'overview' && <Trophy className="w-5 h-5 inline mr-2" />}
              {tab === 'marketplace' && <Gift className="w-5 h-5 inline mr-2" />}
              {tab === 'tiers' && <Crown className="w-5 h-5 inline mr-2" />}
              {tab === 'overview' ? 'Overview' : tab === 'marketplace' ? 'Marketplace' : 'Tier System'}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={<Star className="w-6 h-6 text-yellow-400" />}
                value={stats?.totalPoints || 0}
                label="Total Points"
                color="yellow"
              />
              <StatCard
                icon={<Trophy className="w-6 h-6 text-emerald-400" />}
                value={`${unlockedCount}/${totalAchievements}`}
                label="Achievements"
                color="emerald"
              />
              <StatCard
                icon={<Flame className="w-6 h-6 text-orange-400" />}
                value={stats?.currentStreak || user?.currentStreak || 0}
                label="Day Streak"
                color="orange"
              />
              <StatCard
                icon={<Gem className="w-6 h-6 text-purple-400" />}
                value={stats?.rewardPoints || user?.rewardPoints || 0}
                label="Reward Points"
                color="purple"
              />
            </div>

            {/* Progress Bar */}
            <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
              <div className="flex justify-between items-center mb-3">
                <span className="text-white font-semibold">Overall Progress</span>
                <span className="text-emerald-400 font-bold">{progressPercent}%</span>
              </div>
              <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                />
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-400">
                <span>🥉 {stats?.bronzeMedals || 0} Bronze</span>
                <span>🥈 {stats?.silverMedals || 0} Silver</span>
                <span>🥇 {stats?.goldMedals || 0} Gold</span>
                <span>🛡️ {stats?.badges || 0} Badges</span>
                {stats?.hasCrown && <span>👑 Crown!</span>}
              </div>
            </div>

            {/* Recently Unlocked */}
            {recentUnlocks.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    Recently Unlocked
                  </h2>
                  <Link href="/progress/achievements" className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center">
                    View All <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {recentUnlocks.map((ach, i) => (
                    <AchievementMiniCard key={ach.id} achievement={ach} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Almost There */}
            {nearUnlocks.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Almost There!
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {nearUnlocks.map((ach, i) => (
                    <NearUnlockCard key={ach.id} achievement={ach} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <QuickLink
                href="/progress/achievements"
                icon={<Medal className="w-8 h-8" />}
                title="Achievement Gallery"
                description="View all your unlocked achievements"
                color="emerald"
              />
              <QuickLink
                href="/rewards/store"
                icon={<Gift className="w-8 h-8" />}
                title="Rewards Store"
                description="Redeem points for exclusive rewards"
                color="purple"
              />
              <QuickLink
                href="/train"
                icon={<Target className="w-8 h-8" />}
                title="Training Hub"
                description="Complete drills to earn more achievements"
                color="teal"
              />
            </div>
          </motion.div>
        )}

        

        {/* Marketplace Tab */}
        {activeTab === 'marketplace' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Rewards Marketplace</h2>
              <div className="flex items-center gap-2 bg-amber-500/20 px-4 py-2 rounded-full">
                <Star className="w-5 h-5 text-amber-400" />
                <span className="text-amber-300 font-bold">{(stats?.rewardPoints || user?.rewardPoints || 0).toLocaleString()} pts</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketplaceRewards.map((reward, i) => {
                const tier = tierConfig[reward.tier as keyof typeof tierConfig] || tierConfig.BRONZE;
                const canAfford = (stats?.rewardPoints || user?.rewardPoints || 0) >= reward.points;
                
                return (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ y: -4 }}
                    className={`relative rounded-2xl overflow-hidden ${tier.bg} border ${tier.border} ${reward.comingSoon ? 'opacity-80' : ''}`}
                  >
                    {/* Coming Soon Badge */}
                    {reward.comingSoon && (
                      <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute top-3 right-3 z-20 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-purple-500/50"
                      >
                        ✨ Coming Soon
                      </motion.div>
                    )}
                    
                    {/* Image */}
                    <div className="relative h-40 bg-slate-800">
                      <Image
                        src={reward.image}
                        alt={reward.name}
                        fill
                        className={`object-cover ${reward.comingSoon ? 'grayscale' : ''}`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                      <div className="absolute bottom-2 left-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${tier.bg} ${tier.textColor} border ${tier.border}`}>
                          {tier.icon} {reward.tier}
                        </span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-4 space-y-3">
                      <h3 className="text-lg font-bold text-white">{reward.name}</h3>
                      <p className="text-slate-400 text-sm">{reward.description}</p>
                      
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-400" />
                          <span className="text-amber-300 font-bold">{reward.points.toLocaleString()}</span>
                        </div>
                        
                        {reward.comingSoon ? (
                          <button disabled className="px-4 py-2 bg-slate-700/50 text-slate-400 rounded-lg text-sm cursor-not-allowed">
                            Coming Soon
                          </button>
                        ) : canAfford ? (
                          <button className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-amber-500/30 transition-all">
                            Redeem
                          </button>
                        ) : (
                          <button disabled className="px-4 py-2 bg-slate-700/50 text-slate-400 rounded-lg text-sm cursor-not-allowed">
                            Need {(reward.points - (stats?.rewardPoints || user?.rewardPoints || 0)).toLocaleString()} more
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            {/* More Coming Soon */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-full border border-purple-500/30"
              >
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span className="text-purple-300">More exclusive rewards coming soon!</span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
        
        {/* Tiers Tab */}
        {activeTab === 'tiers' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-white">Tier System</h2>
              <p className="text-slate-400">Climb the ranks and unlock exclusive rewards at each tier</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { tier: 'BRONZE', points: 0, benefits: ['Basic rewards access', '5% bonus on weekly challenges', 'Bronze badge'] },
                { tier: 'SILVER', points: 1000, benefits: ['All Bronze benefits', '10% bonus on challenges', 'Priority support', 'Silver badge'] },
                { tier: 'GOLD', points: 5000, benefits: ['All Silver benefits', '20% bonus on challenges', 'Exclusive content', 'Gold badge'] },
                { tier: 'PLATINUM', points: 15000, benefits: ['All Gold benefits', '30% bonus on challenges', 'VIP events access', 'Platinum badge', 'Custom profile'] },
              ].map((tierData, i) => {
                const config = tierConfig[tierData.tier as keyof typeof tierConfig];
                const userPoints = stats?.rewardPoints || user?.rewardPoints || 0;
                const isUnlocked = userPoints >= tierData.points;
                const isCurrentTier = userPoints >= tierData.points && (i === 3 || userPoints < [0, 1000, 5000, 15000][i + 1]);
                
                return (
                  <motion.div
                    key={tierData.tier}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 }}
                    whileHover={{ scale: 1.02 }}
                    className={`relative rounded-2xl ${config.bg} border-2 ${isCurrentTier ? config.border + ' shadow-xl ' + config.glow : 'border-slate-700/50'} p-6 ${!isUnlocked ? 'opacity-60' : ''}`}
                  >
                    {isCurrentTier && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          Current Tier
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center space-y-4">
                      <motion.span
                        animate={isCurrentTier ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-5xl block"
                      >
                        {config.icon}
                      </motion.span>
                      <h3 className={`text-xl font-bold ${config.textColor}`}>{tierData.tier}</h3>
                      <p className="text-slate-400 text-sm">{tierData.points.toLocaleString()} points required</p>
                      
                      <div className="space-y-2 text-left">
                        {tierData.benefits.map((benefit, j) => (
                          <div key={j} className="flex items-center gap-2 text-sm">
                            <CheckCircle className={`w-4 h-4 ${isUnlocked ? 'text-green-400' : 'text-slate-600'}`} />
                            <span className={isUnlocked ? 'text-slate-300' : 'text-slate-500'}>{benefit}</span>
                          </div>
                        ))}
                      </div>
                      
                      {!isUnlocked && (
                        <div className="pt-2">
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r ${config.color}`}
                              style={{ width: `${Math.min(100, (userPoints / tierData.points) * 100)}%` }}
                            />
                          </div>
                          <p className="text-slate-500 text-xs mt-1">
                            {(tierData.points - userPoints).toLocaleString()} points to unlock
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            {/* How to Earn Points */}
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-amber-400" />
                How to Earn Points
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: Target, action: 'Complete Training', points: '+10-50 pts', color: 'text-emerald-400' },
                  { icon: Video, action: 'Video Analysis', points: '+25 pts', color: 'text-blue-400' },
                  { icon: Flame, action: 'Daily Streak', points: '+5 pts/day', color: 'text-orange-400' },
                  { icon: Trophy, action: 'Win Matches', points: '+20 pts', color: 'text-yellow-400' },
                  { icon: Medal, action: 'Unlock Achievements', points: '+50-500 pts', color: 'text-purple-400' },
                  { icon: Users, action: 'Refer Friends', points: '+100 pts', color: 'text-pink-400' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <div>
                      <p className="text-white text-sm font-medium">{item.action}</p>
                      <p className="text-amber-400 text-xs font-bold">{item.points}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: number | string; label: string; color: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-slate-800/50 border border-${color}-500/30 rounded-xl p-4 text-center`}
    >
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-sm text-gray-400">{label}</p>
    </motion.div>
  );
}

function AchievementMiniCard({ achievement, index }: { achievement: Achievement; index: number }) {
  const tier = tierConfig[achievement.tier as keyof typeof tierConfig] || tierConfig.BRONZE;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
      className={`bg-gradient-to-br ${tier.color} rounded-xl p-4 text-center shadow-lg`}
    >
      <span className="text-4xl block mb-2">{achievement.icon || tier.icon}</span>
      <p className="text-white font-semibold text-sm truncate">{achievement.name}</p>
      <p className="text-white/70 text-xs">+{achievement.points} pts</p>
    </motion.div>
  );
}

function NearUnlockCard({ achievement, index }: { achievement: Achievement; index: number }) {
  const progress = achievement.progress?.percentage || 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-slate-800/50 border border-slate-700 rounded-xl p-4"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{achievement.icon || '🏆'}</span>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold truncate">{achievement.name}</p>
          <p className="text-emerald-400 text-sm font-bold">{progress.toFixed(0)}% complete</p>
        </div>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8 }}
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
        />
      </div>
      <p className="text-gray-400 text-xs mt-2">
        {achievement.progress?.currentValue || 0}/{achievement.progress?.targetValue || 0}
      </p>
    </motion.div>
  );
}

function AchievementCard({ achievement, index }: { achievement: Achievement; index: number }) {
  const tier = tierConfig[achievement.tier as keyof typeof tierConfig] || tierConfig.BRONZE;
  const isLocked = !achievement.unlocked;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ scale: 1.05, y: -4 }}
      className={`relative rounded-xl p-4 text-center transition-all ${
        isLocked
          ? 'bg-slate-800/30 border border-slate-700/50'
          : `bg-gradient-to-br ${tier.color} shadow-lg`
      }`}
    >
      {isLocked && (
        <div className="absolute top-2 right-2">
          <Lock className="w-4 h-4 text-gray-500" />
        </div>
      )}
      <span className={`text-4xl block mb-2 ${isLocked ? 'grayscale opacity-40' : ''}`}>
        {achievement.icon || tier.icon}
      </span>
      <p className={`font-semibold text-sm truncate ${isLocked ? 'text-gray-500' : 'text-white'}`}>
        {achievement.name}
      </p>
      <p className={`text-xs ${isLocked ? 'text-gray-600' : 'text-white/70'}`}>
        +{achievement.points} pts
      </p>
      {!isLocked && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1"
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
        </motion.div>
      )}
    </motion.div>
  );
}

function QuickLink({ href, icon, title, description, color }: {
  href: string; icon: React.ReactNode; title: string; description: string; color: string;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        className={`bg-slate-800/50 border border-${color}-500/30 rounded-xl p-6 hover:bg-slate-800/70 transition-all group`}
      >
        <div className={`text-${color}-400 mb-3 group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <h3 className="text-white font-bold mb-1">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </motion.div>
    </Link>
  );
}
