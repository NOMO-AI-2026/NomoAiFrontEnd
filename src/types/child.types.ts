export interface Child {
  id: number;
  fullName: string;
  gender: number;
  age: number;
}
export interface ChildProfileData {
  id: number;
  fullName: string;
  dateOfBirth: string;
  gender: number;
  therapyStartDate: string;
  age: number;
  parentFullName: string | null;
  parentEmail: string | null;
  parentPhoneNumber: string | null;
}
export interface ApiResponse {
  value: Child[]; 
  isSuccess: boolean;
  isFailure: boolean;
  error: {
    code: string;
    description: string;
    statusCode: number | null;
  };
}