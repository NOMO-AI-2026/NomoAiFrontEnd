import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  Coffee,
  PartyPopper,
  RefreshCw,
  TriangleAlert,
  Volume2,
} from 'lucide-react';
import styles from './SessionScreen.module.css';
import {
  continueSessionStepApi,
  fetchFeedbackSpeechBlobApi,
  fetchSessionSpeechBlobApi,
  getSessionRuntimeApi,
  submitSessionAttemptApi,
  type SessionRuntimeResponse,
} from '../../api/sessionsApi';
import {
  getAvatarSrc,
  getErrorMessage,
  getMaxRecordingMs,
  getStepTypeLabel,
  isAutoplayBlockedError,
  playMicOpenChime,
  playTherapistAckTone,
  type SessionUiState,
} from './sessionScreenHelpers';
import { getSilenceDurationMs, startEnergyVad, type VadController } from './sessionVad';

/** Test-only hook so Vitest can auto-finish a turn without a manual send button. */
export const TEST_FINISH_RECORDING_EVENT = 'nomo-test-finish-recording';

function blobFromBase64(base64: string, contentType?: string | null): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: contentType || 'audio/wav' });
}

const SessionScreen = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const bootRuntimeRef = useRef<SessionRuntimeResponse | null>(
    (location.state as { runtime?: SessionRuntimeResponse } | null)?.runtime ?? null,
  );

  const [uiState, setUiState] = useState<SessionUiState>('loading_plan');
  const [runtime, setRuntime] = useState<SessionRuntimeResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [heardSpeech, setHeardSpeech] = useState(false);

  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const pendingAudioEndedRef = useRef<(() => void) | null>(null);
  const audioUnlockedRef = useRef(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const vadRef = useRef<VadController | null>(null);
  const isFinishingRecordingRef = useRef(false);
  const autoListenStartedForStepRef = useRef<string | null>(null);
  // Holds the latest `finishRecording` closure so the auto-stop timeout
  // (scheduled inside `startRecording`) always calls the freshest version.
  const finishRecordingRef = useRef<(() => Promise<void>) | null>(null);
  // Holds the latest `applyRuntime` closure so it can recurse into itself
  // (e.g. after `continueSessionStepApi`) without a direct self-reference,
  // which the compiler can't safely memoize.
  const applyRuntimeRef = useRef<((next: SessionRuntimeResponse) => Promise<void>) | null>(null);
  const startRecordingRef = useRef<(() => Promise<void>) | null>(null);

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    pendingAudioEndedRef.current = null;
  }, []);

  const cleanupRecorder = useCallback(() => {
    if (recordTimeoutRef.current) {
      clearTimeout(recordTimeoutRef.current);
      recordTimeoutRef.current = null;
    }
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current);
      recordIntervalRef.current = null;
    }
    vadRef.current?.stop();
    vadRef.current = null;
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      try {
        recorder.stop();
      } catch {
        // recorder already stopped/invalid — safe to ignore during cleanup
      }
    }
    mediaRecorderRef.current = null;
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    chunksRef.current = [];
    isFinishingRecordingRef.current = false;
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    abortControllerRef.current = new AbortController();
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
      cleanupAudio();
      cleanupRecorder();
    };
  }, [cleanupAudio, cleanupRecorder]);

  const handleError = useCallback((err: unknown) => {
    if (!isMountedRef.current) return;
    console.error('Session runner error:', err);
    cleanupRecorder();
    setErrorMessage(getErrorMessage(err));
    setUiState('error');
  }, [cleanupRecorder]);

  const playBlob = useCallback(
    (blob: Blob, onEnded: () => void, mode: 'speaking' | 'playing_feedback' = 'speaking') => {
      cleanupAudio();
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      pendingAudioEndedRef.current = onEnded;
      audio.onended = () => {
        pendingAudioEndedRef.current = null;
        onEnded();
      };
      audio.onerror = () => {
        handleError(new Error('فشل تشغيل الصوت.'));
      };

      const markSpeakingUi = () => {
        if (!isMountedRef.current) return;
        setUiState(mode);
      };

      const playResult = audio.play();
      if (playResult && typeof playResult.then === 'function') {
        playResult
          .then(() => {
            audioUnlockedRef.current = true;
            markSpeakingUi();
          })
          .catch((err) => {
            if (isAutoplayBlockedError(err)) {
              // Browser autoplay policy — wait for an explicit tap.
              if (isMountedRef.current) setUiState('awaiting_play');
              return;
            }
            handleError(err);
          });
      } else {
        markSpeakingUi();
      }
    },
    [cleanupAudio, handleError],
  );

  const handleResumePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const playResult = audio.play();
    if (playResult && typeof playResult.then === 'function') {
      playResult
        .then(() => {
          audioUnlockedRef.current = true;
          if (!isMountedRef.current) return;
          // Prefer feedback UI if last runtime command was play_feedback.
          setUiState((prev) => (prev === 'awaiting_play' ? 'speaking' : prev));
          if (runtime?.command === 'play_feedback') {
            setUiState('playing_feedback');
          } else {
            setUiState('speaking');
          }
        })
        .catch((err) => handleError(err));
    }
  }, [handleError, runtime?.command]);

  // Central dispatcher: applies a freshly received runtime snapshot to the UI,
  // and (when the server asks for it) plays avatar / feedback speech, chaining
  // into `continueSessionStepApi` once audio finishes for non-listening steps.
  const applyRuntime = useCallback(
    async (next: SessionRuntimeResponse) => {
      if (!isMountedRef.current) return;
      setRuntime(next);
      setErrorMessage(null);

      if (next.status === 'completed' || next.command === 'session_completed') {
        // Still allow a final feedback clip to play before showing the completion screen.
        if (next.command !== 'play_feedback') {
          cleanupAudio();
          setUiState('completed');
          return;
        }
      }

      const sid = next.sessionId ?? sessionId;

      const onAudioFinished = async () => {
        if (!isMountedRef.current) return;
        if (next.status === 'completed') {
          setUiState('completed');
          return;
        }
        const step = next.currentStep;
        const canRecordMore =
          !!step?.expectsChildResponse &&
          (step.attemptNumber ?? 0) < (step.maximumAttempts ?? 1);
        if (canRecordMore) {
          setUiState('ready_to_record');
          return;
        }
        if (next.command === 'take_break') {
          setUiState('take_break');
          return;
        }
        try {
          const fresh = await continueSessionStepApi(sid, {
            signal: abortControllerRef.current?.signal,
          });
          await applyRuntimeRef.current?.(fresh);
        } catch (err) {
          // If continue is rejected because the step still expects speech, surface a calm end.
          handleError(err);
        }
      };

      switch (next.command) {
        case 'play_avatar_speech': {
          setUiState('speaking');
          try {
            let blob: Blob;
            if (next.speechAudioBase64) {
              blob = blobFromBase64(next.speechAudioBase64, next.speechAudioContentType);
            } else {
              blob = await fetchSessionSpeechBlobApi(sid, {
                signal: abortControllerRef.current?.signal,
              });
            }
            if (!isMountedRef.current) return;
            playBlob(blob, () => {
              void onAudioFinished();
            }, 'speaking');
          } catch (err) {
            handleError(err);
          }
          break;
        }
        case 'play_feedback': {
          // Show spoken feedback text immediately while audio starts (no extra round-trip when embedded).
          setUiState('playing_feedback');
          try {
            const attemptId = next.feedback?.attemptId;
            if (attemptId == null) {
              throw new Error('لا توجد نتيجة تقييم متاحة لهذه المحاولة.');
            }

            let blob: Blob | null = null;
            if (next.feedback?.audioBase64) {
              blob = blobFromBase64(
                next.feedback.audioBase64,
                next.feedback.audioContentType,
              );
            } else {
              blob = await fetchFeedbackSpeechBlobApi(sid, attemptId, {
                signal: abortControllerRef.current?.signal,
              });
            }

            if (!isMountedRef.current) return;
            playBlob(blob, () => {
              void onAudioFinished();
            }, 'playing_feedback');
          } catch (err) {
            handleError(err);
          }
          break;
        }
        case 'ready_to_record':
          setUiState('ready_to_record');
          break;
        case 'take_break':
          setUiState('take_break');
          break;
        default:
          setUiState('idle');
      }
    },
    [cleanupAudio, handleError, playBlob, sessionId],
  );

  useEffect(() => {
    applyRuntimeRef.current = applyRuntime;
  }, [applyRuntime]);

  useEffect(() => {
    if (!sessionId) return;

    // uiState already defaults to 'loading_plan' on first mount; this effect
    // only re-runs if the route's sessionId itself changes.
    let isActive = true;

    (async () => {
      try {
        const sid = Number(sessionId);
        const boot = bootRuntimeRef.current;
        // Prefer the StartSession payload — avoids a redundant GET /runtime round-trip.
        const data =
          boot && boot.sessionId === sid
            ? boot
            : await getSessionRuntimeApi(sid, {
                signal: abortControllerRef.current?.signal,
              });
        bootRuntimeRef.current = null;
        if (!isActive || !isMountedRef.current) return;
        await applyRuntime(data);
      } catch (err) {
        if (isActive) handleError(err);
      }
    })();

    return () => {
      isActive = false;
    };
    // Only re-run when navigating to a different session; applyRuntime/handleError are stable enough for this flow.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const startRecording = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      handleError(new Error('التسجيل الصوتي غير مدعوم على هذا المتصفح.'));
      return;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      if (!isMountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      mediaStreamRef.current = stream;
      chunksRef.current = [];
      isFinishingRecordingRef.current = false;
      setHeardSpeech(false);

      const preferredTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
      ];
      const mimeType = preferredTypes.find((type) => {
        try {
          return typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported?.(type);
        } catch {
          return false;
        }
      });

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // timeslice keeps chunks flowing so a crash mid-turn still has partial audio
      recorder.start(250);
      setUiState('recording');
      setRecordingSeconds(0);
      playMicOpenChime();

      recordIntervalRef.current = setInterval(() => {
        setRecordingSeconds((seconds) => seconds + 1);
      }, 1000);

      const maxMs = getMaxRecordingMs(runtime?.activityType);
      recordTimeoutRef.current = setTimeout(() => {
        void finishRecordingRef.current?.();
      }, maxMs);

      vadRef.current?.stop();
      vadRef.current = startEnergyVad(stream, {
        silenceDurationMs: getSilenceDurationMs(runtime?.activityType),
        onSpeechStart: () => {
          if (isMountedRef.current) setHeardSpeech(true);
        },
        onSilenceEnd: () => {
          void finishRecordingRef.current?.();
        },
      });
    } catch (err) {
      handleError(err);
    }
  }, [handleError, runtime]);

  useEffect(() => {
    startRecordingRef.current = startRecording;
  }, [startRecording]);

  // ChatGPT-like turn: after avatar finishes, open the mic automatically.
  // Brief beat so the child sees the listening cue + hears the attention chime.
  useEffect(() => {
    if (uiState !== 'ready_to_record' || !runtime?.currentStep) return;

    const stepKey = `${runtime.sessionId}-${runtime.currentStep.stepNumber}-${runtime.currentStep.attemptNumber}`;
    if (autoListenStartedForStepRef.current === stepKey) return;
    autoListenStartedForStepRef.current = stepKey;

    const timer = setTimeout(() => {
      void startRecordingRef.current?.();
    }, 450);

    return () => clearTimeout(timer);
  }, [uiState, runtime]);

  const finishRecording = useCallback(async () => {
    if (isFinishingRecordingRef.current) return;
    isFinishingRecordingRef.current = true;

    if (recordTimeoutRef.current) {
      clearTimeout(recordTimeoutRef.current);
      recordTimeoutRef.current = null;
    }
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current);
      recordIntervalRef.current = null;
    }
    vadRef.current?.stop();
    vadRef.current = null;

    const recorder = mediaRecorderRef.current;
    const stream = mediaStreamRef.current;

    if (!recorder || recorder.state === 'inactive') {
      isFinishingRecordingRef.current = false;
      return;
    }

    // Instant therapist presence — don't leave a silent gap while the API works.
    playTherapistAckTone();
    setUiState('evaluating');
    setHeardSpeech(false);

    const mimeType = recorder.mimeType || 'audio/webm';
    const blob: Blob = await new Promise((resolve) => {
      recorder.onstop = () => {
        resolve(new Blob(chunksRef.current, { type: mimeType }));
      };
      recorder.stop();
    });

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    mediaRecorderRef.current = null;
    mediaStreamRef.current = null;
    chunksRef.current = [];

    if (!isMountedRef.current) return;

    if (!blob.size) {
      isFinishingRecordingRef.current = false;
      handleError(new Error('لم يتم التقاط صوت. حاول التحدث بصوت أوضح.'));
      return;
    }

    try {
      const sid = sessionId as string;
      const extension = mimeType.includes('mp4') ? 'm4a' : 'webm';
      const response = await submitSessionAttemptApi(
        sid,
        blob,
        `attempt-${Date.now()}.${extension}`,
        {
          signal: abortControllerRef.current?.signal,
        },
      );
      isFinishingRecordingRef.current = false;
      if (!isMountedRef.current) return;
      await applyRuntime(response);
    } catch (err) {
      isFinishingRecordingRef.current = false;
      // Recover from exhausted-attempt conflicts by refreshing runtime instead of dying.
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409 && sessionId) {
        try {
          const fresh = await getSessionRuntimeApi(sessionId, {
            signal: abortControllerRef.current?.signal,
          });
          await applyRuntime(fresh);
          return;
        } catch {
          // fall through to handleError
        }
      }
      handleError(err);
    }
  }, [applyRuntime, handleError, sessionId]);

  useEffect(() => {
    finishRecordingRef.current = finishRecording;
  }, [finishRecording]);

  // Vitest helper: simulate end-of-utterance auto-send without a manual button.
  useEffect(() => {
    if (!import.meta.env.MODE || import.meta.env.MODE !== 'test') return;
    const onTestFinish = () => {
      void finishRecordingRef.current?.();
    };
    window.addEventListener(TEST_FINISH_RECORDING_EVENT, onTestFinish);
    return () => window.removeEventListener(TEST_FINISH_RECORDING_EVENT, onTestFinish);
  }, []);

  const handleContinueAfterBreak = useCallback(async () => {
    if (!sessionId) return;
    try {
      const fresh = await continueSessionStepApi(sessionId, {
        signal: abortControllerRef.current?.signal,
      });
      await applyRuntime(fresh);
    } catch (err) {
      handleError(err);
    }
  }, [applyRuntime, handleError, sessionId]);

  const handleRetryLoad = useCallback(async () => {
    if (!sessionId) return;
    autoListenStartedForStepRef.current = null;
    setUiState('loading_plan');
    try {
      const data = await getSessionRuntimeApi(sessionId, {
        signal: abortControllerRef.current?.signal,
      });
      await applyRuntime(data);
    } catch (err) {
      handleError(err);
    }
  }, [applyRuntime, handleError, sessionId]);

  const avatarSrc = getAvatarSrc(uiState, runtime?.feedback);
  const step = runtime?.currentStep;
  const feedback = runtime?.feedback;

  if (!sessionId) {
    return (
      <div className={styles.screen} dir="rtl">
        <main className={styles.stage}>
          <div className={styles.contentPanel}>
            <div className={styles.statusBlock}>
              <TriangleAlert size={28} className={styles.iconDanger} />
              <p className={styles.errorText}>معرّف الجلسة غير صالح.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.screen} dir="rtl">
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} type="button">
          <ArrowRight size={22} />
          رجوع
        </button>
        {step && uiState !== 'loading_plan' && uiState !== 'completed' && (
          <div className={styles.stepBadge}>
            خطوة {step.stepNumber} · {getStepTypeLabel(step.stepType)}
          </div>
        )}
      </header>

      <main className={styles.stage}>
        <div className={`${styles.avatarWrapper} ${styles[`avatar_${uiState}`] ?? ''}`}>
          <img src={avatarSrc} alt="أفاتار المساعد" className={styles.avatarImage} />
          {(uiState === 'speaking' ||
            uiState === 'playing_feedback' ||
            uiState === 'ready_to_record' ||
            uiState === 'recording') && (
            <span className={styles.speakingPulse} aria-hidden="true" />
          )}
        </div>

        <div className={styles.contentPanel}>
          {uiState === 'loading_plan' && (
            <div className={styles.statusBlock}>
              <div className={styles.spinner} aria-hidden="true" />
              <p className={styles.statusText}>جاري تحضير الجلسة...</p>
            </div>
          )}

          {uiState === 'idle' && (
            <div className={styles.statusBlock}>
              <p className={styles.statusText}>الجلسة جاهزة.</p>
            </div>
          )}

          {(uiState === 'speaking' || (uiState === 'awaiting_play' && runtime?.command !== 'play_feedback')) && (
            <div className={styles.statusBlock}>
              <Volume2 size={28} className={styles.iconAccent} />
              <p className={styles.statusText}>{step?.spokenText || 'المساعد يتكلم...'}</p>
              {uiState === 'awaiting_play' && (
                <button className={styles.primaryBtn} onClick={handleResumePlayback} type="button">
                  <Volume2 size={20} />
                  اضغط لسماع المساعد
                </button>
              )}
            </div>
          )}

          {(uiState === 'playing_feedback' ||
            (uiState === 'awaiting_play' && runtime?.command === 'play_feedback')) && (
            <div className={styles.statusBlock}>
              <p className={styles.statusText}>{feedback?.spokenText || 'المساعد جاهز للرد'}</p>
              {feedback?.scores && uiState === 'playing_feedback' && (
                <p className={styles.attemptInfo}>
                  الدقة: {Math.round(feedback.scores.overall * 100)}%
                </p>
              )}
              {uiState === 'awaiting_play' && (
                <button className={styles.primaryBtn} onClick={handleResumePlayback} type="button">
                  <Volume2 size={20} />
                  اضغط لسماع الرد
                </button>
              )}
            </div>
          )}

          {(uiState === 'ready_to_record' || uiState === 'recording') && (
            <div className={styles.statusBlock}>
              <p className={styles.promptText}>{step?.spokenText}</p>
              {step && (
                <p className={styles.attemptInfo}>
                  المحاولة{' '}
                  {Math.min((step.attemptNumber ?? 0) + 1, Math.max(1, step.maximumAttempts ?? 1))} من{' '}
                  {Math.max(1, step.maximumAttempts ?? 1)}
                </p>
              )}

              {uiState === 'ready_to_record' && (
                <div className={styles.statusBlock}>
                  <div className={styles.spinner} aria-hidden="true" />
                  <p className={styles.statusText}>جاري فتح الميكروفون...</p>
                </div>
              )}

              {uiState === 'recording' && (
                <>
                  <div className={styles.recordingIndicator}>
                    <span className={styles.recordingDot} aria-hidden="true" />
                    {heardSpeech
                      ? `أسمعك... لما تخلّص هرد عليك (${recordingSeconds}s)`
                      : `دورَك الآن — تكلّم بهدوء (${recordingSeconds}s)`}
                  </div>
                  <p className={styles.softHint}>هسمعك تلقائيًا لما تسكت شوية — زي جلسة التخاطب الحقيقية.</p>
                </>
              )}
            </div>
          )}

          {(uiState === 'uploading' || uiState === 'evaluating') && (
            <div className={styles.statusBlock}>
              <div className={styles.spinner} aria-hidden="true" />
              <p className={styles.statusText}>سمعْتك... لحظة بسيطة</p>
              <p className={styles.softHint}>بفكّر في رد هادئ زي دكتور التخاطب.</p>
            </div>
          )}

          {uiState === 'take_break' && (
            <div className={styles.statusBlock}>
              <Coffee size={28} className={styles.iconAccent} />
              <p className={styles.statusText}>وقت لأخذ استراحة قصيرة!</p>
              <button className={styles.primaryBtn} onClick={() => void handleContinueAfterBreak()} type="button">
                استمر
              </button>
            </div>
          )}

          {uiState === 'completed' && (
            <div className={styles.statusBlock}>
              <PartyPopper size={32} className={styles.iconAccent} />
              <p className={styles.statusText}>أحسنت! لقد أنهيت الجلسة بنجاح</p>
              <p className={styles.softHint}>يمكنك العودة من الزر أعلى الصفحة عندما تكون جاهزاً.</p>
            </div>
          )}

          {uiState === 'error' && (
            <div className={styles.statusBlock}>
              <TriangleAlert size={28} className={styles.iconDanger} />
              <p className={styles.errorText}>{errorMessage}</p>
              <button className={styles.primaryBtn} onClick={() => void handleRetryLoad()} type="button">
                <RefreshCw size={18} />
                إعادة المحاولة
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SessionScreen;
