import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchProfileApi, updateProfileApi } from '../../api/profileApi';

export interface DoctorSpecificData {
  yearsOfExperience: number | null;
  clinicName: string | null;
  professionalBio: string | null;
}

export interface ProfileData {
  fullName: string;
  email: string; 
  phoneNumber: string;
  gender: number;
  age: number;
  doctorSpecificData: DoctorSpecificData | null;
}

interface ProfileState {
  data: ProfileData | null;
  loading: boolean;
  updateLoading: boolean; 
  error: string | null;
  updateError: string | null;
}

const initialState: ProfileState = {
  data: null,
  loading: false,
  updateLoading: false,
  error: null,
  updateError: null,
};

export const getProfile = createAsyncThunk(
  'profile/getProfile',
  async (_, thunkAPI) => {
    try {
      const data = await fetchProfileApi();
      return data;
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(
        (error as { response?: { data?: { error?: { description?: string } } } }).response?.data?.error?.description || 'حدث خطأ أثناء جلب البيانات'
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
      return thunkAPI.rejectWithValue(
        (error as { response?: { data?: { error?: { description?: string } } } }).response?.data?.error?.description || 'حدث خطأ أثناء تحديث البيانات'
      );
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
      });
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;