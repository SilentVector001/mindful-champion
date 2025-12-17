'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  X,
  Download,
  Heart,
  Eye,
  Filter,
  Calendar
} from 'lucide-react';
import Image from 'next/image';

interface Photo {
  id: string;
  title: string;
  description?: string;
  url: string;
  category: string;
  tags?: string[];
  uploadedByName?: string;
  views: number;
  likes: number;
  createdAt: string;
  featured: boolean;
}

export function PhotoGallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['All', 'Tournament', 'Training', 'Community', 'Facilities'];

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/media/photos');
      if (res?.ok) {
        const data = await res.json();
        setPhotos(data?.photos || []);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock photos for initial display
  const mockPhotos: Photo[] = [
    {
      id: '1',
      title: 'PPA Tour Championship Finals',
      description: 'Championship Court action from the 2025 PPA Tour Finals',
      url: 'https://ppatour.com/wp-content/uploads/2023/12/TX-Open-DJI-Watermarked-scaled-1.webp',
      category: 'Tournament',
      tags: ['PPA', 'Championship', 'Finals'],
      uploadedByName: 'PPA Tour',
      views: 2345,
      likes: 189,
      createdAt: '2025-12-10',
      featured: true
    },
    {
      id: '2',
      title: 'Pro Players in Action',
      description: 'Professional pickleball action from major tournaments',
      url: 'https://ppatour.com/wp-content/uploads/2024/07/PPA-Grows-Internationally.webp',
      category: 'Tournament',
      tags: ['Professional', 'Action'],
      uploadedByName: 'PPA Tour',
      views: 1876,
      likes: 145,
      createdAt: '2025-12-08',
      featured: true
    },
    {
      id: '3',
      title: 'Championship Match Moments',
      description: 'Intense moments from championship matches',
      url: 'https://images.pickleball.com/news/1724094389936/KC_TYSON%20X%20JAUME_MD-3.jpg',
      category: 'Tournament',
      tags: ['Championship', 'Competition'],
      uploadedByName: 'MLP',
      views: 1543,
      likes: 123,
      createdAt: '2025-12-05',
      featured: false
    },
    {
      id: '4',
      title: 'Community Training Session',
      description: 'Local players improving their skills',
      url: 'https://ppatour.com/wp-content/uploads/2023/12/TX-Open-DJI-Watermarked-scaled-1.webp',
      category: 'Training',
      tags: ['Training', 'Community', 'Skills'],
      uploadedByName: 'Mindful Champion',
      views: 876,
      likes: 67,
      createdAt: '2025-12-03',
      featured: false
    },
    {
      id: '5',
      title: 'New Pickleball Facility Opening',
      description: 'State-of-the-art courts and amenities',
      url: 'https://ppatour.com/wp-content/uploads/2024/07/PPA-Grows-Internationally.webp',
      category: 'Facilities',
      tags: ['Facility', 'Courts', 'New'],
      uploadedByName: 'Community Club',
      views: 1234,
      likes: 98,
      createdAt: '2025-12-01',
      featured: false
    },
    {
      id: '6',
      title: 'Community Tournament Day',
      description: 'Local tournament bringing players together',
      url: 'https://images.pickleball.com/news/1724094389936/KC_TYSON%20X%20JAUME_MD-3.jpg',
      category: 'Community',
      tags: ['Community', 'Tournament', 'Fun'],
      uploadedByName: 'Local League',
      views: 654,
      likes: 54,
      createdAt: '2025-11-28',
      featured: false
    }
  ];

  const displayPhotos = photos?.length > 0 ? photos : mockPhotos;

  const filteredPhotos = displayPhotos?.filter(photo => {
    if (selectedCategory === 'All') return true;
    return photo?.category === selectedCategory;
  }) || [];

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
              <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl shadow-lg">
                <ImageIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Photo Gallery</h1>
                <p className="text-slate-500">Browse photos from tournaments and community events</p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2">
              <ImageIcon className="w-4 h-4 mr-2" />
              {displayPhotos?.length || 0} Photos
            </Badge>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <Filter className="w-5 h-5 text-slate-400 flex-shrink-0" />
            {categories?.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-pink-500 hover:bg-pink-600 text-white'
                    : 'hover:border-pink-500'
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Photo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos?.map((photo, idx) => (
            <motion.div
              key={photo?.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.03 }}
              whileHover={{ scale: 1.03 }}
              className="group cursor-pointer"
              onClick={() => setSelectedPhoto(photo)}
            >
              <Card className="overflow-hidden hover:shadow-xl transition-all">
                <div className="relative aspect-square bg-slate-200">
                  <Image
                    src={photo?.url || ''}
                    alt={photo?.title || 'Photo'}
                    fill
                    className="object-cover transition-transform group-hover:scale-110 duration-300"
                  />
                  {photo?.featured && (
                    <Badge className="absolute top-2 left-2 bg-pink-500 text-white">
                      Featured
                    </Badge>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 left-2 right-2">
                      <h3 className="text-white font-semibold text-sm line-clamp-2">{photo?.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-white/80 mt-1">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {photo?.views?.toLocaleString() || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {photo?.likes?.toLocaleString() || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPhotos?.length === 0 && !isLoading && (
          <Card className="bg-gradient-to-br from-slate-50 to-white">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageIcon className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">No photos found</h3>
              <p className="text-slate-500 mb-6">Try selecting a different category</p>
              <Button
                variant="outline"
                onClick={() => setSelectedCategory('All')}
                className="rounded-full"
              >
                View All Photos
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Lightbox Modal */}
        <AnimatePresence>
          {selectedPhoto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={() => setSelectedPhoto(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-5xl w-full bg-white rounded-2xl overflow-hidden"
                onClick={(e) => e?.stopPropagation()}
              >
                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full"
                  onClick={() => setSelectedPhoto(null)}
                >
                  <X className="w-6 h-6" />
                </Button>

                {/* Image */}
                <div className="relative aspect-[16/10] bg-slate-900">
                  <Image
                    src={selectedPhoto?.url || ''}
                    alt={selectedPhoto?.title || 'Photo'}
                    fill
                    className="object-contain"
                  />
                </div>

                {/* Photo Details */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Badge className="mb-2">{selectedPhoto?.category}</Badge>
                      <h2 className="text-2xl font-bold text-slate-800 mb-2">{selectedPhoto?.title}</h2>
                      {selectedPhoto?.description && (
                        <p className="text-slate-600">{selectedPhoto?.description}</p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = selectedPhoto?.url || '';
                        link.download = `${selectedPhoto?.title}.jpg`;
                        link.click();
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <div className="flex items-center gap-4">
                      {selectedPhoto?.uploadedByName && (
                        <span>By {selectedPhoto?.uploadedByName}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(selectedPhoto?.createdAt || '')?.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {selectedPhoto?.views?.toLocaleString() || 0} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {selectedPhoto?.likes?.toLocaleString() || 0} likes
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
