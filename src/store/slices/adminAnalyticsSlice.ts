import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAdminAnalyticsOverviewApi } from '../../api/adminApi';

export interface AdminAnalyticsState {
  overview: {
    generatedAtUtc: string;
    users: {
      parentsTotal: number;
      doctorsTotal: number;
      doctorsApproved: number;
      doctorsPendingApproval: number;
    };
    children: {
      total: number;
      withParentAssigned: number;
      withoutParentAssigned: number;
    };
    therapy: {
      activitiesTotal: number;
      sessionsTotal: number;
      sessionsByStatus: {
        scheduled: number;
        inProgress: number;
        completed: number;
        cancelled: number;
        missed: number;
      };
      sessionAttemptsTotal: number;
      sessionSummariesTotal: number;
      attemptEvaluationsTotal: number;
      attemptTranscriptionsTotal: number;
    };
    alerts: {
      progressAlertsTotal: number;
      byType: {
        milestone: number;
        improvement: number;
        concern: number;
        regression: number;
      };
    };
    support: {
      ticketsTotal: number;
      byStatus: {
        unread: number;
        inProgress: number;
        resolved: number;
        closed: number;
      };
      awaitingAdminAction: number;
      handledByAdmin: number;
      userMutableOpen: number;
      lockedForUser: number;
    };
    speechLevels: {
      catalogCount: number;
      childrenPerLevel: Array<{
        speechLevelId: number;
        name: string;
        childrenCount: number;
      }>;
    };
  } | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminAnalyticsState = {
  overview: null,
  isLoading: false,
  error: null,
};

// Async thunk لجلب بيانات الإحصائيات العامة للآدمن
export const fetchAdminAnalyticsOverview = createAsyncThunk(
  'adminAnalytics/fetchOverview',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAdminAnalyticsOverviewApi();
      return data;
    } catch (error: any) {
      console.error('Error fetching admin analytics:', error);
      const msg = error.response?.data?.message || error.message || 'فشل تحميل بيانات الإحصائيات';
      return rejectWithValue(msg);
    }
  }
);

const adminAnalyticsSlice = createSlice({
  name: 'adminAnalytics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminAnalyticsOverview.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminAnalyticsOverview.fulfilled, (state, action) => {
        state.isLoading = false;
        state.overview = action.payload?.value || action.payload || null;
      })
      .addCase(fetchAdminAnalyticsOverview.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default adminAnalyticsSlice.reducer;
