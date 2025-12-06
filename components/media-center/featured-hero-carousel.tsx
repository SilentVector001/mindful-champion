'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Zap,
  Trophy,
  Star,
  Radio,
  Calendar,
  ExternalLink,
  Users,
  Eye
} from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface FeaturedItem {
  id: string;
  type: 'live' | 'highlight' | 'upcoming' | 'podcast' | 'training';
  title: string;
  description: string;
  imageUrl: string;
  videoUrl?: string;
  badgeText?: string;
  badgeColor?: string;
  ctaText: string;
  ctaUrl: string;
  metadata?: {
    date?: string;
    location?: string;
    viewCount?: number;
    duration?: string;
    tournament?: string;
    channel?: string;
  };
  isLive?: boolean;
  featured?: boolean;
}

const SAMPLE_FEATURED_ITEMS: FeaturedItem[] = [
  {
    id: '1',
    type: 'upcoming',
    title: 'PPA Tour Championship Finals - Coming Dec 15!',
    description: 'Watch the most anticipated finals of the season. Ben Johns vs Tyson McGuffin in an epic showdown for the championship title.',
    imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200&h=600&fit=crop',
    badgeText: '📅 Dec 15',
    badgeColor: 'bg-blue-500',
    ctaText: 'Set Reminder',
    ctaUrl: 'https://youtube.com/@PPAtour',
    metadata: {
      tournament: 'PPA Tour Championship',
      date: 'December 15, 2025',
      location: 'Dallas, TX'
    },
    isLive: false,
    featured: true
  },
  {
    id: '2',
    type: 'highlight',
    title: 'Best Plays of the Week: Incredible Ernies & Resets',
    description: 'Check out this week\'s most spectacular plays featuring ATP\'s, impossible gets, and game-winning shots from pro tour events.',
    imageUrl: 'https://i.ytimg.com/vi/uOy8ow5yoQ4/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAgA57DqE_HsvJyYC1qf8u6EMOumA voices-best-plays?w=1200&h=600&fit=crop',
    badgeText: '⭐ Featured',
    badgeColor: 'bg-amber-500',
    ctaText: 'Watch Now',
    ctaUrl: '/media-center?tab=highlights',
    metadata: {
      viewCount: 125000,
      duration: '12:45'
    },
    featured: true
  },
  {
    id: '3',
    type: 'upcoming',
    title: 'MLP Miami Slam - Premium Event Starting Soon',
    description: 'Major League Pickleball returns to Miami with the biggest names in the sport. Don\'t miss the draft and opening matches!',
    imageUrl: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&h=600&fit=crop',
    badgeText: '📅 Dec 15',
    badgeColor: 'bg-blue-500',
    ctaText: 'Set Reminder',
    ctaUrl: '/media-center?tab=events',
    metadata: {
      tournament: 'MLP Miami Slam',
      date: 'December 15, 2025',
      location: 'Miami, FL'
    }
  },
  {
    id: '4',
    type: 'podcast',
    title: 'Pro Insights: Anna Leigh Waters Interview',
    description: 'Exclusive interview with the #1 ranked women\'s player discussing her training regimen, mental preparation, and 2025 goals.',
    imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=1200&h=600&fit=crop',
    badgeText: '🎙️ New Episode',
    badgeColor: 'bg-purple-500',
    ctaText: 'Listen Now',
    ctaUrl: '/media-center?tab=podcasts',
    metadata: {
      channel: 'Pickleball Therapy',
      duration: '52 min'
    }
  },
  {
    id: '5',
    type: 'training',
    title: 'Master the Third Shot Drop - Pro Techniques',
    description: 'Learn the most crucial shot in pickleball from PPA pros. Step-by-step breakdown of grip, stance, and follow-through.',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=600&fit=crop',
    badgeText: '📚 Training',
    badgeColor: 'bg-teal-500',
    ctaText: 'Start Learning',
    ctaUrl: '/train/library',
    metadata: {
      duration: '25 min',
      viewCount: 89000
    }
  }
];

interface FeaturedHeroCarouselProps {
  items?: FeaturedItem[];
  autoPlayInterval?: number;
}

