import axiosInstance from './axiosInstance';

// --- Types ---
export interface SupportTicket {
  id: number;
  subject: string;
  status: number; 
  createdAt: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  userRole: string;
  hasAdminNote: boolean;
}

export interface PaginatedTicketsResponse {
  items: SupportTicket[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface GetTicketsQueryParams {
  PageNumber?: number;
  PageSize?: number;
  Status?: string;
}

export interface TicketActionPayload {
  id: number;
  status?: number;
  adminNote?: string;
}

// --- API Calls ---
export const fetchSupportTickets = async (params: GetTicketsQueryParams) => {
  const response = await axiosInstance.get<PaginatedTicketsResponse>('/admin/support/tickets', { params });
  return response.data;
};

export const fetchTicketById = async (id: number) => {
  const response = await axiosInstance.get<SupportTicket>(`/admin/support/tickets/${id}`);
  return response.data;
};

export const updateTicketAction = async (payload: TicketActionPayload) => {
  const { id, ...body } = payload;
  const response = await axiosInstance.put(`/admin/support/tickets/${id}/action`, body);
  return response.data;
};

export const deleteTicket = async (id: number) => {
  const response = await axiosInstance.delete(`/admin/support/tickets/${id}`);
  return response.data;
};