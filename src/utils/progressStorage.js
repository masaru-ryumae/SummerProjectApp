/**
 * Pure utility functions for managing project progress
 * Tracks milestones, notes, and timeline events
 */

// Default milestones for all projects
const DEFAULT_MILESTONES = [
  'Ordered parts',
  'Assembled components',
  'Wrote initial code',
  'Tested functionality',
  'Documented project'
];

/**
 * Initialize progress for a project
 * @param {string} projectId - Project ID
 * @returns {Object} - Initialized progress object
 */
export const initializeProgress = (projectId) => {
  return {
    projectId,
    milestones: [false, false, false, false, false],
    notes: '',
    startDate: new Date().toISOString().split('T')[0],
    lastUpdated: new Date().toISOString().split('T')[0],
    percentComplete: 0,
    timeline: [
      {
        event: 'started',
        date: new Date().toISOString().split('T')[0],
        description: 'Started project'
      }
    ]
  };
};

/**
 * Calculate percentage completion from milestones
 * @param {Array<boolean>} milestones - Array of milestone completion flags
 * @returns {number} - Percentage 0-100
 */
export const calculatePercentage = (milestones) => {
  if (!Array.isArray(milestones) || milestones.length === 0) return 0;

  const completed = milestones.filter(m => m === true).length;
  return Math.round((completed / milestones.length) * 100);
};

/**
 * Get progress for a project
 * @param {Object} allProgress - All progress data
 * @param {string} projectId - Project ID to retrieve
 * @returns {Object} - Progress object or initialized empty progress
 */
export const getProgress = (allProgress, projectId) => {
  if (!allProgress || !projectId) {
    return null;
  }

  const progress = allProgress[projectId];
  if (!progress) {
    return null;
  }

  return progress;
};

/**
 * Update a milestone for a project
 * @param {Object} allProgress - All progress data
 * @param {string} projectId - Project ID
 * @param {number} milestoneIndex - Index of milestone to update
 * @param {boolean} completed - Whether milestone is completed
 * @returns {Object} - Updated progress object
 */
export const updateMilestone = (allProgress, projectId, milestoneIndex, completed) => {
  const progress = getProgress(allProgress, projectId);
  if (!progress) return null;

  const updatedProgress = { ...progress };
  updatedProgress.milestones = [...progress.milestones];
  updatedProgress.milestones[milestoneIndex] = completed;
  updatedProgress.lastUpdated = new Date().toISOString().split('T')[0];
  updatedProgress.percentComplete = calculatePercentage(updatedProgress.milestones);

  // Add timeline event for milestone completion
  if (completed) {
    const milestoneName = DEFAULT_MILESTONES[milestoneIndex];
    updatedProgress.timeline = [
      ...progress.timeline,
      {
        event: 'milestone',
        date: new Date().toISOString().split('T')[0],
        description: `Completed milestone: ${milestoneName}`
      }
    ];
  }

  return updatedProgress;
};

/**
 * Add or update notes for a project
 * @param {Object} allProgress - All progress data
 * @param {string} projectId - Project ID
 * @param {string} noteText - Note text (max 500 chars)
 * @returns {Object} - Updated progress object
 */
export const addNote = (allProgress, projectId, noteText) => {
  const progress = getProgress(allProgress, projectId);
  if (!progress) return null;

  const updatedProgress = { ...progress };
  updatedProgress.notes = noteText.substring(0, 500);
  updatedProgress.lastUpdated = new Date().toISOString().split('T')[0];

  // Add timeline event
  updatedProgress.timeline = [
    ...progress.timeline,
    {
      event: 'note',
      date: new Date().toISOString().split('T')[0],
      description: 'Added note'
    }
  ];

  return updatedProgress;
};

/**
 * Add a timeline event
 * @param {Object} allProgress - All progress data
 * @param {string} projectId - Project ID
 * @param {string} eventType - Type of event (started, milestone, note, favorite, etc)
 * @param {string} description - Event description
 * @returns {Object} - Updated progress object
 */
export const addTimelineEvent = (allProgress, projectId, eventType, description) => {
  const progress = getProgress(allProgress, projectId);
  if (!progress) return null;

  const updatedProgress = { ...progress };
  updatedProgress.timeline = [
    ...progress.timeline,
    {
      event: eventType,
      date: new Date().toISOString().split('T')[0],
      description
    }
  ];
  updatedProgress.lastUpdated = new Date().toISOString().split('T')[0];

  return updatedProgress;
};

/**
 * Get milestone label by index
 * @param {number} index - Milestone index
 * @returns {string} - Milestone label
 */
export const getMilestoneLabel = (index) => {
  return DEFAULT_MILESTONES[index] || '';
};

/**
 * Get all milestone labels
 * @returns {Array<string>} - Array of milestone labels
 */
export const getAllMilestones = () => {
  return [...DEFAULT_MILESTONES];
};

/**
 * Format date for display
 * @param {string} dateString - ISO date string (YYYY-MM-DD)
 * @returns {string} - Formatted date (e.g., "Jun 10")
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Get time elapsed since a date
 * @param {string} dateString - ISO date string (YYYY-MM-DD)
 * @returns {string} - Time elapsed (e.g., "2 hours ago", "3 days ago")
 */
export const getTimeElapsed = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString + 'T00:00:00');
  const now = new Date();
  const diff = Math.floor((now - date) / 1000); // seconds

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;

  return `${Math.floor(diff / 604800)} weeks ago`;
};

/**
 * Clear all progress for a project
 * @param {Object} allProgress - All progress data
 * @param {string} projectId - Project ID to clear
 * @returns {Object} - All progress with project cleared
 */
export const clearProgress = (allProgress, projectId) => {
  if (!allProgress || !projectId) return allProgress;

  const updated = { ...allProgress };
  delete updated[projectId];
  return updated;
};
