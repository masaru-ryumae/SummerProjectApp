import { useState, useEffect, useCallback } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import ErrorBoundary from './components/ErrorBoundary'
import DecisionTree from './components/DecisionTree'
import RecommendationView from './components/RecommendationView'
import FavoritesView from './components/FavoritesView'
import TeamDashboard from './components/TeamDashboard'
import KanbanBoard from './components/KanbanBoard'
import TeamChat from './components/TeamChat'
import CodeReview from './components/CodeReview'
import PricingPage from './components/PricingPage'
import BillingDashboard from './components/BillingDashboard'
import SubscriptionManager from './components/SubscriptionManager'
import { matchProjects } from './utils/projectMatcher'
import { billingService } from './services/billingService'
import projectsData from './data/projects.json'
import './App.css'

function AppContent() {
  const [currentStep, setCurrentStep] = useState('questions')
  const [answers, setAnswers] = useState(null)
  const [topProjects, setTopProjects] = useState([])
  const { favorites } = useApp()
  const [showTeamDashboard, setShowTeamDashboard] = useState(false)
  const [showKanban, setShowKanban] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showCodeReview, setShowCodeReview] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [billingError, setBillingError] = useState(null)
  const [isLoadingBilling, setIsLoadingBilling] = useState(true)
  const [userId] = useState('user_demo_123')
  const [teamMembers] = useState([
    { id: 'member_1', name: 'Alice Johnson', role: 'lead' },
    { id: 'member_2', name: 'Bob Smith', role: 'member' },
    { id: 'member_3', name: 'Charlie Brown', role: 'member' }
  ])

  const [darkMode, setDarkMode] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Defect #9 Fix: Proper async error handling with try/catch and cleanup
  const isMountedRef = { current: true }

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    const initBilling = async () => {
      try {
        setIsLoadingBilling(true)
        setBillingError(null)

        const profile = await billingService.getUserBillingProfile(userId)

        if (!isMountedRef.current) return

        if (!profile) {
          const newProfile = await billingService.initializeUserBilling(
            userId,
            'demo@example.com',
            'Demo User'
          )

          if (!isMountedRef.current) return

          if (!newProfile || !newProfile.id) {
            throw new Error('Failed to initialize billing profile')
          }

          setUserProfile(newProfile)
        } else {
          setUserProfile(profile)
        }
      } catch (error) {
        console.error('Billing initialization error:', error)
        if (isMountedRef.current) {
          setBillingError('Failed to initialize billing: ' + error.message)
          setUserProfile(null)
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoadingBilling(false)
        }
      }
    }

    initBilling()
  }, [userId, billingService])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Defect #13 Fix: Validate input before processing
  const handleGenerateRecommendations = useCallback((userAnswers) => {
    try {
      // Validate input
      if (!userAnswers || typeof userAnswers !== 'object') {
        throw new Error('Invalid user answers provided');
      }

      setAnswers(userAnswers)
      const matchResult = matchProjects(userAnswers, projectsData)

      // Validate result
      let projects = []
      if (Array.isArray(matchResult)) {
        projects = matchResult
      } else if (matchResult && Array.isArray(matchResult.topProjects)) {
        projects = matchResult.topProjects
      } else if (matchResult === null || matchResult === undefined) {
        console.warn('matchProjects returned null/undefined')
        projects = []
      }

      setTopProjects(projects)
      setCurrentStep('results')
    } catch (error) {
      console.error('Failed to generate recommendations:', error)
      alert('Failed to generate recommendations: ' + error.message)
    }
  }, [])

  const handleTryAgain = () => {
    setCurrentStep('questions')
    setAnswers(null)
    setTopProjects([])
  }

  const handleViewFavorites = () => {
    setCurrentStep('favorites')
  }

  const handleBackFromFavorites = () => {
    setCurrentStep('questions')
  }

  const renderContent = () => {
    // Defect #12 Fix: Wrap all components in ErrorBoundary
    if (currentStep === 'questions') {
      return (
        <ErrorBoundary>
          <DecisionTree onGenerate={handleGenerateRecommendations} />
        </ErrorBoundary>
      )
    } else if (currentStep === 'results') {
      return (
        <ErrorBoundary>
          <RecommendationView
            answers={answers}
            topProjects={topProjects}
            onTryAgain={handleTryAgain}
          />
        </ErrorBoundary>
      )
    } else if (currentStep === 'favorites') {
      return (
        <ErrorBoundary>
          <FavoritesView onBack={handleBackFromFavorites} />
        </ErrorBoundary>
      )
    } else if (currentStep === 'pricing') {
      return (
        <PricingPage
          userId={userId}
          currentTier={userProfile?.tier || 'free'}
          onUpgrade={(tier) => {
            setCurrentStep('questions')
          }}
        />
      )
    } else if (currentStep === 'billing') {
      return (
        <BillingDashboard
          userId={userId}
          onNavigate={(page, data) => {
            setCurrentStep(page)
          }}
        />
      )
    } else if (currentStep === 'subscription') {
      return (
        <SubscriptionManager
          userId={userId}
          onComplete={(tier) => {
            setCurrentStep('questions')
          }}
        />
      )
    }
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-200">
        <header className="sticky top-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Summer Project Finder
              </h1>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowTeamDashboard(true)}
                className="px-3 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 font-medium transition-colors text-sm"
              >
                👥 Teams
              </button>

              <button
                onClick={() => {
                  if (selectedTeamId) setShowKanban(true)
                  else alert('Please create/select a team first')
                }}
                className="px-3 py-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-200 dark:hover:bg-cyan-900/50 font-medium transition-colors text-sm"
              >
                📊 Board
              </button>

              <button
                onClick={() => {
                  if (selectedTeamId) setShowChat(true)
                  else alert('Please create/select a team first')
                }}
                className="px-3 py-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50 font-medium transition-colors text-sm"
              >
                💬 Chat
              </button>

              <button
                onClick={() => {
                  if (selectedTeamId) setShowCodeReview(true)
                  else alert('Please create/select a team first')
                }}
                className="px-3 py-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 font-medium transition-colors text-sm"
              >
                👁️ Review
              </button>

              <button
                onClick={handleViewFavorites}
                className="relative px-4 py-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 font-medium transition-colors flex items-center gap-2"
              >
                <span>⭐</span>
                <span className="hidden sm:inline">Saved</span>
                {favorites.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 bg-purple-600 dark:bg-purple-500 text-white text-xs font-bold rounded-full">
                    {favorites.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setCurrentStep('pricing')}
                className="hidden md:flex px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 font-medium transition-colors items-center gap-2 text-sm"
              >
                <span>💎</span>
                <span>Pricing</span>
              </button>

              <button
                onClick={() => setCurrentStep('billing')}
                className="px-3 sm:px-4 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 font-medium transition-colors flex items-center gap-2 text-sm"
              >
                <span>💳</span>
                <span className="hidden sm:inline text-xs">
                  {userProfile?.tier || 'free'}
                </span>
              </button>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <span className="text-xl">☀️</span> : <span className="text-xl">🌙</span>}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-grow">
          {renderContent()}
        </main>

        <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8 px-4">
          <div className="max-w-7xl mx-auto text-center text-gray-600 dark:text-gray-400 text-sm">
            <p className="mb-2">
              Built with React + Vite + TailwindCSS • v3.0 (Team Features + Monetization)
            </p>
            <p>
              Find your perfect summer project and build something amazing.
            </p>
          </div>
        </footer>

        {/* Team & Collaboration Modals */}
        {showTeamDashboard && (
          <TeamDashboard
            onSelectTeam={(team) => setSelectedTeamId(team.id)}
            onClose={() => setShowTeamDashboard(false)}
          />
        )}

        {showKanban && selectedTeamId && (
          <KanbanBoard teamId={selectedTeamId} onClose={() => setShowKanban(false)} />
        )}

        {showChat && selectedTeamId && (
          <TeamChat
            teamId={selectedTeamId}
            teamMembers={teamMembers}
            onClose={() => setShowChat(false)}
          />
        )}

        {showCodeReview && selectedTeamId && (
          <CodeReview
            teamId={selectedTeamId}
            projectId="project_demo"
            teamMembers={teamMembers}
            onClose={() => setShowCodeReview(false)}
          />
        )}
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
