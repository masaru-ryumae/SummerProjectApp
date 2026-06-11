import { useState, useEffect } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import DecisionTree from './components/DecisionTree'
import RecommendationView from './components/RecommendationView'
import FavoritesView from './components/FavoritesView'
import { EnterpriseAdmin } from './components/EnterpriseAdmin'
import { matchProjects } from './utils/projectMatcher'
import projectsData from './data/projects.json'
import './App.css'

function AppContent() {
  const [currentStep, setCurrentStep] = useState('questions')
  const [showEnterpriseAdmin, setShowEnterpriseAdmin] = useState(false)
  const [answers, setAnswers] = useState(null)
  const [topProjects, setTopProjects] = useState([])
  const { favorites } = useApp()

  const [darkMode, setDarkMode] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const handleGenerateRecommendations = (userAnswers) => {
    setAnswers(userAnswers)
    const matchResult = matchProjects(userAnswers, projectsData)
    const projects = Array.isArray(matchResult) ? matchResult : (matchResult.topProjects || [])
    setTopProjects(projects)
    setCurrentStep('results')
  }

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
    if (showDeveloperPortal) {
      return <DeveloperPortal />
    } else if (showEnterpriseAdmin) {
      return <EnterpriseAdmin organizationId="org_summer_projects" />
    } else if (currentStep === 'questions') {
      return <DecisionTree onGenerate={handleGenerateRecommendations} />
    } else if (currentStep === 'results') {
      return (
        <RecommendationView
          answers={answers}
          topProjects={topProjects}
          onTryAgain={handleTryAgain}
        />
      )
    } else if (currentStep === 'favorites') {
      return <FavoritesView onBack={handleBackFromFavorites} />
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

            <div className="flex items-center gap-4">
              {showEnterpriseAdmin && (
                <button
                  onClick={() => setShowEnterpriseAdmin(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium transition-colors"
                >
                  ← Back to Project Finder
                </button>
              )}

              {!showEnterpriseAdmin && (
                <>
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
                    onClick={() => setShowEnterpriseAdmin(true)}
                    className="px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 font-medium transition-colors flex items-center gap-2"
                    title="Enterprise Admin Dashboard"
                  >
                    <span>🏢</span>
                    <span className="hidden sm:inline">Admin</span>
                  </button>
                </>
              )}

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
              Built with React + Vite + TailwindCSS
            </p>
            <p>
              Find your perfect summer project and build something amazing.
            </p>
          </div>
        </footer>
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
