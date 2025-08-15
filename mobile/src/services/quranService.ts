import { apiGet } from './apiClient';
import { DefaultCacheTtls, fetchWithCache, fetchWithCacheResult, makeCacheKey, CacheResult } from '../utils/cache';

export type SurahSummary = {
  number: number;
  name: string; // original name (Arabic)
  englishName: string;
  englishNameTranslation?: string;
  numberOfAyahs: number;
};

export type Ayah = {
  number: number;
  text: string; // Arabic
  translation?: string;
  tafsir?: string;
};

export type DailyAyah = Ayah & {
  surah: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation?: string;
  };
};

function normalizeSurah(raw: any): SurahSummary {
  return {
    number: raw.number ?? raw.index ?? raw.id ?? 0,
    name: raw.name ?? raw.arabicName ?? raw.title ?? '',
    englishName: raw.englishName ?? raw.nameEnglish ?? raw.name_translated ?? '',
    englishNameTranslation: raw.englishNameTranslation ?? raw.translation_en ?? raw.translation,
    numberOfAyahs: raw.numberOfAyahs ?? raw.ayahsCount ?? raw.verses ?? 0,
  };
}

function normalizeAyah(raw: any): Ayah {
  return {
    number: raw.number ?? raw.ayah_number ?? raw.id ?? 0,
    text: raw.text ?? raw.arabic ?? '',
    translation: raw.translation ?? raw.english,
    tafsir: raw.tafsir ?? raw.commentary,
  };
}

export async function getSurahList(): Promise<SurahSummary[]> {
  const key = makeCacheKey('quran:surah-list');
  return fetchWithCache<SurahSummary[]>(
    key,
    async () => {
      const data = await apiGet<any>('/quran/surahs');
      const list = (data?.data ?? data?.surahs ?? data ?? []).map(normalizeSurah);
      return list;
    },
    {
      ttlMs: DefaultCacheTtls.SurahList,
      version: 'v1',
      keyPrefix: 'quran',
    }
  );
}

export async function getSurahListWithCache(): Promise<CacheResult<SurahSummary[]>> {
  const key = makeCacheKey('quran:surah-list');
  return fetchWithCacheResult<SurahSummary[]>(
    key,
    async () => {
      const data = await apiGet<any>('/quran/surahs');
      const list = (data?.data ?? data?.surahs ?? data ?? []).map(normalizeSurah);
      return list;
    },
    {
      ttlMs: DefaultCacheTtls.SurahList,
      version: 'v1',
      keyPrefix: 'quran',
    }
  );
}

export async function getSurahAyahs(surahNumber: number): Promise<CacheResult<Ayah[]>> {
  const key = makeCacheKey('quran:ayahs', { surahNumber });
  return fetchWithCacheResult<Ayah[]>(
    key,
    async () => {
      const data = await apiGet<any>(`/quran/surah/${surahNumber}`);
      const list = (data?.data ?? data?.ayahs ?? data ?? []).map(normalizeAyah);
      return list;
    },
    {
      ttlMs: 7 * 24 * 60 * 60 * 1000, // 7 days
      version: 'v1',
      keyPrefix: 'quran',
    }
  );
}

export async function getDailyAyah(): Promise<CacheResult<DailyAyah>> {
  const key = makeCacheKey('quran:daily-ayah');
  const today = new Date().toDateString();
  
  return fetchWithCacheResult<{ ayah: DailyAyah; date: string }>(
    key,
    async () => {
      const data = await apiGet<any>('/quran/daily-ayah');
      const ayah: DailyAyah = {
        number: data.number ?? data.ayah_number ?? 0,
        text: data.text ?? data.arabic ?? '',
        translation: data.translation ?? data.english,
        tafsir: data.tafsir ?? data.commentary,
        surah: {
          number: data.surah?.number ?? 0,
          name: data.surah?.name ?? '',
          englishName: data.surah?.englishName ?? '',
          englishNameTranslation: data.surah?.englishNameTranslation,
        },
      };
      return { ayah, date: today };
    },
    {
      ttlMs: 24 * 60 * 60 * 1000, // 24 hours
      version: 'v1',
      keyPrefix: 'quran',
    }
  ).then(result => ({
    data: result.data.ayah,
    isFromCache: result.isFromCache,
    isStale: result.isStale
  }));
}

export async function invalidateSurahListCache(): Promise<void> {
  // consumer can call clearCached if needed; keeping an explicit function for clarity
}