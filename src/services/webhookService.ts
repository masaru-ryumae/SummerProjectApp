import crypto from 'crypto';

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  secret: string;
  createdAt: Date;
  lastTriggeredAt: Date | null;
  failureCount: number;
  rateLimit: {
    requestsPerMinute: number;
    requestsThisMinute: number;
    resetTime: Date;
  };
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  eventType: string;
  payload: Record<string, any>;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  attempts: number;
  nextRetryAt: Date | null;
}

export interface WebhookEvent {
  type: string;
  timestamp: Date;
  data: Record<string, any>;
}

// Supported event types
export const WEBHOOK_EVENTS = {
  PROJECT_CREATED: 'project.created',
  PROJECT_UPDATED: 'project.updated',
  PROJECT_DELETED: 'project.deleted',
  USER_REGISTERED: 'user.registered',
  USER_UPDATED: 'user.updated',
  REVIEW_ADDED: 'review.added',
  REVIEW_UPDATED: 'review.updated',
  FAVORITE_ADDED: 'favorite.added',
  FAVORITE_REMOVED: 'favorite.removed',
  RATING_SUBMITTED: 'rating.submitted',
  PROGRESS_UPDATED: 'progress.updated',
  RECOMMENDATION_GENERATED: 'recommendation.generated',
};

class WebhookServiceImpl {
  private webhooks: Map<string, Webhook> = new Map();
  private deliveries: Map<string, WebhookDelivery[]> = new Map();
  private eventQueue: WebhookEvent[] = [];

  createWebhook(url: string, events: string[], rateLimitPerMinute: number = 100): Webhook {
    const id = crypto.randomUUID();
    const secret = crypto.randomBytes(32).toString('hex');
    const webhook: Webhook = {
      id, url, events, active: true, secret, createdAt: new Date(),
      lastTriggeredAt: null, failureCount: 0,
      rateLimit: { requestsPerMinute: rateLimitPerMinute, requestsThisMinute: 0, resetTime: new Date(Date.now() + 60000) },
    };
    this.webhooks.set(id, webhook);
    this.deliveries.set(id, []);
    return webhook;
  }

  getWebhook(id: string): Webhook | undefined {
    return this.webhooks.get(id);
  }

  listWebhooks(): Webhook[] {
    return Array.from(this.webhooks.values());
  }

  updateWebhook(id: string, updates: Partial<Webhook>): Webhook | null {
    const webhook = this.webhooks.get(id);
    if (!webhook) return null;
    const updated = { ...webhook, ...updates, id: webhook.id, secret: webhook.secret, createdAt: webhook.createdAt };
    this.webhooks.set(id, updated);
    return updated;
  }

  deleteWebhook(id: string): boolean {
    this.webhooks.delete(id);
    this.deliveries.delete(id);
    return true;
  }

  async testWebhook(id: string): Promise<WebhookDelivery | null> {
    const webhook = this.webhooks.get(id);
    if (!webhook) return null;
    const testEvent: WebhookEvent = { type: 'webhook.test', timestamp: new Date(), data: { message: 'Test webhook', webhookId: id } };
    return this.deliverEvent(webhook, testEvent);
  }

  generateSignature(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }

  verifySignature(payload: string, signature: string, secret: string): boolean {
    const expected = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  }

  private async deliverEvent(webhook: Webhook, event: WebhookEvent): Promise<WebhookDelivery> {
    const payload = JSON.stringify(event);
    const signature = this.generateSignature(payload, webhook.secret);
    const startTime = Date.now();
    let statusCode = 0;
    let attempts = 0;
    const maxAttempts = 5;
    const delivery: WebhookDelivery = {
      id: crypto.randomUUID(), webhookId: webhook.id, eventType: event.type, payload: event.data,
      statusCode: 0, responseTime: 0, timestamp: new Date(), attempts: 0, nextRetryAt: null,
    };

    for (attempts = 1; attempts <= maxAttempts; attempts++) {
      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-ID': webhook.id,
            'X-Webhook-Event': event.type,
            'X-Webhook-Timestamp': event.timestamp.toISOString(),
          },
          body: payload,
        });
        statusCode = response.status;
        delivery.responseTime = Date.now() - startTime;
        delivery.statusCode = statusCode;
        delivery.attempts = attempts;
        if (statusCode >= 200 && statusCode < 300) {
          webhook.lastTriggeredAt = new Date();
          webhook.failureCount = 0;
          break;
        }
        if (statusCode >= 400 && statusCode < 500) {
          webhook.failureCount++;
          break;
        }
        if (attempts < maxAttempts) {
          const backoffMs = Math.pow(2, attempts - 1) * 1000;
          delivery.nextRetryAt = new Date(Date.now() + backoffMs);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
        }
      } catch (error) {
        delivery.responseTime = Date.now() - startTime;
        webhook.failureCount++;
        if (attempts < maxAttempts) {
          const backoffMs = Math.pow(2, attempts - 1) * 1000;
          delivery.nextRetryAt = new Date(Date.now() + backoffMs);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
        }
      }
    }

    const deliveries = this.deliveries.get(webhook.id) || [];
    deliveries.unshift(delivery);
    this.deliveries.set(webhook.id, deliveries.slice(0, 100));
    return delivery;
  }

  async triggerEvent(event: WebhookEvent): Promise<WebhookDelivery[]> {
    const results: WebhookDelivery[] = [];
    for (const webhook of this.webhooks.values()) {
      if (!webhook.active || !webhook.events.includes(event.type)) continue;
      const now = new Date();
      if (now > webhook.rateLimit.resetTime) {
        webhook.rateLimit.requestsThisMinute = 0;
        webhook.rateLimit.resetTime = new Date(now.getTime() + 60000);
      }
      if (webhook.rateLimit.requestsThisMinute >= webhook.rateLimit.requestsPerMinute) continue;
      webhook.rateLimit.requestsThisMinute++;
      try {
        const delivery = await this.deliverEvent(webhook, event);
        results.push(delivery);
      } catch (error) {
        console.error(`Failed to deliver webhook ${webhook.id}:`, error);
      }
    }
    return results;
  }

  getDeliveryHistory(webhookId: string, limit: number = 20): WebhookDelivery[] {
    const deliveries = this.deliveries.get(webhookId) || [];
    return deliveries.slice(0, limit);
  }

  getDelivery(webhookId: string, deliveryId: string): WebhookDelivery | undefined {
    const deliveries = this.deliveries.get(webhookId) || [];
    return deliveries.find(d => d.id === deliveryId);
  }

  async resendDelivery(webhookId: string, deliveryId: string): Promise<WebhookDelivery | null> {
    const webhook = this.webhooks.get(webhookId);
    if (!webhook) return null;
    const delivery = this.getDelivery(webhookId, deliveryId);
    if (!delivery) return null;
    const event: WebhookEvent = { type: delivery.eventType, timestamp: delivery.timestamp, data: delivery.payload };
    return this.deliverEvent(webhook, event);
  }
}

export const webhookService = new WebhookServiceImpl();
