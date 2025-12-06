
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Home,
  Target,
  TrendingUp,
  Users,
  Settings,
  Trophy,
  Crown,
  Menu,
  X,
  PlayCircle
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import Image from "next/image"

const navigationItems = [
  {
    name: 'Home',
    href: '/dashboard',
    icon: Home,
    description: 'Dashboard & daily focus',
    gradient: 'from-teal-500 to-orange-500'
  },
  {
    name: 'Train',
    href: '/train',
    icon: Target,
    description: 'Drills, video analysis & practice',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    name: 'Media',
    href: '/media-center',
    icon: PlayCircle,
    description: 'Videos, podcasts & news',
    gradient: 'from-red-500 to-orange-500'
  },
  {
    name: 'Progress',
    href: '/progress',
    icon: TrendingUp,
    description: 'Performance stats & insights',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    name: 'Connect',
    href: '/connect',
    icon: Users,
    description: 'Partners, matches & community',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Profile, avatar & preferences',
    gradient: 'from-slate-500 to-slate-600'
  },
]

interface SimplifiedNavProps {
  className?: string
}

export default function SimplifiedNav({ className }: SimplifiedNavProps) {
  const { data: session } = useSession() || {}
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const userData = session?.user as any

  const getActiveIndex = () => {
    if (pathname?.includes('/train')) return 1
    if (pathname?.includes('/media-center')) return 2
    if (pathname?.includes('/progress')) return 3  
    if (pathname?.includes('/connect')) return 4
    if (pathname?.includes('/settings')) return 5
    return 0 // Home/Dashboard
  }

  const activeIndex = getActiveIndex()

  return (
    <>
      {/* Desktop Navigation */}
      <nav className={cn("sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-slate-200", className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-orange-600 bg-clip-text text-transparent">
                Mindful Champion
              </span>
            </Link>

            {/* Desktop Navigation Items */}
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item, index) => {
                const isActive = index === activeIndex
                const Icon = item.icon
                
                return (
                  <Link key={item.name} href={item.href}>
                    <motion.div
                      whileHover={{ y: -2 }}
                      whileTap={{ y: 0 }}
                      className="relative"
                    >
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "relative h-12 px-4 flex flex-col items-center gap-1 transition-all",
                          isActive
                            ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-xs font-medium">{item.name}</span>
                      </Button>
                      
                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className={`absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gradient-to-r ${item.gradient} rounded-full`}
                          transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                        />
                      )}
                    </motion.div>
                  </Link>
                )
              })}
            </div>

            {/* User Profile & Actions */}
            <div className="flex items-center gap-4">
              {/* Trial Status */}
              {userData?.isTrialActive && (
                <Badge variant="outline" className="hidden sm:flex border-orange-200 text-orange-700">
                  <Crown className="h-3 w-3 mr-1" />
                  Trial Active
                </Badge>
              )}
              
              {/* Subscription Tier */}
              <Badge 
                className={cn(
                  "hidden sm:flex",
                  userData?.subscriptionTier === 'PRO' 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : userData?.subscriptionTier === 'PREMIUM'
                    ? 'bg-gradient-to-r from-teal-500 to-orange-500 text-white'
                    : 'bg-slate-500 text-white'
                )}
              >
                {userData?.subscriptionTier || 'FREE'} Champion
              </Badge>

              {/* User Avatar */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium text-slate-900">
                    {userData?.firstName || 'Champion'}
                  </span>
                  <span className="text-xs text-slate-500">
                    Rating: {userData?.playerRating || '2.0'}
                  </span>
                </div>
                
                <div className="relative">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-200">
                    {userData?.avatarPhotoUrl ? (
                      <Image
                        src={userData.avatarPhotoUrl}
                        alt={userData.firstName || 'User'}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-teal-500 to-orange-500 flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {(userData?.firstName || 'U')[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Online indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                </div>
              </div>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-teal-600 to-orange-600 bg-clip-text text-transparent">
                  Mindful Champion
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* User Info */}
            <div className="p-6 border-b bg-gradient-to-r from-teal-50 to-orange-50">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-lg">
                  {userData?.avatarPhotoUrl ? (
                    <Image
                      src={userData.avatarPhotoUrl}
                      alt={userData.firstName || 'User'}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-teal-500 to-orange-500 flex items-center justify-center">
                      <span className="text-white font-semibold text-xl">
                        {(userData?.firstName || 'U')[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">
                    {userData?.firstName || 'Champion'}
                  </div>
                  <div className="text-sm text-slate-600">
                    Rating: {userData?.playerRating || '2.0'}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge className={cn(
                      userData?.subscriptionTier === 'PRO' 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                        : userData?.subscriptionTier === 'PREMIUM'
                        ? 'bg-gradient-to-r from-teal-500 to-orange-500 text-white'
                        : 'bg-slate-500 text-white'
                    )}>
                      {userData?.subscriptionTier || 'FREE'}
                    </Badge>
                    {userData?.isTrialActive && (
                      <Badge variant="outline" className="border-orange-200 text-orange-700">
                        <Crown className="h-3 w-3 mr-1" />
                        Trial
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Items */}
            <div className="p-6 space-y-2">
              {navigationItems.map((item, index) => {
                const isActive = index === activeIndex
                const Icon = item.icon
                
                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg transition-all",
                        isActive
                          ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg`
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      )}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className={cn(
                          "text-sm",
                          isActive ? "text-white/80" : "text-slate-500"
                        )}>
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Sign Out */}
            <div className="p-6 pt-0">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2"
                onClick={() => signOut()}
              >
                <Settings className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}
