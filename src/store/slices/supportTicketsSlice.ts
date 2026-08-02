import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchSupportTickets, type PaginatedTicketsResponse,type GetTicketsQueryParams } from '../../api/supportTicketsApi';

// تعريف الـ Thunk لجلب التذاكر
export const getTickets = createAsyncThunk(
  'supportTickets/getTickets',
  async (params: GetTicketsQueryParams, { rejectWithValue }) => {
    try {
      const data = await fetchSupportTickets(params);
      return data;
    } catch (error: unknown) {
      return rejectWithValue((error as { response?: { data: string } }).response?.data || 'حدث خطأ أثناء جلب التذاكر');
    }
  }
);

// هيكل الـ State
interface SupportTicketsState {
  data: PaginatedTicketsResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: SupportTicketsState = {
  data: null,
  loading: false,
  error: null,
};

const supportTicketsSlice = createSlice({
  name: 'supportTickets',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(getTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default supportTicketsSlice.reducer;