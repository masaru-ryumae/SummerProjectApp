import { useState, useMemo } from 'react';
import { tutorialService, recommendationService } from '../services/marketplaceService';
import RatingStars from './RatingStars';

export default function TutorialLibrary({ searchQuery }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [completionStatus, setCompletionStatus] = useState(null);

  const categories = tutorialService.getCategories();
  const skills = tutorialService.getSkills();
  const topics = tutorialService.getTopics();

  const filteredTutorials = useMemo(() => {
    return tutorialService.filterTutorials({
      category: selectedCategory,
      skill: selectedSkill,
      topic: selectedTopic,
      search: searchQuery
    });
  }, [selectedCategory, selectedSkill, selectedTopic, searchQuery]);

  const topTutorials = useMemo(() => {
    return tutorialService.getTopTutorials(3);
  }, []);

  const relatedTutorials = useMemo(() => {
    return selectedTutorial ? recommendationService.getRelatedTutorials(selectedTutorial.id) : [];
  }, [selectedTutorial]);

  const handleCompleteTutorial = async () => {
    if (!selectedTutorial) return;

    setCompletionStatus('completing');
    try {
      const result = await tutorialService.markAsCompleted(selectedTutorial.id);
      setCompletionStatus('success');
      setTimeout(() => {
        setCompletionStatus(null);
        setSelectedTutorial(null);
      }, 2000);
    } catch (error) {
      setCompletionStatus('error');
    }
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-8">
      {/* Top Tutorials */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          ⭐ Top Tutorials
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topTutorials.map((tutorial, idx) => (
            <div
              key={tutorial.id}
              onClick={() => setSelectedTutorial(tutorial)}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 border-blue-200 dark:border-blue-800/50"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">📚</span>
                <span className="text-sm font-bold bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 px-2 py-1 rounded">
                  #{idx + 1}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">{tutorial.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{tutorial.description}</p>
              <div className="flex items-center gap-2 mb-2">
                <RatingStars rating={tutorial.rating} />
                <span className="text-xs text-gray-600 dark:text-gray-400">({tutorial.views.toLocaleString()})</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>⏱️ {formatDuration(tutorial.duration)}</span>
                <span className="font-medium text-indigo-600 dark:text-indigo-400">{tutorial.skill}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Filters */}
      <section className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4">🔍 Filters</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Skill Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Skill Level
            </label>
            <select
              value={selectedSkill || ''}
              onChange={(e) => setSelectedSkill(e.target.value || null)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Levels</option>
              {skills.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </div>

          {/* Topic Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Topic
            </label>
            <select
              value={selectedTopic || ''}
              onChange={(e) => setSelectedTopic(e.target.value || null)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Topics</option>
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-end">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              📊 {filteredTutorials.length} tutorials found
            </div>
          </div>
        </div>
      </section>

      {/* Tutorials Grid */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          📚 All Tutorials
        </h2>

        {filteredTutorials.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No tutorials found matching your criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTutorials.map((tutorial) => (
              <div
                key={tutorial.id}
                onClick={() => setSelectedTutorial(tutorial)}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">📚</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    tutorial.difficulty === 'beginner'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                      : tutorial.difficulty === 'intermediate'
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                  }`}>
                    {tutorial.difficulty}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {tutorial.title}
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {tutorial.description}
                </p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded">
                      {tutorial.skill}
                    </span>
                    <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-2 py-1 rounded">
                      {tutorial.topic}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <RatingStars rating={tutorial.rating} />
                      <span className="ml-1">({tutorial.views.toLocaleString()})</span>
                    </div>
                    <span>⏱️ {formatDuration(tutorial.duration)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    📖 {tutorial.instructor}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Tutorial Detail Modal */}
      {selectedTutorial && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full my-8">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <span className="text-4xl">📚</span>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedTutorial.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    by {selectedTutorial.instructor}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTutorial(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
              {/* Description */}
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">About</h3>
                <p className="text-gray-600 dark:text-gray-400">{selectedTutorial.description}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Duration</div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {formatDuration(selectedTutorial.duration)}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Skill Level</div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {selectedTutorial.skill}
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-center">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Rating</div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {selectedTutorial.rating} ⭐
                  </div>
                </div>
              </div>

              {/* Step by Step */}
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">Step-by-Step Guide</h3>
                <ol className="space-y-2">
                  {selectedTutorial.stepByStep.map((step, idx) => (
                    <li key={step} className="flex gap-3 text-gray-700 dark:text-gray-300">
                      <span className="flex-shrink-0 font-bold text-blue-600 dark:text-blue-400 min-w-6">
                        {idx + 1}.
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Code Snippet */}
              {selectedTutorial.codeSnippet && (
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Code Example</h3>
                  <pre className="bg-gray-900 dark:bg-gray-950 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
                    <code>{selectedTutorial.codeSnippet}</code>
                  </pre>
                </div>
              )}

              {/* Related Tutorials */}
              {relatedTutorials.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3">Related Tutorials</h3>
                  <div className="space-y-2">
                    {relatedTutorials.map((related) => (
                      <div
                        key={related.id}
                        onClick={() => setSelectedTutorial(related)}
                        className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {related.title}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {formatDuration(related.duration)} • Rating: {related.rating} ⭐
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleCompleteTutorial}
                disabled={completionStatus === 'completing'}
                className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                  completionStatus === 'success'
                    ? 'bg-green-600 text-white'
                    : completionStatus === 'completing'
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {completionStatus === 'completing'
                  ? '⏳ Marking Complete...'
                  : completionStatus === 'success'
                  ? '✓ Completed! Certificate Generated'
                  : '🎓 Mark as Complete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
