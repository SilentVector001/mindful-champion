'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Users, DollarSign, Trophy, Clock } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface TournamentCardProps {
  tournament: {
    id: string;
    name: string;
    description?: string;
    city: string;
    state: string;
    venueName: string;
    startDate: Date | string;
    endDate: Date | string;
    skillLevels: string[];
    format: string[];
    currentRegistrations?: number;
    maxParticipants?: number;
    entryFee?: number;
    prizePool?: number;
    imageUrl?: string;
    status: string;
  };
  index?: number;
}

export function TournamentCard({ tournament, index = 0 }: TournamentCardProps) {
  const startDate = new Date(tournament?.startDate ?? new Date());
  const endDate = new Date(tournament?.endDate ?? new Date());
  const registrationPercentage = tournament?.maxParticipants
    ? ((tournament?.currentRegistrations ?? 0) / tournament.maxParticipants) * 100
    : 0;
  const isAlmostFull = registrationPercentage > 80;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/tournaments/${tournament?.id ?? ''}`}>
        <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 h-full border-2 hover:border-teal-400/30">
          {/* Tournament Image */}
          <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-teal-50 to-blue-50">
            {tournament?.imageUrl ? (
              <Image
                src={tournament.imageUrl}
                alt={tournament?.name ?? 'Tournament'}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Trophy className="w-16 h-16 text-teal-300" />
              </div>
            )}
            
            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              <Badge 
                variant={tournament?.status === 'UPCOMING' ? 'default' : 'secondary'}
                className="bg-white/90 text-teal-600 backdrop-blur-sm"
              >
                {tournament?.status ?? 'UPCOMING'}
              </Badge>
            </div>
            
            {/* Registration Alert */}
            {isAlmostFull && (
              <div className="absolute bottom-4 left-4">
                <Badge variant="destructive" className="bg-red-500/90 backdrop-blur-sm animate-pulse">
                  <Users className="w-3 h-3 mr-1" />
                  Almost Full!
                </Badge>
              </div>
            )}
          </div>

          <CardHeader className="pb-3">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-2">
              {tournament?.name ?? 'Tournament'}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2 mt-2">
              {tournament?.description ?? 'No description available'}
            </p>
          </CardHeader>

          <CardContent className="space-y-3 pb-3">
            {/* Location */}
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="w-4 h-4 text-teal-500 flex-shrink-0" />
              <span className="text-sm truncate">
                {tournament?.city ?? ''}, {tournament?.state ?? ''} • {tournament?.venueName ?? ''}
              </span>
            </div>

            {/* Dates */}
            <div className="flex items-center gap-2 text-gray-700">
              <Calendar className="w-4 h-4 text-teal-500 flex-shrink-0" />
              <span className="text-sm">
                {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
              </span>
            </div>

            {/* Skill Levels */}
            <div className="flex items-center gap-2 flex-wrap">
              {(tournament?.skillLevels ?? []).map((level) => (
                <Badge key={level} variant="outline" className="text-xs">
                  {level}
                </Badge>
              ))}
            </div>

            {/* Tournament Format */}
            <div className="flex items-center gap-2 flex-wrap">
              {(tournament?.format ?? []).map((fmt) => (
                <Badge key={fmt} variant="secondary" className="text-xs">
                  {fmt?.replace('_', ' ') ?? ''}
                </Badge>
              ))}
            </div>
          </CardContent>

          <CardFooter className="flex justify-between items-center border-t pt-4">
            <div className="flex flex-col gap-1">
              {tournament?.entryFee ? (
                <div className="flex items-center gap-1 text-gray-700">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold">${tournament.entryFee}</span>
                  <span className="text-xs text-gray-500">entry</span>
                </div>
              ) : null}
              {tournament?.prizePool ? (
                <div className="flex items-center gap-1 text-gray-700">
                  <Trophy className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-semibold">
                    ${(tournament.prizePool / 1000).toFixed(1)}k
                  </span>
                  <span className="text-xs text-gray-500">prize</span>
                </div>
              ) : null}
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1 text-gray-700">
                <Users className="w-4 h-4 text-teal-500" />
                <span className="text-sm font-medium">
                  {tournament?.currentRegistrations ?? 0}/{tournament?.maxParticipants ?? 0}
                </span>
              </div>
              <span className="text-xs text-gray-500">registered</span>
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
}
