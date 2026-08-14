import { describe, it, expect, vi, beforeEach } from 'vitest';
import childProfileReducer, {
  clearProfileData,
  fetchChildProfile,
  fetchSpeechHistory,
  fetchChildNotes,
  deleteChildNote,
  addChildNote,
  updateChildNote,
  fetchChildActivities,
  fetchSessionHistory,
  fetchAllSpeechLevels,
} from './childProfileSlice';
import { type ActivityItem, type DoctorNote, type PaginatedNotesResponse } from '../../../api/doctorApi';
import { type ChildSessionHistoryItem } from '../../../api/sessionSummaryApi';
import { type ChildProfileData, type PaginatedSpeechHistory } from '../../../types/child.types';

vi.mock('../../../api/doctorApi', () => ({
  getChildProfileApi: vi.fn(),
  getSpeechLevelHistoryApi: vi.fn(),
  getChildNotesApi: vi.fn(),
  deleteDoctorNoteApi: vi.fn(),
  addDoctorNoteApi: vi.fn(),
  updateDoctorNoteApi: vi.fn(),
  getChildActivitiesApi: vi.fn(),
  getSpeechLevelsApi: vi.fn(),
}));

vi.mock('../../../api/sessionSummaryApi', () => ({
  getChildSessionHistoryApi: vi.fn(),
}));

