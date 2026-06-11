/**
 * Billing Service
 * High-level business logic for billing operations
 * Handles subscription management, feature gating, and usage tracking
 */

import {
  PRICING_TIERS,
  Subscription,
  PricingTier,
  Invoice,
  PaymentMethod,
  stripeService,
} from './stripeService';

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface UserBillingProfile {
  userId: string;
  customerId: string;
  subscription: Subscription | null;
  tier: SubscriptionTier;
  nextBillingDate: Date | null;
  usageMetrics: UsageMetrics;
}

export interface UsageMetrics {
  projectsCreated: number;
  teamMembersAdded: number;
  apiCallsUsed: number;
  storageUsedMB: number;
}

export interface FeatureAccess {
  canCreateProjects: boolean;
  maxProjects: number;
  canAccessTeamFeatures: boolean;
  maxTeamMembers: number;
  canAccessAdvancedAnalytics: boolean;
  canAccessAPIAccess: boolean;
  canAccessCustomIntegrations: boolean;
  canAccessWhiteLabel: boolean;
  supportLevel: 'community' | 'email' | 'priority';
}

// Feature gating configuration
const FEATURE_GATE: Record<SubscriptionTier, FeatureAccess> = {
  free: {
    canCreateProjects: true,
    maxProjects: 5,
    canAccessTeamFeatures: false,
    maxTeamMembers: 1,
    canAccessAdvancedAnalytics: false,
    canAccessAPIAccess: false,
    canAccessCustomIntegrations: false,
    canAccessWhiteLabel: false,
    supportLevel: 'community',
  },
  pro: {
    canCreateProjects: true,
    maxProjects: 999,
    canAccessTeamFeatures: true,
    maxTeamMembers: 5,
    canAccessAdvancedAnalytics: true,
    canAccessAPIAccess: true,
    canAccessCustomIntegrations: true,
    canAccessWhiteLabel: false,
    supportLevel: 'email',
  },
  enterprise: {
    canCreateProjects: true,
    maxProjects: 999999,
    canAccessTeamFeatures: true,
    maxTeamMembers: 999,
    canAccessAdvancedAnalytics: true,
    canAccessAPIAccess: true,
    canAccessCustomIntegrations: true,
    canAccessWhiteLabel: true,
    supportLevel: 'priority',
  },
};

class BillingService {
  private userProfiles: Map<string, UserBillingProfile> = new Map();

  async initializeUserBilling(
    userId: string,
    email: string,
    name: string,
  ): Promise<UserBillingProfile> {
    // Create Stripe customer
    const customer = await stripeService.createCustomer(email, name);

    // Create default free subscription
    const subscription = await stripeService.createSubscription(
      customer.id,
      PRICING_TIERS.free.stripePriceId,
    );

    const profile: UserBillingProfile = {
      userId,
      customerId: customer.id,
      subscription,
      tier: 'free',
      nextBillingDate: subscription.currentPeriodEnd,
      usageMetrics: {
        projectsCreated: 0,
        teamMembersAdded: 0,
        apiCallsUsed: 0,
        storageUsedMB: 0,
      },
    };

    this.userProfiles.set(userId, profile);
    return profile;
  }

  async getUserBillingProfile(userId: string): Promise<UserBillingProfile | null> {
    return this.userProfiles.get(userId) || null;
  }

  async upgradeTier(userId: string, newTier: SubscriptionTier): Promise<Subscription | null> {
    const profile = this.userProfiles.get(userId);
    if (!profile || !profile.subscription) return null;

    const pricingTier = PRICING_TIERS[newTier];
    const newSubscription = await stripeService.createSubscription(
      profile.customerId,
      pricingTier.stripePriceId,
    );

    // Update profile
    profile.subscription = newSubscription;
    profile.tier = newTier;
    profile.nextBillingDate = newSubscription.currentPeriodEnd;

    return newSubscription;
  }

  async downgradeOrCancelSubscription(
    userId: string,
    downgradeToTier?: SubscriptionTier,
  ): Promise<Subscription | null> {
    const profile = this.userProfiles.get(userId);
    if (!profile || !profile.subscription) return null;

    if (downgradeToTier) {
      // Downgrade to a lower tier
      return this.upgradeTier(userId, downgradeToTier);
    } else {
      // Cancel subscription
      const canceled = await stripeService.cancelSubscription(
        profile.subscription.id,
      );
      if (canceled) {
        profile.subscription = canceled;
        profile.tier = 'free';
      }
      return canceled;
    }
  }

