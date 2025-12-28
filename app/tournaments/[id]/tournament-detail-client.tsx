'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Trophy,
  Phone,
  Mail,
  Globe,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  UserPlus,
  Loader2,
} from 'lucide-react';
import MainNavigation from '@/components/navigation/main-navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

interface TournamentDetailClientProps {
  tournament: any;
  userId: string;
  isRegistered: boolean;
  registrationStatus?: string;
}

export function TournamentDetailClient({
  tournament,
  userId,
  isRegistered: initialIsRegistered,
  registrationStatus: initialStatus,
}: TournamentDetailClientProps) {
  const router = useRouter();
  const { data: session, status } = useSession() || {};
  const [user, setUser] = useState<any>(null);
  const [isRegistered, setIsRegistered] = useState(initialIsRegistered);
  const [registrationStatus, setRegistrationStatus] = useState(initialStatus);
  const [isRegistering, setIsRegistering] = useState(false);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/user/profile');
          if (response?.ok) {
            const data = await response.json();
            setUser(data?.user ?? session?.user);
          } else {
            setUser(session?.user);
          }
        } catch (error) {
          setUser(session?.user);
        }
      }
    };
    
    if (status === 'authenticated') {
      fetchUser();
    }
  }, [session, status]);

  const startDate = new Date(tournament?.startDate ?? new Date());
  const endDate = new Date(tournament?.endDate ?? new Date());
  const registrationStart = new Date(tournament?.registrationStart ?? new Date());
  const registrationEnd = new Date(tournament?.registrationEnd ?? new Date());
  const now = new Date();

  const isRegistrationOpen = now >= registrationStart && now <= registrationEnd;
  const registrationPercentage = tournament?.maxParticipants
    ? ((tournament?.currentRegistrations ?? 0) / tournament.maxParticipants) * 100
    : 0;
  const spotsLeft = (tournament?.maxParticipants ?? 0) - (tournament?.currentRegistrations ?? 0);

  const handleRegister = async () => {
    try {
      setIsRegistering(true);
      const response = await fetch('/api/tournaments/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tournamentId: tournament?.id ?? '',
          userId,
          skillLevel: 'INTERMEDIATE', // Default, should be from user profile
          format: tournament?.format?.[0] ?? 'DOUBLES',
        }),
      });

      if (response?.ok) {
        setIsRegistered(true);
        setRegistrationStatus('PENDING');
        router.refresh();
      } else {
        alert('Failed to register. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleExternalRegistration = () => {
    if (tournament?.registrationUrl) {
      window.open(tournament.registrationUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50">
      <MainNavigation user={user ?? session?.user} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 hover:bg-teal-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tournaments
        </Button>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Tournament Image */}
          <Card className="overflow-hidden border-2">
            <div className="relative aspect-[21/9] bg-gradient-to-br from-teal-50 to-blue-50">
              {tournament?.imageUrl ? (
                <Image
                  src={tournament.imageUrl}
                  alt={tournament?.name ?? 'Tournament'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Trophy className="w-24 h-24 text-teal-300" />
                </div>
              )}
              {/* Status Badge */}
              <div className="absolute top-6 right-6">
                <Badge variant="default" className="bg-white/90 text-teal-600 backdrop-blur-sm text-lg px-4 py-2">
                  {tournament?.status ?? 'UPCOMING'}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Tournament Title & Actions */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {tournament?.name ?? 'Tournament'}
              </h1>
              <p className="text-lg text-gray-600">
                {tournament?.description ?? 'No description available'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {isRegistered ? (
                <Badge variant="default" className="bg-green-600 text-white px-6 py-3 text-lg">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Registered ({registrationStatus})
                </Badge>
              ) : isRegistrationOpen && spotsLeft > 0 ? (
                <Button
                  size="lg"
                  onClick={handleRegister}
                  disabled={isRegistering}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 mr-2" />
                      Register Now
                    </>
                  )}
                </Button>
              ) : (
                <Badge variant="destructive" className="px-6 py-3 text-lg">
                  <XCircle className="w-5 h-5 mr-2" />
                  Registration Closed
                </Badge>
              )}

              {tournament?.registrationUrl && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleExternalRegistration}
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  External Registration
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Key Details */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-teal-600" />
                    Event Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Start Date</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {format(startDate, 'MMMM d, yyyy')}
                      </p>
                      <p className="text-sm text-gray-500">{format(startDate, 'EEEE')}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">End Date</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {format(endDate, 'MMMM d, yyyy')}
                      </p>
                      <p className="text-sm text-gray-500">{format(endDate, 'EEEE')}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Registration Opens</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {format(registrationStart, 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Registration Closes</label>
                      <p className="text-lg font-semibold text-gray-900">
                        {format(registrationEnd, 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {tournament?.entryFee && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Entry Fee</label>
                        <p className="text-2xl font-bold text-green-600">
                          ${tournament.entryFee}
                        </p>
                      </div>
                    )}
                    {tournament?.prizePool && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Prize Pool</label>
                        <p className="text-2xl font-bold text-yellow-600">
                          ${tournament.prizePool?.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Venue Information */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-teal-600" />
                    Venue
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xl font-semibold text-gray-900">
                      {tournament?.venueName ?? 'Venue TBA'}
                    </p>
                    <p className="text-gray-600 mt-1">
                      {tournament?.address ?? ''}
                    </p>
                    <p className="text-gray-600">
                      {tournament?.city ?? ''}, {tournament?.state ?? ''} {tournament?.zipCode ?? ''}
                    </p>
                  </div>
                  {(tournament?.latitude && tournament?.longitude) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.open(
                          `https://www.google.com/maps/search/?api=1&query=${tournament.latitude},${tournament.longitude}`,
                          '_blank'
                        );
                      }}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      View on Map
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Tournament Format & Skill Levels */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-teal-600" />
                    Competition Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-2">
                      Tournament Formats
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(tournament?.format ?? []).map((fmt: string) => (
                        <Badge key={fmt} variant="secondary" className="text-sm px-3 py-1">
                          {fmt?.replace('_', ' ') ?? ''}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 block mb-2">
                      Skill Levels
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(tournament?.skillLevels ?? []).map((level: string) => (
                        <Badge key={level} variant="outline" className="text-sm px-3 py-1">
                          {level}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Registration Status */}
              <Card className="border-2 border-teal-200 bg-teal-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-teal-600" />
                    Registration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Participants</span>
                      <span className="text-sm font-bold text-teal-600">
                        {tournament?.currentRegistrations ?? 0} / {tournament?.maxParticipants ?? 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${registrationPercentage}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full rounded-full ${
                          registrationPercentage > 90
                            ? 'bg-red-500'
                            : registrationPercentage > 70
                            ? 'bg-yellow-500'
                            : 'bg-teal-500'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      {isRegistrationOpen ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-gray-700">Registration is open</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="text-gray-700">Registration is closed</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">
                        {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Tournament is full'}
                      </span>
                    </div>
                  </div>

                  {spotsLeft <= 10 && spotsLeft > 0 && (
                    <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-800">
                          Only {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} remaining! Register
                          soon.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Organizer Contact */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Organizer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-semibold text-gray-900">{tournament?.organizerName ?? 'TBA'}</p>
                  </div>
                  {tournament?.organizerEmail && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <a
                        href={`mailto:${tournament.organizerEmail}`}
                        className="hover:text-teal-600 transition-colors"
                      >
                        {tournament.organizerEmail}
                      </a>
                    </div>
                  )}
                  {tournament?.organizerPhone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <a
                        href={`tel:${tournament.organizerPhone}`}
                        className="hover:text-teal-600 transition-colors"
                      >
                        {tournament.organizerPhone}
                      </a>
                    </div>
                  )}
                  {tournament?.websiteUrl && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Globe className="w-4 h-4" />
                      <a
                        href={tournament.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-teal-600 transition-colors"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
