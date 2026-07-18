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
  error: {
    code: string;
    description: string;
    statusCode: number | null;
  };
}