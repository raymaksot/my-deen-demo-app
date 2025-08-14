import { commentsService } from '@/services/commentsService';
import { qaService } from '@/services/qaService';

describe('Service shapes', () => {
  it('comments service has required methods', () => {
    expect(typeof commentsService.list).toBe('function');
    expect(typeof commentsService.create).toBe('function');
  });

  it('qa service has toggleLike method', () => {
    expect(typeof qaService.toggleLike).toBe('function');
  });
});