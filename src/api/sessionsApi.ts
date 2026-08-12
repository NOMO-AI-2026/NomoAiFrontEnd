import { axiosInstance } from './axiosInstance';

export type SessionRuntimeStatus =
  | 'scheduled'
  | 'inProgress'
  | 'completed'
  | 'cancelled'
  | 'missed'
  | string;

export type SessionRuntimeCommand =
  | 'play_avatar_speech'
  | 'ready_to_record'
  | 'take_break'
  | 'session_completed'
  | 'play_feedback'
  | string;

export type AdaptiveAction =
  | 'advance'
  | 'retry_same'
  | 'retry_with_hint'
  | 'simplify'
  | 'ask_follow_up'
  | 'continue_conversation'
  | 'end'
  | 'end_attempts'
  | 'recommend_doctor_review'
  | 'take_short_break'
  | string;

export interface SessionRuntimeStep {
  stepNumber: number;
  stepType: string;
  spokenText: string;
  expectsChildResponse: boolean;
  maximumAttempts: number;
  attemptNumber: number;
  avatarEmotion?: string | null;
}

export interface SessionFeedbackScores {
  accuracy?: number | null;
  pronunciation?: number | null;
  fluency?: number | null;
  completeness?: number | null;
  relevance?: number | null;
  overall: number;
  matched: boolean;
}

export interface SessionFeedback {
  attemptId: number;
  adaptiveAction: AdaptiveAction;
  spokenText: string;
  emotion?: string | null;
  scores?: SessionFeedbackScores | null;
  /** Pre-synthesized feedback audio from submit — skip GET feedback-speech when set. */
  audioBase64?: string | null;
  audioContentType?: string | null;
}

export interface SessionRuntimeResponse {
  sessionId: number;
  status: SessionRuntimeStatus;
  currentStep?: SessionRuntimeStep | null;
  command: SessionRuntimeCommand;
  feedback?: SessionFeedback | null;
  activityType?: string | null;
  prompt?: string | null;
  /** Pre-synthesized instruction audio — skip GET .../speech when set. */
  speechAudioBase64?: string | null;
  speechAudioContentType?: string | null;
}

export interface StartSessionPayload {
  childId: number;
  activityId: number;
  durationMinutes?: number;
  maxSteps?: number;
  language?: string;
}

export interface ApiCallOptions {
  signal?: AbortSignal;
}

/** POST /sessions — starts a new therapy session runtime for a child + activity. */
export const startSessionApi = async (
  payload: StartSessionPayload,
  options?: ApiCallOptions,
): Promise<SessionRuntimeResponse> => {
  const response = await axiosInstance.post<SessionRuntimeResponse>('/sessions', payload, {
    signal: options?.signal,
  });
  return response.data;
};

/** GET /sessions/{sessionId}/runtime — fetches the current runtime state of a session. */
export const getSessionRuntimeApi = async (
  sessionId: number | string,
  options?: ApiCallOptions,
): Promise<SessionRuntimeResponse> => {
  const response = await axiosInstance.get<SessionRuntimeResponse>(
    `/sessions/${sessionId}/runtime`,
    { signal: options?.signal },
  );
  return response.data;
};

/** POST /sessions/{sessionId}/steps/continue — advances a non-listening step after avatar speech ends. */
export const continueSessionStepApi = async (
  sessionId: number | string,
  options?: ApiCallOptions,
): Promise<SessionRuntimeResponse> => {
  const response = await axiosInstance.post<SessionRuntimeResponse>(
    `/sessions/${sessionId}/steps/continue`,
    null,
    { signal: options?.signal },
  );
  return response.data;
};

/** GET /sessions/{sessionId}/speech — fetches the avatar's spoken-step audio as a Blob. */
export const fetchSessionSpeechBlobApi = async (
  sessionId: number | string,
  options?: ApiCallOptions,
): Promise<Blob> => {
  try {
    const response = await axiosInstance.get(`/sessions/${sessionId}/speech`, {
      responseType: 'blob',
      signal: options?.signal,
    });
    return response.data as Blob;
  } catch (err) {
    throw await rethrowBlobApiError(err);
  }
};

