/**
 * Pure utility functions for managing favorites
 * Uses AppContext data, not localStorage directly
 */

/**
 * Check if a project is favorited by the user
 * @param {Array} favorites - Array of favorite project IDs or objects
 * @param {string} projectId - Project ID to check
 * @returns {boolean}
 */
export const isFavorite = (favorites, projectId) => {
  if (!Array.isArray(favorites)) return false;
  return favorites.some(fav =>
    typeof fav === 'string' ? fav === projectId : fav.id === projectId
  );
};

/**
 * Add a project to favorites
 * @param {Array} favorites - Current favorites array
 * @param {Object} project - Project object with at least id, title, category
 * @returns {Array} - New favorites array with project added
 */
export const saveFavorite = (favorites, project) => {
  if (!project || !project.id) return favorites;

  // Check if already favorited
  if (isFavorite(favorites, project.id)) {
    return favorites;
  }

  // Add with timestamp for sorting
  const favoriteEntry = {
    id: project.id,
    title: project.title,
    category: project.category,
    description: project.description,
    skillLevel: project.skillLevel || project.difficulty,
    budget: project.budget,
    timeWeeks: project.timeWeeks,
    savedAt: new Date().toISOString()
  };

  return [...favorites, favoriteEntry];
};

/**
 * Remove a project from favorites
 * @param {Array} favorites - Current favorites array
 * @param {string} projectId - Project ID to remove
 * @returns {Array} - New favorites array with project removed
 */
export const removeFavorite = (favorites, projectId) => {
  if (!Array.isArray(favorites)) return [];
  return favorites.filter(fav =>
    typeof fav === 'string' ? fav !== projectId : fav.id !== projectId
  );
};

/**
 * Get all favorites, optionally filtered by category
 * @param {Array} favorites - Current favorites array
 * @param {string|null} categoryFilter - Optional category to filter by
 * @returns {Array} - Filtered and sorted favorites
 */
export const getFavorites = (favorites, categoryFilter = null) => {
  if (!Array.isArray(favorites)) return [];

  let results = [...favorites];

  // Filter by category if provided
  if (categoryFilter && categoryFilter !== 'All') {
    results = results.filter(fav => fav.category === categoryFilter);
  }

  // Sort by savedAt (newest first)
  results.sort((a, b) => {
    const timeA = a.savedAt ? new Date(a.savedAt).getTime() : 0;
    const timeB = b.savedAt ? new Date(b.savedAt).getTime() : 0;
    return timeB - timeA;
  });

  return results;
};

/**
 * Get unique categories from favorites
 * @param {Array} favorites - Current favorites array
 * @returns {Array} - Array of unique category strings
 */
export const getFavoriteCategories = (favorites) => {
  if (!Array.isArray(favorites)) return [];

  const categories = new Set(
    favorites
      .filter(fav => fav.category)
      .map(fav => fav.category)
  );

  return Array.from(categories).sort();
};
