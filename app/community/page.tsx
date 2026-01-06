'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import MainNavigation from "@/components/navigation/main-navigation"
import { CommunityFeed, LeaderboardContainer } from "@/components/community"
import Link from "next/link"
import { Video, Bookmark, User, Sparkles, Play, Trophy, Info, HelpCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InfoTooltip } from "@/components/ui/info-tooltip"

export default function CommunityPage() {
  const [user, setUser] = useState<any>(null)
  const [totalPosts, setTotalPosts] = useState(0)
  const [activeTab, setActiveTab] = useState('videos')
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user session
        const sessionRes = await fetch('/api/auth/session')
        const sessionData = await sessionRes.json()
        
        if (!sessionData?.user) {
          router.push('/auth/signin')
          return
        }

        // Fetch user details
        const userRes = await fetch('/api/user/profile')
        if (userRes.ok) {
          const userData = await userRes.json()
          setUser(userData)
        }

        // Fetch community stats
        const statsRes = await fetch('/api/community/stats')
        if (statsRes.ok) {
          const stats = await statsRes.json()
          setTotalPosts(stats.totalPosts || 0)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <MainNavigation user={null} />
      <main className="container mx-auto px-4 pt-20 pb-8 max-w-7xl">
        {/* Compact Instagram-style Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-teal-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-2">
                  <Play className="w-7 h-7 text-teal-400" />
                  Community Center
                </h1>
                <InfoTooltip 
                  content="The Community Center is your hub for connecting with other players! Share your training videos, watch others' gameplay, and compete on the leaderboards. Videos you upload for AI analysis can be shared here to get feedback from the community."
                  side="right"
                />
              </div>
              <p className="text-slate-400 text-sm mt-1">Connect, compete, and celebrate together</p>
            </div>
            
            {/* Inline Stats Badge */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-teal-500/10 to-purple-500/10 border border-teal-500/30 rounded-full px-4 py-2">
              <Video className="w-4 h-4 text-teal-400" />
              <span className="text-white font-semibold">{totalPosts}</span>
              <span className="text-slate-400 text-sm hidden sm:inline">videos</span>
            </div>
          </div>
        </div>

        {/* How It Works Banner */}
        <div className="mb-6 bg-gradient-to-r from-slate-800/80 to-slate-800/40 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">How Community Features Connect to Your Training</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                When you upload videos in the <span className="text-teal-400">Video Analysis</span> section, you can choose to share them with the community. 
                Get feedback from other players, see how your technique compares, and learn from top performers. 
                Your activity earns XP points that appear on the leaderboards!
              </p>
            </div>
          </div>
        </div>

        {/* Quick Access Cards - Instagram Style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Link
            href="/community/my-posts"
            className="group relative bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-2xl p-4 hover:scale-[1.02] hover:border-purple-400/50 transition-all duration-300"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <User className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-white font-medium text-sm">My Posts</span>
              <span className="text-slate-500 text-xs text-center">Videos you&apos;ve shared</span>
            </div>
          </Link>

          <Link
            href="/community/saved"
            className="group relative bg-gradient-to-br from-amber-600/20 to-orange-600/20 border border-amber-500/30 rounded-2xl p-4 hover:scale-[1.02] hover:border-amber-400/50 transition-all duration-300"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bookmark className="w-6 h-6 text-amber-400" />
              </div>
              <span className="text-white font-medium text-sm">Saved</span>
              <span className="text-slate-500 text-xs text-center">Bookmarked content</span>
            </div>
          </Link>

          <Link
            href="/train/video"
            className="group relative bg-gradient-to-br from-teal-600/20 to-cyan-600/20 border border-teal-500/30 rounded-2xl p-4 hover:scale-[1.02] hover:border-teal-400/50 transition-all duration-300"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-teal-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-teal-400" />
              </div>
              <span className="text-white font-medium text-sm">Upload</span>
              <span className="text-slate-500 text-xs text-center">Get AI analysis & share</span>
            </div>
          </Link>

          <button
            onClick={() => setActiveTab('leaderboards')}
            className="group relative bg-gradient-to-br from-yellow-600/20 to-amber-600/20 border border-yellow-500/30 rounded-2xl p-4 hover:scale-[1.02] hover:border-yellow-400/50 transition-all duration-300"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>
              <span className="text-white font-medium text-sm">Rankings</span>
              <span className="text-slate-500 text-xs text-center">Compete & climb ranks</span>
            </div>
          </button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6 bg-slate-800/50 p-1">
            <TabsTrigger 
              value="videos"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
            >
              <Video className="w-4 h-4 mr-2" />
              Videos
            </TabsTrigger>
            <TabsTrigger 
              value="leaderboards"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-amber-600 data-[state=active]:text-white"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="videos">
            {/* Videos Explanation */}
            <div className="mb-4 p-3 bg-slate-800/30 border border-slate-700/40 rounded-lg">
              <p className="text-slate-400 text-sm flex items-center gap-2">
                <Info className="w-4 h-4 text-teal-400 shrink-0" />
                Browse videos shared by other players. Like, comment, and save videos to learn from others&apos; techniques.
              </p>
            </div>
            <CommunityFeed pageTitle="Latest Videos" />
          </TabsContent>

          <TabsContent value="leaderboards">
            {/* Leaderboards Explanation */}
            <div className="mb-4 p-3 bg-slate-800/30 border border-slate-700/40 rounded-lg">
              <p className="text-slate-400 text-sm flex items-center gap-2">
                <Info className="w-4 h-4 text-yellow-400 shrink-0" />
                <span>
                  <strong className="text-white">How to climb the leaderboard:</strong> Earn XP by completing drills, uploading videos for analysis, achieving goals, and maintaining training streaks. The more active you are, the higher you rank!
                </span>
              </p>
            </div>
            <LeaderboardContainer user={user} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
