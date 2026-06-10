import { useState, useEffect } from 'react';
import { getAverageRating, getRatingCount } from '../utils/reviewStorage';

const RatingStars = ({
  projectId,
  onRateSubmit = () => {},
  isInteractive = true,
  size = 'md'
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate size classes
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl'
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  // Load rating data
  useEffect(() => {
    const avgRating = getAverageRating(projectId);
    const count = getRatingCount(projectId);
    setAverageRating(avgRating);
    setRatingCount(count);
  }, [projectId]);

  // Handle star click
  const handleStarClick = (rating) => {
    if (!isInteractive || isSubmitting) return;

    setIsSubmitting(true);
    try {
      onRateSubmit(rating);
      // Visual feedback
      setTimeout(() => {
        setHoverRating(0);
        setAverageRating(getAverageRating(projectId));
        setRatingCount(getRatingCount(projectId));
        setIsSubmitting(false);
      }, 300);
    } catch (error) {
      console.error('Error submitting rating:', error);
      setIsSubmitting(false);
    }
  };

  // Render individual star
  const renderStar = (position) => {
    const isFilled = (hoverRating || averageRating) >= position;
    const isPartial = (hoverRating || averageRating) > position - 1 &&
                      (hoverRating || averageRating) < position;

    return (
      <button
        key={position}
        onClick={() => handleStarClick(position)}
        onMouseEnter={() => isInteractive && setHoverRating(position)}
        onMouseLeave={() => setHoverRating(0)}
        disabled={!isInteractive || isSubmitting}
        className={`
          ${currentSize}
          transition-transform duration-150 cursor-pointer
          ${isInteractive ? 'hover:scale-110' : 'cursor-default'}
          ${isSubmitting ? 'opacity-50' : ''}
          focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded
        `}
        title={isInteractive ? `Rate ${position} star${position !== 1 ? 's' : ''}` : ''}
      >
        <span className={`
          inline-block transition-colors
          ${isFilled ? 'text-yellow-400' : isPartial ? 'text-yellow-300' : 'text-gray-300 dark:text-gray-600'}
        `}>
          ★
        </span>
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Star Display */}
      <div className="flex items-center gap-3">
        {/* Stars */}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((pos) => renderStar(pos))}
        </div>

        {/* Rating Text */}
        {ratingCount > 0 ? (
          <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
            <span className="font-semibold text-gray-900 dark:text-white">
              {averageRating.toFixed(1)}/5
            </span>
            <span className="ml-1">
              ({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})
            </span>
          </div>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
            No ratings yet
          </div>
        )}
      </div>

      {/* Helper Text for Interactive */}
      {isInteractive && ratingCount === 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          👆 Click stars to rate this project
        </p>
      )}
    </div>
  );
};

export default RatingStars;
