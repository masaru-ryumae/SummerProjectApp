import { useState } from 'react';
import WebhookManager from './WebhookManager';

export default function DeveloperPortal() {
  const [activeTab, setActiveTab] = useState('overview');
  const [apiKeys, setApiKeys] = useState([]);
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'keys', label: 'API Keys', icon: '🔑' },
    { id: 'webhooks', label: 'Webhooks', icon: '🔗' },
    { id: 'docs', label: 'Documentation', icon: '📚' },
    { id: 'samples', label: 'Code Samples', icon: '💻' },
  ];

  const handleCreateApiKey = (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) {
      alert('Please enter a key name');
      return;
    }
    const newKey = {
      id: Math.random().toString(36).substr(2, 9),
      name: newKeyName,
      key: `spf_${Math.random().toString(36).substr(2, 32)}`,
      createdAt: new Date().toISOString(),
      permissions: ['read:public', 'write:projects'],
    };
    setApiKeys([...apiKeys, newKey]);
    setNewKeyName('');
    setShowNewKeyForm(false);
  };

  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Developer Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage API keys, webhooks, and integrations
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Getting Started with Summer Project API</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">API Keys</p>
                <p className="text-3xl font-bold mt-2">{apiKeys.length}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Endpoints</p>
                <p className="text-3xl font-bold mt-2">42+</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">API Version</p>
                <p className="text-3xl font-bold mt-2">v1.0</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'keys' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">API Keys</h2>
              <button
                onClick={() => setShowNewKeyForm(!showNewKeyForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {showNewKeyForm ? 'Cancel' : '+ New Key'}
              </button>
            </div>

            {showNewKeyForm && (
              <form onSubmit={handleCreateApiKey} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Key Name</label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Production API"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <button type="submit" className="w-full px-4 py-2 bg-green-600 text-white rounded-lg">
                  Create API Key
                </button>
              </form>
            )}

            {apiKeys.length === 0 ? (
              <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-gray-500">No API keys yet</p>
              </div>
            ) : (
              apiKeys.map(key => (
                <div key={key.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold">{key.name}</h3>
                  <div className="mt-3 flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                      {key.key}
                    </code>
                    <button
                      onClick={() => handleCopyKey(key.key)}
                      className="px-3 py-2 bg-blue-600 text-white rounded text-sm"
                    >
                      {copiedKey === key.key ? '✓' : 'Copy'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'webhooks' && <WebhookManager />}

        {activeTab === 'docs' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">API Documentation</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Base URLs</h3>
              <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded">
REST: https://api.summerprojectapp.com/v1
GraphQL: https://api.summerprojectapp.com/graphql
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'samples' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Code Samples</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">cURL</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
curl -X GET https://api.summerprojectapp.com/v1/projects \
  -H "Authorization: Bearer spf_key"
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
