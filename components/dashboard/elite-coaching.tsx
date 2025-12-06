
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Calendar,
  Clock,
  Star,
  Video,
  Users,
  MessageCircle,
  CheckCircle,
  Award,
  Target,
  Zap,
  BookOpen,
  TrendingUp,
  Phone
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EliteCoachingProps {
  user: any
}

const coaches = [
  {
    id: 1,
    name: "Sarah Martinez",
    specialty: "Third Shot Drop & Strategy",
    rating: 4.9,
    reviews: 127,
    experience: "8 years",
    price: 75,
    image: "https://www.pickleballdrillshq.com/wp-content/uploads/2024/09/hof-jorge-capestany.png",
    bio: "Former professional pickleball player and certified coach. Specializes in transition game and strategic play.",
    achievements: ["USAPA Certified", "Former Pro Player", "Tournament Winner"],
    availability: [
      { date: "2024-10-20", time: "9:00 AM", duration: 60, available: true },
      { date: "2024-10-20", time: "2:00 PM", duration: 60, available: true },
      { date: "2024-10-21", time: "10:00 AM", duration: 60, available: false },
      { date: "2024-10-21", time: "4:00 PM", duration: 90, available: true },
    ]
  },
  {
    id: 2,
    name: "Mike Thompson",
    specialty: "Mental Game & Performance",
    rating: 4.8,
    reviews: 98,
    experience: "6 years",
    price: 85,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
    bio: "Sports psychologist and pickleball coach focusing on mental training and peak performance techniques.",
    achievements: ["Sports Psychology PhD", "Mental Performance Specialist", "Author"],
    availability: [
      { date: "2024-10-20", time: "11:00 AM", duration: 60, available: true },
      { date: "2024-10-21", time: "9:00 AM", duration: 60, available: true },
      { date: "2024-10-22", time: "3:00 PM", duration: 90, available: true },
    ]
  },
  {
    id: 3,
    name: "Lisa Chen",
    specialty: "Beginners & Fundamentals",
    rating: 4.7,
    reviews: 156,
    experience: "5 years",
    price: 60,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
    bio: "Certified pickleball instructor with a passion for teaching newcomers the fundamentals of the game.",
    achievements: ["USAPA Instructor", "Youth Coach", "Clinic Specialist"],
    availability: [
      { date: "2024-10-20", time: "1:00 PM", duration: 60, available: true },
      { date: "2024-10-21", time: "11:00 AM", duration: 60, available: true },
      { date: "2024-10-21", time: "5:00 PM", duration: 60, available: true },
    ]
  }
]

const sessionTypes = [
  {
    type: "private",
    title: "Private Lesson",
    description: "One-on-one personalized coaching session",
    duration: "60 minutes",
    icon: Target,
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    type: "group",
    title: "Group Clinic",
    description: "Small group training with other players",
    duration: "90 minutes",
    icon: Users,
    gradient: "from-green-500 to-emerald-500"
  },
  {
    type: "video_review",
    title: "Video Analysis",
    description: "Review and analyze your match footage",
    duration: "30 minutes",
    icon: Video,
    gradient: "from-purple-500 to-pink-500"
  }
]

