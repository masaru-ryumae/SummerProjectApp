import React, { useState } from 'react'

const CommunityContent = ({ onBack }) => {
  const [submissions, setSubmissions] = useState([])
  const [showSubmitForm, setShowSubmitForm] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 dark:from-gray-950 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              👥 Community Content
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Share your knowledge, earn rewards, and become a community leader
            </p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 font-medium transition-colors"
          >
            ← Back
          </button>
        </div>

        <button
          onClick={() => setShowSubmitForm(!showSubmitForm)}
          className="w-full mb-8 px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold hover:shadow-lg transition-all"
        >
          ✍️ Submit Content
        </button>

        {submissions.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No submissions yet. Be the first to contribute!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CommunityContent
