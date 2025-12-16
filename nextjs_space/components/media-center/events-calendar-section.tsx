
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, 
  MapPin, 
  Trophy, 
  Users, 
  DollarSign,
  ExternalLink,
  Search,
  Filter,
  Star,
  Crown,
  Clock,
  Building,
  Loader2
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description?: string;
  eventType: string;
  startDate: string;
  endDate: string;
  location?: string;
  city?: string;
  state?: string;
  venueName?: string;
  organizerName?: string;
  websiteUrl?: string;
  registrationUrl?: string;
  prizeMoney?: string;
  skillLevel?: string;
  format?: string;
  status: string;
}

interface EventsCalendarSectionProps {
  tierAccess?: {
    canAccessAdvancedFeatures: boolean;
    showUpgradePrompts: boolean;
  };
}

export function EventsCalendarSection({ tierAccess }: EventsCalendarSectionProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [skillLevelFilter, setSkillLevelFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  const eventTypeOptions = [
    { value: 'all', label: 'All Events' },
    { value: 'PPA_TOURNAMENT', label: 'PPA Tour' },
    { value: 'MLP_TOURNAMENT', label: 'Major League Pickleball' },
    { value: 'APP_TOURNAMENT', label: 'APP Tour' },
    { value: 'USA_PICKLEBALL_TOURNAMENT', label: 'USA Pickleball' },
    { value: 'GOLDEN_TICKET_EVENT', label: 'Golden Ticket' },
    { value: 'LOCAL_TOURNAMENT', label: 'Local Tournaments' }
  ];

  const skillLevelOptions = [
    { value: 'all', label: 'All Levels' },
    { value: 'BEGINNER', label: 'Beginner (2.0-2.5)' },
    { value: 'INTERMEDIATE', label: 'Intermediate (3.0-3.5)' },
    { value: 'ADVANCED', label: 'Advanced (4.0-4.5)' },
    { value: 'PRO', label: 'Professional (5.0+)' }
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchQuery, eventTypeFilter, skillLevelFilter]);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/media-center/events?limit=50');
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.events || []);
        setError(null);
      } else {
        setError(data.message || 'Failed to load events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Connection error - showing sample data');
      // Show sample events
      setEvents([
        {
          id: '1',
          title: 'PPA World Championships 2025',
          description: 'The pinnacle of professional pickleball competition',
          eventType: 'PPA_TOURNAMENT',
          startDate: '2025-11-03',
          endDate: '2025-11-09',
          location: 'Farmers Branch, Texas',
          city: 'Farmers Branch',
          state: 'Texas',
          venueName: 'Farmers Branch Historical Park',
          organizerName: 'Professional Pickleball Association',
          prizeMoney: '$300,000',
          skillLevel: 'PRO',
          format: 'DOUBLES',
          status: 'UPCOMING',
          websiteUrl: 'https://ppatour.com',
          registrationUrl: 'https://ppatour.com/register'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query) ||
        event.organizerName?.toLowerCase().includes(query)
      );
    }

    // Event type filter
    if (eventTypeFilter !== 'all') {
      filtered = filtered.filter(event => event.eventType === eventTypeFilter);
    }

    // Skill level filter
    if (skillLevelFilter !== 'all') {
      filtered = filtered.filter(event => event.skillLevel === skillLevelFilter);
    }

    setFilteredEvents(filtered);
  };

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'PPA_TOURNAMENT': return 'bg-blue-500';
      case 'MLP_TOURNAMENT': return 'bg-purple-500';
      case 'APP_TOURNAMENT': return 'bg-green-500';
      case 'USA_PICKLEBALL_TOURNAMENT': return 'bg-red-500';
      case 'GOLDEN_TICKET_EVENT': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'PPA_TOURNAMENT':
      case 'MLP_TOURNAMENT':
      case 'APP_TOURNAMENT':
        return <Trophy className="w-4 h-4" />;
      case 'USA_PICKLEBALL_TOURNAMENT':
        return <Star className="w-4 h-4" />;
      case 'GOLDEN_TICKET_EVENT':
        return <Crown className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    }
    
    return `${start.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })} - ${end.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })}`;
  };

  const getDaysUntilEvent = (startDate: string) => {
    const now = new Date();
    const eventStart = new Date(startDate);
    const diffTime = eventStart.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return null;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days`;
  };

  const openEventLink = (url?: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Events Calendar
          <Badge variant="outline" className="ml-2">
            {filteredEvents.length} events
          </Badge>
        </CardTitle>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search events, locations, organizers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {eventTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={skillLevelFilter} onValueChange={setSkillLevelFilter}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <Users className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {skillLevelOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error && filteredEvents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchEvents} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Try Again
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredEvents.map((event) => {
                const daysUntil = getDaysUntilEvent(event.startDate);
                
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${getEventTypeColor(event.eventType)} text-white`}>
                            {getEventTypeIcon(event.eventType)}
                            <span className="ml-1">
                              {eventTypeOptions.find(opt => opt.value === event.eventType)?.label || event.eventType}
                            </span>
                          </Badge>
                          {event.skillLevel && (
                            <Badge variant="outline">
                              <Users className="w-3 h-3 mr-1" />
                              {event.skillLevel}
                            </Badge>
                          )}
                          {event.prizeMoney && (
                            <Badge variant="outline" className="text-green-600">
                              <DollarSign className="w-3 h-3 mr-1" />
                              {event.prizeMoney}
                            </Badge>
                          )}
                        </div>
                        
                        <h4 className="font-semibold text-lg mb-1">{event.title}</h4>
                        
                        {event.description && (
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm font-medium mb-1">
                          {formatDateRange(event.startDate, event.endDate)}
                        </div>
                        {daysUntil && (
                          <Badge variant="secondary">
                            <Clock className="w-3 h-3 mr-1" />
                            {daysUntil}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 text-sm text-muted-foreground">
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      
                      {event.venueName && (
                        <div className="flex items-center gap-1">
                          <Building className="w-3 h-3 flex-shrink-0" />
                          <span>{event.venueName}</span>
                        </div>
                      )}
                      
                      {event.organizerName && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 flex-shrink-0" />
                          <span>{event.organizerName}</span>
                        </div>
                      )}
                      
                      {event.format && (
                        <div className="flex items-center gap-1">
                          <Trophy className="w-3 h-3 flex-shrink-0" />
                          <span>{event.format}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {event.websiteUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEventLink(event.websiteUrl)}
                        >
                          Event Details
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                      
                      {event.registrationUrl && (
                        <Button
                          size="sm"
                          onClick={() => openEventLink(event.registrationUrl)}
                        >
                          Register
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                      
                      <Button size="sm" variant="ghost">
                        <Calendar className="w-3 h-3 mr-1" />
                        Add to Calendar
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            
            {filteredEvents.length === 0 && !loading && (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No events found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery('');
                    setEventTypeFilter('all');
                    setSkillLevelFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
            
            {/* Limited access upgrade prompt */}
            {!tierAccess?.canAccessAdvancedFeatures && tierAccess?.showUpgradePrompts && filteredEvents.length >= 10 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center"
              >
                <Crown className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <h4 className="font-medium mb-2">See More Events</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Upgrade to access the complete tournament calendar with advanced filtering
                </p>
                <Button className="bg-blue-500 hover:bg-blue-600">
                  Upgrade for Full Calendar
                </Button>
              </motion.div>
            )}

            {error && filteredEvents.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">{error}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