describe('childProfileSlice reducer & thunks', () => {
  const sampleProfileData: ChildProfileData = {
    id: 1,
    fullName: 'أحمد علي',
    dateOfBirth: '2018-05-12',
    gender: 0,
    therapyStartDate: '2024-01-01',
    age: 6,
    parentFullName: 'علي محمد',
    parentEmail: 'parent@example.com',
    parentPhoneNumber: '01000000000',
    speechLevel: { id: 2, levelName: 'Words' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return default initial state', () => {
    const state = childProfileReducer(undefined, { type: 'unknown' });
    expect(state.profileData).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.notesData).toBeNull();
    expect(state.activities).toEqual([]);
    expect(state.sessionHistory).toEqual([]);
  });

  it('should clear state on clearProfileData action', () => {
    const activeState = {
      profileData: sampleProfileData,
      isLoading: false,
      error: 'some error',
      speechHistory: { items: [], pageNumber: 1, totalPages: 1 } as unknown as PaginatedSpeechHistory,
      isHistoryLoading: false,
      historyError: null,
      notesData: { items: [{ id: 1, title: 't', description: 'd' }], pageNumber: 1, totalPages: 1 } as unknown as PaginatedNotesResponse,
      isNotesLoading: false,
      notesError: null,
      activities: [{ id: 10, name: 'act' }] as unknown as ActivityItem[],
      isActivitiesLoading: false,
      activitiesError: 'err',
      sessionHistory: [{ sessionId: 100 }] as unknown as ChildSessionHistoryItem[],
      isLoadingSessionHistory: false,
      sessionHistoryError: 'err',
      allSpeechLevels: [{ id: 1, levelName: 'L1' }],
    };

    const newState = childProfileReducer(activeState, clearProfileData());

    expect(newState.profileData).toBeNull();
    expect(newState.speechHistory).toBeNull();
    expect(newState.notesData).toBeNull();
    expect(newState.activities).toEqual([]);
    expect(newState.activitiesError).toBeNull();
    expect(newState.sessionHistory).toEqual([]);
    expect(newState.sessionHistoryError).toBeNull();
  });

  describe('fetchChildProfile cases', () => {
    it('should set isLoading = true on pending', () => {
      const state = childProfileReducer(undefined, fetchChildProfile.pending('reqId', 1));
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should store profileData on fulfilled', () => {
      const state = childProfileReducer(undefined, fetchChildProfile.fulfilled(sampleProfileData, 'reqId', 1));
      expect(state.isLoading).toBe(false);
      expect(state.profileData).toEqual(sampleProfileData);
    });

    it('should set error on rejected', () => {
      const state = childProfileReducer(undefined, fetchChildProfile.rejected(null, 'reqId', 1, 'خطأ في التحميل'));
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('خطأ في التحميل');
    });
  });

  describe('fetchSpeechHistory & fetchChildNotes cases', () => {
    it('should handle fetchSpeechHistory.fulfilled state', () => {
      const historyData = { items: [{ id: 1, levelName: 'Words' }], pageNumber: 1, totalPages: 1 } as unknown as PaginatedSpeechHistory;
      const state = childProfileReducer(undefined, fetchSpeechHistory.fulfilled(historyData, 'reqId', { childId: 1 }));
      expect(state.isHistoryLoading).toBe(false);
      expect(state.speechHistory).toEqual(historyData);
    });

    it('should handle fetchChildNotes.fulfilled state', () => {
      const notesData = { items: [{ id: 1, title: 'ملاحظة', description: 'محتوى' }], pageNumber: 1, totalPages: 1 } as unknown as PaginatedNotesResponse;
      const state = childProfileReducer(undefined, fetchChildNotes.fulfilled(notesData, 'reqId', { childId: 1 }));
      expect(state.isNotesLoading).toBe(false);
      expect(state.notesData).toEqual(notesData);
    });
  });

  describe('Child Notes actions', () => {
    it('should delete note on deleteChildNote.fulfilled', () => {
      const initialNotesState = {
        profileData: null,
        isLoading: false,
        error: null,
        speechHistory: null,
        isHistoryLoading: false,
        historyError: null,
        notesData: {
          items: [
            { id: 1, title: 'Note 1', description: 'Desc 1' },
            { id: 2, title: 'Note 2', description: 'Desc 2' },
          ],
          pageNumber: 1,
          totalPages: 1,
        } as unknown as PaginatedNotesResponse,
        isNotesLoading: false,
        notesError: null,
        activities: [],
        isActivitiesLoading: false,
        activitiesError: null,
        sessionHistory: [],
        isLoadingSessionHistory: false,
        sessionHistoryError: null,
        allSpeechLevels: [],
      };

      const state = childProfileReducer(initialNotesState, deleteChildNote.fulfilled(1, 'reqId', 1));
      expect(state.notesData?.items.length).toBe(1);
      expect(state.notesData?.items[0].id).toBe(2);
    });

    it('should add note on addChildNote.fulfilled', () => {
      const newNoteResult = { id: 5, noteTitle: 'عنوان جديد', noteContent: 'محتوى جديد' };
      const actionArg = { childId: 1, noteTitle: 'عنوان جديد', noteContent: 'محتوى جديد' };

      const state = childProfileReducer(
        undefined,
        addChildNote.fulfilled(newNoteResult, 'reqId', actionArg)
      );

      expect(state.notesData).toBeDefined();
      expect(state.notesData?.items[0].title).toBe('عنوان جديد');
      expect(state.notesData?.items[0].description).toBe('محتوى جديد');
    });

    it('should update note on updateChildNote.fulfilled', () => {
      const initialNotesState = {
        profileData: null,
        isLoading: false,
        error: null,
        speechHistory: null,
        isHistoryLoading: false,
        historyError: null,
        notesData: {
          items: [{ id: 10, title: 'قديم', description: 'وصف قديم' } as DoctorNote],
          pageNumber: 1,
          totalPages: 1,
        } as unknown as PaginatedNotesResponse,
        isNotesLoading: false,
        notesError: null,
        activities: [],
        isActivitiesLoading: false,
        activitiesError: null,
        sessionHistory: [],
        isLoadingSessionHistory: false,
        sessionHistoryError: null,
        allSpeechLevels: [],
      };

      const updateArg = { noteId: 10, title: 'محدث', description: 'وصف محدث' };
      const state = childProfileReducer(
        initialNotesState,
        updateChildNote.fulfilled({}, 'reqId', updateArg)
      );

      expect(state.notesData?.items[0].title).toBe('محدث');
      expect(state.notesData?.items[0].description).toBe('وصف محدث');
    });
  });

  describe('fetchChildActivities & fetchSessionHistory & fetchAllSpeechLevels', () => {
    it('should set activities on fetchChildActivities.fulfilled', () => {
      const activitiesList = [{ id: 1, name: 'تمرین 1' }] as unknown as ActivityItem[];
      const state = childProfileReducer(undefined, fetchChildActivities.fulfilled(activitiesList, 'reqId', 1));
      expect(state.isActivitiesLoading).toBe(false);
      expect(state.activities).toEqual(activitiesList);
    });

    it('should set sessionHistory on fetchSessionHistory.fulfilled', () => {
      const sessions = [{ sessionId: 101, sessionTitle: 'جلسة أولى' }] as unknown as ChildSessionHistoryItem[];
      const state = childProfileReducer(undefined, fetchSessionHistory.fulfilled(sessions, 'reqId', 1));
      expect(state.isLoadingSessionHistory).toBe(false);
      expect(state.sessionHistory).toEqual(sessions);
    });

    it('should set allSpeechLevels on fetchAllSpeechLevels.fulfilled', () => {
      const levels = [{ id: 1, levelName: 'أصوات' }, { id: 2, levelName: 'كلمات' }];
      const state = childProfileReducer(undefined, fetchAllSpeechLevels.fulfilled(levels, 'reqId', undefined));
      expect(state.allSpeechLevels).toEqual(levels);
    });
  });
});
