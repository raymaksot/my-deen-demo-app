import { api } from './api';
import { getCached, setCached } from '@/utils/cache';
import { isNetworkAvailable } from '@/utils/network';

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

export const quranService = {
	async getSurahs(): Promise<Surah[]> {
		const cacheKey = 'CACHE_QURAN_SURAHS_V1';
		const cached = await getCached<Surah[]>(cacheKey);
		if (cached) return cached;

		// Check network connectivity
		const networkAvailable = await isNetworkAvailable();
		if (!networkAvailable) {
			throw new Error('Network unavailable and no cached data found');
		}

		try {
			const res = await api.get('/api/quran/surahs');
			await setCached(cacheKey, res.data, 60 * 60 * 24 * 30); // 30 days
			return res.data;
		} catch (error) {
			// If network request fails, throw error with cached fallback message
			throw new Error('Failed to load surahs from server and no cached data available');
		}
	},

	async getSurahAyahs(surahNumber: number): Promise<Ayah[]> {
		const cacheKey = `CACHE_QURAN_SURAH_${surahNumber}_AYAHS_V1`;
		const cached = await getCached<Ayah[]>(cacheKey);
		
		// Check network connectivity
		const networkAvailable = await isNetworkAvailable();
		
		if (cached) {
			if (!networkAvailable) {
				// Return cached data when offline
				return cached;
			}
			
			// If online and have cached data, try to refresh in background
			// but return cached data immediately for better performance
			this.refreshSurahAyahsInBackground(surahNumber, cacheKey);
			return cached;
		}

		// No cached data - need network
		if (!networkAvailable) {
			throw new Error('Network unavailable and no cached ayahs found for this surah');
		}

		try {
			const res = await api.get(`/api/quran/surah/${surahNumber}`);
			await setCached(cacheKey, res.data, 60 * 60 * 24 * 7); // 7 days
			return res.data;
		} catch (error) {
			throw new Error(`Failed to load ayahs for surah ${surahNumber}`);
		}
	},

	// Background refresh function for better UX
	async refreshSurahAyahsInBackground(surahNumber: number, cacheKey: string): Promise<void> {
		try {
			const res = await api.get(`/api/quran/surah/${surahNumber}`);
			await setCached(cacheKey, res.data, 60 * 60 * 24 * 7); // 7 days
		} catch (error) {
			// Silently fail for background refresh
			console.log(`Background refresh failed for surah ${surahNumber}:`, error);
		}
	}
};