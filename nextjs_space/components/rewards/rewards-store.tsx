// @ts-nocheck

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  Gift, Trophy, Star, ShoppingCart, Search, Filter, Award, Sparkles,
  Lock, TrendingUp, Package, ArrowRight, Crown, Zap, Target
} from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

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
  sponsor: { companyName: string; logo: string | null; };
}

// Tier system
const TIERS = [
  { name: 'Bronze', minPoints: 0, maxPoints: 499, color: 'from-amber-700 to-amber-600', icon: '🥉', benefits: ['5% bonus on earned points', 'Basic rewards access'] },
  { name: 'Silver', minPoints: 500, maxPoints: 1499, color: 'from-slate-400 to-slate-300', icon: '🥈', benefits: ['10% bonus on earned points', 'Early access to new rewards', 'Silver-exclusive deals'] },
  { name: 'Gold', minPoints: 1500, maxPoints: 4999, color: 'from-yellow-500 to-yellow-400', icon: '🥇', benefits: ['15% bonus on earned points', 'Premium rewards access', 'Priority support'] },
  { name: 'Platinum', minPoints: 5000, maxPoints: 14999, color: 'from-cyan-400 to-cyan-300', icon: '💎', benefits: ['20% bonus on earned points', 'Exclusive events', 'Personal coach session'] },
  { name: 'Diamond', minPoints: 15000, maxPoints: Infinity, color: 'from-purple-500 to-pink-500', icon: '👑', benefits: ['25% bonus on earned points', 'VIP everything', 'Annual pro tournament entry'] },
];

function getTier(points: number) {
  return TIERS.find(t => points >= t.minPoints && points <= t.maxPoints) || TIERS[0];
}

function getNextTier(points: number) {
  const currentIdx = TIERS.findIndex(t => points >= t.minPoints && points <= t.maxPoints);
  return currentIdx < TIERS.length - 1 ? TIERS[currentIdx + 1] : null;
}

