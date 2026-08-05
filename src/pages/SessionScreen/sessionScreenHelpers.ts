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

export function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    const withResponse = err as { response?: { data?: { error?: { description?: string }; message?: string } } };
    const description = withResponse.response?.data?.error?.description;
    if (description) return description;
    const message = withResponse.response?.data?.message;
    if (message) return message;
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
