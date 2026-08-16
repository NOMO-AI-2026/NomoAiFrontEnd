import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getPaymentMethodsApi, createQuickLinkApi } from '../../../api/paymentApi';
import { type PaymentMethod, type CreateQuickLinkPayload, type QuickLinkResult } from '../../../types/payment.types';
import { clearIdempotencyKey } from '../../../utils/idempotency/idempotency';

interface PaymentState {
  paymentMethods: PaymentMethod[];
  isLoadingMethods: boolean;
  isCreatingLink: boolean;
  quickLinkResult: QuickLinkResult | null;
  error: string | null;
}

const initialState: PaymentState = {
  paymentMethods: [],
  isLoadingMethods: false,
  isCreatingLink: false,
  quickLinkResult: null,
  error: null,
};

// Async Thunk لجلب طرق الدفع المتاحة
export const fetchPaymentMethods = createAsyncThunk(
  'payment/fetchPaymentMethods',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getPaymentMethodsApi();
      if (res && res.isSuccess && Array.isArray(res.value)) {
        return res.value;
      }
      return [];
    } catch (error: unknown) {
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'فشل جلب طرق الدفع المتاحة');
    }
  }
);

// Async Thunk لإنشاء رابط الدفع المباشر
export const createQuickLink = createAsyncThunk(
  'payment/createQuickLink',
  async (payload: CreateQuickLinkPayload, { rejectWithValue }) => {
    try {
      const res = await createQuickLinkApi(payload);
      if (res && res.isSuccess && res.value) {
        // تفريغ المفتاح المخزن لضمان عملية عملية لاحقة نظيفة
        clearIdempotencyKey(payload.planId);
        return res.value;
      }
      return rejectWithValue(res.error?.description || 'فشل إعداد رابط الدفع السريع');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { description?: string }; message?: string } } };
      const msg = err.response?.data?.error?.description || err.response?.data?.message || 'حدث خطأ أثناء إعداد رابط الدفع';
      return rejectWithValue(msg);
    }
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    resetPaymentState: (state) => {
      state.quickLinkResult = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Payment Methods
      .addCase(fetchPaymentMethods.pending, (state) => {
        state.isLoadingMethods = true;
        state.error = null;
      })
      .addCase(fetchPaymentMethods.fulfilled, (state, action) => {
        state.isLoadingMethods = false;
        state.paymentMethods = action.payload;
      })
      .addCase(fetchPaymentMethods.rejected, (state, action) => {
        state.isLoadingMethods = false;
        state.error = action.payload as string;
      })
      // Create Quick Link
      .addCase(createQuickLink.pending, (state) => {
        state.isCreatingLink = true;
        state.error = null;
      })
      .addCase(createQuickLink.fulfilled, (state, action) => {
        state.isCreatingLink = false;
        state.quickLinkResult = action.payload;
      })
      .addCase(createQuickLink.rejected, (state, action) => {
        state.isCreatingLink = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetPaymentState } = paymentSlice.actions;
export default paymentSlice.reducer;

