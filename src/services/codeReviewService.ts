/**
 * Code Review Service - Handles peer code review workflow
 * Supports review submissions, inline comments, approvals, and history
 */

export interface CodeReviewComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  lineNumber?: number;
  filePath?: string;
  timestamp: string;
  resolved: boolean;
}

export interface CodeBlock {
  filePath: string;
  language: string;
  code: string;
  lineStart: number;
  lineEnd: number;
}

export interface CodeReview {
  id: string;
  teamId: string;
  projectId: string;
  submittedBy: string;
  submittedByName: string;
  submittedByAvatar: string;
  title: string;
  description: string;
  codeBlocks: CodeBlock[];
  comments: CodeReviewComment[];
  status: 'pending' | 'approved' | 'changes_requested' | 'commented';
  reviewers: ReviewerStatus[];
  createdAt: string;
  updatedAt: string;
}

export interface ReviewerStatus {
  userId: string;
  userName: string;
  userAvatar: string;
  status: 'pending' | 'approved' | 'changes_requested' | 'commented';
  submittedAt?: string;
}

export interface ReviewHistory {
  id: string;
  reviewId: string;
  userId: string;
  action: 'submitted' | 'approved' | 'changes_requested' | 'commented';
  timestamp: string;
  comment?: string;
}

class CodeReviewService {
  private reviews: Map<string, CodeReview> = new Map();
  private histories: ReviewHistory[] = [];
  private storageKey = 'code_reviews';
  private historyKey = 'review_history';

  // Real-time listeners
  private listeners: Map<string, Set<Function>> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const reviewData = localStorage.getItem(this.storageKey);
      const historyData = localStorage.getItem(this.historyKey);

