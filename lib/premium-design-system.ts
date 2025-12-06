
/**
 * Mindful Champion Premium Design System
 * 
 * Enhanced branding guidelines and design tokens for the premium 
 * AI-powered training programs experience.
 */

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
  Sparkles,
  Brain,
  Zap,
  Eye,
  BarChart3,
  Users,
  Lightbulb,
  Crown,
  ChevronRight
} from "lucide-react"

// ============================================================================
// PREMIUM COLOR PALETTE
// ============================================================================
export const premiumColors = {
  // Primary Brand Colors
  champion: {
    green: "#2D5016",     // Deep sophisticated green
    darkGreen: "#1A3009", // Even darker for depth
    gold: "#D4AF37",      // Premium gold
    darkGold: "#B8941F",  // Darker gold for contrasts
    blue: "#1E40AF",      // Premium blue
    purple: "#7C3AED",    // Elite purple
  },

  // Gradient Combinations
  gradients: {
    primary: "from-[#2D5016] via-[#3A6B1C] to-[#4F8A23]",
    gold: "from-[#D4AF37] via-[#E6C757] to-[#F1D876]",
    elite: "from-[#7C3AED] via-[#8B5CF6] to-[#A78BFA]",
    premium: "from-[#2D5016] via-[#D4AF37] to-[#1E40AF]",
    success: "from-emerald-600 via-green-600 to-green-700",
    analytics: "from-blue-600 via-indigo-600 to-purple-600"
  },

  // Sophisticated Backgrounds  
  backgrounds: {
    hero: "bg-gradient-to-br from-gray-900 via-[#1A3009] to-gray-800",
    premium: "bg-gradient-to-br from-[#2D5016]/5 via-white to-[#D4AF37]/5",
    dashboard: "bg-gradient-to-br from-slate-50 via-white to-emerald-50/30",
    card: "bg-white/80 backdrop-blur-sm",
    accent: "bg-gradient-to-r from-[#2D5016]/10 to-[#D4AF37]/10"
  },

  // Status Colors
  status: {
    completed: { bg: "bg-emerald-500", text: "text-emerald-500", gradient: "from-emerald-500 to-green-600" },
    inProgress: { bg: "bg-[#1E40AF]", text: "text-[#1E40AF]", gradient: "from-[#1E40AF] to-blue-600" },
    paused: { bg: "bg-amber-500", text: "text-amber-500", gradient: "from-amber-500 to-yellow-600" },
    locked: { bg: "bg-gray-400", text: "text-gray-400", gradient: "from-gray-400 to-gray-500" }
  }
}

// ============================================================================
// PREMIUM TYPOGRAPHY
// ============================================================================
export const premiumTypography = {
  heading: {
    hero: "text-5xl md:text-7xl font-light tracking-tight",
    h1: "text-4xl md:text-6xl font-bold tracking-tight",
    h2: "text-3xl md:text-4xl font-bold tracking-tight", 
    h3: "text-2xl md:text-3xl font-semibold tracking-tight",
    h4: "text-xl md:text-2xl font-semibold",
    h5: "text-lg md:text-xl font-medium",
  },
  
  body: {
    lead: "text-xl md:text-2xl font-light text-gray-600 dark:text-gray-300",
    large: "text-lg text-gray-700 dark:text-gray-200",
    base: "text-base text-gray-600 dark:text-gray-300",
    small: "text-sm text-gray-500 dark:text-gray-400",
    tiny: "text-xs text-gray-400 dark:text-gray-500"
  },

  accents: {
    gradient: "bg-gradient-to-r from-[#2D5016] to-[#D4AF37] bg-clip-text text-transparent",
    highlight: "text-[#D4AF37] font-semibold"
  }
}

// ============================================================================
// PREMIUM SPACING & LAYOUT
// ============================================================================
export const premiumSpacing = {
  section: "py-16 md:py-24 lg:py-32",
  container: "container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl",
  card: "p-6 md:p-8 lg:p-10",
  cardCompact: "p-4 md:p-6",
  hero: "py-24 md:py-32 lg:py-40"
}

