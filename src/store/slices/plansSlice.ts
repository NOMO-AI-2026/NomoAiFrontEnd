import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getPlansApi, getUsdToEgpRateApi, createPlanApi, updatePlanApi, deletePlanApi, type CreateUpdatePlanPayload } from '../../api/plansApi';
import { type SubscriptionPlan } from '../../types/plan.types';

interface PlansState {
  plans: SubscriptionPlan[];
  usdToEgpRate: number;
  isLoading: boolean;
  isActionLoading: boolean;
  error: string | null;
}

const initialState: PlansState = {
  plans: [],
  usdToEgpRate: 48.5,
  isLoading: false,
  isActionLoading: false,
  error: null,
};

// Async Thunk لجلب باقات الاشتراكات وسعر الصرف المباشر
export const fetchPlansAndRate = createAsyncThunk(
  'plans/fetchPlansAndRate',
  async (_, { rejectWithValue }) => {
    try {
      const [plansRes, rateRes] = await Promise.all([
        getPlansApi(),
        getUsdToEgpRateApi(),
      ]);

      let rawPlans: SubscriptionPlan[] = [];
      if (plansRes && Array.isArray(plansRes.value)) {
        rawPlans = plansRes.value;
      } else if (Array.isArray(plansRes)) {
        rawPlans = plansRes as unknown as SubscriptionPlan[];
      }

      return {
        plans: rawPlans,
        rate: rateRes,
      };
    } catch (error: unknown) {
      console.error('Error fetching plans and rate:', error);
      const err = error as { message?: string };
      return rejectWithValue(err.message || 'حدث خطأ أثناء تحميل باقات الاشتراكات');
    }
  }
);

// Async Thunk لإنشاء باقة جديدة
export const createPlan = createAsyncThunk(
  'plans/createPlan',
  async (payload: CreateUpdatePlanPayload, { rejectWithValue, dispatch }) => {
    try {
      await createPlanApi(payload);
      dispatch(fetchPlansAndRate());
      return true;
    } catch (error: unknown) {
      console.error('Error creating plan:', error);
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'فشل إضافة باقة الاشتراك');
    }
  }
);

// Async Thunk لتعديل باقة موجودة
export const updatePlan = createAsyncThunk(
  'plans/updatePlan',
  async ({ planId, payload }: { planId: number; payload: CreateUpdatePlanPayload }, { rejectWithValue, dispatch }) => {
    try {
      await updatePlanApi(planId, payload);
      dispatch(fetchPlansAndRate());
      return true;
    } catch (error: unknown) {
      console.error('Error updating plan:', error);
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'فشل تعديل باقة الاشتراك');
    }
  }
);

// Async Thunk لحذف باقة
export const deletePlan = createAsyncThunk(
  'plans/deletePlan',
  async (planId: number, { rejectWithValue, dispatch }) => {
    try {
      await deletePlanApi(planId);
      dispatch(fetchPlansAndRate());
      return true;
    } catch (error: unknown) {
      console.error('Error deleting plan:', error);
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'فشل حذف باقة الاشتراك');
    }
  }
);

const plansSlice = createSlice({
  name: 'plans',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlansAndRate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPlansAndRate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.plans = action.payload.plans;
        state.usdToEgpRate = action.payload.rate;
      })
      .addCase(fetchPlansAndRate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Plan
      .addCase(createPlan.pending, (state) => {
        state.isActionLoading = true;
      })
      .addCase(createPlan.fulfilled, (state) => {
        state.isActionLoading = false;
      })
      .addCase(createPlan.rejected, (state) => {
        state.isActionLoading = false;
      })
      // Update Plan
      .addCase(updatePlan.pending, (state) => {
        state.isActionLoading = true;
      })
      .addCase(updatePlan.fulfilled, (state) => {
        state.isActionLoading = false;
      })
      .addCase(updatePlan.rejected, (state) => {
        state.isActionLoading = false;
      })
      // Delete Plan
      .addCase(deletePlan.pending, (state) => {
        state.isActionLoading = true;
      })
      .addCase(deletePlan.fulfilled, (state) => {
        state.isActionLoading = false;
      })
      .addCase(deletePlan.rejected, (state) => {
        state.isActionLoading = false;
      });
  },
});

export default plansSlice.reducer;
