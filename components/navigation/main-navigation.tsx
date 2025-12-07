

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import {
  Trophy,
  Home,
  Dumbbell,
  TrendingUp,
  Users,
  ChevronDown,
  Video,
  Library,
  Calendar,
  Target,
  BarChart3,
  Award,
  History,
  UserSearch,
  MessageCircle,
  User,
  Settings,
  Crown,
  Shield,
  LogOut,
  HelpCircle,
  Sparkles,
  Menu,
  ChevronRight,
  Mail,
  PlayCircle,
  Watch,
  Activity,
  Bell,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface MainNavigationProps {
  user: any
}

export default function MainNavigation({ user }: MainNavigationProps) {
  const pathname = usePathname()
  const { data: session } = useSession() || {}
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isApprovedSponsor, setIsApprovedSponsor] = useState(false)
  const [rewardPoints, setRewardPoints] = useState<number>(user?.rewardPoints || 0)

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path)

  // Check if user is an approved sponsor
  useEffect(() => {
    const checkSponsorStatus = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/sponsors/profile')
          if (response.ok) {
            const data = await response.json()
            setIsApprovedSponsor(data.sponsorProfile?.isApproved === true)
          }
        } catch (error) {
          // Silently fail - user is not a sponsor
          setIsApprovedSponsor(false)
        }
      }
    }
    checkSponsorStatus()
  }, [session?.user?.id])

  // Fetch and update reward points
  useEffect(() => {
    const fetchPoints = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/rewards/user-stats')
          if (response.ok) {
            const data = await response.json()
            setRewardPoints(data?.stats?.rewardPoints || 0)
          }
        } catch (error) {
          console.error('Failed to fetch reward points:', error)
        }
      }
    }
    
    // Fetch initial points
    fetchPoints()
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchPoints, 30000)
    
    return () => clearInterval(interval)
  }, [session?.user?.id, pathname])

  const handleSignOut = async () => {
    // Sign out and forcefully redirect to the landing page (features page)
    // Use redirect: false to handle the redirect manually for better control
    await signOut({ redirect: false })
    
    // Force a hard redirect to the root page to ensure features page loads
    window.location.href = "/"
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <header 
        className="sticky top-0 z-[60] w-full backdrop-blur-xl bg-white dark:bg-champion-charcoal border-b border-gray-200 dark:border-champion-green/10 shadow-md ios-safe-area-top"
        style={{
          WebkitBackdropFilter: 'blur(20px)',
          WebkitTransform: 'translate3d(0,0,0)', // Force hardware acceleration on iOS
          transform: 'translate3d(0,0,0)',
          willChange: 'transform', // Optimize for iOS rendering
          isolation: 'isolate' // Create stacking context
        }}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-4 min-h-[64px]">
            {/* Logo - Fixed Positioning */}
            <InfoTooltip content="Return to your coaching dashboard">
              <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-champion-green to-champion-gold rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative w-10 h-10 bg-gradient-to-br from-champion-green to-champion-gold rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="block">
                  <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-champion-green via-champion-gold to-champion-blue bg-clip-text text-transparent whitespace-nowrap">
                    Mindful Champion
                  </span>
                </div>
              </Link>
            </InfoTooltip>

            {/* SPACER - Push menu button to the right on mobile/tablet */}
            <div className="flex-1 lg:hidden"></div>

            {/* Mobile/Tablet Menu Button - HIGHLY VISIBLE */}
            <div className="lg:hidden ml-auto flex-shrink-0">
              <SheetTrigger asChild>
                <Button 
                  variant="default" 
                  size="icon" 
                  className="h-12 w-12 bg-champion-green hover:bg-champion-green/90 text-white shadow-xl rounded-lg border-2 border-white/20 backdrop-blur-sm transition-all hover:scale-105 touch-manipulation cursor-pointer active:scale-95"
                  aria-label="Open navigation menu"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                  onClick={(e) => {
                    // Ensure the event is processed on iOS
                    e.stopPropagation();
                  }}
                >
                  <Menu className="h-7 w-7 text-white stroke-[3] pointer-events-none" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
            </div>

            {/* Main Navigation - Desktop Only (1024px+) */}
            <div className="hidden lg:flex items-center gap-1">
            {/* My Progress */}
            <InfoTooltip content="Your personal training hub - track progress, view stats, and personalized recommendations">
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  className={cn(
                    "gap-2 font-medium transition-all",
                    isActive("/dashboard")
                      ? "bg-champion-green/10 text-champion-green"
                      : "text-gray-700 dark:text-gray-300 hover:text-champion-green hover:bg-champion-green/5"
                  )}
                >
                  <Home className="w-4 h-4" />
                  My Progress
                </Button>
              </Link>
            </InfoTooltip>



            {/* Train Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "gap-2 font-medium transition-all",
                    isActive("/train")
                      ? "bg-champion-green/10 text-champion-green"
                      : "text-gray-700 dark:text-gray-300 hover:text-champion-green hover:bg-champion-green/5"
                  )}
                  title="Access all training tools, drills, video analysis, and practice plans"
                >
                  <Dumbbell className="w-4 h-4" />
                  Train
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 animate-slide-up-fade">
                <DropdownMenuLabel className="flex items-center gap-2 text-champion-green">
                  <Sparkles className="w-4 h-4" />
                  Training Tools
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <InfoTooltip content="Chat with Coach Kai - your AI pickleball coach for personalized advice" side="right">
                  <DropdownMenuItem asChild>
                    <Link href="/train/coach" className="flex items-center gap-3 py-3 cursor-pointer">
                      <MessageCircle className="w-4 h-4 text-champion-green" />
                      <div>
                        <p className="font-medium">Coach Kai</p>
                        <p className="text-xs text-gray-500">AI coaching chat</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </InfoTooltip>
                <InfoTooltip content="Upload match footage for AI-powered shot analysis, technique breakdown, and personalized insights" side="right">
                  <DropdownMenuItem asChild>
                    <Link href="/train/video" className="flex items-center gap-3 py-3 cursor-pointer bg-gradient-to-r from-champion-gold/5 to-transparent hover:from-champion-gold/10">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-champion-gold to-yellow-600">
                        <Video className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">Video Analysis Lab</p>
                          <Badge className="bg-champion-gold/20 text-champion-gold text-xs">Featured</Badge>
                        </div>
                        <p className="text-xs text-gray-500">Upload & analyze your matches</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </InfoTooltip>
                <InfoTooltip content="View and manage your analyzed videos" side="right">
                  <DropdownMenuItem asChild>
                    <Link href="/train/analysis-library" className="flex items-center gap-3 py-3 cursor-pointer">
                      <History className="w-4 h-4 text-purple-500" />
                      <div>
                        <p className="font-medium">My Analyses</p>
                        <p className="text-xs text-gray-500">Your video history</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </InfoTooltip>
                <InfoTooltip content="Browse drills organized by skill level and focus area" side="right">
                  <DropdownMenuItem asChild>
                    <Link href="/train/drills" className="flex items-center gap-3 py-3 cursor-pointer">
                      <Library className="w-4 h-4 text-champion-blue" />
                      <div>
                        <p className="font-medium">Drill Library</p>
                        <p className="text-xs text-gray-500">Organized by skill</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </InfoTooltip>
                <InfoTooltip content="Structured training programs and practice plans by skill level" side="right">
                  <DropdownMenuItem asChild>
                    <Link href="/train" className="flex items-center gap-3 py-3 cursor-pointer">
                      <Calendar className="w-4 h-4 text-emotion-success" />
                      <div>
                        <p className="font-medium">Training Programs</p>
                        <p className="text-xs text-gray-500">Structured learning paths</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </InfoTooltip>
                <InfoTooltip content="Browse 88 high-quality pickleball training videos from top coaches" side="right">
                  <DropdownMenuItem asChild>
                    <Link href="/train/library" className="flex items-center gap-3 py-3 cursor-pointer">
                      <Video className="w-4 h-4 text-champion-blue" />
                      <div>
                        <p className="font-medium">Video Library</p>
                        <p className="text-xs text-gray-500">88 YouTube videos</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </InfoTooltip>
                <InfoTooltip content="Start a quick 15-minute training session right now" side="right">
                  <DropdownMenuItem asChild>
                    <Link href="/train/quick" className="flex items-center gap-3 py-3 cursor-pointer">
                      <Target className="w-4 h-4 text-emotion-warning" />
                      <div>
                        <p className="font-medium">Quick Practice</p>
                        <p className="text-xs text-gray-500">15-min session</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </InfoTooltip>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Progress Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "gap-2 font-medium transition-all",
                    isActive("/progress")
                      ? "bg-champion-green/10 text-champion-green"
                      : "text-gray-700 dark:text-gray-300 hover:text-champion-green hover:bg-champion-green/5"
                  )}
                  title="Track your improvement with stats, goals, and achievements"
                >
                  <TrendingUp className="w-4 h-4" />
                  Progress
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 animate-slide-up-fade">
                <DropdownMenuLabel className="flex items-center gap-2 text-champion-green">
                  <TrendingUp className="w-4 h-4" />
                  Your Journey
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <InfoTooltip content="View your key stats, trends, and improvement metrics" side="right">
                  <DropdownMenuItem asChild>
                    <Link href="/progress" className="flex items-center gap-3 py-3 cursor-pointer">
                      <BarChart3 className="w-4 h-4 text-champion-green" />
                      <div>
                        <p className="font-medium">Performance Dashboard</p>
                        <p className="text-xs text-gray-500">Stats & trends</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </InfoTooltip>
                <InfoTooltip content="Track your progress toward specific improvement goals" side="right">
                  <DropdownMenuItem asChild>
                    <Link href="/progress/goals" className="flex items-center gap-3 py-3 cursor-pointer">
                      <Target className="w-4 h-4 text-champion-gold" />
                      <div>
                        <p className="font-medium">Goals & Milestones</p>
                        <p className="text-xs text-gray-500">Track objectives</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </InfoTooltip>
                <InfoTooltip content="Review past matches with scores and performance insights" side="right">
                  <DropdownMenuItem asChild>
                    <Link href="/progress/matches" className="flex items-center gap-3 py-3 cursor-pointer">
                      <History className="w-4 h-4 text-champion-blue" />
                      <div>
                        <p className="font-medium">Match History</p>
                        <p className="text-xs text-gray-500">Past performance</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </InfoTooltip>
                <InfoTooltip content="Celebrate your badges, streaks, and accomplishments" side="right">
                  <DropdownMenuItem asChild>
                    <Link href="/progress/achievements" className="flex items-center gap-3 py-3 cursor-pointer">
                      <Award className="w-4 h-4 text-emotion-warning" />
                      <div>
                        <p className="font-medium">Achievement Gallery</p>
                        <p className="text-xs text-gray-500">Badges & rewards</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </InfoTooltip>
                <InfoTooltip content="Redeem your achievement points for exclusive sponsor rewards" side="right">
                  <DropdownMenuItem asChild>
                    <Link href="/marketplace" className="flex items-center gap-3 py-3 cursor-pointer">
                      <Trophy className="w-4 h-4 text-champion-gold" />
                      <div>
                        <p className="font-medium">Rewards Store</p>
                        <p className="text-xs text-gray-500">Redeem your points</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </InfoTooltip>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Connect Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "gap-2 font-medium transition-all",
                    isActive("/connect")
                      ? "bg-champion-green/10 text-champion-green"
                      : "text-gray-700 dark:text-gray-300 hover:text-champion-green hover:bg-champion-green/5"
                  )}
                  title="Find practice partners, join tournaments, and connect with the community"
                >
                  <Users className="w-4 h-4" />
                  Connect
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 animate-slide-up-fade">
                <DropdownMenuLabel className="flex items-center gap-2 text-champion-green">
                  <Users className="w-4 h-4" />
                  Community
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* TEMPORARILY HIDDEN - Can be restored later
                <InfoTooltip content="Match with players at your skill level for practice sessions" side="right">
                  <DropdownMenuItem asChild>
                    <Link href="/connect/partners" className="flex items-center gap-3 py-3 cursor-pointer">
                      <UserSearch className="w-4 h-4 text-champion-green" />
                      <div>
                        <p className="font-medium">Find Practice Partners</p>
                        <p className="text-xs text-gray-500">AI-matched players</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </InfoTooltip>
                */}
                
                {/* TEMPORARILY HIDDEN - Can be restored later
                <InfoTooltip content="Manage your sent and received partner requests" side="right">
                  <DropdownMenuItem asChild>
                    <Link href="/connect/my-requests" className="flex items-center gap-3 py-3 cursor-pointer">
                      <Mail className="w-4 h-4 text-teal-600" />
                      <div>
                        <p className="font-medium">My Requests</p>
                        <p className="text-xs text-gray-500">Sent & received</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </InfoTooltip>
                */}
                
                {/* TEMPORARILY HIDDEN - Can be restored later
                <InfoTooltip content="Schedule and track upcoming matches and tournaments" side="right">
                  <DropdownMenuItem asChild>
                    <Link href="/connect/matches" className="flex items-center gap-3 py-3 cursor-pointer">
                      <Calendar className="w-4 h-4 text-champion-gold" />
                      <div>
                        <p className="font-medium">My Matches</p>
                        <p className="text-xs text-gray-500">Schedule & track</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </InfoTooltip>
                */}
                
                <InfoTooltip content="Browse and register for local pickleball tournaments" side="right">
                  <DropdownMenuItem asChild>
                    <Link href="/connect/tournaments" className="flex items-center gap-3 py-3 cursor-pointer">
                      <Trophy className="w-4 h-4 text-champion-blue" />
                      <div>
                        <p className="font-medium">Tournament Hub</p>
                        <p className="text-xs text-gray-500">Find & register</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </InfoTooltip>
                
                {/* TEMPORARILY HIDDEN - Can be restored later
                <InfoTooltip content="Connect with other players, share tips, and ask questions" side="right">
                  <DropdownMenuItem asChild>
                    <Link href="/connect/community" className="flex items-center gap-3 py-3 cursor-pointer">
                      <MessageCircle className="w-4 h-4 text-emotion-success" />
                      <div>
                        <p className="font-medium">Community Board</p>
                        <p className="text-xs text-gray-500">Discussions & tips</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </InfoTooltip>
                */}
                
                <InfoTooltip content="Book expert coaching sessions with certified instructors" side="right">
                  <DropdownMenuItem asChild>
                    <Link href="/coaches" className="flex items-center gap-3 py-3 cursor-pointer">
                      <Award className="w-4 h-4 text-purple-600" />
                      <div>
                        <p className="font-medium">Expert Coaches</p>
                        <p className="text-xs text-gray-500">Book private lessons</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                </InfoTooltip>
                <DropdownMenuSeparator />
                {isApprovedSponsor ? (
                  <InfoTooltip content="Manage your sponsor offers, view analytics, and track performance" side="right">
                    <DropdownMenuItem asChild>
                      <Link href="/sponsors/portal" className="flex items-center gap-3 py-3 cursor-pointer bg-gradient-to-r from-teal-50 to-emerald-50">
                        <Crown className="w-4 h-4 text-teal-600" />
                        <div>
                          <p className="font-medium text-teal-700">Sponsor Portal</p>
                          <p className="text-xs text-teal-600">Manage your offers</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  </InfoTooltip>
                ) : (
                  <InfoTooltip content="Partner with Mindful Champion and reach thousands of engaged players" side="right">
                    <DropdownMenuItem asChild>
                      <Link href="/sponsors/apply" className="flex items-center gap-3 py-3 cursor-pointer bg-gradient-to-r from-cyan-50 to-blue-50">
                        <Sparkles className="w-4 h-4 text-cyan-600" />
                        <div>
                          <p className="font-medium text-cyan-700">Become a Sponsor</p>
                          <p className="text-xs text-cyan-600">Partnership opportunities</p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  </InfoTooltip>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Media Hub */}
            <InfoTooltip content="Discover live tournaments, podcasts, events, and more">
              <Link href="/media">
                <Button
                  variant="ghost"
                  className={cn(
                    "gap-2 font-medium transition-all",
                    isActive("/media")
                      ? "bg-champion-green/10 text-champion-green"
                      : "text-gray-700 dark:text-gray-300 hover:text-champion-green hover:bg-champion-green/5"
                  )}
                >
                  <PlayCircle className="w-4 h-4" />
                  Media Hub
                </Button>
              </Link>
            </InfoTooltip>
          </div>

          {/* Right Side - Profile Menu - HIDDEN ON MOBILE/TABLET */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0 max-w-[350px] overflow-hidden">
            {/* Reward Points Badge */}
            <InfoTooltip content="Your reward points - earn more by completing achievements!">
              <Link href="/marketplace" className="flex-shrink-0">
                <Badge 
                  className="flex gap-1.5 items-center bg-gradient-to-r from-champion-gold to-yellow-600 hover:shadow-lg hover:shadow-champion-gold/50 transition-all hover:scale-105 cursor-pointer px-2.5 py-1.5 whitespace-nowrap"
                >
                  <Award className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="font-bold text-sm">{rewardPoints.toLocaleString()}</span>
                  <span className="text-xs opacity-90">pts</span>
                </Badge>
              </Link>
            </InfoTooltip>

            {/* Subscription Badge - Always visible on md+ */}
            <Badge
              className={cn(
                "flex gap-1 items-center transition-all hover:scale-105 whitespace-nowrap flex-shrink-0 px-2.5 py-1",
                user?.subscriptionTier === 'PRO'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/50'
                  : user?.subscriptionTier === 'PREMIUM'
                  ? 'bg-gradient-to-r from-champion-green to-champion-gold hover:shadow-lg hover:shadow-champion-green/50'
                  : 'bg-gray-500 hover:shadow-lg'
              )}
            >
              {user?.role === 'ADMIN' && <Shield className="w-3 h-3 flex-shrink-0" />}
              {user?.subscriptionTier === 'PRO' && <Crown className="w-3 h-3 flex-shrink-0" />}
              <span className="text-xs font-medium">{user?.subscriptionTier || 'FREE'}</span>
            </Badge>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-champion-green/5 transition-all flex-shrink-0 max-w-[140px] overflow-hidden">
                  <Avatar className="h-8 w-8 border-2 border-champion-green/20 flex-shrink-0">
                    <AvatarImage src={session?.user?.image || ""} />
                    <AvatarFallback className="bg-gradient-to-br from-champion-green to-champion-gold text-white font-bold">
                      {user?.firstName?.[0] || user?.name?.[0] || session?.user?.name?.[0] || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden xl:block text-left min-w-0 flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user?.firstName || session?.user?.name || 'Champion'}
                    </p>
                    <p className="text-xs text-gray-500 truncate whitespace-nowrap">
                      {user?.playerRating || '0.0'} Rating
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-64 animate-slide-up-fade">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name || session?.user?.name || 'Champion'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || session?.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <InfoTooltip content="Edit your profile, skills, and preferences" side="left">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-3 py-2 cursor-pointer">
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>
                  </DropdownMenuItem>
                </InfoTooltip>

                <InfoTooltip content="Connect your wearable devices (Apple Watch, Fitbit, Garmin, Whoop)" side="left">
                  <DropdownMenuItem asChild>
                    <Link href="/settings/devices" className="flex items-center gap-3 py-2 cursor-pointer">
                      <Watch className="w-4 h-4 text-champion-blue" />
                      <span>Connect Devices</span>
                      <Badge className="ml-auto bg-champion-green/10 text-champion-green">New</Badge>
                    </Link>
                  </DropdownMenuItem>
                </InfoTooltip>

                <InfoTooltip content="Manage your reminders and notification settings" side="left">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/reminders" className="flex items-center gap-3 py-2 cursor-pointer">
                      <Bell className="w-4 h-4 text-teal-600" />
                      <span>Reminders</span>
                    </Link>
                  </DropdownMenuItem>
                </InfoTooltip>

                {user?.subscriptionTier === 'PRO' && (
                  <InfoTooltip content="Customize your AI coach's appearance and personality" side="left">
                    <DropdownMenuItem asChild>
                      <Link href="/avatar-studio" className="flex items-center gap-3 py-2 cursor-pointer">
                        <Sparkles className="w-4 h-4 text-champion-green" />
                        <span>Avatar Studio</span>
                        <Badge className="ml-auto bg-gradient-to-r from-purple-500 to-pink-500">Pro</Badge>
                      </Link>
                    </DropdownMenuItem>
                  </InfoTooltip>
                )}

                {user?.role === 'ADMIN' && (
                  <InfoTooltip content="Access admin dashboard for user management" side="left">
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center gap-3 py-2 cursor-pointer">
                        <Shield className="w-4 h-4 text-emotion-info" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  </InfoTooltip>
                )}

                <InfoTooltip content="Manage your plan, billing, and premium features" side="left">
                  <DropdownMenuItem asChild>
                    <Link href="/pricing" className="flex items-center gap-3 py-2 cursor-pointer">
                      <Crown className="w-4 h-4 text-champion-gold" />
                      Subscription
                    </Link>
                  </DropdownMenuItem>
                </InfoTooltip>

                <InfoTooltip content="Notifications, privacy, and app preferences" side="left">
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-3 py-2 cursor-pointer">
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                </InfoTooltip>

                <InfoTooltip content="Get help, watch tutorials, and contact support" side="left">
                  <DropdownMenuItem asChild>
                    <Link href="/help" className="flex items-center gap-3 py-2 cursor-pointer">
                      <HelpCircle className="w-4 h-4" />
                      Help & Support
                    </Link>
                  </DropdownMenuItem>
                </InfoTooltip>

                <DropdownMenuSeparator />

                <InfoTooltip content="Log out of your account" side="left">
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center gap-3 py-2 text-red-600 focus:text-red-600 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenuItem>
                </InfoTooltip>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
      </header>

      {/* Mobile Navigation Sheet */}
      <SheetContent side="right" className="w-80 p-0 flex flex-col h-full">
          <SheetHeader className="p-6 pb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-champion-green to-champion-gold rounded-xl blur-sm opacity-75"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-champion-green to-champion-gold rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <SheetTitle className="text-left text-lg font-bold bg-gradient-to-r from-champion-green via-champion-gold to-champion-blue bg-clip-text text-transparent">
                  Mindful Champion
                </SheetTitle>
                <p className="text-sm text-gray-500">
                  {user?.firstName || session?.user?.name || 'Champion'}
                </p>
              </div>
            </div>
          </SheetHeader>

          <div 
            className="flex-1 overflow-y-auto min-h-0 overscroll-contain"
            style={{
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-y',
            } as React.CSSProperties}
          >
            <div className="px-6 space-y-1">
              {/* My Progress */}
              <Link href="/dashboard" onClick={closeMobileMenu}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-12 text-base font-medium",
                    isActive("/dashboard")
                      ? "bg-champion-green/10 text-champion-green"
                      : "text-gray-700 hover:text-champion-green hover:bg-champion-green/5"
                  )}
                >
                  <Home className="w-5 h-5" />
                  My Progress
                </Button>
              </Link>



              <Separator className="my-4" />

              {/* Training Section */}
              <div className="space-y-1">
                <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Training
                </p>

                <Link href="/train/coach" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base">
                    <MessageCircle className="w-5 h-5 text-champion-green" />
                    Coach Kai
                  </Button>
                </Link>

                <Link href="/train/video" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base bg-gradient-to-r from-champion-gold/5 to-transparent hover:from-champion-gold/10">
                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-champion-gold to-yellow-600">
                      <Video className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold">Video Analysis Lab</span>
                    <Badge className="ml-auto bg-champion-gold/20 text-champion-gold text-xs">Featured</Badge>
                  </Button>
                </Link>

                <Link href="/train/analysis-library" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base">
                    <History className="w-5 h-5 text-purple-500" />
                    My Analyses
                  </Button>
                </Link>

                <Link href="/train/drills" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base">
                    <Library className="w-5 h-5 text-champion-blue" />
                    Drill Library
                  </Button>
                </Link>

                <Link href="/train" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base">
                    <Calendar className="w-5 h-5 text-emerald-500" />
                    Training Programs
                  </Button>
                </Link>

                <Link href="/train/library" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base">
                    <Video className="w-5 h-5 text-champion-blue" />
                    Video Library
                  </Button>
                </Link>

                <Link href="/train/quick" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base">
                    <Target className="w-5 h-5 text-orange-500" />
                    Quick Practice
                  </Button>
                </Link>
              </div>

              <Separator className="my-4" />

              {/* Progress Section */}
              <div className="space-y-1">
                <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Progress
                </p>

                <Link href="/progress" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base">
                    <BarChart3 className="w-5 h-5 text-champion-green" />
                    Performance Dashboard
                  </Button>
                </Link>

                <Link href="/progress/goals" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base">
                    <Target className="w-5 h-5 text-champion-gold" />
                    Goals & Milestones
                  </Button>
                </Link>

                <Link href="/progress/matches" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base">
                    <History className="w-5 h-5 text-champion-blue" />
                    Match History
                  </Button>
                </Link>

                <Link href="/progress/achievements" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base">
                    <Award className="w-5 h-5 text-orange-500" />
                    Achievement Gallery
                  </Button>
                </Link>
              </div>

              <Separator className="my-4" />

              {/* Connect Section */}
              <div className="space-y-1">
                <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Connect
                </p>

                {/* TEMPORARILY HIDDEN - Can be restored later
                <Link href="/connect/partners" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base">
                    <UserSearch className="w-5 h-5 text-champion-green" />
                    Find Practice Partners
                  </Button>
                </Link>
                */}

                {/* TEMPORARILY HIDDEN - Can be restored later
                <Link href="/connect/matches" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base">
                    <Calendar className="w-5 h-5 text-champion-gold" />
                    My Matches
                  </Button>
                </Link>
                */}

                <Link href="/connect/tournaments" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base">
                    <Trophy className="w-5 h-5 text-champion-blue" />
                    Tournament Hub
                  </Button>
                </Link>

                {/* TEMPORARILY HIDDEN - Can be restored later
                <Link href="/connect/community" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base">
                    <MessageCircle className="w-5 h-5 text-emerald-500" />
                    Community Board
                  </Button>
                </Link>
                */}

                <Link href="/coaches" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base">
                    <Award className="w-5 h-5 text-purple-600" />
                    Expert Coaches
                  </Button>
                </Link>

                {isApprovedSponsor ? (
                  <Link href="/sponsors/portal" onClick={closeMobileMenu}>
                    <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base bg-gradient-to-r from-teal-50 to-emerald-50 hover:from-teal-100 hover:to-emerald-100">
                      <Crown className="w-5 h-5 text-teal-600" />
                      <span className="text-teal-700 font-semibold">Sponsor Portal</span>
                    </Button>
                  </Link>
                ) : (
                  <Link href="/sponsors/apply" onClick={closeMobileMenu}>
                    <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base bg-gradient-to-r from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100">
                      <Sparkles className="w-5 h-5 text-cyan-600" />
                      <span className="text-cyan-700 font-semibold">Become a Sponsor</span>
                    </Button>
                  </Link>
                )}
              </div>

              <Separator className="my-4" />

              {/* Media Hub Section */}
              <div className="space-y-1">
                <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Media Hub
                </p>

                <Link href="/media" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base">
                    <PlayCircle className="w-5 h-5 text-champion-green" />
                    Media Hub
                  </Button>
                </Link>
              </div>

              <Separator className="my-4" />

              {/* Account Section */}
              <div className="space-y-1">
                <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Account
                </p>

                <Link href="/profile" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base">
                    <User className="w-5 h-5" />
                    My Profile
                  </Button>
                </Link>

                <Link href="/settings/devices" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base">
                    <Watch className="w-5 h-5 text-champion-blue" />
                    <span>Connect Devices</span>
                    <Badge className="ml-2 bg-champion-green/10 text-champion-green text-xs">New</Badge>
                  </Button>
                </Link>

                <Link href="/dashboard/reminders" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base">
                    <Bell className="w-5 h-5 text-teal-600" />
                    Reminders
                  </Button>
                </Link>

                {user?.subscriptionTier === 'PRO' && (
                  <Link href="/avatar-studio" onClick={closeMobileMenu}>
                    <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base">
                      <Sparkles className="w-5 h-5 text-champion-green" />
                      <span>Avatar Studio</span>
                      <Badge className="ml-auto bg-gradient-to-r from-purple-500 to-pink-500">Pro</Badge>
                    </Button>
                  </Link>
                )}

                {user?.role === 'ADMIN' && (
                  <Link href="/admin" onClick={closeMobileMenu}>
                    <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base">
                      <Shield className="w-5 h-5 text-blue-500" />
                      Admin Dashboard
                    </Button>
                  </Link>
                )}

                <Link href="/pricing" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base">
                    <Crown className="w-5 h-5 text-champion-gold" />
                    Subscription
                  </Button>
                </Link>

                <Link href="/settings" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base">
                    <Settings className="w-5 h-5" />
                    Settings
                  </Button>
                </Link>

                <Link href="/help" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-base">
                    <HelpCircle className="w-5 h-5" />
                    Help & Support
                  </Button>
                </Link>
              </div>

              <Separator className="my-4" />

              {/* Sign Out */}
              <Button
                variant="ghost"
                onClick={() => {
                  closeMobileMenu()
                  handleSignOut()
                }}
                className="w-full justify-start gap-3 h-12 text-base text-red-600 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </Button>
            </div>
          </div>

          {/* User Info Footer */}
          <div className="border-t p-4 shrink-0">
            <div className="flex items-center gap-3 max-w-full">
              <Avatar className="h-10 w-10 border-2 border-champion-green/20 flex-shrink-0">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-gradient-to-br from-champion-green to-champion-gold text-white font-bold">
                  {user?.firstName?.[0] || user?.name?.[0] || session?.user?.name?.[0] || 'C'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="text-sm font-medium truncate">
                  {user?.name || session?.user?.name || 'Champion'}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs text-gray-500 whitespace-nowrap">
                    {user?.playerRating || '0.0'} Rating
                  </p>
                  <Badge 
                    className={cn(
                      "text-xs whitespace-nowrap flex-shrink-0",
                      user?.subscriptionTier === 'PRO'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                        : user?.subscriptionTier === 'PREMIUM'
                        ? 'bg-gradient-to-r from-champion-green to-champion-gold'
                        : 'bg-gray-500'
                    )}
                  >
                    {user?.subscriptionTier || 'FREE'}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Award className="w-3 h-3 text-champion-gold flex-shrink-0" />
                  <span className="text-xs font-bold text-champion-gold truncate">
                    {rewardPoints.toLocaleString()} points
                  </span>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
    </Sheet>
  )
}
