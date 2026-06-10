import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { addReview, canUserReview, getUserReview } from '../utils/reviewStorage';

const AddReviewModal = ({ projectId, isOpen, onClose, onReviewAdded = () => {} }) => {
  const { currentUser } = useApp();
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [userName, setUserName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [existingReview, setExistingReview] = useState(null);

  const MAX_CHARS = 200;
  const charCount = reviewText.length;

  // Check if user already has a review
  useEffect(() => {
    if (isOpen && currentUser) {
      const existing = getUserReview(currentUser.id, projectId);
      setExistingReview(existing);
    }
  }, [isOpen, currentUser, projectId]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setRating(0);
      setReviewText('');
      setIsAnonymous(true);
      setUserName('');
      setSubmitSuccess(false);
      setErrorMessage('');
    }
  }, [isOpen]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!currentUser) {
      setErrorMessage('Please refresh the page to continue');
      return;
    }

    if (!canUserReview(currentUser.id, projectId) || existingReview) {
      setErrorMessage('You can only submit one review per project');
      return;
    }

    if (rating === 0) {
      setErrorMessage('Please select a star rating');
      return;
    }

    setIsSubmitting(true);

    try {
      const finalUserName = isAnonymous ? 'Anonymous Student' : (userName.trim() || 'Anonymous Student');

      addReview(
        currentUser.id,
        projectId,
        rating,
        reviewText,
        finalUserName
      );

      setSubmitSuccess(true);
      onReviewAdded();

      // Close modal after success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error submitting review:', error);
      setErrorMessage(error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render star picker
  const renderStarPicker = () => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setRating(star)}
            className={`
              text-3xl transition-transform duration-100
              ${star <= rating ? 'text-yellow-400 scale-110' : 'text-gray-300 dark:text-gray-600'}
              hover:scale-110 focus:outline-none
            `}
            type="button"
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  // Existing review view
  if (existingReview) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Your Review
          </h2>

          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900 dark:text-blue-200 mb-3">
              You've already reviewed this project:
            </p>

            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((pos) => (
                <span key={pos} className={pos <= existingReview.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}>
                  ★
                </span>
              ))}
            </div>

            {existingReview.reviewText && (
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {existingReview.reviewText}
              </p>
            )}
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
            💡 You can delete your review to submit a new one.
          </p>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Share Your Review
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-sm text-green-900 dark:text-green-200 font-medium">
              ✓ Review submitted successfully!
            </p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-900 dark:text-red-200 font-medium">
              {errorMessage}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Rating Picker */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Your Rating
            </label>
            {renderStarPicker()}
            {rating === 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Click a star to rate (1-5)
              </p>
            )}
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Your Review
              <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-2">
                (optional)
              </span>
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value.substring(0, MAX_CHARS))}
              placeholder="Share your experience with this project... (max 200 characters)"
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
              rows="4"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {charCount}/{MAX_CHARS} characters
              </p>
              {charCount > MAX_CHARS * 0.8 && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  {MAX_CHARS - charCount} left
                </p>
              )}
            </div>
          </div>

          {/* Anonymous Toggle */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => {
                  setIsAnonymous(e.target.checked);
                  if (e.target.checked) setUserName('');
                }}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Post as Anonymous Student
              </span>
            </label>
          </div>

          {/* Name Input (when not anonymous) */}
          {!isAnonymous && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g., Alex"
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                💡 Only your first name + initial will be shown (e.g., "Alex K.")
              </p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              ✨ Please be respectful, honest, and helpful in your review. Reviews help other students find great projects!
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0 || existingReview}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReviewModal;
