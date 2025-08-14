import { api, Paginated } from './api';
import { getCached, setCached } from '@/utils/cache';

export interface Hadith {
	_id?: string;
	id?: string;
	collection: string;
	bookNumber?: string;
	number?: string;
	text: string;
	translation?: string;
	narrator?: string;
}

export const hadithService = {
	async search(query: string, page = 1, limit = 20): Promise<Paginated<Hadith>> {
		const res = await api.get('/api/hadith/search', { params: { q: query, page, limit } });
		return res.data;
	},
	async getDailyHadith(): Promise<Hadith> {
		const cacheKey = 'CACHE_DAILY_HADITH_V1';
		const today = new Date().toDateString();
		const cached = await getCached<{hadith: Hadith, date: string}>(cacheKey);
		if (cached && cached.date === today) return cached.hadith;
		
		const res = await api.get('/api/hadith/daily-hadith');
		const dailyHadith = res.data;
		await setCached(cacheKey, { hadith: dailyHadith, date: today }, 60 * 60 * 24); // 24 hours
		return dailyHadith;
	},
};