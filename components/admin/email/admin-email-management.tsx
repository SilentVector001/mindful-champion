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
  Settings,
  Globe,
  Shield,
} from 'lucide-react';
import { format } from 'date-fns';
import { EMAIL_CONFIG } from '@/lib/email/config';

export default function AdminEmailManagement() {
  const [activeTab, setActiveTab] = useState('domain');
  const [loading, setLoading] = useState(false);
  
  // Send Email Form State
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: '',
    body: '',
    template: 'custom',
    isHtml: true,
    fromAccount: 'ADMIN',
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
        setEmailForm({ to: '', subject: '', body: '', template: 'custom', isHtml: true, fromAccount: 'ADMIN' });
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

  // Test email form state
  const [testEmailForm, setTestEmailForm] = useState({
    to: '',
    fromAccount: 'NOREPLY',
  });

  // Send Test Email
  const handleSendTestEmail = async () => {
    if (!testEmailForm.to) {
      toast.error('Please enter a recipient email address');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch('/api/admin/emails/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testEmailForm),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(`Test email sent to ${testEmailForm.to}!`);
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
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="domain" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Domain
            </TabsTrigger>
            <TabsTrigger value="send" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Send
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

          {/* Domain Configuration Tab */}
          <TabsContent value="domain">
            <div className="space-y-6">
              {/* Domain Status Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Domain Configuration
                      </CardTitle>
                      <CardDescription>
                        Email domain: {EMAIL_CONFIG.DOMAIN}
                      </CardDescription>
                    </div>
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Domain Setup Status
                      </h4>
                      <div className="space-y-2 text-sm text-blue-800">
                        <div className="flex items-center justify-between">
                          <span>Domain:</span>
                          <Badge variant="outline" className="text-blue-900 border-blue-300">
                            {EMAIL_CONFIG.DOMAIN}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Provider:</span>
                          <Badge variant="outline" className="text-blue-900 border-blue-300">
                            Resend
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Status:</span>
                          <Badge className="bg-green-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-900 mb-2">
                        ⚠️ Important: Domain Verification Required
                      </h4>
                      <p className="text-sm text-yellow-800 mb-3">
                        To send emails from @mindfulchampion.com addresses, you must first add and verify the domain in your Resend account.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-yellow-900 border-yellow-300 hover:bg-yellow-100"
                        onClick={() => window.open('https://resend.com/domains', '_blank')}
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Open Resend Domains
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Email Accounts Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Email Accounts</CardTitle>
                  <CardDescription>
                    Configured email addresses for different purposes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(EMAIL_CONFIG.ACCOUNTS).map(([key, account]) => (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Mail className="h-4 w-4 text-teal-600" />
                              <h4 className="font-semibold text-gray-900">{account.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {key}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded">
                                {account.email}
                              </p>
                              <p className="text-xs text-gray-600">
                                {account.purpose}
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-green-600">Active</Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Setup Instructions Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Setup Instructions</CardTitle>
                  <CardDescription>
                    How to add mindfulchampion.com to Resend
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Step-by-Step Guide
                      </h4>
                      <ol className="space-y-3 text-sm text-gray-700">
                        <li className="flex items-start gap-3">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex-shrink-0">
                            1
                          </span>
                          <div>
                            <strong>Go to Resend Domains:</strong>
                            <a 
                              href="https://resend.com/domains" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-teal-600 hover:underline ml-1"
                            >
                              https://resend.com/domains
                            </a>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex-shrink-0">
                            2
                          </span>
                          <div>
                            <strong>Click "Add Domain"</strong> and enter: <code className="bg-gray-200 px-2 py-0.5 rounded text-xs">mindfulchampion.com</code>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex-shrink-0">
                            3
                          </span>
                          <div>
                            <strong>Add DNS Records:</strong> Resend will provide SPF, DKIM, and DMARC records. Add these to your domain's DNS settings.
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex-shrink-0">
                            4
                          </span>
                          <div>
                            <strong>Verify Domain:</strong> Click "Verify" in Resend after adding DNS records. This can take up to 48 hours.
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex-shrink-0">
                            5
                          </span>
                          <div>
                            <strong>Test Emails:</strong> Once verified, use the "Test" tab to send test emails from each account.
                          </div>
                        </li>
                      </ol>
                    </div>
                    
                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                      <h4 className="font-semibold text-teal-900 mb-2">
                        📝 Need Help?
                      </h4>
                      <p className="text-sm text-teal-800 mb-2">
                        Resend Documentation: <a href="https://resend.com/docs/dashboard/domains/introduction" target="_blank" rel="noopener noreferrer" className="underline">Domain Setup Guide</a>
                      </p>
                      <p className="text-sm text-teal-800">
                        DNS propagation can take 24-48 hours. Check status at <a href="https://dnschecker.org" target="_blank" rel="noopener noreferrer" className="underline">dnschecker.org</a>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Label htmlFor="fromAccount">Send From</Label>
                      <Select
                        value={emailForm.fromAccount}
                        onValueChange={(value) => setEmailForm({ ...emailForm, fromAccount: value })}
                      >
                        <SelectTrigger id="fromAccount">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(EMAIL_CONFIG.ACCOUNTS).map(([key, account]) => (
                            <SelectItem key={key} value={key}>
                              {account.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-600 mt-1">
                        {EMAIL_CONFIG.ACCOUNTS[emailForm.fromAccount as keyof typeof EMAIL_CONFIG.ACCOUNTS]?.purpose}
                      </p>
                    </div>
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
                          Send Email from {EMAIL_CONFIG.ACCOUNTS[emailForm.fromAccount as keyof typeof EMAIL_CONFIG.ACCOUNTS]?.email}
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
                  Send test emails from different accounts to verify the email system
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
                      <li>Domain is properly configured</li>
                      <li>Each email account (noreply@, partners@, dean@) can send emails</li>
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="test-to">Recipient Email</Label>
                      <Input
                        id="test-to"
                        type="email"
                        placeholder="your@email.com"
                        value={testEmailForm.to}
                        onChange={(e) => setTestEmailForm({ ...testEmailForm, to: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="test-from">Send From</Label>
                      <Select
                        value={testEmailForm.fromAccount}
                        onValueChange={(value) => setTestEmailForm({ ...testEmailForm, fromAccount: value })}
                      >
                        <SelectTrigger id="test-from">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(EMAIL_CONFIG.ACCOUNTS).map(([key, account]) => (
                            <SelectItem key={key} value={key}>
                              {account.email} - {account.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-600 mt-1">
                        {EMAIL_CONFIG.ACCOUNTS[testEmailForm.fromAccount as keyof typeof EMAIL_CONFIG.ACCOUNTS]?.purpose}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleSendTestEmail}
                    disabled={loading || !testEmailForm.to}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Test...
                      </>
                    ) : (
                      <>
                        <TestTube className="mr-2 h-4 w-4" />
                        Send Test Email from {EMAIL_CONFIG.ACCOUNTS[testEmailForm.fromAccount as keyof typeof EMAIL_CONFIG.ACCOUNTS]?.email}
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
