
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MessageCircle,
  ThumbsUp,
  Eye,
  Pin,
  TrendingUp,
  Clock,
  Search,
  Filter,
  PlusCircle,
  Users,
  Heart,
  Bookmark,
  Award,
  Zap,
  Target,
  Brain,
  Trophy,
  MessageSquare,
  Sparkles,
  ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { CreatePostDialog } from "./create-post-dialog"
import { useRouter } from "next/navigation"

interface CommunityBoardProps {
  posts: any[]
  user: any
  stats: {
    totalPosts: number
    totalMembers: number
    activeToday: number
  }
}

const CATEGORIES = [
  { value: "ALL", label: "All Topics", icon: MessageCircle, color: "text-slate-600" },
  { value: "STRATEGY", label: "Strategy", icon: Brain, color: "text-purple-600" },
  { value: "TECHNIQUE", label: "Technique", icon: Target, color: "text-blue-600" },
  { value: "MENTAL_GAME", label: "Mental Game", icon: Sparkles, color: "text-pink-600" },
  { value: "EQUIPMENT", label: "Equipment", icon: Award, color: "text-amber-600" },
  { value: "MATCH_STORIES", label: "Match Stories", icon: Trophy, color: "text-green-600" },
  { value: "TRAINING_TIPS", label: "Training Tips", icon: Zap, color: "text-orange-600" },
  { value: "QUESTIONS", label: "Questions", icon: MessageSquare, color: "text-indigo-600" },
  { value: "CELEBRATIONS", label: "Celebrations", icon: Trophy, color: "text-yellow-600" },
]

export default function CommunityBoard({ posts, user, stats }: CommunityBoardProps) {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState("ALL")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "trending">("recent")
  const [showCreatePost, setShowCreatePost] = useState(false)

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === "ALL" || post.category === selectedCategory
    const matchesSearch = searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Sort posts
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    } else if (sortBy === "popular") {
      return b.likeCount - a.likeCount
    } else {
      // Trending: combination of recent activity and engagement
      const aScore = a.likeCount + a.commentCount + (a.views / 10)
      const bScore = b.likeCount + b.commentCount + (b.views / 10)
      return bScore - aScore
    }
  })

  const pinnedPosts = sortedPosts.filter(p => p.isPinned)
  const regularPosts = sortedPosts.filter(p => !p.isPinned)

  return (
    <div className="space-y-6">
      {/* Value Proposition Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500 rounded-2xl p-8 text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Community Board</h1>
              <p className="text-white/90 text-lg">
                You're not training alone. This is your pickleball family.
              </p>
            </div>
            <Users className="w-12 h-12 text-white/20" />
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Discussions</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalPosts}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Members</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalMembers}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">Active Today</span>
              </div>
              <p className="text-2xl font-bold">{stats.activeToday}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
              <Heart className="w-3 h-3 mr-1" />
              Real Players, Real Stories
            </Badge>
            <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
              <Sparkles className="w-3 h-3 mr-1" />
              Get Advice from All Levels
            </Badge>
            <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
              <Trophy className="w-3 h-3 mr-1" />
              Share Your Victories
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Why You're Here Card */}
      <Card className="border-l-4 border-l-cyan-500">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-cyan-50 rounded-lg">
              <Heart className="w-6 h-6 text-cyan-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Why This Matters</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Training alone is hard. Plateaus feel endless. Losses sting more. But here, you're part of something bigger—a community that understands your journey because they're on it too.
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-cyan-600" />
                  <span>Get unstuck with real player advice</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-cyan-600" />
                  <span>Celebrate wins with people who get it</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-cyan-600" />
                  <span>Find motivation when you need it most</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-cyan-600" />
                  <span>Learn from others' experiences</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
          <SelectTrigger className="w-full lg:w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Most Recent
              </div>
            </SelectItem>
            <SelectItem value="popular">
              <div className="flex items-center gap-2">
                <ThumbsUp className="w-4 h-4" />
                Most Popular
              </div>
            </SelectItem>
            <SelectItem value="trending">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Trending
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Button 
          onClick={() => setShowCreatePost(true)}
          className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {CATEGORIES.map(category => {
          const Icon = category.icon
          const isActive = selectedCategory === category.value
          
          return (
            <Button
              key={category.value}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
              className={cn(
                "shrink-0",
                isActive && "bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700"
              )}
            >
              <Icon className="w-4 h-4 mr-2" />
              {category.label}
            </Button>
          )
        })}
      </div>

      {/* Pinned Posts */}
      {pinnedPosts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Pin className="w-4 h-4 text-cyan-600" />
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Pinned Posts
            </h3>
          </div>
          {pinnedPosts.map((post, idx) => (
            <PostCard key={post.id} post={post} isPinned delay={idx * 0.05} />
          ))}
        </div>
      )}

      {/* Regular Posts */}
      <div className="space-y-3">
        {regularPosts.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to start a conversation!
            </p>
            <Button
              onClick={() => setShowCreatePost(true)}
              className="bg-gradient-to-r from-cyan-600 to-teal-600"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              Create First Post
            </Button>
          </Card>
        ) : (
          regularPosts.map((post, idx) => (
            <PostCard key={post.id} post={post} delay={idx * 0.05} />
          ))
        )}
      </div>

      {/* Create Post Dialog */}
      <CreatePostDialog
        open={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        user={user}
      />
    </div>
  )
}

