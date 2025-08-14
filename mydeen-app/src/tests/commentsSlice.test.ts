import { configureStore } from '@reduxjs/toolkit';
import configureMockStore from 'redux-mock-store';
import commentsReducer, {
  createComment,
  deleteComment,
  likeComment,
  CommentsState,
} from '@/store/commentsSlice';
import { CommentDto } from '@/services/commentsService';

// Mock the comments service
jest.mock('@/services/commentsService', () => ({
  commentsService: {
    create: jest.fn(),
    remove: jest.fn(),
    like: jest.fn(),
  },
}));

// Mock the offline mutation queue
jest.mock('@/offline/mutationQueue', () => ({
  enqueue: jest.fn(() => Promise.resolve()),
}));

const middlewares: any[] = [];
const mockStore = configureMockStore(middlewares);

// Define the store state type
interface RootState {
  comments: CommentsState;
}

// Test data
const mockComment: CommentDto = {
  _id: 'comment1',
  userId: 'user1',
  parentType: 'article',
  parentId: 'article1',
  text: 'Test comment',
  likesCount: 5,
  createdAt: '2023-01-01T00:00:00Z',
};

const initialState: CommentsState = {
  byParent: {
    'article:article1': {
      items: [mockComment],
      page: 1,
      total: 1,
      loading: false,
    },
  },
};

describe('commentsSlice', () => {
  let store: ReturnType<typeof configureStore<RootState>>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        comments: commentsReducer,
      },
      preloadedState: {
        comments: initialState,
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createComment.fulfilled', () => {
    it('should add a new comment to the beginning of items and increment total', () => {
      const newComment: CommentDto = {
        _id: 'comment2',
        userId: 'user1',
        parentType: 'article',
        parentId: 'article1',
        text: 'New test comment',
        likesCount: 0,
        createdAt: '2023-01-02T00:00:00Z',
      };

      const action = createComment.fulfilled(newComment, 'requestId', {
        parentType: 'article',
        parentId: 'article1',
        text: 'New test comment',
      });

      store.dispatch(action);
      const state = store.getState().comments;

      expect(state.byParent['article:article1'].items).toHaveLength(2);
      expect(state.byParent['article:article1'].items[0]).toEqual(newComment);
      expect(state.byParent['article:article1'].total).toBe(2);
    });

    it('should create new parent entry if it does not exist', () => {
      const newComment: CommentDto = {
        _id: 'comment3',
        userId: 'user1',
        parentType: 'article',
        parentId: 'article2',
        text: 'Comment for new article',
        likesCount: 0,
        createdAt: '2023-01-03T00:00:00Z',
      };

      const action = createComment.fulfilled(newComment, 'requestId', {
        parentType: 'article',
        parentId: 'article2',
        text: 'Comment for new article',
      });

      store.dispatch(action);
      const state = store.getState().comments;

      expect(state.byParent['article:article2']).toBeDefined();
      expect(state.byParent['article:article2'].items).toHaveLength(1);
      expect(state.byParent['article:article2'].items[0]).toEqual(newComment);
      expect(state.byParent['article:article2'].total).toBe(1);
    });
  });

  describe('deleteComment.fulfilled', () => {
    it('should remove comment from items and decrement total', () => {
      const action = deleteComment.fulfilled('comment1', 'requestId', 'comment1');

      store.dispatch(action);
      const state = store.getState().comments;

      expect(state.byParent['article:article1'].items).toHaveLength(0);
      expect(state.byParent['article:article1'].total).toBe(0);
    });

    it('should handle deleting non-existent comment gracefully', () => {
      const action = deleteComment.fulfilled('nonexistent', 'requestId', 'nonexistent');

      store.dispatch(action);
      const state = store.getState().comments;

      // State should remain unchanged
      expect(state.byParent['article:article1'].items).toHaveLength(1);
      expect(state.byParent['article:article1'].total).toBe(1);
    });

    it('should not go below 0 for total count', () => {
      // First create a store with 0 items but total of 1 (edge case)
      const edgeCaseState: CommentsState = {
        byParent: {
          'article:article1': {
            items: [mockComment],
            page: 1,
            total: 1,
            loading: false,
          },
        },
      };

      const edgeStore = configureStore<RootState>({
        reducer: {
          comments: commentsReducer,
        },
        preloadedState: {
          comments: edgeCaseState,
        },
      });

      const action = deleteComment.fulfilled('comment1', 'requestId', 'comment1');

      edgeStore.dispatch(action);
      const state = edgeStore.getState().comments;

      expect(state.byParent['article:article1'].total).toBe(0);
    });
  });

  describe('likeComment.fulfilled', () => {
    it('should update likesCount for the matching comment', () => {
      const likeResult = {
        id: 'comment1',
        liked: true,
        likesCount: 6,
      };

      const action = likeComment.fulfilled(likeResult, 'requestId', 'comment1');

      store.dispatch(action);
      const state = store.getState().comments;

      const updatedComment = state.byParent['article:article1'].items[0];
      expect(updatedComment.likesCount).toBe(6);
    });

    it('should handle liking non-existent comment gracefully', () => {
      const likeResult = {
        id: 'nonexistent',
        liked: true,
        likesCount: 1,
      };

      const action = likeComment.fulfilled(likeResult, 'requestId', 'nonexistent');

      store.dispatch(action);
      const state = store.getState().comments;

      // Original comment should remain unchanged
      const originalComment = state.byParent['article:article1'].items[0];
      expect(originalComment.likesCount).toBe(5);
    });

    it('should find and update comment across different parent keys', () => {
      // Add another comment to a different parent
      const stateWithMultipleParents: CommentsState = {
        byParent: {
          'article:article1': {
            items: [mockComment],
            page: 1,
            total: 1,
            loading: false,
          },
          'article:article2': {
            items: [
              {
                _id: 'comment2',
                userId: 'user2',
                parentType: 'article',
                parentId: 'article2',
                text: 'Another comment',
                likesCount: 3,
                createdAt: '2023-01-02T00:00:00Z',
              },
            ],
            page: 1,
            total: 1,
            loading: false,
          },
        },
      };

      const multiStore = configureStore<RootState>({
        reducer: {
          comments: commentsReducer,
        },
        preloadedState: {
          comments: stateWithMultipleParents,
        },
      });

      const likeResult = {
        id: 'comment2',
        liked: true,
        likesCount: 4,
      };

      const action = likeComment.fulfilled(likeResult, 'requestId', 'comment2');

      multiStore.dispatch(action);
      const state = multiStore.getState().comments;

      expect(state.byParent['article:article2'].items[0].likesCount).toBe(4);
      expect(state.byParent['article:article1'].items[0].likesCount).toBe(5); // Unchanged
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const store = configureStore<RootState>({
        reducer: {
          comments: commentsReducer,
        },
      });

      const state = store.getState().comments;
      expect(state.byParent).toEqual({});
    });
  });
});