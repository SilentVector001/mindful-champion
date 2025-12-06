'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Mail,
  Send,
  RotateCcw,
  History,
  TestTube,
  FileText,
  Search,
  Filter,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Eye,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminEmailManagement() {
  const [activeTab, setActiveTab] = useState('send');
  const [loading, setLoading] = useState(false);
  
  // Send Email Form State
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: '',
    body: '',
    template: 'custom',
    isHtml: true,
  });
  
  // Email History State
  const [emailHistory, setEmailHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    recipient: '',
    dateFrom: '',
    dateTo: '',
  });
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    failed: 0,
    pending: 0,
  });

  // Templates
  const emailTemplates = {
    custom: {
      name: 'Custom Email',
      subject: '',
      body: '',
    },
    sponsorConfirmation: {
      name: 'Sponsor Confirmation',
      subject: '🎉 Sponsor Application Received - Mindful Champion',
      body: `<h2>Thank you for your interest in sponsoring Mindful Champion!</h2>
<p>We've received your application and our team is reviewing it.</p>
<p>You'll hear back from us within 24-48 hours.</p>
<p>Best regards,<br>The Mindful Champion Team</p>`,
    },
    sponsorApproval: {
      name: 'Sponsor Approval',
      subject: '✅ Sponsor Application Approved - Mindful Champion',
      body: `<h2>Congratulations! Your sponsor application has been approved.</h2>
<p>Welcome to the Mindful Champion sponsor program!</p>
<p>You can now access your sponsor portal and start creating offers.</p>
<p>Best regards,<br>The Mindful Champion Team</p>`,
    },
    adminNotification: {
      name: 'Admin Notification',
      subject: '🔔 Admin Notification - Mindful Champion',
      body: `<h2>Admin Notification</h2>
<p>This is an administrative notification.</p>
<p>Best regards,<br>The Mindful Champion Team</p>`,
    },
  };

  // Load Email History
  useEffect(() => {
    if (activeTab === 'history') {
      loadEmailHistory();
    }
  }, [activeTab, filters]);

  const loadEmailHistory = async () => {
    setHistoryLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.recipient) params.append('recipient', filters.recipient);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      
      const response = await fetch(`/api/admin/emails/history?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setEmailHistory(data.emails);
        setStats(data.stats);
      } else {
        toast.error(data.error || 'Failed to load email history');
      }
    } catch (error) {
      toast.error('Failed to load email history');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Send Email
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/admin/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailForm),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Email sent successfully!');
        setEmailForm({ to: '', subject: '', body: '', template: 'custom', isHtml: true });
      } else {
        toast.error(data.error || 'Failed to send email');
      }
    } catch (error) {
      toast.error('Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  // Resend Email
  const handleResendEmail = async (emailLogId: string) => {
    try {
      const response = await fetch('/api/admin/emails/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailLogId }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Email resent successfully!');
        loadEmailHistory();
      } else {
        toast.error(data.error || 'Failed to resend email');
      }
    } catch (error) {
      toast.error('Failed to resend email');
    }
  };

  // Send Test Email
  const handleSendTestEmail = async () => {
    const testEmail = prompt('Enter email address for test:');
    if (!testEmail) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/admin/emails/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testEmail }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(`Test email sent to ${testEmail}!`);
      } else {
        toast.error(data.error || 'Failed to send test email');
      }
    } catch (error) {
      toast.error('Failed to send test email');
    } finally {
      setLoading(false);
    }
  };

  // Apply Template
  const applyTemplate = (templateKey: string) => {
    const template = emailTemplates[templateKey as keyof typeof emailTemplates];
    setEmailForm({
      ...emailForm,
      template: templateKey,
      subject: template.subject,
      body: template.body,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-600 to-cyan-600 flex items-center justify-center shadow-lg">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Email Management</h1>
              <p className="text-gray-600">Send, manage, and track all system emails</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Emails</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Mail className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sent</p>
                  <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="send" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Send Email
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Test
            </TabsTrigger>
          </TabsList>

          {/* Send Email Tab */}
          <TabsContent value="send">
            <Card>
              <CardHeader>
                <CardTitle>Send Custom Email</CardTitle>
                <CardDescription>
                  Send a custom email to any user or email address
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendEmail} className="space-y-4">
                  <div>
                    <Label htmlFor="to">To (Email Address)</Label>
                    <Input
                      id="to"
                      type="email"
                      placeholder="recipient@example.com"
                      value={emailForm.to}
                      onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Email subject"
                      value={emailForm.subject}
                      onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="body">Body</Label>
                    <Textarea
                      id="body"
                      placeholder="Email body (HTML supported)"
                      value={emailForm.body}
                      onChange={(e) => setEmailForm({ ...emailForm, body: e.target.value })}
                      rows={10}
                      required
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-teal-600 to-cyan-600"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Email
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(emailTemplates).map(([key, template]) => (
                <Card key={key} className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => {
                    applyTemplate(key);
                    setActiveTab('send');
                  }}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.subject}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button size="sm" variant="outline">
                      <Eye className="mr-2 h-4 w-4" />
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Email History</CardTitle>
                <CardDescription>View and manage sent emails</CardDescription>
                
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <Input
                    placeholder="Filter by recipient..."
                    value={filters.recipient}
                    onChange={(e) => setFilters({ ...filters, recipient: e.target.value })}
                  />
                  <Select
                    value={filters.type}
                    onValueChange={(value) => setFilters({ ...filters, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Types</SelectItem>
                      <SelectItem value="ADMIN_CUSTOM">Custom</SelectItem>
                      <SelectItem value="ADMIN_TEST">Test</SelectItem>
                      <SelectItem value="SPONSOR_APPLICATION">Sponsor Application</SelectItem>
                      <SelectItem value="SPONSOR_APPROVAL">Sponsor Approval</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="date"
                    placeholder="From date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  />
                  <Input
                    type="date"
                    placeholder="To date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : emailHistory.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    No emails found
                  </div>
                ) : (
                  <div className="space-y-2">
                    {emailHistory.map((email) => (
                      <motion.div
                        key={email.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={email.status === 'SENT' ? 'default' : 'destructive'}>
                              {email.status}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {format(new Date(email.sentAt), 'MMM dd, yyyy HH:mm')}
                            </span>
                          </div>
                          <p className="font-medium text-gray-900">{email.subject}</p>
                          <p className="text-sm text-gray-600">To: {email.recipientEmail}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResendEmail(email.id)}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Test Tab */}
          <TabsContent value="test">
            <Card>
              <CardHeader>
                <CardTitle>Test Email System</CardTitle>
                <CardDescription>
                  Send a test email to verify the email system is working
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      This will send a formatted test email to verify that:
                    </p>
                    <ul className="list-disc list-inside text-sm text-blue-800 mt-2 space-y-1">
                      <li>Email delivery is working</li>
                      <li>HTML formatting is correct</li>
                      <li>Resend integration is active</li>
                      <li>Admin panel is connected</li>
                    </ul>
                  </div>
                  
                  <Button
                    onClick={handleSendTestEmail}
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Test...
                      </>
                    ) : (
                      <>
                        <TestTube className="mr-2 h-4 w-4" />
                        Send Test Email
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
