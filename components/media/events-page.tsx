
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar,
  Trophy,
  MapPin,
  ExternalLink,
  Search,
  Filter,
  Clock,
  DollarSign,
  Tv,
  Users,
  Crown,
  Bell,
  Plus,
  Star,
  Building,
  Award,
  Zap
} from 'lucide-react';

interface Event {
  id: string;
  name: string;
  organization: string;
  dates: string;
  startDate: string;
  endDate: string;
  location?: string;
  venue?: string;
  website?: string;
  description: string;
  broadcast?: string;
  expectedAttendance?: string;
  ticketInfo?: string;
  qualification?: string;
  economicImpact?: string;
  type: string;
  prizeAmount: number;
  tier_requirement: string;
  sponsors?: string[];
  divisions?: string[];
  features?: string[];
  participants?: string[];
  daysUntil: number;
  status: 'past' | 'today' | 'upcoming';
  isHighlighted: boolean;
}

interface EventsResponse {
  success: boolean;
  events: Event[];
  totalCount: number;
  userTier: string;
  stats: {
    total: number;
    upcoming: number;
    thisMonth: number;
    majorEvents: number;
  };
  availableTypes: Array<{ id: string; name: string }>;
  availableOrganizations: string[];
}

export function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(true);
  const [userTier, setUserTier] = useState<string>('FREE');
  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    thisMonth: 0,
    majorEvents: 0
  });
  const [availableTypes, setAvailableTypes] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    fetchEvents();
  }, [selectedType, showUpcomingOnly]);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedType !== 'all') params.append('type', selectedType);
      if (showUpcomingOnly) params.append('upcoming', 'true');

      const response = await fetch(`/api/media/events?${params}`);
      const data: EventsResponse = await response.json();
      
      if (data.success) {
        setEvents(data.events);
        setFilteredEvents(data.events);
        setUserTier(data.userTier);
        setStats(data.stats);
        setAvailableTypes(data.availableTypes);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    if (!searchTerm) {
      setFilteredEvents(events);
      return;
    }

    const filtered = events.filter(event =>
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEvents(filtered);
  };

  const handleRemindMe = async (eventId: string) => {
    try {
      const response = await fetch('/api/media/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remind', eventId })
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error setting reminder:', error);
    }
  };

  const handleAddToCalendar = async (eventId: string) => {
    try {
      const response = await fetch('/api/media/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addToCalendar', eventId })
      });
      const data = await response.json();
      if (data.success) {
        // Create calendar event data
        const cal = data.calendarData;
        const startDate = new Date(cal.startDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const endDate = new Date(cal.endDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        
        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(cal.title)}&dates=${startDate}/${endDate}&details=${encodeURIComponent(cal.description)}&location=${encodeURIComponent(cal.location)}&sf=true&output=xml`;
        window.open(calendarUrl, '_blank');
      }
    } catch (error) {
      console.error('Error adding to calendar:', error);
    }
  };

  const getEventTypeColor = (type: string) => {
    const colorMap: { [key: string]: string } = {
      'PPA_TOUR': 'bg-blue-100 text-blue-800 border-blue-200',
      'APP_TOUR': 'bg-green-100 text-green-800 border-green-200',
      'MLP': 'bg-purple-100 text-purple-800 border-purple-200',
      'USA_PICKLEBALL': 'bg-red-100 text-red-800 border-red-200',
      'CELEBRITY_EVENT': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'MAJOR_TOURNAMENT': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusColor = (daysUntil: number) => {
    if (daysUntil < 0) return 'text-gray-500';
    if (daysUntil === 0) return 'text-red-600 font-semibold';
    if (daysUntil <= 7) return 'text-orange-600 font-semibold';
    if (daysUntil <= 30) return 'text-blue-600';
    return 'text-gray-600';
  };

  if (loading) {
    return <EventsPageSkeleton />;
  }

  return (
    <div className="relative">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-champion-gold to-champion-blue rounded-2xl blur-3xl opacity-20"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-champion-gold" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-champion-gold to-champion-blue bg-clip-text text-transparent mb-4">
                Pickleball Events & Tournaments
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Stay updated with major tournaments, championships, and events from around the world
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-champion-gold mb-1">{stats.upcoming}</div>
            <div className="text-sm text-gray-600">Upcoming Events</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-champion-blue mb-1">{stats.thisMonth}</div>
            <div className="text-sm text-gray-600">This Month</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-champion-green mb-1">{stats.majorEvents}</div>
            <div className="text-sm text-gray-600">Major Events</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-gray-700 mb-1">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Events</div>
          </Card>
        </motion.div>

        {/* Filters and Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search events, organizations, or locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {availableTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                variant={showUpcomingOnly ? "default" : "outline"}
                onClick={() => setShowUpcomingOnly(!showUpcomingOnly)}
                className="w-full md:w-auto"
              >
                <Clock className="w-4 h-4 mr-2" />
                {showUpcomingOnly ? 'Upcoming Only' : 'All Events'}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Events List */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`hover:shadow-lg transition-all border-2 ${event.isHighlighted ? 'border-champion-gold/30 bg-gradient-to-r from-champion-gold/5 to-champion-blue/5' : 'hover:border-champion-gold/20'} group`}>
                <CardContent className="p-6">
                  <div className="grid lg:grid-cols-4 gap-6">
                    {/* Event Info */}
                    <div className="lg:col-span-2">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-champion-gold transition-colors">
                            {event.name}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <Building className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{event.organization}</span>
                            <Badge className={getEventTypeColor(event.type)}>
                              {event.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          
                          {event.location && (
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {event.location}{event.venue ? `, ${event.venue}` : ''}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {event.isHighlighted && (
                          <Star className="w-6 h-6 text-champion-gold fill-current flex-shrink-0" />
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                      
                      {/* Additional Info */}
                      <div className="space-y-2">
                        {event.prizeAmount > 0 && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600">
                              ${event.prizeAmount.toLocaleString()} Prize Money
                            </span>
                          </div>
                        )}
                        
                        {event.broadcast && (
                          <div className="flex items-center gap-2">
                            <Tv className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-gray-600">{event.broadcast}</span>
                          </div>
                        )}
                        
                        {event.expectedAttendance && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-500" />
                            <span className="text-sm text-gray-600">{event.expectedAttendance}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Date and Status */}
                    <div className="lg:col-span-1">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <Calendar className="w-8 h-8 mx-auto mb-2 text-champion-gold" />
                        <div className="text-sm font-medium text-gray-900 mb-1">{event.dates}</div>
                        <div className={`text-sm ${getStatusColor(event.daysUntil)}`}>
                          {event.status === 'past' ? 'Past Event' :
                           event.status === 'today' ? 'Today!' :
                           `${event.daysUntil} days away`}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="lg:col-span-1">
                      <div className="space-y-3">
                        {event.website && (
                          <Button
                            className="w-full"
                            variant="outline"
                            onClick={() => window.open(event.website, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Event Website
                          </Button>
                        )}
                        
                        {event.status === 'upcoming' && (
                          <>
                            <Button
                              className="w-full"
                              variant="secondary"
                              onClick={() => handleRemindMe(event.id)}
                            >
                              <Bell className="w-4 h-4 mr-2" />
                              Remind Me
                            </Button>
                            
                            <Button
                              className="w-full"
                              variant="outline"
                              onClick={() => handleAddToCalendar(event.id)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add to Calendar
                            </Button>
                          </>
                        )}
                      </div>
                      
                      {event.tier_requirement === 'PREMIUM' && userTier === 'FREE' && (
                        <Badge className="w-full mt-3 justify-center text-xs bg-champion-gold/10 text-champion-gold border-champion-gold">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium Event Details
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Features/Tags */}
                  {(event.sponsors?.length || event.divisions?.length || event.features?.length || event.participants?.length) && (
                    <div className="mt-6 pt-4 border-t space-y-3">
                      {event.sponsors?.length && (
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Sponsors:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {event.sponsors.slice(0, 4).map(sponsor => (
                              <Badge key={sponsor} variant="outline" className="text-xs">
                                {sponsor}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {event.divisions?.length && (
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Divisions:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {event.divisions.map(division => (
                              <Badge key={division} variant="secondary" className="text-xs">
                                {division}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {event.features?.length && (
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Features:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {event.features.map(feature => (
                              <Badge key={feature} className="text-xs bg-champion-blue/10 text-champion-blue border-champion-blue">
                                <Zap className="w-3 h-3 mr-1" />
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {event.participants?.length && (
                        <div>
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Participants:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {event.participants.map(participant => (
                              <Badge key={participant} className="text-xs bg-champion-green/10 text-champion-green border-champion-green">
                                <Award className="w-3 h-3 mr-1" />
                                {participant}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {filteredEvents.length === 0 && !loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search terms or filters</p>
            <Button onClick={() => { setSearchTerm(''); setSelectedType('all'); }}>
              Clear Filters
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function EventsPageSkeleton() {
  return (
    <div className="relative">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <Skeleton className="h-16 w-16 mx-auto mb-4 rounded-full" />
          <Skeleton className="h-12 w-96 mx-auto mb-4" />
          <Skeleton className="h-6 w-[500px] mx-auto" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="text-center p-4">
              <Skeleton className="h-8 w-16 mx-auto mb-1" />
              <Skeleton className="h-4 w-24 mx-auto" />
            </Card>
          ))}
        </div>
        
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
        </Card>
        
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="grid lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-2">
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-4 w-32 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <div className="lg:col-span-1">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <Skeleton className="h-8 w-8 mx-auto mb-2" />
                      <Skeleton className="h-4 w-24 mx-auto mb-1" />
                      <Skeleton className="h-4 w-16 mx-auto" />
                    </div>
                  </div>
                  <div className="lg:col-span-1 space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}