// ============================================================================
// PREMIUM ANIMATIONS
// ============================================================================
export const premiumAnimations = {
  // Sophisticated entrance animations
  heroReveal: {
    initial: { opacity: 0, y: 40, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.8 }
  },

  cardReveal: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  },

  staggerContainer: {
    animate: {
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  },

  staggerItem: {
    initial: { opacity: 0, y: 25 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  },

  // Hover animations
  cardHover: {
    whileHover: { 
      scale: 1.03, 
      y: -8,
      transition: { duration: 0.3 }
    }
  },

  buttonHover: {
    whileHover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    whileTap: { scale: 0.95 }
  },

  // Progress animations
  progressBar: {
    initial: { width: 0 },
    animate: { width: "100%" },
    transition: { duration: 1.5 }
  }
}

// ============================================================================
// SKILL LEVEL CONFIGURATIONS
// ============================================================================
export const skillLevelConfigs = {
  beginner: {
    icon: BookOpen,
    gradient: premiumColors.gradients.success,
    bg: "bg-emerald-500",
    text: "text-emerald-500",
    border: "border-emerald-500",
    badge: "bg-emerald-500 text-white",
    name: "Beginner",
    description: "Perfect for players just starting their pickleball journey"
  },
  
  intermediate: {
    icon: Target,
    gradient: premiumColors.gradients.analytics,
    bg: "bg-[#1E40AF]",
    text: "text-[#1E40AF]", 
    border: "border-[#1E40AF]",
    badge: "bg-[#1E40AF] text-white",
    name: "Intermediate",
    description: "Ideal for players ready to refine their technique and strategy"
  },

  advanced: {
    icon: Trophy,
    gradient: premiumColors.gradients.gold,
    bg: "bg-[#D4AF37]",
    text: "text-[#D4AF37]",
    border: "border-[#D4AF37]",
    badge: "bg-[#D4AF37] text-white",
    name: "Advanced",
    description: "For experienced players seeking competitive excellence"
  },

  elite: {
    icon: Crown,
    gradient: premiumColors.gradients.elite,
    bg: "bg-[#7C3AED]",
    text: "text-[#7C3AED]",
    border: "border-[#7C3AED]", 
    badge: "bg-[#7C3AED] text-white",
    name: "Elite",
    description: "Master-level training for tournament champions"
  }
}

// ============================================================================
// PREMIUM COMPONENT VARIANTS
// ============================================================================
export const componentVariants = {
  buttons: {
    primary: "bg-gradient-to-r from-[#2D5016] to-[#3A6B1C] hover:from-[#1A3009] hover:to-[#2D5016] text-white shadow-lg hover:shadow-xl transition-all duration-300",
    gold: "bg-gradient-to-r from-[#D4AF37] to-[#E6C757] hover:from-[#B8941F] hover:to-[#D4AF37] text-white shadow-lg hover:shadow-xl transition-all duration-300",
    elite: "bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white shadow-lg hover:shadow-xl transition-all duration-300",
    outline: "border-2 border-[#2D5016] text-[#2D5016] hover:bg-[#2D5016] hover:text-white transition-all duration-300"
  },

  cards: {
    premium: "bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl",
    featured: "bg-gradient-to-br from-white via-[#2D5016]/5 to-[#D4AF37]/5 border border-[#D4AF37]/20 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl",
    glass: "bg-white/70 backdrop-blur-md border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl"
  }
}

// ============================================================================
// PREMIUM ICON SETS
// ============================================================================
export const premiumIcons = {
  features: {
    ai: Brain,
    analytics: BarChart3,
    progress: TrendingUp,
    insights: Eye,
    community: Users,
    coaching: Lightbulb,
    achievement: Trophy,
    premium: Crown
  },

  actions: {
    play: Play,
    complete: CheckCircle2,
    start: Zap,
    continue: ChevronRight,
    upgrade: Sparkles,
    chevronRight: ChevronRight
  },

  metadata: {
    time: Clock,
    date: Calendar,
    video: Video,
    difficulty: Target,
    duration: Calendar
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
export function getSkillConfig(skillLevel: string) {
  const level = skillLevel?.toLowerCase() as keyof typeof skillLevelConfigs
  return skillLevelConfigs[level] || skillLevelConfigs.beginner
}

export function getStatusConfig(status: string) {
  const statusKey = status?.toLowerCase().replace('_', '') as keyof typeof premiumColors.status
  return premiumColors.status[statusKey as keyof typeof premiumColors.status] || premiumColors.status.locked
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
}

export function calculateProgress(current: number, total: number): number {
  if (total === 0) return 0
  return Math.round((current / total) * 100)
}

// ============================================================================
// PREMIUM BACKGROUNDS URLS
// ============================================================================
export const premiumBackgrounds = {
  hero: "https://cdn.abacus.ai/images/5c3da3a1-4337-4185-be7a-c8b9ab238036.jpg",
  journey: "https://cdn.abacus.ai/images/b0a989d8-6f3a-49cc-aa2b-1e9cedb57900.jpg", 
  achievements: "https://cdn.abacus.ai/images/ffad52df-eb00-41b8-80d2-6ccc7ca48735.jpg",
  analytics: "https://cdn.abacus.ai/images/8d31393a-524d-4919-93c9-7c9a89d733fc.jpg",
  equipment: "https://cdn.abacus.ai/images/6c0a0412-873b-4091-a259-93ad7161d2a9.jpg",
  aiCoach: "https://cdn.abacus.ai/images/b3ecaea1-f9f7-4a00-8789-023d93ecbc6e.jpg"
}

export default {
  colors: premiumColors,
  typography: premiumTypography,
  spacing: premiumSpacing,
  animations: premiumAnimations,
  skillLevels: skillLevelConfigs,
  components: componentVariants,
  icons: premiumIcons,
  backgrounds: premiumBackgrounds,
  getSkillConfig,
  getStatusConfig,
  formatDuration,
  calculateProgress
}
