'use client'

import { useState, useEffect } from 'react'
import { 
  Mail, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw, 
  Settings, 
  TrendingUp,
  Eye,
  Search,
  Filter,
  Download,
  AlertCircle
} from 'lucide-react'
import EmailDetailModal from '@/components/admin/email-detail-modal'

interface EmailNotification {
  id: string
  recipientEmail: string
  recipientName: string | null
  subject: string
  htmlContent: string
  status: string
  type: string
  sentAt: string | null
  createdAt: string
  error: string | null
  retryCount: number
  user: {
    id: string
    name: string | null
    email: string
  }
  videoAnalysis: {
    id: string
    title: string
    overallScore: number | null
  } | null
}

interface Stats {
  total: number
  sent: number
  failed: number
  pending: number
  opened: number
  successRate: number
}

interface EmailSettings {
  id: string
  emailNotificationsEnabled: boolean
  videoAnalysisEmailsEnabled: boolean
  welcomeEmailsEnabled: boolean
  marketingEmailsEnabled: boolean
  maxRetryAttempts: number
  retryDelayMinutes: number
  fromEmail: string
  fromName: string
  replyToEmail: string | null
}

export default function EmailNotificationsPage() {
  const [notifications, setNotifications] = useState<EmailNotification[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [settings, setSettings] = useState<EmailSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedNotification, setSelectedNotification] = useState<EmailNotification | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null)
  const [showEmailModal, setShowEmailModal] = useState(false)
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchData()
  }, [currentPage, statusFilter, typeFilter, searchQuery])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch notifications
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(searchQuery && { search: searchQuery }),
      })

      const [notificationsRes, statsRes, settingsRes] = await Promise.all([
        fetch(`/api/admin/email-notifications?${params}`),
        fetch('/api/admin/email-notifications/stats'),
        fetch('/api/admin/email-notifications/settings'),
      ])

      const notificationsData = await notificationsRes.json()
      const statsData = await statsRes.json()
      const settingsData = await settingsRes.json()

      setNotifications(notificationsData.notifications || [])
      setTotalPages(notificationsData.pagination?.totalPages || 1)
      setStats(statsData)
      setSettings(settingsData.settings)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async (notificationId: string) => {
    if (!confirm('Are you sure you want to resend this email?')) return

    try {
      const res = await fetch('/api/admin/email-notifications/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailNotificationId: notificationId }),
      })

      if (res.ok) {
        alert('Email resent successfully!')
        fetchData()
      } else {
        const error = await res.json()
        alert(`Failed to resend email: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to resend email:', error)
      alert('Failed to resend email')
    }
  }

  const handleSettingsUpdate = async (updatedSettings: Partial<EmailSettings>) => {
    try {
      const res = await fetch('/api/admin/email-notifications/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
      })

      if (res.ok) {
        alert('Settings updated successfully!')
        fetchData()
        setShowSettings(false)
      } else {
        const error = await res.json()
        alert(`Failed to update settings: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to update settings:', error)
      alert('Failed to update settings')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      SENT: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      FAILED: { color: 'bg-red-100 text-red-800', icon: XCircle },
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      SENDING: { color: 'bg-blue-100 text-blue-800', icon: RefreshCw },
      DELIVERED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      OPENED: { color: 'bg-purple-100 text-purple-800', icon: Eye },
    }

    const badge = badges[status as keyof typeof badges] || badges.PENDING
    const Icon = badge.icon

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Mail className="w-8 h-8 text-emerald-600" />
              Email Notifications
            </h1>
            <p className="text-gray-600 mt-1">Manage and monitor email delivery</p>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Emails</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Mail className="w-8 h-8 text-gray-400" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sent</p>
                  <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Opened</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.opened}</p>
                </div>
                <Eye className="w-8 h-8 text-purple-400" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.successRate}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-400" />
              </div>
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && settings && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Email Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.emailNotificationsEnabled}
                  onChange={(e) =>
                    handleSettingsUpdate({ emailNotificationsEnabled: e.target.checked })
                  }
                  className="rounded text-emerald-600"
                />
                <span className="text-sm text-gray-700">Enable Email Notifications</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.videoAnalysisEmailsEnabled}
                  onChange={(e) =>
                    handleSettingsUpdate({ videoAnalysisEmailsEnabled: e.target.checked })
                  }
                  className="rounded text-emerald-600"
                />
                <span className="text-sm text-gray-700">Video Analysis Emails</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.welcomeEmailsEnabled}
                  onChange={(e) =>
                    handleSettingsUpdate({ welcomeEmailsEnabled: e.target.checked })
                  }
                  className="rounded text-emerald-600"
                />
                <span className="text-sm text-gray-700">Welcome Emails</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.marketingEmailsEnabled}
                  onChange={(e) =>
                    handleSettingsUpdate({ marketingEmailsEnabled: e.target.checked })
                  }
                  className="rounded text-emerald-600"
                />
                <span className="text-sm text-gray-700">Marketing Emails</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Email
                </label>
                <input
                  type="email"
                  value={settings.fromEmail}
                  onChange={(e) =>
                    setSettings({ ...settings, fromEmail: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Name
                </label>
                <input
                  type="text"
                  value={settings.fromName}
                  onChange={(e) =>
                    setSettings({ ...settings, fromName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reply To Email
                </label>
                <input
                  type="email"
                  value={settings.replyToEmail || ''}
                  onChange={(e) =>
                    setSettings({ ...settings, replyToEmail: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <button
              onClick={() => handleSettingsUpdate(settings)}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              Save Settings
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by email, name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="SENT">Sent</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
              <option value="DELIVERED">Delivered</option>
              <option value="OPENED">Opened</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Types</option>
              <option value="VIDEO_ANALYSIS_COMPLETE">Video Analysis</option>
              <option value="WELCOME">Welcome</option>
              <option value="SYSTEM_UPDATE">System Update</option>
            </select>
          </div>
        </div>

        {/* Notifications Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No email notifications found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sent At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <tr key={notification.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {notification.recipientName || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">{notification.recipientEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{notification.subject}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs text-gray-600">{notification.type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(notification.status)}
                        {notification.error && (
                          <div className="text-xs text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {notification.error.substring(0, 50)}...
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {notification.sentAt
                          ? new Date(notification.sentAt).toLocaleString()
                          : 'Not sent'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          {notification.status === 'FAILED' && (
                            <button
                              onClick={() => handleResend(notification.id)}
                              className="text-emerald-600 hover:text-emerald-900 flex items-center gap-1"
                              title="Resend email"
                            >
                              <RefreshCw className="w-4 h-4" />
                              Resend
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedEmailId(notification.id);
                              setShowEmailModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Enhanced Email Detail Modal */}
        {selectedEmailId && (
          <EmailDetailModal
            emailId={selectedEmailId}
            isOpen={showEmailModal}
            onClose={() => {
              setShowEmailModal(false);
              setSelectedEmailId(null);
            }}
            onResend={() => {
              fetchData(); // Refresh the list after resending
            }}
          />
        )}
      </div>
    </div>
  )
}
