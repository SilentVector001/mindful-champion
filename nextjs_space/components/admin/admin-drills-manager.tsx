"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Dumbbell, Star, Eye, EyeOff, Search, Filter, 
  TrendingUp, BarChart3, Award, CheckCircle, AlertCircle
} from "lucide-react"
import { toast } from "react-hot-toast"

interface Stats {
  totalDrills: number
  featuredDrills: number
  categoryCounts: Array<{ category: string; count: number }>
}

interface Drill {
  id: string
  title: string
  category: string
  difficulty: string
  duration: number
  featured: boolean
  active: boolean
  popularityScore: number
}

export default function AdminDrillsManager({ stats }: { stats: Stats }) {
  const [drills, setDrills] = useState<Drill[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    fetchDrills()
  }, [])

  const fetchDrills = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/drills")
      const data = await response.json()
      if (data?.success) {
        setDrills(data?.drills ?? [])
      }
    } catch (error) {
      console.error("Failed to fetch drills:", error)
      toast.error("Failed to load drills")
    } finally {
      setLoading(false)
    }
  }

  const toggleFeatured = async (drillId: string, currentValue: boolean) => {
    try {
      const response = await fetch(`/api/admin/drills/${drillId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !currentValue }),
      })

      const data = await response.json()
      if (data?.success) {
        toast.success(`Drill ${!currentValue ? "featured" : "unfeatured"}`)
        fetchDrills()
      }
    } catch (error) {
      console.error("Failed to update drill:", error)
      toast.error("Failed to update drill")
    }
  }

  const toggleActive = async (drillId: string, currentValue: boolean) => {
    try {
      const response = await fetch(`/api/admin/drills/${drillId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentValue }),
      })

      const data = await response.json()
      if (data?.success) {
        toast.success(`Drill ${!currentValue ? "activated" : "deactivated"}`)
        fetchDrills()
      }
    } catch (error) {
      console.error("Failed to update drill:", error)
      toast.error("Failed to update drill")
    }
  }

  const filteredDrills = drills?.filter(drill => {
    const matchesSearch = !searchQuery || 
      drill?.title?.toLowerCase()?.includes(searchQuery?.toLowerCase() ?? "")
    const matchesCategory = selectedCategory === "all" || drill?.category === selectedCategory
    return matchesSearch && matchesCategory
  }) ?? []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Drill Library Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage practice drills and monitor usage
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-teal-600" />
                Total Drills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-teal-600">{stats?.totalDrills ?? 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Active drills in library
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-600" />
                Featured Drills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-600">{stats?.featuredDrills ?? 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Highlighted to users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">{stats?.categoryCounts?.length ?? 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Different drill types
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search drills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e?.target?.value ?? "")}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e?.target?.value ?? "all")}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="all">All Categories</option>
                {stats?.categoryCounts?.map(cat => (
                  <option key={cat?.category ?? ''} value={cat?.category ?? ''}>
                    {cat?.category ?? 'Unknown'} ({cat?.count ?? 0})
                  </option>
                )) ?? []}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Drills Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Drills ({filteredDrills?.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredDrills?.map(drill => (
                <div
                  key={drill?.id ?? Math.random()}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {drill?.title ?? "Untitled"}
                      </h3>
                      {drill?.featured && (
                        <Badge className="bg-amber-100 text-amber-700">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      {!drill?.active && (
                        <Badge variant="secondary">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>{drill?.category ?? "Unknown"}</span>
                      <span>•</span>
                      <span className="capitalize">{drill?.difficulty?.toLowerCase() ?? "beginner"}</span>
                      <span>•</span>
                      <span>{drill?.duration ?? 0} min</span>
                      <span>•</span>
                      <span>Popularity: {drill?.popularityScore ?? 0}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFeatured(drill?.id ?? "", drill?.featured ?? false)}
                      className="gap-2"
                    >
                      <Star className={cn("w-4 h-4", drill?.featured && "fill-amber-500 text-amber-500")} />
                      {drill?.featured ? "Unfeature" : "Feature"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(drill?.id ?? "", drill?.active ?? true)}
                      className={cn(
                        "gap-2",
                        drill?.active ? "text-green-600" : "text-gray-600"
                      )}
                    >
                      {drill?.active ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Active
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4" />
                          Inactive
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )) ?? []}
            </div>

            {filteredDrills?.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No drills found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes?.filter(Boolean)?.join(' ') ?? ''
}
