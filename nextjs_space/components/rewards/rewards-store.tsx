
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Gift,
  Trophy,
  Star,
  ShoppingCart,
  Search,
  Filter,
  Award,
  Sparkles,
  Lock,
  TrendingUp,
  Package,
  ArrowRight,
} from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string | null;
  pointsCost: number;
  retailValue: number;
  stockQuantity: number;
  unlimitedStock: boolean;
  minAchievements: number | null;
  minSkillLevel: string | null;
  sponsor: {
    companyName: string;
    logo: string | null;
  };
}

export default function RewardsStore() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [userAchievements, setUserAchievements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProducts();
      fetchUserStats();
    } else if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/rewards/products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/rewards/user-stats');
      const data = await response.json();
      setUserPoints(data.points || 0);
      setUserAchievements(data.achievements || 0);
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  const handleRedeem = async (product: Product) => {
    if (userPoints < product.pointsCost) {
      toast({
        title: 'Insufficient Points',
        description: `You need ${product.pointsCost - userPoints} more points to redeem this reward.`,
        variant: 'destructive',
      });
      return;
    }

    if (product.minAchievements && userAchievements < product.minAchievements) {
      toast({
        title: 'Achievement Required',
        description: `You need ${product.minAchievements - userAchievements} more achievements to unlock this reward.`,
        variant: 'destructive',
      });
      return;
    }

    // Show redemption confirmation
    setSelectedProduct(product);
  };

  const confirmRedemption = async () => {
    if (!selectedProduct) return;

    try {
      const response = await fetch('/api/rewards/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selectedProduct.id }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Reward Redeemed! 🎉',
          description: 'Check your email for redemption details.',
        });
        fetchUserStats();
        setSelectedProduct(null);
        router.push('/rewards/my-redemptions');
      } else {
        toast({
          title: 'Redemption Failed',
          description: data.error || 'Failed to redeem reward',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const canAfford = (pointsCost: number) => userPoints >= pointsCost;
  const canUnlock = (product: Product) => {
    if (product.minAchievements && userAchievements < product.minAchievements) return false;
    return true;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <Gift className="w-10 h-10" />
                Rewards Store
              </h1>
              <p className="text-cyan-100 text-lg">
                Redeem your achievement points for exclusive rewards
              </p>
            </div>

            {/* User Points Card */}
            <Card className="bg-white/10 backdrop-blur border-white/20 text-white min-w-[280px]">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-cyan-100">Your Points</p>
                    <p className="text-4xl font-bold">{userPoints.toLocaleString()}</p>
                  </div>
                  <Trophy className="w-12 h-12 text-yellow-400" />
                </div>
                <div className="flex items-center gap-2 text-sm text-cyan-100">
                  <Award className="w-4 h-4" />
                  <span>{userAchievements} Achievements Unlocked</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mt-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rewards..."
                className="pl-10 bg-white/90 backdrop-blur"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[200px] bg-white/90 backdrop-blur">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="apparel">Apparel</SelectItem>
                <SelectItem value="nutrition">Nutrition</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="training">Training</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-12">
        {filteredProducts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Rewards Available</h3>
              <p className="text-gray-600">Check back soon for exciting new rewards!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => {
              const affordable = canAfford(product.pointsCost);
              const unlocked = canUnlock(product);
              const available = affordable && unlocked;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`h-full flex flex-col ${!available ? 'opacity-60' : 'hover:shadow-xl transition-shadow'}`}>
                    <CardHeader className="p-0">
                      <div className="relative aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Gift className="w-16 h-16 text-gray-300" />
                          </div>
                        )}
                        {!unlocked && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Lock className="w-12 h-12 text-white" />
                          </div>
                        )}
                        {product.sponsor.logo && (
                          <div className="absolute top-2 right-2 bg-white rounded-lg p-2 shadow-md">
                            <Image
                              src={product.sponsor.logo}
                              alt={product.sponsor.companyName}
                              width={60}
                              height={30}
                              className="object-contain"
                            />
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 pt-4">
                      <Badge className="mb-2" variant="outline">
                        {product.category}
                      </Badge>
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-cyan-600 flex items-center gap-1">
                            <Star className="w-5 h-5 fill-current" />
                            {product.pointsCost.toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-500">
                            ${(product.retailValue / 100).toFixed(2)} value
                          </span>
                        </div>

                        {product.minAchievements && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Trophy className="w-3 h-3" />
                            Requires {product.minAchievements} achievements
                          </div>
                        )}

                        {!product.unlimitedStock && (
                          <div className="text-xs text-gray-600">
                            {product.stockQuantity} left in stock
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        onClick={() => handleRedeem(product)}
                        disabled={!available}
                        className="w-full"
                        variant={available ? 'default' : 'secondary'}
                      >
                        {!unlocked ? (
                          <>
                            <Lock className="w-4 h-4 mr-2" />
                            Locked
                          </>
                        ) : !affordable ? (
                          <>
                            <Star className="w-4 h-4 mr-2" />
                            Need {(product.pointsCost - userPoints).toLocaleString()} More Points
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Redeem Now
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Earn More Points CTA */}
        <Card className="mt-12 bg-gradient-to-r from-cyan-600 to-blue-700 text-white">
          <CardContent className="py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-1">Need More Points?</h3>
                  <p className="text-cyan-100">Complete training sessions and unlock achievements to earn more</p>
                </div>
              </div>
              <Button
                onClick={() => router.push('/train')}
                size="lg"
                className="bg-white text-cyan-700 hover:bg-cyan-50"
              >
                Start Training
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Redemption Confirmation Dialog */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-md w-full"
          >
            <Card>
              <CardHeader>
                <CardTitle>Confirm Redemption</CardTitle>
                <CardDescription>You're about to redeem this reward</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  {selectedProduct.imageUrl && (
                    <div className="w-24 h-24 relative bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={selectedProduct.imageUrl}
                        alt={selectedProduct.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold">{selectedProduct.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{selectedProduct.description}</p>
                  </div>
                </div>

                <Alert>
                  <AlertDescription>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Cost:</span>
                        <span className="font-semibold">{selectedProduct.pointsCost.toLocaleString()} points</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Your Balance:</span>
                        <span className="font-semibold">{userPoints.toLocaleString()} points</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span>After Redemption:</span>
                        <span className="font-semibold">{(userPoints - selectedProduct.pointsCost).toLocaleString()} points</span>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmRedemption}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600"
                >
                  Confirm Redemption
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
