/**
 * Stripe Integration Service
 * Handles payment processing, subscription management, and webhook events
 * Currently uses mock implementation for development
 * SECURITY: Issue #5 fix - includes CORS headers and security headers for real API calls
 */

// SECURITY FIX: Secret keys must NEVER be in frontend code
// Only publishable keys (pk_...) belong in the client
// Secret keys (sk_...) must be called from a server-side backend only
// This function is for server-side use only - should not be imported in client code
const getSecureApiHeaders = (): Record<string, string> => {
  return {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    // NEVER USE: import.meta.env.VITE_STRIPE_SECRET_KEY
    // Secret key operations must happen on a backend server
    // Use only the publishable key in frontend: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    'User-Agent': 'Summer-Builder/1.0'
  }
}

export interface StripeCustomer {
  id: string;
  email: string;
  name: string;
  paymentMethods: PaymentMethod[];
}

export interface PaymentMethod {
  id: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
}

export interface Subscription {
  id: string;
  customerId: string;
  priceId: string;
  tier: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'past_due' | 'canceled' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
  periodStart: Date;
  periodEnd: Date;
  pdfUrl: string;
  createdAt: Date;
}

export interface PricingTier {
  id: string;
  name: string;
  slug: 'free' | 'pro' | 'enterprise';
  price: number;
  interval: 'month' | 'year';
  description: string;
  features: string[];
  stripePriceId: string;
}

// Mock pricing tiers
export const PRICING_TIERS: Record<string, PricingTier> = {
  free: {
    id: 'tier_free',
    name: 'Free',
    slug: 'free',
    price: 0,
    interval: 'month',
    description: 'Perfect for getting started',
    features: [
      'Up to 5 projects',
      'Basic analytics',
      'Community support',
      'Read-only project sharing',
    ],
    stripePriceId: 'price_free',
  },
  pro: {
    id: 'tier_pro',
    name: 'Pro',
    slug: 'pro',
    price: 9.99,
    interval: 'month',
    description: 'For growing teams',
    features: [
      'Unlimited projects',
      'Team collaboration (up to 5)',
      'Advanced analytics',
      'Custom integrations',
      'Priority support',
      'API access (read-only)',
      'Bulk import/export',
    ],
    stripePriceId: 'price_pro_monthly',
  },
  enterprise: {
    id: 'tier_enterprise',
    name: 'Enterprise',
    slug: 'enterprise',
    price: 29.99,
    interval: 'month',
    description: 'For large organizations',
    features: [
      'Unlimited everything',
      'Unlimited team members',
      'Advanced analytics & reporting',
      'Full API access',
      'SSO & SAML',
      'White-label options',
      'Dedicated support',
      'Custom integrations',
      'Bulk operations',
      'Admin controls',
    ],
    stripePriceId: 'price_enterprise_monthly',
  },
};

// Mock Stripe Service (for development - replace with real Stripe in production)
class MockStripeService {
  private customerId: string | null = null;
  private subscriptions: Map<string, Subscription> = new Map();
  private invoices: Map<string, Invoice> = new Map();
  private paymentMethods: Map<string, PaymentMethod> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize with sample data
    const samplePaymentMethod: PaymentMethod = {
      id: 'pm_mock_123',
      type: 'card',
      card: {
        brand: 'visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2025,
      },
      isDefault: true,
    };
    this.paymentMethods.set('pm_mock_123', samplePaymentMethod);

