'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, Medal, Shield, Crown, Star, X, Share2, Eye } from 'lucide-react';
import Link from 'next/link';

interface Achievement {
  id: string;
  name: string;
  description: string;
  tier: string;
  category: string;
  icon: string;
  points: number;
}

interface AchievementNotificationProps {
  achievements: Achievement[];
  onClose: () => void;
  onDismiss: (achievementId: string) => void;
}

const tierColors = {
  BRONZE: { bg: 'bg-gradient-to-br from-amber-700 to-amber-900', text: 'text-amber-300', glow: 'shadow-amber-700/50' },
  SILVER: { bg: 'bg-gradient-to-br from-gray-400 to-gray-600', text: 'text-gray-200', glow: 'shadow-gray-400/50' },
  GOLD: { bg: 'bg-gradient-to-br from-yellow-500 to-yellow-700', text: 'text-yellow-100', glow: 'shadow-yellow-500/50' },
  BADGE: { bg: 'bg-gradient-to-br from-indigo-600 to-indigo-800', text: 'text-indigo-200', glow: 'shadow-indigo-600/50' },
  CROWN: { bg: 'bg-gradient-to-br from-purple-600 to-purple-900', text: 'text-purple-200', glow: 'shadow-purple-600/50' },
};

export default function AchievementNotification({
  achievements,
  onClose,
  onDismiss,
}: AchievementNotificationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const currentAchievement = achievements[currentIndex];

  useEffect(() => {
    if (currentAchievement) {
      // Trigger confetti animation
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [currentAchievement]);

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

  const handleNext = () => {
    if (currentIndex < achievements.length - 1) {
      onDismiss(currentAchievement.id);
      setCurrentIndex(currentIndex + 1);
    } else {
      onDismiss(currentAchievement.id);
      setIsVisible(false);
      setTimeout(onClose, 300);
    }
  };

  const handleShare = () => {
    // Share achievement (could integrate with social media APIs)
    const text = `I just unlocked "${currentAchievement.name}" in Mindful Champion! 🏆`;
    if (navigator.share) {
      navigator
        .share({
          title: 'Achievement Unlocked!',
          text,
        })
        .catch(() => {});
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text);
    }
  };

  if (!currentAchievement) return null;

  const Icon = getIcon(currentAchievement.tier);
  const colors = tierColors[currentAchievement.tier as keyof typeof tierColors];

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 50 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative max-w-lg w-full"
          >
            {/* Close button */}
            <button
              onClick={handleNext}
              className="absolute -top-4 -right-4 p-2 bg-gray-800 rounded-full text-white hover:bg-gray-700 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Main card */}
            <div
              className={`
                ${colors.bg} ${colors.glow} shadow-2xl
                rounded-2xl p-8 text-center
              `}
            >
              {/* Header */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mb-6"
              >
                <div className="inline-flex items-center gap-2 text-white/90 text-sm font-semibold mb-2">
                  <Star className="w-4 h-4" />
                  <span>ACHIEVEMENT UNLOCKED</span>
                  <Star className="w-4 h-4" />
                </div>
              </motion.div>

              {/* Icon with pulse animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
                className="mb-6"
              >
                <div className="relative inline-block">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="relative z-10"
                  >
                    <div className="p-8 bg-white/10 rounded-full backdrop-blur-sm">
                      <Icon className="w-24 h-24 text-white" />
                    </div>
                  </motion.div>

                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl animate-pulse" />
                </div>
              </motion.div>

              {/* Achievement name */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-4xl font-bold text-white mb-3"
              >
                {currentAchievement.name}
              </motion.h2>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-lg text-white/80 mb-6"
              >
                {currentAchievement.description}
              </motion.p>

              {/* Points */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-2 text-white mb-8"
              >
                <Star className="w-6 h-6 fill-white" />
                <span className="text-2xl font-bold">+{currentAchievement.points} Points</span>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex gap-3 justify-center"
              >
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-white font-semibold transition-all"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>

                <Link
                  href="/progress/achievements"
                  className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-white/90 rounded-xl text-gray-900 font-semibold transition-all"
                >
                  <Eye className="w-5 h-5" />
                  View Gallery
                </Link>
              </motion.div>

              {/* Progress indicator */}
              {achievements.length > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-6 pt-6 border-t border-white/20"
                >
                  <div className="flex items-center justify-center gap-2">
                    {achievements.map((_, index) => (
                      <div
                        key={index}
                        className={`
                          h-2 rounded-full transition-all
                          ${index === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/30'}
                        `}
                      />
                    ))}
                  </div>
                  <p className="text-white/60 text-sm mt-2">
                    {currentIndex + 1} of {achievements.length} achievements
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
