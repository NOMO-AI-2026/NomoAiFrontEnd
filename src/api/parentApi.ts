import { axiosInstance } from './axiosInstance';
import { type Child } from './doctorApi';

// 1. جلب قائمة أطفال ولي الأمر الحالي
export const getParentChildrenApi = async (): Promise<Child[]> => {
  const response = await axiosInstance.get<Child[]>('/parent/children');
  return response.data;
};
