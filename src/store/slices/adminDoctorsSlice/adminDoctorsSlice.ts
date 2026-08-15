import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getDoctorDetailsByAdminApi,
  acceptPendingDoctorDocumentsApi,
  rejectPendingDoctorDocumentsApi,
  type AdminDoctorDetails,
} from '../../../api/adminApi';

export interface AdminDoctorsState {
  selectedDoctor: AdminDoctorDetails | null;
  isDetailsLoading: boolean;
  detailsError: string | null;
  isActionLoading: boolean;
}

const initialState: AdminDoctorsState = {
  selectedDoctor: null,
  isDetailsLoading: false,
  detailsError: null,
  isActionLoading: false,
};

function unwrapDoctorDetails(payload: unknown): AdminDoctorDetails | null {
  if (!payload || typeof payload !== 'object') return null;
  const record = payload as Record<string, unknown>;

  if (record.value && typeof record.value === 'object') {
    return record.value as AdminDoctorDetails;
  }

  if ('userId' in record || 'email' in record || 'fullName' in record) {
    return payload as AdminDoctorDetails;
  }

  return null;
}

// Async thunk لجلب تفاصيل طبيب محدد بالـ userId
export const fetchDoctorDetailsByAdmin = createAsyncThunk(
  'adminDoctors/fetchDetails',
  async (userId: string, { rejectWithValue }) => {
    try {
      const data = await getDoctorDetailsByAdminApi(userId);
      return data;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { description?: string }; message?: string } }; message?: string };
      console.error('Error fetching doctor details:', error);
      const msg = error.response?.data?.error?.description || error.response?.data?.message || error.message || 'فشل جلب تفاصيل الطبيب';
      return rejectWithValue(msg);
    }
  }
);

// Async thunk قبول مستندات الطبيب الجديدة
export const acceptPendingDoctorDocuments = createAsyncThunk(
  'adminDoctors/acceptPendingDocuments',
  async (userId: string, { rejectWithValue }) => {
    try {
      const data = await acceptPendingDoctorDocumentsApi(userId);
      return { userId, data };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { description?: string }; message?: string } }; message?: string };
      console.error('Error accepting pending documents:', error);
      const msg = error.response?.data?.error?.description || error.response?.data?.message || error.message || 'فشل قبول المستندات';
      return rejectWithValue(msg);
    }
  }
);

// Async thunk رفض مستندات الطبيب الجديدة
export const rejectPendingDoctorDocuments = createAsyncThunk(
  'adminDoctors/rejectPendingDocuments',
  async (userId: string, { rejectWithValue }) => {
    try {
      const data = await rejectPendingDoctorDocumentsApi(userId);
      return { userId, data };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { description?: string }; message?: string } }; message?: string };
      console.error('Error rejecting pending documents:', error);
      const msg = error.response?.data?.error?.description || error.response?.data?.message || error.message || 'فشل رفض المستندات';
      return rejectWithValue(msg);
    }
  }
);

const adminDoctorsSlice = createSlice({
  name: 'adminDoctors',
  initialState,
  reducers: {
    clearSelectedDoctor: (state) => {
      state.selectedDoctor = null;
      state.detailsError = null;
      state.isDetailsLoading = false;
      state.isActionLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctorDetailsByAdmin.pending, (state) => {
        state.isDetailsLoading = true;
        state.detailsError = null;
      })
      .addCase(fetchDoctorDetailsByAdmin.fulfilled, (state, action) => {
        state.isDetailsLoading = false;
        state.selectedDoctor = unwrapDoctorDetails(action.payload);
      })
      .addCase(fetchDoctorDetailsByAdmin.rejected, (state, action) => {
        state.isDetailsLoading = false;
        state.detailsError = action.payload as string;
      })
      .addCase(acceptPendingDoctorDocuments.pending, (state) => {
        state.isActionLoading = true;
      })
      .addCase(acceptPendingDoctorDocuments.fulfilled, (state) => {
        state.isActionLoading = false;
        if (state.selectedDoctor) {
          if (state.selectedDoctor.pendingPracticeLicenseUrl) {
            state.selectedDoctor.practiceLicenseUrl = state.selectedDoctor.pendingPracticeLicenseUrl;
            state.selectedDoctor.pendingPracticeLicenseUrl = null;
          }
          if (state.selectedDoctor.pendingSyndicateCardUrl) {
            state.selectedDoctor.syndicateCardUrl = state.selectedDoctor.pendingSyndicateCardUrl;
            state.selectedDoctor.pendingSyndicateCardUrl = null;
          }
          state.selectedDoctor.hasPendingDocuments = false;
        }
      })
      .addCase(acceptPendingDoctorDocuments.rejected, (state, action) => {
        state.isActionLoading = false;
        state.detailsError = action.payload as string;
      })
      .addCase(rejectPendingDoctorDocuments.pending, (state) => {
        state.isActionLoading = true;
      })
      .addCase(rejectPendingDoctorDocuments.fulfilled, (state) => {
        state.isActionLoading = false;
        if (state.selectedDoctor) {
          state.selectedDoctor.pendingPracticeLicenseUrl = null;
          state.selectedDoctor.pendingSyndicateCardUrl = null;
          state.selectedDoctor.hasPendingDocuments = false;
        }
      })
      .addCase(rejectPendingDoctorDocuments.rejected, (state, action) => {
        state.isActionLoading = false;
        state.detailsError = action.payload as string;
      });
  },
});

export const { clearSelectedDoctor } = adminDoctorsSlice.actions;
export default adminDoctorsSlice.reducer;
