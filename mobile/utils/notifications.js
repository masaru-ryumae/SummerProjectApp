import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Initialize notifications
 * Set up notification handlers and request permissions
 */
export const initializeNotifications = async () => {
  try {
    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Request permissions
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      await Notifications.requestPermissionsAsync();
    }

    return true;
  } catch (error) {
    console.error('Failed to initialize notifications:', error);
    return false;
  }
};

/**
 * Send local notification
 */
export const sendNotification = async (title, body, data = {}) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        badge: 1,
        data,
      },
      trigger: { seconds: 1 },
    });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};

/**
 * Schedule notification for later
 */
export const scheduleNotification = async (
  title,
  body,
  triggerSeconds = 3600,
  data = {}
) => {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        badge: 1,
        data,
      },
      trigger: { seconds: triggerSeconds },
    });

    return notificationId;
  } catch (error) {
    console.error('Failed to schedule notification:', error);
    return null;
  }
};

/**
 * Project reminder notification
 */
export const sendProjectReminder = async (projectTitle) => {
  await sendNotification(
    'Project Reminder',
    `Don't forget: ${projectTitle}`,
    { type: 'project-reminder' }
  );
};

/**
 * Achievement unlocked notification
 */
export const sendAchievementNotification = async (achievementName, description) => {
  await sendNotification(
    '🏆 Achievement Unlocked!',
    `${achievementName}: ${description}`,
    { type: 'achievement', name: achievementName }
  );
};

/**
 * Project milestone notification
 */
export const sendMilestoneNotification = async (
  projectTitle,
  milestone,
  progress
) => {
  await sendNotification(
    '🎯 Milestone Reached!',
    `${projectTitle}: ${milestone} (${progress}% complete)`,
    { type: 'milestone', project: projectTitle, progress }
  );
};

/**
 * Streak notification
 */
export const sendStreakNotification = async (streakCount) => {
  await sendNotification(
    '🔥 Keep Your Streak Going!',
    `You have a ${streakCount}-day streak! Keep working on projects!`,
    { type: 'streak', count: streakCount }
  );
};

/**
 * Achievement definitions
 */
export const ACHIEVEMENTS = {
  FIRST_PROJECT: {
    id: 'first-project',
    name: 'Getting Started',
    description: 'Start your first project',
    icon: '🚀'
  },
  FIVE_PROJECTS: {
    id: 'five-projects',
    name: 'Project Explorer',
    description: 'Start 5 projects',
    icon: '🔭'
  },
  FIRST_COMPLETE: {
    id: 'first-complete',
    name: 'Project Master',
    description: 'Complete your first project',
    icon: '✅'
  },
  FIVE_COMPLETE: {
    id: 'five-complete',
    name: 'Builder',
    description: 'Complete 5 projects',
    icon: '🏗️'
  },
  FAVORITE_FIVE: {
    id: 'favorite-five',
    name: 'Collector',
    description: 'Save 5 favorite projects',
    icon: '⭐'
  },
  REVIEWER: {
    id: 'reviewer',
    name: 'Critic',
    description: 'Review 3 projects',
    icon: '📝'
  },
  TEN_COMPLETE: {
    id: 'ten-complete',
    name: 'Legend',
    description: 'Complete 10 projects',
    icon: '👑'
  },
  STREAK_7: {
    id: 'streak-7',
    name: 'Consistent',
    description: 'Maintain a 7-day streak',
    icon: '🔥'
  }
};

/**
 * Get achievements for user
 */
export const getUnlockedAchievements = async (userId, stats) => {
  const unlockedKey = `achievements_${userId}`;
  const unlocked = await AsyncStorage.getItem(unlockedKey);
  const unlockedSet = new Set(unlocked ? JSON.parse(unlocked) : []);

  const newlyUnlocked = [];

  // Check achievement conditions
  if (
    stats.completedProjects >= 1 &&
    !unlockedSet.has(ACHIEVEMENTS.FIRST_COMPLETE.id)
  ) {
    newlyUnlocked.push(ACHIEVEMENTS.FIRST_COMPLETE);
    unlockedSet.add(ACHIEVEMENTS.FIRST_COMPLETE.id);
  }

  if (
    stats.completedProjects >= 5 &&
    !unlockedSet.has(ACHIEVEMENTS.FIVE_COMPLETE.id)
  ) {
    newlyUnlocked.push(ACHIEVEMENTS.FIVE_COMPLETE);
    unlockedSet.add(ACHIEVEMENTS.FIVE_COMPLETE.id);
  }

  if (
    stats.totalFavorites >= 5 &&
    !unlockedSet.has(ACHIEVEMENTS.FAVORITE_FIVE.id)
  ) {
    newlyUnlocked.push(ACHIEVEMENTS.FAVORITE_FIVE);
    unlockedSet.add(ACHIEVEMENTS.FAVORITE_FIVE.id);
  }

  if (
    stats.totalReviews >= 3 &&
    !unlockedSet.has(ACHIEVEMENTS.REVIEWER.id)
  ) {
    newlyUnlocked.push(ACHIEVEMENTS.REVIEWER);
    unlockedSet.add(ACHIEVEMENTS.REVIEWER.id);
  }

  if (
    stats.completedProjects >= 10 &&
    !unlockedSet.has(ACHIEVEMENTS.TEN_COMPLETE.id)
  ) {
    newlyUnlocked.push(ACHIEVEMENTS.TEN_COMPLETE);
    unlockedSet.add(ACHIEVEMENTS.TEN_COMPLETE.id);
  }

  // Save unlocked achievements
  if (newlyUnlocked.length > 0) {
    await AsyncStorage.setItem(unlockedKey, JSON.stringify(Array.from(unlockedSet)));
  }

  return {
    unlocked: Array.from(unlockedSet),
    newlyUnlocked
  };
};

/**
 * Cancel notification
 */
export const cancelNotification = async (notificationId) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error('Failed to cancel notification:', error);
  }
};

/**
 * Get all scheduled notifications
 */
export const getScheduledNotifications = async () => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Failed to get scheduled notifications:', error);
    return [];
  }
};

export default {
  initializeNotifications,
  sendNotification,
  scheduleNotification,
  sendProjectReminder,
  sendAchievementNotification,
  sendMilestoneNotification,
  sendStreakNotification,
  ACHIEVEMENTS,
  getUnlockedAchievements,
  cancelNotification,
  getScheduledNotifications
};
