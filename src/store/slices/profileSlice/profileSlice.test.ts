import { describe, it, expect, vi, beforeEach } from 'vitest';
import profileReducer, {
  getProfile,
  updateProfile,
  fetchDoctorDashboard,
  fetchParentDashboard,
  clearProfile,
  type ProfileData,
  type DoctorDashboardData,
  type ParentDashboardData,
} from './profileSlice';
import * as profileApi from '../../../api/profileApi';
import * as doctorApi from '../../../api/doctorApi';
import * as parentApi from '../../../api/parentApi';

vi.mock('../../../api/profileApi', () => ({
  fetchProfileApi: vi.fn(),
  updateProfileApi: vi.fn(),
}));
vi.mock('../../../api/doctorApi', () => ({
  getDoctorDashboardApi: vi.fn(),
}));
vi.mock('../../../api/parentApi', () => ({
  getParentDashboardApi: vi.fn(),
}));

describe('profileSlice reducer & thunks', () => {
  const initialState = {
    data: null,
    loading: false,
    updateLoading: false,
    error: null,
    updateError: null,
    dashboardData: null,
    isDashboardLoading: false,
    dashboardError: null,
    parentDashboardData: null,
    isParentDashboardLoading: false,
    parentDashboardError: null,
  };

  const sampleProfile: ProfileData = {
    fullName: 'Test User',
    email: 'test@example.com',
    phoneNumber: '0123456789',
    gender: 1,
    age: 30,
    doctorSpecificData: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('reducer actions', () => {
    it('should return initial state', () => {
      expect(profileReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle clearProfile', () => {
      const state = {
        ...initialState,
        data: sampleProfile,
        error: 'Some error',
      };
      const nextState = profileReducer(state, clearProfile());
      expect(nextState.data).toBeNull();
      expect(nextState.error).toBeNull();
    });
  });

  describe('getProfile thunk', () => {
    it('sets loading true on pending', () => {
      const state = profileReducer(initialState, { type: getProfile.pending.type });
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('updates data on fulfilled', async () => {
      vi.mocked(profileApi.fetchProfileApi).mockResolvedValueOnce(sampleProfile);
      const dispatch = vi.fn();
      const getState = vi.fn();
      const result = await getProfile()(dispatch, getState, undefined);

      expect(result.type).toBe('profile/getProfile/fulfilled');
      expect(result.payload).toEqual(sampleProfile);

      const state = profileReducer(initialState, {
        type: getProfile.fulfilled.type,
        payload: sampleProfile,
      });
      expect(state.loading).toBe(false);
      expect(state.data).toEqual(sampleProfile);
    });

    it('sets error on rejected', async () => {
      vi.mocked(profileApi.fetchProfileApi).mockRejectedValueOnce({
        response: { data: { error: { description: 'Fetch error' } } },
      });
      const dispatch = vi.fn();
      const getState = vi.fn();
      const result = await getProfile()(dispatch, getState, undefined);

      expect(result.type).toBe('profile/getProfile/rejected');
      expect(result.payload).toBe('Fetch error');
    });
  });

  describe('updateProfile thunk', () => {
    const updateData: ProfileData = { ...sampleProfile, fullName: 'Updated User' };

    it('sets updateLoading true on pending', () => {
      const state = profileReducer(initialState, { type: updateProfile.pending.type });
      expect(state.updateLoading).toBe(true);
      expect(state.updateError).toBeNull();
    });

    it('updates data on fulfilled', async () => {
      vi.mocked(profileApi.updateProfileApi).mockResolvedValueOnce(updateData);
      const dispatch = vi.fn();
      const getState = vi.fn();
      const result = await updateProfile(updateData)(dispatch, getState, undefined);

      expect(result.type).toBe('profile/updateProfile/fulfilled');
      expect(result.payload).toEqual(updateData);

      // Need existing data to test merge
      const stateWithData = { ...initialState, data: sampleProfile };
      const state = profileReducer(stateWithData, {
        type: updateProfile.fulfilled.type,
        payload: updateData,
      });
      expect(state.updateLoading).toBe(false);
      expect(state.data).toEqual(updateData);
    });

    it('sets updateError on rejected', async () => {
      vi.mocked(profileApi.updateProfileApi).mockRejectedValueOnce({
        response: { data: { error: { description: 'Update error' } } },
      });
      const dispatch = vi.fn();
      const getState = vi.fn();
      const result = await updateProfile(updateData)(dispatch, getState, undefined);

      expect(result.type).toBe('profile/updateProfile/rejected');
      expect(result.payload).toBe('Update error');
    });
  });

  describe('fetchDoctorDashboard thunk', () => {
    const sampleDashboard: DoctorDashboardData = {
      sessions: { completedLast7Days: 5, completedToday: 1, awaitingDoctorReview: 2 },
    };

    it('sets isDashboardLoading true on pending', () => {
      const state = profileReducer(initialState, { type: fetchDoctorDashboard.pending.type });
      expect(state.isDashboardLoading).toBe(true);
    });

    it('updates dashboardData on fulfilled', async () => {
      vi.mocked(doctorApi.getDoctorDashboardApi).mockResolvedValueOnce({ value: sampleDashboard } as any);
      const dispatch = vi.fn();
      const getState = vi.fn();
      const result = await fetchDoctorDashboard()(dispatch, getState, undefined);

      expect(result.type).toBe('profile/fetchDoctorDashboard/fulfilled');
      expect(result.payload).toEqual(sampleDashboard);
    });

    it('returns fallback data on error', async () => {
      vi.mocked(doctorApi.getDoctorDashboardApi).mockRejectedValueOnce(new Error('Network error'));
      const dispatch = vi.fn();
      const getState = vi.fn();
      const result = await fetchDoctorDashboard()(dispatch, getState, undefined);

      expect(result.type).toBe('profile/fetchDoctorDashboard/fulfilled');
      expect(result.payload).toHaveProperty('sessions');
    });
  });

  describe('fetchParentDashboard thunk', () => {
    const sampleDashboard: ParentDashboardData = {
      children: [{ id: 1, fullName: 'Child 1' }],
    };

    it('sets isParentDashboardLoading true on pending', () => {
      const state = profileReducer(initialState, { type: fetchParentDashboard.pending.type });
      expect(state.isParentDashboardLoading).toBe(true);
    });

    it('updates parentDashboardData on fulfilled', async () => {
      vi.mocked(parentApi.getParentDashboardApi).mockResolvedValueOnce({ value: sampleDashboard } as any);
      const dispatch = vi.fn();
      const getState = vi.fn();
      const result = await fetchParentDashboard()(dispatch, getState, undefined);

      expect(result.type).toBe('profile/fetchParentDashboard/fulfilled');
      expect(result.payload).toEqual(sampleDashboard);
    });

    it('returns fallback data on error', async () => {
      vi.mocked(parentApi.getParentDashboardApi).mockRejectedValueOnce(new Error('Network error'));
      const dispatch = vi.fn();
      const getState = vi.fn();
      const result = await fetchParentDashboard()(dispatch, getState, undefined);

      expect(result.type).toBe('profile/fetchParentDashboard/fulfilled');
      expect(result.payload).toEqual({ children: [] });
    });
  });
});

