
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Trophy,
  Users,
  CheckCircle2,
  Clock,
  Gift,
  Award,
  TrendingUp,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  Crown,
  Loader2,
  DollarSign,
  Calendar,
  User,
  Mail,
  Target,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface BetaTester {
  id: string;
  userId: string;
  status: string;
  totalTasksCompleted: number;
  totalTasksRequired: number;
  rewardEligible: boolean;
  rewardClaimed: boolean;
  rewardClaimedAt: Date | null;
  startedAt: Date;
  completedAt: Date | null;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    subscriptionTier: string;
  };
  promoCode: {
    code: string;
    rewardAmount: number;
  };
}

interface ManageUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    subscriptionTier: string;
  };
  onSuccess: () => void;
}

function ManageUserDialog({ isOpen, onClose, user, onSuccess }: ManageUserDialogProps) {
  const [action, setAction] = useState<string>('');
  const [newTier, setNewTier] = useState<string>(user.subscriptionTier);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleManageUser = async () => {
    if (!action) {
      toast.error('Please select an action');
      return;
    }

    setIsProcessing(true);

    try {
      if (action === 'delete') {
        // Show delete confirmation
        setShowDeleteConfirm(true);
        setIsProcessing(false);
        return;
      }

      const response = await fetch('/api/admin/users/manage', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          action: action === 'update-tier' ? 'update-subscription' : action,
          subscriptionTier: action === 'update-tier' ? newTier : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user');
      }

      toast.success(data.message || 'User updated successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = async () => {
    setIsProcessing(true);

    try {
      const response = await fetch(`/api/admin/users/manage?userId=${user.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }

      toast.success(data.message || 'User deleted successfully');
      onSuccess();
      setShowDeleteConfirm(false);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen && !showDeleteConfirm} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage User Account</DialogTitle>
            <DialogDescription>
              {user.firstName} {user.lastName} ({user.email})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Select Action
              </label>
              <Select value={action} onValueChange={setAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an action..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="update-tier">Change Subscription Tier</SelectItem>
                  <SelectItem value="reset-trial">Reset Trial (7 days)</SelectItem>
                  <SelectItem value="delete">Delete Account</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {action === 'update-tier' && (
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  New Subscription Tier
                </label>
                <Select value={newTier} onValueChange={setNewTier}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FREE">FREE</SelectItem>
                    <SelectItem value="TRIAL">TRIAL</SelectItem>
                    <SelectItem value="PRO">PRO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {action === 'delete' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <p className="font-semibold mb-1">Warning: This action cannot be undone!</p>
                    <p>All user data, including videos, progress, and achievements will be permanently deleted.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              onClick={handleManageUser}
              disabled={!action || isProcessing}
              variant={action === 'delete' ? 'destructive' : 'default'}
            >
              {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {action === 'delete' ? 'Delete User' : 'Apply Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you absolutely sure you want to delete this account?
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
              <p className="font-semibold text-red-900 mb-2">
                You are about to delete:
              </p>
              <p className="text-sm text-red-800">
                <strong>{user.firstName} {user.lastName}</strong>
                <br />
                {user.email}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false);
                setIsProcessing(false);
              }}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={isProcessing}
            >
              {isProcessing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Yes, Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function BetaManagementSection() {
  const [betaTesters, setBetaTesters] = useState<BetaTester[]>([]);
  const [filteredTesters, setFilteredTesters] = useState<BetaTester[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rewardFilter, setRewardFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showManageDialog, setShowManageDialog] = useState(false);
  const [sortBy, setSortBy] = useState<'progress' | 'date'>('progress');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    rewardEligible: 0,
    rewardsClaimed: 0,
    avgCompletion: 0,
  });

  useEffect(() => {
    fetchBetaTesters();
  }, []);

  useEffect(() => {
    filterAndSortTesters();
  }, [betaTesters, searchTerm, statusFilter, rewardFilter, sortBy, sortOrder]);

  const fetchBetaTesters = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/beta-testers');
      if (!response.ok) throw new Error('Failed to fetch beta testers');
      
      const data = await response.json();
      setBetaTesters(data.betaTesters || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error('Error fetching beta testers:', error);
      toast.error('Failed to load beta testers');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortTesters = () => {
    let filtered = [...betaTesters];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (tester) =>
          tester.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `${tester.user.firstName} ${tester.user.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((tester) => tester.status === statusFilter);
    }

    // Reward filter
    if (rewardFilter === 'eligible') {
      filtered = filtered.filter((tester) => tester.rewardEligible && !tester.rewardClaimed);
    } else if (rewardFilter === 'claimed') {
      filtered = filtered.filter((tester) => tester.rewardClaimed);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'progress') {
        const aProgress = (a.totalTasksCompleted / a.totalTasksRequired) * 100;
        const bProgress = (b.totalTasksCompleted / b.totalTasksRequired) * 100;
        return sortOrder === 'desc' ? bProgress - aProgress : aProgress - bProgress;
      } else {
        const aDate = new Date(a.startedAt).getTime();
        const bDate = new Date(b.startedAt).getTime();
        return sortOrder === 'desc' ? bDate - aDate : aDate - bDate;
      }
    });

    setFilteredTesters(filtered);
  };

  const handleMarkRewardClaimed = async (betaTesterId: string) => {
    try {
      const giftCardCode = prompt('Enter the Amazon gift card code:');
      if (!giftCardCode) return;

      const notes = prompt('Add any notes (optional):') || '';

      const response = await fetch('/api/admin/beta-testers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          betaTesterId,
          giftCardCode,
          notes,
        }),
      });

      if (!response.ok) throw new Error('Failed to mark reward as claimed');

      toast.success('Reward marked as claimed!');
      fetchBetaTesters();
    } catch (error) {
      console.error('Error marking reward:', error);
      toast.error('Failed to mark reward as claimed');
    }
  };

  const toggleSort = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Testers', value: stats.total, icon: Users, color: 'from-blue-500 to-cyan-500' },
          { label: 'Active', value: stats.active, icon: Clock, color: 'from-green-500 to-emerald-500' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'from-teal-500 to-cyan-500' },
          { label: 'Reward Eligible', value: stats.rewardEligible, icon: Gift, color: 'from-amber-500 to-orange-500' },
          { label: 'Claimed Rewards', value: stats.rewardsClaimed, icon: Award, color: 'from-purple-500 to-pink-500' },
          { label: 'Avg Completion', value: `${Math.round(stats.avgCompletion)}%`, icon: TrendingUp, color: 'from-indigo-500 to-purple-500' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                      <p className="text-xs text-slate-600">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-teal-600" />
                Beta Testers Management
              </CardTitle>
              <CardDescription>
                Track progress, manage accounts, and distribute rewards
              </CardDescription>
            </div>
            <Button onClick={fetchBetaTesters} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={rewardFilter} onValueChange={setRewardFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Rewards" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rewards</SelectItem>
                <SelectItem value="eligible">Eligible</SelectItem>
                <SelectItem value="claimed">Claimed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="progress">Progress</SelectItem>
                <SelectItem value="date">Join Date</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={toggleSort}>
              {sortOrder === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </Button>
          </div>

          {/* Beta Testers List */}
          <div className="space-y-4">
            {filteredTesters.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No beta testers found matching your filters</p>
              </div>
            ) : (
              filteredTesters.map((tester) => {
                const progressPercent = Math.round((tester.totalTasksCompleted / tester.totalTasksRequired) * 100);
                return (
                  <motion.div
                    key={tester.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Card className="hover:shadow-lg transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                          {/* User Info */}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                                {tester.user.firstName[0]}{tester.user.lastName[0]}
                              </div>
                              <div>
                                <h4 className="font-semibold text-slate-900">
                                  {tester.user.firstName} {tester.user.lastName}
                                </h4>
                                <p className="text-sm text-slate-600">{tester.user.email}</p>
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant={tester.status === 'COMPLETED' ? 'default' : 'secondary'}>
                                {tester.status}
                              </Badge>
                              <Badge variant="outline">
                                <Crown className="w-3 h-3 mr-1" />
                                {tester.user.subscriptionTier}
                              </Badge>
                              {tester.rewardEligible && !tester.rewardClaimed && (
                                <Badge className="bg-amber-100 text-amber-700">
                                  <Gift className="w-3 h-3 mr-1" />
                                  Reward Eligible
                                </Badge>
                              )}
                              {tester.rewardClaimed && (
                                <Badge className="bg-green-100 text-green-700">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Reward Claimed
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Progress */}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">Task Progress</span>
                              <span className="font-semibold text-slate-900">
                                {tester.totalTasksCompleted}/{tester.totalTasksRequired} ({progressPercent}%)
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Started {format(new Date(tester.startedAt), 'MMM d, yyyy')}
                              </span>
                              {tester.completedAt && (
                                <span className="flex items-center gap-1 text-green-600">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Completed {format(new Date(tester.completedAt), 'MMM d, yyyy')}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                            {tester.rewardEligible && !tester.rewardClaimed && (
                              <Button
                                size="sm"
                                onClick={() => handleMarkRewardClaimed(tester.id)}
                                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                              >
                                <DollarSign className="w-4 h-4 mr-1" />
                                Mark Reward Claimed
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(tester.user);
                                setShowManageDialog(true);
                              }}
                            >
                              <User className="w-4 h-4 mr-1" />
                              Manage Account
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manage User Dialog */}
      {selectedUser && (
        <ManageUserDialog
          isOpen={showManageDialog}
          onClose={() => {
            setShowManageDialog(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onSuccess={fetchBetaTesters}
        />
      )}
    </div>
  );
}
