import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as projectsData from '../data/projects.json';

/**
 * App Context for managing global state
 * Handles user, favorites, progress, and reviews
 */
export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [progress, setProgress] = useState({});
  const [reviews, setReviews] = useState({});
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [syncQueue, setSyncQueue] = useState([]);

  // Initialize user and load persisted data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load or create user
        let user = await AsyncStorage.getItem('app_user');

        if (!user) {
          user = {
            id: `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            email: null,
            isAnonymous: true,
            createdAt: new Date().toISOString(),
            deviceId: `device_${Math.random().toString(36).substr(2, 9)}`
          };
          await AsyncStorage.setItem('app_user', JSON.stringify(user));
        } else {
          user = JSON.parse(user);
        }

        setCurrentUser(user);

        // Load projects
        setProjects(projectsData);

        // Load persisted data
        const [savedFavorites, savedProgress, savedReviews, savedSyncQueue] = await Promise.all([
          AsyncStorage.getItem(`favorites_${user.id}`),
          AsyncStorage.getItem(`progress_${user.id}`),
          AsyncStorage.getItem(`reviews_${user.id}`),
          AsyncStorage.getItem(`syncQueue_${user.id}`)
        ]);

        if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
        if (savedProgress) setProgress(JSON.parse(savedProgress));
        if (savedReviews) setReviews(JSON.parse(savedReviews));
        if (savedSyncQueue) setSyncQueue(JSON.parse(savedSyncQueue));

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  /**
   * Update favorites and persist to storage
   */
  const updateFavorites = async (newFavorites) => {
    setFavorites(newFavorites);
    if (currentUser) {
      await AsyncStorage.setItem(
        `favorites_${currentUser.id}`,
        JSON.stringify(newFavorites)
      );
    }
  };

  /**
   * Add or remove favorite
   */
  const toggleFavorite = async (projectId) => {
    const isFavorite = favorites.includes(projectId);
    const updated = isFavorite
      ? favorites.filter(id => id !== projectId)
      : [...favorites, projectId];
    await updateFavorites(updated);
  };

  /**
   * Update progress and persist to storage
   */
  const updateProgress = async (newProgress) => {
    setProgress(newProgress);
    if (currentUser) {
      await AsyncStorage.setItem(
        `progress_${currentUser.id}`,
        JSON.stringify(newProgress)
      );
      // Queue for sync when online
      await addToSyncQueue({ type: 'progress', data: newProgress });
    }
  };

  /**
   * Update progress for a specific project
   */
  const updateProjectProgress = async (projectId, progressData) => {
    const updated = {
      ...progress,
      [projectId]: {
        ...progress[projectId],
        ...progressData,
        updatedAt: new Date().toISOString()
      }
    };
    await updateProgress(updated);
  };

  /**
   * Update reviews and persist to storage
   */
  const updateReviews = async (newReviews) => {
    setReviews(newReviews);
    if (currentUser) {
      await AsyncStorage.setItem(
        `reviews_${currentUser.id}`,
        JSON.stringify(newReviews)
      );
    }
  };

  /**
   * Add or update review for a project
   */
  const addReview = async (projectId, rating, comment = '') => {
    const updated = {
      ...reviews,
      [projectId]: {
        rating,
        comment,
        createdAt: new Date().toISOString()
      }
    };
    await updateReviews(updated);
  };

  /**
   * Add item to offline sync queue
   */
  const addToSyncQueue = async (item) => {
    const updated = [...syncQueue, { ...item, queuedAt: new Date().toISOString() }];
    setSyncQueue(updated);
    if (currentUser) {
      await AsyncStorage.setItem(
        `syncQueue_${currentUser.id}`,
        JSON.stringify(updated)
      );
    }
  };

  /**
   * Process sync queue (for future backend integration)
   */
  const processSyncQueue = async () => {
    if (syncQueue.length === 0) return;

    try {
      // In a real app, send to backend API here
      // For now, just clear the queue
      setSyncQueue([]);
      if (currentUser) {
        await AsyncStorage.removeItem(`syncQueue_${currentUser.id}`);
      }
    } catch (error) {
      console.error('Failed to sync:', error);
    }
  };

  /**
   * Get user statistics
   */
  const getUserStats = () => {
    const completedProjects = Object.values(progress).filter(
      p => p.status === 'completed'
    ).length;
    const inProgressProjects = Object.values(progress).filter(
      p => p.status === 'in-progress'
    ).length;
    const totalFavorites = favorites.length;

    return {
      completedProjects,
      inProgressProjects,
      totalFavorites,
      totalReviews: Object.keys(reviews).length
    };
  };

  /**
   * Auth methods (placeholder for future Supabase integration)
   */
  const loginWithEmail = async (email, password) => {
    // TODO: Integrate with Supabase
    const user = {
      id: `user_${Date.now()}`,
      email,
      isAnonymous: false,
      createdAt: new Date().toISOString(),
      deviceId: `device_${Math.random().toString(36).substr(2, 9)}`
    };
    await AsyncStorage.setItem('app_user', JSON.stringify(user));
    setCurrentUser(user);
    return user;
  };

  const logout = async () => {
    if (currentUser) {
      await Promise.all([
        AsyncStorage.removeItem('app_user'),
        AsyncStorage.removeItem(`favorites_${currentUser.id}`),
        AsyncStorage.removeItem(`progress_${currentUser.id}`),
        AsyncStorage.removeItem(`reviews_${currentUser.id}`),
        AsyncStorage.removeItem(`syncQueue_${currentUser.id}`)
      ]);
    }
    setCurrentUser(null);
    setFavorites([]);
    setProgress({});
    setReviews({});
    setSyncQueue([]);
  };

  const value = {
    // User
    currentUser,
    loginWithEmail,
    logout,
    // Data
    projects,
    favorites,
    toggleFavorite,
    updateFavorites,
    progress,
    updateProgress,
    updateProjectProgress,
    reviews,
    updateReviews,
    addReview,
    // Sync/Offline
    syncQueue,
    addToSyncQueue,
    processSyncQueue,
    // Stats
    getUserStats,
    // Loading
    isLoading
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

/**
 * Hook to use AppContext
 */
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
