import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchProfileApi, updateProfileApi } from '../../api/profileApi';
import { getDoctorDashboardApi } from '../../api/doctorApi';
import { getParentDashboardApi } from '../../api/parentApi';

export interface DoctorSpecificData {
  yearsOfExperience: number | null;
  clinicName: string | null;
  professionalBio: string | null;
  practiceLicenseUrl?: string | null;
  syndicateCardUrl?: string | null;
  pendingPracticeLicenseUrl?: string | null;
  pendingSyndicateCardUrl?: string | null;
  hasPendingDocuments?: boolean;
  availableMinutes: number | null;
}

export interface ProfileData {
  fullName: string;
  email: string; 
  phoneNumber: string;
  gender: number;
  age: number;
  doctorSpecificData: DoctorSpecificData | null;
}

export interface DoctorDashboardData {
  sessions?: {
    completedLast7Days?: number;
    completedToday?: number;
    awaitingDoctorReview?: number;
  };
  cases?: {
    totalChildren?: number;
    progressedLast7Days?: unknown[];
    stableLast7Days?: unknown[];
    regressedLast7Days?: unknown[];
  };
}

export interface ParentDashboardChild {
  id?: number;
  fullName?: string;
  activity?: {
    sessionsCompletedLast7Days?: number;
    pendingExercisesCount?: number;
  };
  latestDoctorNote?: {
    id?: number;
    noteTitle?: string;
    noteContent?: string;
    createdAt?: string;
    doctorFullName?: string;
  };
  progress?: {
    completedSpeechLevels?: number;
    totalSpeechLevels?: number;
    currentGoal?: string;
  };
}

export interface ParentDashboardData {
  children?: ParentDashboardChild[];
}

interface ProfileState {
  data: ProfileData | null;
  loading: boolean;
  updateLoading: boolean; 
  error: string | null;
  updateError: string | null;
  dashboardData: DoctorDashboardData | null;
  isDashboardLoading: boolean;
  dashboardError: string | null;
  parentDashboardData: ParentDashboardData | null;
  isParentDashboardLoading: boolean;
  parentDashboardError: string | null;
}

const initialState: ProfileState = {
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

export const getProfile = createAsyncThunk(
  'profile/getProfile',
  async (_, thunkAPI) => {
    try {
      const data = await fetchProfileApi();
      return data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { description?: string } } } };
      return thunkAPI.rejectWithValue(
        err.response?.data?.error?.description || 'حدث خطأ أثناء جلب البيانات'
      );
    }
  }
);

// Thunk التعديل
export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData: ProfileData, thunkAPI) => {
    try {
      await updateProfileApi(profileData);
      return profileData; 
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { description?: string } } } };
      return thunkAPI.rejectWithValue(
        err.response?.data?.error?.description || 'حدث خطأ أثناء تحديث البيانات'
      );
    }
  }
);

// Thunk جلب إحصائيات لوحة تحكم الطبيب
export const fetchDoctorDashboard = createAsyncThunk(
  'profile/fetchDoctorDashboard',
  async () => {
    try {
      const response = await getDoctorDashboardApi();
      const payload = response?.value || response || {};
      return payload as DoctorDashboardData;
    } catch (error: unknown) {
      console.warn('Doctor dashboard fetch returned error, falling back to empty state:', error);
      return {
        sessions: { completedLast7Days: 0, completedToday: 0, awaitingDoctorReview: 0 },
        cases: { totalChildren: 0, progressedLast7Days: [], stableLast7Days: [], regressedLast7Days: [] }
      } as DoctorDashboardData;
    }
  }
);

// Thunk جلب إحصائيات لوحة تحكم ولي الأمر
export const fetchParentDashboard = createAsyncThunk(
  'profile/fetchParentDashboard',
  async () => {
    try {
      const response = await getParentDashboardApi();
      const payload = response?.value || response || {};
      return payload as ParentDashboardData;
    } catch (error: unknown) {
      console.warn('Parent dashboard fetch returned error, falling back to empty state:', error);
      return { children: [] } as ParentDashboardData;
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.data = null;
      state.error = null;
      state.updateError = null;
      state.dashboardData = null;
      state.dashboardError = null;
      state.parentDashboardData = null;
      state.parentDashboardError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // جلب البيانات
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // تحديث البيانات
      .addCase(updateProfile.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updateLoading = false;
        if (state.data) {
          state.data = { ...state.data, ...action.payload };
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload as string;
      })
      // جلب لوحة التحكم للطبيب
      .addCase(fetchDoctorDashboard.pending, (state) => {
        state.isDashboardLoading = true;
        state.dashboardError = null;
      })
      .addCase(fetchDoctorDashboard.fulfilled, (state, action) => {
        state.isDashboardLoading = false;
        state.dashboardData = action.payload;
      })
      .addCase(fetchDoctorDashboard.rejected, (state, action) => {
        state.isDashboardLoading = false;
        state.dashboardError = action.payload as string;
      })
      // جلب لوحة التحكم لولي الأمر
      .addCase(fetchParentDashboard.pending, (state) => {
        state.isParentDashboardLoading = true;
        state.parentDashboardError = null;
      })
      .addCase(fetchParentDashboard.fulfilled, (state, action) => {
        state.isParentDashboardLoading = false;
        state.parentDashboardData = action.payload;
      })
      .addCase(fetchParentDashboard.rejected, (state, action) => {
        state.isParentDashboardLoading = false;
        state.parentDashboardError = action.payload as string;
      });
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;