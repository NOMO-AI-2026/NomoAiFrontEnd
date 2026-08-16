import { describe, it, expect, vi, beforeEach } from 'vitest';
import plansReducer, {
  fetchPlansAndRate,
  createPlan,
  updatePlan,
  deletePlan,
} from './plansSlice';
import * as plansApi from '../../../api/plansApi';
import type { SubscriptionPlan } from '../../../types/plan.types';

vi.mock('../../../api/plansApi', () => ({
  getPlansApi: vi.fn(),
  getUsdToEgpRateApi: vi.fn(),
  createPlanApi: vi.fn(),
  updatePlanApi: vi.fn(),
  deletePlanApi: vi.fn(),
}));

describe('plansSlice reducer & thunks', () => {
  const initialState = {
    plans: [],
    usdToEgpRate: 48.5,
    isLoading: false,
    isActionLoading: false,
    error: null,
  };

  const samplePlans: SubscriptionPlan[] = [
    {
      id: 1,
      nameAr: 'خطة تجريبية',
      nameEn: 'Trial Plan',
      descriptionAr: 'وصف',
      descriptionEn: 'Description',
      price: 100,
      currency: 1,
      sessionsCount: 5,
      isActive: true,
      createdAtUtc: '2026-08-16',
      updatedAtUtc: '2026-08-16',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('reducer actions', () => {
    it('should return initial state', () => {
      expect(plansReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });
  });

  describe('fetchPlansAndRate thunk', () => {
    it('sets isLoading true on pending', () => {
      const action = { type: fetchPlansAndRate.pending.type };
      const state = plansReducer(initialState, action);
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('updates plans and rate on fulfilled (when plans in value property)', async () => {
      vi.mocked(plansApi.getPlansApi).mockResolvedValueOnce({
        isSuccess: true,
        value: samplePlans,
      } as any);
      vi.mocked(plansApi.getUsdToEgpRateApi).mockResolvedValueOnce(50.0);

      const dispatch = vi.fn();
      const getState = vi.fn();

      const result = await fetchPlansAndRate()(dispatch, getState, undefined);

      expect(result.type).toBe('plans/fetchPlansAndRate/fulfilled');
      expect(result.payload).toEqual({ plans: samplePlans, rate: 50.0 });

      const state = plansReducer(initialState, {
        type: fetchPlansAndRate.fulfilled.type,
        payload: { plans: samplePlans, rate: 50.0 },
      });
      expect(state.isLoading).toBe(false);
      expect(state.plans).toEqual(samplePlans);
      expect(state.usdToEgpRate).toBe(50.0);
    });

    it('updates plans and rate on fulfilled (when plans is array)', async () => {
      vi.mocked(plansApi.getPlansApi).mockResolvedValueOnce(samplePlans as any);
      vi.mocked(plansApi.getUsdToEgpRateApi).mockResolvedValueOnce(49.0);

      const dispatch = vi.fn();
      const getState = vi.fn();

      const result = await fetchPlansAndRate()(dispatch, getState, undefined);

      expect(result.payload).toEqual({ plans: samplePlans, rate: 49.0 });
    });

    it('sets error on rejected', async () => {
      vi.mocked(plansApi.getPlansApi).mockRejectedValueOnce({
        message: 'Network Error',
      });

      const dispatch = vi.fn();
      const getState = vi.fn();

      const result = await fetchPlansAndRate()(dispatch, getState, undefined);

      expect(result.type).toBe('plans/fetchPlansAndRate/rejected');
      expect(result.payload).toBe('Network Error');

      const state = plansReducer(initialState, {
        type: fetchPlansAndRate.rejected.type,
        payload: 'Network Error',
      });
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('Network Error');
    });
  });

  describe('createPlan thunk', () => {
    const payload = {
      nameAr: 'خطة', nameEn: 'Plan', descriptionAr: '', descriptionEn: '', price: 100, currency: 1, sessionsCount: 5, isActive: true
    };

    it('sets isActionLoading on pending/fulfilled/rejected', () => {
      let state = plansReducer(initialState, { type: createPlan.pending.type });
      expect(state.isActionLoading).toBe(true);

      state = plansReducer(state, { type: createPlan.fulfilled.type });
      expect(state.isActionLoading).toBe(false);

      state = plansReducer(initialState, { type: createPlan.pending.type });
      state = plansReducer(state, { type: createPlan.rejected.type });
      expect(state.isActionLoading).toBe(false);
    });

    it('dispatches fetchPlansAndRate on success', async () => {
      vi.mocked(plansApi.createPlanApi).mockResolvedValueOnce({});

      const dispatch = vi.fn();
      const getState = vi.fn();

      const result = await createPlan(payload)(dispatch, getState, undefined);

      expect(result.type).toBe('plans/createPlan/fulfilled');
      expect(dispatch).toHaveBeenCalled(); // Should call fetchPlansAndRate
    });

    it('returns error on failure', async () => {
      vi.mocked(plansApi.createPlanApi).mockRejectedValueOnce({
        response: { data: { message: 'API Error' } },
      });

      const dispatch = vi.fn();
      const getState = vi.fn();

      const result = await createPlan(payload)(dispatch, getState, undefined);

      expect(result.type).toBe('plans/createPlan/rejected');
      expect(result.payload).toBe('API Error');
    });
  });

  describe('updatePlan thunk', () => {
    const payload = {
      planId: 1,
      payload: { nameAr: 'تعديل', nameEn: 'Edit', descriptionAr: '', descriptionEn: '', price: 100, currency: 1, sessionsCount: 5, isActive: true }
    };

    it('sets isActionLoading on pending/fulfilled/rejected', () => {
      let state = plansReducer(initialState, { type: updatePlan.pending.type });
      expect(state.isActionLoading).toBe(true);
      state = plansReducer(state, { type: updatePlan.fulfilled.type });
      expect(state.isActionLoading).toBe(false);
    });

    it('dispatches fetchPlansAndRate on success', async () => {
      vi.mocked(plansApi.updatePlanApi).mockResolvedValueOnce({});
      const dispatch = vi.fn();
      const getState = vi.fn();
      const result = await updatePlan(payload)(dispatch, getState, undefined);
      expect(result.type).toBe('plans/updatePlan/fulfilled');
      expect(dispatch).toHaveBeenCalled();
    });

    it('returns error on failure', async () => {
      vi.mocked(plansApi.updatePlanApi).mockRejectedValueOnce({
        response: { data: { message: 'Update Error' } },
      });
      const dispatch = vi.fn();
      const getState = vi.fn();
      const result = await updatePlan(payload)(dispatch, getState, undefined);
      expect(result.type).toBe('plans/updatePlan/rejected');
      expect(result.payload).toBe('Update Error');
    });
  });

  describe('deletePlan thunk', () => {
    it('sets isActionLoading on pending/fulfilled/rejected', () => {
      let state = plansReducer(initialState, { type: deletePlan.pending.type });
      expect(state.isActionLoading).toBe(true);
      state = plansReducer(state, { type: deletePlan.fulfilled.type });
      expect(state.isActionLoading).toBe(false);
    });

    it('dispatches fetchPlansAndRate on success', async () => {
      vi.mocked(plansApi.deletePlanApi).mockResolvedValueOnce({});
      const dispatch = vi.fn();
      const getState = vi.fn();
      const result = await deletePlan(1)(dispatch, getState, undefined);
      expect(result.type).toBe('plans/deletePlan/fulfilled');
      expect(dispatch).toHaveBeenCalled();
    });

    it('returns error on failure', async () => {
      vi.mocked(plansApi.deletePlanApi).mockRejectedValueOnce({
        response: { data: { message: 'Delete Error' } },
      });
      const dispatch = vi.fn();
      const getState = vi.fn();
      const result = await deletePlan(1)(dispatch, getState, undefined);
      expect(result.type).toBe('plans/deletePlan/rejected');
      expect(result.payload).toBe('Delete Error');
    });
  });
});

