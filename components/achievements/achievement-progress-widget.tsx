'use client';

import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, Star, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface NextAchievement {
  id: string;
  name: string;
  tier: string;
  progress: {
    currentValue: number;
    targetValue: number;
    percentage: number;
  };
}

export default function AchievementProgressWidget() {
  const [nextAchievement, setNextAchievement] = useState<NextAchievement | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/achievements/user');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);

        // Find the next achievement closest to completion
        const inProgressAchievements = data.progress.filter(
          (a: any) => a.progress && a.progress.percentage > 0 && a.progress.percentage < 100
        );

        if (inProgressAchievements.length > 0) {
          const sorted = inProgressAchievements.sort(
            (a: any, b: any) => b.progress.percentage - a.progress.percentage
          );
          setNextAchievement(sorted[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching achievement data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/2 mb-4" />
        <div className="h-4 bg-gray-700 rounded w-3/4" />
      </div>
    );
  }

  if (!stats) return null;

  const tierColors: Record<string, string> = {
    BRONZE: 'text-amber-500',
    SILVER: 'text-gray-400',
    GOLD: 'text-yellow-500',
    BADGE: 'text-indigo-500',
    CROWN: 'text-purple-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-600/20 rounded-lg">
            <Trophy className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Achievements</h3>
            <p className="text-sm text-gray-400">Track your progress</p>
          </div>
        </div>
        <Link
          href="/progress/achievements"
          className="text-emerald-500 hover:text-emerald-400 transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-2xl font-bold text-white">{stats.totalPoints}</span>
          </div>
          <p className="text-xs text-gray-400">Points</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Trophy className="w-4 h-4 text-emerald-500" />
            <span className="text-2xl font-bold text-white">{stats.totalAchievements}</span>
          </div>
          <p className="text-xs text-gray-400">Unlocked</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span className="text-2xl font-bold text-white">{stats.rank ? stats.rank.split(' ')[0] : 'Beginner'}</span>
          </div>
          <p className="text-xs text-gray-400">Rank</p>
        </div>
      </div>

      {/* Next Achievement */}
      {nextAchievement ? (
        <div className="border-t border-gray-700 pt-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-semibold text-gray-300">Next Achievement</span>
          </div>
          
          <div className="mb-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className={`text-sm font-medium ${tierColors[nextAchievement.tier] || 'text-white'} truncate max-w-[70%] sm:max-w-none`}>
                {nextAchievement.name}
              </span>
              <span className="text-sm font-semibold text-emerald-500 flex-shrink-0">
                {nextAchievement.progress.percentage.toFixed(0)}%
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="relative w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${nextAchievement.progress.percentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-full"
              />
            </div>
            
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>
                {nextAchievement.progress.currentValue} / {nextAchievement.progress.targetValue}
              </span>
              <span>
                {nextAchievement.progress.targetValue - nextAchievement.progress.currentValue} more to go
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-t border-gray-700 pt-4">
          <p className="text-sm text-gray-400 text-center">
            Complete drills to start earning achievements! 🏆
          </p>
        </div>
      )}

      {/* Medal Summary */}
      <div className="border-t border-gray-700 pt-4 mt-4">
        <div className="flex items-center justify-around text-sm">
          <div className="flex items-center gap-1">
            <span className="text-amber-700">🥉</span>
            <span className="text-white font-semibold">{stats.bronzeMedals}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-400">🥈</span>
            <span className="text-white font-semibold">{stats.silverMedals}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">🥇</span>
            <span className="text-white font-semibold">{stats.goldMedals}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-indigo-500">🏅</span>
            <span className="text-white font-semibold">{stats.badges}</span>
          </div>
          {stats.hasCrown && (
            <div className="flex items-center gap-1">
              <span className="text-purple-500">👑</span>
              <span className="text-white font-semibold">1</span>
            </div>
          )}
        </div>
      </div>

      {/* CTA Button */}
      <Link
        href="/progress/achievements"
        className="mt-4 block w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white text-center font-semibold transition-colors"
      >
        View All Achievements
      </Link>
    </motion.div>
  );
}
