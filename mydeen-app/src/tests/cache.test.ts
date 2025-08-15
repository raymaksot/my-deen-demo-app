import { appStorage, getCached, setCached, getCachedStale, fetchWithOfflineSupport } from '../utils/cache';

// Mock appStorage for testing
jest.mock('../utils/cache', () => {
  const mockStorage = new Map();
  return {
    ...jest.requireActual('../utils/cache'),
    appStorage: {
      set: jest.fn((key, value) => {
        mockStorage.set(key, JSON.stringify(value));
        return Promise.resolve();
      }),
      get: jest.fn((key) => {
        const value = mockStorage.get(key);
        return Promise.resolve(value ? JSON.parse(value) : null);
      }),
      remove: jest.fn((key) => {
        mockStorage.delete(key);
        return Promise.resolve();
      }),
      setObject: jest.fn(),
      getObject: jest.fn(),
    }
  };
});

describe('Cache Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setCached and getCached', () => {
    it('should store and retrieve cached data', async () => {
      const testData = { id: 1, name: 'Test' };
      const key = 'test_key';
      const ttl = 3600; // 1 hour

      await setCached(key, testData, ttl);
      const retrieved = await getCached(key);

      expect(retrieved).toEqual(testData);
    });

    it('should return null for expired cache', async () => {
      const testData = { id: 1, name: 'Test' };
      const key = 'test_key';
      const ttl = -1; // Already expired

      await setCached(key, testData, ttl);
      const retrieved = await getCached(key);

      expect(retrieved).toBeNull();
    });
  });

  describe('getCachedStale', () => {
    it('should return stale data with isStale flag', async () => {
      const testData = { id: 1, name: 'Test' };
      const key = 'test_key';
      const ttl = -1; // Already expired

      await setCached(key, testData, ttl);
      const result = await getCachedStale(key);

      expect(result).toEqual({
        value: testData,
        isStale: true
      });
    });
  });

  describe('fetchWithOfflineSupport', () => {
    const mockFetcher = jest.fn();

    beforeEach(() => {
      mockFetcher.mockClear();
    });

    it('should return fresh data when online and no cache', async () => {
      const freshData = { id: 2, name: 'Fresh' };
      mockFetcher.mockResolvedValue(freshData);

      const result = await fetchWithOfflineSupport(
        'test_fetch',
        mockFetcher,
        3600,
        true // isConnected
      );

      expect(result).toEqual({
        data: freshData,
        isFromCache: false
      });
      expect(mockFetcher).toHaveBeenCalled();
    });

    it('should return cached data when offline', async () => {
      const cachedData = { id: 1, name: 'Cached' };
      await setCached('test_offline', cachedData, 3600);

      const result = await fetchWithOfflineSupport(
        'test_offline',
        mockFetcher,
        3600,
        false // isConnected = false
      );

      expect(result).toEqual({
        data: cachedData,
        isFromCache: true
      });
      expect(mockFetcher).not.toHaveBeenCalled();
    });

    it('should return stale cache when network fails', async () => {
      const staleData = { id: 1, name: 'Stale' };
      await setCached('test_stale', staleData, -1); // Expired
      
      mockFetcher.mockRejectedValue(new Error('Network error'));

      const result = await fetchWithOfflineSupport(
        'test_stale',
        mockFetcher,
        3600,
        true // isConnected but network fails
      );

      expect(result).toEqual({
        data: staleData,
        isFromCache: true,
        isStale: true
      });
    });
  });
});