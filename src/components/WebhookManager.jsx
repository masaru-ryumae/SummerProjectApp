import { useState } from 'react';

export default function WebhookManager() {
  const [webhooks, setWebhooks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    url: '',
    events: [],
    rateLimit: 100,
  });

  const eventTypes = [
    { value: 'project.created', label: 'Project Created' },
    { value: 'project.updated', label: 'Project Updated' },
    { value: 'user.registered', label: 'User Registered' },
    { value: 'review.added', label: 'Review Added' },
    { value: 'favorite.added', label: 'Favorite Added' },
    { value: 'rating.submitted', label: 'Rating Submitted' },
  ];

  const handleCreateWebhook = (e) => {
    e.preventDefault();
    if (!formData.url || formData.events.length === 0) {
      alert('Please provide URL and select at least one event');
      return;
    }
    const newWebhook = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      active: true,
      createdAt: new Date().toISOString(),
      failureCount: 0,
      secret: 'spf_' + Math.random().toString(36).substr(2, 16),
    };
    setWebhooks([...webhooks, newWebhook]);
    setFormData({ url: '', events: [], rateLimit: 100 });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Webhook Manager
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancel' : '+ Create Webhook'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreateWebhook} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Webhook URL
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://example.com/webhook"
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Subscribe to Events
            </label>
            <div className="space-y-2">
              {eventTypes.map(event => (
                <label key={event.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.events.includes(event.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          events: [...formData.events, event.value],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          events: formData.events.filter(ev => ev !== event.value),
                        });
                      }
                    }}
                    className="rounded"
                  />
                  <span className="ml-2">{event.label}</span>
                </label>
              ))}
            </div>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Create Webhook
          </button>
        </form>
      )}

      <div className="space-y-4">
        {webhooks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No webhooks created yet
          </div>
        ) : (
          webhooks.map(webhook => (
            <div
              key={webhook.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {webhook.url}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {webhook.events.length} events • Created {new Date(webhook.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setWebhooks(webhooks.filter(w => w.id !== webhook.id))}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
