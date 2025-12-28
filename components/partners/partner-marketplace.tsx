
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Award, Clock, DollarSign, MapPin, Calendar, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PartnerDetailDialog from './partner-detail-dialog';
import Image from 'next/image';

type Partner = any; // Will be properly typed

export default function PartnerMarketplace({ partners, user }: { partners: Partner[]; user: any }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterExpertise, setFilterExpertise] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  // Filter and sort partners
  const filteredPartners = partners
    .filter(partner => {
      const matchesSearch = searchTerm === '' || 
        partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partner.bio?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || partner.partnerType === filterType;
      
      const matchesExpertise = filterExpertise === 'all' || 
        partner.expertise?.includes(filterExpertise);
      
      return matchesSearch && matchesType && matchesExpertise;
    })
    .sort((a, b) => {
      if (sortBy === 'featured') {
        if (a.featured !== b.featured) return b.featured ? 1 : -1;
        return b.rating - a.rating;
      }
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'reviews') return b.totalReviews - a.totalReviews;
      if (sortBy === 'price-low') {
        const aPrice = a.services?.[0]?.price || 0;
        const bPrice = b.services?.[0]?.price || 0;
        return aPrice - bPrice;
      }
      if (sortBy === 'price-high') {
        const aPrice = a.services?.[0]?.price || 0;
        const bPrice = b.services?.[0]?.price || 0;
        return bPrice - aPrice;
      }
      return 0;
    });

  const partnerTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'PRO_COACH', label: 'Pro Coaches' },
    { value: 'CERTIFIED_INSTRUCTOR', label: 'Certified Instructors' },
    { value: 'MENTAL_COACH', label: 'Mental Coaches' },
    { value: 'TECHNIQUE_SPECIALIST', label: 'Technique Specialists' },
  ];

  const expertiseAreas = [
    { value: 'all', label: 'All Specialties' },
    { value: 'serve', label: 'Serve Technique' },
    { value: 'dinking', label: 'Dinking Strategy' },
    { value: 'volleys', label: 'Volleys & Net Play' },
    { value: 'mental', label: 'Mental Game' },
    { value: 'tournament', label: 'Tournament Prep' },
    { value: 'strategy', label: 'Game Strategy' },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Award className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Expert Coaching Marketplace
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Connect with certified coaches & mental performance experts
          </p>
          
          {/* Coach Kai AI Suggestion Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 mx-auto max-w-2xl"
          >
            <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-700">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900 dark:text-white mb-1">
                    💡 Coach Kai's Recommendation
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Based on your {user.skillLevel?.toLowerCase()} level and goals, I recommend checking out our mental performance coaches to build tournament confidence!
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Filters & Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search coaches by name or specialty..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Coach Type" />
                </SelectTrigger>
                <SelectContent>
                  {partnerTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Expertise Filter */}
              <Select value={filterExpertise} onValueChange={setFilterExpertise}>
                <SelectTrigger>
                  <SelectValue placeholder="Specialty" />
                </SelectTrigger>
                <SelectContent>
                  {expertiseAreas.map(area => (
                    <SelectItem key={area.value} value={area.value}>
                      {area.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results Count */}
            <div className="mt-4 flex items-center justify-between text-sm">
              <p className="text-gray-600 dark:text-gray-400">
                Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredPartners.length}</span> coaches
              </p>
              {(searchTerm || filterType !== 'all' || filterExpertise !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                    setFilterExpertise('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Partner Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map((partner, index) => (
            <PartnerCard
              key={partner.id}
              partner={partner}
              index={index}
              onClick={() => setSelectedPartner(partner)}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredPartners.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No coaches found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your filters or search terms
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterExpertise('all');
              }}
            >
              Clear All Filters
            </Button>
          </motion.div>
        )}
      </div>

      {/* Partner Detail Dialog */}
      {selectedPartner && (
        <PartnerDetailDialog
          partner={selectedPartner}
          user={user}
          isOpen={!!selectedPartner}
          onClose={() => setSelectedPartner(null)}
        />
      )}
    </>
  );
}

function PartnerCard({ partner, index, onClick }: { partner: any; index: number; onClick: () => void }) {
  const lowestPrice = partner.services?.reduce((min: number, service: any) => 
    Math.min(min, service.price), Infinity) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-2 hover:border-purple-300 dark:hover:border-purple-700"
        onClick={onClick}
      >
        {/* Cover Image with Featured Badge */}
        <div className="relative h-32 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
          {partner.coverImageUrl && (
            <Image
              src={partner.coverImageUrl}
              alt={partner.name}
              fill
              className="object-cover"
            />
          )}
          {partner.featured && (
            <Badge className="absolute top-3 right-3 bg-yellow-500 text-white border-none">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Featured
            </Badge>
          )}
          {partner.sponsoredBy && (
            <Badge className="absolute top-3 left-3 bg-white/90 text-gray-900 border-none">
              <Award className="w-3 h-3 mr-1" />
              {partner.sponsoredBy}
            </Badge>
          )}
        </div>

        {/* Profile Content */}
        <div className="p-5">
          {/* Avatar & Name */}
          <div className="flex items-start gap-3 mb-3 -mt-10">
            <Avatar className="w-16 h-16 border-4 border-white dark:border-gray-800">
              <AvatarImage src={partner.imageUrl} alt={partner.name} />
              <AvatarFallback className="bg-purple-600 text-white text-lg">
                {partner.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 mt-8">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">
                {partner.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {partner.partnerType?.replace(/_/g, ' ')}
              </p>
            </div>
          </div>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-gray-900 dark:text-white">
                {partner.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              ({partner.totalReviews} reviews)
            </span>
            <span className="text-sm text-gray-500">
              • {partner.totalSessions} sessions
            </span>
          </div>

          {/* Bio Preview */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {partner.bio || 'Expert pickleball coach ready to help you level up your game!'}
          </p>

          {/* Expertise Tags */}
          {partner.expertise && Array.isArray(partner.expertise) && partner.expertise.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {partner.expertise.slice(0, 3).map((skill: string) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="text-xs"
                >
                  {skill}
                </Badge>
              ))}
              {partner.expertise.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{partner.expertise.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Services Count & Pricing */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{partner.services?.length || 0} services</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Starting at</p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                ${(lowestPrice / 100).toFixed(0)}/hr
              </p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
