import { apiDelete, apiGet, apiPost, apiPut } from './api';

export const adminService = {
  dashboard(): Promise<{ pendingComments: number; groups: number; events: number }> { return apiGet('/api/admin/dashboard'); },
  getPendingComments() { return apiGet('/api/admin/comments/pending'); },
  approveComment(id: string) { return apiPost(`/api/admin/comments/${id}/approve`); },
  deleteComment(id: string) { return apiDelete(`/api/admin/comments/${id}`); },
  
  // Events management
  getEvents() { return apiGet('/api/admin/events'); },
  createEvent(event: { title: string; startsAt: string; endsAt?: string; location?: string; description?: string }) {
    return apiPost('/api/events', event);
  },
  updateEvent(id: string, event: { title: string; startsAt: string; endsAt?: string; location?: string; description?: string }) {
    return apiPut(`/api/events/${id}`, event);
  },
  deleteEvent(id: string) { return apiDelete(`/api/events/${id}`); },
  
  // Reading groups management
  getReadingGroups() { return apiGet('/api/admin/reading-groups'); },
  createReadingGroup(group: { name: string; description?: string; target?: any; schedule?: any }) {
    return apiPost('/api/reading-groups', group);
  },
  updateReadingGroup(id: string, group: { name: string; description?: string; target?: any; schedule?: any }) {
    return apiPut(`/api/reading-groups/${id}`, group);
  },
  deleteReadingGroup(id: string) { return apiDelete(`/api/reading-groups/${id}`); },
};