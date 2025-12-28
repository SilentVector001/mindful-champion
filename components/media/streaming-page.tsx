
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Monitor,
  ExternalLink,
  Search,
  Filter,
  DollarSign,
  Zap,
  Crown,
  Star,
  Heart,
  Share2,
  Tv,
  Smartphone,
  Globe,
  Youtube,
  Play,
  Wifi,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

interface StreamingPlatform {
  id: string;
  platformId: string;
  name: string;
  description: string | null;
  officialWebsite: string | null;
  streamingUrl: string | null;
  logoUrl: string | null;
  type: string;
  subscriptionCost: string | null;
  hasFreeAccess: boolean;
  freeAccessDetails: any;
  features: any[];
  content: any[];
  platforms: any[];
  socialLinks: any;
  tierAccess: string;
  viewCount: number;
  clickCount: number;
}

interface StreamingResponse {
  success: boolean;
  platforms: StreamingPlatform[];
  groupedPlatforms: {
    free: StreamingPlatform[];
    subscription: StreamingPlatform[];
    freemium: StreamingPlatform[];
    cable: StreamingPlatform[];
    payPerView: StreamingPlatform[];
  };
  totalCount: number;
  userTier: string;
  stats: {
    total: number;
    free: number;
    subscription: number;
    freemium: number;
    cable: number;
    payPerView: number;
  };
}

