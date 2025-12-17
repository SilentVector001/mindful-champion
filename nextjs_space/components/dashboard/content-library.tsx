
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BookOpen,
  Search,
  Filter,
  Play,
  Bookmark,
  BookmarkCheck,
  Video,
  Headphones,
  FileText,
  ExternalLink,
  Clock,
  Star,
  TrendingUp,
  Eye,
  Heart
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface ContentLibraryProps {
  user: any
}

const contentData = [
  {
    id: 1,
    title: "Mastering the Third Shot Drop",
    description: "Learn the fundamentals of the most important shot in pickleball with step-by-step instruction and practice drills.",
    type: "video",
    duration: "15:30",
    author: "Sarah Martinez",
    publishedAt: "2024-10-15T10:00:00Z",
    views: 2847,
    rating: 4.8,
    thumbnailUrl: "https://cdn.abacus.ai/images/83de75e4-4404-45fe-b65e-5e0686a72d25.png",
    category: "Technique",
    difficulty: "Intermediate",
    saved: false,
    featured: true
  },
  {
    id: 2,
    title: "Mental Strategies for Tournament Play",
    description: "Develop unshakeable confidence and focus during competitive matches with proven psychological techniques.",
    type: "article",
    duration: "8 min read",
    author: "Dr. Mike Thompson",
    publishedAt: "2024-10-12T14:00:00Z",
    views: 1923,
    rating: 4.9,
    thumbnailUrl: "https://cdn.abacus.ai/images/c24b1eb6-b223-42e0-800b-fef9849ac34e.png",
    category: "Mental Game",
    difficulty: "Advanced",
    saved: true,
    featured: false
  },
  {
    id: 3,
    title: "The Champion Mindset Podcast",
    description: "Weekly insights from professional pickleball players, coaches, and sports psychologists.",
    type: "podcast",
    duration: "45:20",
    author: "Champion Mindset Media",
    publishedAt: "2024-10-10T09:00:00Z",
    views: 3421,
    rating: 4.7,
    thumbnailUrl: "https://cdn.abacus.ai/images/c1a96890-9743-4487-8a45-f57beaecd3de.png",
    category: "Motivation",
    difficulty: "All Levels",
    saved: false,
    featured: true
  },
  {
    id: 4,
    title: "Dinking Fundamentals for Beginners",
    description: "Master the soft game with proper technique, positioning, and strategic thinking at the kitchen line.",
    type: "video",
    duration: "12:45",
    author: "Lisa Chen",
    publishedAt: "2024-10-08T16:00:00Z",
    views: 4123,
    rating: 4.6,
    thumbnailUrl: "https://cdn.abacus.ai/images/df1ea0c5-2293-4aba-b4e8-377245df1134.png",
    category: "Technique",
    difficulty: "Beginner",
    saved: true,
    featured: false
  },
  {
    id: 5,
    title: "Serve and Return Strategy Guide",
    description: "Complete guide to developing powerful serves and effective return strategies for competitive play.",
    type: "article",
    duration: "12 min read",
    author: "Coach Rodriguez",
    publishedAt: "2024-10-05T11:00:00Z",
    views: 2156,
    rating: 4.8,
    thumbnailUrl: "https://cdn.abacus.ai/images/f61fad03-3e0a-41ef-a297-56bbec3bb39b.png",
    category: "Strategy",
    difficulty: "Intermediate",
    saved: false,
    featured: false
  },
  {
    id: 6,
    title: "Recovery and Injury Prevention",
    description: "Essential tips for staying healthy, preventing common pickleball injuries, and optimizing recovery.",
    type: "article",
    duration: "6 min read",
    author: "Dr. Amanda Foster",
    publishedAt: "2024-10-03T13:00:00Z",
    views: 1887,
    rating: 4.5,
    thumbnailUrl: "https://cdn.abacus.ai/images/b1c3988b-c60b-420a-a2e0-4a0c9cc864ef.png",
    category: "Health & Fitness",
    difficulty: "All Levels",
    saved: true,
    featured: false
  }
]

const categories = [
  "All Categories",
  "Technique",
  "Strategy", 
  "Mental Game",
  "Health & Fitness",
  "Motivation",
  "Equipment"
]

const difficulties = [
  "All Levels",
  "Beginner",
  "Intermediate", 
  "Advanced"
]