// Tier Progress Component
function TierProgressCard({ points, lifetimePoints }: { points: number, lifetimePoints: number }) {
  const currentTier = getTier(lifetimePoints);
  const nextTier = getNextTier(lifetimePoints);
  const progressToNext = nextTier 
    ? ((lifetimePoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    : 100;
  const pointsToNext = nextTier ? nextTier.minPoints - lifetimePoints : 0;

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 overflow-hidden">
      <div className={cn("h-2 bg-gradient-to-r", currentTier.color)} />
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          {/* Current Points */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30"
              >
                <Star className="w-8 h-8 text-white fill-white" />
              </motion.div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {currentTier.icon}
              </div>
            </div>
            <div>
              <p className="text-slate-400 text-sm">Available Points</p>
              <p className="text-3xl font-bold text-white">{points.toLocaleString()}</p>
            </div>
          </div>

          {/* Current Tier */}
          <div className="text-right">
            <p className="text-slate-400 text-sm">Current Tier</p>
            <div className="flex items-center gap-2 justify-end">
              <span className="text-2xl">{currentTier.icon}</span>
              <span className={cn("text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent", currentTier.color)}>
                {currentTier.name}
              </span>
            </div>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {nextTier && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Progress to {nextTier.name}</span>
              <span className="text-cyan-400 font-medium">{pointsToNext.toLocaleString()} points to go</span>
            </div>
            <div className="relative">
              <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progressToNext, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={cn("h-full rounded-full bg-gradient-to-r", nextTier.color)}
                />
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1 pr-2">
                <span className="text-xs text-slate-300">{Math.round(progressToNext)}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{currentTier.name} ({currentTier.minPoints.toLocaleString()})</span>
              <span>{nextTier.name} ({nextTier.minPoints.toLocaleString()})</span>
            </div>
          </div>
        )}

        {/* Tier Benefits */}
        <div className="mt-6 pt-4 border-t border-slate-700">
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">Your {currentTier.name} Benefits</p>
          <div className="flex flex-wrap gap-2">
            {currentTier.benefits.map((benefit, i) => (
              <Badge key={i} className="bg-slate-700/50 text-slate-300 text-xs">
                <Zap className="w-3 h-3 mr-1 text-amber-400" /> {benefit}
              </Badge>
            ))}
          </div>
        </div>

        {/* All Tiers Preview */}
        <div className="mt-4 flex items-center gap-1">
          {TIERS.map((tier, i) => (
            <div
              key={tier.name}
              className={cn(
                "flex-1 h-1.5 rounded-full transition-all",
                lifetimePoints >= tier.minPoints ? `bg-gradient-to-r ${tier.color}` : 'bg-slate-700'
              )}
              title={`${tier.name}: ${tier.minPoints.toLocaleString()}+ points`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function RewardsStore() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [lifetimePoints, setLifetimePoints] = useState(0);
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
      setLifetimePoints(data.lifetimePoints || data.points || 0);
      setUserAchievements(data.achievements || 0);
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  };

  const handleRedeem = async (product: Product) => {
    if (userPoints < product.pointsCost) {
      toast({
        title: 'Insufficient Points',
        description: `You need ${product.pointsCost - userPoints} more points.`,
        variant: 'destructive',
      });
      return;
    }
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
      if (response.ok) {
        toast({ title: 'Reward Redeemed! 🎉', description: 'Check your email for details.' });
        fetchUserStats();
        setSelectedProduct(null);
        router.push('/rewards/my-redemptions');
      } else {
        toast({ title: 'Redemption Failed', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(products.map(p => p.category))];

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Rewards Marketplace</h1>
          <p className="text-slate-400">Redeem your points for exclusive gear and experiences</p>
        </div>

        {/* Tier Progress - TOP OF PAGE */}
        <TierProgressCard points={userPoints} lifetimePoints={lifetimePoints} />

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search rewards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-slate-800 border-slate-700 text-white">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {categories.map(cat => (
                <SelectItem key={cat} value={cat} className="text-white hover:bg-slate-700">
                  {cat === 'all' ? 'All Categories' : cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="bg-slate-900/60 border-slate-700 hover:border-cyan-500/50 transition-all h-full flex flex-col">
                <div className="aspect-square relative bg-slate-800 rounded-t-lg overflow-hidden">
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Gift className="w-16 h-16 text-slate-600" />
                    </div>
                  )}
                  <Badge className="absolute top-2 right-2 bg-cyan-500">{product.category}</Badge>
                </div>
                <CardContent className="p-4 flex-1 flex flex-col">
                  <h3 className="text-white font-semibold mb-1">{product.name}</h3>
                  <p className="text-slate-400 text-sm mb-4 flex-1">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-400 font-bold">{product.pointsCost.toLocaleString()} pts</p>
                      <p className="text-slate-500 text-xs">${product.retailValue} value</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleRedeem(product)}
                      disabled={userPoints < product.pointsCost}
                      className={userPoints >= product.pointsCost 
                        ? 'bg-cyan-500 hover:bg-cyan-600' 
                        : 'bg-slate-700 text-slate-400'}
                    >
                      {userPoints >= product.pointsCost ? 'Redeem' : <Lock className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No rewards found</p>
          </div>
        )}
      </div>

      {/* Redemption Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="bg-slate-800 border-slate-700 max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-white">Confirm Redemption</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-300">Redeem <strong>{selectedProduct.name}</strong> for <strong className="text-amber-400">{selectedProduct.pointsCost.toLocaleString()} points</strong>?</p>
              <p className="text-slate-400 text-sm">This action cannot be undone.</p>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button variant="ghost" onClick={() => setSelectedProduct(null)} className="flex-1 text-slate-400">
                Cancel
              </Button>
              <Button onClick={confirmRedemption} className="flex-1 bg-cyan-500 hover:bg-cyan-600">
                Confirm
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
