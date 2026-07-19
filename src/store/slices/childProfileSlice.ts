import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getChildProfileApi, getSpeechLevelHistoryApi } from '../../api/doctorApi';
import { type ChildProfileData, type PaginatedSpeechHistory } from '../../types/child.types';

interface ChildProfileState {
  profileData: ChildProfileData | null;
  isLoading: boolean;
  error: string | null;
  speechHistory: PaginatedSpeechHistory | null;
  isHistoryLoading: boolean;
  historyError: string | null;
}

const initialState: ChildProfileState = {
  profileData: null,
  isLoading: false,
  error: null,
  speechHistory: null,
  isHistoryLoading: false,
  historyError: null,
};

export const fetchChildProfile = createAsyncThunk(
  'childProfile/fetchChildProfile',
  async (id: number, { rejectWithValue }) => {
    try {
      const data = await getChildProfileApi(id);
      return data; 
    } catch (error: unknown) {
      return rejectWithValue((error as { response?: { data?: { message?: string } } }).response?.data?.message || 'حدث خطأ في جلب بيانات الطفل');
    }
  }
);

export const fetchSpeechHistory = createAsyncThunk(
  'childProfile/fetchSpeechHistory',
  async ({ childId, pageNumber = 1, pageSize = 10 }: { childId: number, pageNumber?: number, pageSize?: number }, { rejectWithValue }) => {
    try {
      const data = await getSpeechLevelHistoryApi(childId, pageNumber, pageSize);
      if (data.isSuccess) {
        return data.value; 
      }
      return rejectWithValue(data.error?.description || 'حدث خطأ في جلب السجل');
    } catch (error: unknown) {
      return rejectWithValue((error as { response?: { data?: { message?: string } } }).response?.data?.message || 'حدث خطأ في الاتصال بالخادم');
    }
  }
);

const childProfileSlice = createSlice({
  name: 'childProfile',
  initialState,
  reducers: {
    clearProfileData: (state) => {
      state.profileData = null;
      state.speechHistory = null; 
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChildProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChildProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profileData = action.payload;
      })
      .addCase(fetchChildProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchSpeechHistory.pending, (state) => {
        state.isHistoryLoading = true;
        state.historyError = null;
      })
      .addCase(fetchSpeechHistory.fulfilled, (state, action) => {
        state.isHistoryLoading = false;
        state.speechHistory = action.payload;
      })
      .addCase(fetchSpeechHistory.rejected, (state, action) => {
        state.isHistoryLoading = false;
        state.historyError = action.payload as string;
      });
  },
});

export const { clearProfileData } = childProfileSlice.actions;
export default childProfileSlice.reducer;