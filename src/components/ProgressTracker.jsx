import { useState } from 'react'
import {
  calculatePercentage,
  getAllMilestones,
  updateMilestone,
  getTimeElapsed,
} from '../utils/progressStorage'

const ProgressTracker = ({ projectId, progress, onProgressUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!progress) return null

  const milestones = getAllMilestones()
  const percentComplete = calculatePercentage(progress.milestones)
  const lastUpdated = getTimeElapsed(progress.lastUpdated)

  const handleMilestoneToggle = (index) => {
    const newMilestones = [...progress.milestones]
    newMilestones[index] = !newMilestones[index]

    const updatedProgress = updateMilestone(
      { [projectId]: progress },
      projectId,
      index,
      newMilestones[index]
    )

    if (onProgressUpdate) {
      onProgressUpdate(projectId, updatedProgress)
    }
  }

  const completedCount = progress.milestones.filter(m => m === true).length

  return (
    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
      {/* Progress Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide">
            Progress
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
          >
            {isExpanded ? '▼ Hide' : '▶ Show'} Details
          </button>
        </div>

        {/* Progress Stat */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          <span className="font-semibold text-gray-900 dark:text-white">
            {completedCount}/{milestones.length}
          </span>
          {' '}milestones completed
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
            style={{ width: `${percentComplete}%` }}
          ></div>
        </div>

        {/* Percentage Display */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
          {percentComplete}% complete
        </p>
      </div>

      {/* Last Updated */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
        Last updated {lastUpdated}
      </p>

      {/* Expandable Checklist */}
      {isExpanded && (
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          {milestones.map((milestone, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group cursor-pointer"
              onClick={() => handleMilestoneToggle(index)}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={progress.milestones[index] || false}
                onChange={() => handleMilestoneToggle(index)}
                className="mt-1 w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-purple-600 dark:text-purple-500 cursor-pointer focus:ring-2 focus:ring-purple-500"
              />

              {/* Milestone Text */}
              <span
                className={`text-sm transition-colors flex-1 ${
                  progress.milestones[index]
                    ? 'text-gray-500 dark:text-gray-500 line-through'
                    : 'text-gray-900 dark:text-gray-100'
                }`}
              >
                {milestone}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Summary at a glance when collapsed */}
      {!isExpanded && (
        <div className="flex gap-1">
          {milestones.map((_, index) => (
            <div
              key={index}
              className={`flex-1 h-1 rounded-full ${
                progress.milestones[index]
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                  : 'bg-gray-300 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default ProgressTracker
