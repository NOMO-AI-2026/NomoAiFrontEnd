import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDoctorChildrenApi, type Child } from '../../api/doctorApi'; 

interface ChildrenState {
  children: Child[]; 
  isLoading: boolean;
  error: string | null;
}

const initialState: ChildrenState = {
  children: [],
  isLoading: false,
  error: null,
};

export const fetchChildren = createAsyncThunk(
  'children/fetchChildren',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getDoctorChildrenApi();
      if (data.isSuccess) {
        return data.value;
      }
      return rejectWithValue(data.error?.description || 'حدث خطأ غير معروف');
    } catch (error) {
        console.error('Error fetching children:', error);
      return rejectWithValue('فشل الاتصال بالخادم');
    }
  }
);

const childrenSlice = createSlice({
  name: 'children',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchChildren.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChildren.fulfilled, (state, action) => {
        state.isLoading = false;
        state.children = action.payload; 
      })
      .addCase(fetchChildren.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default childrenSlice.reducer;