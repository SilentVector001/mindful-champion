"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { 
  Users, 
  MapPin, 
  Star,
  Search,
  UserPlus,
  Calendar,
  MessageSquare,
  Target,
  Filter,
  CheckCircle2,
  Clock,
  TrendingUp,
  Sparkles,
  X,
  Send,
  Award,
  Zap,
  UserCheck
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

interface Partner {
  id: string
  name: string
  rating: number
  skillLevel: string
  location?: string
  distance?: number
  isAvailable: boolean
  lastSeen?: Date
  matchScore?: number
  commonGoals?: string[]
  playingStyle?: string
  availability?: string[]
}

interface PartnersContentProps {
  user: any
  initialPartners: Partner[]
}

export default function PartnersContent({ user, initialPartners }: PartnersContentProps) {
  const router = useRouter()
  const [partners, setPartners] = useState<Partner[]>(initialPartners || [])
  const [filteredPartners, setFilteredPartners] = useState<Partner[]>(initialPartners || [])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('all')
  const [maxDistance, setMaxDistance] = useState(25)
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [showRequestDialog, setShowRequestDialog] = useState(false)
  const [requestMessage, setRequestMessage] = useState('')
  const [myRequests, setMyRequests] = useState<any[]>([])
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [isSending, setIsSending] = useState(false)

  const skillLevels = ['all', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PRO']
  
  // Default friendly message
  const defaultMessage = "Hi! I'd love to practice with you. I'm working on improving my game and think we'd be great practice partners. Let me know when you're available!"

  useEffect(() => {
    loadPartners()
    loadRequests()
  }, [])

  const loadPartners = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/partners/find')
      if (response.ok) {
        const data = await response.json()
        setPartners(data.partners || [])
        setFilteredPartners(data.partners || [])
      }
    } catch (error) {
      console.error('Failed to load partners:', error)
    }
    setIsLoading(false)
  }

  const loadRequests = async () => {
    try {
      const response = await fetch('/api/partners/requests')
      if (response.ok) {
        const data = await response.json()
        setMyRequests(data.sent || [])
        setPendingRequests(data.received || [])
      }
    } catch (error) {
      console.error('Failed to load requests:', error)
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    applyFilters(term, selectedSkillLevel, maxDistance)
  }

  const handleSkillFilter = (level: string) => {
    setSelectedSkillLevel(level)
    applyFilters(searchTerm, level, maxDistance)
  }

  const handleDistanceFilter = (distance: number[]) => {
    setMaxDistance(distance[0])
    applyFilters(searchTerm, selectedSkillLevel, distance[0])
  }

  const applyFilters = (term: string, level: string, distance: number) => {
    let filtered = partners

    if (term) {
      filtered = filtered.filter(partner =>
        partner.name.toLowerCase().includes(term.toLowerCase()) ||
        partner.location?.toLowerCase().includes(term.toLowerCase())
      )
    }

    if (level !== 'all') {
      filtered = filtered.filter(partner => partner.skillLevel === level)
    }

    if (distance < 50) {
      filtered = filtered.filter(partner => !partner.distance || partner.distance <= distance)
    }

    // Sort by match score (intelligent matching)
    filtered.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))

    setFilteredPartners(filtered)
  }

  const sendPartnerRequest = async (partnerId: string) => {
    if (isSending) return // Prevent double-clicking
    
    setIsSending(true)
    try {
      const response = await fetch('/api/partners/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId,
          message: requestMessage.trim() || defaultMessage
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('✅ Partner request sent successfully!', {
          duration: 4000
        })
        
        setShowRequestDialog(false)
        setRequestMessage('')
        loadRequests()

        // Conditional redirect based on user role
        if (user?.role === 'ADMIN') {
          // Redirect admin users to Admin Dashboard Partners tab  
          router.push('/admin?tab=partners')
        } else {
          // Redirect regular users to My Requests page
          router.push('/connect/my-requests')
        }
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to send request')
      }
    } catch (error) {
      console.error('Failed to send request:', error)
      toast.error('Failed to send request. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const handleRequestAction = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      const response = await fetch(`/api/partners/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        toast.success(action === 'accept' ? 'Partner request accepted!' : 'Request declined')
        loadRequests()
        if (action === 'accept') {
          loadPartners()
        }
      }
    } catch (error) {
      console.error('Failed to update request:', error)
      toast.error('Failed to update request')
    }
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'from-green-500 to-emerald-500'
    if (score >= 75) return 'from-blue-500 to-cyan-500'
    if (score >= 60) return 'from-yellow-500 to-orange-500'
    return 'from-gray-500 to-slate-500'
  }

  const getMatchScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent Match'
    if (score >= 75) return 'Great Match'
    if (score >= 60) return 'Good Match'
    return 'Potential Match'
  }

  return (
    <div className="space-y-6">
      {/* Pending Requests Banner */}
      {pendingRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Sparkles className="h-6 w-6" />
                {pendingRequests.length} New Partner Request{pendingRequests.length > 1 ? 's' : ''}!
              </h3>
              <p className="text-white/90">
                {pendingRequests[0]?.senderName} wants to practice with you
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => handleRequestAction(pendingRequests[0].id, 'accept')}
                size="lg"
                className="bg-white text-purple-600 hover:bg-white/90 font-semibold"
              >
                <UserCheck className="h-5 w-5 mr-2" />
                Accept
              </Button>
              <Button
                onClick={() => handleRequestAction(pendingRequests[0].id, 'decline')}
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                Decline
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Smart Matching Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-2xl p-6"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-teal-900 mb-2">
              AI-Powered Smart Matching
            </h3>
            <p className="text-teal-700 text-sm mb-3">
              We analyze your skill level, goals, playing style, and location to find the perfect practice partners for you
            </p>
            <div className="flex flex-wrap gap-2">
              {user?.primaryGoals && Array.isArray(user.primaryGoals) && user.primaryGoals.map((goal: string, index: number) => (
                <Badge key={index} variant="secondary" className="bg-white/60 text-teal-700 border-teal-300">
                  <Target className="h-3 w-3 mr-1" />
                  {goal}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <Card className="border-0 shadow-lg bg-white">
        <CardContent className="p-6">
          <div className="flex gap-4 mb-4 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by name or location..."
                className="pl-10"
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {showFilters && <X className="h-4 w-4 ml-2" />}
            </Button>
          </div>

          {/* Skill Level Filter */}
          <div className="flex gap-2 flex-wrap mb-4">
            {skillLevels.map((level) => (
              <Button
                key={level}
                variant={selectedSkillLevel === level ? "default" : "outline"}
                size="sm"
                onClick={() => handleSkillFilter(level)}
                className={
                  selectedSkillLevel === level
                    ? "bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
                    : ""
                }
              >
                {level === 'all' ? 'All Levels' : level}
              </Button>
            ))}
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-4 border-t space-y-4"
              >
                <div>
                  <Label className="text-sm font-medium mb-2 flex items-center justify-between">
                    <span>Maximum Distance</span>
                    <span className="text-teal-600 font-semibold">{maxDistance} km</span>
                  </Label>
                  <Slider
                    value={[maxDistance]}
                    onValueChange={handleDistanceFilter}
                    max={50}
                    step={5}
                    className="mt-2"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-slate-600">
              <strong className="text-teal-600">{filteredPartners.length}</strong> partners found
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm('')
                setSelectedSkillLevel('all')
                setMaxDistance(25)
                setFilteredPartners(partners)
              }}
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Partners Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="text-slate-600 mt-4">Finding your perfect matches...</p>
        </div>
      ) : filteredPartners.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map((partner, index) => (
            <motion.div
              key={partner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="border-0 shadow-lg hover:shadow-2xl transition-all bg-white overflow-hidden group">
                <CardContent className="p-0">
                  {/* Match Score Badge */}
                  {partner.matchScore && partner.matchScore >= 60 && (
                    <div className={`bg-gradient-to-r ${getMatchScoreColor(partner.matchScore)} p-3 text-white`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          <span className="text-sm font-semibold">{getMatchScoreLabel(partner.matchScore)}</span>
                        </div>
                        <span className="text-sm font-bold">{partner.matchScore}%</span>
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Partner Info */}
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-16 w-16 ring-4 ring-teal-100">
                        <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white text-xl font-bold">
                          {partner.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900">{partner.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className="bg-gradient-to-r from-teal-600 to-cyan-600">
                            {partner.skillLevel}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{partner.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                      {partner.isAvailable && (
                        <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span>Available</span>
                        </div>
                      )}
                    </div>

                    {/* Location */}
                    {partner.location && (
                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-3 bg-slate-50 rounded-lg p-3">
                        <MapPin className="h-4 w-4 text-teal-600" />
                        <span>{partner.location}</span>
                        {partner.distance && (
                          <>
                            <span>•</span>
                            <span className="font-medium text-teal-600">{partner.distance.toFixed(1)} km away</span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Common Goals */}
                    {partner.commonGoals && partner.commonGoals.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs text-slate-500 font-medium mb-2">Common Goals</div>
                        <div className="flex flex-wrap gap-1">
                          {partner.commonGoals.map((goal, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              <Target className="h-3 w-3 mr-1" />
                              {goal}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Playing Style */}
                    {partner.playingStyle && (
                      <div className="mb-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3">
                        <div className="text-xs text-purple-700 font-medium mb-1">Playing Style</div>
                        <div className="text-sm text-purple-900">{partner.playingStyle}</div>
                      </div>
                    )}

                    {/* Availability */}
                    {partner.availability && partner.availability.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs text-slate-500 font-medium mb-2">
                          <Clock className="h-3 w-3 inline mr-1" />
                          Usually plays
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {partner.availability.map((day, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {day}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        onClick={() => {
                          setSelectedPartner(partner)
                          setRequestMessage(defaultMessage) // Pre-populate with default message
                          setShowRequestDialog(true)
                        }}
                        className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Connect
                      </Button>
                      <Button variant="outline" size="icon">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center">
              <Users className="h-10 w-10 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">No partners found</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Try adjusting your filters or search terms to find more practice partners in your area
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setSelectedSkillLevel('all')
                setMaxDistance(25)
                setFilteredPartners(partners)
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Send Request Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-teal-600" />
              Send Practice Partner Request
            </DialogTitle>
            <DialogDescription>
              Send a request to {selectedPartner?.name} to become practice partners
            </DialogDescription>
          </DialogHeader>
          
          {selectedPartner && (
            <div className="bg-slate-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white">
                    {selectedPartner.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{selectedPartner.name}</div>
                  <div className="text-sm text-slate-600 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{selectedPartner.skillLevel}</Badge>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {selectedPartner.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label htmlFor="message" className="text-sm font-medium mb-2 block">
                Your message
              </Label>
              <Textarea
                id="message"
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder={defaultMessage}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-slate-500 mt-1">
                ✨ We've added a friendly default message. Feel free to personalize it or use it as-is!
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowRequestDialog(false)
                setRequestMessage('')
              }}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedPartner && sendPartnerRequest(selectedPartner.id)}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
              disabled={isSending || !selectedPartner}
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {isSending ? 'Sending...' : 'Send Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
