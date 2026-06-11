import { useState, useMemo } from 'react';
import { templateService, recommendationService } from '../services/marketplaceService';
import RatingStars from './RatingStars';

export default function TemplateGallery({ searchQuery }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [maxPrice, setMaxPrice] = useState(100);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [cloneStatus, setCloneStatus] = useState(null);
  const [showRelated, setShowRelated] = useState(false);

  const categories = templateService.getCategories();
  const difficulties = templateService.getDifficulties();

  const filteredTemplates = useMemo(() => {
    return templateService.filterTemplates({
      category: selectedCategory,
      difficulty: selectedDifficulty,
      maxPrice,
      search: searchQuery
    });
  }, [selectedCategory, selectedDifficulty, maxPrice, searchQuery]);

  const topTemplates = useMemo(() => {
    return templateService.getTopTemplates(3);
  }, []);

  const relatedTemplates = useMemo(() => {
    return selectedTemplate ? recommendationService.getRelatedTemplates(selectedTemplate.id) : [];
  }, [selectedTemplate]);

  const handleCloneTemplate = async () => {
    if (!selectedTemplate) return;

    setCloneStatus('cloning');
    try {
      const result = await templateService.cloneTemplate(selectedTemplate.id, `${selectedTemplate.title} Project`);
      setCloneStatus('success');
      setTimeout(() => {
        setCloneStatus(null);
        setSelectedTemplate(null);
      }, 2000);
    } catch (error) {
      setCloneStatus('error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Templates */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          ⭐ Top Templates This Week
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow border-2 border-yellow-200 dark:border-yellow-800/50"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">🔥</span>
                <span className="text-sm font-bold bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 px-2 py-1 rounded">
                  #{topTemplates.indexOf(template) + 1}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">{template.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{template.description}</p>
              <div className="flex items-center gap-2 mb-2">
                <RatingStars rating={template.rating} />
                <span className="text-xs text-gray-600 dark:text-gray-400">({template.reviews})</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>⬇️ {template.downloads.toLocaleString()}</span>
                <span className="font-bold text-lg text-green-600 dark:text-green-400">${template.price}</span>
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

          {/* Difficulty Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Difficulty
            </label>
            <select
              value={selectedDifficulty || ''}
              onChange={(e) => setSelectedDifficulty(e.target.value || null)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Levels</option>
              {difficulties.map((diff) => (
                <option key={diff} value={diff}>
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Price Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Price: ${maxPrice}
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Results Count */}
          <div className="flex items-end">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              📊 {filteredTemplates.length} templates found
            </div>
          </div>
        </div>
      </section>

      {/* Templates Grid */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          📦 All Templates
        </h2>

        {filteredTemplates.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              No templates found matching your criteria
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => {
                  setSelectedTemplate(template);
                  setShowRelated(true);
                }}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">📦</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    template.difficulty === 'beginner'
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                      : template.difficulty === 'intermediate'
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                  }`}>
                    {template.difficulty}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {template.title}
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {template.description}
                </p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    {template.tools.slice(0, 2).map((tool) => (
                      <span
                        key={tool}
                        className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded"
                      >
                        {tool}
                      </span>
                    ))}
                    {template.tools.length > 2 && (
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        +{template.tools.length - 2} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <RatingStars rating={template.rating} />
                      <span className="ml-1">({template.reviews})</span>
                    </div>
                    <span>⬇️ {template.downloads}</span>
                    <span>⏱️ {template.estimatedHours}h</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    by {template.creator}
                  </span>
                  <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                    ${template.price}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full my-8">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <span className="text-4xl">📦</span>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedTemplate.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    by {selectedTemplate.creator}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedTemplate(null);
                  setShowRelated(false);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
              {/* Description */}
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">About</h3>
                <p className="text-gray-600 dark:text-gray-400">{selectedTemplate.description}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Rating</div>
                  <div className="flex items-center gap-2">
                    <RatingStars rating={selectedTemplate.rating} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ({selectedTemplate.reviews} reviews)
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Downloads</div>
                  <div className="font-bold text-gray-900 dark:text-white">
                    {selectedTemplate.downloads.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Included */}
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">What's Included</h3>
                <ul className="space-y-2">
                  {selectedTemplate.included.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Related Templates */}
              {showRelated && relatedTemplates.length > 0 && (
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3">Related Templates</h3>
                  <div className="space-y-2">
                    {relatedTemplates.map((related) => (
                      <div
                        key={related.id}
                        onClick={() => setSelectedTemplate(related)}
                        className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {related.title}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          Rating: {related.rating} ⭐
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${selectedTemplate.price}
              </span>
              <button
                onClick={handleCloneTemplate}
                disabled={cloneStatus === 'cloning'}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  cloneStatus === 'success'
                    ? 'bg-green-600 text-white'
                    : cloneStatus === 'cloning'
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {cloneStatus === 'cloning'
                  ? '⏳ Cloning...'
                  : cloneStatus === 'success'
                  ? '✓ Cloned!'
                  : '📋 Clone Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