  getFeatureAccess(tier: SubscriptionTier): FeatureAccess {
    return FEATURE_GATE[tier];
  }

  async checkFeatureAccess(userId: string, feature: string): Promise<boolean> {
    const profile = this.userProfiles.get(userId);
    if (!profile) return false;

    const access = FEATURE_GATE[profile.tier];

    // Map feature names to access checks
    const featureMap: Record<string, boolean> = {
      'create-projects': access.canCreateProjects,
      'team-features': access.canAccessTeamFeatures,
      'advanced-analytics': access.canAccessAdvancedAnalytics,
      'api-access': access.canAccessAPIAccess,
      'custom-integrations': access.canAccessCustomIntegrations,
      'white-label': access.canAccessWhiteLabel,
    };

    return featureMap[feature] || false;
  }

  async trackUsage(
    userId: string,
    usageType: keyof UsageMetrics,
    amount: number = 1,
  ): Promise<void> {
    const profile = this.userProfiles.get(userId);
    if (!profile) return;

    profile.usageMetrics[usageType] += amount;
  }

  async getBillingHistory(userId: string): Promise<Invoice[]> {
    const profile = this.userProfiles.get(userId);
    if (!profile) return [];

    return stripeService.listInvoices(profile.customerId);
  }

  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    const profile = this.userProfiles.get(userId);
    if (!profile) return [];

    return stripeService.listPaymentMethods(profile.customerId);
  }

  async addPaymentMethod(
    userId: string,
    paymentMethodData: Partial<PaymentMethod>,
  ): Promise<PaymentMethod | null> {
    const profile = this.userProfiles.get(userId);
    if (!profile) return null;

    return stripeService.addPaymentMethod(profile.customerId, paymentMethodData);
  }

  async removePaymentMethod(userId: string, paymentMethodId: string): Promise<boolean> {
    const profile = this.userProfiles.get(userId);
    if (!profile) return false;

    return stripeService.deletePaymentMethod(paymentMethodId);
  }

  getPricingTiers(): PricingTier[] {
    return Object.values(PRICING_TIERS);
  }

  getPricingTier(tier: SubscriptionTier): PricingTier {
    return PRICING_TIERS[tier];
  }

  async applyCoupon(
    userId: string,
    couponCode: string,
  ): Promise<{ discount: number; newTotal: number } | null> {
    // Mock coupon system
    const coupons: Record<string, number> = {
      SUMMER50: 0.5, // 50% off
      WELCOME20: 0.2, // 20% off
      FRIEND10: 0.1, // 10% off
    };

    if (!coupons[couponCode]) return null;

    const profile = this.userProfiles.get(userId);
    if (!profile || !profile.subscription) return null;

    const tierPrice = PRICING_TIERS[profile.tier].price;
    const discount = tierPrice * coupons[couponCode];
    const newTotal = tierPrice - discount;

    return { discount, newTotal };
  }

  async getUsageMetrics(userId: string): Promise<UsageMetrics | null> {
    const profile = this.userProfiles.get(userId);
    return profile?.usageMetrics || null;
  }

  async checkProjectLimit(userId: string): Promise<{ allowed: boolean; current: number; limit: number }> {
    const profile = this.userProfiles.get(userId);
    if (!profile) return { allowed: false, current: 0, limit: 0 };

    const access = FEATURE_GATE[profile.tier];
    const current = profile.usageMetrics.projectsCreated;
    const limit = access.maxProjects;

    return {
      allowed: current < limit,
      current,
      limit,
    };
  }

  async checkTeamMemberLimit(userId: string): Promise<{ allowed: boolean; current: number; limit: number }> {
    const profile = this.userProfiles.get(userId);
    if (!profile) return { allowed: false, current: 0, limit: 0 };

    const access = FEATURE_GATE[profile.tier];
    const current = profile.usageMetrics.teamMembersAdded;
    const limit = access.maxTeamMembers;

    return {
      allowed: current < limit,
      current,
      limit,
    };
  }
}

export const billingService = new BillingService();

export default billingService;
