import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * AsyncStorage wrapper with error handling
 * Provides safe get/set/remove operations
 */

/**
 * Get value from storage
 */
export const getStorageValue = async (key, defaultValue = null) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.error(`Error reading storage key ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Set value in storage
 */
export const setStorageValue = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing storage key ${key}:`, error);
    return false;
  }
};

/**
 * Remove value from storage
 */
export const removeStorageValue = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing storage key ${key}:`, error);
    return false;
  }
};

/**
 * Clear all storage
 */
export const clearStorage = async () => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
};

/**
 * Get all keys in storage
 */
export const getAllStorageKeys = async () => {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (error) {
    console.error('Error getting storage keys:', error);
    return [];
  }
};

/**
 * Offline queue management
 */
export class OfflineQueue {
  static async addToQueue(userId, item) {
    const queueKey = `queue_${userId}`;
    const queue = await getStorageValue(queueKey, []);
    queue.push({
      ...item,
      queuedAt: new Date().toISOString(),
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
    return setStorageValue(queueKey, queue);
  }

  static async getQueue(userId) {
    const queueKey = `queue_${userId}`;
    return getStorageValue(queueKey, []);
  }

  static async clearQueue(userId) {
    const queueKey = `queue_${userId}`;
    return removeStorageValue(queueKey);
  }

  static async removeFromQueue(userId, itemId) {
    const queueKey = `queue_${userId}`;
    const queue = await getStorageValue(queueKey, []);
    const filtered = queue.filter(item => item.id !== itemId);
    return setStorageValue(queueKey, filtered);
  }

  static async processQueue(userId, syncFn) {
    const queue = await this.getQueue(userId);
    if (queue.length === 0) return { success: true, processed: 0 };

    const results = [];
    for (const item of queue) {
      try {
        await syncFn(item);
        await this.removeFromQueue(userId, item.id);
        results.push({ ...item, status: 'success' });
      } catch (error) {
        results.push({ ...item, status: 'failed', error: error.message });
      }
    }

    return {
      success: results.every(r => r.status === 'success'),
      processed: results.filter(r => r.status === 'success').length,
      failed: results.filter(r => r.status === 'failed').length,
      results
    };
  }
}

/**
 * Cache management
 */
export class StorageCache {
  static async set(key, value, ttlSeconds = 3600) {
    const data = {
      value,
      expiresAt: Date.now() + (ttlSeconds * 1000),
      createdAt: Date.now()
    };
    return setStorageValue(key, data);
  }

  static async get(key) {
    const data = await getStorageValue(key);
    if (!data) return null;

    if (data.expiresAt && Date.now() > data.expiresAt) {
      await removeStorageValue(key);
      return null;
    }

    return data.value;
  }

  static async clear(key) {
    return removeStorageValue(key);
  }

  static isExpired(data) {
    if (!data || !data.expiresAt) return true;
    return Date.now() > data.expiresAt;
  }
}

export default {
  getStorageValue,
  setStorageValue,
  removeStorageValue,
  clearStorage,
  getAllStorageKeys,
  OfflineQueue,
  StorageCache
};
