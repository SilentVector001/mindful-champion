'use client';

import { useState, useEffect } from 'react';
import { 
  Trophy, Award, Medal, Crown, Shield, Star, 
  Lock, TrendingUp, Filter, Search, Sparkles, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MainNavigation from '@/components/navigation/main-navigation';
import { useSession } from 'next-auth/react';

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
  progress?: {
    currentValue: number;
    targetValue: number;
    percentage: number;
  };
}

// Enhanced tier colors with vibrant gradients
const tierColors = {
  BRONZE: { 
    bg: 'bg-gradient-to-br from-amber-600 to-orange-600', 
    text: 'text-amber-600', 
    border: 'border-amber-600', 
    glow: 'shadow-amber-600/50',
    badge: 'bg-gradient-to-r from-amber-600 to-orange-600',
    label: 'BRONZE'
  },
  SILVER: { 
    bg: 'bg-gradient-to-br from-gray-400 to-gray-600', 
    text: 'text-gray-400', 
    border: 'border-gray-400', 
    glow: 'shadow-gray-400/50',
    badge: 'bg-gradient-to-r from-gray-400 to-gray-600',
    label: 'SILVER'
  },
  GOLD: { 
    bg: 'bg-gradient-to-br from-yellow-500 to-yellow-600', 
    text: 'text-yellow-500', 
    border: 'border-yellow-500', 
    glow: 'shadow-yellow-500/50',
    badge: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
    label: 'GOLD'
  },
  BADGE: { 
    bg: 'bg-gradient-to-br from-indigo-600 to-blue-600', 
    text: 'text-indigo-600', 
    border: 'border-indigo-600', 
    glow: 'shadow-indigo-600/50',
    badge: 'bg-gradient-to-r from-indigo-600 to-blue-600',
    label: 'BADGE'
  },
  CROWN: { 
    bg: 'bg-gradient-to-br from-purple-600 to-pink-600', 
    text: 'text-purple-600', 
    border: 'border-purple-600', 
    glow: 'shadow-purple-600/50',
    badge: 'bg-gradient-to-r from-purple-600 to-pink-600',
    label: 'CROWN'
  },
  PLATINUM: { 
    bg: 'bg-gradient-to-br from-slate-300 to-slate-400', 
    text: 'text-slate-300', 
    border: 'border-slate-300', 
    glow: 'shadow-slate-300/50',
    badge: 'bg-gradient-to-r from-slate-300 to-slate-400',
    label: 'PLATINUM'
  },
};

// Emoji icon mapping based on achievement category/tier
const getEmojiIcon = (tier: string, category: string, icon?: string): string => {
  // Use provided icon if available
  if (icon && icon !== '') return icon;
  
  // Map by tier first
  if (tier === 'CROWN') return '👑';
  if (tier === 'PLATINUM') return '💎';
  if (tier === 'GOLD') return '🥇';
  if (tier === 'SILVER') return '🥈';
  if (tier === 'BRONZE') return '🥉';
  
  // Map by category
  const categoryMap: Record<string, string> = {
    SERVING: '🏓',
    RETURN_OF_SERVE: '⚔️',
    DINKING: '🎯',
    THIRD_SHOT: '🌈',
    VOLLEY: '⭐',
    FOOTWORK: '👟',
    STRATEGY: '🧠',
    MENTAL_GAME: '🧘',
    ADVANCED_TECHNIQUES: '🔥',
    SKILL_LEVEL: '🏅',
    MULTI_SECTION: '🌟',
    ULTIMATE: '👑',
    GENERAL: '🏆',
  };
  
  return categoryMap[category] || '🏆';
};

const categoryNames: Record<string, string> = {
  SERVING: 'Serving',
  RETURN_OF_SERVE: 'Return of Serve',
  DINKING: 'Dinking',
  THIRD_SHOT: 'Third Shot',
  VOLLEY: 'Volley',
  FOOTWORK: 'Footwork',
  STRATEGY: 'Strategy',
  MENTAL_GAME: 'Mental Game',
  ADVANCED_TECHNIQUES: 'Advanced Techniques',
  SKILL_LEVEL: 'Skill Level',
  MULTI_SECTION: 'Multi-Section',
  ULTIMATE: 'Ultimate',
  GENERAL: 'General',
};

export default function AchievementsPage() {
  const { data: session } = useSession() || {};
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/user/update', {
            method: 'GET',
          });
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      }
      setLoading(false);
    };

    if (session) {
      fetchUser();
    } else if (session === null) {
      setLoading(false);
    }
  }, [session]);

  if (loading || session === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
        </div>
      </div>
    );
  }

  return <AchievementsContent user={user} />;
}

