import AsyncStorage from '@react-native-async-storage/async-storage';

export const appStorage = {
  set: (key: string, value: any) => AsyncStorage.setItem(key, JSON.stringify(value)),
  get: async (key: string) => {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  },
  remove: (key: string) => AsyncStorage.removeItem(key),
  
  // Convenience methods for object storage
  setObject: async <T>(key: string, value: T) => {
    return AsyncStorage.setItem(key, JSON.stringify(value));
  },
  getObject: async <T>(key: string): Promise<T | null> => {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }
};

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const cached = await appStorage.get(key) as CacheEntry<T> | null;
    if (!cached) return null;
    
    if (cached.expiresAt <= Date.now()) {
      await appStorage.remove(key);
      return null;
    }
    
    return cached.value;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function setCached<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  try {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    const cacheEntry: CacheEntry<T> = { value, expiresAt };
    await appStorage.set(key, cacheEntry);
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

// Get cached data even if expired (for offline scenarios)
export async function getCachedStale<T>(key: string): Promise<{ value: T; isStale: boolean } | null> {
  try {
    const cached = await appStorage.get(key) as CacheEntry<T> | null;
    if (!cached) return null;
    
    const isStale = cached.expiresAt <= Date.now();
    return { value: cached.value, isStale };
  } catch (error) {
    console.error('Cache get stale error:', error);
    return null;
  }
}

export interface CachedResponse<T> {
  data: T;
  isFromCache: boolean;
  isStale?: boolean;
}

// Wrapper that tries network first, falls back to cache
export async function fetchWithOfflineSupport<T>(
  cacheKey: string,
  networkFetcher: () => Promise<T>,
  ttlSeconds: number,
  isConnected: boolean = true
): Promise<CachedResponse<T>> {
  // If offline, try to get any cached data (even stale)
  if (!isConnected) {
    const staleData = await getCachedStale<T>(cacheKey);
    if (staleData) {
      return {
        data: staleData.value,
        isFromCache: true,
        isStale: staleData.isStale
      };
    }
    throw new Error('No cached data available and device is offline');
  }
  
  // Check fresh cache first
  const cached = await getCached<T>(cacheKey);
  if (cached) {
    return { data: cached, isFromCache: true };
  }
  
  try {
    // Try to fetch from network
    const freshData = await networkFetcher();
    await setCached(cacheKey, freshData, ttlSeconds);
    return { data: freshData, isFromCache: false };
  } catch (error) {
    // Network failed, try stale cache
    const staleData = await getCachedStale<T>(cacheKey);
    if (staleData) {
      return {
        data: staleData.value,
        isFromCache: true,
        isStale: true
      };
    }
    throw error;
  }
}
