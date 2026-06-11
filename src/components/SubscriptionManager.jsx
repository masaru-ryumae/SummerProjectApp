import React, { useState, useEffect } from 'react';
import { billingService } from '../services/billingService';
import { PRICING_TIERS } from '../services/stripeService';

const SubscriptionManager = ({ userId, onComplete }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTier, setSelectedTier] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Defect #17 Fix: Prevent race conditions on unmount
  const isMountedRef = React.useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profile = await billingService.getUserBillingProfile(userId);

      if (!isMountedRef.current) return;

      if (!profile) {
        throw new Error('Failed to load billing profile');
      }

      setProfile(profile);
      setSelectedTier(profile.tier);
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleUpgrade = async (tier) => {
    if (!profile || tier === profile.tier) {
      setError('You are already on this plan');
      return;
    }

    let timeoutId = null;

    try {
      setLoading(true);
      setError(null);
      const subscription = await billingService.upgradeTier(userId, tier);

      if (!isMountedRef.current) return;

      if (!subscription) {
        throw new Error('Failed to upgrade subscription');
      }

      setProfile({
        ...profile,
        tier,
        subscription,
      });
      setSelectedTier(tier);
      setShowConfirmation(true);

      // Defect #17 Fix: Clean up timeout on unmount
      timeoutId = setTimeout(() => {
        if (isMountedRef.current && onComplete) {
          onComplete(tier);
        }
      }, 2000);
    } catch (err) {
      if (isMountedRef.current) {
        setError('Upgrade failed: ' + err.message);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    }
  };

  const handleDowngrade = async (tier) => {
    try {
      setLoading(true);
      setError(null);
      const subscription = await billingService.downgradeOrCancelSubscription(userId, tier);

      if (!isMountedRef.current) return;

      if (!subscription) {
        throw new Error('Failed to downgrade subscription');
      }

      setProfile({
        ...profile,
        tier,
        subscription,
      });
      setSelectedTier(tier);
    } catch (err) {
      if (isMountedRef.current) {
        setError('Downgrade failed: ' + err.message);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription? You will lose access to premium features.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const subscription = await billingService.downgradeOrCancelSubscription(userId);

      if (!isMountedRef.current) return;

      if (!subscription) {
        throw new Error('Failed to cancel subscription');
      }

      setProfile({
        ...profile,
        tier: 'free',
        subscription,
      });
      setSelectedTier('free');
    } catch (err) {
      if (isMountedRef.current) {
        setError('Cancellation failed: ' + err.message);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-slate-400 mt-4">Loading subscription...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center text-red-400">
        <p>Failed to load subscription information</p>
      </div>
    );
  }

  const tiers = Object.values(PRICING_TIERS).sort((a, b) => a.price - b.price);
  const currentPricing = PRICING_TIERS[profile.tier];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Manage Your Subscription</h1>
          <p className="text-slate-300 text-lg">Current plan: <span className="font-bold text-blue-400">{profile.tier.charAt(0).toUpperCase() + profile.tier.slice(1)}</span></p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-600 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Success Message */}
        {showConfirmation && (
          <div className="mb-6 bg-green-900/20 border border-green-600 text-green-400 px-4 py-3 rounded-lg">
            ✓ Subscription updated successfully!
          </div>
        )}

        {/* Tier Comparison Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {tiers.map((tier) => {
            const isCurrentTier = tier.slug === profile.tier;
            const canUpgrade = PRICING_TIERS[profile.tier].price < tier.price;

            return (
              <div
                key={tier.id}
                className={`rounded-lg border-2 p-6 transition ${
                  isCurrentTier
                    ? 'border-blue-500 bg-slate-800/50'
                    : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                }`}
              >
                <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                <div className="text-3xl font-bold text-white mb-4">
                  ${tier.price === 0 ? 'Free' : tier.price}
                  {tier.price > 0 && <span className="text-lg text-slate-400">/mo</span>}
                </div>

                <p className="text-slate-400 mb-4 text-sm">{tier.description}</p>

                {isCurrentTier && (
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium mb-4 text-center text-sm">
                    Current Plan
                  </div>
                )}

                <div className="space-y-2 mb-6">
                  {tier.features.slice(0, 4).map((feature) => (
                    <div key={feature} className="flex items-start gap-2">
                      <span className="text-green-400 text-sm">✓</span>
                      <span className="text-slate-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    if (canUpgrade) {
                      handleUpgrade(tier.slug);
                    } else if (!isCurrentTier) {
                      handleDowngrade(tier.slug);
                    }
                  }}
                  disabled={isCurrentTier || loading}
                  className={`w-full py-2 rounded-lg font-medium transition ${
                    isCurrentTier
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : canUpgrade
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  {loading ? 'Processing...' : isCurrentTier ? 'Current' : canUpgrade ? 'Upgrade' : 'Downgrade'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Current Subscription Details */}
        {profile.subscription && (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Current Subscription Details</h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-slate-400 text-sm font-medium mb-4">Subscription Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-slate-500 text-xs">Subscription ID</p>
                    <p className="text-white font-mono text-sm">{profile.subscription.id}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Status</p>
                    <p className={`font-medium ${
                      profile.subscription.status === 'active' ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {profile.subscription.status.charAt(0).toUpperCase() + profile.subscription.status.slice(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Created</p>
                    <p className="text-white">{new Date(profile.subscription.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-slate-400 text-sm font-medium mb-4">Billing Cycle</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-slate-500 text-xs">Current Period Start</p>
                    <p className="text-white">{new Date(profile.subscription.currentPeriodStart).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Current Period End</p>
                    <p className="text-white">{new Date(profile.subscription.currentPeriodEnd).toLocaleDateString()}</p>
                  </div>
                  {profile.subscription.cancelAtPeriodEnd && (
                    <div className="bg-red-900/20 border border-red-600 rounded px-3 py-2">
                      <p className="text-red-400 text-sm">Scheduled for cancellation at period end</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Usage Metrics */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Usage Metrics</h2>

          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <p className="text-slate-400 text-sm mb-2">Projects Created</p>
              <p className="text-3xl font-bold text-white">{profile.usageMetrics.projectsCreated}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-2">Team Members Added</p>
              <p className="text-3xl font-bold text-white">{profile.usageMetrics.teamMembersAdded}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-2">API Calls Used</p>
              <p className="text-3xl font-bold text-white">{profile.usageMetrics.apiCallsUsed}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-2">Storage Used</p>
              <p className="text-3xl font-bold text-white">{profile.usageMetrics.storageUsedMB}MB</p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        {profile.tier !== 'free' && (
          <div className="bg-red-900/20 border border-red-600 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Danger Zone</h2>
            <p className="text-slate-300 mb-6">
              Cancel your subscription. You will lose access to premium features after your current billing period ends.
            </p>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-6 py-3 rounded-lg font-medium transition"
            >
              {loading ? 'Processing...' : 'Cancel Subscription'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManager;
