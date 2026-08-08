import { axiosInstance } from './axiosInstance';
import { type GetChildrenQueryParams } from './doctorApi';

// 1. جلب قائمة أطفال ولي الأمر الحالي مع Pagination والبحث
export const getParentChildrenApi = async (params?: GetChildrenQueryParams) => {
  const response = await axiosInstance.get('/parent/children', { params });
  return response.data;
};

// 2. جلب إحصائيات لوحة التحكم لولي الأمر
export const getParentDashboardApi = async () => {
  const response = await axiosInstance.get('/parent/dashboard');
  return response.data;
};
