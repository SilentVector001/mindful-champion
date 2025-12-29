
/**
 * Unified Design System for Media & Tournament Pages
 * Dark theme with vibrant accents for immersive viewing experience
 */

export const mediaDesignTokens = {
  // Dark, immersive backgrounds
  backgrounds: {
    primary: 'bg-slate-900',
    secondary: 'bg-slate-800',
    accent: 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900',
    card: 'bg-slate-800/80',
    hover: 'hover:bg-slate-800/90',
  },
  
  // Rounded corners - no more boxy!
  radius: {
    sm: 'rounded-xl',
    md: 'rounded-2xl',
    lg: 'rounded-3xl',
    full: 'rounded-full',
  },
  
  // Enhanced shadows with color for dark theme
  shadows: {
    sm: 'shadow-sm shadow-slate-950/50',
    md: 'shadow-md shadow-slate-950/60 hover:shadow-xl hover:shadow-slate-950/70',
    lg: 'shadow-lg shadow-slate-950/70 hover:shadow-2xl hover:shadow-slate-950/80',
    card: 'shadow-md shadow-slate-950/60 hover:shadow-xl hover:shadow-slate-950/70 transition-shadow duration-300',
  },
  
  // Vibrant accent colors that pop on dark backgrounds
  colors: {
    primary: {
      text: 'text-teal-400',
      bg: 'bg-teal-500',
      border: 'border-teal-500',
      gradient: 'from-teal-500 to-cyan-500',
    },
    live: {
      text: 'text-red-400',
      bg: 'bg-red-500',
      badge: 'bg-gradient-to-r from-red-500 to-pink-500',
    },
    success: {
      text: 'text-green-400',
      bg: 'bg-green-500',
      light: 'bg-green-900/30',
    },
    info: {
      text: 'text-blue-400',
      bg: 'bg-blue-500',
      light: 'bg-blue-900/30',
    },
  },
  
  // Generous spacing
  spacing: {
    section: 'py-12 px-6',
    card: 'p-6',
    tight: 'p-4',
  },
  
  // Borders for dark theme
  borders: {
    light: 'border border-slate-700',
    accent: 'border-2 border-teal-500/30',
    hover: 'hover:border-teal-500/50',
  },
};

// Helper functions
export const getCardClasses = (variant: 'default' | 'accent' | 'hover' = 'default') => {
  const base = `${mediaDesignTokens.backgrounds.card} ${mediaDesignTokens.radius.md} ${mediaDesignTokens.borders.light}`;
  
  switch (variant) {
    case 'accent':
      return `${base} ${mediaDesignTokens.shadows.lg} ${mediaDesignTokens.borders.accent}`;
    case 'hover':
      return `${base} ${mediaDesignTokens.shadows.card} ${mediaDesignTokens.borders.hover}`;
    default:
      return `${base} ${mediaDesignTokens.shadows.sm}`;
  }
};

export const getBadgeClasses = (type: 'live' | 'upcoming' | 'success' | 'info' | 'default') => {
  const base = `inline-flex items-center gap-1 px-3 py-1 ${mediaDesignTokens.radius.full} text-xs font-semibold`;
  
  switch (type) {
    case 'live':
      return `${base} ${mediaDesignTokens.colors.live.badge} text-white animate-pulse`;
    case 'upcoming':
      return `${base} ${mediaDesignTokens.colors.info.light} ${mediaDesignTokens.colors.info.text}`;
    case 'success':
      return `${base} ${mediaDesignTokens.colors.success.light} ${mediaDesignTokens.colors.success.text}`;
    case 'info':
      return `${base} ${mediaDesignTokens.colors.info.light} ${mediaDesignTokens.colors.info.text}`;
    default:
      return `${base} bg-slate-700 text-slate-300`;
  }
};

export const getButtonClasses = (variant: 'primary' | 'secondary' | 'outline' = 'primary') => {
  const base = `inline-flex items-center justify-center gap-2 px-6 py-3 ${mediaDesignTokens.radius.full} font-semibold transition-all duration-300`;
  
  switch (variant) {
    case 'primary':
      return `${base} bg-gradient-to-r ${mediaDesignTokens.colors.primary.gradient} text-white hover:shadow-lg hover:scale-105`;
    case 'secondary':
      return `${base} bg-slate-700 ${mediaDesignTokens.colors.primary.text} ${mediaDesignTokens.borders.light} hover:bg-slate-600`;
    case 'outline':
      return `${base} bg-transparent border-2 ${mediaDesignTokens.colors.primary.border} ${mediaDesignTokens.colors.primary.text} hover:bg-slate-800`;
    default:
      return base;
  }
};
