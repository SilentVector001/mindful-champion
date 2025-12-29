'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, User, Calendar, CheckCircle2, XCircle, Clock, AlertCircle, Eye, EyeOff, RefreshCw, Copy, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface EmailDetailModalProps {
  emailId: string;
  isOpen: boolean;
  onClose: () => void;
  onResend?: (emailId: string) => void;
}

interface EmailDetails {
  id: string;
  recipientEmail: string;
  recipientName: string | null;
  subject: string;
  htmlContent: string;
  textContent: string | null;
  status: string;
  type: string;
  sentAt: string | null;
  deliveredAt: string | null;
  openedAt: string | null;
  failedAt: string | null;
  error: string | null;
  metadata: any;
  resendEmailId: string | null;
  retryCount: number;
  lastRetryAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  sponsorApplication: {
    id: string;
    companyName: string;
    status: string;
  } | null;
}

export default function EmailDetailModal({ emailId, isOpen, onClose, onResend }: EmailDetailModalProps) {
  const [email, setEmail] = useState<EmailDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHtmlPreview, setShowHtmlPreview] = useState(true);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (isOpen && emailId) {
      fetchEmailDetails();
    }
  }, [isOpen, emailId]);

  const fetchEmailDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/email-notifications/${emailId}`);
      if (response.ok) {
        const data = await response.json();
        setEmail(data.email);
      } else {
        toast.error('Failed to load email details');
      }
    } catch (error) {
      toast.error('Error loading email details');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      const response = await fetch('/api/admin/email-notifications/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailNotificationId: email.id }),
      });

      if (response.ok) {
        toast.success('Email resent successfully!');
        fetchEmailDetails(); // Refresh details
        if (onResend) onResend(email.id);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to resend email');
      }
    } catch (error) {
      toast.error('Error resending email');
    } finally {
      setResending(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT':
      case 'DELIVERED':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'FAILED':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'PENDING':
      case 'SENDING':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT':
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING':
      case 'SENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Email Details</h2>
                    <p className="text-teal-100 text-sm">View complete email information and content</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="h-10 w-10 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                </div>
              ) : !email ? (
                <div className="flex items-center justify-center py-12 text-gray-500">
                  <AlertCircle className="w-6 h-6 mr-2" />
                  Email not found
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div className={`flex items-center justify-between p-4 rounded-xl border-2 ${getStatusColor(email.status)}`}>
                    <div className="flex items-center gap-3">
                      {getStatusIcon(email.status)}
                      <div>
                        <p className="font-bold text-lg">Status: {email.status}</p>
                        {email.sentAt && (
                          <p className="text-sm opacity-80">
                            Sent {format(new Date(email.sentAt), 'MMM dd, yyyy HH:mm:ss')}
                          </p>
                        )}
                        {!email.sentAt && email.status === 'FAILED' && email.failedAt && (
                          <p className="text-sm opacity-80">
                            Failed {format(new Date(email.failedAt), 'MMM dd, yyyy HH:mm:ss')}
                          </p>
                        )}
                      </div>
                    </div>
                    {email.status === 'FAILED' && (
                      <button
                        onClick={handleResend}
                        disabled={resending}
                        className="px-4 py-2 bg-white rounded-lg font-semibold text-red-800 hover:bg-red-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
                        {resending ? 'Resending...' : 'Resend Email'}
                      </button>
                    )}
                  </div>

                  {/* Error Display */}
                  {email.error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-bold text-red-900 mb-2">Error Message</h4>
                          <p className="text-red-800 text-sm font-mono bg-red-100 p-3 rounded-lg whitespace-pre-wrap break-all">
                            {email.error}
                          </p>
                          {email.retryCount > 0 && (
                            <p className="text-red-700 text-sm mt-2">
                              Retry attempts: {email.retryCount}
                              {email.lastRetryAt && ` (Last: ${format(new Date(email.lastRetryAt), 'MMM dd HH:mm')})`}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Email Metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Recipient Info */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-5 h-5 text-teal-600" />
                        <h4 className="font-bold text-gray-900">Recipient</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-semibold text-gray-900">{email.recipientName || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-gray-600">Email:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-gray-900 text-xs">{email.recipientEmail}</span>
                            <button
                              onClick={() => copyToClipboard(email.recipientEmail, 'Email')}
                              className="text-teal-600 hover:text-teal-700"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        {email.user && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">User ID:</span>
                            <span className="font-mono text-xs text-gray-700">{email.user.id}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Email Info */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className="w-5 h-5 text-teal-600" />
                        <h4 className="font-bold text-gray-900">Email Info</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className="font-semibold text-gray-900">{email.type}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Created:</span>
                          <span className="text-gray-900">{format(new Date(email.createdAt), 'MMM dd HH:mm')}</span>
                        </div>
                        {email.resendEmailId && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Resend ID:</span>
                            <span className="font-mono text-xs text-gray-700">{email.resendEmailId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 border border-teal-200">
                    <h4 className="font-bold text-gray-900 mb-2">Subject</h4>
                    <p className="text-gray-800 text-lg">{email.subject}</p>
                  </div>

                  {/* Content Preview Toggle */}
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900 text-lg">Email Content</h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowHtmlPreview(!showHtmlPreview)}
                        className="px-4 py-2 rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-semibold"
                      >
                        {showHtmlPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showHtmlPreview ? 'Show Raw HTML' : 'Show Preview'}
                      </button>
                    </div>
                  </div>

                  {/* HTML Content */}
                  {showHtmlPreview ? (
                    <div className="bg-white rounded-xl border-2 border-gray-300 overflow-hidden">
                      <div className="bg-gray-100 px-4 py-2 border-b border-gray-300 flex items-center gap-2">
                        <ExternalLink className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-semibold text-gray-700">HTML Preview (Safe Rendering)</span>
                      </div>
                      <div className="p-4">
                        <iframe
                          srcDoc={email.htmlContent}
                          className="w-full border-0 rounded-lg bg-white"
                          style={{ minHeight: '400px', maxHeight: '600px' }}
                          sandbox="allow-same-origin"
                          title="Email Preview"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                      <pre className="text-green-400 text-xs font-mono whitespace-pre-wrap break-all">
                        {email.htmlContent}
                      </pre>
                    </div>
                  )}

                  {/* Metadata */}
                  {email.metadata && Object.keys(email.metadata).length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <h4 className="font-bold text-gray-900 mb-3">Additional Metadata</h4>
                      <pre className="text-xs font-mono text-gray-700 bg-gray-100 p-3 rounded-lg overflow-x-auto">
                        {JSON.stringify(email.metadata, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Sponsor Application Link */}
                  {email.sponsorApplication && (
                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                      <h4 className="font-bold text-purple-900 mb-2">Related Sponsor Application</h4>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-800 font-semibold">{email.sponsorApplication.companyName}</p>
                          <p className="text-purple-700 text-sm">Status: {email.sponsorApplication.status}</p>
                        </div>
                        <button
                          onClick={() => window.open(`/admin/sponsors/${email.sponsorApplication?.id}`, '_blank')}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Application
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-lg border-2 border-gray-300 hover:bg-gray-100 transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
