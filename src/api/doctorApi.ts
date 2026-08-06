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
  speechLevelId?: number | null;
  speechLevelNumber?: number | null;
  speechLevelName?: string | null;
  speechLevel?: {
    id: number;
    levelName: string;
  } | null;
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
  const response = await axiosInstance.get('/parents/search', {
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

// ================= الأنشطة =================
export interface CreateActivityPayload {
  childId: number;
  activityTarget: number;
  content: string;
  estimatedDurationMinutes: number;
}

export interface UpdateActivityPayload {
  activityTarget: number;
  content: string;
  estimatedDurationMinutes: number;
}

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
  const response = await axiosInstance.get<ActivitiesResponse>(`/children/${childId}/activities`); 
  return response.data;
};

export const deleteActivityApi = async (activityId: number) => {
  const response = await axiosInstance.delete(`/activities/${activityId}`);
  return response.data;
};

// ================= الملاحظات =================
export interface DoctorNote {
  id: number;
  title: string;
  description: string;
  createdAt: string;
}

export interface PaginatedNotesResponse {
  items: DoctorNote[];
  pageNumber: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export type ChildNotesApiResponse = PaginatedNotesResponse | {
  value: PaginatedNotesResponse;
  isSuccess?: boolean;
  isFailure?: boolean;
};

export const getChildNotesApi = async (childId: number, pageNumber = 1, pageSize = 10) => {
  const response = await axiosInstance.get<ChildNotesApiResponse>(`/children/${childId}/notes`, {
    params: { pageNumber, pageSize }
  });
  return response.data;
};

export const deleteDoctorNoteApi = async (noteId: number) => {
  const response = await axiosInstance.delete(`/notes/${noteId}`);
  return response.data;
};

// 👇 الدوال الجديدة اللي ضفناها للإضافة والتعديل بناءً على الـ Swagger 👇

export interface CreateNotePayload {
  noteTitle: string;
  noteContent: string;
}

// دالة إضافة ملاحظة جديدة (POST)
export const addDoctorNoteApi = async (childId: number, payload: CreateNotePayload) => {
  const response = await axiosInstance.post(`/children/${childId}/notes`, payload);
  return response.data;
};

export interface UpdateNotePayload {
  title: string;
  description: string;
}

// دالة تعديل ملاحظة موجودة (PUT)
export const updateDoctorNoteApi = async (noteId: number, payload: UpdateNotePayload) => {
  const response = await axiosInstance.put(`/notes/${noteId}`, payload);
  return response.data;
};