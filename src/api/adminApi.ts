import { axiosInstance } from './axiosInstance';

// ================= أطباء (Doctors) ================= //

export interface GetDoctorsParams {
  pageNumber?: number;
  pageSize?: number;
  isApproved?: boolean | null; // null لو عايزين نجيب الكل
  hasPendingDocuments?: boolean | null; // الفلترة حسب وجود مستندات جديدة قيد المراجعة
  name?: string;
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

export interface AdminDoctorDetails {
  id: number;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  gender: number;
  age: number;
  isApproved: boolean;
  yearsOfExperience: number;
  clinicName: string;
  professionalBio: string;
  practiceLicenseUrl: string | null;
  syndicateCardUrl: string | null;
  pendingPracticeLicenseUrl?: string | null;
  pendingSyndicateCardUrl?: string | null;
  hasPendingDocuments?: boolean;
  createdAt: string;
}

// 3.5. جلب تفاصيل طبيب محدد (بما فيها مستندات التحقق)
export const getDoctorDetailsByAdminApi = async (userId: string) => {
  const response = await axiosInstance.get(`/admin/doctors/${userId}`);
  return response.data;
};

// 3.6. قبول تعديلات المستندات الجديدة للطبيب
export const acceptPendingDoctorDocumentsApi = async (userId: string) => {
  const response = await axiosInstance.post(`/admin/doctors/${userId}/documents/accept`);
  return response.data;
};

// 3.7. رفض تعديلات المستندات الجديدة للطبيب
export const rejectPendingDoctorDocumentsApi = async (userId: string) => {
  const response = await axiosInstance.post(`/admin/doctors/${userId}/documents/reject`);
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

// 6. جلب إحصائيات لوحة التحكم العامة للأدمن
export const getAdminAnalyticsOverviewApi = async () => {
  const response = await axiosInstance.get('/admin/analytics/overview');
  return response.data;
};