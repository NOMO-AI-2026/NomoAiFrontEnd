import { describe, it, expect, vi, beforeEach } from 'vitest';
import adminAnalyticsReducer, {
  fetchAdminAnalyticsOverview,
  type AdminAnalyticsState,
} from './adminAnalyticsSlice';
import * as adminApi from '../../../api/adminApi';

vi.mock('../../../api/adminApi', () => ({
  getAdminAnalyticsOverviewApi: vi.fn(),
}));

describe('adminAnalyticsSlice reducer & thunks', () => {
  const initialState: AdminAnalyticsState = {
    overview: null,
    isLoading: false,
    error: null,
  };

  const sampleOverview = {
    generatedAtUtc: '2026-08-14T20:00:00Z',
    users: {
      parentsTotal: 15,
      doctorsTotal: 5,
      doctorsApproved: 4,
      doctorsPendingApproval: 1,
    },
    children: {
      total: 30,
      withParentAssigned: 25,
      withoutParentAssigned: 5,
    },
    therapy: {
      activitiesTotal: 14,
      sessionsTotal: 31,
      sessionsByStatus: {
        scheduled: 8,
        inProgress: 1,
        completed: 22,
        cancelled: 0,
        missed: 0,
      },
      sessionAttemptsTotal: 54,
      sessionSummariesTotal: 5,
      attemptEvaluationsTotal: 54,
      attemptTranscriptionsTotal: 54,
    },
    alerts: {
      progressAlertsTotal: 10,
      byType: {
        milestone: 2,
        improvement: 5,
        concern: 2,
        regression: 1,
      },
    },
    support: {
      ticketsTotal: 8,
      byStatus: {
        unread: 1,
        inProgress: 2,
        resolved: 3,
        closed: 2,
      },
      awaitingAdminAction: 2,
      handledByAdmin: 5,
      userMutableOpen: 3,
      lockedForUser: 1,
    },
    speechLevels: {
      catalogCount: 6,
      childrenPerLevel: [
        { speechLevelId: 1, name: 'Vocalization', childrenCount: 8 },
      ],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return initial state when passed unknown action', () => {
    const state = adminAnalyticsReducer(undefined, { type: 'unknown' });
    expect(state).toEqual(initialState);
  });

  it('should set isLoading = true on fetchAdminAnalyticsOverview.pending', () => {
    const action = { type: fetchAdminAnalyticsOverview.pending.type };
    const state = adminAnalyticsReducer(initialState, action);

    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should update overview on fetchAdminAnalyticsOverview.fulfilled with direct object payload', () => {
    const action = {
      type: fetchAdminAnalyticsOverview.fulfilled.type,
      payload: sampleOverview,
    };

    const state = adminAnalyticsReducer(initialState, action);

    expect(state.isLoading).toBe(false);
    expect(state.overview).toEqual(sampleOverview);
  });

  it('should update overview on fetchAdminAnalyticsOverview.fulfilled with nested value payload', () => {
    const action = {
      type: fetchAdminAnalyticsOverview.fulfilled.type,
      payload: { value: sampleOverview },
    };

    const state = adminAnalyticsReducer(initialState, action);

    expect(state.isLoading).toBe(false);
    expect(state.overview).toEqual(sampleOverview);
  });

  it('should set error on fetchAdminAnalyticsOverview.rejected', () => {
    const action = {
      type: fetchAdminAnalyticsOverview.rejected.type,
      payload: 'فشل تحميل بيانات الإحصائيات',
    };

    const state = adminAnalyticsReducer(initialState, action);

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('فشل تحميل بيانات الإحصائيات');
  });

  describe('fetchAdminAnalyticsOverview thunk execution', () => {
    it('dispatch fulfilled when getAdminAnalyticsOverviewApi succeeds', async () => {
      vi.mocked(adminApi.getAdminAnalyticsOverviewApi).mockResolvedValueOnce(sampleOverview);

      const dispatch = vi.fn();
      const getState = vi.fn();

      const result = await fetchAdminAnalyticsOverview()(dispatch, getState, undefined);

      expect(result.type).toBe('adminAnalytics/fetchOverview/fulfilled');
      expect(result.payload).toEqual(sampleOverview);
    });

    it('dispatch rejected when getAdminAnalyticsOverviewApi fails', async () => {
      vi.mocked(adminApi.getAdminAnalyticsOverviewApi).mockRejectedValueOnce({
        message: 'Network Error',
      });

      const dispatch = vi.fn();
      const getState = vi.fn();

      const result = await fetchAdminAnalyticsOverview()(dispatch, getState, undefined);

      expect(result.type).toBe('adminAnalytics/fetchOverview/rejected');
      expect(result.payload).toBe('Network Error');
    });
  });
});
