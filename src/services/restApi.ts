import crypto from 'crypto';

export interface ApiKey {
  id: string; key: string; name: string; createdAt: Date; lastUsedAt: Date | null;
  expiresAt: Date | null; permissions: string[]; rateLimit: { requestsPerHour: number };
}

export interface ApiKeyUsage {
  keyId: string; endpoint: string; method: string; statusCode: number; timestamp: Date; responseTime: number;
}

export interface ApiResponse<T = any> {
  success: boolean; data?: T; error?: string; meta?: { timestamp: string; version: string };
}

export interface PaginationParams {
  page: number; limit: number; offset?: number;
}

export interface FilterParams {
  [key: string]: any;
}

export interface SortParams {
  field: string; order: 'asc' | 'desc';
}

export const API_ENDPOINTS = {
  GET_PROJECTS: 'GET /projects', GET_PROJECT: 'GET /projects/:id', CREATE_PROJECT: 'POST /projects',
  UPDATE_PROJECT: 'PUT /projects/:id', DELETE_PROJECT: 'DELETE /projects/:id', SEARCH_PROJECTS: 'GET /projects/search',
  GET_USERS: 'GET /users', GET_USER: 'GET /users/:id', CREATE_USER: 'POST /users', UPDATE_USER: 'PUT /users/:id',
  DELETE_USER: 'DELETE /users/:id', GET_USER_PROFILE: 'GET /users/:id/profile',
  GET_REVIEWS: 'GET /reviews', GET_PROJECT_REVIEWS: 'GET /projects/:id/reviews', CREATE_REVIEW: 'POST /reviews',
  UPDATE_REVIEW: 'PUT /reviews/:id', DELETE_REVIEW: 'DELETE /reviews/:id',
  GET_RATINGS: 'GET /ratings', CREATE_RATING: 'POST /ratings', UPDATE_RATING: 'PUT /ratings/:id', DELETE_RATING: 'DELETE /ratings/:id',
  GET_FAVORITES: 'GET /favorites', ADD_FAVORITE: 'POST /favorites', REMOVE_FAVORITE: 'DELETE /favorites/:id',
  GET_ANALYTICS: 'GET /analytics', GET_PROJECT_ANALYTICS: 'GET /projects/:id/analytics', GET_USER_ANALYTICS: 'GET /users/:id/analytics',
  GET_RECOMMENDATIONS: 'GET /ai/recommendations', POST_RECOMMENDATIONS: 'POST /ai/recommendations',
  GET_API_KEYS: 'GET /api/keys', CREATE_API_KEY: 'POST /api/keys', UPDATE_API_KEY: 'PUT /api/keys/:id',
  DELETE_API_KEY: 'DELETE /api/keys/:id', GET_API_USAGE: 'GET /api/usage',
};

class RestApiImpl {
  private apiKeys: Map<string, ApiKey> = new Map();
  private keyUsage: ApiKeyUsage[] = [];

  generateApiKey(name: string, permissions: string[] = ['read:public'], expiresInDays?: number): ApiKey {
    const id = crypto.randomUUID();
    const key = `spf_${crypto.randomBytes(32).toString('hex')}`;
    const apiKey: ApiKey = {
      id, key, name, createdAt: new Date(), lastUsedAt: null,
      expiresAt: expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : null,
      permissions, rateLimit: { requestsPerHour: 1000 },
    };
    this.apiKeys.set(id, apiKey);
    return apiKey;
  }

  getApiKey(id: string): ApiKey | undefined {
    return this.apiKeys.get(id);
  }

  getApiKeyByToken(token: string): ApiKey | undefined {
    for (const key of this.apiKeys.values()) {
      if (key.key === token) return key;
    }
    return undefined;
  }

  listApiKeys(): ApiKey[] {
    return Array.from(this.apiKeys.values()).map(key => ({
      ...key,
      key: `${key.key.substring(0, 7)}...${key.key.substring(key.key.length - 4)}`,
    }));
  }

  updateApiKey(id: string, updates: Partial<ApiKey>): ApiKey | null {
    const apiKey = this.apiKeys.get(id);
    if (!apiKey) return null;
    const updated = { ...apiKey, ...updates, id: apiKey.id, key: apiKey.key, createdAt: apiKey.createdAt };
    this.apiKeys.set(id, updated);
    return updated;
  }

  deleteApiKey(id: string): boolean {
    return this.apiKeys.delete(id);
  }

  validateApiKey(token: string): boolean {
    const apiKey = this.getApiKeyByToken(token);
    if (!apiKey) return false;
    if (apiKey.expiresAt && new Date() > apiKey.expiresAt) return false;
    return true;
  }

  hasPermission(apiKey: ApiKey, permission: string): boolean {
    return apiKey.permissions.includes(permission) || apiKey.permissions.includes('admin');
  }

  recordUsage(keyId: string, endpoint: string, method: string, statusCode: number, responseTime: number): void {
    const apiKey = this.getApiKey(keyId);
    if (!apiKey) return;
    apiKey.lastUsedAt = new Date();
    this.keyUsage.push({ keyId, endpoint, method, statusCode, timestamp: new Date(), responseTime });
    if (this.keyUsage.length > 10000) this.keyUsage = this.keyUsage.slice(-10000);
  }

  getUsageStats(keyId: string, hoursBack: number = 24): any {
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
    const relevantUsage = this.keyUsage.filter(usage => usage.keyId === keyId && usage.timestamp > cutoffTime);
    const totalRequests = relevantUsage.length;
    const successfulRequests = relevantUsage.filter(u => u.statusCode < 400).length;
    const failedRequests = relevantUsage.filter(u => u.statusCode >= 400).length;
    const averageResponseTime = totalRequests > 0 ? relevantUsage.reduce((sum, u) => sum + u.responseTime, 0) / totalRequests : 0;
    const endpointCounts = new Map<string, number>();
    relevantUsage.forEach(usage => endpointCounts.set(usage.endpoint, (endpointCounts.get(usage.endpoint) || 0) + 1));
    const topEndpoints = Array.from(endpointCounts.entries()).map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count).slice(0, 10);
    return { totalRequests, successfulRequests, failedRequests, averageResponseTime: Math.round(averageResponseTime), topEndpoints };
  }

  formatResponse<T>(success: boolean, data?: T, error?: string): ApiResponse<T> {
    return {
      success, ...(data !== undefined && { data }), ...(error && { error }),
      meta: { timestamp: new Date().toISOString(), version: '1.0.0' },
    };
  }

  paginate<T>(data: T[], page: number, limit: number): any {
    const total = data.length;
    const pages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    return { data: data.slice(offset, offset + limit), pagination: { page, limit, total, pages } };
  }

  filter<T extends Record<string, any>>(data: T[], filters: FilterParams): T[] {
    return data.filter(item => {
      for (const [key, value] of Object.entries(filters)) {
        if (key.startsWith('gt_')) {
          const field = key.substring(3);
          if (!(item[field] > value)) return false;
        } else if (key.startsWith('lt_')) {
          const field = key.substring(3);
          if (!(item[field] < value)) return false;
        } else if (key.startsWith('contains_')) {
          const field = key.substring(9);
          if (!(String(item[field]).includes(String(value)))) return false;
        } else if (item[key] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  sort<T extends Record<string, any>>(data: T[], sorts: SortParams[]): T[] {
    return data.sort((a, b) => {
      for (const sort of sorts) {
        const aVal = a[sort.field];
        const bVal = b[sort.field];
        if (aVal < bVal) return sort.order === 'asc' ? -1 : 1;
        if (aVal > bVal) return sort.order === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
}

export const restApi = new RestApiImpl();
