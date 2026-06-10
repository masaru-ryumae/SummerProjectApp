import ProjectCard from './ProjectCard'

const RecommendationView = ({ answers, topProjects, onTryAgain }) => {
  if (!answers || !topProjects) return null

  const answerLabels = {
    interest: answers.interest || 'Your interests',
    skillLevel: answers.skillLevel || 'Your level',
    budget: answers.budget || 'Your budget',
    timePerWeek: answers.timePerWeek || 'Your time',
    location: answers.location || 'Your location',
    priority: answers.priority || 'Your priority'
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Celebration Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <div className="text-6xl">🎯</div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-3">
            We Found Your Match!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
            Here are {topProjects.length} perfect projects for you.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Based on your answers, here's what we think you'll love.
          </p>
        </div>

        {/* Your Selection Summary */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg p-8 mb-12 border border-purple-200 dark:border-purple-800">
          <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase mb-4 block">
            You Selected
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1 font-semibold">
                Interest
              </p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {answerLabels.interest}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1 font-semibold">
                Skill Level
              </p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {answerLabels.skillLevel}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1 font-semibold">
                Budget
              </p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {answerLabels.budget}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1 font-semibold">
                Time/Week
              </p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {answerLabels.timePerWeek}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1 font-semibold">
                Location
              </p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {answerLabels.location}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1 font-semibold">
                Priority
              </p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {answerLabels.priority}
              </p>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Your Top {topProjects.length} Projects
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Perfect matches ranked by how well they fit your profile.
          </p>
        </div>

        {/* Project Cards Grid */}
        <div className="space-y-6 mb-12">
          {topProjects.map((project, index) => (
            <div key={project.id}>
              {/* Rank Badge */}
              <div className="flex items-center mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-600 dark:bg-purple-500 text-white font-bold mr-3">
                  {index + 1}
                </div>
                <div className="h-px flex-grow bg-gradient-to-r from-purple-200 to-transparent dark:from-purple-800"></div>
              </div>
              {/* Project Card */}
              <ProjectCard
                project={project}
                showExplanation={true}
                whyMatch={project.explanation || project.whyMatch || 'Great match for you!'}
              />
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 py-12 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onTryAgain}
            className="w-full px-6 py-4 text-lg font-semibold rounded-lg bg-purple-600 dark:bg-purple-500 text-white hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
          >
            ← Try Different Answers
          </button>

          <button
            disabled
            className="w-full px-6 py-4 text-lg font-semibold rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed flex items-center justify-center"
          >
            📊 View All Results
            <span className="ml-2 text-xs bg-purple-600 dark:bg-purple-500 text-white px-2 py-1 rounded font-bold">
              v2
            </span>
          </button>
        </div>

        {/* Tech Dad Encouragement */}
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
            <span className="text-2xl mr-2">💡</span>
            <strong>Pro tip from your Tech Dad:</strong>
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Pick the project that makes you most curious, not the most impressive one.
            The best summer is the one where you're having fun learning something new.
            Start small, build big. You got this!
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-10 text-gray-500 dark:text-gray-500 text-sm">
          <p>
            Need help getting started?
            <br />
            Reach out for guidance or check the tutorial links above.
          </p>
        </div>
      </div>
    </div>
  )
}

export default RecommendationView
