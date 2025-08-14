import { commentsService } from '@/services/commentsService';
import { groupsService } from '@/services/groupsService';

describe('Service shapes', () => {
  it('comments service has required methods', () => {
    expect(typeof commentsService.list).toBe('function');
    expect(typeof commentsService.create).toBe('function');
  });

  it('groups service has required methods for reading assignments', () => {
    expect(typeof groupsService.setProgress).toBe('function');
    expect(typeof groupsService.progress).toBe('function');
    expect(typeof groupsService.get).toBe('function');
  });
});