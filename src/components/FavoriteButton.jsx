import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { isFavorite, saveFavorite, removeFavorite } from '../utils/favoriteStorage';

const FavoriteButton = ({ project }) => {
  const { favorites, updateFavorites } = useApp();
  const [isLiked, setIsLiked] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Check if project is favorited on mount and when favorites change
  useEffect(() => {
    const liked = isFavorite(favorites, project?.id);
    setIsLiked(liked);
  }, [favorites, project?.id]);

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!project) return;

    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);

    let newFavorites;
    if (isLiked) {
      // Remove from favorites
      newFavorites = removeFavorite(favorites, project.id);
    } else {
      // Add to favorites
      newFavorites = saveFavorite(favorites, project);
    }

    updateFavorites(newFavorites);
    setIsLiked(!isLiked);
  };

  return (
    <button
      onClick={handleToggleFavorite}
      className={`
        relative inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium
        transition-all duration-300 ease-out
        ${isLiked
          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }
      `}
      aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
      title={isLiked ? 'Remove from favorites' : 'Save to favorites'}
    >
      {/* Heart Icon */}
      <span
        className={`
          text-lg transition-transform duration-300
          ${isAnimating ? 'scale-150' : 'scale-100'}
        `}
      >
        {isLiked ? '❤️' : '🤍'}
      </span>

      {/* Text Label */}
      <span className="text-sm">
        {isLiked ? 'Saved' : 'Save'}
      </span>
    </button>
  );
};

export default FavoriteButton;
