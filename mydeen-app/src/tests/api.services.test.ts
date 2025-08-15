import { commentsService } from '@/services/commentsService';
import { groupsService } from '@/services/groupsService';
import { qaService } from '@/services/qaService';

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

  it('qa service has required methods including new like functionality', () => {
    expect(typeof qaService.get).toBe('function');
    expect(typeof qaService.answer).toBe('function');
    expect(typeof qaService.toggleLikeAnswer).toBe('function');
    expect(typeof qaService.getLikeStatus).toBe('function');
  });
});