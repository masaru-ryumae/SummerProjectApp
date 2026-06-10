import { useState, useEffect } from 'react'
import { AppProvider } from './context/AppContext'
import DecisionTree from './components/DecisionTree'
import RecommendationView from './components/RecommendationView'
import { matchProjects } from './utils/projectMatcher'
import projectsData from './data/projects.json'
import './App.css'

function App() {
  // State management
  const [currentStep, setCurrentStep] = useState('questions') // 'questions' or 'results'
  const [answers, setAnswers] = useState(null)
  const [topProjects, setTopProjects] = useState([])

  // Initialize dark mode from system preference
  const [darkMode, setDarkMode] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Handle dark mode toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Handle quiz completion
  const handleGenerateRecommendations = (userAnswers) => {
    setAnswers(userAnswers)

    // Call the project matcher
    const matchResult = matchProjects(userAnswers, projectsData)
    // Extract topProjects - the matcher returns { topProjects, explanations, noMatchWarning }
    const projects = Array.isArray(matchResult) ? matchResult : (matchResult.topProjects || [])
    setTopProjects(projects)

    // Move to results step
    setCurrentStep('results')
  }

  // Handle "try again" - go back to questions
  const handleTryAgain = () => {
    setCurrentStep('questions')
    setAnswers(null)
    setTopProjects([])
  }

  // Render based on current step
  const renderContent = () => {
    if (currentStep === 'questions') {
      return (
        <DecisionTree onGenerate={handleGenerateRecommendations} />
      )
    } else {
      return (
        <div>
          <RecommendationView
            answers={answers}
            topProjects={topProjects}
            onTryAgain={handleTryAgain}
          />
        </div>
      )
    }
  }

  return (
    <AppProvider>
      <div className={darkMode ? 'dark' : ''}>
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-200">
        {/* Header with Dark Mode Toggle */}
        <header className="sticky top-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            {/* Logo/Title */}
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Summer Project Finder
              </h1>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <span className="text-xl">☀️</span>
              ) : (
                <span className="text-xl">🌙</span>
              )}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow">
          {renderContent()}
        </main>

        {/* Footer */}
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
    </AppProvider>
  )
}

export default App
