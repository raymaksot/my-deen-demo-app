import { api } from './api';
import { getCached, setCached, fetchWithOfflineSupport, CachedResponse } from '@/utils/cache';

export interface Surah {
	number: number;
	name: string; // Arabic
	englishName: string;
	englishNameTranslation?: string;
	numberOfAyahs: number;
	revelationType: 'Meccan' | 'Medinan';
}

export interface Ayah {
	number: number;
	text: string; // Arabic
	translation?: string;
	tafsir?: string;
}

export interface DailyAyah extends Ayah {
	surah: {
		number: number;
		name: string;
		englishName: string;
		englishNameTranslation?: string;
	};
}

export const quranService = {
	async getSurahs(isConnected: boolean = true): Promise<CachedResponse<Surah[]>> {
		const cacheKey = 'CACHE_QURAN_SURAHS_V1';
		return fetchWithOfflineSupport(
			cacheKey,
			async () => {
				const res = await api.get('/api/quran/surahs');
				return res.data;
			},
			60 * 60 * 24 * 30, // 30 days
			isConnected
		);
	},
	async getSurahAyahs(surahNumber: number, isConnected: boolean = true): Promise<CachedResponse<Ayah[]>> {
		const cacheKey = `CACHE_QURAN_AYAHS_V1_${surahNumber}`;
		return fetchWithOfflineSupport(
			cacheKey,
			async () => {
				const res = await api.get(`/api/quran/surah/${surahNumber}`);
				return res.data;
			},
			60 * 60 * 24 * 7, // 7 days
			isConnected
		);
	},
	async getDailyAyah(isConnected: boolean = true): Promise<CachedResponse<DailyAyah>> {
		const cacheKey = 'CACHE_DAILY_AYAH_V1';
		const today = new Date().toDateString();
		
		// For daily content, we need to check if it's for today
		if (isConnected) {
			const cached = await getCached<{ayah: DailyAyah, date: string}>(cacheKey);
			if (cached && cached.date === today) {
				return { data: cached.ayah, isFromCache: true };
			}
		}
		
		return fetchWithOfflineSupport(
			cacheKey,
			async () => {
				const res = await api.get('/api/quran/daily-ayah');
				const dailyAyah = res.data;
				// Store with date for daily content
				await setCached(cacheKey, { ayah: dailyAyah, date: today }, 60 * 60 * 24);
				return dailyAyah;
			},
			60 * 60 * 24, // 24 hours
			isConnected
		);
	},
};