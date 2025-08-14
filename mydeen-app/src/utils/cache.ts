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
