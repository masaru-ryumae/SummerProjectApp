import { useState } from 'react'
import FavoriteButton from './FavoriteButton'
import ShareButton from './ShareButton'
import ProgressTracker from './ProgressTracker'
import RatingStars from './RatingStars'
import ReviewList from './ReviewList'

const ProjectCard = ({ project, showExplanation = true, whyMatch = '' }) => {
  const [showProgress, setShowProgress] = useState(false)
  if (!project) return null

  const skillLevelColor = {
    Beginner: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    Intermediate: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    Advanced: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
  }

  const categoryColor = {
    CS: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200',
    Electronics: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    Physics: 'bg-cyan-100 dark:bg-cyan-900 text-cyan-800 dark:text-cyan-200',
    Robotics: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    'Web/App': 'bg-pink-100 dark:bg-pink-900 text-pink-800 dark:text-pink-200',
    Mixed: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg dark:hover:shadow-2xl transition-shadow duration-200">
      {/* Card Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {project.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              {project.description}
            </p>
          </div>
          <div className="flex gap-2">
            <FavoriteButton project={project} />
            <ShareButton project={project} />
          </div>
        </div>

        {/* Ratings Section */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <RatingStars project={project} />
        </div>
      </div>

      {/* Tags Row */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 flex flex-wrap gap-2">
        {/* Category */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            categoryColor[project.category] || categoryColor.Mixed
          }`}
        >
          {project.category}
        </span>

        {/* Skill Level */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            skillLevelColor[project.skillLevel] || skillLevelColor.Intermediate
          }`}
        >
          {project.skillLevel}
        </span>

        {/* Budget */}
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
          ${project.budget}
        </span>

        {/* Time */}
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 dark:bg-violet-900 text-violet-800 dark:text-violet-200">
          {project.timeWeeks} weeks
        </span>
      </div>

      {/* Card Body */}
      <div className="p-6">
        <div className="space-y-4">
          {/* Why This Match */}
          {showExplanation && whyMatch && (
            <div className="bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded p-4">
              <p className="text-purple-900 dark:text-purple-200 text-sm font-medium">
                ✨ Why this matches: {whyMatch}
              </p>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 py-2">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">
                Budget
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${project.budget}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">
                Timeline
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {project.timeWeeks}w
              </p>
            </div>
          </div>

          {/* Resource Link */}
          {project.resourceUrl && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <a
                href={project.resourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium text-sm transition-colors"
              >
                <span>📚 View Tutorial/Docs</span>
                <span className="ml-2">→</span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Progress Tracker */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setShowProgress(!showProgress)}
          className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
        >
          {showProgress ? '✓ Hide Progress' : '📊 Track Progress'}
        </button>
        {showProgress && <ProgressTracker project={project} className="mt-4" />}
      </div>

      {/* Reviews Section */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Community Reviews</h4>
        <ReviewList project={project} />
      </div>

      {/* Footer CTA */}
      <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-t border-gray-200 dark:border-gray-800">
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
          Ready to dive in? Have all the details you need?
        </p>
        <button className="w-full px-4 py-2 bg-purple-600 dark:bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors text-sm">
          Start This Project
        </button>
      </div>
    </div>
  )
}

export default ProjectCard