export function FeaturedHeroCarousel({ 
  items = SAMPLE_FEATURED_ITEMS,
  autoPlayInterval = 6000 
}: FeaturedHeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(0);

  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const goToPrevious = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  useEffect(() => {
    if (!isAutoPlaying || isPaused) return;
    
    const timer = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(timer);
  }, [isAutoPlaying, isPaused, goToNext, autoPlayInterval]);

  const currentItem = items[currentIndex];

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0
    })
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'live': return <Radio className="w-4 h-4" />;
      case 'highlight': return <Trophy className="w-4 h-4" />;
      case 'upcoming': return <Calendar className="w-4 h-4" />;
      case 'podcast': return <Play className="w-4 h-4" />;
      case 'training': return <Star className="w-4 h-4" />;
      default: return <Play className="w-4 h-4" />;
    }
  };

  const handleCtaClick = () => {
    if (currentItem.ctaUrl.startsWith('http')) {
      window.open(currentItem.ctaUrl, '_blank');
    } else {
      window.location.href = currentItem.ctaUrl;
    }
  };

  return (
    <div 
      className="relative w-full overflow-hidden rounded-3xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main Hero Card */}
      <Card className="border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
        <CardContent className="p-0 relative h-[400px] md:h-[450px] overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 200, damping: 25 },
                opacity: { duration: 0.2 }
              }}
              className="absolute inset-0 overflow-hidden"
            >
              {/* Background Image with Gradient Overlay */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                <Image
                  src={currentItem.imageUrl}
                  alt={currentItem.title}
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
              </div>

              {/* Content */}
              <div className="relative z-20 h-full flex flex-col justify-end p-8 md:p-12">
                <div className="max-w-2xl space-y-4">
                  {/* Badge */}
                  <div className="flex items-center gap-3">
                    <Badge 
                      className={cn(
                        "px-3 py-1.5 text-sm font-semibold shadow-lg",
                        currentItem.badgeColor || 'bg-teal-500',
                        currentItem.isLive && "animate-pulse"
                      )}
                    >
                      {currentItem.badgeText || getTypeIcon(currentItem.type)}
                    </Badge>
                    
                    {currentItem.isLive && (
                      <div className="flex items-center gap-2 text-white/90 text-sm">
                        <Eye className="w-4 h-4" />
                        <span>{currentItem.metadata?.viewCount?.toLocaleString()} watching</span>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl md:text-4xl font-bold text-white leading-tight"
                  >
                    {currentItem.title}
                  </motion.h2>

                  {/* Description */}
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-white/80 text-sm md:text-base line-clamp-2 md:line-clamp-3"
                  >
                    {currentItem.description}
                  </motion.p>

                  {/* Metadata */}
                  {currentItem.metadata && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="flex flex-wrap items-center gap-4 text-white/70 text-sm"
                    >
                      {currentItem.metadata.tournament && (
                        <span className="flex items-center gap-1.5">
                          <Trophy className="w-4 h-4" />
                          {currentItem.metadata.tournament}
                        </span>
                      )}
                      {currentItem.metadata.location && (
                        <span className="flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
                          {currentItem.metadata.location}
                        </span>
                      )}
                      {currentItem.metadata.duration && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {currentItem.metadata.duration}
                        </span>
                      )}
                      {currentItem.metadata.channel && (
                        <span className="flex items-center gap-1.5">
                          <Radio className="w-4 h-4" />
                          {currentItem.metadata.channel}
                        </span>
                      )}
                    </motion.div>
                  )}

                  {/* CTA Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Button 
                      size="lg"
                      onClick={handleCtaClick}
                      className={cn(
                        "mt-2 rounded-full px-8 font-semibold shadow-xl transition-all duration-300",
                        "bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600",
                        "hover:scale-105 hover:shadow-teal-500/25",
                        currentItem.isLive && "from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
                      )}
                    >
                      {currentItem.isLive && <Zap className="w-4 h-4 mr-2 animate-pulse" />}
                      {currentItem.ctaText}
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-200 hover:scale-110"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-200 hover:scale-110"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </CardContent>
      </Card>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "transition-all duration-300 rounded-full",
              index === currentIndex 
                ? "w-8 h-2 bg-white" 
                : "w-2 h-2 bg-white/50 hover:bg-white/70"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Thumbnail Preview Strip */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => goToSlide(index)}
            className={cn(
              "relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden transition-all duration-200",
              index === currentIndex 
                ? "ring-2 ring-teal-500 ring-offset-2 ring-offset-slate-900 scale-105" 
                : "opacity-60 hover:opacity-100"
            )}
          >
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover"
              unoptimized
            />
            {item.isLive && (
              <div className="absolute top-1 left-1">
                <span className="flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
