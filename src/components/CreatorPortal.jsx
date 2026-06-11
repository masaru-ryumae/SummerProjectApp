import { useState } from 'react';
import { creatorService } from '../services/marketplaceService';

export default function CreatorPortal() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [topCreators, setTopCreators] = useState(creatorService.getTopCreators(10));
  const [uploadData, setUploadData] = useState({
    title: '',
    category: '',
    price: 0,
    description: ''
  });
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    cardHolder: '',
    cardNumber: ''
  });
  const [uploadStatus, setUploadStatus] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const categories = [
    'Electronics', 'CS/Web', 'Mobile', 'AI/ML', 'Web',
    'Blockchain', 'Game Dev', 'Data Science'
  ];

  const mockCreatorStats = {
    id: 'creator-current',
    name: 'Your Portfolio',
    totalEarnings: 2450,
    totalDownloads: 1850,
    templates: 5,
    tutorials: 3,
    rating: 4.7,
    followers: 185
  };

  const mockRevenue = [
    { month: 'Jan', earnings: 150 },
    { month: 'Feb', earnings: 280 },
    { month: 'Mar', earnings: 195 },
    { month: 'Apr', earnings: 420 },
    { month: 'May', earnings: 580 },
    { month: 'Jun', earnings: 825 }
  ];

  const handleUploadTemplate = async (e) => {
    e.preventDefault();
    setUploadStatus('uploading');

    try {
      const result = await creatorService.uploadTemplate({
        ...uploadData,
        creatorId: 'creator-current'
      });
      setUploadStatus('success');
      setUploadData({ title: '', category: '', price: 0, description: '' });
      setTimeout(() => setUploadStatus(null), 2000);
    } catch (error) {
      setUploadStatus('error');
    }
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setPaymentStatus('processing');

    try {
      const result = await creatorService.processPayment(
        paymentData.amount,
        mockCreatorStats.id
      );
      setPaymentStatus('success');
      setPaymentData({ amount: 0, cardHolder: '', cardNumber: '' });
      setTimeout(() => setPaymentStatus(null), 2000);
    } catch (error) {
      setPaymentStatus('error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-900 dark:to-pink-900 rounded-lg p-8 text-white">
        <h1 className="text-4xl font-bold mb-2">👨‍💻 Creator Program</h1>
        <p className="text-purple-100 mb-6">
          Share your knowledge and earn 30% royalties on every download
        </p>

        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-purple-400/30">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'dashboard'
                ? 'border-white text-white'
                : 'border-transparent text-purple-100 hover:text-white'
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-white text-white'
                : 'border-transparent text-purple-100 hover:text-white'
            }`}
          >
            📦 Upload
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'payments'
                ? 'border-white text-white'
                : 'border-transparent text-purple-100 hover:text-white'
            }`}
          >
            💰 Payments
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'leaderboard'
                ? 'border-white text-white'
                : 'border-transparent text-purple-100 hover:text-white'
            }`}
          >
            🏆 Leaderboard
          </button>
        </div>
      </section>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <section className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Earnings</div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                ${mockCreatorStats.totalEarnings}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                +15% this month
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Downloads</div>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {mockCreatorStats.totalDownloads.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                +320 this month
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Content Created</div>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {mockCreatorStats.templates + mockCreatorStats.tutorials}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                {mockCreatorStats.templates} templates + {mockCreatorStats.tutorials} tutorials
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Rating</div>
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {mockCreatorStats.rating} ⭐
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                {mockCreatorStats.followers} followers
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-6">💹 Monthly Revenue</h3>
            <div className="flex items-end justify-center gap-2 h-64">
              {mockRevenue.map((data) => (
                <div key={data.month} className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all hover:from-green-600 hover:to-green-500"
                    style={{
                      height: `${(data.earnings / 825) * 100}%`,
                      minHeight: '8px'
                    }}
                    title={`$${data.earnings}`}
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">{data.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Content Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">📈 Top Performing Items</h3>
            <div className="space-y-4">
              {[
                { title: 'React Native Mobile App Boilerplate', downloads: 1840, earnings: 110 },
                { title: 'E-commerce Store with Stripe', downloads: 1100, earnings: 83 },
                { title: 'Data Visualization Dashboard', downloads: 1450, earnings: 104 }
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{item.title}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {item.downloads} downloads
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600 dark:text-green-400">
                      ${item.earnings}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">earned</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <section className="max-w-2xl">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              📦 Upload New Template
            </h2>

            <form onSubmit={handleUploadTemplate} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  placeholder="e.g., Advanced Node.js API Framework"
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={uploadData.category}
                  onChange={(e) => setUploadData({ ...uploadData, category: e.target.value })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Select a category...</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price (USD)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={uploadData.price}
                  onChange={(e) => setUploadData({ ...uploadData, price: parseFloat(e.target.value) })}
                  placeholder="0"
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  You'll earn 30% royalty on each download
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                  placeholder="Describe your template in detail..."
                  rows="4"
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  💡 Templates are reviewed within 24 hours. Once approved, they'll be visible to millions of builders!
                </p>
              </div>

              <button
                type="submit"
                disabled={uploadStatus === 'uploading'}
                className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                  uploadStatus === 'success'
                    ? 'bg-green-600 text-white'
                    : uploadStatus === 'uploading'
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {uploadStatus === 'uploading'
                  ? '⏳ Uploading...'
                  : uploadStatus === 'success'
                  ? '✓ Uploaded! Pending Review'
                  : '📤 Upload Template'}
              </button>
            </form>
          </div>
        </section>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <section className="max-w-2xl">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              💰 Withdraw Earnings
            </h2>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 mb-8 border border-green-200 dark:border-green-800/50">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Available Balance</div>
              <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                ${mockCreatorStats.totalEarnings}
              </div>
            </div>

            <form onSubmit={handleProcessPayment} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Withdrawal Amount
                </label>
                <input
                  type="number"
                  min="50"
                  max={mockCreatorStats.totalEarnings}
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) })}
                  placeholder="Minimum $50"
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Minimum withdrawal: $50. Funds arrive in 3-5 business days.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={paymentData.cardHolder}
                  onChange={(e) => setPaymentData({ ...paymentData, cardHolder: e.target.value })}
                  placeholder="Your full name"
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Card Number (Mock - Stripe Integration)
                </label>
                <input
                  type="text"
                  value={paymentData.cardNumber}
                  onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                  placeholder="4242 4242 4242 4242"
                  maxLength="19"
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-900 dark:text-yellow-100">
                  ⚠️ This is a mock payment system. In production, this would use Stripe Connect for secure payments.
                </p>
              </div>

              <button
                type="submit"
                disabled={paymentStatus === 'processing' || paymentData.amount === 0}
                className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                  paymentStatus === 'success'
                    ? 'bg-green-600 text-white'
                    : paymentStatus === 'processing'
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {paymentStatus === 'processing'
                  ? '⏳ Processing...'
                  : paymentStatus === 'success'
                  ? '✓ Withdrawal Initiated!'
                  : '💳 Request Payout'}
              </button>
            </form>
          </div>
        </section>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <section>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              🏆 Top Creators Leaderboard
            </h2>

            <div className="space-y-3">
              {topCreators.map((creator, idx) => (
                <div
                  key={creator.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                    idx === 0
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                      : idx === 1
                      ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                      : idx === 2
                      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                      : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="text-2xl font-bold w-8 text-center">
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                  </div>

                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-12 h-12 rounded-full"
                  />

                  <div className="flex-1">
                    <div className="font-bold text-gray-900 dark:text-white">
                      {creator.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {creator.templates} templates • {creator.rating}⭐
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-green-600 dark:text-green-400">
                      ${creator.totalEarnings.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {creator.followers} followers
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                You're 9th on the Leaderboard! 🎉
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You're doing great! Upload 2 more high-quality templates and you'll reach the top 5. Keep up the amazing work!
              </p>
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
                Upload Next Template
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
