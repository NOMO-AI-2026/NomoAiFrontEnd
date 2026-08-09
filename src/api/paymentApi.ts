import { axiosInstance } from './axiosInstance';
import { 
  type PaymentMethodsApiResponse, 
  type CreateQuickLinkPayload, 
  type QuickLinkApiResponse,
  type PaymentsQueryParams
} from '../types/payment.types';

// 1. جلب طرق الدفع المتاحة من الباك إند
export const getPaymentMethodsApi = async (): Promise<PaymentMethodsApiResponse> => {
  const response = await axiosInstance.get<PaymentMethodsApiResponse>('/payment-methods');
  return response.data;
};

// 2. إنشاء رابط الدفع السريع عبر PayMob
export const createQuickLinkApi = async (payload: CreateQuickLinkPayload): Promise<QuickLinkApiResponse> => {
  const response = await axiosInstance.post<QuickLinkApiResponse>('/payments/quick-link', payload);
  return response.data;
};

// 3. جلب مدفوعات الأدمن
export const getAdminPaymentsApi = async (params?: PaymentsQueryParams) => {
  const response = await axiosInstance.get('/payments', { params });
  return response.data;
};

// 4. جلب عمليات الطبيب
export const getDoctorTransactionsApi = async (params?: PaymentsQueryParams) => {
  const response = await axiosInstance.get('/payments/my-transactions', { params });
  return response.data;
};
