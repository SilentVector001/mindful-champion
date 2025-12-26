'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Users,
  User,
  Package,
  TrendingUp,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Sparkles,
  Award,
  Loader2,
  Building2,
  Mail,
  Phone,
  Globe
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminSponsorsPage() {
  const { data: session, status } = useSession() || {};
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated') {
      if (session?.user?.role !== 'ADMIN') {
        router.push('/');
        toast.error('Access denied');
        return;
      }
      fetchApplications();
      fetchOffers();
    }
  }, [status, router, session]);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/admin/sponsors/applications');
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOffers = async () => {
    try {
      const response = await fetch('/api/admin/sponsors/offers');
      if (response.ok) {
        const data = await response.json();
        setOffers(data.offers || []);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  const handleApplicationAction = async (applicationId: string, status: string, tier?: string) => {
    try {
      const response = await fetch(`/api/admin/sponsors/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          approvedTier: tier,
          reviewNotes: `${status} by admin`
        })
      });

      if (response.ok) {
        toast.success(`Application ${status.toLowerCase()} successfully`);
        fetchApplications();
        setSelectedApplication(null);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update application');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const handleOfferAction = async (offerId: string, updates: any) => {
    try {
      const response = await fetch(`/api/admin/sponsors/offers/${offerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        toast.success('Offer updated successfully');
        fetchOffers();
        setSelectedOffer(null);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update offer');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-purple-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  const pendingApplications = applications.filter(a => a.status === 'PENDING' || a.status === 'UNDER_REVIEW');
  const pendingOffers = offers.filter(o => !o.isApproved && o.status === 'DRAFT');

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
              Sponsor Management
            </h1>
            <p className="text-gray-600">Manage sponsor applications and offers</p>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Pending Applications"
            value={pendingApplications.length}
            icon={Clock}
            color="bg-yellow-500"
          />
          <StatCard
            title="Active Sponsors"
            value={applications.filter(a => a.status === 'APPROVED').length}
            icon={CheckCircle}
            color="bg-green-500"
          />
          <StatCard
            title="Pending Offers"
            value={pendingOffers.length}
            icon={Package}
            color="bg-blue-500"
          />
          <StatCard
            title="Active Offers"
            value={offers.filter(o => o.status === 'ACTIVE' && o.isApproved).length}
            icon={Sparkles}
            color="bg-purple-500"
          />
        </div>

        {/* Tabs */}
        <Card className="border-2 border-teal-200">
          <Tabs defaultValue="applications">
            <CardHeader className="border-b">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="applications">
                  Applications
                  {pendingApplications.length > 0 && (
                    <Badge className="ml-2 bg-yellow-500">{pendingApplications.length}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="offers">
                  Offers
                  {pendingOffers.length > 0 && (
                    <Badge className="ml-2 bg-blue-500">{pendingOffers.length}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="p-6">
              <TabsContent value="applications" className="mt-0">
                <ApplicationsTab
                  applications={applications}
                  onSelect={setSelectedApplication}
                  onAction={handleApplicationAction}
                />
              </TabsContent>

              <TabsContent value="offers" className="mt-0">
                <OffersTab
                  offers={offers}
                  onSelect={setSelectedOffer}
                  onAction={handleOfferAction}
                />
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        {/* Application Review Dialog */}
        {selectedApplication && (
          <ApplicationReviewDialog
            application={selectedApplication}
            onClose={() => setSelectedApplication(null)}
            onAction={handleApplicationAction}
          />
        )}

        {/* Offer Review Dialog */}
        {selectedOffer && (
          <OfferReviewDialog
            offer={selectedOffer}
            onClose={() => setSelectedOffer(null)}
            onAction={handleOfferAction}
          />
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ApplicationsTab({ applications, onSelect, onAction }: any) {
  const [filter, setFilter] = useState('all');

  const filteredApplications = applications.filter((app: any) =>
    filter === 'all' ? true : app.status === filter
  );

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-500',
    UNDER_REVIEW: 'bg-blue-500',
    APPROVED: 'bg-green-500',
    REJECTED: 'bg-red-500',
    WAITLISTED: 'bg-gray-500'
  };

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Sponsor Applications</h2>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <p className="text-center text-gray-600 py-12">No applications found</p>
        ) : (
          filteredApplications.map((app: any) => (
            <Card key={app.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{app.companyName}</h3>
                      <Badge className={`${statusColors[app.status]} text-white`}>
                        {app.status}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{app.description}</p>
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        {app.email}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        {app.phone || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Globe className="w-4 h-4" />
                        {app.website || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Award className="w-4 h-4" />
                        Interested Tier: {app.interestedTier}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelect(app)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  {app.status === 'PENDING' && (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => onAction(app.id, 'APPROVED', app.interestedTier)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onAction(app.id, 'REJECTED')}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                  Submitted: {format(new Date(app.createdAt), 'MMM dd, yyyy h:mm a')}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function OffersTab({ offers, onSelect, onAction }: any) {
  const [filter, setFilter] = useState('pending');

  const filteredOffers = offers.filter((offer: any) => {
    if (filter === 'pending') return !offer.isApproved && offer.status === 'DRAFT';
    if (filter === 'active') return offer.isApproved && offer.status === 'ACTIVE';
    if (filter === 'featured') return offer.isFeatured;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Sponsor Offers</h2>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Offers</SelectItem>
            <SelectItem value="pending">Pending Approval</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="featured">Featured</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Offers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOffers.length === 0 ? (
          <p className="col-span-full text-center text-gray-600 py-12">No offers found</p>
        ) : (
          filteredOffers.map((offer: any) => (
            <Card key={offer.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg line-clamp-2">{offer.title}</CardTitle>
                  {offer.isFeatured && (
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
                <CardDescription className="line-clamp-2">
                  {offer.sponsor?.companyName}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Points:</span>
                  <span className="font-semibold">{offer.pointsCost}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Value:</span>
                  <span className="font-semibold">${offer.retailValue}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Redemptions:</span>
                  <span className="font-semibold">{offer.redemptionCount}</span>
                </div>

                <div className="flex gap-2">
                  {!offer.isApproved && (
                    <>
                      <Button
                        size="sm"
                        className="flex-1 bg-green-600"
                        onClick={() => onAction(offer.id, { isApproved: true })}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onAction(offer.id, { isApproved: false, rejectionReason: 'Rejected by admin' })}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  {offer.isApproved && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => onAction(offer.id, { isFeatured: !offer.isFeatured })}
                    >
                      <Sparkles className="w-4 h-4 mr-1" />
                      {offer.isFeatured ? 'Unfeature' : 'Feature'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function ApplicationReviewDialog({ application, onClose, onAction }: any) {
  const [tier, setTier] = useState(application.interestedTier);

  return (
    <Dialog open={!!application} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{application.companyName}</DialogTitle>
          <DialogDescription>Review sponsor application</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Company Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600">Industry:</span>
                  <span className="ml-2 font-semibold">{application.industry}</span>
                </div>
                <div>
                  <span className="text-gray-600">Years in Business:</span>
                  <span className="ml-2 font-semibold">{application.yearsInBusiness || 'N/A'}</span>
                </div>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Description:</p>
                <p>{application.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span>{application.contactPerson}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{application.email}</span>
              </div>
              {application.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{application.phone}</span>
                </div>
              )}
              {application.website && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <a href={application.website} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">
                    {application.website}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tier Selection */}
          <div>
            <Label htmlFor="tier">Approve as Tier:</Label>
            <Select value={tier} onValueChange={setTier}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BRONZE">Bronze</SelectItem>
                <SelectItem value="SILVER">Silver</SelectItem>
                <SelectItem value="GOLD">Gold</SelectItem>
                <SelectItem value="PLATINUM">Platinum</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => onAction(application.id, 'REJECTED')}
              className="flex-1"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => onAction(application.id, 'APPROVED', tier)}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve as {tier}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function OfferReviewDialog({ offer, onClose, onAction }: any) {
  return (
    <Dialog open={!!offer} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{offer.title}</DialogTitle>
          <DialogDescription>{offer.sponsor?.companyName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="aspect-video w-full bg-gray-100 rounded-lg overflow-hidden">
            {offer.imageUrl ? (
              <img src={offer.imageUrl} alt={offer.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-16 h-16 text-gray-300" />
              </div>
            )}
          </div>

          <div>
            <h4 className="font-semibold mb-2">Description</h4>
            <p className="text-sm text-gray-600">{offer.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-600">Points Cost:</span>
              <p className="font-semibold">{offer.pointsCost}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Retail Value:</span>
              <p className="font-semibold">${offer.retailValue}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Category:</span>
              <p className="font-semibold">{offer.category}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Valid Until:</span>
              <p className="font-semibold">{format(new Date(offer.endDate), 'MMM dd, yyyy')}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            {!offer.isApproved && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => onAction(offer.id, { isApproved: false, rejectionReason: 'Rejected' })}
                  className="flex-1"
                >
                  Reject
                </Button>
                <Button
                  onClick={() => onAction(offer.id, { isApproved: true })}
                  className="flex-1 bg-green-600"
                >
                  Approve
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
