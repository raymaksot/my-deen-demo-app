import AsyncStorage from '@react-native-async-storage/async-storage';

export const appStorage = {
  set: (key: string, value: any) => AsyncStorage.setItem(key, JSON.stringify(value)),
  get: async (key: string) => {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  },
  remove: (key: string) => AsyncStorage.removeItem(key),
  setObject: (key: string, value: any) => AsyncStorage.setItem(key, JSON.stringify(value)),
  getObject: async <T>(key: string): Promise<T | null> => {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }
};

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expirationTime: number;
}

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    
    const entry: CacheEntry<T> = JSON.parse(raw);
    const now = Date.now();
    
    // Check if cache entry has expired
    if (now > entry.expirationTime) {
      await AsyncStorage.removeItem(key);
      return null;
    }
    
    return entry.data;
  } catch (error) {
    console.error('Error getting cached data:', error);
    return null;
  }
}

export async function setCached<T>(key: string, data: T, expirationInSeconds: number): Promise<void> {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      expirationTime: Date.now() + (expirationInSeconds * 1000)
    };
    
    await AsyncStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    console.error('Error setting cached data:', error);
  }
}
