import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'https://nomoai.runasp.net', 
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

export interface AddChildPayload {
  fullName: string;
  dateOfBirth: string;
  gender: number;
  therapyStartDate: string;
  age: number;
  speechLevelId: number;
}

export const getDoctorChildrenApi = async () => {
  const response = await axiosInstance.get<ApiResponse>('/api/Doctor/Children');
  return response.data;
};
export const addChildApi = async (childData: AddChildPayload) => {
  // رجعنا للمسار الصحيح المكتوب في السواجر
  const response = await axiosInstance.post('/api/children', childData);
  return response.data;
};