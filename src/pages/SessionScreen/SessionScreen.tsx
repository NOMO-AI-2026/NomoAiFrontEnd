import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  Coffee,
  Mic,
  PartyPopper,
  RefreshCw,
  Square,
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
  type SessionUiState,
} from './sessionScreenHelpers';

const SessionScreen = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [uiState, setUiState] = useState<SessionUiState>('loading_plan');
  const [runtime, setRuntime] = useState<SessionRuntimeResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isFinishingRecordingRef = useRef(false);
  // Holds the latest `finishRecording` closure so the auto-stop timeout
  // (scheduled inside `startRecording`) always calls the freshest version.
  const finishRecordingRef = useRef<(() => Promise<void>) | null>(null);
  // Holds the latest `applyRuntime` closure so it can recurse into itself
  // (e.g. after `continueSessionStepApi`) without a direct self-reference,
  // which the compiler can't safely memoize.
  const applyRuntimeRef = useRef<((next: SessionRuntimeResponse) => Promise<void>) | null>(null);

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
    setErrorMessage(getErrorMessage(err));
    setUiState('error');
  }, []);

  const playBlob = useCallback(
    (blob: Blob, onEnded: () => void) => {
      cleanupAudio();
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        onEnded();
      };
      audio.onerror = () => {
        handleError(new Error('فشل تشغيل الصوت.'));
      };
      const playResult = audio.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch((err) => handleError(err));
      }
    },
    [cleanupAudio, handleError],
  );

  // Central dispatcher: applies a freshly received runtime snapshot to the UI,
  // and (when the server asks for it) plays avatar / feedback speech, chaining
  // into `continueSessionStepApi` once audio finishes for non-listening steps.
  const applyRuntime = useCallback(
    async (next: SessionRuntimeResponse) => {
      if (!isMountedRef.current) return;
      setRuntime(next);
      setErrorMessage(null);

      if (next.status === 'completed' || next.command === 'session_completed') {
        cleanupAudio();
        setUiState('completed');
        return;
      }

      const sid = next.sessionId ?? sessionId;

      const onAudioFinished = async () => {
        if (!isMountedRef.current) return;
        if (next.currentStep?.expectsChildResponse) {
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
          handleError(err);
        }
      };

      switch (next.command) {
        case 'play_avatar_speech': {
          setUiState('speaking');
          try {
            const blob = await fetchSessionSpeechBlobApi(sid, {
              signal: abortControllerRef.current?.signal,
            });
            if (!isMountedRef.current) return;
            playBlob(blob, () => {
              void onAudioFinished();
            });
          } catch (err) {
            handleError(err);
          }
          break;
        }
        case 'play_feedback': {
          setUiState('evaluating');
          try {
            const attemptId = next.feedback?.attemptId;
            if (attemptId == null) {
              throw new Error('لا توجد نتيجة تقييم متاحة لهذه المحاولة.');
            }
            const blob = await fetchFeedbackSpeechBlobApi(sid, attemptId, {
              signal: abortControllerRef.current?.signal,
            });
            if (!isMountedRef.current) return;
            setUiState('playing_feedback');
            playBlob(blob, () => {
              void onAudioFinished();
            });
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
        const data = await getSessionRuntimeApi(sessionId, {
          signal: abortControllerRef.current?.signal,
        });
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

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!isMountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      mediaStreamRef.current = stream;
      chunksRef.current = [];
      isFinishingRecordingRef.current = false;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.start();
      setUiState('recording');
      setRecordingSeconds(0);

      recordIntervalRef.current = setInterval(() => {
        setRecordingSeconds((seconds) => seconds + 1);
      }, 1000);

      const maxMs = getMaxRecordingMs(runtime?.activityType);
      recordTimeoutRef.current = setTimeout(() => {
        void finishRecordingRef.current?.();
      }, maxMs);
    } catch (err) {
      handleError(err);
    }
  }, [handleError, runtime]);

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

    const recorder = mediaRecorderRef.current;
    const stream = mediaStreamRef.current;

    if (!recorder || recorder.state === 'inactive') {
      isFinishingRecordingRef.current = false;
      return;
    }

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

    setUiState('uploading');

    try {
      const sid = sessionId as string;
      const response = await submitSessionAttemptApi(sid, blob, `attempt-${Date.now()}.webm`, {
        signal: abortControllerRef.current?.signal,
      });
      isFinishingRecordingRef.current = false;
      if (!isMountedRef.current) return;
      await applyRuntime(response);
    } catch (err) {
      isFinishingRecordingRef.current = false;
      handleError(err);
    }
  }, [applyRuntime, handleError, sessionId]);

  useEffect(() => {
    finishRecordingRef.current = finishRecording;
  }, [finishRecording]);

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
  const maxSeconds = Math.round(getMaxRecordingMs(runtime?.activityType) / 1000);

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
          {(uiState === 'speaking' || uiState === 'playing_feedback') && (
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

          {uiState === 'speaking' && (
            <div className={styles.statusBlock}>
              <Volume2 size={28} className={styles.iconAccent} />
              <p className={styles.statusText}>{step?.spokenText || 'المساعد يتكلم...'}</p>
            </div>
          )}

          {(uiState === 'ready_to_record' || uiState === 'recording') && (
            <div className={styles.statusBlock}>
              <p className={styles.promptText}>{step?.spokenText}</p>
              {step && (
                <p className={styles.attemptInfo}>
                  المحاولة {step.attemptNumber + 1} من {step.maximumAttempts}
                </p>
              )}

              {uiState === 'ready_to_record' && (
                <button className={styles.primaryBtn} onClick={() => void startRecording()} type="button">
                  <Mic size={20} />
                  ابدأ التسجيل
                </button>
              )}

              {uiState === 'recording' && (
                <>
                  <div className={styles.recordingIndicator}>
                    <span className={styles.recordingDot} aria-hidden="true" />
                    جاري التسجيل... {recordingSeconds}s / {maxSeconds}s
                  </div>
                  <button className={styles.secondaryBtn} onClick={() => void finishRecording()} type="button">
                    <Square size={18} />
                    انتهيت
                  </button>
                </>
              )}
            </div>
          )}

          {uiState === 'uploading' && (
            <div className={styles.statusBlock}>
              <div className={styles.spinner} aria-hidden="true" />
              <p className={styles.statusText}>جاري رفع التسجيل...</p>
            </div>
          )}

          {uiState === 'evaluating' && (
            <div className={styles.statusBlock}>
              <div className={styles.spinner} aria-hidden="true" />
              <p className={styles.statusText}>جاري تحليل إجابتك...</p>
            </div>
          )}

          {uiState === 'playing_feedback' && (
            <div className={styles.statusBlock}>
              <p className={styles.statusText}>{feedback?.spokenText}</p>
              {feedback?.scores && (
                <p className={styles.attemptInfo}>
                  الدقة: {Math.round(feedback.scores.overall * 100)}%
                </p>
              )}
            </div>
          )}

          {uiState === 'take_break' && (
            <div className={styles.statusBlock}>
              <Coffee size={28} className={styles.iconAccent} />
              <p className={styles.statusText}>وقت لأخذ استراحة قصيرة! 🎈</p>
              <button className={styles.primaryBtn} onClick={() => void handleContinueAfterBreak()} type="button">
                استمر
              </button>
            </div>
          )}

          {uiState === 'completed' && (
            <div className={styles.statusBlock}>
              <PartyPopper size={32} className={styles.iconAccent} />
              <p className={styles.statusText}>أحسنت! لقد أنهيت الجلسة بنجاح 🎉</p>
              <button className={styles.primaryBtn} onClick={() => navigate('/session')} type="button">
                جلسة جديدة
              </button>
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
