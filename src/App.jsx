import { useState, useEffect } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import DecisionTree from './components/DecisionTree'
import RecommendationView from './components/RecommendationView'
import FavoritesView from './components/FavoritesView'
import TeamDashboard from './components/TeamDashboard'
import KanbanBoard from './components/KanbanBoard'
import TeamChat from './components/TeamChat'
import CodeReview from './components/CodeReview'
import { matchProjects } from './utils/projectMatcher'
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
  const [teamMembers] = useState([
    { id: 'member_1', name: 'Alice Johnson', role: 'lead' },
    { id: 'member_2', name: 'Bob Smith', role: 'member' },
    { id: 'member_3', name: 'Charlie Brown', role: 'member' }
  ])

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
    if (currentStep === 'questions') {
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
              Built with React + Vite + TailwindCSS • v3.0 Team Features
            </p>
            <p>
              Find your perfect summer project and build something amazing.
            </p>
          </div>
        </footer>

        {/* Team Feature Modals */}
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
