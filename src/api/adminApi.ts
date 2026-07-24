import { axiosInstance } from './axiosInstance';

// ================= أطباء (Doctors) ================= //

export interface GetDoctorsParams {
  pageNumber?: number;
  pageSize?: number;
  isApproved?: boolean | null; // null لو عايزين نجيب الكل
}

// 1. جلب قائمة الأطباء (مع الفلترة والـ Pagination)
export const getAdminDoctorsApi = async (params: GetDoctorsParams) => {
  const response = await axiosInstance.get('/admin/doctors', { params });
  return response.data;
};

// 2. قبول أو رفض طبيب
export const handleDoctorApprovalApi = async (payload: { userId: string; approveStatus: boolean }) => {
  const response = await axiosInstance.put('/admin/doctors/approval', payload); // أو PUT لو الباك إند عاملها كده
  return response.data;
};

// 3. حذف طبيب
export const deleteDoctorByAdminApi = async (payload: { userId: string }) => {
  // تذكري: في الـ DELETE بنبعت الـ body جوه object اسمه data
  const response = await axiosInstance.delete('/admin/doctors', { data: payload });
  return response.data;
};

// ================= أولياء الأمور (Parents) ================= //

export interface GetParentsParams {
  pageNumber?: number;
  pageSize?: number;
}

// 4. جلب قائمة أولياء الأمور
export const getAdminParentsApi = async (params: GetParentsParams) => {
  const response = await axiosInstance.get('/admin/parents', { params });
  return response.data;
};

// 5. حذف ولي أمر
export const deleteParentByAdminApi = async (payload: { userId: string }) => {
  const response = await axiosInstance.delete('/admin/parents', { data: payload });
  return response.data;
};