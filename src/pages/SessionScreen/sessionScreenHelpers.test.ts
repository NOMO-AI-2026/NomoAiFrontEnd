import { describe, expect, it } from 'vitest';
import { getAvatarSrc, getErrorMessage, getMaxRecordingMs } from './sessionScreenHelpers';

describe('getMaxRecordingMs', () => {
  it('returns 5s for character and word activities', () => {
    expect(getMaxRecordingMs('character')).toBe(5000);
    expect(getMaxRecordingMs('word')).toBe(5000);
  });

  it('returns 15s for sentence activities', () => {
    expect(getMaxRecordingMs('sentence')).toBe(15000);
  });

  it('returns 30s for conversation activities', () => {
    expect(getMaxRecordingMs('conversation')).toBe(30000);
  });

  it('falls back to the word duration for unknown/missing activity types', () => {
    expect(getMaxRecordingMs(undefined)).toBe(5000);
    expect(getMaxRecordingMs('unknown-type')).toBe(5000);
  });
});

describe('getAvatarSrc', () => {
  it('maps speaking/ready/recording/thinking states to their dedicated avatars', () => {
    expect(getAvatarSrc('speaking')).toContain('speaking');
    expect(getAvatarSrc('ready_to_record')).toContain('listening');
    expect(getAvatarSrc('recording')).toContain('listening');
    expect(getAvatarSrc('uploading')).toContain('thinking');
    expect(getAvatarSrc('evaluating')).toContain('thinking');
    expect(getAvatarSrc('completed')).toContain('happy');
  });

  it('falls back to idle for idle/error/take_break/loading_plan', () => {
    expect(getAvatarSrc('idle')).toContain('idle');
    expect(getAvatarSrc('error')).toContain('idle');
    expect(getAvatarSrc('take_break')).toContain('idle');
    expect(getAvatarSrc('loading_plan')).toContain('idle');
  });

  it('shows a happy avatar for successful advance feedback', () => {
    const src = getAvatarSrc('playing_feedback', {
      attemptId: 1,
      adaptiveAction: 'advance',
      spokenText: 'أحسنت',
    });
    expect(src).toContain('happy');
  });

  it('shows an encouraging avatar for retry/simplify feedback', () => {
    expect(
      getAvatarSrc('playing_feedback', {
        attemptId: 1,
        adaptiveAction: 'retry_same',
        spokenText: 'حاول مرة أخرى',
      }),
    ).toContain('encouraging');

    expect(
      getAvatarSrc('playing_feedback', {
        attemptId: 1,
        adaptiveAction: 'simplify',
        spokenText: 'هيا نبسطها',
      }),
    ).toContain('encouraging');
  });
});

describe('getErrorMessage', () => {
  it('extracts a backend error description when present', () => {
    const err = { response: { data: { error: { description: 'رصيدك غير كافٍ' } } } };
    expect(getErrorMessage(err)).toBe('رصيدك غير كافٍ');
  });

  it('falls back to a generic Arabic message for unknown errors', () => {
    expect(getErrorMessage('boom')).toBe('حدث خطأ غير متوقع. حاول مرة أخرى.');
  });

  it('uses the Error message when available', () => {
    expect(getErrorMessage(new Error('شبكة غير متاحة'))).toBe('شبكة غير متاحة');
  });
});
