import { useState } from 'react'
import { getTimeElapsed } from '../utils/progressStorage'

const ProjectNotes = ({ projectId, progress, onNoteUpdate }) => {
  // Use the current progress notes directly, with local state for editing
  const progressNotes = progress?.notes || ''
  const [notes, setNotes] = useState(progressNotes)
  const [isSaved, setIsSaved] = useState(true)

  // When progress changes from external source, update local state
  if (progressNotes !== notes && isSaved) {
    setNotes(progressNotes)
  }

  const characterCount = notes.length
  const characterLimit = 500
  const remainingChars = characterLimit - characterCount
  const isAtLimit = characterCount >= characterLimit

  const handleNoteChange = (e) => {
    const text = e.target.value
    if (text.length <= characterLimit) {
      setNotes(text)
      setIsSaved(false)
    }
  }

  const handleSave = () => {
    if (onNoteUpdate) {
      onNoteUpdate(projectId, notes)
      setIsSaved(true)
    }
  }

  const handleBlur = () => {
    if (!isSaved && notes !== progress?.notes) {
      handleSave()
    }
  }

  const lastUpdated = progress?.lastUpdated
    ? getTimeElapsed(progress.lastUpdated)
    : 'never'

  return (
    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
      {/* Header */}
      <h3 className="font-semibold text-gray-900 dark:text-white text-sm uppercase tracking-wide mb-3">
        Project Notes
      </h3>

      {/* Text Area */}
      <textarea
        value={notes}
        onChange={handleNoteChange}
        onBlur={handleBlur}
        placeholder="Add notes about your progress..."
        className={`w-full px-4 py-3 rounded-lg border transition-colors resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 ${
          isAtLimit
            ? 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20'
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
        }`}
        rows="4"
      />

      {/* Character Count and Save Status */}
      <div className="flex items-center justify-between mt-3">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {characterCount}/{characterLimit} characters
          {remainingChars < 50 && remainingChars > 0 && (
            <span className="ml-2 text-orange-600 dark:text-orange-400 font-medium">
              {remainingChars} left
            </span>
          )}
          {isAtLimit && (
            <span className="ml-2 text-orange-600 dark:text-orange-400 font-medium">
              Character limit reached
            </span>
          )}
        </div>

        {/* Save Button and Status */}
        <div className="flex items-center gap-2">
          {!isSaved && (
            <button
              onClick={handleSave}
              className="px-3 py-1 text-xs font-medium bg-purple-600 dark:bg-purple-500 text-white rounded hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
            >
              Save
            </button>
          )}
          {isSaved && notes && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Saved
            </span>
          )}
        </div>
      </div>

      {/* Last Edit Timestamp */}
      {notes && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Last edited {lastUpdated}
        </p>
      )}
    </div>
  )
}

export default ProjectNotes
