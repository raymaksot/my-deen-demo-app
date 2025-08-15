import { api, Paginated } from './api';
import { getCached, setCached, fetchWithOfflineSupport, CachedResponse } from '../utils/cache';

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
	async search(query: string, page = 1, limit = 20, isConnected: boolean = true): Promise<CachedResponse<Paginated<Hadith>>> {
		const cacheKey = `CACHE_HADITH_SEARCH_V1_${query}_${page}_${limit}`;
		return fetchWithOfflineSupport(
			cacheKey,
			async () => {
				const res = await api.get('/api/hadith/search', { params: { q: query, page, limit } });
				return res.data;
			},
			60 * 60 * 2, // 2 hours for search results
			isConnected
		);
	},
	async getDailyHadith(isConnected: boolean = true): Promise<CachedResponse<Hadith>> {
		const cacheKey = 'CACHE_DAILY_HADITH_V1';
		const today = new Date().toDateString();
		
		// For daily content, check if it's for today when connected
		if (isConnected) {
			const cached = await getCached<{hadith: Hadith, date: string}>(cacheKey);
			if (cached && cached.date === today) {
				return { data: cached.hadith, isFromCache: true };
			}
		}
		
		return fetchWithOfflineSupport(
			cacheKey,
			async () => {
				const res = await api.get('/api/hadith/daily-hadith');
				const dailyHadith = res.data;
				// Store with date for daily content
				await setCached(cacheKey, { hadith: dailyHadith, date: today }, 60 * 60 * 24);
				return dailyHadith;
			},
			60 * 60 * 24, // 24 hours
			isConnected
		);
	},
};