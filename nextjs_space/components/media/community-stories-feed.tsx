'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import {
  Heart,
  Eye,
  MapPin,
  Calendar,
  User,
  Send,
  BookOpen,
  Award
} from 'lucide-react';
import { toast } from 'sonner';

interface Story {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  authorName: string;
  location?: string;
  skillLevel?: string;
  category: string;
  photoUrl?: string;
  views: number;
  likes: number;
  createdAt: string;
  featured: boolean;
}

export function CommunityStoriesFeed() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    authorName: '',
    authorEmail: '',
    location: '',
    skillLevel: 'Intermediate',
    category: 'success'
  });

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/media/stories');
      if (res?.ok) {
        const data = await res.json();
        setStories(data?.stories || []);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e?.preventDefault();
    try {
      const res = await fetch('/api/media/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (res?.ok) {
        toast.success('Story submitted successfully! It will be reviewed by our team.');
        setShowSubmitForm(false);
        setFormData({
          title: '',
          content: '',
          authorName: '',
          authorEmail: '',
          location: '',
          skillLevel: 'Intermediate',
          category: 'success'
        });
      } else {
        toast.error('Failed to submit story. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting story:', error);
      toast.error('An error occurred. Please try again.');
    }
  };

  // Mock stories for initial display
  const mockStories: Story[] = [
    {
      id: '1',
      title: 'From Beginner to Tournament Champion in 18 Months',
      content: 'I started playing pickleball during the pandemic as a way to stay active. Never did I imagine that just 18 months later, I would win my first tournament...',
      excerpt: 'An inspiring journey from complete beginner to competitive player',
      authorName: 'Sarah Martinez',
      location: 'Austin, TX',
      skillLevel: '4.5',
      category: 'success',
      views: 1245,
      likes: 89,
      createdAt: '2025-12-10',
      featured: true
    },
    {
      id: '2',
      title: 'How Pickleball Helped Me Recover from Injury',
      content: 'After a serious knee injury ended my tennis career, I thought my competitive sports days were over. Then I discovered pickleball...',
      excerpt: 'A story of recovery, resilience, and finding new passion',
      authorName: 'Michael Chen',
      location: 'San Diego, CA',
      skillLevel: '4.0',
      category: 'community',
      views: 892,
      likes: 67,
      createdAt: '2025-12-08',
      featured: false
    },
    {
      id: '3',
      title: 'Building a Thriving Pickleball Community',
      content: 'Three years ago, our town had zero pickleball courts. Today, we have 12 courts and over 200 active players. Here\'s how we made it happen...',
      excerpt: 'How one person sparked a pickleball revolution in their community',
      authorName: 'Linda Thompson',
      location: 'Boulder, CO',
      skillLevel: '3.5',
      category: 'community',
      views: 1567,
      likes: 123,
      createdAt: '2025-12-05',
      featured: true
    }
  ];

  const displayStories = stories?.length > 0 ? stories : mockStories;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'success': return 'bg-emerald-100 text-emerald-700';
      case 'tournament': return 'bg-amber-100 text-amber-700';
      case 'training': return 'bg-blue-100 text-blue-700';
      case 'community': return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

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
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Community Stories</h1>
                <p className="text-slate-500">Inspiring journeys from our pickleball community</p>
              </div>
            </div>
            <Button
              onClick={() => setShowSubmitForm(!showSubmitForm)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full"
            >
              <Send className="w-4 h-4 mr-2" />
              Share Your Story
            </Button>
          </div>
        </motion.div>

        {/* Submit Form */}
        {showSubmitForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <Card className="border-purple-200 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Share Your Pickleball Story</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Your Name"
                      value={formData?.authorName}
                      onChange={(e) => setFormData({ ...formData, authorName: e?.target?.value || '' })}
                      required
                    />
                    <Input
                      type="email"
                      placeholder="Your Email"
                      value={formData?.authorEmail}
                      onChange={(e) => setFormData({ ...formData, authorEmail: e?.target?.value || '' })}
                      required
                    />
                  </div>
                  <Input
                    placeholder="Story Title"
                    value={formData?.title}
                    onChange={(e) => setFormData({ ...formData, title: e?.target?.value || '' })}
                    required
                  />
                  <Textarea
                    placeholder="Tell us your story..."
                    value={formData?.content}
                    onChange={(e) => setFormData({ ...formData, content: e?.target?.value || '' })}
                    rows={6}
                    required
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      placeholder="Location (Optional)"
                      value={formData?.location}
                      onChange={(e) => setFormData({ ...formData, location: e?.target?.value || '' })}
                    />
                    <select
                      value={formData?.skillLevel}
                      onChange={(e) => setFormData({ ...formData, skillLevel: e?.target?.value || 'Intermediate' })}
                      className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Pro">Pro</option>
                    </select>
                    <select
                      value={formData?.category}
                      onChange={(e) => setFormData({ ...formData, category: e?.target?.value || 'success' })}
                      className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                    >
                      <option value="success">Success Story</option>
                      <option value="tournament">Tournament Experience</option>
                      <option value="training">Training Journey</option>
                      <option value="community">Community Impact</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowSubmitForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    >
                      Submit Story
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Featured Stories */}
        {displayStories?.filter(s => s?.featured)?.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Featured Stories
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {displayStories?.filter(s => s?.featured)?.map((story, idx) => (
                <motion.div
                  key={story?.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="hover:shadow-xl transition-shadow border-2 border-amber-100 bg-gradient-to-br from-white to-amber-50">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={getCategoryColor(story?.category || '')}>
                          {story?.category}
                        </Badge>
                        <Badge className="bg-amber-500 text-white">
                          <Award className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-3">{story?.title}</h3>
                      <p className="text-slate-600 mb-4 line-clamp-3">{story?.content}</p>
                      <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {story?.authorName}
                          </span>
                          {story?.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {story?.location}
                            </span>
                          )}
                        </div>
                        {story?.skillLevel && (
                          <Badge variant="outline">{story?.skillLevel}</Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {story?.views?.toLocaleString() || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {story?.likes?.toLocaleString() || 0}
                          </span>
                        </div>
                        <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                          Read More
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* All Stories */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-6">All Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayStories?.filter(s => !s?.featured)?.map((story, idx) => (
              <motion.div
                key={story?.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-6">
                    <Badge className={getCategoryColor(story?.category || '')}>
                      {story?.category}
                    </Badge>
                    <h3 className="text-lg font-bold text-slate-800 mt-3 mb-2">{story?.title}</h3>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-3">{story?.content}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                      <User className="w-4 h-4" />
                      {story?.authorName}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {story?.views?.toLocaleString() || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {story?.likes?.toLocaleString() || 0}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-purple-600">
                        Read
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {displayStories?.length === 0 && !isLoading && (
          <Card className="bg-gradient-to-br from-slate-50 to-white">
            <CardContent className="text-center py-16">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">No stories yet</h3>
              <p className="text-slate-500 mb-6">Be the first to share your pickleball journey!</p>
              <Button
                onClick={() => setShowSubmitForm(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full"
              >
                <Send className="w-4 h-4 mr-2" />
                Share Your Story
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
