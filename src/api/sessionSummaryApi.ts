import { axiosInstance } from './axiosInstance';

export interface SessionSummaryMetrics {
  totalAttempts: number;
  successfulAttempts: number;
  noSpeechAttempts: number;
  interventionCount: number;
  averageScore: number;
  bestScore: number;
  improvementPercentage: number;
  firstOverallScore?: number | null;
  finalOverallScore?: number | null;
  scoreTrend?: string | null;
  finalAdaptiveAction?: string | null;
  durationSeconds?: number | null;
}

/** Shared generate response (role-agnostic projection from POST). */
export interface SessionSummaryDto {
  sessionId: number;
  childId: number;
  childName: string;
  sessionTitle: string;
  activityType?: string | null;
  prompt?: string | null;
  speechLevel?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  outcome: string;
  outcomeLabel?: string;
  shortSummary: string;
  strengths: string[];
  practiceAreas: string[];
  nextSessionSuggestion: string;
  doctorReviewNote?: string | null;
  doctorReviewRecommended: boolean;
  requiresDoctorReview: boolean;
  isDoctorReviewed: boolean;
  totalAttempts: number;
  successfulAttempts: number;
  noSpeechAttempts: number;
  interventionCount: number;
  averageScore: number;
  bestScore: number;
  improvementPercentage: number;
  firstOverallScore?: number | null;
  finalOverallScore?: number | null;
  scoreTrend?: string | null;
  finalAdaptiveAction?: string | null;
  durationSeconds?: number | null;
  summaryGenerationMode?: string | null;
  modelName?: string | null;
  usedFallback: boolean;
  generatedAt?: string | null;
}

export interface DoctorSessionSummaryResponse {
  sessionId: number;
  childId: number;
  childName: string;
  sessionTitle: string;
  activityType?: string | null;
  prompt?: string | null;
  speechLevel?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  outcome: string;
  outcomeLabel: string;
  shortSummary: string;
  strengths: string[];
  practiceAreas: string[];
  nextSessionSuggestion: string;
  doctorReviewNote?: string | null;
  doctorReviewRecommended: boolean;
  requiresDoctorReview: boolean;
  isDoctorReviewed: boolean;
  metrics: SessionSummaryMetrics;
  summaryGenerationMode?: string | null;
  modelName?: string | null;
  usedFallback: boolean;
  generatedAt?: string | null;
}

export interface ParentSessionSummaryResponse {
  sessionId: number;
  childId: number;
  childName: string;
  sessionTitle: string;
  activityLabel?: string | null;
  endedAt?: string | null;
  friendlyOutcome: string;
  shortSummary: string;
  strengths: string[];
  practiceTip: string;
  nextSessionSuggestion: string;
  suggestDoctorFollowUp: boolean;
  followUpMessage?: string | null;
  totalAttempts: number;
  successfulAttempts: number;
  generatedAt?: string | null;
}

export interface ApiCallOptions {
  signal?: AbortSignal;
}

/** POST /sessions/{id}/summary — generate (or return existing) from persisted attempts. */
export async function generateSessionSummaryApi(
  sessionId: number | string,
  options?: ApiCallOptions & { force?: boolean },
): Promise<SessionSummaryDto> {
  const response = await axiosInstance.post<SessionSummaryDto>(
    `/sessions/${sessionId}/summary`,
    null,
    {
      signal: options?.signal,
      params: options?.force ? { force: true } : undefined,
    },
  );
  return response.data;
}

export async function getDoctorSessionSummaryApi(
  sessionId: number | string,
  options?: ApiCallOptions,
): Promise<DoctorSessionSummaryResponse> {
  const response = await axiosInstance.get<DoctorSessionSummaryResponse>(
    `/doctor/sessions/${sessionId}/summary`,
    { signal: options?.signal },
  );
  return response.data;
}

export async function getParentSessionSummaryApi(
  sessionId: number | string,
  options?: ApiCallOptions,
): Promise<ParentSessionSummaryResponse> {
  const response = await axiosInstance.get<ParentSessionSummaryResponse>(
    `/parent/sessions/${sessionId}/summary`,
    { signal: options?.signal },
  );
  return response.data;
}

export interface ChildSessionHistoryItem {
  sessionId: number;
  childId: number;
  sessionTitle: string;
  prompt?: string | null;
  activityType?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  hasSummary: boolean;
  outcome?: string | null;
  outcomeLabel?: string | null;
  shortSummary?: string | null;
  totalAttempts?: number | null;
  successfulAttempts?: number | null;
  averageScore?: number | null;
  isDoctorReviewed?: boolean;
  doctorRating?: number;
  doctorComment?: string | null;
  repeatSession?: boolean;
}

export type ChildSessionHistoryResponse =
  | ChildSessionHistoryItem[]
  | { value: ChildSessionHistoryItem[]; isSuccess?: boolean };

/** GET /children/{childId}/sessions/history — completed sessions for reopen. */
export async function getChildSessionHistoryApi(
  childId: number | string,
  options?: ApiCallOptions,
): Promise<ChildSessionHistoryItem[]> {
  const response = await axiosInstance.get<ChildSessionHistoryResponse>(
    `/children/${childId}/sessions/history`,
    { signal: options?.signal },
  );
  const data = response.data;
  return Array.isArray(data) ? data : data?.value ?? [];
}

/** PUT /doctor/sessions/{sessionId}/review — submit a rating and comment. */
export async function submitSessionReviewApi(
  sessionId: number | string,
  data: { rating: number; comment: string; repeatSession: boolean },
  options?: ApiCallOptions,
): Promise<void> {
  await axiosInstance.put(
    `/doctor/sessions/${sessionId}/review`,
    data,
    { signal: options?.signal },
  );
}
