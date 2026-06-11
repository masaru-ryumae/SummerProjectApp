/**
 * Audit Log Component
 * Display immutable audit trail with filtering, search, and export
 */

import React, { useState } from 'react';

export const AuditLog = ({ organizationId = 'org_demo' }) => {
  const [filters, setFilters] = useState({
    action: '',
    severity: '',
    dateRange: '7days',
    searchText: '',
  });

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');

  // Sample audit log data
  const [auditLogs] = useState([
    {
      id: 'audit_001',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      userId: 'user_123',
      userEmail: 'john@example.com',
      action: 'LOGIN',
      severity: 'info',
      resourceType: 'user',
      resourceId: 'user_123',
      ipAddress: '192.168.1.100',
      status: 'success',
      description: 'User logged in successfully',
    },
    {
      id: 'audit_002',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      userId: 'user_456',
      userEmail: 'jane@example.com',
      action: 'ROLE_ASSIGN',
      severity: 'warning',
      resourceType: 'user',
      resourceId: 'user_789',
      ipAddress: '192.168.1.101',
      status: 'success',
      description: 'User role changed from Member to Manager',
    },
    {
      id: 'audit_003',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      userId: 'user_456',
      userEmail: 'jane@example.com',
      action: 'DELETE',
      severity: 'critical',
      resourceType: 'content',
      resourceId: 'content_456',
      ipAddress: '192.168.1.101',
      status: 'success',
      description: 'Content item permanently deleted',
    },
    {
      id: 'audit_004',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      userId: 'user_123',
      userEmail: 'john@example.com',
      action: 'LOGIN_FAILED',
      severity: 'warning',
      resourceType: 'user',
      resourceId: 'user_123',
      ipAddress: '203.0.113.45',
      status: 'failure',
      description: 'Failed login attempt with invalid credentials',
    },
    {
      id: 'audit_005',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      userId: 'admin_001',
      userEmail: 'admin@example.com',
      action: 'SSO_CONFIG',
      severity: 'critical',
      resourceType: 'organization',
      resourceId: organizationId,
      ipAddress: '192.168.1.50',
      status: 'success',
      description: 'SAML 2.0 SSO configuration updated',
    },
    {
      id: 'audit_006',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      userId: 'user_123',
      userEmail: 'john@example.com',
      action: 'API_KEY_CREATE',
      severity: 'warning',
      resourceType: 'api_key',
      resourceId: 'api_key_xyz',
      ipAddress: '192.168.1.100',
      status: 'success',
      description: 'New API key created',
    },
    {
      id: 'audit_007',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      userId: 'admin_001',
      userEmail: 'admin@example.com',
      action: 'CREATE',
      severity: 'info',
      resourceType: 'user',
      resourceId: 'user_999',
      ipAddress: '192.168.1.50',
      status: 'success',
      description: 'New user created: newuser@example.com',
    },
    {
      id: 'audit_008',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      userId: 'admin_001',
      userEmail: 'admin@example.com',
      action: 'IP_WHITELIST_CHANGE',
      severity: 'critical',
      resourceType: 'organization',
      resourceId: organizationId,
      ipAddress: '192.168.1.50',
      status: 'success',
      description: 'IP whitelist updated: added 203.0.113.0/24',
    },
  ]);

  const getSeverityColor = (severity) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800',
      warning: 'bg-yellow-100 text-yellow-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[severity] || colors.info;
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      info: 'ℹ',
      warning: '⚠',
      critical: '🔴',
    };
    return icons[severity] || '•';
  };

  const getStatusColor = (status) => {
    return status === 'success' ? 'text-green-600' : 'text-red-600';
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleExport = () => {
    const content = exportFormat === 'csv'
      ? generateCSV()
      : JSON.stringify(filteredLogs, null, 2);

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(content)}`);
    element.setAttribute('download', `audit-log.${exportFormat}`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    setShowExportModal(false);
  };

  const generateCSV = () => {
    const headers = ['ID', 'Timestamp', 'User', 'Email', 'Action', 'Resource', 'Status', 'IP Address'];
    const rows = filteredLogs.map(log => [
      log.id,
      log.timestamp.toISOString(),
      log.userId,
      log.userEmail,
      log.action,
      `${log.resourceType}/${log.resourceId}`,
      log.status,
      log.ipAddress,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return csv;
  };

  const filteredLogs = auditLogs.filter(log => {
    if (filters.action && log.action !== filters.action) return false;
    if (filters.severity && log.severity !== filters.severity) return false;
    if (filters.searchText) {
      const search = filters.searchText.toLowerCase();
      return (
        log.userEmail.toLowerCase().includes(search) ||
        log.description.toLowerCase().includes(search) ||
        log.ipAddress.includes(search)
      );
    }
    return true;
  });

  // Statistics
  const stats = {
    totalEvents: auditLogs.length,
    criticalEvents: auditLogs.filter(l => l.severity === 'critical').length,
    failedLogins: auditLogs.filter(l => l.action === 'LOGIN_FAILED').length,
    lastEvent: auditLogs[0]?.timestamp,
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b">
        <h2 className="text-2xl font-bold text-gray-900">Audit Log</h2>
        <p className="text-sm text-gray-600 mt-1">Immutable audit trail of all organization activities</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b bg-gray-50">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
          <p className="text-xs text-gray-600 mt-1">Total Events</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600">{stats.criticalEvents}</p>
          <p className="text-xs text-gray-600 mt-1">Critical Events</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats.failedLogins}</p>
          <p className="text-xs text-gray-600 mt-1">Failed Logins</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-900">
            {stats.lastEvent ? formatTime(stats.lastEvent) : 'N/A'}
          </p>
          <p className="text-xs text-gray-600 mt-1">Last Event</p>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 border-b bg-gray-50">
        <div className="grid grid-cols-4 gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by email, IP, or description..."
            value={filters.searchText}
            onChange={e => setFilters({ ...filters, searchText: e.target.value })}
            className="col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />

          {/* Action Filter */}
          <select
            value={filters.action}
            onChange={e => setFilters({ ...filters, action: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All Actions</option>
            <option value="LOGIN">Login</option>
            <option value="LOGIN_FAILED">Login Failed</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="ROLE_ASSIGN">Role Assign</option>
            <option value="SSO_CONFIG">SSO Config</option>
            <option value="API_KEY_CREATE">API Key Create</option>
            <option value="IP_WHITELIST_CHANGE">IP Whitelist Change</option>
          </select>

          {/* Severity Filter */}
          <select
            value={filters.severity}
            onChange={e => setFilters({ ...filters, severity: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {/* Export Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setShowExportModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium"
          >
            Export Logs
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Timestamp</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">User</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Action</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Resource</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">IP Address</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">Severity</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredLogs.map(log => (
              <tr key={log.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="text-gray-900 font-medium">{log.timestamp.toLocaleTimeString()}</div>
                  <div className="text-xs text-gray-600">{formatTime(log.timestamp)}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-900 font-medium">{log.userId}</div>
                  <div className="text-xs text-gray-600">{log.userEmail}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-gray-900">{log.action}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-gray-900">{log.resourceType}</div>
                  <div className="text-xs text-gray-600">{log.resourceId}</div>
                </td>
                <td className="px-6 py-4">
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                    {log.ipAddress}
                  </code>
                </td>
                <td className="px-6 py-4">
                  <span className={getStatusColor(log.status)}>
                    {log.status === 'success' ? '✓' : '✕'} {log.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-full font-medium text-xs ${getSeverityColor(log.severity)}`}>
                    {getSeverityIcon(log.severity)} {log.severity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredLogs.length === 0 && (
        <div className="px-6 py-12 text-center">
          <p className="text-gray-600">No audit logs found matching your filters.</p>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">Export Audit Logs</h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Export Format</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      value="csv"
                      checked={exportFormat === 'csv'}
                      onChange={e => setExportFormat(e.target.value)}
                    />
                    <span className="text-sm text-gray-700">CSV (spreadsheet compatible)</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      value="json"
                      checked={exportFormat === 'json'}
                      onChange={e => setExportFormat(e.target.value)}
                    />
                    <span className="text-sm text-gray-700">JSON (full details)</span>
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <span className="font-medium">Records:</span> {filteredLogs.length} events
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t flex gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
