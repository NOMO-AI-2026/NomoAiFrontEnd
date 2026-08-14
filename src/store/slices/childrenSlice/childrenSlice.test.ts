import { describe, it, expect, vi, beforeEach } from 'vitest';
import childrenReducer, {
  setSearchQuery,
  fetchChildren,
  fetchParentChildren,
} from './childrenSlice';
import * as doctorApi from '../../../api/doctorApi';
import * as parentApi from '../../../api/parentApi';
import { type Child } from '../../../api/doctorApi';
import { type ChildProfileData } from '../../../types/child.types';

vi.mock('../../../api/doctorApi', () => ({
  getDoctorChildrenApi: vi.fn(),
  getChildProfileApi: vi.fn(),
  getSpeechLevelsApi: vi.fn(),
}));

vi.mock('../../../api/parentApi', () => ({
  getParentChildrenApi: vi.fn(),
}));

describe('childrenSlice reducer & thunks', () => {
  const initialChildrenState = {
    children: [],
    isLoading: false,
    error: null,
    pageNumber: 1,
    totalPages: 1,
    totalCount: 0,
    hasPreviousPage: false,
    hasNextPage: false,
    searchQuery: '',
  };

  const sampleChild: Child = {
    id: 1,
    fullName: 'سارة محمد',
    gender: 1,
    age: 5,
  };

  const samplePaginatedResponse = {
    items: [sampleChild],
    pageNumber: 1,
    totalPages: 2,
    totalCount: 15,
    hasPreviousPage: false,
    hasNextPage: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial state when passed unknown action', () => {
    const state = childrenReducer(undefined, { type: 'unknown' });
    expect(state).toEqual(initialChildrenState);
  });

  it('should update searchQuery when setSearchQuery action is dispatched', () => {
    const newState = childrenReducer(initialChildrenState, setSearchQuery('أحمد'));
    expect(newState.searchQuery).toBe('أحمد');
  });

  describe('fetchChildren cases (Doctor Children)', () => {
    it('should set isLoading = true on fetchChildren.pending', () => {
      const state = childrenReducer(initialChildrenState, fetchChildren.pending('reqId', undefined));
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should update paginated children list on fetchChildren.fulfilled', () => {
      const fulfilledPayload = {
        items: [sampleChild],
        pageNumber: 1,
        totalPages: 3,
        totalCount: 25,
        hasPreviousPage: false,
        hasNextPage: true,
      };

      const state = childrenReducer(
        initialChildrenState,
        fetchChildren.fulfilled(fulfilledPayload, 'reqId', undefined)
      );

      expect(state.isLoading).toBe(false);
      expect(state.children).toEqual([sampleChild]);
      expect(state.pageNumber).toBe(1);
      expect(state.totalPages).toBe(3);
      expect(state.totalCount).toBe(25);
      expect(state.hasNextPage).toBe(true);
    });

    it('should set error message on fetchChildren.rejected', () => {
      const state = childrenReducer(
        initialChildrenState,
        fetchChildren.rejected(null, 'reqId', undefined, 'فشل الاتصال بالخادم')
      );

      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('فشل الاتصال بالخادم');
    });

    it('executes fetchChildren thunk and enriches children with speech levels', async () => {
      vi.mocked(doctorApi.getDoctorChildrenApi).mockResolvedValueOnce(samplePaginatedResponse);
      vi.mocked(doctorApi.getSpeechLevelsApi).mockResolvedValueOnce([{ id: 1, levelName: 'Vocalization' } as unknown as doctorApi.SpeechLevel]);
      vi.mocked(doctorApi.getChildProfileApi).mockResolvedValueOnce({
        id: 1,
        speechLevel: { id: 1, levelName: 'Vocalization' },
      } as unknown as ChildProfileData);

      const dispatch = vi.fn();
      const getState = vi.fn();

      const result = await fetchChildren({ pageNumber: 1 })(dispatch, getState, undefined);

      expect(result.type).toBe('children/fetchChildren/fulfilled');
      if (fetchChildren.fulfilled.match(result)) {
        expect(result.payload.items[0].speechLevelName).toBe('Vocalization');
      }
    });
  });

  describe('fetchParentChildren cases (Parent Children)', () => {
    it('should set isLoading = true on fetchParentChildren.pending', () => {
      const state = childrenReducer(initialChildrenState, fetchParentChildren.pending('reqId', undefined));
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should update state on fetchParentChildren.fulfilled', () => {
      const fulfilledPayload = {
        items: [sampleChild],
        pageNumber: 1,
        totalPages: 1,
        totalCount: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      };

      const state = childrenReducer(
        initialChildrenState,
        fetchParentChildren.fulfilled(fulfilledPayload, 'reqId', undefined)
      );

      expect(state.isLoading).toBe(false);
      expect(state.children).toEqual([sampleChild]);
    });

    it('executes fetchParentChildren thunk successfully', async () => {
      vi.mocked(parentApi.getParentChildrenApi).mockResolvedValueOnce([sampleChild]);
      vi.mocked(doctorApi.getSpeechLevelsApi).mockResolvedValueOnce([]);

      const dispatch = vi.fn();
      const getState = vi.fn();

      const result = await fetchParentChildren(undefined)(dispatch, getState, undefined);

      expect(result.type).toBe('children/fetchParentChildren/fulfilled');
    });
  });
});
