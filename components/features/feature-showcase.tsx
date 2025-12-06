
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  BookOpen,
  Video,
  Brain,
  Target,
  Users,
  Trophy,
  TrendingUp,
  Star,
  Palette,
  ArrowRight,
  Sparkles,
  Zap,
  Heart,
  Shield
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: any;
  image: string;
  path: string;
  gradient: string;
  accentColor: string;
  badge?: string;
  highlights: string[];
}

const features: Feature[] = [
  {
    id: 'coach-kai',
    title: 'Coach Kai',
    description: 'AI voice coach that provides personalized guidance, answers questions, and keeps you motivated 24/7.',
    icon: Bot,
    image: '/ai-coach.jpg',
    path: '/train/coach',
    gradient: 'from-blue-500 via-purple-500 to-pink-500',
    accentColor: 'border-blue-500',
    badge: 'AI Powered',
    highlights: ['Voice Interaction', '24/7 Available', 'Personalized Tips']
  },
  {
    id: 'training-programs',
    title: 'Training Programs',
    description: 'Structured multi-stage coaching journeys from basics to advanced tournament play.',
    icon: BookOpen,
    image: '/training-programs.jpg',
    path: '/train/programs',
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    accentColor: 'border-green-500',
    badge: 'Progressive',
    highlights: ['5-Stage Journey', 'Skill Unlocks', 'Achievement System']
  },
  {
    id: 'video-analysis',
    title: 'Video Analysis',
    description: 'AI-powered analysis of your gameplay with technique improvements and performance insights.',
    icon: Video,
    image: '/video-analysis.jpg',
    path: '/train/video',
    gradient: 'from-orange-500 via-red-500 to-pink-500',
    accentColor: 'border-orange-500',
    badge: 'Pro Feature',
    highlights: ['AI Analysis', 'Technique Tips', 'Performance Data']
  },
  {
    id: 'mental-training',
    title: 'Mental Training',
    description: 'Mindfulness exercises and mental strategies to improve focus and performance under pressure.',
    icon: Brain,
    image: '/mental-training.jpg',
    path: '/train/mental',
    gradient: 'from-purple-500 via-indigo-500 to-blue-500',
    accentColor: 'border-purple-500',
    highlights: ['Mindfulness', 'Focus Training', 'Pressure Handling']
  },
  {
    id: 'drill-library',
    title: 'Drill Library',
    description: 'Comprehensive collection of pickleball drills for every skill level and situation.',
    icon: Target,
    image: '/drill-library.jpg',
    path: '/train/drills',
    gradient: 'from-yellow-500 via-orange-500 to-red-500',
    accentColor: 'border-yellow-500',
    highlights: ['200+ Drills', 'Video Guides', 'Skill Building']
  },
  {
    id: 'community',
    title: 'Community Board',
    description: 'Connect with players, share experiences, find partners, and join local pickleball discussions.',
    icon: Users,
    image: '/community.jpg',
    path: '/connect/community',
    gradient: 'from-emerald-500 via-green-500 to-lime-500',
    accentColor: 'border-emerald-500',
    highlights: ['Player Network', 'Partner Matching', 'Local Events']
  },
  {
    id: 'tournament-hub',
    title: 'Tournament Hub',
    description: 'Track tournaments, register for events, and monitor your competitive progress.',
    icon: Trophy,
    image: '/tournament.jpg',
    path: '/connect/tournaments',
    gradient: 'from-amber-500 via-yellow-500 to-orange-500',
    accentColor: 'border-amber-500',
    highlights: ['Event Tracking', 'Registration', 'Competition Stats']
  },
  {
    id: 'progress-analytics',
    title: 'Progress Analytics',
    description: 'Comprehensive tracking of your improvement with detailed analytics and insights.',
    icon: TrendingUp,
    image: '/progress-tracking.jpg',
    path: '/progress',
    gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
    accentColor: 'border-cyan-500',
    highlights: ['Skill Tracking', 'Performance Metrics', 'Growth Insights']
  },
  {
    id: 'partner-benefits',
    title: 'Partner Benefits',
    description: 'Exclusive rewards, sponsor offers, and premium benefits for dedicated players.',
    icon: Star,
    image: '/partner-matching.jpg',
    path: '/partners',
    gradient: 'from-rose-500 via-pink-500 to-purple-500',
    accentColor: 'border-rose-500',
    badge: 'Premium',
    highlights: ['Sponsor Rewards', 'Exclusive Access', 'Premium Features']
  },
  {
    id: 'pro-avatar',
    title: 'Pro Avatar',
    description: 'Customize your digital coach persona and create personalized training experiences.',
    icon: Palette,
    image: '/avatars/coach-male-1.jpg',
    path: '/avatar-studio',
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    accentColor: 'border-indigo-500',
    badge: 'Customize',
    highlights: ['Personal Coach', 'Custom Styles', 'Interactive Experience']
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      duration: 0.6
    }
  }
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1
  }
};

