import { useState, useEffect } from 'react';
import { codeReviewService } from '../services/codeReviewService';

export default function CodeReview({ teamId, projectId, teamMembers, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitForm, setSubmitForm] = useState({
    title: '',
    description: '',
    code: '',
    language: 'javascript',
    reviewers: []
  });
  const [reviewDecision, setReviewDecision] = useState({
    decision: null,
    comment: ''
  });
  const [newComment, setNewComment] = useState('');
  const [currentUser] = useState(() => {
    const user = localStorage.getItem('app_user');
    return user ? JSON.parse(user) : { id: 'anon', name: 'Anonymous' };
  });

  useEffect(() => {
    loadReviews();
  }, [teamId]);

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubReview = codeReviewService.on('review:updated', () => {
      if (selectedReview) {
        const updated = codeReviewService.getReview(selectedReview.id);
        if (updated) {
          setSelectedReview(updated);
        }
      }
      loadReviews();
    });

    const unsubComment = codeReviewService.on('comment:added', () => {
      if (selectedReview) {
        const updated = codeReviewService.getReview(selectedReview.id);
        if (updated) {
          setSelectedReview(updated);
        }
      }
    });

    return () => {
      unsubReview();
      unsubComment();
    };
  }, [selectedReview]);

  const loadReviews = () => {
    const allReviews = codeReviewService.getTeamReviews(teamId);
    setReviews(allReviews);
  };

  const handleSubmitForReview = (e) => {
    e.preventDefault();
    if (!submitForm.title.trim() || !submitForm.code.trim()) return;

    const reviewerIds = submitForm.reviewers.length > 0 ? submitForm.reviewers : ['reviewer_1'];

    const codeBlock = {
      filePath: 'src/components/Component.jsx',
      language: submitForm.language,
      code: submitForm.code,
      lineStart: 1,
      lineEnd: submitForm.code.split('\n').length
    };

    const review = codeReviewService.submitForReview(
      teamId,
      projectId,
      currentUser.id,
      currentUser.name || 'User',
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.id}`,
      submitForm.title,
      submitForm.description,
      [codeBlock],
      reviewerIds
    );

    setReviews([...reviews, review]);
    setSelectedReview(review);
    setSubmitForm({
      title: '',
      description: '',
      code: '',
      language: 'javascript',
      reviewers: []
    });
    setShowSubmitForm(false);
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!selectedReview || !newComment.trim()) return;

    const comment = codeReviewService.addComment(
      selectedReview.id,
      currentUser.id,
      currentUser.name || 'User',
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.id}`,
      newComment,
      undefined,
      'src/components/Component.jsx'
    );

    if (comment) {
      const updated = codeReviewService.getReview(selectedReview.id);
      if (updated) {
        setSelectedReview(updated);
      }
    }

    setNewComment('');
  };

  const handleSubmitReview = (decision) => {
    if (!selectedReview) return;

    const review = codeReviewService.submitReview(
      selectedReview.id,
      currentUser.id,
      decision,
      reviewDecision.comment
    );

    if (review) {
      setSelectedReview(review);
      setReviewDecision({ decision: null, comment: '' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'changes_requested':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      case 'commented':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    }
  };

  const getCurrentUserReviewerStatus = () => {
    if (!selectedReview) return null;
    return selectedReview.reviewers.find((r) => r.userId === currentUser.id);
  };

  const stats = codeReviewService.getStatistics(teamId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-6xl w-full max-h-screen overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Code Review</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {stats.totalReviews} reviews • {stats.approved} approved • {stats.changesRequested} needs changes
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setShowSubmitForm(!showSubmitForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Submit for Review
            </button>
            <button
              onClick={onClose}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {showSubmitForm && (
            <form onSubmit={handleSubmitForReview} className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Submit Code for Review</h3>

              <input
                type="text"
                placeholder="Review title"
                value={submitForm.title}
                onChange={(e) => setSubmitForm({ ...submitForm, title: e.target.value })}
                className="w-full mb-4 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />

              <textarea
                placeholder="Description (optional)"
                value={submitForm.description}
                onChange={(e) => setSubmitForm({ ...submitForm, description: e.target.value })}
                className="w-full mb-4 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                rows="2"
              />

              <select
                value={submitForm.language}
                onChange={(e) => setSubmitForm({ ...submitForm, language: e.target.value })}
                className="w-full mb-4 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="jsx">JSX</option>
              </select>

              <textarea
                placeholder="Paste your code here"
                value={submitForm.code}
                onChange={(e) => setSubmitForm({ ...submitForm, code: e.target.value })}
                className="w-full mb-4 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white font-mono text-sm"
                rows="8"
              />

              <div className="flex gap-2 mb-4">
                {teamMembers.slice(0, 3).map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => {
                      const reviewers = submitForm.reviewers.includes(member.id)
                        ? submitForm.reviewers.filter((id) => id !== member.id)
                        : [...submitForm.reviewers, member.id];
                      setSubmitForm({ ...submitForm, reviewers });
                    }}
                    className={`px-3 py-2 rounded text-sm transition-colors ${
                      submitForm.reviewers.includes(member.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white'
                    }`}
                  >
                    {member.name}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubmitForm(false)}
                  className="px-4 py-2 bg-gray-400 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-3 gap-6">
            {/* Reviews List */}
            <div className="col-span-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">All Reviews</h3>
              <div className="space-y-2">
                {reviews.map((review) => (
                  <button
                    key={review.id}
                    onClick={() => setSelectedReview(review)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedReview?.id === review.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
                    }`}
                  >
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                      {review.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      by {review.submittedByName}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded mt-2 inline-block ${getStatusColor(review.status)}`}>
                      {review.status.replace('_', ' ')}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Review Details */}
            {selectedReview && (
              <div className="col-span-2">
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedReview.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Submitted by {selectedReview.submittedByName}
                      </p>
                    </div>
                    <span className={`text-sm px-3 py-1 rounded ${getStatusColor(selectedReview.status)}`}>
                      {selectedReview.status.replace('_', ' ')}
                    </span>
                  </div>

                  {selectedReview.description && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                      {selectedReview.description}
                    </p>
                  )}

                  {/* Code Block */}
                  {selectedReview.codeBlocks.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        {selectedReview.codeBlocks[0].filePath}
                      </p>
                      <pre className="p-3 bg-gray-900 text-gray-100 rounded text-xs overflow-x-auto">
                        <code>{selectedReview.codeBlocks[0].code}</code>
                      </pre>
                    </div>
                  )}

                  {/* Reviewers */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Reviewers
                    </p>
                    <div className="space-y-1">
                      {selectedReview.reviewers.map((reviewer) => (
                        <div
                          key={reviewer.userId}
                          className="flex items-center justify-between text-xs p-2 bg-white dark:bg-gray-700 rounded"
                        >
                          <span className="text-gray-900 dark:text-white">{reviewer.userName}</span>
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(reviewer.status)}`}>
                            {reviewer.status.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Comments</h4>
                  <div className="space-y-3 mb-4">
                    {selectedReview.comments.map((comment) => (
                      <div key={comment.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium text-sm text-gray-900 dark:text-white">
                            {comment.userName}
                          </span>
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {new Date(comment.timestamp).toLocaleString()}
                          </span>
                        </div>
                        {comment.filePath && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                            {comment.filePath}
                            {comment.lineNumber && ` • Line ${comment.lineNumber}`}
                          </p>
                        )}
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {comment.content}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Add Comment */}
                  <form onSubmit={handleAddComment} className="space-y-2">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                      rows="2"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Add Comment
                    </button>
                  </form>
                </div>

                {/* Review Action */}
                {!getCurrentUserReviewerStatus()?.submitedAt &&
                  selectedReview.reviewers.some((r) => r.userId === currentUser.id) && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Your Review
                      </h4>
                      <textarea
                        value={reviewDecision.comment}
                        onChange={(e) =>
                          setReviewDecision({ ...reviewDecision, comment: e.target.value })
                        }
                        placeholder="Add your review comments (optional)"
                        className="w-full mb-3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white text-sm"
                        rows="2"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSubmitReview('approved')}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleSubmitReview('changes_requested')}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          Request Changes
                        </button>
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
