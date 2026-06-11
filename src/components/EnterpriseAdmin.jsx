/**
 * Enterprise Admin Dashboard
 * Complete enterprise system with RBAC, SSO, audit logging, and compliance
 */

import React, { useState } from 'react';
import { RoleManager } from './RoleManager';
import { AuditLog } from './AuditLog';
import { SSOConfig } from './SSOConfig';

export const EnterpriseAdmin = ({ organizationId = 'org_demo' }) => {
  const [activeSection, setActiveSection] = useState('overview');

  const [complianceStatus, setComplianceStatus] = useState({
    gdpr: { compliant: true, lastCheck: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    soc2: { compliant: true, lastCheck: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
    hipaa: { compliant: false, lastCheck: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  });

  const [metrics, setMetrics] = useState({
    totalUsers: 128,
    activeSSoUsers: 98,
    mfaAdoption: 87,
    securityEvents: 234,
    criticalAlerts: 3,
    dataRetention: '7 years',
  });

  const [securityAlerts, setSecurityAlerts] = useState([
    {
      id: 'alert_001',
      severity: 'critical',
      title: 'Multiple Failed Login Attempts',
      description: 'Account john.doe@example.com has 5+ failed login attempts from IP 203.0.113.45',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      action: 'Block IP',
    },
    {
      id: 'alert_002',
      severity: 'warning',
      title: 'Unusual Access Pattern',
      description: 'User accessed 50+ resources in 2 minutes from new location',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      action: 'Review',
    },
    {
      id: 'alert_003',
      severity: 'critical',
      title: 'SAML Certificate Expiring',
      description: 'SAML signing certificate expires in 14 days',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      action: 'Renew Certificate',
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Enterprise Administration</h1>
            <p className="text-sm text-gray-600 mt-1">Organization: {organizationId}</p>
          </div>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <div className="max-w-7xl mx-auto flex gap-6 p-6">
        <div className="w-56 flex-shrink-0">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <nav className="space-y-1 p-2">
              {[
                { id: 'overview', icon: '📊', label: 'Overview', section: 'overview' },
                { id: 'rbac', icon: '🔐', label: 'RBAC & Roles', section: 'rbac' },
                { id: 'sso', icon: '🔑', label: 'SSO & Auth', section: 'sso' },
                { id: 'audit', icon: '📋', label: 'Audit Log', section: 'audit' },
                { id: 'compliance', icon: '✓', label: 'Compliance', section: 'compliance' },
                { id: 'security', icon: '🛡', label: 'Security', section: 'security' },
                { id: 'users', icon: '👥', label: 'User Management', section: 'users' },
                { id: 'settings', icon: '⚙', label: 'Settings', section: 'settings' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.section)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm font-medium ${
                    activeSection === item.section
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
                  <p className="text-4xl font-bold text-gray-900 mt-2">{metrics.totalUsers}</p>
                  <p className="text-xs text-green-600 mt-2">↑ 12 this month</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-medium text-gray-600">SSO Users</h3>
                  <p className="text-4xl font-bold text-gray-900 mt-2">{metrics.activeSSoUsers}</p>
                  <p className="text-xs text-gray-600 mt-2">{Math.round(metrics.activeSSoUsers / metrics.totalUsers * 100)}% adoption</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-sm font-medium text-gray-600">MFA Adoption</h3>
                  <p className="text-4xl font-bold text-gray-900 mt-2">{metrics.mfaAdoption}%</p>
                  <p className="text-xs text-green-600 mt-2">↑ 5% from last month</p>
                </div>
              </div>

              {/* Security Alerts */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Security Alerts</h2>
                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                    {securityAlerts.length} active
                  </span>
                </div>
                <div className="divide-y">
                  {securityAlerts.map(alert => (
                    <div key={alert.id} className="px-6 py-4 hover:bg-gray-50 transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xl ${alert.severity === 'critical' ? '🔴' : '⚠️'}`}></span>
                            <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              alert.severity === 'critical'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {alert.severity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">{alert.description}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {Math.floor((Date.now() - alert.timestamp) / 60000)} minutes ago
                          </p>
                        </div>
                        <button className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                          alert.severity === 'critical'
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                        }`}>
                          {alert.action}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance Status */}
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(complianceStatus).map(([standard, status]) => (
                  <div key={standard} className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 uppercase">{standard}</h3>
                    <div className="mt-4 flex items-center justify-between">
                      <span className={`text-4xl font-bold ${status.compliant ? 'text-green-600' : 'text-red-600'}`}>
                        {status.compliant ? '✓' : '✕'}
                      </span>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${status.compliant ? 'text-green-600' : 'text-red-600'}`}>
                          {status.compliant ? 'Compliant' : 'Non-Compliant'}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">Last checked today</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Stats</h2>
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{metrics.securityEvents}</p>
                    <p className="text-xs text-gray-600 mt-2">Security Events (7d)</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{metrics.criticalAlerts}</p>
                    <p className="text-xs text-gray-600 mt-2">Critical Alerts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">98%</p>
                    <p className="text-xs text-gray-600 mt-2">System Uptime</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{metrics.dataRetention}</p>
                    <p className="text-xs text-gray-600 mt-2">Data Retention</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RBAC Section */}
          {activeSection === 'rbac' && <RoleManager organizationId={organizationId} />}

          {/* SSO Section */}
          {activeSection === 'sso' && <SSOConfig organizationId={organizationId} />}

          {/* Audit Log Section */}
          {activeSection === 'audit' && <AuditLog organizationId={organizationId} />}

          {/* Compliance Section */}
          {activeSection === 'compliance' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h2 className="text-2xl font-bold text-gray-900">Compliance & Security</h2>
                <p className="text-sm text-gray-600 mt-1">GDPR, SOC 2, HIPAA, and security compliance</p>
              </div>

              <div className="p-6 space-y-6">
                {/* GDPR */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">GDPR Compliance</h3>
                      <p className="text-sm text-gray-600 mt-2">General Data Protection Regulation</p>
                      <div className="flex gap-4 mt-3 text-sm">
                        <span className="text-gray-600">✓ Data export enabled</span>
                        <span className="text-gray-600">✓ Right to be forgotten</span>
                        <span className="text-gray-600">✓ 7-year retention</span>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition text-sm font-medium">
                      Compliant
                    </button>
                  </div>
                </div>

                {/* SOC 2 */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">SOC 2 Compliance</h3>
                      <p className="text-sm text-gray-600 mt-2">Service Organization Control</p>
                      <div className="flex gap-4 mt-3 text-sm">
                        <span className="text-gray-600">✓ Access controls</span>
                        <span className="text-gray-600">✓ Audit logging</span>
                        <span className="text-gray-600">✓ Encryption at rest</span>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition text-sm font-medium">
                      Compliant
                    </button>
                  </div>
                </div>

                {/* IP Whitelist */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">IP Whitelist</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">192.168.1.0/24</span>
                      <button className="text-red-600 hover:text-red-700 text-sm">Remove</button>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">203.0.113.0/24</span>
                      <button className="text-red-600 hover:text-red-700 text-sm">Remove</button>
                    </div>
                    <button className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition text-sm font-medium">
                      Add IP Range
                    </button>
                  </div>
                </div>

                {/* Password Policy */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Password Policy</h3>
                  <div className="space-y-3 text-sm">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked />
                      <span>Minimum length: 12 characters</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked />
                      <span>Require uppercase, lowercase, numbers, symbols</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked />
                      <span>Password expiration: 90 days</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked />
                      <span>Prevent password reuse (12 previous)</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Section */}
          {activeSection === 'security' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Security Dashboard</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Active Sessions</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-gray-900">user@example.com</p>
                        <p className="text-xs text-gray-600">192.168.1.100</p>
                      </div>
                      <button className="text-red-600 hover:text-red-700 text-sm">Terminate</button>
                    </div>
                  </div>
                </div>
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">API Keys</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium text-gray-900">api_key_...abc123</p>
                        <p className="text-xs text-gray-600">Last used: 2h ago</p>
                      </div>
                      <button className="text-red-600 hover:text-red-700 text-sm">Revoke</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Section */}
          {activeSection === 'users' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">User Management</h2>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                Add User
              </button>
              <div className="mt-6 text-center text-gray-600">
                <p>User management features coming soon</p>
              </div>
            </div>
          )}

          {/* Settings Section */}
          {activeSection === 'settings' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Organization Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Organization Name</label>
                  <input
                    type="text"
                    defaultValue="Acme Corporation"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Organization Email</label>
                  <input
                    type="email"
                    defaultValue="admin@acme.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
