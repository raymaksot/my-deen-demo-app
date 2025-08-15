import { apiGet } from './apiClient';
import { DefaultCacheTtls, fetchWithCacheResult, makeCacheKey, CacheResult } from '../utils/cache';

export type QAItem = {
  _id: string;
  title: string;
  question: string;
  answer?: string;
  askedBy?: string;
  answeredBy?: string;
  createdAt?: string;
};

export type Paginated<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
};

function normalizeQAItem(raw: any): QAItem {
  return {
    _id: String(raw._id ?? raw.id ?? ''),
    title: raw.title ?? '',
    question: raw.question ?? '',
    answer: raw.answer,
    askedBy: raw.askedBy ?? raw.asked_by,
    answeredBy: raw.answeredBy ?? raw.answered_by,
    createdAt: raw.createdAt ?? raw.created_at,
  };
}

export async function getQAList(page = 1, limit = 20): Promise<CacheResult<Paginated<QAItem>>> {
  const key = makeCacheKey('qa:list', { page, limit });
  return fetchWithCacheResult<Paginated<QAItem>>(
    key,
    async () => {
      const data = await apiGet<any>('/qa', { params: { page, limit } });
      const result = {
        data: (data?.data ?? data?.items ?? data ?? []).map(normalizeQAItem),
        page: data?.page ?? page,
        limit: data?.limit ?? limit,
        total: data?.total ?? 0,
      };
      return result;
    },
    {
      ttlMs: DefaultCacheTtls.QAList,
      version: 'v1',
      keyPrefix: 'qa',
    }
  );
}

export async function getQAItem(id: string): Promise<CacheResult<QAItem>> {
  const key = makeCacheKey('qa:item', { id });
  return fetchWithCacheResult<QAItem>(
    key,
    async () => {
      const data = await apiGet<any>(`/qa/${id}`);
      return normalizeQAItem(data);
    },
    {
      ttlMs: DefaultCacheTtls.QAItem,
      version: 'v1',
      keyPrefix: 'qa',
    }
  );
}

export async function invalidateQAListCache(): Promise<void> {
  // Consumer can call clearCached if needed; keeping an explicit function for clarity
}

export async function invalidateQAItemCache(id: string): Promise<void> {
  // Consumer can call clearCached if needed; keeping an explicit function for clarity
}