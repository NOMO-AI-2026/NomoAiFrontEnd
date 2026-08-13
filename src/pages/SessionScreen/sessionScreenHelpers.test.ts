import { describe, expect, it } from 'vitest';
import {
  getAvatarSrc,
  getErrorMessage,
  getMaxRecordingMs,
  isAutoplayBlockedError,
  toDisplayPercent,
} from './sessionScreenHelpers';

describe('getMaxRecordingMs', () => {
  it('gives children a generous absolute turn window', () => {
    expect(getMaxRecordingMs('character')).toBe(20000);
    expect(getMaxRecordingMs('word')).toBe(25000);
  });

  it('returns 40s for sentence activities', () => {
    expect(getMaxRecordingMs('sentence')).toBe(40000);
  });

  it('returns 60s for conversation activities', () => {
    expect(getMaxRecordingMs('conversation')).toBe(60000);
  });

  it('falls back to the word duration for unknown/missing activity types', () => {
    expect(getMaxRecordingMs(undefined)).toBe(25000);
    expect(getMaxRecordingMs('unknown-type')).toBe(25000);
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

describe('isAutoplayBlockedError', () => {
  it('detects NotAllowedError and Chrome autoplay messages', () => {
    expect(isAutoplayBlockedError({ name: 'NotAllowedError', message: 'denied' })).toBe(true);
    expect(
      isAutoplayBlockedError(
        new Error("play() failed because the user didn't interact with the document first"),
      ),
    ).toBe(true);
    expect(isAutoplayBlockedError(new Error('network down'))).toBe(false);
  });
});

describe('getErrorMessage', () => {
  it('extracts a backend error description when present', () => {
    const err = { response: { data: { error: { description: 'رصيدك غير كافٍ' } } } };
    expect(getErrorMessage(err)).toBe('رصيدك غير كافٍ');
  });

  it('maps 402 / InsufficientCredit to an Arabic credits message', () => {
    const err = {
      response: {
        status: 402,
        data: { type: 'AiService.InsufficientCredit', detail: 'credits' },
      },
    };
    expect(getErrorMessage(err)).toContain('OpenRouter');
  });

  it('reads ASP.NET ProblemDetails detail field', () => {
    const err = { response: { status: 503, data: { detail: 'الخدمة غير متاحة مؤقتًا' } } };
    expect(getErrorMessage(err)).toBe('الخدمة غير متاحة مؤقتًا');
  });

  it('falls back to a generic Arabic message for unknown errors', () => {
    expect(getErrorMessage('boom')).toBe('حدث خطأ غير متوقع. حاول مرة أخرى.');
  });

  it('uses the Error message when available', () => {
    expect(getErrorMessage(new Error('شبكة غير متاحة'))).toBe('شبكة غير متاحة');
  });
});

describe('toDisplayPercent', () => {
  it('keeps 0–100 scores as a percent without multiplying by 100', () => {
    expect(toDisplayPercent(12.25)).toBe(12);
    expect(toDisplayPercent(85.4)).toBe(85);
    expect(toDisplayPercent(100)).toBe(100);
  });

  it('converts 0–1 ratios to a percent', () => {
    expect(toDisplayPercent(0.85)).toBe(85);
    expect(toDisplayPercent(0)).toBe(0);
    expect(toDisplayPercent(1)).toBe(100);
  });

  it('clamps out-of-range values', () => {
    expect(toDisplayPercent(1225)).toBe(100);
    expect(toDisplayPercent(-10)).toBe(0);
  });

  it('returns null for missing or invalid scores', () => {
    expect(toDisplayPercent(null)).toBeNull();
    expect(toDisplayPercent(undefined)).toBeNull();
    expect(toDisplayPercent(Number.NaN)).toBeNull();
  });
});
