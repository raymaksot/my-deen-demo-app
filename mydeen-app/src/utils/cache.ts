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