      if (reviewData) {
        const parsed = JSON.parse(reviewData);
        this.reviews = new Map(Object.entries(parsed));
      }
      if (historyData) {
        this.histories = JSON.parse(historyData);
      }
    } catch (error) {
      console.error('Error loading code review data from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      const reviewData = Object.fromEntries(this.reviews);
      localStorage.setItem(this.storageKey, JSON.stringify(reviewData));
      localStorage.setItem(this.historyKey, JSON.stringify(this.histories));
    } catch (error) {
      console.error('Error saving code review data to storage:', error);
    }
  }

  private notifyListeners(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => {
        try {
          cb(data);
        } catch (error) {
          console.error('Error in listener callback:', error);
        }
      });
    }
  }

  private recordHistory(
    reviewId: string,
    userId: string,
    action: ReviewHistory['action'],
    comment?: string
  ) {
    const historyEntry: ReviewHistory = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      reviewId,
      userId,
      action,
      timestamp: new Date().toISOString(),
      comment
    };
    this.histories.push(historyEntry);
  }

  submitForReview(
    teamId: string,
    projectId: string,
    userId: string,
    userName: string,
    userAvatar: string,
    title: string,
    description: string,
    codeBlocks: CodeBlock[],
    reviewerIds: string[]
  ): CodeReview {
    // Create reviewer status objects
    const reviewers: ReviewerStatus[] = reviewerIds.map(id => ({
      userId: id,
      userName: `Reviewer ${id.substring(0, 8)}`,
      userAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${id}`,
      status: 'pending'
    }));

    const review: CodeReview = {
      id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      teamId,
      projectId,
      submittedBy: userId,
      submittedByName: userName,
      submittedByAvatar: userAvatar,
      title,
      description,
      codeBlocks,
      comments: [],
      status: 'pending',
      reviewers,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.reviews.set(review.id, review);
    this.recordHistory(review.id, userId, 'submitted');
    this.saveToStorage();
    this.notifyListeners('review:submitted', review);
    return review;
  }

  getReview(reviewId: string): CodeReview | null {
    return this.reviews.get(reviewId) || null;
  }

  getTeamReviews(teamId: string): CodeReview[] {
    return Array.from(this.reviews.values())
      .filter(r => r.teamId === teamId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getProjectReviews(projectId: string): CodeReview[] {
    return Array.from(this.reviews.values())
      .filter(r => r.projectId === projectId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getPendingReviews(userId: string): CodeReview[] {
    return Array.from(this.reviews.values()).filter(
      r =>
        r.reviewers.some(
          rv => rv.userId === userId && (rv.status === 'pending' || rv.status === 'commented')
        )
    );
  }

  getSubmittedReviews(userId: string): CodeReview[] {
    return Array.from(this.reviews.values())
      .filter(r => r.submittedBy === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  addComment(
    reviewId: string,
    userId: string,
    userName: string,
    userAvatar: string,
    content: string,
    lineNumber?: number,
    filePath?: string
  ): CodeReviewComment | null {
    const review = this.reviews.get(reviewId);
    if (!review) return null;

    const comment: CodeReviewComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      userName,
      userAvatar,
      content,
      lineNumber,
      filePath,
      timestamp: new Date().toISOString(),
      resolved: false
    };

    review.comments.push(comment);
    review.status = 'commented';
    review.updatedAt = new Date().toISOString();

    // Update reviewer status
    const reviewer = review.reviewers.find(r => r.userId === userId);
    if (reviewer && reviewer.status === 'pending') {
      reviewer.status = 'commented';
      reviewer.submittedAt = new Date().toISOString();
    }

    this.recordHistory(reviewId, userId, 'commented', content.substring(0, 100));
    this.saveToStorage();
    this.notifyListeners('comment:added', comment);
    return comment;
  }

  submitReview(
    reviewId: string,
    userId: string,
    decision: 'approved' | 'changes_requested',
    comment?: string
  ): CodeReview | null {
    const review = this.reviews.get(reviewId);
    if (!review) return null;

    // Update reviewer status
    const reviewer = review.reviewers.find(r => r.userId === userId);
    if (reviewer) {
      reviewer.status = decision;
      reviewer.submittedAt = new Date().toISOString();
    }

    // Update overall review status
    const allApproved = review.reviewers.every(r => r.status === 'approved');
    const anyChangesRequested = review.reviewers.some(r => r.status === 'changes_requested');

    if (allApproved) {
      review.status = 'approved';
    } else if (anyChangesRequested) {
      review.status = 'changes_requested';
    }

    review.updatedAt = new Date().toISOString();

    if (comment) {
      this.addComment(reviewId, userId, 'System', '', comment);
    }

    this.recordHistory(reviewId, userId, decision, comment);
    this.saveToStorage();
    this.notifyListeners('review:updated', review);
    return review;
  }

  resolveComment(reviewId: string, commentId: string, userId: string): CodeReviewComment | null {
    const review = this.reviews.get(reviewId);
    if (!review) return null;

    const comment = review.comments.find(c => c.id === commentId);
    if (comment) {
      comment.resolved = true;
      review.updatedAt = new Date().toISOString();
      this.saveToStorage();
      this.notifyListeners('comment:resolved', comment);
      return comment;
    }
    return null;
  }

  getReviewHistory(reviewId: string): ReviewHistory[] {
    return this.histories
      .filter(h => h.reviewId === reviewId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  getStatistics(teamId: string) {
    const teamReviews = this.getTeamReviews(teamId);
    return {
      totalReviews: teamReviews.length,
      approved: teamReviews.filter(r => r.status === 'approved').length,
      changesRequested: teamReviews.filter(r => r.status === 'changes_requested').length,
      pending: teamReviews.filter(r => r.status === 'pending').length,
      averageCommentsPerReview:
        teamReviews.length > 0
          ? teamReviews.reduce((sum, r) => sum + r.comments.length, 0) / teamReviews.length
          : 0
    };
  }

  on(event: string, callback: Function): Function {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }
}

export const codeReviewService = new CodeReviewService();
