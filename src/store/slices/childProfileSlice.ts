import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getChildProfileApi } from '../../api/doctorApi';
import { type ChildProfileData } from '../../types/child.types';

interface ChildProfileState {
  profileData: ChildProfileData | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ChildProfileState = {
  profileData: null,
  isLoading: false,
  error: null,
};

export const fetchChildProfile = createAsyncThunk(
  'childProfile/fetchChildProfile',
  async (id: number, { rejectWithValue }) => {
    try {
      const data = await getChildProfileApi(id);
      return data; 
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'حدث خطأ في جلب بيانات الطفل');
    }
  }
);

const childProfileSlice = createSlice({
  name: 'childProfile',
  initialState,
  reducers: {
    clearProfileData: (state) => {
      state.profileData = null;
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
      });
  },
});

export const { clearProfileData } = childProfileSlice.actions;
export default childProfileSlice.reducer;