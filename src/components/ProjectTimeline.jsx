import { useState } from 'react'
import { formatDate } from '../utils/progressStorage'

const ProjectTimeline = ({ progress }) => {
  const [sortNewestFirst, setSortNewestFirst] = useState(true)

  if (!progress || !progress.timeline || progress.timeline.length === 0) {
    return null
  }

  // Sort timeline
  let sortedEvents = [...progress.timeline]
  if (sortNewestFirst) {
    sortedEvents.reverse()
  }

  // Event icon mapping
  const getEventIcon = (event) => {
    const iconMap = {
      started: '🚀',
      note: '📝',
      milestone: '✅',
      favorite: '⭐',
      shared: '🔗',
      default: '•'
    }
    return iconMap[event] || iconMap.default
  }

  return (
    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide">
          Timeline
        </h3>
        <button
          onClick={() => setSortNewestFirst(!sortNewestFirst)}
          className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
        >
          {sortNewestFirst ? 'Oldest First' : 'Newest First'}
        </button>
      </div>

      {/* Timeline Events */}
      <div className="space-y-4">
        {sortedEvents.map((event, index) => (
          <div
            key={index}
            className="flex gap-4 relative"
          >
            {/* Timeline connector line */}
            {index < sortedEvents.length - 1 && (
              <div className="absolute left-6 top-12 w-0.5 h-6 bg-gradient-to-b from-purple-300 to-gray-300 dark:from-purple-700 dark:to-gray-600"></div>
            )}

            {/* Event icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-lg border-2 border-white dark:border-gray-800 relative z-10">
                {getEventIcon(event.event)}
              </div>
            </div>

            {/* Event content */}
            <div className="flex-1 pt-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {event.description}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formatDate(event.date)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Event count */}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        {sortedEvents.length} event{sortedEvents.length !== 1 ? 's' : ''} in timeline
      </p>
    </div>
  )
}

export default ProjectTimeline
