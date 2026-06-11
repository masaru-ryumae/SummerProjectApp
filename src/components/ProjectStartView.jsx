import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

const ProjectStartView = ({ project, onBack }) => {
  const { currentUser } = useApp()
  const [completedSteps, setCompletedSteps] = useState([])
  const [notes, setNotes] = useState({})

  // Load progress on mount
  useEffect(() => {
    if (!project || !currentUser) return
    const saved = localStorage.getItem(`projectProgress_${currentUser.id}_${project.id}`)
    if (saved) {
      try {
        const data = JSON.parse(saved)
        setCompletedSteps(data.completedSteps || [])
        setNotes(data.notes || {})
      } catch (e) {
        console.warn('Failed to load project progress', e)
      }
    }
  }, [project?.id, currentUser?.id])

  if (!project || !currentUser) return null

  const handleToggleStep = (stepIndex) => {
    const newSteps = completedSteps.includes(stepIndex)
      ? completedSteps.filter(i => i !== stepIndex)
      : [...completedSteps, stepIndex]
    setCompletedSteps(newSteps)
    saveProgress(newSteps, notes)
  }

  const handleAddNote = (stepIndex, noteText) => {
    const newNotes = { ...notes, [stepIndex]: noteText }
    setNotes(newNotes)
    saveProgress(completedSteps, newNotes)
  }

  const saveProgress = (steps, notesData) => {
    const data = {
      completedSteps: steps,
      notes: notesData,
      lastUpdated: new Date().toISOString()
    }
    localStorage.setItem(`projectProgress_${currentUser.id}_${project.id}`, JSON.stringify(data))
  }

  const steps = project.steps || []
  const progressPercent = steps.length > 0 ? Math.round((completedSteps.length / steps.length) * 100) : 0

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium mb-3 flex items-center gap-2"
          >
            ← Back to Results
          </button>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {project.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {project.description}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Overview */}
        <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
            Your Progress
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="bg-purple-600 dark:bg-purple-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {progressPercent}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {completedSteps.length} of {steps.length} steps
              </p>
            </div>
          </div>
        </div>

        {/* Steps Checklist */}
        {steps.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Project Steps
            </h2>
            <div className="space-y-3">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={completedSteps.includes(idx)}
                      onChange={() => handleToggleStep(idx)}
                      className="mt-1 w-5 h-5 text-purple-600 rounded cursor-pointer"
                    />
                    <div className="flex-1">
                      <p className={`font-medium ${completedSteps.includes(idx) ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                        {step}
                      </p>
                      <textarea
                        placeholder="Add notes for this step..."
                        value={notes[idx] || ''}
                        onChange={(e) => handleAddNote(idx, e.target.value)}
                        className="mt-2 w-full p-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-sm resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows="2"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Project Details Summary */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Project Details
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">
                Budget
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${project.budget}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">
                Timeline
              </p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {project.timeWeeks}w
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">
                Difficulty
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {project.skillLevel}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">
                Category
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {project.category}
              </p>
            </div>
          </div>
        </div>

        {/* Resources */}
        {project.resourceUrl && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Resources
            </h2>
            <a
              href={project.resourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg hover:shadow-md transition-shadow"
            >
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">
                📚 Tutorial Link
              </p>
              <p className="text-purple-700 dark:text-purple-300 break-all text-sm font-mono">
                {project.resourceUrl}
              </p>
            </a>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex gap-4">
          <button
            onClick={onBack}
            className="flex-1 px-6 py-3 bg-purple-600 dark:bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
          >
            Start a Different Project
          </button>
        </div>
      </main>
    </div>
  )
}

export default ProjectStartView