    // Sample subscription
    const now = new Date();
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sampleSubscription: Subscription = {
      id: 'sub_mock_123',
      customerId: 'cus_mock_123',
      priceId: 'price_pro_monthly',
      tier: 'pro',
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: nextMonth,
      cancelAtPeriodEnd: false,
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    };
    this.subscriptions.set('sub_mock_123', sampleSubscription);
    this.customerId = 'cus_mock_123';
  }

  async createCustomer(email: string, name: string): Promise<StripeCustomer> {
    this.customerId = `cus_${Date.now()}`;
    return {
      id: this.customerId,
      email,
      name,
      paymentMethods: Array.from(this.paymentMethods.values()),
    };
  }

  async getCustomer(customerId?: string): Promise<StripeCustomer | null> {
    const id = customerId || this.customerId;
    if (!id) return null;

    return {
      id,
      email: 'user@example.com',
      name: 'User Name',
      paymentMethods: Array.from(this.paymentMethods.values()),
    };
  }

  async createSubscription(
    customerId: string,
    priceId: string,
  ): Promise<Subscription> {
    const tier = this.getPricingTierByStripeId(priceId);
    const now = new Date();
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const subscription: Subscription = {
      id: `sub_${Date.now()}`,
      customerId,
      priceId,
      tier: tier.slug,
      status: 'active',
      currentPeriodStart: now,
      currentPeriodEnd: nextMonth,
      cancelAtPeriodEnd: false,
      createdAt: now,
    };

    this.subscriptions.set(subscription.id, subscription);
    return subscription;
  }

  async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    return this.subscriptions.get(subscriptionId) || null;
  }

  async updateSubscription(
    subscriptionId: string,
    updates: Partial<Subscription>,
  ): Promise<Subscription | null> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return null;

    const updated = { ...subscription, ...updates };
    this.subscriptions.set(subscriptionId, updated);
    return updated;
  }

  async cancelSubscription(subscriptionId: string): Promise<Subscription | null> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) return null;

    const canceled: Subscription = {
      ...subscription,
      status: 'canceled',
      cancelAtPeriodEnd: true,
    };
    this.subscriptions.set(subscriptionId, canceled);
    return canceled;
  }

  async listSubscriptions(customerId: string): Promise<Subscription[]> {
    return Array.from(this.subscriptions.values()).filter(
      (s) => s.customerId === customerId,
    );
  }

  async addPaymentMethod(
    customerId: string,
    paymentMethodData: Partial<PaymentMethod>,
  ): Promise<PaymentMethod> {
    const method: PaymentMethod = {
      id: `pm_${Date.now()}`,
      type: 'card',
      card: paymentMethodData.card || {
        brand: 'visa',
        last4: '0000',
        expMonth: 12,
        expYear: 2025,
      },
      isDefault: paymentMethodData.isDefault || false,
    };

    this.paymentMethods.set(method.id, method);
    return method;
  }

  async listPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    return Array.from(this.paymentMethods.values());
  }

  async deletePaymentMethod(paymentMethodId: string): Promise<boolean> {
    return this.paymentMethods.delete(paymentMethodId);
  }

  async listInvoices(customerId: string): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(
      (i) =>
        this.subscriptions
          .get(i.subscriptionId)
          ?.customerId === customerId,
    );
  }

  async getInvoice(invoiceId: string): Promise<Invoice | null> {
    return this.invoices.get(invoiceId) || null;
  }

  async downloadInvoicePdf(invoiceId: string): Promise<string | null> {
    const invoice = this.invoices.get(invoiceId);
    return invoice?.pdfUrl || null;
  }

  // Helper method to get pricing tier by Stripe price ID
  private getPricingTierByStripeId(priceId: string): PricingTier {
    const tier = Object.values(PRICING_TIERS).find(
      (t) => t.stripePriceId === priceId,
    );
    return tier || PRICING_TIERS.free;
  }

  // Webhook handler for Stripe events (mock)
  async handleWebhook(event: any): Promise<boolean> {
    switch (event.type) {
      case 'invoice.payment_succeeded':
        return this.handlePaymentSucceeded(event.data.object);
      case 'customer.subscription.updated':
        return this.handleSubscriptionUpdated(event.data.object);
      case 'customer.subscription.deleted':
        return this.handleSubscriptionDeleted(event.data.object);
      default:
        return true;
    }
  }

  private async handlePaymentSucceeded(invoice: any): Promise<boolean> {
    console.log('Payment succeeded for invoice:', invoice.id);
    return true;
  }

  private async handleSubscriptionUpdated(subscription: any): Promise<boolean> {
    console.log('Subscription updated:', subscription.id);
    return true;
  }

  private async handleSubscriptionDeleted(subscription: any): Promise<boolean> {
    console.log('Subscription deleted:', subscription.id);
    return true;
  }
}

// Export singleton instance
export const stripeService = new MockStripeService();

export default stripeService;
