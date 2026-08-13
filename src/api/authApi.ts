import { axiosInstance } from './axiosInstance'; 

export const registerApi = async (payload: unknown) => {
  const response = await axiosInstance.post('/auth/register', payload);
  return response.data;
};

export const loginApi = async (payload: unknown) => {
  const response = await axiosInstance.post('/auth/login', payload);
  return response.data;
};

export const forgotPasswordApi = async (email: string) => {
  const response = await axiosInstance.post('/auth/forgot-password', { email });
  return response.data;
};

export interface ConfirmEmailPayload {
  userId: string;
  otp: string;
}

export const confirmEmailApi = async (payload: ConfirmEmailPayload) => {
  const response = await axiosInstance.post('/auth/confirm-email', payload);
  return response.data;
};

export interface ResendEmailPayload {
  userId: string;
}

export const resendEmailConfirmationApi = async (payload: ResendEmailPayload) => {
  const response = await axiosInstance.post('/auth/resend-email-confirmation', payload);
  return response.data;
};


export interface ChangeEmailPayload {
  currentPassword: string;
  newEmail: string;
}

// 1. طلب تغيير الإيميل وإرسال الـ OTP
export const changeEmailApi = async (payload: ChangeEmailPayload) => {
  const response = await axiosInstance.post('/auth/change-email', payload);
  return response.data;
};

export interface ConfirmEmailChangePayload {
  otp: string;
}

// 2. تأكيد الـ OTP للإيميل الجديد
export const confirmEmailChangeApi = async (payload: ConfirmEmailChangePayload) => {
  const response = await axiosInstance.post('/auth/confirm-email-change', payload);
  return response.data;
};

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
  confirmNewPassword: string;
}

// إعادة تعيين كلمة المرور باستخدام الـ OTP
export const resetPasswordApi = async (payload: ResetPasswordPayload) => {
  const response = await axiosInstance.post('/auth/reset-password', payload);
  return response.data;
};

// تجديد الـ Access Token باستخدام الـ Refresh Token المخزن في HttpOnly Cookie
export const refreshTokenApi = async () => {
  const response = await axiosInstance.post('/auth/refresh');
  return response.data;
};

// إلغاء الـ Refresh Token وتسجيل الخروج من السيرفر
export const logoutApi = async () => {
  try {
    const response = await axiosInstance.post('/auth/logout');
    return response.data;
  } catch (error) {
    return { isSuccess: true, error };
  }
};