export default function ContentLibrary({ user }: ContentLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedDifficulty, setSelectedDifficulty] = useState("All Levels")
  const [selectedType, setSelectedType] = useState("all")
  const [savedContent, setSavedContent] = useState<number[]>([2, 4, 6])
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  const filteredContent = contentData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All Categories" || item.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === "All Levels" || item.difficulty === selectedDifficulty
    const matchesType = selectedType === "all" || item.type === selectedType
    
    if (activeTab === "saved") {
      return savedContent.includes(item.id) && matchesSearch && matchesCategory && matchesDifficulty && matchesType
    }
    
    if (activeTab === "featured") {
      return item.featured && matchesSearch && matchesCategory && matchesDifficulty && matchesType
    }
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesType
  })

  const handleSaveContent = async (contentId: number) => {
    try {
      if (savedContent.includes(contentId)) {
        setSavedContent(prev => prev.filter(id => id !== contentId))
        toast({
          title: "Removed from Library",
          description: "Content removed from your saved library.",
        })
      } else {
        setSavedContent(prev => [...prev, contentId])
        toast({
          title: "Saved to Library! 📚",
          description: "Content added to your personal library.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update saved content.",
        variant: "destructive",
      })
    }
  }

  const handlePlayContent = (content: any) => {
    toast({
      title: `Playing: ${content.title}`,
      description: "Content will open in a new window or player.",
    })
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return Video
      case 'podcast':
        return Headphones
      case 'article':
        return FileText
      default:
        return BookOpen
    }
  }

  const getContentGradient = (type: string) => {
    switch (type) {
      case 'video':
        return "from-red-500 to-rose-500"
      case 'podcast':
        return "from-purple-500 to-pink-500"
      case 'article':
        return "from-blue-500 to-cyan-500"
      default:
        return "from-slate-500 to-slate-600"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Content Library
          </h2>
          <p className="text-slate-600 mt-2">
            Access premium training videos, articles, and podcasts from expert coaches
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-violet-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-slate-600">Premium Content</span>
        </div>
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search videos, articles, podcasts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="sm:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="sm:w-40">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((difficulty) => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="sm:w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="article">Articles</SelectItem>
                  <SelectItem value="podcast">Podcasts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-white border shadow-sm">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              All Content
            </TabsTrigger>
            <TabsTrigger value="featured" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Featured
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <Bookmark className="w-4 h-4" />
              My Library ({savedContent.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <ContentGrid 
              content={filteredContent}
              savedContent={savedContent}
              onSaveContent={handleSaveContent}
              onPlayContent={handlePlayContent}
            />
          </TabsContent>

          <TabsContent value="featured" className="mt-6">
            <ContentGrid 
              content={filteredContent}
              savedContent={savedContent}
              onSaveContent={handleSaveContent}
              onPlayContent={handlePlayContent}
            />
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            <ContentGrid 
              content={filteredContent}
              savedContent={savedContent}
              onSaveContent={handleSaveContent}
              onPlayContent={handlePlayContent}
            />
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Learning Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-violet-800">
              <TrendingUp className="w-5 h-5" />
              Your Learning Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-violet-700 mb-1">
                  {Math.floor(Math.random() * 20) + 15}
                </div>
                <div className="text-sm text-violet-600">Content Watched</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-violet-700 mb-1">
                  {Math.floor(Math.random() * 10) + 8} hrs
                </div>
                <div className="text-sm text-violet-600">Learning Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-violet-700 mb-1">
                  {savedContent.length}
                </div>
                <div className="text-sm text-violet-600">Saved Items</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

interface ContentGridProps {
  content: any[]
  savedContent: number[]
  onSaveContent: (id: number) => void
  onPlayContent: (content: any) => void
}

function ContentGrid({ content, savedContent, onSaveContent, onPlayContent }: ContentGridProps) {
  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return Video
      case 'podcast':
        return Headphones
      case 'article':
        return FileText
      default:
        return BookOpen
    }
  }

  const getContentGradient = (type: string) => {
    switch (type) {
      case 'video':
        return "from-red-500 to-rose-500"
      case 'podcast':
        return "from-purple-500 to-pink-500"
      case 'article':
        return "from-blue-500 to-cyan-500"
      default:
        return "from-slate-500 to-slate-600"
    }
  }

  if (content.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No content found</p>
        <p className="text-sm">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {content.map((item, index) => {
        const ContentIcon = getContentIcon(item.type)
        const isSaved = savedContent.includes(item.id)
        
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -2 }}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-all border-0 shadow-md">
              {/* Thumbnail */}
              <div className="relative aspect-video bg-slate-200">
                <Image
                  src={item.thumbnailUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Button
                    size="lg"
                    className="bg-white/90 text-slate-900 hover:bg-white rounded-full h-16 w-16"
                    onClick={() => onPlayContent(item)}
                  >
                    <Play className="w-6 h-6" />
                  </Button>
                </div>
                
                {/* Content Type Badge */}
                <div className="absolute top-3 left-3">
                  <Badge className={`bg-gradient-to-r ${getContentGradient(item.type)} text-white`}>
                    <ContentIcon className="w-3 h-3 mr-1" />
                    {item.type}
                  </Badge>
                </div>
                
                {/* Featured Badge */}
                {item.featured && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-yellow-500 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                )}
                
                {/* Duration */}
                <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2 py-1 rounded text-sm">
                  {item.duration}
                </div>
              </div>
              
              {/* Content */}
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {item.category}
                  </Badge>
                  <Badge 
                    variant={
                      item.difficulty === 'Beginner' ? 'secondary' :
                      item.difficulty === 'Intermediate' ? 'default' : 'destructive'
                    } 
                    className="text-xs"
                  >
                    {item.difficulty}
                  </Badge>
                </div>
                
                <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">
                  {item.title}
                </h3>
                
                <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                  {item.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <span>by {item.author}</span>
                  <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{item.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span>{item.rating}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSaveContent(item.id)}
                      className="px-2"
                    >
                      {isSaved ? (
                        <BookmarkCheck className="w-4 h-4 text-violet-600" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      className={`bg-gradient-to-r ${getContentGradient(item.type)} hover:opacity-90`}
                      onClick={() => onPlayContent(item)}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      {item.type === 'article' ? 'Read' : 'Play'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  )
}
