import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  fetchSupportTickets, 
  fetchTicketById,
  updateTicketAction,
  type PaginatedTicketsResponse, 
  type GetTicketsQueryParams,
  type SupportTicketDetails,
  type TicketActionPayload
} from '../../api/supportTicketsApi';

// Thunk لجلب قائمة التذاكر
export const getTickets = createAsyncThunk(
  'supportTickets/getTickets',
  async (params: GetTicketsQueryParams, { rejectWithValue }) => {
    try {
      const data = await fetchSupportTickets(params);
      return data;
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message || (error as { message?: string }).message || 'حدث خطأ أثناء جلب التذاكر';
      return rejectWithValue(msg);
    }
  }
);

// Thunk لجلب تفاصيل تذكرة معينة
export const getTicketDetails = createAsyncThunk(
  'supportTickets/getTicketDetails',
  async (id: number, { rejectWithValue }) => {
    try {
      const data = await fetchTicketById(id);
      return data;
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message || (error as { message?: string }).message || 'حدث خطأ أثناء جلب تفاصيل التذكرة';
      return rejectWithValue(msg);
    }
  }
);

// Thunk لاتخاذ إجراء على التذكرة (تغيير الحالة أو كتابة رد)
export const respondToTicket = createAsyncThunk(
  'supportTickets/respondToTicket',
  async (payload: TicketActionPayload, { rejectWithValue }) => {
    try {
      const data = await updateTicketAction(payload);
      return data;
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message || (error as { message?: string }).message || 'حدث خطأ أثناء إرسال الرد';
      return rejectWithValue(msg);
    }
  }
);

// هيكل الـ State
interface SupportTicketsState {
  data: PaginatedTicketsResponse | null;
  selectedTicket: SupportTicketDetails | null;
  loading: boolean;
  detailsLoading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: SupportTicketsState = {
  data: null,
  selectedTicket: null,
  loading: false,
  detailsLoading: false,
  actionLoading: false,
  error: null,
};

const supportTicketsSlice = createSlice({
  name: 'supportTickets',
  initialState,
  reducers: {
    clearSelectedTicket: (state) => {
      state.selectedTicket = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // جلب قائمة التذاكر
      .addCase(getTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTickets.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as unknown as Record<string, unknown>;
        state.data = (payload?.value || payload || null) as unknown as PaginatedTicketsResponse;
      })
      .addCase(getTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // جلب تفاصيل التذكرة
      .addCase(getTicketDetails.pending, (state) => {
        state.detailsLoading = true;
        state.error = null;
      })
      .addCase(getTicketDetails.fulfilled, (state, action) => {
        state.detailsLoading = false;
        const payload = action.payload as unknown as Record<string, unknown>;
        state.selectedTicket = (payload?.value || payload || null) as unknown as SupportTicketDetails;
      })
      .addCase(getTicketDetails.rejected, (state, action) => {
        state.detailsLoading = false;
        state.error = action.payload as string;
      })
      // اتخاذ إجراء على التذكرة
      .addCase(respondToTicket.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(respondToTicket.fulfilled, (state, action) => {
        state.actionLoading = false;
        const payload = action.payload as unknown as Record<string, unknown>;
        const updatedVal = (payload?.value || payload) as Partial<SupportTicketDetails>;
        
        // تحديث التذكرة المحددة الحالية
        if (state.selectedTicket && state.selectedTicket.id === action.meta.arg.id) {
          state.selectedTicket = { ...state.selectedTicket, ...updatedVal };
        }
        // تحديث القائمة أيضاً إذا كانت التذكرة موجودة فيها
        if (state.data?.items) {
          state.data.items = state.data.items.map((item) => 
            item.id === action.meta.arg.id ? { ...item, ...updatedVal } : item
          );
        }
      })
      .addCase(respondToTicket.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedTicket } = supportTicketsSlice.actions;
export default supportTicketsSlice.reducer;