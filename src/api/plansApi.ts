import { axiosInstance } from './axiosInstance';
import { type PlansApiResponse } from '../types/plan.types';

export interface CreateUpdatePlanPayload {
  name: string;
  description: string;
  includedMinutes: number;
  price: number;
  currency: number;
}

// 1. جلب باقات الاشتراكات من backend المنصة
export const getPlansApi = async (): Promise<PlansApiResponse> => {
  const response = await axiosInstance.get<PlansApiResponse>('/plans');
  return response.data;
};

// 2. إنشاء باقة اشتراك جديدة
export const createPlanApi = async (payload: CreateUpdatePlanPayload) => {
  const response = await axiosInstance.post('/plans', payload);
  return response.data;
};

// 3. تعديل باقة اشتراك حالية
export const updatePlanApi = async (planId: number, payload: CreateUpdatePlanPayload) => {
  const response = await axiosInstance.put(`/plans/${planId}`, payload);
  return response.data;
};

// 4. حذف باقة اشتراك
export const deletePlanApi = async (planId: number) => {
  const response = await axiosInstance.delete(`/plans/${planId}`);
  return response.data;
};

// 4. جلب سعر الصرف المباشر والدقيق (USD to EGP) من API خارجية
export const getUsdToEgpRateApi = async (): Promise<number> => {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    if (data && data.rates && typeof data.rates.EGP === 'number') {
      return data.rates.EGP;
    }
    return 48.5;
  } catch (error) {
    console.warn('Could not fetch USD to EGP live rate, fallback rate used:', error);
    return 48.5;
  }
};
