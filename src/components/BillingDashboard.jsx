import React, { useState, useEffect, useCallback } from 'react';
import { billingService } from '../services/billingService';
import { PRICING_TIERS } from '../services/stripeService';

const BillingDashboard = ({ userId, onNavigate }) => {
  const [profile, setProfile] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddCard, setShowAddCard] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false); // Defect #11: Loading state
  const [couponError, setCouponError] = useState(null); // Defect #11: Error feedback

  useEffect(() => {
    loadBillingData();
  }, [userId]);

  const loadBillingData = async () => {
    setLoading(true);
    const profile = await billingService.getUserBillingProfile(userId);
    if (profile) {
      setProfile(profile);
      const methods = await billingService.getPaymentMethods(userId);
      const history = await billingService.getBillingHistory(userId);
      setPaymentMethods(methods);
      setInvoices(history);
    }
    setLoading(false);
  };

  // Defect #11 Fix: Add loading state and error handling
  const applyCoupon = useCallback(async () => {
    if (!couponCode.trim() || isApplyingCoupon) return;

    try {
      setIsApplyingCoupon(true);
      setCouponError(null);

      const result = await billingService.applyCoupon(userId, couponCode.toUpperCase());

      if (result) {
        setCouponDiscount(result);
        setCouponCode('');
        setCouponError(null);
      } else {
        setCouponError('Invalid coupon code');
      }
    } catch (error) {
      console.error('Coupon application error:', error);
      setCouponError('Failed to apply coupon: ' + error.message);
    } finally {
      setIsApplyingCoupon(false);
    }
  }, [couponCode, userId, isApplyingCoupon]);

  const handleUpgradePlan = (tier) => {
    if (onNavigate) {
      onNavigate('pricing', { selectedTier: tier });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-white">Loading billing information...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-white">No billing profile found</div>
      </div>
    );
  }

  const currentTier = PRICING_TIERS[profile.tier];
  const usageMetrics = profile.usageMetrics;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Billing & Subscription</h1>
          <p className="text-slate-400">Manage your subscription, payments, and invoices</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-slate-700">
          {['overview', 'billing', 'payments'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium transition ${
                activeTab === tab
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Current Plan Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-8 text-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{currentTier.name} Plan</h2>
                  <p className="text-blue-100">{currentTier.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    ${currentTier.price === 0 ? 'Free' : currentTier.price}
                    {currentTier.price > 0 && <span className="text-lg text-blue-100">/mo</span>}
                  </div>
                </div>
              </div>

              {profile.subscription && (
                <div className="grid md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-blue-500">
                  <div>
                    <p className="text-blue-200 text-sm mb-1">Status</p>
                    <p className="text-lg font-semibold capitalize">
                      {profile.subscription.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm mb-1">Billing Period</p>
                    <p className="text-lg font-semibold">
                      {new Date(profile.subscription.currentPeriodStart).toLocaleDateString()} - {new Date(profile.subscription.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm mb-1">Next Billing Date</p>
                    <p className="text-lg font-semibold">
                      {profile.nextBillingDate ? new Date(profile.nextBillingDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              )}

              {profile.tier !== 'enterprise' && (
                <button
                  onClick={() => handleUpgradePlan(profile.tier === 'free' ? 'pro' : 'enterprise')}
                  className="mt-6 bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition"
                >
                  Upgrade Plan
                </button>
              )}
            </div>

            {/* Usage Metrics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-slate-400 text-sm font-medium mb-2">Projects Created</h3>
                <p className="text-2xl font-bold text-white">{usageMetrics.projectsCreated}</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-slate-400 text-sm font-medium mb-2">Team Members</h3>
                <p className="text-2xl font-bold text-white">{usageMetrics.teamMembersAdded}</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-slate-400 text-sm font-medium mb-2">API Calls</h3>
                <p className="text-2xl font-bold text-white">{usageMetrics.apiCallsUsed}</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-6">
                <h3 className="text-slate-400 text-sm font-medium mb-2">Storage Used</h3>
                <p className="text-2xl font-bold text-white">{usageMetrics.storageUsedMB}MB</p>
              </div>
            </div>

            {/* Feature Access */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Your Features</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: 'Create Projects', access: true },
                  { name: 'Team Features', access: profile.tier !== 'free' },
                  { name: 'Advanced Analytics', access: profile.tier !== 'free' },
                  { name: 'API Access', access: profile.tier === 'pro' || profile.tier === 'enterprise' },
                  { name: 'Custom Integrations', access: profile.tier === 'pro' || profile.tier === 'enterprise' },
                  { name: 'White-label', access: profile.tier === 'enterprise' },
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className={`text-lg ${feature.access ? 'text-green-400' : 'text-slate-500'}`}>
                      {feature.access ? '✓' : '✗'}
                    </span>
                    <span className={feature.access ? 'text-slate-300' : 'text-slate-500'}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            {/* Coupon Section */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Apply Coupon Code</h3>
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  className="flex-1 bg-slate-700 border border-slate-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={applyCoupon}
                  disabled={isApplyingCoupon || !couponCode.trim()}
                  className={`px-6 py-2 rounded-lg font-medium transition ${
                    isApplyingCoupon || !couponCode.trim()
                      ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isApplyingCoupon ? 'Applying...' : 'Apply'}
                </button>
              </div>
              {couponError && (
                <div className="bg-red-900/30 border border-red-600 rounded-lg p-4 mb-4">
                  <p className="text-red-400">❌ {couponError}</p>
                </div>
              )}
              {couponDiscount && (
                <div className="bg-green-900/30 border border-green-600 rounded-lg p-4">
                  <p className="text-green-400 font-medium">
                    ✓ Coupon applied! Discount: ${couponDiscount.discount.toFixed(2)} (New Total: ${couponDiscount.newTotal.toFixed(2)}/mo)
                  </p>
                </div>
              )}
              <p className="text-slate-400 text-sm mt-4">Try: SUMMER50, WELCOME20, FRIEND10</p>
            </div>

            {/* Billing History */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Billing History</h3>
              {invoices.length > 0 ? (
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-650 transition"
                    >
                      <div>
                        <p className="font-medium text-white">{invoice.id}</p>
                        <p className="text-slate-400 text-sm">
                          {new Date(invoice.periodStart).toLocaleDateString()} - {new Date(invoice.periodEnd).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">${invoice.amount.toFixed(2)}</p>
                        <p className={`text-sm ${
                          invoice.status === 'paid' ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </p>
                      </div>
                      <button className="ml-4 text-blue-400 hover:text-blue-300 transition">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">No invoices yet</p>
              )}
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            {/* Payment Methods */}
            <div className="bg-slate-800 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Payment Methods</h3>
                <button
                  onClick={() => setShowAddCard(!showAddCard)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                  {showAddCard ? 'Cancel' : '+ Add Card'}
                </button>
              </div>

              {showAddCard && (
                <div className="bg-slate-700 rounded-lg p-4 mb-4">
                  <input
                    type="text"
                    placeholder="Card Number"
                    className="w-full bg-slate-600 border border-slate-500 text-white px-3 py-2 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="bg-slate-600 border border-slate-500 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="CVC"
                      className="bg-slate-600 border border-slate-500 text-white px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-medium transition">
                    Add Card
                  </button>
                </div>
              )}

              {paymentMethods.length > 0 ? (
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between p-4 bg-slate-700 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">💳</div>
                        <div>
                          <p className="font-medium text-white capitalize">
                            {method.card.brand} ending in {method.card.last4}
                          </p>
                          <p className="text-slate-400 text-sm">
                            Expires {method.card.expMonth}/{method.card.expYear}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {method.isDefault && (
                          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                            Default
                          </span>
                        )}
                        <button className="text-red-400 hover:text-red-300 transition">
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">No payment methods added yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingDashboard;
