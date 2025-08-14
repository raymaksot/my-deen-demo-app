import { api } from './api';
import { getCached, setCached } from '@/utils/cache';

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
	async getSurahs(): Promise<Surah[]> {
		const cacheKey = 'CACHE_QURAN_SURAHS_V1';
		const cached = await getCached<Surah[]>(cacheKey);
		if (cached) return cached;
		const res = await api.get('/api/quran/surahs');
		await setCached(cacheKey, res.data, 60 * 60 * 24 * 30); // 30 days
		return res.data;
	},
	async getSurahAyahs(surahNumber: number): Promise<Ayah[]> {
		const res = await api.get(`/api/quran/surah/${surahNumber}`);
		return res.data;
	},
	async getDailyAyah(): Promise<DailyAyah> {
		const cacheKey = 'CACHE_DAILY_AYAH_V1';
		const today = new Date().toDateString();
		const cached = await getCached<{ayah: DailyAyah, date: string}>(cacheKey);
		if (cached && cached.date === today) return cached.ayah;
		
		const res = await api.get('/api/quran/daily-ayah');
		const dailyAyah = res.data;
		await setCached(cacheKey, { ayah: dailyAyah, date: today }, 60 * 60 * 24); // 24 hours
		return dailyAyah;
	},
};