function PostCard({ post, isPinned = false, delay = 0 }: any) {
  const router = useRouter()
  const categoryInfo = CATEGORIES.find(c => c.value === post.category) || CATEGORIES[0]
  const Icon = categoryInfo.icon

  // Determine if user is a child (age 10-12)
  const isChild = post.user.ageRange && (post.user.ageRange === '10-12' || post.user.ageRange.includes('child'))
  
  // Get skill level badge color
  const getSkillBadge = (skillLevel: string) => {
    switch(skillLevel) {
      case 'BEGINNER':
        return { color: 'bg-green-100 text-green-700 border-green-300', label: 'Beginner' }
      case 'INTERMEDIATE':
        return { color: 'bg-blue-100 text-blue-700 border-blue-300', label: 'Intermediate' }
      case 'ADVANCED':
        return { color: 'bg-purple-100 text-purple-700 border-purple-300', label: 'Advanced' }
      case 'PRO':
        return { color: 'bg-amber-100 text-amber-700 border-amber-300', label: 'Pro' }
      default:
        return { color: 'bg-gray-100 text-gray-700 border-gray-300', label: skillLevel }
    }
  }

  const skillBadge = getSkillBadge(post.user.skillLevel || 'BEGINNER')
  const displayName = post.user.nickname || post.user.name

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card 
        className={cn(
          "hover:shadow-lg transition-all cursor-pointer group",
          isPinned && "border-2 border-cyan-200 bg-cyan-50/50"
        )}
        onClick={() => router.push(`/connect/community/${post.id}`)}
      >
        <CardContent className="p-6">
          <div className="flex gap-4">
            {/* User Avatar */}
            <div className="shrink-0 relative">
              {post.user.image ? (
                <img 
                  src={post.user.image} 
                  alt={displayName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white font-semibold text-lg">
                  {displayName?.[0] || "U"}
                </div>
              )}
              {/* Age indicator badge */}
              {isChild && (
                <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                  JR
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {isPinned && (
                      <Pin className="w-3 h-3 text-cyan-600" />
                    )}
                    <Badge variant="outline" className="text-xs">
                      <Icon className={cn("w-3 h-3 mr-1", categoryInfo.color)} />
                      {categoryInfo.label}
                    </Badge>
                    
                    {/* User info with nickname */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-foreground">{displayName}</span>
                      {post.user.nickname && post.user.name && (
                        <span className="text-xs text-muted-foreground">({post.user.name})</span>
                      )}
                    </div>
                    
                    {/* Skill level badge */}
                    <Badge className={cn("text-[10px] px-1.5 py-0", skillBadge.color)}>
                      {post.user.playerRating || skillBadge.label}
                    </Badge>
                    
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg group-hover:text-cyan-600 transition-colors line-clamp-1">
                    {post.title}
                  </h3>
                </div>
              </div>

              <p className="text-muted-foreground line-clamp-2 mb-3 text-sm">
                {post.content}
              </p>

              {/* Engagement Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1 hover:text-cyan-600 transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{post.likeCount}</span>
                </div>
                <div className="flex items-center gap-1 hover:text-cyan-600 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.commentCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{post.views}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
