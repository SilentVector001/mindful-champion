/**
 * Celebration Animations Library
 * 
 * Provides various celebration effects for training achievements:
 * - Confetti explosions
 * - Success animations
 * - Milestone celebrations
 * - Completion fanfare
 */

export type CelebrationType = 'day_complete' | 'milestone' | 'program_complete' | 'streak'

interface CelebrationConfig {
  duration: number
  particleCount: number
  spread: number
  origin: { x: number; y: number }
  colors: string[]
  emoji?: string[]
}

// Celebration configurations
const CELEBRATIONS: Record<CelebrationType, CelebrationConfig> = {
  day_complete: {
    duration: 2000,
    particleCount: 50,
    spread: 60,
    origin: { x: 0.5, y: 0.6 },
    colors: ['#10b981', '#14b8a6', '#06b6d4'],
    emoji: ['✅', '🎯', '💪']
  },
  milestone: {
    duration: 3000,
    particleCount: 100,
    spread: 80,
    origin: { x: 0.5, y: 0.5 },
    colors: ['#f59e0b', '#f97316', '#ef4444'],
    emoji: ['⭐', '🔥', '🏆']
  },
  program_complete: {
    duration: 4000,
    particleCount: 150,
    spread: 120,
    origin: { x: 0.5, y: 0.4 },
    colors: ['#8b5cf6', '#a855f7', '#d946ef', '#ec4899'],
    emoji: ['🏆', '🎉', '👏', '⭐', '🌟']
  },
  streak: {
    duration: 2500,
    particleCount: 75,
    spread: 70,
    origin: { x: 0.5, y: 0.5 },
    colors: ['#ef4444', '#f97316', '#f59e0b'],
    emoji: ['🔥', '⚡', '💥']
  }
}

/**
 * Create confetti particles using CSS animations
 */
function createConfettiParticles(config: CelebrationConfig) {
  const container = document.createElement('div')
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
    overflow: hidden;
  `

  const particleCount = config.particleCount
  const originX = config.origin.x * 100
  const originY = config.origin.y * 100

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div')
    const isEmoji = config.emoji && Math.random() > 0.7
    
    // Random properties
    const angle = Math.random() * config.spread - config.spread / 2
    const velocity = 50 + Math.random() * 100
    const rotation = Math.random() * 720 - 360
    const scale = 0.5 + Math.random() * 0.5
    const duration = config.duration * (0.8 + Math.random() * 0.4)

    if (isEmoji && config.emoji) {
      // Emoji particle
      const emoji = config.emoji[Math.floor(Math.random() * config.emoji.length)]
      particle.textContent = emoji
      particle.style.cssText = `
        position: absolute;
        left: ${originX}%;
        top: ${originY}%;
        font-size: ${20 + Math.random() * 20}px;
        pointer-events: none;
      `
    } else {
      // Color particle
      const color = config.colors[Math.floor(Math.random() * config.colors.length)]
      const shape = Math.random() > 0.5 ? '50%' : '0%'
      
      particle.style.cssText = `
        position: absolute;
        left: ${originX}%;
        top: ${originY}%;
        width: ${5 + Math.random() * 10}px;
        height: ${5 + Math.random() * 10}px;
        background: ${color};
        border-radius: ${shape};
        pointer-events: none;
      `
    }

    // Animation
    const angleRad = (angle * Math.PI) / 180
    const finalX = Math.cos(angleRad) * velocity
    const finalY = Math.sin(angleRad) * velocity - 100 // Gravity effect

    particle.animate(
      [
        {
          transform: `translate(0, 0) rotate(0deg) scale(${scale})`,
          opacity: 1
        },
        {
          transform: `translate(${finalX}px, ${finalY}px) rotate(${rotation}deg) scale(${scale})`,
          opacity: 0
        }
      ],
      {
        duration: duration,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }
    )

    container.appendChild(particle)
  }

  document.body.appendChild(container)

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(container)
  }, config.duration)
}

/**
 * Trigger a celebration animation
 */
export function celebrate(type: CelebrationType = 'day_complete') {
  const config = CELEBRATIONS[type]
  createConfettiParticles(config)

  // For program completion, add extra bursts
  if (type === 'program_complete') {
    setTimeout(() => {
      createConfettiParticles({
        ...config,
        origin: { x: 0.3, y: 0.6 }
      })
    }, 300)
    
    setTimeout(() => {
      createConfettiParticles({
        ...config,
        origin: { x: 0.7, y: 0.6 }
      })
    }, 600)
  }
}

/**
 * Celebrate day completion
 */
export function celebrateDayComplete() {
  celebrate('day_complete')
}

/**
 * Celebrate milestone achievement (25%, 50%, 75%)
 */
export function celebrateMilestone() {
  celebrate('milestone')
}

/**
 * Celebrate program completion
 */
export function celebrateProgramComplete() {
  celebrate('program_complete')
}

/**
 * Celebrate training streak
 */
export function celebrateStreak(days: number) {
  celebrate('streak')
  
  // Show streak message
  if (typeof window !== 'undefined') {
    const message = document.createElement('div')
    message.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #ef4444, #f97316);
      color: white;
      padding: 2rem 3rem;
      border-radius: 1rem;
      font-size: 1.5rem;
      font-weight: bold;
      z-index: 10000;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      animation: scaleIn 0.3s ease-out;
    `
    message.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">🔥</div>
        <div>${days} Day Streak!</div>
        <div style="font-size: 0.9rem; opacity: 0.9; margin-top: 0.5rem;">Keep the fire burning!</div>
      </div>
    `

    document.body.appendChild(message)

    setTimeout(() => {
      message.style.opacity = '0'
      message.style.transform = 'translate(-50%, -50%) scale(0.8)'
      message.style.transition = 'all 0.3s ease-out'
      setTimeout(() => {
        document.body.removeChild(message)
      }, 300)
    }, 2500)
  }
}

/**
 * Show achievement toast
 */
export function showAchievementToast(title: string, description: string, icon: string = '🎉') {
  if (typeof window === 'undefined') return

  const toast = document.createElement('div')
  toast.style.cssText = `
    position: fixed;
    top: 2rem;
    right: 2rem;
    background: linear-gradient(135deg, #10b981, #14b8a6);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 0.75rem;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideInRight 0.3s ease-out;
    max-width: 350px;
  `
  toast.innerHTML = `
    <div style="display: flex; align-items: start; gap: 1rem;">
      <div style="font-size: 2rem;">${icon}</div>
      <div style="flex: 1;">
        <div style="font-weight: 600; font-size: 1rem; margin-bottom: 0.25rem;">${title}</div>
        <div style="font-size: 0.875rem; opacity: 0.9;">${description}</div>
      </div>
    </div>
  `

  document.body.appendChild(toast)

  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transform = 'translateX(100%)'
    toast.style.transition = 'all 0.3s ease-out'
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 300)
  }, 3000)
}

// Add required CSS animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes scaleIn {
      from {
        transform: translate(-50%, -50%) scale(0.8);
        opacity: 0;
      }
      to {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
    }

    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `
  document.head.appendChild(style)
}
