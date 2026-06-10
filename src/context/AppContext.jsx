import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [progress, setProgress] = useState({});
  const [reviews, setReviews] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Initialize user on mount
  useEffect(() => {
    const initializeUser = () => {
      // Check localStorage for existing user
      let user = localStorage.getItem('app_user');

      if (!user) {
        // Create anonymous user with device ID
        user = {
          id: `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          email: null,
          isAnonymous: true,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem('app_user', JSON.stringify(user));
      } else {
        user = JSON.parse(user);
      }

      setCurrentUser(user);

      // Load persisted data
      const savedFavorites = localStorage.getItem(`favorites_${user.id}`);
      const savedProgress = localStorage.getItem(`progress_${user.id}`);
      const savedReviews = localStorage.getItem(`reviews_${user.id}`);

      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
      if (savedProgress) setProgress(JSON.parse(savedProgress));
      if (savedReviews) setReviews(JSON.parse(savedReviews));

      setIsLoading(false);
    };

    initializeUser();
  }, []);

  // Persist favorites
  const updateFavorites = (newFavorites) => {
    setFavorites(newFavorites);
    if (currentUser) {
      localStorage.setItem(`favorites_${currentUser.id}`, JSON.stringify(newFavorites));
    }
  };

  // Persist progress
  const updateProgress = (newProgress) => {
    setProgress(newProgress);
    if (currentUser) {
      localStorage.setItem(`progress_${currentUser.id}`, JSON.stringify(newProgress));
    }
  };

  // Persist reviews
  const updateReviews = (newReviews) => {
    setReviews(newReviews);
    if (currentUser) {
      localStorage.setItem(`reviews_${currentUser.id}`, JSON.stringify(newReviews));
    }
  };

  // Auth methods
  const loginWithEmail = async (email, password) => {
    // Placeholder: integrate with Supabase in future
    const user = {
      id: `user_${Date.now()}`,
      email,
      isAnonymous: false,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('app_user', JSON.stringify(user));
    setCurrentUser(user);
    return user;
  };

  const signupWithEmail = async (email, password) => {
    // Placeholder: integrate with Supabase in future
    return loginWithEmail(email, password);
  };

  const logout = () => {
    localStorage.removeItem('app_user');
    localStorage.removeItem(`favorites_${currentUser?.id}`);
    localStorage.removeItem(`progress_${currentUser?.id}`);
    localStorage.removeItem(`reviews_${currentUser?.id}`);
    setCurrentUser(null);
    setFavorites([]);
    setProgress({});
    setReviews({});
  };

  const value = {
    currentUser,
    favorites,
    updateFavorites,
    progress,
    updateProgress,
    reviews,
    updateReviews,
    loginWithEmail,
    signupWithEmail,
    logout,
    isLoading
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
