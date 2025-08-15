import { apiGet } from './apiClient';
import { DefaultCacheTtls, fetchWithCache, fetchWithCacheResult, makeCacheKey, CacheResult } from '../utils/cache';

export type HadithCollection = {
  id: string;
  name: string;
  arabicName?: string;
  author?: string;
  size?: number;
};

export type Hadith = {
  _id?: string;
  id?: string;
  collection: string;
  bookNumber?: string;
  number?: string;
  text: string;
  translation?: string;
  narrator?: string;
};

export type Paginated<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
};

function normalizeCollection(raw: any): HadithCollection {
  return {
    id: String(raw.id ?? raw.slug ?? raw.key ?? raw._id ?? ''),
    name: raw.name ?? raw.englishName ?? '',
    arabicName: raw.arabicName ?? raw.name_ar,
    author: raw.author ?? raw.compiler,
    size: raw.size ?? raw.hadithCount ?? raw.count,
  };
}

function normalizeHadith(raw: any): Hadith {
  return {
    _id: raw._id ?? raw.id,
    id: raw.id ?? raw._id,
    collection: raw.collection ?? '',
    bookNumber: raw.bookNumber ?? raw.book_number,
    number: raw.number ?? raw.hadith_number,
    text: raw.text ?? raw.arabic ?? '',
    translation: raw.translation ?? raw.english,
    narrator: raw.narrator ?? raw.rawi,
  };
}

export async function getHadithCollections(): Promise<HadithCollection[]> {
  const key = makeCacheKey('hadith:collections');
  return fetchWithCache<HadithCollection[]>(
    key,
    async () => {
      const data = await apiGet<any>('/hadith/collections');
      const list = (data?.data ?? data?.collections ?? data ?? []).map(normalizeCollection);
      return list;
    },
    { ttlMs: DefaultCacheTtls.HadithCollections, version: 'v1', keyPrefix: 'hadith' }
  );
}

export async function searchHadith(query: string, page = 1, limit = 20): Promise<CacheResult<Paginated<Hadith>>> {
  const key = makeCacheKey('hadith:search', { query, page, limit });
  return fetchWithCacheResult<Paginated<Hadith>>(
    key,
    async () => {
      const data = await apiGet<any>('/hadith/search', { params: { q: query, page, limit } });
      const result = {
        data: (data?.data ?? data?.hadith ?? data ?? []).map(normalizeHadith),
        page: data?.page ?? page,
        limit: data?.limit ?? limit,
        total: data?.total ?? 0,
      };
      return result;
    },
    {
      ttlMs: DefaultCacheTtls.HadithSearch,
      version: 'v1',
      keyPrefix: 'hadith',
    }
  );
}

export async function getDailyHadith(): Promise<CacheResult<Hadith>> {
  const key = makeCacheKey('hadith:daily');
  const today = new Date().toDateString();
  
  return fetchWithCacheResult<{ hadith: Hadith; date: string }>(
    key,
    async () => {
      const data = await apiGet<any>('/hadith/daily-hadith');
      const hadith = normalizeHadith(data);
      return { hadith, date: today };
    },
    {
      ttlMs: 24 * 60 * 60 * 1000, // 24 hours
      version: 'v1',
      keyPrefix: 'hadith',
    }
  ).then(result => ({
    data: result.data.hadith,
    isFromCache: result.isFromCache,
    isStale: result.isStale
  }));
}