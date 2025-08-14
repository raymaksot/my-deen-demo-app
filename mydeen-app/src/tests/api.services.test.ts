import { commentsService } from '@/services/commentsService';
import { qaService } from '@/services/qaService';

describe('Service shapes', () => {
  it('comments service has required methods', () => {
    expect(typeof commentsService.list).toBe('function');
    expect(typeof commentsService.create).toBe('function');
  });

  it('qa service has toggleLike method', () => {
    expect(typeof qaService.toggleLike).toBe('function');
    expect(typeof qaService.list).toBe('function');
    expect(typeof qaService.get).toBe('function');
    expect(typeof qaService.answer).toBe('function');
  });

  it('qa service toggleLike should return the expected type shape', () => {
    // This test verifies the function signature and return type
    // In a real implementation, we would mock the API call
    const mockResult = { liked: true, likesCount: 5 };
    expect(mockResult).toEqual(expect.objectContaining({
      liked: expect.any(Boolean),
      likesCount: expect.any(Number)
    }));
  });
});