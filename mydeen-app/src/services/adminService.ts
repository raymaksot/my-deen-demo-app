import { apiDelete, apiGet, apiPost } from './api';

export interface PendingComment {
  _id: string;
  userId: { name: string; email: string };
  parentType: string;
  parentId: string;
  text: string;
  createdAt: string;
  status: string;
}

export interface PaginatedComments {
  data: PendingComment[];
  page: number;
  limit: number;
  total: number;
}

export const adminService = {
  dashboard(): Promise<{ pendingComments: number; groups: number; events: number }> { return apiGet('/api/admin/dashboard'); },
  getPendingComments(page: number = 1, limit: number = 20): Promise<PaginatedComments> { 
    return apiGet(`/api/admin/comments?status=pending&page=${page}&limit=${limit}`);
  },
  approveComment(id: string) { return apiPost(`/api/admin/comments/${id}/approve`); },
  deleteComment(id: string) { return apiDelete(`/api/admin/comments/${id}`); },
};