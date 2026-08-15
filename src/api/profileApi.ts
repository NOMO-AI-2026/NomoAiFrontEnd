import axiosInstance from './axiosInstance'; 

export interface DoctorSpecificData {
  yearsOfExperience: number | null;
  clinicName: string | null;
  professionalBio: string | null;
  practiceLicenseUrl?: string | null;
  syndicateCardUrl?: string | null;
  pendingPracticeLicenseUrl?: string | null;
  pendingSyndicateCardUrl?: string | null;
  hasPendingDocuments?: boolean;
  availableMinutes: number | null;
}

export interface ProfileData {
  fullName: string;
  email?: string; 
  phoneNumber: string;
  gender: number;
  age: number;
  doctorSpecificData: DoctorSpecificData | null;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const fetchProfileApi = async () => {
  const response = await axiosInstance.get('/me/profile');
  return response.data.value; 
};

export const updateProfileApi = async (profileData: ProfileData) => {
  const response = await axiosInstance.put('/me/profile', profileData);
  return response.data; 
};

export const updateDoctorDocumentsApi = async (formData: FormData) => {
  const response = await axiosInstance.put('/profile/doctor-documents', formData);
  return response.data;
};

export const changePasswordApi = async (payload: ChangePasswordPayload) => {
  const response = await axiosInstance.post('/auth/change-password', payload);
  return response.data;
};

export const deleteAccountApi = async () => {
  const response = await axiosInstance.delete('/me/account');
  return response.data;
};