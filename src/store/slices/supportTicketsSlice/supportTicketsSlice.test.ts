import { describe, it, expect, vi, beforeEach } from 'vitest';
import supportTicketsReducer, {
  getTickets,
  getTicketDetails,
  respondToTicket,
  clearSelectedTicket,
} from './supportTicketsSlice';
import * as supportTicketsApi from '../../../api/supportTicketsApi';
import type { PaginatedTicketsResponse, SupportTicketDetails, TicketActionPayload, GetTicketsQueryParams } from '../../../api/supportTicketsApi';

vi.mock('../../../api/supportTicketsApi', () => ({
  fetchSupportTickets: vi.fn(),
  fetchTicketById: vi.fn(),
  updateTicketAction: vi.fn(),
}));

describe('supportTicketsSlice reducer & thunks', () => {
  const initialState = {
    data: null,
    selectedTicket: null,
    loading: false,
    detailsLoading: false,
    actionLoading: false,
    error: null,
  };

  const sampleTicket: SupportTicketDetails = {
    id: 1,
    subject: 'Test Ticket',
    message: 'Issue description',
    status: 1,
    adminNote: null,
    handledByAdminUserId: null,
    handledAt: null,
    createdAt: '2026-08-16',
    userId: 'user-1',
    userFullName: 'User',
    userEmail: 'user@test.com',
    userRole: 'Parent',
  };

  const samplePaginatedTickets: PaginatedTicketsResponse = {
    items: [
      {
        id: 1,
        subject: 'Test Ticket',
        status: 1,
        createdAt: '2026-08-16',
        userId: 'user-1',
        userFullName: 'User',
        userEmail: 'user@test.com',
        userRole: 'Parent',
      },
    ],
    pageNumber: 1,
    pageSize: 10,
    totalPages: 1,
    totalCount: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('reducer actions', () => {
    it('should return initial state', () => {
      expect(supportTicketsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle clearSelectedTicket', () => {
      const state = {
        ...initialState,
        selectedTicket: sampleTicket,
      };
      const nextState = supportTicketsReducer(state, clearSelectedTicket());
      expect(nextState.selectedTicket).toBeNull();
    });
  });

  describe('getTickets thunk', () => {
    const params: GetTicketsQueryParams = { PageNumber: 1, PageSize: 10 };

    it('sets loading true on pending', () => {
      const state = supportTicketsReducer(initialState, { type: getTickets.pending.type });
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('updates data on fulfilled', async () => {
      vi.mocked(supportTicketsApi.fetchSupportTickets).mockResolvedValueOnce({ value: samplePaginatedTickets } as any);
      
      const dispatch = vi.fn();
      const getState = vi.fn();
      
      const result = await getTickets(params)(dispatch, getState, undefined);
      
      expect(result.type).toBe('supportTickets/getTickets/fulfilled');
      
      const state = supportTicketsReducer(initialState, {
        type: getTickets.fulfilled.type,
        payload: { value: samplePaginatedTickets },
      });
      expect(state.loading).toBe(false);
      expect(state.data).toEqual(samplePaginatedTickets);
    });

    it('sets error on rejected', async () => {
      vi.mocked(supportTicketsApi.fetchSupportTickets).mockRejectedValueOnce({
        response: { data: { message: 'Fetch error' } },
      });
      
      const dispatch = vi.fn();
      const getState = vi.fn();
      
      const result = await getTickets(params)(dispatch, getState, undefined);
      
      expect(result.type).toBe('supportTickets/getTickets/rejected');
      expect(result.payload).toBe('Fetch error');
    });
  });

  describe('getTicketDetails thunk', () => {
    it('sets detailsLoading true on pending', () => {
      const state = supportTicketsReducer(initialState, { type: getTicketDetails.pending.type });
      expect(state.detailsLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('updates selectedTicket on fulfilled', async () => {
      vi.mocked(supportTicketsApi.fetchTicketById).mockResolvedValueOnce({ value: sampleTicket } as any);
      
      const dispatch = vi.fn();
      const getState = vi.fn();
      
      const result = await getTicketDetails(1)(dispatch, getState, undefined);
      
      expect(result.type).toBe('supportTickets/getTicketDetails/fulfilled');
      
      const state = supportTicketsReducer(initialState, {
        type: getTicketDetails.fulfilled.type,
        payload: { value: sampleTicket },
      });
      expect(state.detailsLoading).toBe(false);
      expect(state.selectedTicket).toEqual(sampleTicket);
    });

    it('sets error on rejected', async () => {
      vi.mocked(supportTicketsApi.fetchTicketById).mockRejectedValueOnce({
        response: { data: { message: 'Details error' } },
      });
      
      const dispatch = vi.fn();
      const getState = vi.fn();
      
      const result = await getTicketDetails(1)(dispatch, getState, undefined);
      
      expect(result.type).toBe('supportTickets/getTicketDetails/rejected');
      expect(result.payload).toBe('Details error');
    });
  });

  describe('respondToTicket thunk', () => {
    const payload: TicketActionPayload = { id: 1, status: 2, adminNote: 'Hello' };

    it('sets actionLoading true on pending', () => {
      const state = supportTicketsReducer(initialState, { type: respondToTicket.pending.type });
      expect(state.actionLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('updates selectedTicket and list items on fulfilled', async () => {
      const updatedTicketData = { status: 2 };
      vi.mocked(supportTicketsApi.updateTicketAction).mockResolvedValueOnce({ value: updatedTicketData } as any);
      
      const dispatch = vi.fn();
      const getState = vi.fn();
      
      const result = await respondToTicket(payload)(dispatch, getState, undefined);
      
      expect(result.type).toBe('supportTickets/respondToTicket/fulfilled');
      
      const initialStateWithData = {
        ...initialState,
        selectedTicket: sampleTicket,
        data: samplePaginatedTickets,
      };

      const state = supportTicketsReducer(initialStateWithData, {
        type: respondToTicket.fulfilled.type,
        payload: { value: updatedTicketData },
        meta: { arg: payload },
      });
      
      expect(state.actionLoading).toBe(false);
      expect(state.selectedTicket?.status).toBe(2);
      expect(state.data?.items[0].status).toBe(2);
    });

    it('sets error on rejected', async () => {
      vi.mocked(supportTicketsApi.updateTicketAction).mockRejectedValueOnce({
        response: { data: { message: 'Action error' } },
      });
      
      const dispatch = vi.fn();
      const getState = vi.fn();
      
      const result = await respondToTicket(payload)(dispatch, getState, undefined);
      
      expect(result.type).toBe('supportTickets/respondToTicket/rejected');
      expect(result.payload).toBe('Action error');
    });
  });
});

