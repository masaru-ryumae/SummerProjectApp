/**
 * Review storage utility functions
 * Manages community ratings and reviews with localStorage persistence
 */

// Get all reviews (global state, not user-specific)
export const getAllReviews = () => {
  try {
    const stored = localStorage.getItem('app_all_reviews');
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading reviews:', error);
    return {};
  }
};

// Save all reviews
const saveAllReviews = (reviews) => {
  try {
    localStorage.setItem('app_all_reviews', JSON.stringify(reviews));
  } catch (error) {
    console.error('Error saving reviews:', error);
  }
};

// Add a new review
export const addReview = (userId, projectId, rating, reviewText, userName) => {
  if (!userId || !projectId) {
    throw new Error('userId and projectId are required');
  }

  const allReviews = getAllReviews();
  const projectReviews = allReviews[projectId] || [];

  // Check if user already has a review for this project
  const existingReviewIndex = projectReviews.findIndex(
    (review) => review.userId === userId
  );

  if (existingReviewIndex !== -1) {
    throw new Error('You can only submit one review per project');
  }

  const today = new Date();
  const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD

  const newReview = {
    id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    projectId,
    userId,
    userName: userName || 'Anonymous Student',
    rating: Math.max(1, Math.min(5, Math.round(rating))), // Ensure 1-5
    reviewText: (reviewText || '').trim(),
    date: dateString,
    helpful: 0,
    isAnonymous: userName === 'Anonymous Student',
    helpfulUsers: [] // Track which users found it helpful
  };

  projectReviews.push(newReview);
  allReviews[projectId] = projectReviews;
  saveAllReviews(allReviews);

  return newReview;
};

// Get reviews for a project, sorted by helpful count (DESC) then date (DESC)
export const getReviews = (projectId) => {
  if (!projectId) return [];

  const allReviews = getAllReviews();
  const projectReviews = allReviews[projectId] || [];

  // Filter to last 3 months and sort
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  return projectReviews
    .filter((review) => {
      const reviewDate = new Date(review.date);
      return reviewDate >= threeMonthsAgo;
    })
    .sort((a, b) => {
      // Sort by helpful count (descending)
      if (b.helpful !== a.helpful) {
        return b.helpful - a.helpful;
      }
      // Then by date (descending - newest first)
      return new Date(b.date) - new Date(a.date);
    });
};

// Get average rating for a project
export const getAverageRating = (projectId) => {
  if (!projectId) return 0;

  const reviews = getReviews(projectId);
  if (reviews.length === 0) return 0;

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return parseFloat((total / reviews.length).toFixed(1));
};

// Get rating count for a project
export const getRatingCount = (projectId) => {
  if (!projectId) return 0;
  return getReviews(projectId).length;
};

// Mark a review as helpful
export const addHelpful = (projectId, reviewId, userId) => {
  if (!projectId || !reviewId || !userId) {
    throw new Error('projectId, reviewId, and userId are required');
  }

  const allReviews = getAllReviews();
  const projectReviews = allReviews[projectId] || [];

  const review = projectReviews.find((r) => r.id === reviewId);
  if (!review) {
    throw new Error('Review not found');
  }

  // Initialize helpfulUsers array if it doesn't exist
  if (!review.helpfulUsers) {
    review.helpfulUsers = [];
  }

  // Check if user already marked this as helpful
  if (review.helpfulUsers.includes(userId)) {
    return review; // Already marked, no change
  }

  review.helpfulUsers.push(userId);
  review.helpful = review.helpfulUsers.length;

  allReviews[projectId] = projectReviews;
  saveAllReviews(allReviews);

  return review;
};

// Remove a review (only by the user who wrote it)
export const removeReview = (projectId, reviewId, userId) => {
  if (!projectId || !reviewId || !userId) {
    throw new Error('projectId, reviewId, and userId are required');
  }

  const allReviews = getAllReviews();
  const projectReviews = allReviews[projectId] || [];

  const reviewIndex = projectReviews.findIndex((r) => r.id === reviewId);
  if (reviewIndex === -1) {
    throw new Error('Review not found');
  }

  const review = projectReviews[reviewIndex];
  if (review.userId !== userId) {
    throw new Error('You can only delete your own reviews');
  }

  projectReviews.splice(reviewIndex, 1);
  allReviews[projectId] = projectReviews;
  saveAllReviews(allReviews);

  return true;
};

// Check if user can submit a review for this project
export const canUserReview = (userId, projectId) => {
  if (!userId || !projectId) return false;

  const allReviews = getAllReviews();
  const projectReviews = allReviews[projectId] || [];

  // Return false if user already has a review
  return !projectReviews.some((review) => review.userId === userId);
};

// Get user's review for a specific project (if any)
export const getUserReview = (userId, projectId) => {
  if (!userId || !projectId) return null;

  const reviews = getReviews(projectId);
  return reviews.find((review) => review.userId === userId) || null;
};

// Format helper: convert date string to relative time
export const getRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

// Format name: "John Doe" -> "John D."
export const formatName = (fullName) => {
  if (!fullName || fullName === 'Anonymous Student') {
    return 'Anonymous Student';
  }

  const parts = fullName.trim().split(' ');
  if (parts.length === 1) {
    return parts[0];
  }

  return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`;
};
