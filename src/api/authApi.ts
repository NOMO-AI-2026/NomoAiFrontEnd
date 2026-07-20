
import { axiosInstance } from './axiosInstance'; 

// دالة إنشاء حساب جديد
export const registerApi = async (payload: any) => {
  const response = await axiosInstance.post('/auth/register', payload);
  return response.data;
};

// دالة تسجيل الدخول
export const loginApi = async (payload: any) => {
  const response = await axiosInstance.post('/auth/login', payload);
  return response.data;
};