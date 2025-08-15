# Caching and Offline Support

This document describes the caching and offline support implementation for Quran, hadith, and Q&A services.

## Overview

The app now supports intelligent caching with offline fallback for all major data sources:
- **Quran data**: Surahs, Ayahs, Daily Ayah
- **Hadith data**: Search results, Daily Hadith  
- **Q&A data**: Question lists, Individual questions

## Key Features

### Automatic Caching
All services automatically cache data with appropriate TTL (Time To Live):
- Quran Surahs: 30 days
- Surah Ayahs: 7 days  
- Daily content (Ayah/Hadith): 24 hours
- Q&A lists: 12 hours
- Q&A items: 24 hours
- Hadith search: 2 hours

### Offline Support
When the device is offline, services will:
1. Try to return fresh cached data
2. Fall back to stale cached data if fresh cache is unavailable
3. Show appropriate cache indicators to inform users

### Cache Indicators
The `CacheIndicator` component shows when data is served from cache:
- Blue indicator: Fresh cached data
- Orange indicator: Stale cached data (offline mode)

## Usage Examples

### Using Services with Network Awareness

```typescript
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { quranService } from '@/services/quranService';
import { CacheIndicator } from '@/components/CacheIndicator';

function SurahListScreen() {
  const { isConnected } = useNetworkStatus();
  const [surahsResult, setSurahsResult] = useState(null);
  
  useEffect(() => {
    async function loadSurahs() {
      try {
        const result = await quranService.getSurahs(isConnected);
        setSurahsResult(result);
      } catch (error) {
        console.error('Failed to load surahs:', error);
      }
    }
    
    loadSurahs();
  }, [isConnected]);
  
  if (!surahsResult) return <Text>Loading...</Text>;
  
  return (
    <View>
      <CacheIndicator 
        isFromCache={surahsResult.isFromCache} 
        isStale={surahsResult.isStale} 
      />
      {surahsResult.data.map(surah => (
        <Text key={surah.number}>{surah.englishName}</Text>
      ))}
    </View>
  );
}
```

### Using the Cached Data Hook

```typescript
import { useCachedData } from '@/hooks/useCachedData';

function QAListScreen() {
  const { fetchData, isConnected } = useCachedData();
  const [qaResult, setQaResult] = useState(null);
  
  useEffect(() => {
    async function loadQA() {
      try {
        const result = await fetchData(
          'CACHE_QA_LIST_V1_1_20',
          () => api.get('/api/qa', { params: { page: 1, limit: 20 } }),
          60 * 60 * 12 // 12 hours
        );
        setQaResult(result);
      } catch (error) {
        console.error('Failed to load Q&A:', error);
      }
    }
    
    loadQA();
  }, [fetchData]);
  
  return (
    <View>
      <CacheIndicator 
        isFromCache={qaResult?.isFromCache} 
        isStale={qaResult?.isStale} 
      />
      {/* Render Q&A items */}
    </View>
  );
}
```

## Mobile Implementation

The mobile app uses the enhanced `fetchWithCache` function with metadata support:

```typescript
import { fetchWithCacheResult, DefaultCacheTtls, makeCacheKey } from '../utils/cache';

const result = await fetchWithCacheResult(
  makeCacheKey('qa:list', { page, limit }),
  () => apiGet('/api/qa', { params: { page, limit } }),
  {
    ttlMs: DefaultCacheTtls.QAList,
    version: 'v1',
    keyPrefix: 'qa'
  }
);

// result.isFromCache and result.isStale available for UI feedback
```

## Error Handling

Services gracefully handle network errors:
1. Fresh cache is returned if available
2. Stale cache is returned if no fresh cache but device is offline
3. Error is thrown only if no cached data exists and network fails

## Cache Management

Cache keys use consistent versioning (e.g., 'V1') to allow invalidation when data formats change. Daily content includes date stamps to ensure freshness.