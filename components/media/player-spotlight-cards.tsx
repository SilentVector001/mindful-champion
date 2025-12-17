'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Star,
  Trophy,
  Award,
  TrendingUp,
  ExternalLink,
  Users
} from 'lucide-react';
import Image from 'next/image';

interface PlayerSpotlight {
  id: string;
  name: string;
  photoUrl: string;
  ranking?: string;
  rating?: number;
  bio: string;
  achievements: string[];
  stats?: {
    titles: number;
    wins: number;
    winRate: string;
  };
  socialLinks?: {
    twitter?: string;
    instagram?: string;
  };
  organization?: string;
  featured: boolean;
}

export function PlayerSpotlightCards() {
  const [players, setPlayers] = useState<PlayerSpotlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/media/players');
      if (res?.ok) {
        const data = await res.json();
        setPlayers(data?.players || []);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock players for initial display
  const mockPlayers: PlayerSpotlight[] = [
    {
      id: '1',
      name: 'Ben Johns',
      photoUrl: 'https://images.pickleball.com/news/1724094389936/KC_TYSON%20X%20JAUME_MD-3.jpg',
      ranking: '#1',
      rating: 5.0,
      bio: 'Widely regarded as the best pickleball player in the world, Ben Johns has dominated the sport with his exceptional athleticism, strategic mind, and consistent performance across all formats.',
      achievements: [
        'Triple Crown Winner (Singles, Doubles, Mixed)',
        'Multiple PPA Tour Championships',
        'Youngest player to achieve #1 ranking',
        'Over 100 professional titles'
      ],
      stats: {
        titles: 125,
        wins: 450,
        winRate: '92%'
      },
      socialLinks: {
        instagram: 'https://instagram.com/benjohns_pb',
        twitter: 'https://twitter.com/benjohnspb'
      },
      organization: 'PPA Tour',
      featured: true
    },
    {
      id: '2',
      name: 'Anna Leigh Waters',
      photoUrl: 'https://ppatour.com/wp-content/uploads/2024/07/PPA-Grows-Internationally.webp',
      ranking: '#1',
      rating: 5.0,
      bio: 'The youngest professional pickleball player to turn pro at age 12, Anna Leigh Waters has become one of the most dominant forces in women\'s pickleball with her powerful game and competitive spirit.',
      achievements: [
        'Youngest professional pickleball player',
        'Multiple Triple Crown titles',
        'PPA Tour MVP',
        'Record-breaking win streaks'
      ],
      stats: {
        titles: 85,
        wins: 320,
        winRate: '88%'
      },
      socialLinks: {
        instagram: 'https://instagram.com/annaleighwaters',
      },
      organization: 'PPA Tour',
      featured: true
    },
    {
      id: '3',
      name: 'Tyson McGuffin',
      photoUrl: 'https://ppatour.com/wp-content/uploads/2023/12/TX-Open-DJI-Watermarked-scaled-1.webp',
      ranking: '#2',
      rating: 4.9,
      bio: 'Known for his powerful serve and aggressive style, Tyson McGuffin is one of the most entertaining and successful players on the professional pickleball circuit.',
      achievements: [
        'Multiple PPA Tour titles',
        'Top 5 ranked player',
        'APP Tour champion',
        'Fan favorite award winner'
      ],
      stats: {
        titles: 45,
        wins: 280,
        winRate: '85%'
      },
      organization: 'PPA Tour',
      featured: false
    },
    {
      id: '4',
      name: 'Catherine Parenteau',
      photoUrl: 'https://ppatour.com/wp-content/uploads/2024/07/PPA-Grows-Internationally.webp',
      ranking: '#3',
      rating: 4.8,
      bio: 'A former tennis pro who transitioned to pickleball, Catherine Parenteau brings exceptional court coverage and tactical awareness to her game.',
      achievements: [
        'Multiple Grand Slam titles',
        'Top 5 women\'s ranking',
        'Mixed doubles champion',
        'PPA Tour winner'
      ],
      stats: {
        titles: 38,
        wins: 245,
        winRate: '82%'
      },
      organization: 'PPA Tour',
      featured: false
    }
  ];

  const displayPlayers = players?.length > 0 ? players : mockPlayers;
  const featuredPlayers = displayPlayers?.filter(p => p?.featured) || [];
  const otherPlayers = displayPlayers?.filter(p => !p?.featured) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl shadow-lg">
                <Star className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Player Spotlights</h1>
                <p className="text-slate-500">Meet the stars of professional pickleball</p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              {displayPlayers?.length || 0} Players
            </Badge>
          </div>
        </motion.div>

        {/* Featured Players */}
        {featuredPlayers?.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Featured Champions
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPlayers?.map((player, idx) => (
                <motion.div
                  key={player?.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-2xl transition-all border-2 border-amber-100 bg-gradient-to-br from-white to-amber-50">
                    <div className="relative h-64 bg-gradient-to-br from-slate-800 to-slate-900">
                      <div className="relative w-full h-full">
                        <Image
                          src={player?.photoUrl || ''}
                          alt={player?.name || 'Player'}
                          fill
                          className="object-cover opacity-80"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <Badge className="bg-amber-500 text-white">
                          <Trophy className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                        {player?.organization && (
                          <Badge variant="outline" className="border-white/30 text-white bg-black/30 backdrop-blur">
                            {player?.organization}
                          </Badge>
                        )}
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <h3 className="text-2xl font-bold text-white mb-1">{player?.name}</h3>
                        <div className="flex items-center gap-3">
                          {player?.ranking && (
                            <Badge className="bg-white/20 text-white backdrop-blur">
                              Rank {player?.ranking}
                            </Badge>
                          )}
                          {player?.rating && (
                            <Badge className="bg-white/20 text-white backdrop-blur">
                              <Star className="w-3 h-3 mr-1 fill-amber-400 text-amber-400" />
                              {player?.rating}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <p className="text-slate-600 mb-4">{player?.bio}</p>
                      
                      {/* Stats */}
                      {player?.stats && (
                        <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-slate-50 rounded-xl">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-slate-800">{player?.stats?.titles}</div>
                            <div className="text-xs text-slate-500">Titles</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-slate-800">{player?.stats?.wins}</div>
                            <div className="text-xs text-slate-500">Wins</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-emerald-600">{player?.stats?.winRate}</div>
                            <div className="text-xs text-slate-500">Win Rate</div>
                          </div>
                        </div>
                      )}

                      {/* Achievements */}
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                          <Award className="w-4 h-4 text-amber-500" />
                          Key Achievements
                        </h4>
                        <ul className="space-y-1">
                          {player?.achievements?.slice(0, 4)?.map((achievement, idx) => (
                            <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 flex-shrink-0"></span>
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Social Links */}
                      {player?.socialLinks && (
                        <div className="flex gap-2">
                          {player?.socialLinks?.instagram && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = player?.socialLinks?.instagram || '#';
                                link.target = '_blank';
                                link.rel = 'noopener noreferrer';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              Instagram
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </Button>
                          )}
                          {player?.socialLinks?.twitter && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = player?.socialLinks?.twitter || '#';
                                link.target = '_blank';
                                link.rel = 'noopener noreferrer';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              Twitter
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Other Top Players */}
        {otherPlayers?.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-500" />
              Top Ranked Players
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherPlayers?.map((player, idx) => (
                <motion.div
                  key={player?.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                    <div className="relative h-48 bg-gradient-to-br from-slate-800 to-slate-900">
                      <div className="relative w-full h-full">
                        <Image
                          src={player?.photoUrl || ''}
                          alt={player?.name || 'Player'}
                          fill
                          className="object-cover opacity-70"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        <h3 className="text-lg font-bold text-white">{player?.name}</h3>
                        {player?.ranking && (
                          <Badge className="bg-white/20 text-white backdrop-blur text-xs mt-1">
                            Rank {player?.ranking}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <p className="text-sm text-slate-600 line-clamp-3 mb-3">{player?.bio}</p>
                      {player?.stats && (
                        <div className="grid grid-cols-3 gap-2 mb-3 p-2 bg-slate-50 rounded-lg">
                          <div className="text-center">
                            <div className="font-bold text-slate-800">{player?.stats?.titles}</div>
                            <div className="text-xs text-slate-500">Titles</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-slate-800">{player?.stats?.wins}</div>
                            <div className="text-xs text-slate-500">Wins</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-emerald-600">{player?.stats?.winRate}</div>
                            <div className="text-xs text-slate-500">Win Rate</div>
                          </div>
                        </div>
                      )}
                      <Button variant="outline" size="sm" className="w-full">
                        View Profile
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
