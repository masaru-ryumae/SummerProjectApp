/**
 * SSO Configuration Component
 * Configure SAML 2.0, OAuth2, LDAP, MFA, and JIT provisioning
 */

import React, { useState } from 'react';

export const SSOConfig = ({ organizationId = 'org_demo' }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const [ssoConfigs, setSSOConfigs] = useState([
    {
      id: 'saml_001',
      provider: 'saml',
      name: 'Okta SAML',
      enabled: true,
      status: 'active',
      users: 45,
      lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: 'oauth_001',
      provider: 'oauth2_google',
      name: 'Google OAuth',
      enabled: true,
      status: 'active',
      users: 28,
      lastSync: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
  ]);

  const [mfaConfig, setMFAConfig] = useState({
    enabled: true,
    providers: ['totp', 'email'],
    requireForSSO: true,
    gracePeriod: 7,
  });

  const [jitConfig, setJITConfig] = useState({
    enabled: true,
    defaultRole: 'member',
    autoActivate: true,
  });

  const [ldapSync, setLDAPSync] = useState({
    status: 'idle',
    lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000),
    created: 5,
    updated: 2,
    failed: 0,
  });

  const [formData, setFormData] = useState({
    provider: 'saml',
    name: '',
    idpEntityId: '',
    idpUrl: '',
    certificate: '',
    autoSync: false,
    syncInterval: 60,
  });

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);

    if (hours > 0) return `${hours}h ${minutes}m ago`;
    return `${minutes}m ago`;
  };

  const handleAddProvider = () => {
    const newConfig = {
      id: `${formData.provider}_${Date.now()}`,
      provider: formData.provider,
      name: formData.name,
      enabled: false,
      status: 'pending',
      users: 0,
      lastSync: new Date(),
    };

    setSSOConfigs([...ssoConfigs, newConfig]);
    setFormData({
      provider: 'saml',
      name: '',
      idpEntityId: '',
      idpUrl: '',
      certificate: '',
      autoSync: false,
      syncInterval: 60,
    });
    setShowConfigModal(false);
  };

  const toggleProvider = (configId) => {
    setSSOConfigs(ssoConfigs.map(config =>
      config.id === configId
        ? { ...config, enabled: !config.enabled, status: !config.enabled ? 'active' : 'inactive' }
        : config
    ));
  };

  const handleLDAPSync = () => {
    setLDAPSync({ ...ldapSync, status: 'syncing' });
    setTimeout(() => {
      setLDAPSync({
        status: 'idle',
        lastSync: new Date(),
        created: 3,
        updated: 1,
        failed: 0,
      });
    }, 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b">
        <h2 className="text-2xl font-bold text-gray-900">SSO & Authentication</h2>
        <p className="text-sm text-gray-600 mt-1">Configure SAML, OAuth2, LDAP, MFA and user provisioning</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 text-sm font-medium ${
            activeTab === 'overview'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          SSO Providers
        </button>
        <button
          onClick={() => setActiveTab('mfa')}
          className={`px-6 py-3 text-sm font-medium ${
            activeTab === 'mfa'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          MFA & Security
        </button>
        <button
          onClick={() => setActiveTab('ldap')}
          className={`px-6 py-3 text-sm font-medium ${
            activeTab === 'ldap'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          LDAP Sync
        </button>
        <button
          onClick={() => setActiveTab('jit')}
          className={`px-6 py-3 text-sm font-medium ${
            activeTab === 'jit'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          JIT Provisioning
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Add Provider Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowConfigModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                Add SSO Provider
              </button>
            </div>

            {/* SSO Providers List */}
            <div className="grid gap-4">
              {ssoConfigs.map(config => (
                <div key={config.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">{config.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          config.enabled
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {config.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Provider: <span className="font-medium capitalize">{config.provider}</span>
                      </p>
                      <div className="flex gap-6 mt-3 text-sm">
                        <span className="text-gray-600">
                          <span className="font-medium text-gray-900">{config.users}</span> active users
                        </span>
                        <span className="text-gray-600">
                          Last sync: <span className="font-medium">{formatTime(config.lastSync)}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleProvider(config.id)}
                        className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                          config.enabled
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {config.enabled ? 'Disable' : 'Enable'}
                      </button>
                      <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium">
                        Configure
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Provider Information */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="border rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer transition">
                <div className="text-2xl mb-2">🔐</div>
                <h4 className="font-semibold text-gray-900">SAML 2.0</h4>
                <p className="text-xs text-gray-600 mt-2">Enterprise SSO with Okta, Azure AD</p>
              </div>
              <div className="border rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer transition">
                <div className="text-2xl mb-2">🔗</div>
                <h4 className="font-semibold text-gray-900">OAuth2</h4>
                <p className="text-xs text-gray-600 mt-2">Google, GitHub, Microsoft integration</p>
              </div>
              <div className="border rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer transition">
                <div className="text-2xl mb-2">🌐</div>
                <h4 className="font-semibold text-gray-900">LDAP</h4>
                <p className="text-xs text-gray-600 mt-2">Active Directory & LDAP sync</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mfa' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-1">Multi-Factor Authentication</h3>
              <p className="text-sm text-blue-800">Enhance security with additional authentication factors</p>
            </div>

            {/* MFA Status */}
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">MFA Status</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mfaConfig.enabled}
                    onChange={e => setMFAConfig({ ...mfaConfig, enabled: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700">
                    {mfaConfig.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>

              {mfaConfig.enabled && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Available Methods</h4>
                    <div className="space-y-2">
                      {[
                        { id: 'totp', label: 'Time-based OTP (Authenticator Apps)' },
                        { id: 'email', label: 'Email Verification' },
                        { id: 'sms', label: 'SMS (requires SMS service)' },
                        { id: 'fido2', label: 'FIDO2 / WebAuthn' },
                      ].map(method => (
                        <label key={method.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={mfaConfig.providers.includes(method.id)}
                            onChange={e => {
                              setMFAConfig({
                                ...mfaConfig,
                                providers: e.target.checked
                                  ? [...mfaConfig.providers, method.id]
                                  : mfaConfig.providers.filter(p => p !== method.id),
                              });
                            }}
                          />
                          <span className="text-sm text-gray-700">{method.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={mfaConfig.requireForSSO}
                        onChange={e => setMFAConfig({ ...mfaConfig, requireForSSO: e.target.checked })}
                      />
                      <span className="text-sm text-gray-700">Require MFA for SSO users</span>
                    </label>
                  </div>

                  <div className="pt-4 border-t">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Grace Period (days)
                    </label>
                    <input
                      type="number"
                      value={mfaConfig.gracePeriod}
                      onChange={e => setMFAConfig({ ...mfaConfig, gracePeriod: parseInt(e.target.value) })}
                      min="0"
                      max="30"
                      className="px-4 py-2 border border-gray-300 rounded-lg w-24"
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      Users have {mfaConfig.gracePeriod} days to set up MFA
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Security Settings */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm text-gray-700">Enforce session timeout (30 minutes)</span>
                </label>
                <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm text-gray-700">Restrict concurrent sessions (1 per user)</span>
                </label>
                <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm text-gray-700">Enable password expiration (90 days)</span>
                </label>
                <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm text-gray-700">Block IP-based access outside whitelist</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ldap' && (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-purple-900 mb-1">LDAP/Active Directory Sync</h3>
              <p className="text-sm text-purple-800">Automatically synchronize users from your directory service</p>
            </div>

            {/* LDAP Sync Status */}
            <div className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Directory Sync Status</h3>
                  <p className="text-sm text-gray-600 mt-1">Active Directory Sync (contoso.local)</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  ldapSync.status === 'syncing'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {ldapSync.status === 'syncing' ? 'Syncing...' : 'Connected'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="text-2xl font-bold text-gray-900">{ldapSync.created}</p>
                  <p className="text-xs text-gray-600 mt-1">Users Created</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="text-2xl font-bold text-gray-900">{ldapSync.updated}</p>
                  <p className="text-xs text-gray-600 mt-1">Users Updated</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <p className="text-2xl font-bold text-red-600">{ldapSync.failed}</p>
                  <p className="text-xs text-gray-600 mt-1">Sync Errors</p>
                </div>
              </div>

              <p className="text-sm text-gray-600">
                Last sync: {formatTime(ldapSync.lastSync)}
              </p>

              <button
                onClick={handleLDAPSync}
                disabled={ldapSync.status === 'syncing'}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition text-sm font-medium"
              >
                {ldapSync.status === 'syncing' ? 'Syncing...' : 'Sync Now'}
              </button>
            </div>

            {/* Sync Configuration */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sync Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Sync Interval</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option>Every 15 minutes</option>
                    <option>Every 30 minutes</option>
                    <option>Every hour</option>
                    <option>Every 6 hours</option>
                    <option>Daily</option>
                  </select>
                </div>

                <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm text-gray-700">Auto-create users during sync</span>
                </label>

                <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm text-gray-700">Auto-deactivate users removed from directory</span>
                </label>

                <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer">
                  <input type="checkbox" />
                  <span className="text-sm text-gray-700">Sync group memberships as roles</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'jit' && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-900 mb-1">Just-In-Time (JIT) Provisioning</h3>
              <p className="text-sm text-green-800">Automatically create and activate users on first SSO login</p>
            </div>

            {/* JIT Status */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">JIT Provisioning</h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={jitConfig.enabled}
                    onChange={e => setJITConfig({ ...jitConfig, enabled: e.target.checked })}
                  />
                  <span className="text-sm text-gray-700">
                    {jitConfig.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>

              {jitConfig.enabled && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Default Role for New Users
                    </label>
                    <select
                      value={jitConfig.defaultRole}
                      onChange={e => setJITConfig({ ...jitConfig, defaultRole: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="viewer">Viewer (read-only)</option>
                      <option value="member">Member</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t">
                    <label className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={jitConfig.autoActivate}
                        onChange={e => setJITConfig({ ...jitConfig, autoActivate: e.target.checked })}
                      />
                      <span className="text-sm text-gray-700">Automatically activate new users</span>
                    </label>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <span className="font-medium">When enabled:</span> Users are automatically created with the{' '}
                      <span className="font-medium capitalize">{jitConfig.defaultRole}</span> role on their first SSO login.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Attribute Mapping */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">SAML Attribute Mapping</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">Email</label>
                  <input
                    type="text"
                    defaultValue="http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">First Name</label>
                  <input
                    type="text"
                    defaultValue="http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase">Last Name</label>
                  <input
                    type="text"
                    defaultValue="http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Provider Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-bold text-gray-900">Add SSO Provider</h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Provider Type</label>
                <select
                  value={formData.provider}
                  onChange={e => setFormData({ ...formData, provider: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="saml">SAML 2.0</option>
                  <option value="oauth2_google">Google OAuth2</option>
                  <option value="oauth2_microsoft">Microsoft OAuth2</option>
                  <option value="oauth2_github">GitHub OAuth2</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Configuration Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Okta SAML"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-xs text-blue-900">
                  You'll be able to configure provider details after adding the provider.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t flex gap-3">
              <button
                onClick={() => setShowConfigModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProvider}
                disabled={!formData.name}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                Add Provider
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