function AchievementsContent({ user }: { user: any }) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filteredAchievements, setFilteredAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchAchievements();
    fetchStats();
  }, []);

  useEffect(() => {
    filterAchievements();
  }, [achievements, filter, categoryFilter, tierFilter, searchTerm]);

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements?userId=current');
      if (response.ok) {
        const data = await response.json();
        setAchievements(data.achievements);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/achievements/user');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filterAchievements = () => {
    let filtered = [...achievements];

    // Filter by unlocked status
    if (filter === 'unlocked') {
      filtered = filtered.filter((a) => a.unlocked);
    } else if (filter === 'locked') {
      filtered = filtered.filter((a) => !a.unlocked);
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((a) => a.category === categoryFilter);
    }

    // Filter by tier
    if (tierFilter !== 'all') {
      filtered = filtered.filter((a) => a.tier === tierFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAchievements(filtered);
  };

  const getIcon = (tier: string) => {
    switch (tier) {
      case 'BRONZE':
      case 'SILVER':
      case 'GOLD':
        return Medal;
      case 'BADGE':
        return Shield;
      case 'CROWN':
        return Crown;
      default:
        return Trophy;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        <MainNavigation user={user} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
          </div>
        </div>
      </div>
    );
  }

  const categories = Array.from(new Set(achievements.map((a) => a.category)));
  const tiers = Array.from(new Set(achievements.map((a) => a.tier)));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <MainNavigation user={user} />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="inline-flex items-center gap-4 text-6xl font-bold">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                🏆
              </motion.div>
              <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-transparent bg-clip-text">
                Achievement Gallery
              </span>
              <motion.div
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, delay: 0.5 }}
              >
                🎯
              </motion.div>
            </div>
            <p className="text-gray-400 text-lg">
              Unlock your potential, one milestone at a time! ⭐
            </p>
          </motion.div>
          
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto"
            >
              {/* Total Points */}
              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/30 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-yellow-400 mb-1">{stats.totalPoints?.toLocaleString() || 0}</p>
                <p className="text-sm text-gray-400 font-medium">Total Points Earned</p>
              </div>

              {/* Unlocked Achievements */}
              <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-2 border-emerald-500/30 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-emerald-400 mb-1">{stats.totalAchievements || 0}</p>
                <p className="text-sm text-gray-400 font-medium">Achievements Unlocked</p>
              </div>

              {/* Player Rank */}
              <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-blue-500/30 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-blue-400 mb-1">{stats.rank || 'Unranked'}</p>
                <p className="text-sm text-gray-400 font-medium">Player Rank</p>
              </div>
            </motion.div>
          )}

          {/* Motivational Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-red-500/20 border-2 border-purple-500/30 rounded-2xl p-4 max-w-2xl mx-auto"
          >
            <p className="text-white font-medium text-center">
              <Sparkles className="w-5 h-5 inline-block mr-2 text-yellow-400" />
              Ready to level up? Complete more sections to unlock amazing rewards!
              <Sparkles className="w-5 h-5 inline-block ml-2 text-yellow-400" />
            </p>
          </motion.div>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-700/50 shadow-xl"
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Filter Achievements</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Status
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="w-full px-4 py-2 bg-gray-700/80 border-2 border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              >
                <option value="all">🌟 All Achievements</option>
                <option value="unlocked">✅ Unlocked Only</option>
                <option value="locked">🔒 Locked Only</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700/80 border-2 border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="all">📁 All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryNames[cat] || cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Tier Filter */}
            <div>
              <label className="block text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                <Crown className="w-4 h-4" />
                Tier
              </label>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700/80 border-2 border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
              >
                <option value="all">🏅 All Tiers</option>
                {tiers.map((tier) => (
                  <option key={tier} value={tier}>
                    {tier === 'CROWN' && '👑'} {tier === 'PLATINUM' && '💎'} {tier === 'GOLD' && '🥇'} {tier === 'SILVER' && '🥈'} {tier === 'BRONZE' && '🥉'} {tier === 'BADGE' && '🛡️'} {tier}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-semibold text-purple-400 mb-2 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Find achievements..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-700/80 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Active Filters Summary */}
          {(filter !== 'all' || categoryFilter !== 'all' || tierFilter !== 'all' || searchTerm) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-400">Active filters:</span>
              {filter !== 'all' && (
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/30">
                  {filter}
                </span>
              )}
              {categoryFilter !== 'all' && (
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full border border-blue-500/30">
                  {categoryNames[categoryFilter]}
                </span>
              )}
              {tierFilter !== 'all' && (
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full border border-yellow-500/30">
                  {tierFilter}
                </span>
              )}
              {searchTerm && (
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-full border border-purple-500/30">
                  "{searchTerm}"
                </span>
              )}
              <button
                onClick={() => {
                  setFilter('all');
                  setCategoryFilter('all');
                  setTierFilter('all');
                  setSearchTerm('');
                }}
                className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full border border-red-500/30 hover:bg-red-500/30 transition-all"
              >
                Clear all
              </button>
            </div>
          )}
        </motion.div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAchievements.map((achievement, index) => {
            const colors = tierColors[achievement.tier as keyof typeof tierColors] || tierColors.BADGE;
            const emoji = getEmojiIcon(achievement.tier, achievement.category, achievement.icon);
            const isLocked = !achievement.unlocked;

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
                whileHover={{ scale: 1.05, y: -8 }}
                className={`
                  relative rounded-2xl p-6 border-2
                  ${achievement.unlocked
                    ? `${colors.border} bg-gradient-to-br from-gray-800/90 to-gray-900/90 ${colors.glow} shadow-2xl`
                    : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                  }
                  backdrop-blur-sm transition-all duration-300
                  hover:shadow-2xl
                `}
              >
                {/* Tier Badge - Top Left */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`
                      px-3 py-1 text-xs font-bold rounded-full text-white shadow-lg
                      ${colors.badge}
                    `}
                  >
                    {colors.label}
                  </span>
                </div>

                {/* Lock/Unlock indicator - Top Right */}
                <div className="absolute top-3 right-3">
                  {isLocked ? (
                    <div className="p-2 bg-gray-700/80 rounded-full">
                      <Lock className="w-4 h-4 text-gray-400" />
                    </div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.3 }}
                      className="relative"
                    >
                      <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                      <div className="absolute inset-0 animate-ping">
                        <Sparkles className="w-5 h-5 text-yellow-400 opacity-20" />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Large Emoji Icon */}
                <div className={`mt-8 mb-4 text-center ${isLocked ? 'opacity-40 grayscale' : ''}`}>
                  <div className="text-6xl mb-2 transform transition-transform hover:scale-110">
                    {emoji}
                  </div>
                </div>

                {/* Achievement Name */}
                <h3
                  className={`
                    text-lg font-bold mb-2 text-center
                    ${achievement.unlocked ? 'text-white' : 'text-gray-400'}
                  `}
                >
                  {achievement.name}
                </h3>

                {/* Unlocked Badge */}
                {achievement.unlocked && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-2 mb-2"
                  >
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wide">
                      Unlocked!
                    </span>
                    <Zap className="w-4 h-4 text-yellow-400" />
                  </motion.div>
                )}

                {/* Description */}
                <p
                  className={`
                    text-sm mb-4 text-center
                    ${achievement.unlocked ? 'text-gray-300' : 'text-gray-500'}
                  `}
                >
                  {achievement.description}
                </p>

                {/* Progress Bar (for locked achievements) */}
                {isLocked && achievement.progress && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-400 mb-2">
                      <span className="font-medium">Your Progress</span>
                      <span className="font-bold">{achievement.progress.percentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${achievement.progress.percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-3 rounded-full ${colors.bg} relative overflow-hidden`}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      </motion.div>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-1">
                      <span className="font-medium">
                        {achievement.progress.currentValue} / {achievement.progress.targetValue}
                      </span>
                      {achievement.progress.percentage >= 50 && (
                        <span className="text-green-400 font-semibold">Almost there!</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Motivational Text for Locked */}
                {isLocked && !achievement.progress && (
                  <div className="mb-4 text-center">
                    <p className="text-xs text-yellow-400 font-medium">
                      🌟 Keep going! You're doing great!
                    </p>
                  </div>
                )}

                {/* Points Display */}
                <div className={`
                  flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                  ${achievement.unlocked 
                    ? `${colors.bg} shadow-lg` 
                    : 'bg-gray-700/50 border border-gray-600'
                  }
                `}>
                  <Star className={`w-5 h-5 ${achievement.unlocked ? 'text-yellow-400' : colors.text}`} />
                  <span className={`text-lg font-bold ${achievement.unlocked ? 'text-white' : colors.text}`}>
                    {achievement.points} Points
                  </span>
                  {achievement.unlocked && (
                    <Trophy className="w-5 h-5 text-yellow-400" />
                  )}
                </div>

                {/* Unlock Date */}
                {achievement.unlocked && achievement.unlockedAt && (
                  <div className="mt-3 text-center">
                    <span className="text-xs text-gray-400">
                      Unlocked {formatDate(achievement.unlockedAt)}
                    </span>
                  </div>
                )}

                {/* Category Badge - Bottom */}
                <div className="mt-3 text-center">
                  <span className="inline-block px-3 py-1 text-xs font-medium bg-gray-700/50 text-gray-300 rounded-full border border-gray-600">
                    {categoryNames[achievement.category] || achievement.category}
                  </span>
                </div>

                {/* Rarity Badge */}
                {achievement.rarity !== 'common' && (
                  <div className="absolute bottom-3 right-3">
                    <span
                      className={`
                        px-2 py-1 text-xs font-bold rounded-full uppercase
                        ${achievement.rarity === 'legendary' && 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'}
                        ${achievement.rarity === 'epic' && 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'}
                        ${achievement.rarity === 'rare' && 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'}
                      `}
                    >
                      {achievement.rarity}
                    </span>
                  </div>
                )}

                {/* Celebration Effect for Unlocked */}
                {achievement.unlocked && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2">
                      <motion.div
                        initial={{ opacity: 0, y: 0 }}
                        animate={{ opacity: [0, 1, 0], y: -20 }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      >
                        ✨
                      </motion.div>
                    </div>
                    <div className="absolute bottom-0 right-4">
                      <motion.div
                        initial={{ opacity: 0, y: 0 }}
                        animate={{ opacity: [0, 1, 0], y: -15 }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, delay: 0.5 }}
                      >
                        ⭐
                      </motion.div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredAchievements.length === 0 && (
          <div className="text-center py-16">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No achievements found
            </h3>
            <p className="text-gray-500">
              Try adjusting your filters or search term
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
