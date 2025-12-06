'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Award, Gift, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TierUnlockCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  tierData: {
    tierDisplayName: string;
    tierIcon: string;
    tierColor: string;
    pointsAtUnlock: number;
    benefits: string[];
    nextTierName?: string;
    nextTierPoints?: number;
  };
}

export default function TierUnlockCelebration({ isOpen, onClose, tierData }: TierUnlockCelebrationProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; y: number; rotation: number; delay: number; color: string }>>([]);

  useEffect(() => {
    if (isOpen) {
      // Generate confetti particles
      const particles = Array.from({ length: 80 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -20 - Math.random() * 30,
        rotation: Math.random() * 360,
        delay: Math.random() * 0.5,
        color: ['#FFD700', '#FFC700', '#FF6B6B', '#4ECDC4', '#45B7D1', tierData.tierColor][Math.floor(Math.random() * 6)]
      }));
      setConfetti(particles);
    }
  }, [isOpen, tierData.tierColor]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />

          {/* Confetti */}
          <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            {confetti?.map?.((particle) => (
              <motion.div
                key={particle?.id}
                initial={{
                  x: `${particle?.x ?? 50}vw`,
                  y: `${particle?.y ?? -20}vh`,
                  rotate: particle?.rotation ?? 0,
                  opacity: 0,
                }}
                animate={{
                  y: '120vh',
                  rotate: (particle?.rotation ?? 0) + 720,
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  delay: particle?.delay ?? 0,
                  ease: 'easeOut',
                }}
                style={{
                  position: 'absolute',
                  width: '10px',
                  height: '10px',
                  backgroundColor: particle?.color ?? '#FFD700',
                  borderRadius: '2px',
                }}
              />
            ))}
          </div>

          {/* Celebration Modal */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-[95%] max-w-lg"
          >
            <div 
              className="relative bg-white rounded-3xl shadow-2xl overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${tierData?.tierColor ?? '#FFD700'}15 0%, ${tierData?.tierColor ?? '#FFD700'}25 100%)`
              }}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white shadow-lg transition-all z-10"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>

              {/* Header with Icon */}
              <div 
                className="relative pt-12 pb-8 px-8 text-center overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${tierData?.tierColor ?? '#FFD700'} 0%, ${tierData?.tierColor ?? '#FFD700'}dd 100%)`
                }}
              >
                {/* Sparkle Effect */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-8 right-8 text-white/30"
                >
                  <Sparkles className="w-8 h-8" />
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, delay: 0.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute bottom-8 left-8 text-white/30"
                >
                  <Sparkles className="w-8 h-8" />
                </motion.div>

                {/* Main Icon with Bounce */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: 'spring', 
                    stiffness: 200, 
                    damping: 10,
                    delay: 0.2 
                  }}
                  className="text-8xl mb-4"
                >
                  {tierData?.tierIcon ?? '🏆'}
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-4xl font-bold text-white mb-2 drop-shadow-lg"
                >
                  Congratulations!
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-xl text-white/95 font-semibold"
                >
                  You've unlocked
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, type: 'spring' }}
                  className="text-3xl font-bold text-white mt-2"
                >
                  {tierData?.tierDisplayName ?? 'New Tier'}
                </motion.p>
              </div>

              {/* Content */}
              <div className="p-8 bg-white">
                {/* Points Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center justify-center gap-2 mb-6 p-4 rounded-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${tierData?.tierColor ?? '#FFD700'}20 0%, ${tierData?.tierColor ?? '#FFD700'}30 100%)`
                  }}
                >
                  <Award className="w-6 h-6" style={{ color: tierData?.tierColor ?? '#FFD700' }} />
                  <span className="text-2xl font-bold" style={{ color: tierData?.tierColor ?? '#FFD700' }}>
                    {tierData?.pointsAtUnlock?.toLocaleString?.() ?? 0} Points
                  </span>
                </motion.div>

                {/* Benefits */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mb-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Gift className="w-5 h-5" style={{ color: tierData?.tierColor ?? '#FFD700' }} />
                    <h3 className="text-lg font-bold text-gray-900">Your New Benefits</h3>
                  </div>
                  <div className="space-y-3">
                    {tierData?.benefits?.map?.((benefit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        className="flex items-start gap-3 text-gray-700"
                      >
                        <span 
                          className="text-xl flex-shrink-0 mt-0.5"
                          style={{ color: tierData?.tierColor ?? '#FFD700' }}
                        >
                          ✓
                        </span>
                        <span className="text-sm leading-relaxed">{benefit}</span>
                      </motion.div>
                    )) ?? null}
                  </div>
                </motion.div>

                {/* Next Tier Progress */}
                {tierData?.nextTierName && tierData?.nextTierPoints && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-l-4 border-purple-500"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
                        Next Challenge
                      </span>
                    </div>
                    <p className="text-sm text-purple-900">
                      <strong>{((tierData?.nextTierPoints ?? 0) - (tierData?.pointsAtUnlock ?? 0))?.toLocaleString?.() ?? 0} more points</strong> until{' '}
                      <strong>{tierData?.nextTierName ?? ''}</strong> tier!
                    </p>
                  </motion.div>
                )}

                {/* CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 }}
                >
                  <Button
                    onClick={onClose}
                    className="w-full h-12 text-lg font-bold rounded-xl shadow-lg transition-all hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${tierData?.tierColor ?? '#FFD700'} 0%, ${tierData?.tierColor ?? '#FFD700'}dd 100%)`,
                      color: '#ffffff'
                    }}
                  >
                    🎁 Explore Rewards
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
