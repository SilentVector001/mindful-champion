// @ts-nocheck
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

interface Tournament {
  id: string;
  name: string;
  city: string;
  state: string;
  startDate: Date | string;
  endDate: Date | string;
  skillLevels: string[];
}

interface CalendarViewProps {
  tournaments: Tournament[];
  onTournamentClick?: (tournamentId: string) => void;
}

export function CalendarView({ tournaments, onTournamentClick }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Group tournaments by date
  const tournamentsByDate = (tournaments ?? []).reduce((acc, tournament) => {
    const startDate = new Date(tournament?.startDate ?? new Date());
    const dateKey = format(startDate, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey]?.push(tournament);
    return acc;
  }, {} as Record<string, Tournament[]>);

  const getTournamentsForDay = (day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    return tournamentsByDate[dateKey] || [];
  };

  const previousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-6 h-6 text-teal-600" />
              <CardTitle className="text-2xl">
                {format(currentMonth, 'MMMM yyyy')}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Grid */}
      <Card className="border-2">
        <CardContent className="p-4">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-gray-600 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: monthStart.getDay() }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}

            {/* Days of the month */}
            {daysInMonth.map((day, index) => {
              const dayTournaments = getTournamentsForDay(day);
              const hasEvents = dayTournaments.length > 0;
              const isToday = isSameDay(day, new Date());

              return (
                <motion.div
                  key={day.toISOString()}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.01 }}
                  className="aspect-square"
                >
                  <Card
                    className={`h-full ${
                      hasEvents
                        ? 'border-teal-400 bg-teal-50 hover:shadow-md cursor-pointer'
                        : 'border-gray-200'
                    } ${
                      isToday ? 'ring-2 ring-teal-600' : ''
                    } transition-all duration-200`}
                  >
                    <CardContent className="p-2 h-full flex flex-col">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-sm font-medium ${
                            isToday ? 'text-teal-600 font-bold' : 'text-gray-700'
                          }`}
                        >
                          {format(day, 'd')}
                        </span>
                        {hasEvents && (
                          <Badge variant="default" className="bg-teal-600 h-5 px-1 text-xs">
                            {dayTournaments.length}
                          </Badge>
                        )}
                      </div>

                      {/* Tournament indicators */}
                      {hasEvents && (
                        <div className="flex-1 overflow-hidden space-y-1">
                          {dayTournaments.slice(0, 2).map((tournament) => (
                            <button
                              key={tournament?.id ?? ''}
                              onClick={() => onTournamentClick?.(tournament?.id ?? '')}
                              className="w-full text-left px-1 py-0.5 bg-white rounded text-xs truncate hover:bg-teal-100 transition-colors"
                            >
                              <div className="flex items-center gap-1">
                                <Trophy className="w-3 h-3 text-teal-600 flex-shrink-0" />
                                <span className="truncate text-gray-700">
                                  {tournament?.city ?? ''}, {tournament?.state ?? ''}
                                </span>
                              </div>
                            </button>
                          ))}
                          {dayTournaments.length > 2 && (
                            <div className="text-xs text-center text-teal-600 font-medium">
                              +{dayTournaments.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="border-2">
        <CardContent className="py-4">
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-teal-600 bg-teal-50" />
              <span className="text-sm text-gray-600">Has Tournament</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded ring-2 ring-teal-600" />
              <span className="text-sm text-gray-600">Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-gray-200" />
              <span className="text-sm text-gray-600">No Events</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