export default function EliteCoaching({ user }: EliteCoachingProps) {
  const [selectedCoach, setSelectedCoach] = useState<any>(null)
  const [selectedSessionType, setSelectedSessionType] = useState("")
  const [selectedSlot, setSelectedSlot] = useState<any>(null)
  const [showBookingDialog, setShowBookingDialog] = useState(false)
  const [bookingNotes, setBookingNotes] = useState("")
  const { toast } = useToast()

  const handleBookSession = async () => {
    if (!selectedCoach || !selectedSlot || !selectedSessionType) {
      toast({
        title: "Missing Information",
        description: "Please select a coach, session type, and time slot.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coachId: selectedCoach.id,
          sessionType: selectedSessionType,
          startTime: new Date(`${selectedSlot.date}T${selectedSlot.time}`),
          duration: selectedSlot.duration,
          notes: bookingNotes,
          amount: selectedCoach.price * (selectedSlot.duration / 60) * 100, // Convert to cents
        }),
      })

      if (response.ok) {
        toast({
          title: "Session Booked Successfully! 🏓",
          description: `Your ${selectedSessionType} session with ${selectedCoach.name} is confirmed.`,
        })
        setShowBookingDialog(false)
        setSelectedCoach(null)
        setSelectedSessionType("")
        setSelectedSlot(null)
        setBookingNotes("")
      } else {
        throw new Error('Failed to book session')
      }
    } catch (error) {
      toast({
        title: "Booking Failed",
        description: "Unable to book the session. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleRequestIntro = (coach: any) => {
    toast({
      title: `Intro call requested with ${coach.name}! 📞`,
      description: "You'll receive an email with available times for a free 15-minute introduction call.",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
            Elite Coaching Hub
          </h2>
          <p className="text-slate-600 mt-2">
            Book sessions with professional coaches and accelerate your improvement
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-teal-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-slate-600">Coaches Available</span>
        </div>
      </div>

      {/* Session Types */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-500" />
              Session Types
            </CardTitle>
            <CardDescription>
              Choose the type of coaching that best fits your needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {sessionTypes.map((session, index) => (
                <motion.div
                  key={session.type}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  <Card className="p-4 hover:shadow-md transition-all cursor-pointer border-slate-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${session.gradient} rounded-xl flex items-center justify-center`}>
                        <session.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{session.title}</h3>
                        <p className="text-sm text-slate-600">{session.duration}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">
                      {session.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Coach Directory */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-500" />
              Professional Coaches
            </CardTitle>
            <CardDescription>
              Connect with certified coaches who specialize in different aspects of the game
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {coaches.map((coach, index) => (
                <motion.div
                  key={coach.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 hover:shadow-md transition-all border-slate-200">
                    <div className="flex items-start gap-6">
                      <div className="relative flex-shrink-0">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={coach.image} alt={coach.name} />
                          <AvatarFallback>{coach.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-1">
                              {coach.name}
                            </h3>
                            <p className="text-teal-600 font-medium mb-2">
                              {coach.specialty}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="font-medium">{coach.rating}</span>
                                <span>({coach.reviews} reviews)</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{coach.experience} experience</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                <span>${coach.price}/hour</span>
                              </div>
                            </div>
                          </div>
                          <Badge className="bg-teal-100 text-teal-800">
                            Available
                          </Badge>
                        </div>
                        
                        <p className="text-slate-600 mb-4">
                          {coach.bio}
                        </p>
                        
                        <div className="flex items-center gap-2 mb-4">
                          {coach.achievements.map((achievement, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {achievement}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Button
                            onClick={() => {
                              setSelectedCoach(coach)
                              setShowBookingDialog(true)
                            }}
                            className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            Book Session
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleRequestIntro(coach)}
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            Request Intro Call
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Your Upcoming Sessions
            </CardTitle>
            <CardDescription>
              Manage your booked coaching sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {user?.bookings?.length > 0 ? (
              <div className="space-y-4">
                {user.bookings.slice(0, 3).map((booking: any, index: number) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-500 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">
                          {booking.sessionType} with {booking.coach?.name}
                        </h4>
                        <p className="text-sm text-slate-600">
                          {new Date(booking.startTime).toLocaleDateString()} at{' '}
                          {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Confirmed
                      </Badge>
                      <Button size="sm" variant="outline">
                        Reschedule
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg font-medium">No upcoming sessions</p>
                <p className="text-sm">Book your first coaching session to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedCoach && (
                <Avatar>
                  <AvatarImage src={selectedCoach.image} alt={selectedCoach.name} />
                  <AvatarFallback>{selectedCoach.name[0]}</AvatarFallback>
                </Avatar>
              )}
              <div>
                <div>Book Session with {selectedCoach?.name}</div>
                <div className="text-sm font-normal text-slate-600">
                  {selectedCoach?.specialty} • ${selectedCoach?.price}/hour
                </div>
              </div>
            </DialogTitle>
            <DialogDescription>
              Choose your session type and preferred time slot
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Session Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="sessionType">Session Type</Label>
              <Select value={selectedSessionType} onValueChange={setSelectedSessionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select session type" />
                </SelectTrigger>
                <SelectContent>
                  {sessionTypes.map((session) => (
                    <SelectItem key={session.type} value={session.type}>
                      {session.title} - {session.duration}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Slot Selection */}
            <div className="space-y-2">
              <Label>Available Time Slots</Label>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                {selectedCoach?.availability?.map((slot: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSlot(slot)}
                    disabled={!slot.available}
                    className={`p-3 text-left rounded-lg border transition-all ${
                      selectedSlot === slot
                        ? 'bg-teal-50 border-teal-300 text-teal-800'
                        : slot.available
                        ? 'bg-white border-slate-200 hover:bg-slate-50'
                        : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {new Date(slot.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-sm">
                          {slot.time} • {slot.duration} minutes
                        </p>
                      </div>
                      {selectedSlot === slot && (
                        <CheckCircle className="w-5 h-5 text-teal-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Session Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="What would you like to work on in this session?"
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Cost Summary */}
            {selectedCoach && selectedSlot && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-600">Session Cost:</span>
                  <span className="font-medium text-slate-900">
                    ${(selectedCoach.price * (selectedSlot.duration / 60)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Duration:</span>
                  <span className="font-medium text-slate-900">
                    {selectedSlot.duration} minutes
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowBookingDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBookSession}
              className="bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
              disabled={!selectedSessionType || !selectedSlot}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
