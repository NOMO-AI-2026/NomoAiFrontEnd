import { axiosInstance } from './axiosInstance';
import { type ChildProfileData } from '../types/child.types';


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
export const updateChildApi = async (childId: number, data: Partial<AddChildPayload>) => {
  return await axiosInstance.put(`/children/${childId}`, data);
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



export const deleteChildApi = async (childId: number) => {
  const response = await axiosInstance.delete(`/children/${childId}`);
  return response.data;
};

export const getSpeechLevelsApi = async () => {
  const response = await axiosInstance.get('/speech-levels');
  return response.data; 
};

// تعريف البيانات المطلوبة لإضافة نشاط جديد (POST)
export interface CreateActivityPayload {
  childId: number;
  activityTarget: number;
  content: string;
  estimatedDurationMinutes: number;
}

// تعريف البيانات المطلوبة لتعديل نشاط (PUT)
export interface UpdateActivityPayload {
  activityTarget: number;
  content: string;
  estimatedDurationMinutes: number;
}

// واجهة لتمثيل النشاط نفسه عند تمريره للمودال للتعديل
export interface ActivityItem {
  id: number;
  activityTarget: number;
  content: string;
  estimatedDurationMinutes: number;
}

export const createActivityApi = async (payload: CreateActivityPayload) => {
  const response = await axiosInstance.post('/activities', payload);
  return response.data;
};

export const updateActivityApi = async (activityId: number, payload: UpdateActivityPayload) => {
  const response = await axiosInstance.put(`/activities/${activityId}`, payload);
  return response.data;
};

export type ActivitiesResponse = ActivityItem[] | {
  value: ActivityItem[];
  isSuccess?: boolean;
  isFailure?: boolean;
};

export const getChildActivitiesApi = async (childId: number) => {
  // شيلنا كلمة /api من هنا لأن الـ axiosInstance بيضيفها تلقائي
  const response = await axiosInstance.get<ActivitiesResponse>(`/children/${childId}/activities`); 
  return response.data;
};



export const deleteActivityApi = async (activityId: number) => {
  const response = await axiosInstance.delete(`/activities/${activityId}`);
  return response.data;
};