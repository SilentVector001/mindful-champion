'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Package,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Box,
  User,
  Calendar,
  DollarSign,
  Award,
  Loader2,
  Eye,
  X,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

interface Redemption {
  id: string;
  userId: string;
  productId: string;
  pointsSpent: number;
  status: string;
  shippingAddress: any;
  trackingNumber: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  product: {
    id: string;
    name: string;
    retailValue: number;
  };
}

export default function RedemptionsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRedemption, setSelectedRedemption] = useState<Redemption | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Update form state
  const [updateForm, setUpdateForm] = useState({
    status: '',
    trackingNumber: '',
    cancellationReason: '',
  });

  useEffect(() => {
    fetchRedemptions();
  }, []);

  const fetchRedemptions = async () => {
    try {
      const response = await fetch('/api/sponsors/redemptions');
      if (response.ok) {
        const data = await response.json();
        setRedemptions(data.redemptions || []);
      } else {
        toast.error('Failed to load redemptions');
      }
    } catch (error) {
      console.error('Error fetching redemptions:', error);
      toast.error('Failed to load redemptions');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (redemption: Redemption) => {
    setSelectedRedemption(redemption);
    setUpdateForm({
      status: redemption.status,
      trackingNumber: redemption.trackingNumber || '',
      cancellationReason: redemption.cancellationReason || '',
    });
    setShowDetailsModal(true);
  };

  const handleUpdateRedemption = async () => {
    if (!selectedRedemption) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/sponsors/redemptions/${selectedRedemption.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateForm),
      });

      if (response.ok) {
        toast.success('Redemption updated successfully');
        fetchRedemptions();
        setShowDetailsModal(false);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update redemption');
      }
    } catch (error) {
      toast.error('Failed to update redemption');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4" />;
      case 'SHIPPED':
        return <Truck className="w-4 h-4" />;
      case 'DELIVERED':
        return <Box className="w-4 h-4" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredRedemptions = redemptions.filter((redemption) => {
    const matchesSearch =
      redemption.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      redemption.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      redemption.product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || redemption.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: redemptions.length,
    pending: redemptions.filter((r) => r.status === 'PENDING').length,
    shipped: redemptions.filter((r) => r.status === 'SHIPPED').length,
    delivered: redemptions.filter((r) => r.status === 'DELIVERED').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
            Redemptions Management
          </h1>
          <p className="text-gray-600 mt-1">Track and manage product redemptions</p>
        </div>
        <Button
          onClick={fetchRedemptions}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Shipped</p>
                <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
              </div>
              <Truck className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
              </div>
              <Box className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by user name, email, or product..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Redemptions Table */}
      {filteredRedemptions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No redemptions found</h3>
            <p className="text-gray-500">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Product redemptions will appear here'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Points
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRedemptions.map((redemption) => (
                    <motion.tr
                      key={redemption.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {redemption.user.name || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">{redemption.user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{redemption.product.name}</p>
                        <p className="text-sm text-gray-500">
                          Value: ${redemption.product.retailValue}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4 text-teal-600" />
                          <span className="font-semibold">{redemption.pointsSpent}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          className={`flex items-center gap-1 w-fit ${getStatusColor(
                            redemption.status
                          )}`}
                        >
                          {getStatusIcon(redemption.status)}
                          {redemption.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {format(new Date(redemption.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(redemption)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Manage
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedRedemption && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Redemption Details</h2>
                    <p className="text-teal-100 text-sm">
                      Manage redemption status and shipping
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="h-10 w-10 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* User & Product Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Customer
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-semibold">{selectedRedemption.user.name || 'N/A'}</p>
                      <p className="text-sm text-gray-600">{selectedRedemption.user.email}</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Product
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-semibold">{selectedRedemption.product.name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-600">
                          <Award className="w-3 h-3 inline mr-1" />
                          {selectedRedemption.pointsSpent} points
                        </span>
                        <span className="text-sm font-semibold">
                          ${selectedRedemption.product.retailValue}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Shipping Address */}
                {selectedRedemption.shippingAddress && (
                  <Card className="bg-gray-50">
                    <CardHeader>
                      <CardTitle className="text-sm">Shipping Address</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(selectedRedemption.shippingAddress, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {/* Update Form */}
                <Card className="border-2 border-teal-200">
                  <CardHeader>
                    <CardTitle>Update Redemption</CardTitle>
                    <CardDescription>Change status, add tracking, or cancel</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="status">Status *</Label>
                      <Select
                        value={updateForm.status}
                        onValueChange={(value) =>
                          setUpdateForm({ ...updateForm, status: value })
                        }
                      >
                        <SelectTrigger id="status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">Pending</SelectItem>
                          <SelectItem value="APPROVED">Approved</SelectItem>
                          <SelectItem value="SHIPPED">Shipped</SelectItem>
                          <SelectItem value="DELIVERED">Delivered</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {(updateForm.status === 'SHIPPED' || updateForm.status === 'DELIVERED') && (
                      <div>
                        <Label htmlFor="trackingNumber">Tracking Number</Label>
                        <Input
                          id="trackingNumber"
                          placeholder="Enter tracking number"
                          value={updateForm.trackingNumber}
                          onChange={(e) =>
                            setUpdateForm({ ...updateForm, trackingNumber: e.target.value })
                          }
                        />
                      </div>
                    )}

                    {updateForm.status === 'CANCELLED' && (
                      <div>
                        <Label htmlFor="cancellationReason">Cancellation Reason *</Label>
                        <Textarea
                          id="cancellationReason"
                          placeholder="Explain why this redemption is being cancelled"
                          value={updateForm.cancellationReason}
                          onChange={(e) =>
                            setUpdateForm({ ...updateForm, cancellationReason: e.target.value })
                          }
                          rows={3}
                        />
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleUpdateRedemption}
                        disabled={updating}
                        className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600"
                      >
                        {updating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Update Redemption
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => setShowDetailsModal(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Created:</span>
                        <span className="font-semibold">
                          {format(new Date(selectedRedemption.createdAt), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                      {selectedRedemption.shippedAt && (
                        <div className="flex items-center gap-3 text-sm">
                          <Truck className="w-4 h-4 text-purple-600" />
                          <span className="text-gray-600">Shipped:</span>
                          <span className="font-semibold">
                            {format(new Date(selectedRedemption.shippedAt), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                      )}
                      {selectedRedemption.deliveredAt && (
                        <div className="flex items-center gap-3 text-sm">
                          <Box className="w-4 h-4 text-green-600" />
                          <span className="text-gray-600">Delivered:</span>
                          <span className="font-semibold">
                            {format(new Date(selectedRedemption.deliveredAt), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                      )}
                      {selectedRedemption.cancelledAt && (
                        <div className="flex items-center gap-3 text-sm">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="text-gray-600">Cancelled:</span>
                          <span className="font-semibold">
                            {format(new Date(selectedRedemption.cancelledAt), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
