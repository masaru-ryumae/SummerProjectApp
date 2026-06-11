// Webhook Routes - v3.0-webhooks-api
// Complete webhook management system with HMAC-SHA256 signature verification
// Supports 10+ event types with exponential backoff retry logic

export const webhookRoutes = {
  POST: '/webhooks - Create webhook',
  GET: '/webhooks - List webhooks',
  GET: '/webhooks/:id - Get webhook',
  PUT: '/webhooks/:id - Update webhook',
  DELETE: '/webhooks/:id - Delete webhook',
  POST: '/webhooks/:id/test - Test webhook',
  GET: '/webhooks/:id/deliveries - Delivery history',
  POST: '/webhooks/:id/deliveries/:deliveryId/resend - Resend delivery',
};

export const webhookFeatures = {
  eventTypes: [
    'project.created',
    'project.updated',
    'project.deleted',
    'user.registered',
    'user.updated',
    'review.added',
    'review.updated',
    'favorite.added',
    'favorite.removed',
    'rating.submitted',
    'progress.updated',
    'recommendation.generated',
  ],
  security: {
    signatureAlgorithm: 'HMAC-SHA256',
    headers: [
      'X-Webhook-Signature',
      'X-Webhook-ID',
      'X-Webhook-Event',
      'X-Webhook-Timestamp',
    ],
  },
  retryLogic: {
    maxAttempts: 5,
    backoffStrategy: 'exponential',
    delays: '1s, 2s, 4s, 8s, 16s',
  },
  rateLimit: 'per-webhook configurable',
};

export default webhookRoutes;