export default function FeatureShowcase() {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);
  const router = useRouter();

  const handleFeatureClick = (feature: Feature) => {
    router.push(feature.path);
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-champion-green" />
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
              Complete Ecosystem
            </Badge>
            <Sparkles className="h-6 w-6 text-champion-green" />
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-champion-green bg-clip-text text-transparent mb-6">
            Everything You Need to Master Pickleball
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From AI-powered coaching to community connections, discover a comprehensive platform designed to elevate your game at every level.
          </p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-6"
          >
            <div className="flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
              ))}
              <span className="ml-2 text-gray-600 font-medium">
                Trusted by 10,000+ Players
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              variants={itemVariants}
              transition={{ duration: 0.5, ease: "easeOut" }}
              onHoverStart={() => setHoveredFeature(feature.id)}
              onHoverEnd={() => setHoveredFeature(null)}
              className="group relative"
            >
              <Card 
                className={`relative overflow-hidden border-2 transition-all duration-500 cursor-pointer
                  ${hoveredFeature === feature.id 
                    ? `${feature.accentColor} shadow-2xl shadow-blue-500/20 -translate-y-2` 
                    : 'border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl'
                  }`}
                onClick={() => handleFeatureClick(feature)}
              >
                <CardContent className="p-0">
                  {/* Image Section */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      fill
                      className={`object-cover transition-all duration-700 group-hover:scale-110 ${
                        hoveredFeature === feature.id ? 'brightness-110' : 'brightness-100'
                      }`}
                    />
                    
                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} 
                      ${hoveredFeature === feature.id ? 'opacity-20' : 'opacity-10'} 
                      transition-opacity duration-500`} />
                    
                    {/* Icon - Removed as per user request */}

                    {/* Badge */}
                    {feature.badge && (
                      <div className="absolute top-4 right-4">
                        <Badge 
                          variant="secondary" 
                          className={`bg-white/90 backdrop-blur-sm text-xs font-semibold transition-all duration-500 ${
                            hoveredFeature === feature.id ? 'scale-105 shadow-md' : ''
                          }`}
                        >
                          {feature.badge}
                        </Badge>
                      </div>
                    )}

                    {/* Hover Arrow */}
                    <AnimatePresence>
                      {hoveredFeature === feature.id && (
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="absolute bottom-4 right-4"
                        >
                          <div className="p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-lg">
                            <ArrowRight className="h-5 w-5 text-gray-700" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Content Section */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                        {feature.title}
                      </h3>
                      <Zap className={`h-4 w-4 transition-all duration-500 ${
                        hoveredFeature === feature.id 
                          ? 'text-yellow-500 scale-110' 
                          : 'text-gray-400'
                      }`} />
                    </div>
                    
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {feature.description}
                    </p>

                    {/* Feature Highlights */}
                    <div className="space-y-2">
                      {feature.highlights.map((highlight, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ 
                            opacity: hoveredFeature === feature.id ? 1 : 0.7,
                            x: hoveredFeature === feature.id ? 0 : -10
                          }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-2 text-xs text-gray-500"
                        >
                          <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${feature.gradient}`} />
                          {highlight}
                        </motion.div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <motion.div
                      initial={false}
                      animate={{
                        opacity: hoveredFeature === feature.id ? 1 : 0,
                        y: hoveredFeature === feature.id ? 0 : 10
                      }}
                      transition={{ duration: 0.3 }}
                      className="mt-4"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(feature.path)}
                        className={`w-full transition-all duration-300 ${
                          hoveredFeature === feature.id
                            ? 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                            : ''
                        }`}
                      >
                        Explore Feature
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-champion-green to-blue-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="h-6 w-6 text-red-300" />
              <Shield className="h-6 w-6 text-blue-200" />
            </div>
            
            <h3 className="text-2xl font-bold mb-2">
              Ready to Transform Your Game?
            </h3>
            
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join thousands of players who've elevated their pickleball journey with our comprehensive coaching platform.
            </p>
            
            <Button
              variant="secondary"
              size="lg"
              className="bg-white text-champion-green hover:bg-gray-100 font-semibold px-8 py-3"
              onClick={() => router.push('/train')}
            >
              Start Your Journey
              <Sparkles className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
