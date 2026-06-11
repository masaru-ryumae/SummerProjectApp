import ShareButton from './ShareButton'

const ProjectDetailModal = ({ project, isOpen, onClose }) => {
  if (!isOpen || !project) return null

  const skillLevelColor = {
    beginner: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
    intermediate: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
    advanced: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30'
  }

  const categoryColor = {
    CS: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30',
    'Web/App': 'text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/30',
    Electronics: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30',
    Physics: 'text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/30',
    Robotics: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
    Mixed: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30'
  }

  const getDifficultyLabel = (difficulty) => {
    return difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div
          className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 sticky top-0 z-10">
            <div className="flex-1 pr-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {project.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {project.description}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(100vh-200px)] p-6 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">
                  Category
                </p>
                <p className={`font-bold ${categoryColor[project.category] || categoryColor.Mixed}`}>
                  {project.category}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">
                  Difficulty
                </p>
                <p className={`font-bold ${skillLevelColor[project.difficulty] || skillLevelColor.intermediate}`}>
                  {getDifficultyLabel(project.difficulty)}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">
                  Budget
                </p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  ${project.budget}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">
                  Timeline
                </p>
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {project.timeWeeks}w
                </p>
              </div>
            </div>

            {/* Why It's Great */}
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                💡 Why it's great
              </p>
              <p className="text-blue-800 dark:text-blue-300">
                {project.whyGreat}
              </p>
            </div>

            {/* Time Commitment */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span>⏱️</span> Time Commitment
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">
                    Duration
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {project.timeWeeks} weeks
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">
                    Per Week
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {project.timePerWeek}
                  </p>
                </div>
              </div>
            </div>

            {/* Budget Breakdown */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span>💰</span> Budget
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-2">
                  Total Cost
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                  ${project.budget}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {project.budgetRange}
                </p>
              </div>
            </div>

            {/* Required Skills */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span>🛠️</span> Required Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.requiredSkills && project.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Parts Needed */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span>📦</span> Parts Needed
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                {project.partsNeeded && project.partsNeeded.map((part) => (
                  <div key={part} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <span className="text-purple-600 dark:text-purple-400 font-bold mt-0.5">•</span>
                    <span>{part}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span>ℹ️</span> Additional Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">
                    Location
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {Array.isArray(project.location)
                      ? project.location.join(', ')
                      : project.location}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">
                    Team Size
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {project.teamSize}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">
                    Indoor/Outdoor
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {project.indoor && project.outdoor ? 'Both' : project.indoor ? 'Indoor' : 'Outdoor'}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">
                    Interests
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {Array.isArray(project.interests)
                      ? project.interests.slice(0, 2).join(', ')
                      : project.interests}
                  </p>
                </div>
              </div>
            </div>

            {/* Tutorial Link */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span>📚</span> Resources & Tutorial
              </h3>
              {project.tutorialLink && (
                <a
                  href={project.tutorialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg hover:shadow-md transition-shadow"
                >
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">
                    Official Tutorial Link
                  </p>
                  <p className="text-purple-700 dark:text-purple-300 break-all text-sm font-mono">
                    {project.tutorialLink}
                  </p>
                </a>
              )}
            </div>

            {/* Print-friendly styles */}
            <style>{`
              @media print {
                .modal-backdrop { display: none; }
                .modal-close { display: none; }
                .modal-header { position: static; }
                body { background: white; }
              }
            `}</style>
          </div>

          {/* Footer with Actions */}
          <div className="flex items-center justify-between gap-4 p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 sticky bottom-0 z-10">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
            <div className="flex gap-2">
              <ShareButton project={project} />
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold text-sm transition-colors"
                title="Print this project details"
              >
                <span>🖨️</span>
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProjectDetailModal
