import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getFavorites, getFavoriteCategories, removeFavorite } from '../utils/favoriteStorage';
import ProjectCard from './ProjectCard';

const FavoritesView = ({ onBack }) => {
  const { favorites, updateFavorites } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Get filtered and sorted favorites
  const filteredFavorites = getFavorites(
    favorites,
    selectedCategory === 'All' ? null : selectedCategory
  );

  // Get all unique categories
  const categories = getFavoriteCategories(favorites);

  // Handle removing a favorite
  const handleRemoveFavorite = (projectId) => {
    const newFavorites = removeFavorite(favorites, projectId);
    updateFavorites(newFavorites);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="mb-6 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium inline-flex items-center gap-2 transition-colors"
          >
            <span>←</span>
            <span>Back to Recommendations</span>
          </button>

          <div className="inline-block mb-6">
            <div className="text-5xl">⭐</div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-3">
            Your Saved Projects
          </h1>

          {/* Count Badge */}
          <div className="flex items-center gap-3 mt-4">
            <span className="text-lg text-gray-600 dark:text-gray-400">
              You have
            </span>
            <span className="inline-block px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full font-bold text-lg">
              {filteredFavorites.length} saved {filteredFavorites.length === 1 ? 'project' : 'projects'}
            </span>
          </div>
        </div>

        {/* Empty State */}
        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">💭</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              No favorites yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Start saving projects by clicking the heart icon on project cards.
              Your saved projects will appear here so you can easily find them later.
            </p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-purple-600 dark:bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors inline-flex items-center gap-2"
            >
              <span>🔍</span>
              <span>Explore Projects</span>
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Filter Section */}
            {categories.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Filter by Category
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className={`
                      px-4 py-2 rounded-full font-medium transition-colors text-sm
                      ${selectedCategory === 'All'
                        ? 'bg-purple-600 dark:bg-purple-500 text-white'
                        : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500'
                      }
                    `}
                  >
                    All Categories
                  </button>
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`
                        px-4 py-2 rounded-full font-medium transition-colors text-sm
                        ${selectedCategory === category
                          ? 'bg-purple-600 dark:bg-purple-500 text-white'
                          : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500'
                        }
                      `}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No results for selected category */}
            {filteredFavorites.length === 0 && favorites.length > 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No saved projects in the {selectedCategory} category
                </p>
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                >
                  View all saved projects
                </button>
              </div>
            )}

            {/* Projects Grid */}
            {filteredFavorites.length > 0 && (
              <div className="space-y-6">
                {filteredFavorites.map((favorite, index) => (
                  <div key={favorite.id} className="relative group">
                    {/* Index Badge */}
                    <div className="flex items-center mb-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold mr-3 text-sm">
                        {index + 1}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
                        Saved {new Date(favorite.savedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      <div className="h-px flex-grow bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-700 ml-3"></div>
                    </div>

                    {/* Project Card Wrapper with Remove Button */}
                    <div className="relative">
                      <ProjectCard
                        project={favorite}
                        showExplanation={false}
                      />

                      {/* Remove Button (Floating) */}
                      <button
                        onClick={() => handleRemoveFavorite(favorite.id)}
                        className="absolute top-4 right-4 p-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors opacity-0 group-hover:opacity-100 duration-200"
                        title="Remove from favorites"
                        aria-label="Remove from favorites"
                      >
                        <span className="text-lg">✕</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {favorites.length > 0 && (
          <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              💡 Tip: Save projects you like and come back anytime to compare them.
            </p>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-purple-600 dark:bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
            >
              Explore More Projects
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesView;
