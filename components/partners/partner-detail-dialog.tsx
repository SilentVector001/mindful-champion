
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Award,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  CheckCircle2,
  X,
  ExternalLink,
  Trophy,
  Briefcase,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import BookingDialog from './booking-dialog';
import Image from 'next/image';

export default function PartnerDetailDialog({
  partner,
  user,
  isOpen,
  onClose,
}: {
  partner: any;
  user: any;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [showBooking, setShowBooking] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  const handleBookService = (service: any) => {
    setSelectedService(service);
    setShowBooking(true);
  };

  return (
    <>
      <Dialog open={isOpen && !showBooking} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          <div className="relative">
            {/* Cover Image */}
            <div className="relative h-48 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
              {partner.coverImageUrl && (
                <Image
                  src={partner.coverImageUrl}
                  alt={partner.name}
                  fill
                  className="object-cover"
                />
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-white/90 hover:bg-white"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
              
              {partner.featured && (
                <Badge className="absolute top-4 left-4 bg-yellow-500 text-white border-none">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  Featured Coach
                </Badge>
              )}
            </div>

            {/* Profile Header */}
            <div className="px-6 pb-6">
              <div className="flex items-start gap-4 -mt-12 mb-6">
                <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-900">
                  <AvatarImage src={partner.imageUrl} alt={partner.name} />
                  <AvatarFallback className="bg-purple-600 text-white text-2xl">
                    {partner.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 mt-10">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {partner.name}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        {partner.partnerType?.replace(/_/g, ' ')}
                      </p>
                      
                      {/* Sponsor Badge */}
                      {partner.sponsoredBy && (
                        <Badge variant="outline" className="border-purple-300">
                          <Award className="w-3 h-3 mr-1" />
                          Sponsored by {partner.sponsoredBy}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Rating */}
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {partner.rating.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {partner.totalReviews} reviews • {partner.totalSessions} sessions
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="about" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="services">Services</TabsTrigger>
                  <TabsTrigger value="reviews">Reviews</TabsTrigger>
                </TabsList>

                {/* About Tab */}
                <TabsContent value="about" className="space-y-6 mt-6">
                  {/* Bio */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      About
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {partner.bio || 'Expert pickleball coach with years of experience helping players at all levels achieve their goals.'}
                    </p>
                  </div>

                  {/* Expertise */}
                  {partner.expertise && Array.isArray(partner.expertise) && partner.expertise.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Areas of Expertise
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {partner.expertise.map((skill: string) => (
                          <Badge key={skill} variant="secondary" className="text-sm">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {partner.certifications && Array.isArray(partner.certifications) && partner.certifications.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Certifications & Credentials
                      </h3>
                      <div className="space-y-2">
                        {partner.certifications.map((cert: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <Trophy className="w-4 h-4 text-purple-600" />
                            <span>{cert}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience */}
                  {partner.experience && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Experience
                      </h3>
                      <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <Briefcase className="w-4 h-4 text-purple-600 mt-1" />
                        <p>{partner.experience}</p>
                      </div>
                    </div>
                  )}

                  {/* Social Links */}
                  {(partner.websiteUrl || partner.instagramUrl || partner.youtubeUrl) && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Connect
                      </h3>
                      <div className="flex gap-2">
                        {partner.websiteUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Website
                            </a>
                          </Button>
                        )}
                        {partner.instagramUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={partner.instagramUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Instagram
                            </a>
                          </Button>
                        )}
                        {partner.youtubeUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={partner.youtubeUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              YouTube
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Services Tab */}
                <TabsContent value="services" className="space-y-4 mt-6">
                  {partner.services && partner.services.length > 0 ? (
                    partner.services.map((service: any) => (
                      <Card key={service.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                              {service.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {service.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{service.duration} min</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  ${(service.price / 100).toFixed(0)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleBookService(service)}
                            className="ml-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            Book Now
                          </Button>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No services available at the moment
                    </div>
                  )}
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews" className="space-y-4 mt-6">
                  {partner.reviews && partner.reviews.length > 0 ? (
                    partner.reviews.map((review: any) => (
                      <Card key={review.id} className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-purple-100 text-purple-600">
                              U
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            {review.comment && (
                              <p className="text-gray-700 dark:text-gray-300 text-sm">
                                {review.comment}
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No reviews yet. Be the first to leave a review!
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* Quick Book CTA */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Ready to level up your game?
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Book a session with {partner.name.split(' ')[0]}
                    </p>
                  </div>
                  <Button
                    size="lg"
                    onClick={() => {
                      if (partner.services && partner.services.length > 0) {
                        handleBookService(partner.services[0]);
                      }
                    }}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Book Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Dialog */}
      {showBooking && selectedService && (
        <BookingDialog
          partner={partner}
          service={selectedService}
          user={user}
          isOpen={showBooking}
          onClose={() => {
            setShowBooking(false);
            setSelectedService(null);
          }}
          onSuccess={() => {
            setShowBooking(false);
            setSelectedService(null);
            onClose();
          }}
        />
      )}
    </>
  );
}
