import { axiosInstance } from './axiosInstance';
import { 
  type PaymentMethodsApiResponse, 
  type CreateQuickLinkPayload, 
  type QuickLinkApiResponse 
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
