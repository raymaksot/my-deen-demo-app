import { useNetworkStatus } from './useNetworkStatus';
import { fetchWithOfflineSupport, CachedResponse } from '../utils/cache';
import { useCallback } from 'react';

export function useCachedData() {
  const { isConnected } = useNetworkStatus();
  
  const fetchData = useCallback(async <T>(
    cacheKey: string,
    networkFetcher: () => Promise<T>,
    ttlSeconds: number = 3600 // 1 hour default
  ): Promise<CachedResponse<T>> => {
    return fetchWithOfflineSupport(cacheKey, networkFetcher, ttlSeconds, isConnected);
  }, [isConnected]);
  
  return {
    fetchData,
    isConnected
  };
}