/** GET /sessions/{sessionId}/attempts/{attemptId}/feedback-speech — fetches feedback audio as a Blob. */
export const fetchFeedbackSpeechBlobApi = async (
  sessionId: number | string,
  attemptId: number | string,
  options?: ApiCallOptions,
): Promise<Blob> => {
  try {
    const response = await axiosInstance.get(
      `/sessions/${sessionId}/attempts/${attemptId}/feedback-speech`,
      { responseType: 'blob', signal: options?.signal },
    );
    return response.data as Blob;
  } catch (err) {
    throw await rethrowBlobApiError(err);
  }
};

export interface SessionAttemptEvaluation {
  accuracyScore: number;
  fluencyScore: number;
  pronunciationScore: number;
  completenessScore: number;
  overallScore: number;
  isSuccessful: boolean;
  speechOutcome?: string | null;
  adaptiveAction?: string | null;
  matched?: boolean | null;
  feedback?: string | null;
  avatarSpokenText?: string | null;
  avatarEmotion?: string | null;
  normalizedTranscript?: string | null;
}

export interface SessionAttemptTranscription {
  transcribedText: string;
  normalizedText?: string | null;
  detectedLanguage: string;
}

export interface SessionAttemptItem {
  attemptId: number;
  attemptNumber: number;
  audioUrl?: string | null;
  createdAt: string;
  evaluation?: SessionAttemptEvaluation | null;
  transcription?: SessionAttemptTranscription | null;
}

export interface SessionAttemptsResponse {
  sessionId: number;
  childId: number;
  totalAttempts: number;
  attempts: SessionAttemptItem[];
}

/** GET /sessions/{sessionId}/attempts — list persisted attempts for doctor/parent review. */
export const getSessionAttemptsApi = async (
  sessionId: number | string,
  options?: ApiCallOptions,
): Promise<SessionAttemptsResponse> => {
  const response = await axiosInstance.get<SessionAttemptsResponse>(
    `/sessions/${sessionId}/attempts`,
    { signal: options?.signal },
  );
  return response.data;
};

/** GET /sessions/{sessionId}/attempts/{attemptId}/audio — child attempt audio as Blob. */
export const fetchAttemptAudioBlobApi = async (
  sessionId: number | string,
  attemptId: number | string,
  options?: ApiCallOptions,
): Promise<Blob> => {
  try {
    const response = await axiosInstance.get(
      `/sessions/${sessionId}/attempts/${attemptId}/audio`,
      { responseType: 'blob', signal: options?.signal },
    );
    return response.data as Blob;
  } catch (err) {
    throw await rethrowBlobApiError(err);
  }
};

/** When responseType is blob, error bodies are Blobs — parse JSON ProblemDetails for UI. */
async function rethrowBlobApiError(err: unknown): Promise<never> {
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosErr = err as {
      response?: { data?: unknown; status?: number };
      message?: string;
    };
    const data = axiosErr.response?.data;
    if (typeof Blob !== 'undefined' && data instanceof Blob) {
      try {
        const text = await data.text();
        const parsed = JSON.parse(text) as {
          detail?: string;
          title?: string;
          type?: string;
          description?: string;
          code?: string;
        };
        const message =
          parsed.detail ||
          parsed.description ||
          parsed.title ||
          axiosErr.message ||
          `Request failed with status code ${axiosErr.response?.status ?? ''}`.trim();
        const enriched = Object.assign(new Error(message), {
          response: {
            status: axiosErr.response?.status,
            data: parsed,
          },
        });
        throw enriched;
      } catch (inner) {
        if (inner instanceof Error && 'response' in inner) throw inner;
      }
    }
  }
  throw err;
}

/** POST /sessions/{sessionId}/attempts — uploads the recorded child response (multipart field "audio"). */
export const submitSessionAttemptApi = async (
  sessionId: number | string,
  audioBlob: Blob,
  fileName = 'attempt.webm',
  options?: ApiCallOptions,
): Promise<SessionRuntimeResponse> => {
  const formData = new FormData();
  formData.append('audio', audioBlob, fileName);

  const response = await axiosInstance.post<SessionRuntimeResponse>(
    `/sessions/${sessionId}/attempts`,
    formData,
    { signal: options?.signal },
  );
  return response.data;
};
