import React, { useState } from 'react'
import TutorialBuilder from './TutorialBuilder'
import DocGenerator from './DocGenerator'
import ContentPortal from './ContentPortal'
import CommunityContent from './CommunityContent'

const ContentStudio = ({ onBack }) => {
  const [activeModule, setActiveModule] = useState(null)

  const modules = [
    {
      id: 'tutorials',
      name: 'Tutorial Builder',
      emoji: '📚',
      description: 'Create interactive step-by-step tutorials with code blocks, videos, and quizzes',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 'docs',
      name: 'Documentation Generator',
      emoji: '📖',
      description: 'Auto-generate API docs, architecture guides, and deployment instructions',
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'cms',
      name: 'Content Portal',
      emoji: '📋',
      description: 'Manage content with workflow, versioning, scheduling, and analytics',
      color: 'from-indigo-500 to-purple-600'
    },
    {
      id: 'community',
      name: 'Community Content',
      emoji: '👥',
      description: 'User submissions, review queue, rewards system, and contributor leaderboard',
      color: 'from-pink-500 to-rose-600'
    }
  ]

  if (activeModule === 'tutorials') {
    return <TutorialBuilder onBack={() => setActiveModule(null)} />
  }

  if (activeModule === 'docs') {
    return <DocGenerator onBack={() => setActiveModule(null)} />
  }

  if (activeModule === 'cms') {
    return <ContentPortal onBack={() => setActiveModule(null)} />
  }

  if (activeModule === 'community') {
    return <CommunityContent onBack={() => setActiveModule(null)} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-950 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                🎨 Content Studio
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Complete content management platform for tutorials, documentation, publishing, and community
              </p>
            </div>
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 font-bold transition-colors"
            >
              ← Back to Finder
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
              <p className="text-3xl mb-2">📚</p>
              <p className="font-semibold text-gray-900 dark:text-white">4 Systems</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Complete content ecosystem</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
              <p className="text-3xl mb-2">🎯</p>
              <p className="font-semibold text-gray-900 dark:text-white">Workflow</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Draft → Review → Publish</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
              <p className="text-3xl mb-2">📊</p>
              <p className="font-semibold text-gray-900 dark:text-white">Analytics</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Track engagement & views</p>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
              <p className="text-3xl mb-2">🏆</p>
              <p className="font-semibold text-gray-900 dark:text-white">Community</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Rewards & recognition</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {modules.map((module) => (
            <div
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              className="group relative rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer h-80"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${module.color} opacity-90 group-hover:opacity-100 transition-opacity duration-300`} />

              <div className="relative h-full flex flex-col justify-between p-8 text-white">
                <div>
                  <div className="text-5xl mb-4">
                    {module.emoji}
                  </div>
                  <h2 className="text-3xl font-bold mb-3">
                    {module.name}
                  </h2>
                  <p className="text-lg opacity-95 leading-relaxed">
                    {module.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-2 font-semibold group-hover:translate-x-2 transition-transform">
                  Open Studio →
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-12 border border-gray-200 dark:border-gray-800">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Why Content Studio?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🎯</span> All-in-One Platform
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Create tutorials, generate documentation, manage content publishing, and engage with your
                community—all in one unified platform.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🚀</span> Production-Ready
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Built with modern best practices including TypeScript services, SEO optimization, version
                control, workflow management, and comprehensive analytics.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">👥</span> Community Engagement
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Empower your community with a robust submission system, reward system with points and badges,
                contributor recognition, and a competitive leaderboard.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">📊</span> Deep Insights
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Track every piece of content with detailed analytics including views, engagement rates,
                traffic sources, and contributor statistics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContentStudio
