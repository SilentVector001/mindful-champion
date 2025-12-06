'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  ShoppingCart,
  Award,
  TrendingUp,
  Package,
  Search,
  Filter,
  Tag,
  MapPin,
  Calendar,
  DollarSign,
  Sparkles,
  Star,
  Check,
  X,
  Loader2,
  Gift
} from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';

export default function MarketplacePage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [offers, setOffers] = useState<any[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [pointsFilter, setPointsFilter] = useState('all'); // NEW: Filter by affordability
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [showRedeemDialog, setShowRedeemDialog] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchOffers();
      fetchUserPoints();
    } else {
      setLoading(false);
    }
  }, [status, categoryFilter]);

  const fetchOffers = async () => {
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.append('category', categoryFilter);

      const response = await fetch(`/api/sponsors/offers?${params}`);
      if (response.ok) {
        const data = await response.json();
        setOffers(data.offers || []);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPoints = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUserPoints(data.user?.rewardPoints || 0);
      }
    } catch (error) {
      console.error('Error fetching user points:', error);
    }
  };

  const filteredOffers = offers
    .filter(offer => {
      // Text search filter
      const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Points affordability filter
      const matchesPoints = pointsFilter === 'all' || 
        (pointsFilter === 'affordable' && offer.pointsCost <= userPoints) ||
        (pointsFilter === 'saving' && offer.pointsCost > userPoints);
      
      return matchesSearch && matchesPoints;
    })
    .sort((a, b) => {
      // Sort by affordability first (affordable items at top)
      const aAffordable = a.pointsCost <= userPoints ? 1 : 0;
      const bAffordable = b.pointsCost <= userPoints ? 1 : 0;
      if (aAffordable !== bAffordable) return bAffordable - aAffordable;
      
      // Then by featured
      if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
      
      // Then by points (lower first)
      return a.pointsCost - b.pointsCost;
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-teal-600 via-purple-600 to-pink-600 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              <Gift className="w-12 h-12 md:w-16 md:h-16 inline mr-4" />
              Rewards Marketplace
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Redeem your achievement points for exclusive offers from our partners
            </p>
            
            {status === 'authenticated' && (
              <div className="inline-flex items-center gap-4 bg-white/20 backdrop-blur-sm px-8 py-4 rounded-full">
                <Award className="w-8 h-8" />
                <div className="text-left">
                  <p className="text-sm opacity-75">Your Points</p>
                  <p className="text-3xl font-bold">{userPoints.toLocaleString()}</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters & Search */}
        <Card className="mb-8 border-2 border-teal-200">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Search */}
              <div className="md:col-span-5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search offers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Points Filter */}
              <div className="md:col-span-4">
                <Select value={pointsFilter} onValueChange={setPointsFilter}>
                  <SelectTrigger className="border-2 border-teal-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <span className="flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        All Offers
                      </span>
                    </SelectItem>
                    <SelectItem value="affordable">
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        I Can Afford ({userPoints.toLocaleString()} pts)
                      </span>
                    </SelectItem>
                    <SelectItem value="saving">
                      <span className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-orange-600" />
                        Saving For
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="md:col-span-3">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Apparel">Apparel</SelectItem>
                    <SelectItem value="Coaching">Coaching</SelectItem>
                    <SelectItem value="Events">Events</SelectItem>
                    <SelectItem value="Accessories">Accessories</SelectItem>
                    <SelectItem value="Training">Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Results Summary */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-teal-600">{filteredOffers.length}</span> offer{filteredOffers.length !== 1 ? 's' : ''}
                {pointsFilter === 'affordable' && (
                  <span className="ml-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                      <Check className="w-3 h-3 mr-1" />
                      Within Your Budget
                    </Badge>
                  </span>
                )}
                {pointsFilter === 'saving' && (
                  <span className="ml-2">
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Saving Goals
                    </Badge>
                  </span>
                )}
              </p>
              
              {pointsFilter !== 'all' && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setPointsFilter('all')}
                  className="text-xs"
                >
                  Clear Filter
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Earn More Points CTA */}
        {status === 'authenticated' && filteredOffers.some(offer => offer.pointsCost > userPoints) && (
          <Card className="mb-8 bg-gradient-to-r from-purple-50 to-teal-50 border-2 border-purple-200">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full flex items-center justify-center">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold mb-2 text-gray-900">
                    Want to unlock more rewards?
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Complete achievements in your gallery to earn points and redeem exclusive offers!
                    You currently have <span className="font-bold text-teal-600">{userPoints.toLocaleString()}</span> points.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <Button 
                      onClick={() => router.push('/achievements')}
                      className="bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-700 hover:to-teal-700"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      View Achievements
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => router.push('/dashboard')}
                      className="border-purple-300"
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Offers Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-teal-600" />
          </div>
        ) : filteredOffers.length === 0 ? (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No offers found</h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try adjusting your search terms' : 'Check back soon for new offers!'}
            </p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((offer, index) => (
              <OfferCard
                key={offer.id}
                offer={offer}
                index={index}
                userPoints={userPoints}
                isAuthenticated={status === 'authenticated'}
                onSelect={() => {
                  setSelectedOffer(offer);
                  setShowRedeemDialog(true);
                }}
                onViewDetails={() => router.push(`/marketplace/${offer.id}`)}
              />
            ))}
          </div>
        )}

        {/* Redeem Dialog */}
        {selectedOffer && (
          <RedeemDialog
            open={showRedeemDialog}
            onClose={() => {
              setShowRedeemDialog(false);
              setSelectedOffer(null);
            }}
            offer={selectedOffer}
            userPoints={userPoints}
            onSuccess={() => {
              fetchUserPoints();
              setShowRedeemDialog(false);
              setSelectedOffer(null);
            }}
          />
        )}
      </div>

      {/* Not Logged In Banner */}
      {status === 'unauthenticated' && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-teal-600 to-purple-600 text-white p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="font-semibold mb-1">Sign in to redeem offers</p>
              <p className="text-sm opacity-90">Join Mindful Champion to earn and redeem points</p>
            </div>
            <Button
              onClick={() => router.push('/auth/signin')}
              className="bg-white text-teal-600 hover:bg-gray-100"
            >
              Sign In
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function OfferCard({ offer, index, userPoints, isAuthenticated, onSelect, onViewDetails }: any) {
  const canAfford = userPoints >= offer.pointsCost;
  const pointsNeeded = offer.pointsCost - userPoints;
  const isExpiringSoon = new Date(offer.endDate).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
    >
      <Card className={`hover:shadow-xl transition-all duration-300 h-full flex flex-col overflow-hidden group border-2 ${
        canAfford ? 'border-green-300 hover:border-green-400' : 'border-orange-200 hover:border-orange-300'
      }`}>
        {/* Image */}
        <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-r from-teal-100 to-purple-100">
          {offer.imageUrl ? (
            <div className="relative w-full h-full">
              <Image
                src={offer.imageUrl}
                alt={offer.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-16 h-16 text-gray-300" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {offer.isFeatured && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                <Sparkles className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
            {isExpiringSoon && (
              <Badge variant="destructive">
                <Calendar className="w-3 h-3 mr-1" />
                Ending Soon
              </Badge>
            )}
          </div>

          {/* Points Badge with Affordability Indicator */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
            <Badge className={`${
              canAfford 
                ? 'bg-gradient-to-r from-green-500 to-green-700' 
                : 'bg-gradient-to-r from-orange-500 to-orange-700'
            } text-white text-lg font-bold px-4 py-2`}>
              <Award className="w-4 h-4 mr-1" />
              {offer.pointsCost}
            </Badge>
            {!canAfford && (
              <Badge className="bg-white/95 text-orange-700 text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                Need {pointsNeeded} more
              </Badge>
            )}
          </div>
        </div>

        <CardHeader className="flex-1">
          <div className="flex items-start justify-between gap-2 mb-2">
            <CardTitle className="text-lg line-clamp-2 flex-1">{offer.title}</CardTitle>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline">{offer.category}</Badge>
            {offer.sponsor?.logo ? (
              <img
                src={offer.sponsor.logo}
                alt={offer.sponsor.companyName}
                className="h-5 w-auto"
              />
            ) : (
              <span className="text-xs text-gray-600">{offer.sponsor?.companyName}</span>
            )}
          </div>

          <CardDescription className="line-clamp-2">
            {offer.shortDescription || offer.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Value Display */}
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <div>
              <p className="text-xs text-gray-600">Retail Value</p>
              <p className="text-xl font-bold text-green-600">${offer.retailValue}</p>
            </div>
            {offer.discountPercent && (
              <Badge className="bg-red-500 text-white">
                {offer.discountPercent}% OFF
              </Badge>
            )}
          </div>

          {/* Achievement Bonus */}
          {offer.achievementBonusPoints && (
            <div className="flex items-center gap-2 bg-purple-50 p-2 rounded text-sm text-purple-800">
              <Sparkles className="w-4 h-4" />
              <span className="font-semibold">+{offer.achievementBonusPoints} Bonus Points!</span>
            </div>
          )}

          {/* Valid Until */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Valid until {format(new Date(offer.endDate), 'MMM dd, yyyy')}</span>
          </div>

          {/* Affordability Progress */}
          {!canAfford && isAuthenticated && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Your Progress</span>
                <span className="font-semibold text-orange-600">
                  {Math.round((userPoints / offer.pointsCost) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-orange-400 to-orange-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((userPoints / offer.pointsCost) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">
                Complete more achievements to earn {pointsNeeded.toLocaleString()} more points!
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isAuthenticated ? (
              <>
                <Button
                  onClick={onSelect}
                  disabled={!canAfford}
                  className={`flex-1 ${
                    canAfford
                      ? 'bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800'
                      : 'bg-gray-300'
                  }`}
                >
                  {canAfford ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Redeem Now
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Need {pointsNeeded} pts
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => window.location.href = '/auth/signin'}
                className="flex-1 bg-gradient-to-r from-teal-500 to-teal-700"
              >
                Sign In to Redeem
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function RedeemDialog({ open, onClose, offer, userPoints, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [needsShipping, setNeedsShipping] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    phone: ''
  });

  const handleRedeem = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/sponsors/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId: offer.id,
          shippingAddress: needsShipping ? shippingInfo : null
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Offer redeemed successfully!', {
          description: `Confirmation code: ${data.confirmationCode}`
        });
        onSuccess();
      } else {
        toast.error(data.error || 'Failed to redeem offer');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Redeem Offer</DialogTitle>
          <DialogDescription>
            Confirm your redemption and provide any required information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Offer Summary */}
          <Card className="bg-gradient-to-r from-teal-50 to-purple-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {offer.imageUrl && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
                    <Image src={offer.imageUrl} alt={offer.title} fill className="object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">{offer.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{offer.sponsor?.companyName}</p>
                  <div className="flex items-center gap-4">
                    <Badge className="bg-teal-600 text-white">
                      <Award className="w-4 h-4 mr-1" />
                      {offer.pointsCost} Points
                    </Badge>
                    <span className="font-semibold text-green-600">${offer.retailValue} Value</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Points Balance */}
          <div className="bg-white p-4 rounded-lg border-2 border-teal-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Current Balance:</span>
              <span className="font-bold text-xl">{userPoints.toLocaleString()} pts</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">Cost:</span>
              <span className="font-bold text-xl text-red-600">-{offer.pointsCost} pts</span>
            </div>
            <div className="border-t-2 border-gray-200 pt-2 flex items-center justify-between">
              <span className="font-semibold">Remaining Balance:</span>
              <span className="font-bold text-2xl text-teal-600">
                {(userPoints - offer.pointsCost).toLocaleString()} pts
              </span>
            </div>
            {offer.achievementBonusPoints && (
              <div className="mt-2 bg-purple-50 p-2 rounded flex items-center justify-between">
                <span className="text-sm text-purple-800">Bonus Points:</span>
                <span className="font-semibold text-purple-800">+{offer.achievementBonusPoints} pts</span>
              </div>
            )}
          </div>

          {/* Shipping Information (if needed) */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="needsShipping"
                checked={needsShipping}
                onChange={(e) => setNeedsShipping(e.target.checked)}
                className="w-4 h-4 text-teal-600"
              />
              <Label htmlFor="needsShipping">This offer requires shipping</Label>
            </div>

            {needsShipping && (
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold">Shipping Information</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      required={needsShipping}
                      value={shippingInfo.fullName}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required={needsShipping}
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    required={needsShipping}
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      required={needsShipping}
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      required={needsShipping}
                      value={shippingInfo.state}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP *</Label>
                    <Input
                      id="zip"
                      required={needsShipping}
                      value={shippingInfo.zip}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, zip: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Terms */}
          {offer.terms && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Terms & Conditions</h4>
              <p className="text-sm text-gray-600">{offer.terms}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleRedeem}
              disabled={loading || (needsShipping && (!shippingInfo.fullName || !shippingInfo.address))}
              className="flex-1 bg-gradient-to-r from-teal-500 to-teal-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Confirm Redemption
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
