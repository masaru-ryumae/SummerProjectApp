import React, { useState, useEffect } from 'react';
import { PRICING_TIERS } from '../services/stripeService';
import { billingService } from '../services/billingService';

const PricingPage = ({ userId, currentTier = 'free', onUpgrade }) => {
  const [selectedBillingCycle, setSelectedBillingCycle] = useState('monthly');
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Defect #17 Fix: Prevent race conditions on unmount
  const isMountedRef = React.useRef(true);
  const timeoutIdRef = React.useRef(null);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  const tiers = Object.values(PRICING_TIERS).sort((a, b) => a.price - b.price);

  // Feature comparison data
  const featureComparison = [
    { name: 'Projects', free: '5', pro: 'Unlimited', enterprise: 'Unlimited' },
    { name: 'Team Members', free: '1', pro: '5', enterprise: 'Unlimited' },
    { name: 'Analytics', free: 'Basic', pro: 'Advanced', enterprise: 'Advanced' },
    { name: 'API Access', free: '❌', pro: 'Read-only', enterprise: 'Full' },
    { name: 'Custom Integrations', free: '❌', pro: '✓', enterprise: '✓' },
    { name: 'White-label', free: '❌', pro: '❌', enterprise: '✓' },
    { name: 'Support', free: 'Community', pro: 'Email', enterprise: 'Priority' },
  ];

  const handleUpgrade = async (tier) => {
    if (tier === currentTier) {
      setError('You are already on this plan');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Defect #17 Fix: Proper async handling with cleanup
      const subscription = await billingService.upgradeTier(userId, tier);

      if (!isMountedRef.current) return;

      if (!subscription) {
        throw new Error('Failed to upgrade plan');
      }

      // Clear any pending timeouts
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }

      // Schedule upgrade callback with cleanup
      timeoutIdRef.current = setTimeout(() => {
        if (isMountedRef.current && onUpgrade) {
          onUpgrade(tier);
        }
      }, 1000);
    } catch (err) {
      if (isMountedRef.current) {
        setError('Upgrade failed: ' + err.message);
        setLoading(false);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="relative px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Choose the perfect plan for your needs
          </p>

          {/* Billing Toggle */}
          <div className="flex justify-center items-center gap-4 mb-12">
            <button
              onClick={() => setSelectedBillingCycle('monthly')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedBillingCycle === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedBillingCycle('yearly')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedBillingCycle === 'yearly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 mb-16">
          {tiers.map((tier) => {
            const isCurrentTier = tier.slug === currentTier;
            const isPopular = tier.slug === 'pro';

            return (
              <div
                key={tier.id}
                className={`relative rounded-2xl transition transform hover:scale-105 ${
                  isPopular
                    ? 'md:scale-105 bg-gradient-to-br from-blue-600 to-blue-700 ring-2 ring-blue-400'
                    : 'bg-slate-800 hover:bg-slate-750'
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-yellow-500 text-slate-900 px-4 py-1 rounded-full text-sm font-bold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Tier Name */}
                  <h3 className={`text-2xl font-bold mb-2 ${
                    isPopular ? 'text-white' : 'text-slate-100'
                  }`}>
                    {tier.name}
                  </h3>
                  <p className={`text-sm mb-6 ${
                    isPopular ? 'text-blue-100' : 'text-slate-400'
                  }`}>
                    {tier.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className={`text-5xl font-bold ${
                      isPopular ? 'text-white' : 'text-slate-100'
                    }`}>
                      ${tier.price === 0 ? 'Free' : tier.price}
                      {tier.price > 0 && <span className="text-xl text-slate-300">/mo</span>}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleUpgrade(tier.slug)}
                    disabled={isCurrentTier || loading}
                    className={`w-full py-3 rounded-lg font-semibold mb-8 transition ${
                      isCurrentTier
                        ? 'bg-slate-700 text-slate-300 cursor-not-allowed'
                        : isPopular
                        ? 'bg-white text-blue-600 hover:bg-blue-50'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {loading ? 'Processing...' : isCurrentTier ? 'Current Plan' : 'Get Started'}
                  </button>

                  {/* Features List */}
                  <div className="space-y-4">
                    {tier.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <span className={`text-lg ${
                          isPopular ? 'text-blue-100' : 'text-green-400'
                        }`}>
                          ✓
                        </span>
                        <span className={`text-sm ${
                          isPopular ? 'text-blue-50' : 'text-slate-300'
                        }`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Detailed Comparison
          </h2>

          <div className="overflow-x-auto rounded-lg border border-slate-700">
            <table className="w-full bg-slate-800">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-6 py-4 text-left font-semibold text-slate-200">Feature</th>
                  <th className="px-6 py-4 text-center font-semibold text-slate-200">Free</th>
                  <th className="px-6 py-4 text-center font-semibold text-blue-400">Pro</th>
                  <th className="px-6 py-4 text-center font-semibold text-slate-200">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {featureComparison.map((feature) => (
                  <tr key={feature.name} className={'bg-slate-800'}>
                    <td className="px-6 py-4 font-medium text-slate-200">{feature.name}</td>
                    <td className="px-6 py-4 text-center text-slate-400">{feature.free}</td>
                    <td className="px-6 py-4 text-center text-slate-100">{feature.pro}</td>
                    <td className="px-6 py-4 text-center text-slate-100">{feature.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-20">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {[
              {
                q: 'Can I change my plan anytime?',
                a: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect at your next billing cycle.',
              },
              {
                q: 'Do you offer discounts for annual billing?',
                a: 'Yes, we offer 20% discount on all paid plans when you choose yearly billing.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes, all features on the Free plan are available indefinitely. Upgrade anytime to access premium features.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards via Stripe. Enterprise customers can arrange custom payment terms.',
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Absolutely! You can cancel your subscription at any time. You will lose access to premium features after your current billing period ends.',
              },
            ].map((faq) => (
              <div key={faq.q} className="bg-slate-800 rounded-lg p-6">
                <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-slate-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
