
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Sparkles, Brain, MessageCircle } from 'lucide-react';

interface InteractiveAvatarProps {
  state: 'idle' | 'listening' | 'thinking' | 'speaking';
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatusIndicator?: boolean;
  message?: string;
}

const sizeMap = {
  sm: { container: 120, avatar: 96 },
  md: { container: 160, avatar: 128 },
  lg: { container: 200, avatar: 160 },
  xl: { container: 280, avatar: 224 }
};

export default function InteractiveAvatar({
  state = 'idle',
  avatarUrl,
  size = 'lg',
  showStatusIndicator = true,
  message
}: InteractiveAvatarProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const dimensions = sizeMap[size];

  // Generate floating particles during thinking state
  useEffect(() => {
    if (state === 'thinking') {
      const interval = setInterval(() => {
        setParticles(prev => [
          ...prev.slice(-5),
          {
            id: Date.now(),
            x: Math.random() * 100 - 50,
            y: Math.random() * 100 - 50
          }
        ]);
      }, 300);
      return () => clearInterval(interval);
    } else {
      setParticles([]);
    }
  }, [state]);

  // Pulse animation based on state
  const getPulseAnimation = (): any => {
    switch (state) {
      case 'listening':
        return {
          scale: [1, 1.05, 1],
          opacity: [0.6, 0.9, 0.6],
          transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
        };
      case 'thinking':
        return {
          scale: [1, 1.08, 1],
          rotate: [0, 5, 0, -5, 0],
          transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
        };
      case 'speaking':
        return {
          scale: [1, 1.03, 1, 1.03, 1],
          transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
        };
      default:
        return {
          scale: 1,
          transition: { duration: 0.5 }
        };
    }
  };

  // Glow ring animation
  const getRingAnimation = () => {
    switch (state) {
      case 'listening':
        return {
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
          borderColor: ['rgba(34, 197, 94, 0.3)', 'rgba(34, 197, 94, 0.8)', 'rgba(34, 197, 94, 0.3)']
        };
      case 'thinking':
        return {
          scale: [1, 1.15, 1],
          opacity: [0.4, 0.7, 0.4],
          borderColor: ['rgba(147, 51, 234, 0.4)', 'rgba(147, 51, 234, 0.9)', 'rgba(147, 51, 234, 0.4)']
        };
      case 'speaking':
        return {
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
          borderColor: ['rgba(59, 130, 246, 0.5)', 'rgba(59, 130, 246, 1)', 'rgba(59, 130, 246, 0.5)']
        };
      default:
        return {
          scale: 1,
          opacity: 0.2,
          borderColor: 'rgba(100, 116, 139, 0.2)'
        };
    }
  };

  const getStatusColor = () => {
    switch (state) {
      case 'listening': return 'bg-green-500';
      case 'thinking': return 'bg-purple-500';
      case 'speaking': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (state) {
      case 'listening': return <MessageCircle className="w-4 h-4" />;
      case 'thinking': return <Brain className="w-4 h-4" />;
      case 'speaking': return <Sparkles className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusText = () => {
    switch (state) {
      case 'listening': return 'Listening...';
      case 'thinking': return 'Analyzing...';
      case 'speaking': return 'Responding...';
      default: return 'Ready';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Container */}
      <div 
        className="relative flex items-center justify-center"
        style={{ width: dimensions.container, height: dimensions.container }}
      >
        {/* Animated Glow Rings */}
        <motion.div
          className="absolute inset-0 rounded-full border-4"
          animate={getRingAnimation()}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        
        <motion.div
          className="absolute inset-2 rounded-full border-2"
          animate={getRingAnimation()}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          style={{ opacity: 0.5 }}
        />

        {/* Thinking Particles */}
        <AnimatePresence>
          {particles.map(particle => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 bg-purple-400 rounded-full"
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={{
                x: particle.x,
                y: particle.y,
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: 'easeOut' }}
            />
          ))}
        </AnimatePresence>

        {/* Avatar Image */}
        <motion.div
          className="relative rounded-full overflow-hidden shadow-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-1"
          style={{ width: dimensions.avatar, height: dimensions.avatar }}
          animate={getPulseAnimation()}
        >
          {avatarUrl ? (
            <div className="relative w-full h-full rounded-full overflow-hidden bg-white">
              <Image
                src={avatarUrl}
                alt="Coach Kai Avatar"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-5xl shadow-inner">
              <motion.div
                animate={{
                  scale: state === 'speaking' ? [1, 1.1, 1] : 1
                }}
                transition={{ duration: 0.5, repeat: state === 'speaking' ? Infinity : 0 }}
              >
                K
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Status Indicator Badge */}
        {showStatusIndicator && (
          <motion.div
            className={`absolute bottom-2 right-2 ${getStatusColor()} rounded-full p-3 shadow-lg`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <motion.div
              animate={{
                rotate: state === 'thinking' ? 360 : 0
              }}
              transition={{
                duration: 2,
                repeat: state === 'thinking' ? Infinity : 0,
                ease: 'linear'
              }}
              className="text-white"
            >
              {getStatusIcon()}
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Status Text */}
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-center"
        >
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {getStatusText()}
          </p>
          {message && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs"
            >
              {message}
            </motion.p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Ambient Light Effect */}
      <motion.div
        className="absolute inset-0 -z-10 blur-3xl opacity-30"
        animate={{
          background: state === 'listening' 
            ? 'radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, transparent 70%)'
            : state === 'thinking'
            ? 'radial-gradient(circle, rgba(147, 51, 234, 0.3) 0%, transparent 70%)'
            : state === 'speaking'
            ? 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(100, 116, 139, 0.1) 0%, transparent 70%)'
        }}
        transition={{ duration: 1 }}
      />
    </div>
  );
}
