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