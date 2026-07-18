import axios from 'axios';
import { type ChildProfileData } from '../types/child.types';
export const axiosInstance = axios.create({
  baseURL: 'https://nomoai.runasp.net/api',
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
export const getChildProfileApi = async (id: number) => {
  const response = await axiosInstance.get<ChildProfileData>(`/children/${id}`);
  return response.data;
};
export interface Child {
  id: number;
  fullName: string;
  gender: number;
  age: number;
}

export interface ApiResponse {
  value: Child[]; 
  isSuccess: boolean;
  isFailure: boolean;
  error: { code: string; description: string; statusCode: number | null; };
}

export const getDoctorChildrenApi = async () => {
  const response = await axiosInstance.get<ApiResponse>('/Doctor/Children');
  return response.data;
};