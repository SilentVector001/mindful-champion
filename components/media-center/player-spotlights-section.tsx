'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  TrendingUp, 
  Star,
  Users,
  Youtube,
  Instagram,
  Twitter,
  ExternalLink,
  Medal,
  Target,
  Award,
  ChevronRight
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PlayerProfile {
  id: string;
  name: string;
  imageUrl: string;
  rank: number;
  category: 'mens-singles' | 'womens-singles' | 'mens-doubles' | 'womens-doubles' | 'mixed-doubles';
  nationality: string;
  titles: number;
  recentForm: ('W' | 'L')[];
  trending: boolean;
  points: number;
  socials?: {
    youtube?: string;
    instagram?: string;
    twitter?: string;
  };
  highlight?: string;
}

const FEATURED_PLAYERS: PlayerProfile[] = [
  {
    id: '1',
    name: 'Ben Johns',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
    rank: 1,
    category: 'mens-singles',
    nationality: '🇺🇸',
    titles: 115,
    recentForm: ['W', 'W', 'W', 'W', 'W'],
    trending: true,
    points: 52850,
    socials: {
      youtube: 'https://youtube.com/@BenJohnsPickleball',
      instagram: 'https://instagram.com/benjohns',
      twitter: 'https://twitter.com/benjohns'
    },
    highlight: 'Undefeated in last 12 tournaments'
  },
  {
    id: '2',
    name: 'Anna Leigh Waters',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face',
    rank: 1,
    category: 'womens-singles',
    nationality: '🇺🇸',
    titles: 87,
    recentForm: ['W', 'W', 'L', 'W', 'W'],
    trending: true,
    points: 48200,
    socials: {
      youtube: 'https://youtube.com/@ALWaters',
      instagram: 'https://instagram.com/annaleighwaters'
    },
    highlight: 'Youngest Triple Crown winner'
  },
  {
    id: '3',
    name: 'Tyson McGuffin',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
    rank: 2,
    category: 'mens-singles',
    nationality: '🇺🇸',
    titles: 45,
    recentForm: ['W', 'L', 'W', 'W', 'L'],
    trending: false,
    points: 42100,
    socials: {
      instagram: 'https://instagram.com/tysonmcguffin'
    },
    highlight: 'Best defensive player in the game'
  },
  {
    id: '4',
    name: 'Catherine Parenteau',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
    rank: 3,
    category: 'womens-singles',
    nationality: '🇨🇦',
    titles: 38,
    recentForm: ['W', 'W', 'W', 'L', 'W'],
    trending: true,
    points: 38500,
    socials: {
      instagram: 'https://instagram.com/catherineparenteau'
    },
    highlight: 'Most consistent player of 2024'
  },
  {
    id: '5',
    name: 'Federico Staksrud',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face',
    rank: 4,
    category: 'mens-singles',
    nationality: '🇦🇷',
    titles: 22,
    recentForm: ['W', 'W', 'W', 'W', 'L'],
    trending: true,
    points: 35800,
    highlight: 'Rising star from Argentina'
  },
  {
    id: '6',
    name: 'Riley Newman',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face',
    rank: 3,
    category: 'mens-singles',
    nationality: '🇺🇸',
    titles: 42,
    recentForm: ['L', 'W', 'W', 'W', 'W'],
    trending: false,
    points: 40200,
    highlight: 'Left-handed powerhouse'
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Users },
  { id: 'mens-singles', label: "Men's", icon: Target },
  { id: 'womens-singles', label: "Women's", icon: Target },
  { id: 'trending', label: 'Trending', icon: TrendingUp }
];

export function PlayerSpotlightsSection() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [players, setPlayers] = useState<PlayerProfile[]>(FEATURED_PLAYERS);

  const filteredPlayers = players.filter(player => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'trending') return player.trending;
    return player.category === selectedCategory;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-slate-50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Player Spotlights</h3>
              <p className="text-sm text-slate-500 font-normal">Top ranked players & rising stars</p>
            </div>
          </CardTitle>
          
          <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50">
            View All Rankings
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "rounded-full whitespace-nowrap transition-all duration-200",
                selectedCategory === cat.id 
                  ? "bg-gradient-to-r from-teal-500 to-cyan-500 border-0 shadow-md" 
                  : "hover:bg-slate-100 border-slate-200"
              )}
            >
              <cat.icon className="w-3.5 h-3.5 mr-1.5" />
              {cat.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
        >
          {filteredPlayers.slice(0, 6).map((player, index) => (
            <motion.div
              key={player.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02, y: -4 }}
              className="group cursor-pointer"
            >
              <div className={cn(
                "relative p-4 rounded-2xl transition-all duration-300",
                "bg-white border border-slate-100 hover:border-teal-200",
                "shadow-sm hover:shadow-lg hover:shadow-teal-500/10"
              )}>
                {/* Rank Badge */}
                <div className="absolute -top-2 -left-2 z-10">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg",
                    player.rank === 1 
                      ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white"
                      : player.rank === 2
                      ? "bg-gradient-to-br from-slate-300 to-slate-500 text-white"
                      : player.rank === 3
                      ? "bg-gradient-to-br from-amber-600 to-amber-800 text-white"
                      : "bg-slate-200 text-slate-600"
                  )}>
                    #{player.rank}
                  </div>
                </div>

                {/* Trending Badge */}
                {player.trending && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <Badge className="bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs px-2 shadow-md">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Hot
                    </Badge>
                  </div>
                )}

                {/* Player Image */}
                <div className="flex flex-col items-center mb-3">
                  <div className="relative w-20 h-20 mb-3">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
                    <Image
                      src={player.imageUrl}
                      alt={player.name}
                      fill
                      className="rounded-full object-cover ring-2 ring-white shadow-md relative z-10"
                      unoptimized
                    />
                  </div>

                  {/* Name & Nationality */}
                  <div className="text-center">
                    <p className="font-semibold text-slate-800 group-hover:text-teal-600 transition-colors">
                      {player.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {player.nationality} • {player.titles} titles
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-2">
                  {/* Recent Form */}
                  <div className="flex justify-center gap-1">
                    {player.recentForm.map((result, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                          result === 'W' 
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        )}
                      >
                        {result}
                      </div>
                    ))}
                  </div>

                  {/* Points */}
                  <div className="text-center">
                    <p className="text-xs text-slate-400">PPA Points</p>
                    <p className="text-sm font-bold text-slate-700">{player.points.toLocaleString()}</p>
                  </div>

                  {/* Highlight */}
                  {player.highlight && (
                    <p className="text-[10px] text-center text-teal-600 font-medium line-clamp-1">
                      {player.highlight}
                    </p>
                  )}
                </div>

                {/* Social Links */}
                {player.socials && (
                  <div className="flex justify-center gap-2 mt-3 pt-3 border-t border-slate-100">
                    {player.socials.youtube && (
                      <a 
                        href={player.socials.youtube} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-full bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Youtube className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {player.socials.instagram && (
                      <a 
                        href={player.socials.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-full bg-slate-50 hover:bg-pink-50 text-slate-400 hover:text-pink-500 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Instagram className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {player.socials.twitter && (
                      <a 
                        href={player.socials.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-full bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Twitter className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
}
