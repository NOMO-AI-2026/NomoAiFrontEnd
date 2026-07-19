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
  speechLevel: {
    id: number;
    levelName: string;
  } | null;
}

export interface SpeechHistoryItem {
  id: number;
  childId: number;
  previousSpeechLevelId: number;
  previousSpeechLevelName: string;
  newSpeechLevelId: number;
  newSpeechLevelName: string;
  changedAt: string;
  changeReasons: string;
}

export interface PaginatedSpeechHistory {
  items: SpeechHistoryItem[];
  pageNumber: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
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