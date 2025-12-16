'use client';

import { useState, useEffect } from 'react';

interface BlockedIP {
  id: string;
  ipAddress: string;
  reason: string;
  blockedAt: string;
  expiresAt: string | null;
  failedAttempts: number;
  metadata?: any;
}

interface SecurityStats {
  totalBlockedIPs: number;
  activeBlockedIPs: number;
  totalSecurityEvents: number;
  recentFailedLogins: number;
  lockedAccounts: number;
  recentPasswordResets: number;
}

interface SecurityLog {
  id: string;
  eventType: string;
  severity: string;
  description: string;
  ipAddress?: string;
  timestamp: string;
  user?: {
    email: string;
    name: string;
  };
}

export default function SecuritySection() {
  const [activeTab, setActiveTab] = useState<'overview' | 'blocked-ips' | 'logs'>('overview');
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [unblocking, setUnblocking] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await fetch('/api/admin/security?type=stats');
        const data = await res.json();
        setStats(data.stats);
      } else if (activeTab === 'blocked-ips') {
        const res = await fetch('/api/admin/security?type=blocked-ips');
        const data = await res.json();
        setBlockedIPs(data.blockedIPs);
      } else if (activeTab === 'logs') {
        const res = await fetch('/api/admin/security?type=security-logs&limit=50');
        const data = await res.json();
        setSecurityLogs(data.logs);
      }
    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockIP = async (ipAddress: string) => {
    if (!confirm(`Are you sure you want to unblock IP: ${ipAddress}?`)) return;

    setUnblocking(ipAddress);
    try {
      const res = await fetch('/api/admin/security/unblock-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ipAddress })
      });

      if (res.ok) {
        alert('IP unblocked successfully');
        loadData();
      } else {
        alert('Failed to unblock IP');
      }
    } catch (error) {
      alert('Error unblocking IP');
    } finally {
      setUnblocking(null);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Security Dashboard</h2>
          <p className="text-gray-600">Monitor and manage security events</p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'blocked-ips', label: 'Blocked IPs', icon: '🚫' },
            { id: 'logs', label: 'Security Logs', icon: '📝' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading security data...</p>
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Blocked IPs</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.activeBlockedIPs}</p>
                    <p className="text-xs text-gray-500 mt-1">Total: {stats.totalBlockedIPs}</p>
                  </div>
                  <div className="text-4xl">🚫</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Failed Logins (24h)</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.recentFailedLogins}</p>
                  </div>
                  <div className="text-4xl">⚠️</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Locked Accounts</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.lockedAccounts}</p>
                  </div>
                  <div className="text-4xl">🔒</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Password Resets (7d)</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.recentPasswordResets}</p>
                  </div>
                  <div className="text-4xl">🔑</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Security Events</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalSecurityEvents}</p>
                  </div>
                  <div className="text-4xl">📊</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg shadow-md p-6 text-white">
                <div>
                  <p className="text-sm opacity-90">Security Status</p>
                  <p className="text-2xl font-bold mt-1">
                    {stats.recentFailedLogins > 20 ? 'High Activity' : stats.recentFailedLogins > 10 ? 'Normal' : 'Low Activity'}
                  </p>
                  <p className="text-xs opacity-80 mt-2">
                    {stats.recentFailedLogins > 20
                      ? 'Elevated failed login attempts detected'
                      : 'System security is nominal'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Blocked IPs Tab */}
          {activeTab === 'blocked-ips' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {blockedIPs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">✅</div>
                  <p className="text-gray-600">No blocked IPs currently</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          IP Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reason
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Failed Attempts
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Blocked At
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expires At
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {blockedIPs.map(ip => (
                        <tr key={ip.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                              {ip.ipAddress}
                            </code>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {ip.reason}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              {ip.failedAttempts}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(ip.blockedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {ip.expiresAt ? formatDate(ip.expiresAt) : 'Never'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => handleUnblockIP(ip.ipAddress)}
                              disabled={unblocking === ip.ipAddress}
                              className="text-purple-600 hover:text-purple-900 font-medium disabled:opacity-50"
                            >
                              {unblocking === ip.ipAddress ? 'Unblocking...' : 'Unblock'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {blockedIPs.length > 0 && (
                <div className="bg-blue-50 border-t border-blue-200 px-6 py-4">
                  <p className="text-sm text-blue-800">
                    <strong>📧 Contact Info:</strong> Users with blocked IPs must contact security@mindfulchampion.com or info@mindfulchampion.com to request unblocking.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Security Logs Tab */}
          {activeTab === 'logs' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {securityLogs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-gray-600">No security logs yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Event
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Severity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          IP Address
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {securityLogs.map(log => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(log.timestamp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.eventType.replace(/_/g, ' ')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getSeverityColor(log.severity)}`}>
                              {log.severity}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.user ? log.user.email : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                            {log.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {log.ipAddress && (
                              <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                                {log.ipAddress}
                              </code>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
