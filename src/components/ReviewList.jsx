import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  getReviews,
  addHelpful,
  removeReview,
  getRelativeTime,
  formatName
} from '../utils/reviewStorage';

const ReviewList = ({ projectId, onReviewAdded = () => {} }) => {
  const { currentUser } = useApp();
  const [reviews, setReviews] = useState([]);
  const [displayedReviews, setDisplayedReviews] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [helpfulUsers, setHelpfulUsers] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Reload reviews when component mounts or projectId changes
  const loadReviews = () => {
    setIsLoading(true);
    try {
      const projectReviews = getReviews(projectId);
      setReviews(projectReviews);

      // Show top 3-5 by default, or all if showAll is true
      const displayCount = showAll ? projectReviews.length : Math.min(5, projectReviews.length);
      setDisplayedReviews(projectReviews.slice(0, displayCount));

      // Load user's helpful votes from localStorage
      const savedHelpful = localStorage.getItem(`helpful_votes_${currentUser?.id}`);
      setHelpfulUsers(new Set(savedHelpful ? JSON.parse(savedHelpful) : []));
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
      setDisplayedReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load reviews
  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, onReviewAdded]);

  // Handle marking as helpful
  const handleHelpful = (reviewId) => {
    if (!currentUser) {
      alert('Please log in or refresh to mark reviews as helpful');
      return;
    }

    if (helpfulUsers.has(reviewId)) {
      return; // Already marked
    }

    try {
      addHelpful(projectId, reviewId, currentUser.id);
      const updatedHelpful = new Set(helpfulUsers);
      updatedHelpful.add(reviewId);
      setHelpfulUsers(updatedHelpful);

      // Save to localStorage
      localStorage.setItem(
        `helpful_votes_${currentUser.id}`,
        JSON.stringify(Array.from(updatedHelpful))
      );

      // Reload reviews to show updated helpful count
      loadReviews();
    } catch (error) {
      console.error('Error marking as helpful:', error);
    }
  };

  // Handle delete review
  const handleDeleteReview = (reviewId) => {
    if (!currentUser) return;

    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      removeReview(projectId, reviewId, currentUser.id);
      loadReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      alert(error.message || 'Failed to delete review');
    }
  };

  // Render star rating
  const renderRating = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((pos) => (
          <span
            key={pos}
            className={`text-sm ${
              pos <= rating
                ? 'text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  // Render single review
  const renderReview = (review) => {
    const isOwner = currentUser?.id === review.userId;
    const isHelpful = helpfulUsers.has(review.id);

    return (
      <div
        key={review.id}
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
      >
        {/* Review Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatName(review.userName)}
              </span>
              {isOwner && (
                <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded">
                  Your review
                </span>
              )}
            </div>
            {renderRating(review.rating)}
          </div>

          {isOwner && (
            <button
              onClick={() => handleDeleteReview(review.id)}
              className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm"
              title="Delete this review"
            >
              ✕
            </button>
          )}
        </div>

        {/* Review Text */}
        {review.reviewText && (
          <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 line-clamp-3">
            {review.reviewText.length > 200
              ? `${review.reviewText.substring(0, 200)}...`
              : review.reviewText}
          </p>
        )}

        {/* Footer: Date and Helpful */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{getRelativeTime(review.date)}</span>

          <button
            onClick={() => handleHelpful(review.id)}
            disabled={isHelpful}
            className={`
              flex items-center gap-1 px-2 py-1 rounded transition-all
              ${isHelpful
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-default'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }
            `}
          >
            <span>👍</span>
            <span>{review.helpful || 0}</span>
          </button>
        </div>
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        ))}
      </div>
    );
  }

  // No reviews
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p className="text-sm">📝 No reviews yet. Be the first to share your experience!</p>
      </div>
    );
  }

  // Show reviews
  return (
    <div className="space-y-3">
      {/* Reviews List */}
      {displayedReviews.map((review) => renderReview(review))}

      {/* Load More Button */}
      {reviews.length > 5 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full py-2 text-center text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
        >
          Show all {reviews.length} reviews
        </button>
      )}

      {/* Show Less Button */}
      {showAll && reviews.length > 5 && (
        <button
          onClick={() => setShowAll(false)}
          className="w-full py-2 text-center text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
        >
          Show less
        </button>
      )}
    </div>
  );
};

export default ReviewList;
