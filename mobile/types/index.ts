/**
 * TypeScript type definitions for the mobile app
 */

export interface User {
  id: string;
  email: string | null;
  isAnonymous: boolean;
  createdAt: string;
  deviceId: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  budget: number;
  budgetRange: string;
  timeWeeks: number;
  timePerWeek: string;
  requiredSkills: string[];
  interests: string[];
  location: string[];
  teamSize: string;
  indoor: boolean;
  outdoor: boolean;
  tutorialLink: string;
  partsNeeded: string[];
  whyGreat: string;
}

export interface ProjectProgress {
  status: 'in-progress' | 'completed' | null;
  startedAt?: string;
  completedAt?: string;
  completionPercentage: number;
  updatedAt?: string;
}

export interface Review {
  rating: number;
  comment: string;
  createdAt: string;
}

export interface UserStats {
  completedProjects: number;
  inProgressProjects: number;
  totalFavorites: number;
  totalReviews: number;
}

export interface SyncQueueItem {
  id: string;
  type: 'progress' | 'review' | 'favorite';
  data: any;
  queuedAt: string;
}

export interface NotificationData {
  type: string;
  [key: string]: any;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface AppContextType {
  // User
  currentUser: User | null;
  loginWithEmail: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;

  // Data
  projects: Project[];
  favorites: string[];
  toggleFavorite: (projectId: string) => Promise<void>;
  updateFavorites: (favorites: string[]) => Promise<void>;

  progress: Record<string, ProjectProgress>;
  updateProgress: (progress: Record<string, ProjectProgress>) => Promise<void>;
  updateProjectProgress: (projectId: string, progressData: Partial<ProjectProgress>) => Promise<void>;

  reviews: Record<string, Review>;
  updateReviews: (reviews: Record<string, Review>) => Promise<void>;
  addReview: (projectId: string, rating: number, comment?: string) => Promise<void>;

  // Sync/Offline
  syncQueue: SyncQueueItem[];
  addToSyncQueue: (item: Omit<SyncQueueItem, 'id' | 'queuedAt'>) => Promise<void>;
  processSyncQueue: () => Promise<{ success: boolean; processed: number; failed?: number }>;

  // Stats
  getUserStats: () => UserStats;

  // Loading
  isLoading: boolean;
}

export interface ScreenProps {
  navigation: any;
  route?: any;
}
