'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import MainNavigation from '@/components/navigation/main-navigation';
import {
  Trophy, Star, Crown, Medal, Shield, Gift,
  TrendingUp, Target, Flame, Video, Users,
  Calendar, Zap, ChevronRight, Sparkles, Lock,
  Award, Gem, Clock
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

const tierConfig = {
  BRONZE: { color: 'from-amber-600 to-orange-700', icon: '🥉', textColor: 'text-amber-400' },
  SILVER: { color: 'from-gray-400 to-slate-500', icon: '🥈', textColor: 'text-gray-300' },
  GOLD: { color: 'from-yellow-500 to-amber-600', icon: '🥇', textColor: 'text-yellow-400' },
  BADGE: { color: 'from-indigo-500 to-purple-600', icon: '🛡️', textColor: 'text-indigo-400' },
  CROWN: { color: 'from-purple-600 to-pink-600', icon: '👑', textColor: 'text-purple-400' },
};

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
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'store'>('overview');
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
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-3">
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="text-5xl"
            >
              🏆
            </motion.span>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-transparent bg-clip-text">
              Rewards Hub
            </h1>
            <motion.span
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, delay: 0.5 }}
              className="text-5xl"
            >
              ⭐
            </motion.span>
          </div>
          <p className="text-gray-400 text-lg">Track your progress, unlock achievements, and claim rewards!</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center gap-2">
          {(['overview', 'achievements', 'store'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-slate-800/50 text-gray-400 hover:bg-slate-700/50'
              }`}
            >
              {tab === 'overview' && <Trophy className="w-5 h-5 inline mr-2" />}
              {tab === 'achievements' && <Medal className="w-5 h-5 inline mr-2" />}
              {tab === 'store' && <Gift className="w-5 h-5 inline mr-2" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
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

        {activeTab === 'achievements' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {Object.entries(groupedAchievements).map(([category, achs]) => {
              const config = categoryConfig[category] || categoryConfig.GENERAL;
              const Icon = config.icon;
              const unlockedInCat = achs.filter(a => a.unlocked).length;
              
              return (
                <div key={category} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-${config.color}-500/20`}>
                        <Icon className={`w-5 h-5 text-${config.color}-400`} />
                      </div>
                      <h2 className="text-xl font-bold text-white">{config.name}</h2>
                      <span className="text-sm text-gray-400">({unlockedInCat}/{achs.length})</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {achs.sort((a, b) => (a.unlocked === b.unlocked ? 0 : a.unlocked ? -1 : 1)).map((ach, i) => (
                      <AchievementCard key={ach.id} achievement={ach} index={i} />
                    ))}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {activeTab === 'store' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Gift className="w-20 h-20 text-purple-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Rewards Store</h2>
            <p className="text-gray-400 mb-6">Redeem your points for exclusive pickleball gear and perks!</p>
            <Link
              href="/rewards/store"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all"
            >
              <Gift className="w-5 h-5" />
              Visit Store
            </Link>
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
