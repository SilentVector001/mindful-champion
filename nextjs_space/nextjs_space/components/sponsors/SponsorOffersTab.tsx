'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  MousePointer,
  ShoppingCart,
  Calendar,
  DollarSign,
  Package,
  TrendingUp,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { format } from 'date-fns';

export default function SponsorOffersTab({ profile, onUpdate }: { profile: any; onUpdate: () => void }) {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any>(null);

  useEffect(() => {
    fetchOffers();
  }, [filter]);

  const fetchOffers = async () => {
    try {
      const params = new URLSearchParams({ sponsorView: 'true' });
      if (filter !== 'all') params.append('status', filter);
      
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

  const handleDelete = async (offerId: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;

    try {
      const response = await fetch(`/api/sponsors/offers/${offerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Offer deleted successfully');
        fetchOffers();
        onUpdate();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete offer');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleStatusChange = async (offerId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/sponsors/offers/${offerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(`Offer ${newStatus.toLowerCase()} successfully`);
        fetchOffers();
        onUpdate();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update offer');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-500',
    ACTIVE: 'bg-green-500',
    PAUSED: 'bg-yellow-500',
    EXPIRED: 'bg-red-500',
    ARCHIVED: 'bg-gray-400'
  };

  const filteredOffers = offers;

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Manage Offers</h2>
          <p className="text-gray-600">
            {offers.length} / {profile.maxActiveOffers} active offers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="PAUSED">Paused</SelectItem>
              <SelectItem value="EXPIRED">Expired</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-teal-500 to-teal-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Offer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <OfferForm
                profile={profile}
                offer={editingOffer}
                onClose={() => {
                  setShowCreateDialog(false);
                  setEditingOffer(null);
                }}
                onSuccess={() => {
                  fetchOffers();
                  onUpdate();
                  setShowCreateDialog(false);
                  setEditingOffer(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Offers Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      ) : filteredOffers.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No offers yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first offer to start engaging with the Mindful Champion community
          </p>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-teal-500 to-teal-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Offer
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
                {/* Image */}
                {offer.imageUrl ? (
                  <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-gray-100">
                    <img
                      src={offer.imageUrl}
                      alt={offer.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-gradient-to-r from-teal-100 to-purple-100 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}

                <CardHeader className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg line-clamp-2">{offer.title}</CardTitle>
                    <Badge className={`${statusColors[offer.status]} text-white`}>
                      {offer.status}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {offer.shortDescription || offer.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-blue-50 p-2 rounded">
                      <Eye className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Views</p>
                      <p className="font-semibold text-sm">{offer.viewCount}</p>
                    </div>
                    <div className="bg-green-50 p-2 rounded">
                      <MousePointer className="w-4 h-4 text-green-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Clicks</p>
                      <p className="font-semibold text-sm">{offer.clickCount}</p>
                    </div>
                    <div className="bg-purple-50 p-2 rounded">
                      <ShoppingCart className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Redeemed</p>
                      <p className="font-semibold text-sm">{offer.redemptionCount}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Points Cost:</span>
                      <span className="font-semibold">{offer.pointsCost}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Retail Value:</span>
                      <span className="font-semibold">${offer.retailValue}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Valid Until:</span>
                      <span className="font-semibold text-xs">
                        {format(new Date(offer.endDate), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>

                  {/* Approval & Visibility Status */}
                  {offer.status === 'DRAFT' && (
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded text-xs text-blue-800 space-y-1">
                      <div className="flex items-center gap-2 font-semibold">
                        <Eye className="w-4 h-4" />
                        Draft - Not Visible
                      </div>
                      <p className="text-blue-600">
                        Set to ACTIVE below to submit for approval. Once approved by admin, it will appear in the marketplace.
                      </p>
                    </div>
                  )}
                  {!offer.isApproved && offer.status !== 'DRAFT' && (
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-xs text-yellow-800 space-y-1">
                      <div className="flex items-center gap-2 font-semibold">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Pending Admin Approval
                      </div>
                      <p className="text-yellow-600">
                        Your offer is awaiting review. It will appear in the marketplace once approved.
                      </p>
                    </div>
                  )}
                  {offer.isApproved && offer.status === 'ACTIVE' && (
                    <div className="bg-green-50 border border-green-200 p-3 rounded text-xs text-green-800 space-y-1">
                      <div className="flex items-center gap-2 font-semibold">
                        <Package className="w-4 h-4" />
                        Live in Marketplace
                      </div>
                      <p className="text-green-600">
                        Your offer is live and visible to all users!
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setEditingOffer(offer);
                        setShowCreateDialog(true);
                      }}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    {offer.status === 'DRAFT' ? (
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-gradient-to-r from-teal-500 to-teal-700"
                        onClick={() => handleStatusChange(offer.id, 'ACTIVE')}
                      >
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Submit
                      </Button>
                    ) : offer.status === 'ACTIVE' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(offer.id, 'PAUSED')}
                      >
                        Pause
                      </Button>
                    ) : offer.status === 'PAUSED' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(offer.id, 'ACTIVE')}
                      >
                        Resume
                      </Button>
                    ) : null}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(offer.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function OfferForm({
  profile,
  offer,
  onClose,
  onSuccess
}: {
  profile: any;
  offer?: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: offer?.title || '',
    description: offer?.description || '',
    shortDescription: offer?.shortDescription || '',
    terms: offer?.terms || '',
    imageUrl: offer?.imageUrl || '',
    pointsCost: offer?.pointsCost || '',
    retailValue: offer?.retailValue || '',
    discountPercent: offer?.discountPercent || '',
    startDate: offer?.startDate ? format(new Date(offer.startDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    endDate: offer?.endDate ? format(new Date(offer.endDate), 'yyyy-MM-dd') : format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    category: offer?.category || 'Equipment',
    achievementBonusPoints: offer?.achievementBonusPoints || '',
    maxRedemptionsPerUser: offer?.maxRedemptionsPerUser || '1',
    unlimitedStock: offer?.unlimitedStock || false,
    stockQuantity: offer?.stockQuantity || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = offer ? `/api/sponsors/offers/${offer.id}` : '/api/sponsors/offers';
      const method = offer ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || `Offer ${offer ? 'updated' : 'created'} successfully!`);
        onSuccess();
      } else {
        toast.error(data.error || 'Failed to save offer');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{offer ? 'Edit Offer' : 'Create New Offer'}</DialogTitle>
        <DialogDescription>
          {offer ? 'Update your offer details' : 'Create a new offer for the Mindful Champion marketplace'}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Offer Title *</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="20% Off Pro Paddles"
            />
          </div>

          <div>
            <Label htmlFor="shortDescription">Short Description</Label>
            <Input
              id="shortDescription"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              placeholder="Brief summary for cards"
              maxLength={100}
            />
          </div>

          <div>
            <Label htmlFor="description">Full Description *</Label>
            <Textarea
              id="description"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of your offer..."
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="terms">Terms & Conditions</Label>
            <Textarea
              id="terms"
              value={formData.terms}
              onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
              placeholder="Terms and conditions..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pointsCost">Points Cost *</Label>
            <Input
              id="pointsCost"
              type="number"
              required
              min="0"
              value={formData.pointsCost}
              onChange={(e) => setFormData({ ...formData, pointsCost: e.target.value })}
              placeholder="500"
            />
          </div>
          <div>
            <Label htmlFor="retailValue">Retail Value ($) *</Label>
            <Input
              id="retailValue"
              type="number"
              required
              min="0"
              value={formData.retailValue}
              onChange={(e) => setFormData({ ...formData, retailValue: e.target.value })}
              placeholder="50"
            />
          </div>
        </div>

        {/* Dates & Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date *</Label>
            <Input
              id="endDate"
              type="date"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Equipment">Equipment</SelectItem>
              <SelectItem value="Apparel">Apparel</SelectItem>
              <SelectItem value="Coaching">Coaching</SelectItem>
              <SelectItem value="Events">Events</SelectItem>
              <SelectItem value="Accessories">Accessories</SelectItem>
              <SelectItem value="Training">Training</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Achievement Bonus */}
        <div>
          <Label htmlFor="achievementBonusPoints">Achievement Bonus Points</Label>
          <Input
            id="achievementBonusPoints"
            type="number"
            min="0"
            value={formData.achievementBonusPoints}
            onChange={(e) => setFormData({ ...formData, achievementBonusPoints: e.target.value })}
            placeholder="50 (bonus points when redeemed)"
          />
          <p className="text-xs text-gray-500 mt-1">Bonus points users earn when they redeem this offer</p>
        </div>

        {/* Stock & Limits */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="maxRedemptionsPerUser">Max Per User *</Label>
            <Input
              id="maxRedemptionsPerUser"
              type="number"
              required
              min="1"
              value={formData.maxRedemptionsPerUser}
              onChange={(e) => setFormData({ ...formData, maxRedemptionsPerUser: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="stockQuantity">Stock Quantity</Label>
            <Input
              id="stockQuantity"
              type="number"
              min="0"
              value={formData.stockQuantity}
              onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
              disabled={formData.unlimitedStock}
              placeholder="Leave empty for unlimited"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-teal-500 to-teal-700"
          >
            {loading ? 'Saving...' : offer ? 'Update Offer' : 'Create Offer'}
          </Button>
        </div>
      </form>
    </>
  );
}
