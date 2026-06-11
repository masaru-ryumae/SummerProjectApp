/**
 * Billing Routes
 * Server-side endpoints for handling Stripe webhooks and billing operations
 *
 * In production, this would be a full Express/Node.js server.
 * For development, these represent the API endpoints that would be available.
 */

import { Request, Response } from 'express';
import { stripeService } from '../../src/services/stripeService';
import { billingService } from '../../src/services/billingService';

/**
 * Stripe Webhook Handler
 * Receives and processes events from Stripe
 *
 * POST /api/webhooks/stripe
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  try {
    const event = req.body;

    // Verify webhook signature (in production)
    // const sig = req.headers['stripe-signature'];
    // const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

    // Process the event
    const handled = await stripeService.handleWebhook(event);

    if (handled) {
      res.json({ received: true });
    } else {
      res.status(400).json({ error: 'Failed to process webhook' });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
}

/**
 * Get Billing Profile
 * GET /api/billing/profile/:userId
 */
export async function getBillingProfile(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const profile = await billingService.getUserBillingProfile(userId);

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching billing profile:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Initialize User Billing
 * POST /api/billing/init
 */
export async function initializeBilling(req: Request, res: Response) {
  try {
    const { userId, email, name } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ error: 'userId and email are required' });
    }

    const profile = await billingService.initializeUserBilling(userId, email, name || 'User');
    res.json(profile);
  } catch (error) {
    console.error('Error initializing billing:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Upgrade Subscription
 * POST /api/billing/upgrade
 */
export async function upgradeSubscription(req: Request, res: Response) {
  try {
    const { userId, tier } = req.body;

    if (!userId || !tier) {
      return res.status(400).json({ error: 'userId and tier are required' });
    }

    const subscription = await billingService.upgradeTier(userId, tier);

    if (!subscription) {
      return res.status(400).json({ error: 'Failed to upgrade subscription' });
    }

    res.json(subscription);
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Cancel/Downgrade Subscription
 * POST /api/billing/downgrade
 */
export async function downgradeSubscription(req: Request, res: Response) {
  try {
    const { userId, tier } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const subscription = await billingService.downgradeOrCancelSubscription(userId, tier);

    if (!subscription) {
      return res.status(400).json({ error: 'Failed to downgrade subscription' });
    }

    res.json(subscription);
  } catch (error) {
    console.error('Error downgrading subscription:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Check Feature Access
 * GET /api/billing/feature/:userId/:feature
 */
export async function checkFeatureAccess(req: Request, res: Response) {
  try {
    const { userId, feature } = req.params;

    const hasAccess = await billingService.checkFeatureAccess(userId, feature);

    res.json({ hasAccess });
  } catch (error) {
    console.error('Error checking feature access:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get Pricing Tiers
 * GET /api/billing/pricing
 */
export async function getPricingTiers(req: Request, res: Response) {
  try {
    const tiers = billingService.getPricingTiers();
    res.json(tiers);
  } catch (error) {
    console.error('Error fetching pricing tiers:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get Payment Methods
 * GET /api/billing/payment-methods/:userId
 */
export async function getPaymentMethods(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const methods = await billingService.getPaymentMethods(userId);

    res.json(methods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Add Payment Method
 * POST /api/billing/payment-methods/:userId
 */
export async function addPaymentMethod(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const paymentMethodData = req.body;

    const method = await billingService.addPaymentMethod(userId, paymentMethodData);

    if (!method) {
      return res.status(400).json({ error: 'Failed to add payment method' });
    }

    res.json(method);
  } catch (error) {
    console.error('Error adding payment method:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Remove Payment Method
 * DELETE /api/billing/payment-methods/:userId/:paymentMethodId
 */
export async function removePaymentMethod(req: Request, res: Response) {
  try {
    const { userId, paymentMethodId } = req.params;

    const success = await billingService.removePaymentMethod(userId, paymentMethodId);

    if (!success) {
      return res.status(400).json({ error: 'Failed to remove payment method' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error removing payment method:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get Billing History
 * GET /api/billing/history/:userId
 */
export async function getBillingHistory(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const invoices = await billingService.getBillingHistory(userId);

    res.json(invoices);
  } catch (error) {
    console.error('Error fetching billing history:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Apply Coupon
 * POST /api/billing/coupon
 */
export async function applyCoupon(req: Request, res: Response) {
  try {
    const { userId, couponCode } = req.body;

    if (!userId || !couponCode) {
      return res.status(400).json({ error: 'userId and couponCode are required' });
    }

    const result = await billingService.applyCoupon(userId, couponCode);

    if (!result) {
      return res.status(400).json({ error: 'Invalid coupon code' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error applying coupon:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Track Usage
 * POST /api/billing/usage/:userId
 */
export async function trackUsage(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { usageType, amount } = req.body;

    if (!usageType) {
      return res.status(400).json({ error: 'usageType is required' });
    }

    await billingService.trackUsage(userId, usageType, amount || 1);

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking usage:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get Usage Metrics
 * GET /api/billing/usage/:userId
 */
export async function getUsageMetrics(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const metrics = await billingService.getUsageMetrics(userId);

    if (!metrics) {
      return res.status(404).json({ error: 'Metrics not found' });
    }

    res.json(metrics);
  } catch (error) {
    console.error('Error fetching usage metrics:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Check Project Limit
 * GET /api/billing/project-limit/:userId
 */
export async function checkProjectLimit(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const limit = await billingService.checkProjectLimit(userId);

    res.json(limit);
  } catch (error) {
    console.error('Error checking project limit:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Check Team Member Limit
 * GET /api/billing/team-limit/:userId
 */
export async function checkTeamMemberLimit(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const limit = await billingService.checkTeamMemberLimit(userId);

    res.json(limit);
  } catch (error) {
    console.error('Error checking team member limit:', error);
    res.status(500).json({ error: error.message });
  }
}