export function StreamingPage() {
  const [platforms, setPlatforms] = useState<StreamingPlatform[]>([]);
  const [groupedPlatforms, setGroupedPlatforms] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [userTier, setUserTier] = useState<string>('FREE');
  const [stats, setStats] = useState({
    total: 0,
    free: 0,
    subscription: 0,
    freemium: 0,
    cable: 0,
    payPerView: 0
  });
  const [filteredPlatforms, setFilteredPlatforms] = useState<StreamingPlatform[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    fetchPlatforms();
  }, [selectedType]);

  useEffect(() => {
    filterPlatforms();
  }, [platforms, searchTerm]);

  const fetchPlatforms = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedType !== 'all') params.append('type', selectedType);

      const response = await fetch(`/api/media/streaming?${params}`);
      const data: StreamingResponse = await response.json();
      
      if (data.success) {
        setPlatforms(data.platforms);
        setGroupedPlatforms(data.groupedPlatforms);
        setFilteredPlatforms(data.platforms);
        setUserTier(data.userTier);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching streaming platforms:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPlatforms = () => {
    if (!searchTerm) {
      setFilteredPlatforms(platforms);
      return;
    }

    const filtered = platforms.filter(platform =>
      platform.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      platform.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPlatforms(filtered);
  };

  const handleFavorite = async (platformId: string) => {
    try {
      const isFavorited = favorites.includes(platformId);
      const action = isFavorited ? 'unfavorite' : 'favorite';
      
      const response = await fetch('/api/media/streaming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, platformId })
      });
      
      if (response.ok) {
        setFavorites(prev => 
          isFavorited 
            ? prev.filter(id => id !== platformId)
            : [...prev, platformId]
        );
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleVisit = async (platform: StreamingPlatform) => {
    try {
      // Track the visit
      await fetch('/api/media/streaming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'visit', platformId: platform.id })
      });
      
      // Open the platform
      const url = platform.streamingUrl || platform.officialWebsite;
      if (url) {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error tracking visit:', error);
    }
  };

  const handleShare = async (platform: StreamingPlatform) => {
    if (navigator.share) {
      await navigator.share({
        title: platform.name,
        text: platform.description || '',
        url: platform.officialWebsite || window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(platform.officialWebsite || window.location.href);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'FREE':
        return <Zap className="w-4 h-4" />;
      case 'SUBSCRIPTION':
        return <DollarSign className="w-4 h-4" />;
      case 'FREEMIUM':
        return <Star className="w-4 h-4" />;
      case 'CABLE':
        return <Tv className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'FREE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'SUBSCRIPTION':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'FREEMIUM':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'CABLE':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return <StreamingPageSkeleton />;
  }

  return (
    <div className="relative">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-champion-blue to-champion-green rounded-2xl blur-3xl opacity-20"></div>
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200">
              <Monitor className="w-16 h-16 mx-auto mb-4 text-champion-blue" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-champion-blue to-champion-green bg-clip-text text-transparent mb-4">
                Streaming Platforms
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Find where to watch live pickleball tournaments and matches. Compare platforms, pricing, and features.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          <Card className="text-center p-4 bg-green-50 border-green-200">
            <Zap className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-800 mb-1">{stats.free}</div>
            <div className="text-sm text-green-700">Free</div>
          </Card>
          <Card className="text-center p-4 bg-blue-50 border-blue-200">
            <DollarSign className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-800 mb-1">{stats.subscription}</div>
            <div className="text-sm text-blue-700">Subscription</div>
          </Card>
          <Card className="text-center p-4 bg-purple-50 border-purple-200">
            <Star className="w-6 h-6 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-800 mb-1">{stats.freemium}</div>
            <div className="text-sm text-purple-700">Freemium</div>
          </Card>
          <Card className="text-center p-4 bg-orange-50 border-orange-200">
            <Tv className="w-6 h-6 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold text-orange-800 mb-1">{stats.cable}</div>
            <div className="text-sm text-orange-700">Cable/TV</div>
          </Card>
          <Card className="text-center p-4">
            <Monitor className="w-6 h-6 mx-auto mb-2 text-gray-600" />
            <div className="text-2xl font-bold text-gray-800 mb-1">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </Card>
        </motion.div>

        {/* Filters and Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search streaming platforms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Platform Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="freemium">Freemium</SelectItem>
                  <SelectItem value="cable">Cable/TV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </motion.div>

        {/* Content Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All Platforms</TabsTrigger>
              <TabsTrigger value="free">Free</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
              <TabsTrigger value="freemium">Freemium</TabsTrigger>
              <TabsTrigger value="cable">Cable/TV</TabsTrigger>
              <TabsTrigger value="comparison">Compare</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6">
              <PlatformGrid 
                platforms={filteredPlatforms} 
                userTier={userTier}
                favorites={favorites}
                onFavorite={handleFavorite}
                onVisit={handleVisit}
                onShare={handleShare}
                getTypeIcon={getTypeIcon}
                getTypeColor={getTypeColor}
              />
            </TabsContent>

            <TabsContent value="free" className="space-y-6">
              <PlatformGrid 
                platforms={groupedPlatforms.free?.filter((p: StreamingPlatform) => 
                  !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  p.description?.toLowerCase().includes(searchTerm.toLowerCase())
                ) || []} 
                userTier={userTier}
                favorites={favorites}
                onFavorite={handleFavorite}
                onVisit={handleVisit}
                onShare={handleShare}
                getTypeIcon={getTypeIcon}
                getTypeColor={getTypeColor}
              />
            </TabsContent>

            <TabsContent value="subscription" className="space-y-6">
              <PlatformGrid 
                platforms={groupedPlatforms.subscription?.filter((p: StreamingPlatform) => 
                  !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  p.description?.toLowerCase().includes(searchTerm.toLowerCase())
                ) || []} 
                userTier={userTier}
                favorites={favorites}
                onFavorite={handleFavorite}
                onVisit={handleVisit}
                onShare={handleShare}
                getTypeIcon={getTypeIcon}
                getTypeColor={getTypeColor}
              />
            </TabsContent>

            <TabsContent value="freemium" className="space-y-6">
              <PlatformGrid 
                platforms={groupedPlatforms.freemium?.filter((p: StreamingPlatform) => 
                  !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  p.description?.toLowerCase().includes(searchTerm.toLowerCase())
                ) || []} 
                userTier={userTier}
                favorites={favorites}
                onFavorite={handleFavorite}
                onVisit={handleVisit}
                onShare={handleShare}
                getTypeIcon={getTypeIcon}
                getTypeColor={getTypeColor}
              />
            </TabsContent>

            <TabsContent value="cable" className="space-y-6">
              <PlatformGrid 
                platforms={groupedPlatforms.cable?.filter((p: StreamingPlatform) => 
                  !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  p.description?.toLowerCase().includes(searchTerm.toLowerCase())
                ) || []} 
                userTier={userTier}
                favorites={favorites}
                onFavorite={handleFavorite}
                onVisit={handleVisit}
                onShare={handleShare}
                getTypeIcon={getTypeIcon}
                getTypeColor={getTypeColor}
              />
            </TabsContent>

            <TabsContent value="comparison" className="space-y-6">
              <ComparisonTable platforms={platforms.slice(0, 8)} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

interface PlatformGridProps {
  platforms: StreamingPlatform[];
  userTier: string;
  favorites: string[];
  onFavorite: (id: string) => void;
  onVisit: (platform: StreamingPlatform) => void;
  onShare: (platform: StreamingPlatform) => void;
  getTypeIcon: (type: string) => JSX.Element;
  getTypeColor: (type: string) => string;
}

function PlatformGrid({ 
  platforms, 
  userTier, 
  favorites, 
  onFavorite, 
  onVisit, 
  onShare, 
  getTypeIcon, 
  getTypeColor 
}: PlatformGridProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {platforms.map((platform, index) => (
        <motion.div
          key={platform.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="h-full hover:shadow-lg transition-all border-2 hover:border-champion-blue/20 group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-champion-blue transition-colors">
                    {platform.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getTypeColor(platform.type)}>
                      {getTypeIcon(platform.type)}
                      <span className="ml-1 capitalize">{platform.type.toLowerCase()}</span>
                    </Badge>
                    
                    {platform.hasFreeAccess && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <Zap className="w-3 h-3 mr-1" />
                        Free Access
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => onFavorite(platform.id)}
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(platform.id) ? 'fill-current text-red-500' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {platform.description && (
                <p className="text-sm text-gray-600 line-clamp-3">{platform.description}</p>
              )}
              
              {/* Pricing */}
              {platform.subscriptionCost && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">{platform.subscriptionCost}</span>
                </div>
              )}
              
              {/* Features */}
              {platform.features && platform.features.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Features:</h4>
                  <div className="space-y-1">
                    {platform.features.slice(0, 3).map((feature: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span className="line-clamp-1">{feature}</span>
                      </div>
                    ))}
                    {platform.features.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{platform.features.length - 3} more features
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Content Types */}
              {platform.content && platform.content.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {platform.content.slice(0, 3).map((content: string, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {content}
                    </Badge>
                  ))}
                  {platform.content.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{platform.content.length - 3}
                    </Badge>
                  )}
                </div>
              )}
              
              {/* Available Platforms */}
              {platform.platforms && platform.platforms.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Smartphone className="w-3 h-3" />
                  <span>Available on: {platform.platforms.slice(0, 3).join(', ')}</span>
                  {platform.platforms.length > 3 && ` +${platform.platforms.length - 3} more`}
                </div>
              )}
              
              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t">
                <Button
                  className="flex-1 bg-gradient-to-r from-champion-blue to-champion-green hover:shadow-lg"
                  onClick={() => onVisit(platform)}
                  disabled={!platform.streamingUrl && !platform.officialWebsite}
                >
                  {platform.type === 'FREE' ? (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Watch Free
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Site
                    </>
                  )}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  className="h-10 w-10 p-0"
                  onClick={() => onShare(platform)}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Tier Access Warning */}
              {platform.tierAccess === 'PREMIUM' && userTier === 'FREE' && (
                <div className="flex items-center gap-2 p-2 bg-champion-gold/10 rounded-lg">
                  <Crown className="w-4 h-4 text-champion-gold" />
                  <span className="text-xs text-champion-gold">Premium Access Required</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function ComparisonTable({ platforms }: { platforms: StreamingPlatform[] }) {
  const getTypeColorLocal = (type: string) => {
    switch (type) {
      case 'FREE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'SUBSCRIPTION':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'FREEMIUM':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'CABLE':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="w-5 h-5 text-champion-blue" />
          Platform Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">Platform</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Cost</th>
                <th className="text-left p-3">Free Access</th>
                <th className="text-left p-3">Content</th>
                <th className="text-left p-3">Platforms</th>
              </tr>
            </thead>
            <tbody>
              {platforms.map(platform => (
                <tr key={platform.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <div className="font-medium">{platform.name}</div>
                    <div className="text-xs text-gray-500 line-clamp-1">
                      {platform.description}
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge className={`text-xs ${getTypeColorLocal(platform.type)}`}>
                      {platform.type}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm">
                    {platform.subscriptionCost || (platform.hasFreeAccess ? 'Free' : 'N/A')}
                  </td>
                  <td className="p-3">
                    {platform.hasFreeAccess ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-gray-300" />
                    )}
                  </td>
                  <td className="p-3 text-xs">
                    {platform.content?.slice(0, 2).join(', ') || 'N/A'}
                  </td>
                  <td className="p-3 text-xs">
                    {platform.platforms?.slice(0, 2).join(', ') || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function StreamingPageSkeleton() {
  return (
    <div className="relative">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <Skeleton className="h-16 w-16 mx-auto mb-4 rounded-full" />
          <Skeleton className="h-12 w-80 mx-auto mb-4" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="text-center p-4">
              <Skeleton className="h-6 w-6 mx-auto mb-2" />
              <Skeleton className="h-8 w-8 mx-auto mb-1" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </Card>
          ))}
        </div>
        
        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-48" />
          </div>
        </Card>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-80">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-full mb-2" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <div className="flex gap-2 pt-4">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-10" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function getTypeColor(type: string) {
  switch (type) {
    case 'FREE':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'SUBSCRIPTION':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'FREEMIUM':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'CABLE':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}