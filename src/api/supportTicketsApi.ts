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
  Name?: string;
}

export interface TicketActionPayload {
  id: number;
  status?: number;
  adminNote?: string;
}

export interface SupportTicketDetails {
  id: number;
  subject: string;
  message: string;
  status: number;
  adminNote: string | null;
  handledByAdminUserId: string | null;
  handledAt: string | null;
  createdAt: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  userRole: string;
}

// --- API Calls ---
export const fetchSupportTickets = async (params: GetTicketsQueryParams) => {
  const response = await axiosInstance.get<PaginatedTicketsResponse>('/admin/support/tickets', { params });
  return response.data;
};

export const fetchTicketById = async (id: number) => {
  const response = await axiosInstance.get<SupportTicketDetails>(`/admin/support/tickets/${id}`);
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
// ==========================================
// --- User (Doctor/Parent) API Calls ---
// ==========================================

export interface CreateUpdateTicketPayload {
  subject: string;
  message: string;
}

// 1. جلب كل تذاكر المستخدم الحالي (مع Pagination)
export const fetchMyTickets = async (params: { pageNumber?: number; pageSize?: number }) => {
  const response = await axiosInstance.get('/support/tickets/me', { params });
  return response.data;
};

// 2. جلب تفاصيل تذكرة معينة للمستخدم (عشان يشوف رد الأدمن)
export const fetchMyTicketById = async (id: number) => {
  const response = await axiosInstance.get(`/support/tickets/${id}`);
  return response.data;
};

// 3. إنشاء تذكرة جديدة
export const createMyTicket = async (payload: CreateUpdateTicketPayload) => {
  const response = await axiosInstance.post('/support/tickets', payload);
  return response.data;
};

// 4. تعديل التذكرة (فقط لو كانت Open)
export const updateMyTicket = async (id: number, payload: CreateUpdateTicketPayload) => {
  const response = await axiosInstance.put(`/support/tickets/${id}`, payload);
  return response.data;
};

// 5. حذف التذكرة (Soft Delete - فقط لو كانت Open)
export const deleteMyTicket = async (id: number) => {
  const response = await axiosInstance.delete(`/support/tickets/${id}`);
  return response.data;
};