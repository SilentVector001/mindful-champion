'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressRingProps {
  progress: number
  size?: number
  strokeWidth?: number
  className?: string
  showPercentage?: boolean
  color?: 'cyan' | 'emerald' | 'orange' | 'purple'
  children?: React.ReactNode
}

const colorGradients = {
  cyan: ['#06b6d4', '#0ea5e9'],
  emerald: ['#10b981', '#059669'],
  orange: ['#f97316', '#ea580c'],
  purple: ['#a855f7', '#7c3aed'],
}

export default function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  className,
  showPercentage = true,
  color = 'cyan',
  children
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (Math.min(progress, 100) / 100) * circumference
  const gradientId = `progress-gradient-${color}-${size}`
  const [color1, color2] = colorGradients[color]

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-slate-700"
        />
        
        {/* Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        
        {/* Gradient Definition */}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color1} />
            <stop offset="100%" stopColor={color2} />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children ? children : (
          showPercentage && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-2xl font-bold text-white"
            >
              {Math.round(progress)}%
            </motion.span>
          )
        )}
      </div>
      
      {/* Glow Effect */}
      {progress > 0 && (
        <motion.div
          className={cn(
            "absolute inset-0 rounded-full opacity-20 blur-xl",
            color === 'cyan' && "bg-cyan-500",
            color === 'emerald' && "bg-emerald-500",
            color === 'orange' && "bg-orange-500",
            color === 'purple' && "bg-purple-500"
          )}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.2 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </div>
  )
}
