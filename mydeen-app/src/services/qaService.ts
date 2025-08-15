import { api, Paginated } from './api';
import { getCached, setCached, fetchWithOfflineSupport, CachedResponse } from '@/utils/cache';

export interface QAItem {
	_id: string;
	title: string;
	question: string;
	answer?: string;
	askedBy?: string;
	answeredBy?: string;
	createdAt?: string;
}

export const qaService = {
	async list(page = 1, limit = 20, isConnected: boolean = true): Promise<CachedResponse<Paginated<QAItem>>> {
		const cacheKey = `CACHE_QA_LIST_V1_${page}_${limit}`;
		return fetchWithOfflineSupport(
			cacheKey,
			async () => {
				const res = await api.get('/api/qa', { params: { page, limit } });
				return res.data;
			},
			60 * 60 * 12, // 12 hours
			isConnected
		);
	},
	async get(id: string, isConnected: boolean = true): Promise<CachedResponse<QAItem>> {
		const cacheKey = `CACHE_QA_ITEM_V1_${id}`;
		return fetchWithOfflineSupport(
			cacheKey,
			async () => {
				const res = await api.get(`/api/qa/${id}`);
				return res.data;
			},
			60 * 60 * 24, // 24 hours
			isConnected
		);
	},
	async answer(id: string, answer: string): Promise<QAItem> {
		const res = await api.post(`/api/qa/${id}/answer`, { answer });
		// Update cache with new answer
		const cacheKey = `CACHE_QA_ITEM_V1_${id}`;
		await setCached(cacheKey, res.data, 60 * 60 * 24);
		return res.data as QAItem;
	},
};