import { describe, it, expect, vi, beforeEach } from 'vitest';
import paymentReducer, {
  fetchPaymentMethods,
  createQuickLink,
  resetPaymentState,
} from './paymentSlice';
import * as paymentApi from '../../../api/paymentApi';
import * as idempotency from '../../../utils/idempotency/idempotency';
import type { PaymentMethod, CreateQuickLinkPayload, QuickLinkResult } from '../../../types/payment.types';

vi.mock('../../../api/paymentApi', () => ({
  getPaymentMethodsApi: vi.fn(),
  createQuickLinkApi: vi.fn(),
}));

vi.mock('../../../utils/idempotency/idempotency', () => ({
  clearIdempotencyKey: vi.fn(),
}));

describe('paymentSlice reducer & thunks', () => {
  const initialState = {
    paymentMethods: [],
    isLoadingMethods: false,
    isCreatingLink: false,
    quickLinkResult: null,
    error: null,
  };

  const samplePaymentMethods: PaymentMethod[] = [
    { id: '1', name: 'Method 1', type: 1, provider: 1 },
  ];

  const sampleQuickLinkResult: QuickLinkResult = {
    url: 'https://payment.link',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('reducer actions', () => {
    it('should return initial state', () => {
      expect(paymentReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle resetPaymentState', () => {
      const state = {
        ...initialState,
        quickLinkResult: sampleQuickLinkResult,
        error: 'Some error',
      };
      const nextState = paymentReducer(state, resetPaymentState());
      expect(nextState.quickLinkResult).toBeNull();
      expect(nextState.error).toBeNull();
    });
  });

  describe('fetchPaymentMethods thunk', () => {
    it('sets isLoadingMethods true on pending', () => {
      const action = { type: fetchPaymentMethods.pending.type };
      const state = paymentReducer(initialState, action);
      expect(state.isLoadingMethods).toBe(true);
      expect(state.error).toBeNull();
    });

    it('updates paymentMethods on fulfilled with successful response', async () => {
      vi.mocked(paymentApi.getPaymentMethodsApi).mockResolvedValueOnce({
        isSuccess: true,
        value: samplePaymentMethods,
      });

      const dispatch = vi.fn();
      const getState = vi.fn();

      const result = await fetchPaymentMethods()(dispatch, getState, undefined);

      expect(result.type).toBe('payment/fetchPaymentMethods/fulfilled');
      expect(result.payload).toEqual(samplePaymentMethods);

      const action = {
        type: fetchPaymentMethods.fulfilled.type,
        payload: samplePaymentMethods,
      };
      const state = paymentReducer(initialState, action);
      expect(state.isLoadingMethods).toBe(false);
      expect(state.paymentMethods).toEqual(samplePaymentMethods);
    });

    it('returns empty array on fulfilled when response value is not an array', async () => {
      vi.mocked(paymentApi.getPaymentMethodsApi).mockResolvedValueOnce({
        isSuccess: true,
        value: null,
      });

      const dispatch = vi.fn();
      const getState = vi.fn();

      const result = await fetchPaymentMethods()(dispatch, getState, undefined);

      expect(result.payload).toEqual([]);
    });

    it('sets error on rejected', async () => {
      vi.mocked(paymentApi.getPaymentMethodsApi).mockRejectedValueOnce({
        message: 'Network Error',
      });

      const dispatch = vi.fn();
      const getState = vi.fn();

      const result = await fetchPaymentMethods()(dispatch, getState, undefined);

      expect(result.type).toBe('payment/fetchPaymentMethods/rejected');
      expect(result.payload).toBe('Network Error');

      const action = {
        type: fetchPaymentMethods.rejected.type,
        payload: 'Network Error',
      };
      const state = paymentReducer(initialState, action);
      expect(state.isLoadingMethods).toBe(false);
      expect(state.error).toBe('Network Error');
    });
  });

  describe('createQuickLink thunk', () => {
    const payload: CreateQuickLinkPayload = { planId: 1, methodId: '1' };

    it('sets isCreatingLink true on pending', () => {
      const action = { type: createQuickLink.pending.type };
      const state = paymentReducer(initialState, action);
      expect(state.isCreatingLink).toBe(true);
      expect(state.error).toBeNull();
    });

    it('updates quickLinkResult on fulfilled and clears idempotency key', async () => {
      vi.mocked(paymentApi.createQuickLinkApi).mockResolvedValueOnce({
        isSuccess: true,
        value: sampleQuickLinkResult,
      });

      const dispatch = vi.fn();
      const getState = vi.fn();

      const result = await createQuickLink(payload)(dispatch, getState, undefined);

      expect(result.type).toBe('payment/createQuickLink/fulfilled');
      expect(result.payload).toEqual(sampleQuickLinkResult);
      expect(idempotency.clearIdempotencyKey).toHaveBeenCalledWith(payload.planId);

      const action = {
        type: createQuickLink.fulfilled.type,
        payload: sampleQuickLinkResult,
      };
      const state = paymentReducer(initialState, action);
      expect(state.isCreatingLink).toBe(false);
      expect(state.quickLinkResult).toEqual(sampleQuickLinkResult);
    });

    it('sets error on rejected when API returns success=false', async () => {
      vi.mocked(paymentApi.createQuickLinkApi).mockResolvedValueOnce({
        isSuccess: false,
        error: { description: 'API Error' },
      });

      const dispatch = vi.fn();
      const getState = vi.fn();

      const result = await createQuickLink(payload)(dispatch, getState, undefined);

      expect(result.type).toBe('payment/createQuickLink/rejected');
      expect(result.payload).toBe('API Error');
    });

    it('sets error on rejected when exception occurs', async () => {
      vi.mocked(paymentApi.createQuickLinkApi).mockRejectedValueOnce({
        response: { data: { message: 'Exception Error' } },
      });

      const dispatch = vi.fn();
      const getState = vi.fn();

      const result = await createQuickLink(payload)(dispatch, getState, undefined);

      expect(result.type).toBe('payment/createQuickLink/rejected');
      expect(result.payload).toBe('Exception Error');

      const action = {
        type: createQuickLink.rejected.type,
        payload: 'Exception Error',
      };
      const state = paymentReducer(initialState, action);
      expect(state.isCreatingLink).toBe(false);
      expect(state.error).toBe('Exception Error');
    });
  });
});

