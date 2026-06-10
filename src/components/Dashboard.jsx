import ProjectCard from './ProjectCard'

const Dashboard = ({ answers, topProjects, onEdit }) => {
  if (!answers || !topProjects) return null

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Your Project Recommendations
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Step 1: Answer Questions ✓ → Step 2: View Recommendations
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            {/* Step 1 */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-12 h-12 rounded-full bg-green-500 dark:bg-green-600 flex items-center justify-center text-white font-bold mb-2">
                ✓
              </div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Questions
              </p>
            </div>

            {/* Connector */}
            <div className="flex-1 h-1 bg-green-500 dark:bg-green-600 mx-2 mb-6"></div>

            {/* Step 2 */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-12 h-12 rounded-full bg-purple-600 dark:bg-purple-500 flex items-center justify-center text-white font-bold mb-2">
                2
              </div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Results
              </p>
            </div>
          </div>
        </div>

        {/* Your Selections Summary */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 mb-12 border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Your Profile
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-2">
                Interest
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {answers.interest}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-2">
                Skill Level
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {answers.skillLevel}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-2">
                Budget
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {answers.budget}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-2">
                Time
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {answers.timePerWeek}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-2">
                Location
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {answers.location}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-2">
                Priority
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {answers.priority}
              </p>
            </div>
          </div>
          <button
            onClick={onEdit}
            className="mt-6 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium text-sm transition-colors"
          >
            ✏️ Edit answers
          </button>
        </div>

        {/* Results Count Card */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500 rounded-lg p-8 mb-12 text-white">
          <p className="text-sm font-semibold uppercase opacity-90 mb-2">Your Match</p>
          <h3 className="text-4xl font-bold">
            {topProjects.length} Projects Found
          </h3>
          <p className="text-purple-100 dark:text-pink-100 mt-3">
            Perfect matches ranked by fit. Start with #1!
          </p>
        </div>

        {/* Projects Grid */}
        <div className="space-y-8 mb-12">
          {topProjects.map((project, index) => (
            <div key={project.id}>
              {/* Rank Header */}
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-600 dark:bg-purple-500 text-white font-bold mr-3">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {project.title}
                </h3>
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

        {/* CTA Section */}
        <div className="text-center py-12 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Pick your favorite project above and click "Start This Project" to dive in.
            Each project has links to tutorials and resources to get you rolling.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onEdit}
              className="px-8 py-3 text-lg font-semibold rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              ← Reconsider
            </button>
            <button className="px-8 py-3 text-lg font-semibold rounded-lg bg-purple-600 dark:bg-purple-500 text-white hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors">
              📖 Read the Docs
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
