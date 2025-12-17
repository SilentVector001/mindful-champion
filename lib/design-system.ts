
/**
 * Mindful Champion Design System
 * 
 * Centralized design tokens, constants, and utilities for consistent branding
 * across the entire application.
 * 
 * This ensures:
 * - Consistent colors, spacing, typography
 * - Reusable animation variants
 * - Standardized UI patterns
 * - Easy maintenance and scalability
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================
export const colors = {
  champion: {
    green: "hsl(142, 76%, 36%)",
    blue: "hsl(210, 100%, 50%)",
    gold: "hsl(45, 100%, 51%)",
    red: "hsl(0, 84%, 60%)"
  },
  
  skill: {
    beginner: {
      from: "from-champion-green",
      to: "to-emerald-600",
      gradient: "from-champion-green to-emerald-600",
      bg: "bg-champion-green",
      text: "text-champion-green",
      border: "border-champion-green"
    },
    intermediate: {
      from: "from-champion-blue",
      to: "to-cyan-600",
      gradient: "from-champion-blue to-cyan-600",
      bg: "bg-champion-blue",
      text: "text-champion-blue",
      border: "border-champion-blue"
    },
    advanced: {
      from: "from-champion-gold",
      to: "to-amber-600",
      gradient: "from-champion-gold to-amber-600",
      bg: "bg-champion-gold",
      text: "text-champion-gold",
      border: "border-champion-gold"
    },
    elite: {
      from: "from-purple-600",
      to: "to-violet-600",
      gradient: "from-purple-600 to-violet-600",
      bg: "bg-purple-600",
      text: "text-purple-600",
      border: "border-purple-600"
    }
  },

  semantic: {
    success: "bg-champion-green",
    warning: "bg-yellow-500",
    error: "bg-red-500",
    info: "bg-champion-blue"
  }
}

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================
export const animations = {
  // Fade in from bottom
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },

  // Fade in from right
  fadeInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  },

  // Scale in
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  },

  // Staggered children
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  },

  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  }
}

// ============================================================================
// TYPOGRAPHY
// ============================================================================
export const typography = {
  heading: {
    h1: "text-4xl md:text-5xl font-bold",
    h2: "text-3xl md:text-4xl font-bold",
    h3: "text-2xl md:text-3xl font-bold",
    h4: "text-xl md:text-2xl font-bold",
    h5: "text-lg md:text-xl font-semibold",
    h6: "text-base md:text-lg font-semibold"
  },

  body: {
    large: "text-lg",
    base: "text-base",
    small: "text-sm",
    tiny: "text-xs"
  }
}

// ============================================================================
// SPACING
// ============================================================================
export const spacing = {
  section: "py-12 md:py-16 lg:py-24",
  container: "container mx-auto px-4 max-w-7xl",
  card: "p-4 md:p-6",
  compact: "p-2 md:p-4"
}

// ============================================================================
// ICONS
// ============================================================================
import {
  BookOpen,
  Target,
  Trophy,
  Award,
  Play,
  CheckCircle2,
  TrendingUp,
  Flame,
  Star,
  Calendar,
  Clock,
  Video,
  Sparkles
} from "lucide-react"

export const icons = {
  skill: {
    beginner: BookOpen,
    intermediate: Target,
    advanced: Trophy,
    elite: Award
  },

  action: {
    play: Play,
    complete: CheckCircle2,
    trending: TrendingUp,
    flame: Flame,
    star: Star
  },

  meta: {
    calendar: Calendar,
    clock: Clock,
    video: Video,
    sparkles: Sparkles
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get skill level configuration with colors, icons, and gradients
 */
export function getSkillLevelConfig(skillLevel: string) {
  const level = skillLevel?.toLowerCase() as keyof typeof colors.skill
  const config = colors.skill[level] || colors.skill.beginner
  const icon = icons.skill[level] || icons.skill.beginner

  return {
    ...config,
    icon,
    badge: `${config.bg} text-white`
  }
}

/**
 * Format time in seconds to MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format date to relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return date.toLocaleDateString()
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(current: number, total: number): number {
  if (total === 0) return 0
  return Math.round((current / total) * 100)
}

/**
 * Get status badge configuration
 */
export function getStatusConfig(status: string) {
  const statusConfigs = {
    completed: {
      variant: "success" as const,
      label: "Completed",
      icon: icons.action.complete,
      className: "bg-champion-green text-white"
    },
    in_progress: {
      variant: "info" as const,
      label: "In Progress",
      icon: icons.action.play,
      className: "bg-champion-blue text-white"
    },
    paused: {
      variant: "warning" as const,
      label: "Paused",
      icon: icons.action.star,
      className: "bg-yellow-500 text-white"
    },
    not_started: {
      variant: "default" as const,
      label: "Not Started",
      icon: icons.action.star,
      className: "bg-gray-500 text-white"
    }
  }

  return statusConfigs[status as keyof typeof statusConfigs] || statusConfigs.not_started
}

// ============================================================================
// EXPORT ALL
// ============================================================================
export default {
  colors,
  animations,
  typography,
  spacing,
  icons,
  getSkillLevelConfig,
  formatTime,
  formatRelativeTime,
  calculateProgress,
  getStatusConfig
}
