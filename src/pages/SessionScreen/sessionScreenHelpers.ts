import type { SessionFeedback } from '../../api/sessionsApi';

import idleAvatar from '../../assets/avatar/idle.png';
import speakingAvatar from '../../assets/avatar/speaking.png';
import listeningAvatar from '../../assets/avatar/listening.png';
import thinkingAvatar from '../../assets/avatar/thinking.png';
import happyAvatar from '../../assets/avatar/happy.png';
import encouragingAvatar from '../../assets/avatar/encouraging.png';

export type SessionUiState =
  | 'loading_plan'
  | 'idle'
  | 'speaking'
  | 'awaiting_play'
  | 'ready_to_record'
  | 'recording'
  | 'uploading'
  | 'evaluating'
  | 'playing_feedback'
  | 'take_break'
  | 'completed'
  | 'error';

// Max recording duration (ms) driven by activity type, per product spec.
const MAX_RECORDING_MS: Record<string, number> = {
  character: 5000,
  word: 5000,
  sentence: 15000,
  conversation: 30000,
};

export function getMaxRecordingMs(activityType?: string | null): number {
  if (activityType && MAX_RECORDING_MS[activityType]) {
    return MAX_RECORDING_MS[activityType];
  }
  return MAX_RECORDING_MS.word;
}

/** Maps the internal UI state (+ latest feedback) to one of the six placeholder avatar images. */
export function getAvatarSrc(uiState: SessionUiState, feedback?: SessionFeedback | null): string {
  switch (uiState) {
    case 'speaking':
    case 'awaiting_play':
      return speakingAvatar;
    case 'playing_feedback': {
      const action = feedback?.adaptiveAction ?? '';
      if (action === 'advance') return happyAvatar;
      if (action.startsWith('retry') || action === 'simplify') return encouragingAvatar;
      return speakingAvatar;
    }
    case 'ready_to_record':
    case 'recording':
      return listeningAvatar;
    case 'uploading':
    case 'evaluating':
      return thinkingAvatar;
    case 'completed':
      return happyAvatar;
    case 'take_break':
    case 'idle':
    case 'error':
    case 'loading_plan':
    default:
      return idleAvatar;
  }
}

export function isAutoplayBlockedError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { name?: string; message?: string };
  if (e.name === 'NotAllowedError') return true;
  const message = (e.message || '').toLowerCase();
  return (
    message.includes("user didn't interact") ||
    message.includes('notallowederror') ||
    message.includes('play() failed because the user')
  );
}

export function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    const axiosLike = err as {
      response?: {
        status?: number;
        data?: {
          type?: string;
          detail?: string;
          title?: string;
          code?: string;
          description?: string;
          error?: { code?: string; description?: string };
          message?: string;
        };
      };
      message?: string;
    };
    const status = axiosLike.response?.status;
    const data = axiosLike.response?.data;
    const typeOrCode = data?.type ?? data?.code ?? data?.error?.code ?? '';

    if (
      status === 402 ||
      typeOrCode.includes('InsufficientCredit') ||
      typeOrCode.includes('tts_insufficient_credit')
    ) {
      return 'رصيد تحويل الصوت (TTS) نفد على OpenRouter. أضف رصيدًا من https://openrouter.ai/settings/credits ثم أعد المحاولة.';
    }

    if (status === 409 || typeOrCode.includes('MaximumAttemptsExceeded')) {
      return 'انتهت محاولات هذه الخطوة. سيتم الانتقال للخطوة التالية أو إنهاء الجلسة.';
    }

    if (data?.detail && typeof data.detail === 'string') return data.detail;
    if (data?.error?.description) return data.error.description;
    if (data?.description) return data.description;
    if (data?.message) return data.message;
    if (data?.title && typeof data.title === 'string' && data.title !== 'An error occurred') {
      return data.title;
    }
    if (typeof axiosLike.message === 'string' && axiosLike.message && !axiosLike.message.startsWith('Request failed')) {
      return axiosLike.message;
    }
  }
  if (err instanceof Error && err.message) return err.message;
  return 'حدث خطأ غير متوقع. حاول مرة أخرى.';
}

const STEP_TYPE_LABELS: Record<string, string> = {
  introduction: 'مقدمة',
  demonstration: 'عرض توضيحي',
  guided_practice: 'تمرين موجّه',
  independent_attempt: 'محاولة مستقلة',
  reinforcement: 'تدعيم',
  review: 'مراجعة',
  completion: 'ختام',
};

export function getStepTypeLabel(stepType?: string): string {
  if (!stepType) return '';
  return STEP_TYPE_LABELS[stepType] ?? stepType;
}
