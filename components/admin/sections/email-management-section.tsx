'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Mail,
  Search,
  Filter,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  MousePointer,
  Send,
  Loader2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface EmailNotification {
  id: string;
  userId: string;
  type: string;
  recipientEmail: string;
  recipientName: string | null;
  subject: string;
  htmlContent: string;
  textContent: string | null;
  status: string;
  sentAt: Date | null;
  deliveredAt: Date | null;
  openedAt: Date | null;
  clickedAt: Date | null;
  failedAt: Date | null;
  error: string | null;
  metadata: any;
  resendEmailId: string | null;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
  contentPreview: string | null;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    name: string | null;
  };
}

interface Statistics {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
}

interface TypeDistribution {
  type: string;
  count: number;
}

export default function EmailManagementSection() {
  const [emails, setEmails] = useState<EmailNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<Statistics>({
    total: 0,
    sent: 0,
    failed: 0,
    pending: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
  });
  const [typeDistribution, setTypeDistribution] = useState<TypeDistribution[]>(
    []
  );

  // Filters
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Email detail dialog
  const [selectedEmail, setSelectedEmail] = useState<EmailNotification | null>(
    null
  );
  const [emailDetailOpen, setEmailDetailOpen] = useState(false);
  const [emailDetailLoading, setEmailDetailLoading] = useState(false);

  // Fetch emails
  const fetchEmails = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
      });

      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/admin/emails/history?${params}`);
      if (!response.ok) throw new Error('Failed to fetch emails');

      const data = await response.json();
      setEmails(data.emails);
      setStatistics(data.statistics);
      setTypeDistribution(data.typeDistribution);
      setTotalPages(data.pagination.totalPages);
    } catch (error: any) {
      console.error('Error fetching emails:', error);
      toast.error('Failed to fetch emails');
    } finally {
      setLoading(false);
    }
  };

  // Fetch email details
  const fetchEmailDetails = async (emailId: string) => {
    setEmailDetailLoading(true);
    try {
      const response = await fetch('/api/admin/emails/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailId }),
      });

      if (!response.ok) throw new Error('Failed to fetch email details');

      const data = await response.json();
      setSelectedEmail(data.email);
      setEmailDetailOpen(true);
    } catch (error: any) {
      console.error('Error fetching email details:', error);
      toast.error('Failed to fetch email details');
    } finally {
      setEmailDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [currentPage, typeFilter, statusFilter]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        fetchEmails();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { color: string; icon: any; label: string }
    > = {
      SENT: {
        color: 'bg-green-500/10 text-green-600 border-green-500/20',
        icon: CheckCircle2,
        label: 'Sent',
      },
      DELIVERED: {
        color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        icon: CheckCircle2,
        label: 'Delivered',
      },
      OPENED: {
        color: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
        icon: Eye,
        label: 'Opened',
      },
      CLICKED: {
        color: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
        icon: MousePointer,
        label: 'Clicked',
      },
      FAILED: {
        color: 'bg-red-500/10 text-red-600 border-red-500/20',
        icon: XCircle,
        label: 'Failed',
      },
      PENDING: {
        color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
        icon: Clock,
        label: 'Pending',
      },
      BOUNCED: {
        color: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
        icon: AlertCircle,
        label: 'Bounced',
      },
      SENDING: {
        color: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
        icon: Send,
        label: 'Sending',
      },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border flex items-center gap-1.5`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // Format email type for display
  const formatEmailType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-teal-500/20 bg-gradient-to-br from-teal-500/5 to-cyan-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Emails
                </p>
                <p className="text-3xl font-black text-teal-600">
                  {statistics.total.toLocaleString()}
                </p>
              </div>
              <Mail className="h-10 w-10 text-teal-600/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Successfully Sent
                </p>
                <p className="text-3xl font-black text-green-600">
                  {statistics.sent.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>
                    {statistics.total > 0
                      ? ((statistics.sent / statistics.total) * 100).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
              </div>
              <CheckCircle2 className="h-10 w-10 text-green-600/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-500/20 bg-gradient-to-br from-red-500/5 to-rose-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Failed
                </p>
                <p className="text-3xl font-black text-red-600">
                  {statistics.failed.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                  <TrendingDown className="h-3 w-3" />
                  <span>
                    {statistics.total > 0
                      ? ((statistics.failed / statistics.total) * 100).toFixed(
                          1
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>
              <XCircle className="h-10 w-10 text-red-600/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Opened
                </p>
                <p className="text-3xl font-black text-purple-600">
                  {statistics.opened.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 text-xs text-purple-600 mt-1">
                  <Eye className="h-3 w-3" />
                  <span>
                    {statistics.sent > 0
                      ? ((statistics.opened / statistics.sent) * 100).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
              </div>
              <Eye className="h-10 w-10 text-purple-600/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-teal-600" />
                Email History
              </CardTitle>
              <CardDescription>
                View and manage all sent email notifications
              </CardDescription>
            </div>
            <Button
              onClick={fetchEmails}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email, name, or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="SENT">Sent</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="OPENED">Opened</SelectItem>
                <SelectItem value="CLICKED">Clicked</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="BOUNCED">Bounced</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {typeDistribution.map((td) => (
                  <SelectItem key={td.type} value={td.type}>
                    {formatEmailType(td.type)} ({td.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Email List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
          ) : emails.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                No emails found
              </p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {emails.map((email) => (
                <motion.div
                  key={email.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => fetchEmailDetails(email.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(email.status)}
                        <Badge variant="outline" className="text-xs">
                          {formatEmailType(email.type)}
                        </Badge>
                      </div>
                      <h4 className="font-semibold text-sm mb-1 truncate">
                        {email.subject}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {email.recipientEmail}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(email.createdAt), 'MMM d, yyyy HH:mm')}
                        </span>
                      </div>
                      {email.contentPreview && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {email.contentPreview}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Detail Dialog */}
      <Dialog open={emailDetailOpen} onOpenChange={setEmailDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-teal-600" />
              Email Details
            </DialogTitle>
            <DialogDescription>
              View complete email information and content
            </DialogDescription>
          </DialogHeader>

          {emailDetailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
          ) : selectedEmail ? (
            <div className="space-y-6">
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedEmail.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <div className="mt-1">
                    <Badge variant="outline">
                      {formatEmailType(selectedEmail.type)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Recipient</label>
                  <p className="text-sm mt-1">{selectedEmail.recipientEmail}</p>
                  {selectedEmail.recipientName && (
                    <p className="text-xs text-muted-foreground">
                      {selectedEmail.recipientName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Sent At</label>
                  <p className="text-sm mt-1">
                    {selectedEmail.sentAt
                      ? format(new Date(selectedEmail.sentAt), 'PPpp')
                      : 'Not sent'}
                  </p>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="text-sm font-medium">Subject</label>
                <p className="text-sm mt-1 p-3 bg-accent rounded-lg">
                  {selectedEmail.subject}
                </p>
              </div>

              {/* Error (if any) */}
              {selectedEmail.error && (
                <div>
                  <label className="text-sm font-medium text-red-600">
                    Error Message
                  </label>
                  <p className="text-sm mt-1 p-3 bg-red-500/10 text-red-600 rounded-lg border border-red-500/20">
                    {selectedEmail.error}
                  </p>
                </div>
              )}

              {/* Email Content Preview */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Email Content (HTML)
                </label>
                <div className="border rounded-lg p-4 bg-white dark:bg-slate-900 max-h-[400px] overflow-y-auto">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: selectedEmail.htmlContent,
                    }}
                  />
                </div>
              </div>

              {/* Text Content (if available) */}
              {selectedEmail.textContent && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Plain Text Version
                  </label>
                  <pre className="text-sm p-3 bg-accent rounded-lg whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                    {selectedEmail.textContent}
                  </pre>
                </div>
              )}

              {/* Additional Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedEmail.deliveredAt && (
                  <div>
                    <label className="font-medium">Delivered At</label>
                    <p className="text-muted-foreground">
                      {format(new Date(selectedEmail.deliveredAt), 'PPpp')}
                    </p>
                  </div>
                )}
                {selectedEmail.openedAt && (
                  <div>
                    <label className="font-medium">Opened At</label>
                    <p className="text-muted-foreground">
                      {format(new Date(selectedEmail.openedAt), 'PPpp')}
                    </p>
                  </div>
                )}
                {selectedEmail.clickedAt && (
                  <div>
                    <label className="font-medium">Clicked At</label>
                    <p className="text-muted-foreground">
                      {format(new Date(selectedEmail.clickedAt), 'PPpp')}
                    </p>
                  </div>
                )}
                <div>
                  <label className="font-medium">Retry Count</label>
                  <p className="text-muted-foreground">
                    {selectedEmail.retryCount}
                  </p>
                </div>
                {selectedEmail.resendEmailId && (
                  <div>
                    <label className="font-medium">Resend Email ID</label>
                    <p className="text-muted-foreground text-xs break-all">
                      {selectedEmail.resendEmailId}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
