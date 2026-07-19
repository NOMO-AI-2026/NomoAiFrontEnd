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

export interface AddChildPayload {
  fullName: string;
  dateOfBirth: string;
  gender: number;
  therapyStartDate: string;
  age: number;
  speechLevelId: number;
}

export const getDoctorChildrenApi = async () => {
  const response = await axiosInstance.get<ApiResponse>('/Doctor/Children');
  return response.data;
};

export const addChildApi = async (childData: AddChildPayload) => {
  const response = await axiosInstance.post('/children', childData);
  return response.data;
};

export const searchParentByPhoneApi = async (searchTerm: string) => {
  const response = await axiosInstance.get('/parents/api/parents/search', {
    params: {
      SearchTerm: searchTerm
    }
  });
  return response; 
};

export const assignParentToChildApi = async (childId: number, parentId: string | number) => {
  const response = await axiosInstance.put(`/children/${childId}/parent`, { 
    parentId: Number(parentId) 
  });
  return response.data;
};

export const getSpeechLevelHistoryApi = async (childId: number, pageNumber = 1, pageSize = 10) => {
  const response = await axiosInstance.get(`/children/${childId}/speech-level-history`, {
    params: { PageNumber: pageNumber, PageSize: pageSize }
  });
  return response.data; 
};

export const updateSpeechLevelApi = async (childId: number, payload: unknown) => {
  const response = await axiosInstance.put(`/children/${childId}`, payload);
  return response.data;
};

export interface SpeechLevel {
  id: number;
  levelName: string;
}

export interface SpeechLevelsResponse {
  value: SpeechLevel[];
  isSuccess?: boolean;
  isFailure?: boolean;
}

export const getSpeechLevelsApi = async () => {
  const response = await axiosInstance.get<SpeechLevelsResponse>('/speech-levels');
  return response.data;
};

export const deleteChildApi = async (childId: number) => {
  const response = await axiosInstance.delete(`/children/${childId}`);
  return response.data;
};