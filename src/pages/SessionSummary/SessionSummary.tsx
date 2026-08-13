import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowRight,
  ClipboardList,
  Mic,
  PartyPopper,
  RefreshCw,
  Sparkles,
  Stethoscope,
  TriangleAlert,
} from 'lucide-react';
import styles from './SessionSummary.module.css';
import AttemptAudioPlayer from './AttemptAudioPlayer';
import {
  generateSessionSummaryApi,
  getDoctorSessionSummaryApi,
  getParentSessionSummaryApi,
  type DoctorSessionSummaryResponse,
  type ParentSessionSummaryResponse,
  type SessionSummaryDto,
} from '../../api/sessionSummaryApi';
import {
  getSessionAttemptsApi,
  type SessionAttemptItem,
} from '../../api/sessionsApi';
import { useAppSelector } from '../../store/hooks';

type LoadState = 'loading' | 'ready' | 'error';

function formatScore(value?: number | null): string {
  if (value == null || Number.isNaN(value)) return '—';
  return `${Math.round(Number(value))}%`;
}

function formatTrend(trend?: string | null): string {
  switch (trend) {
    case 'improving':
      return 'تحسن';
    case 'declining':
      return 'تراجع خفيف';
    case 'stable':
      return 'ثابت';
    case 'mixed':
      return 'متفاوت';
    default:
      return 'غير متاح';
  }
}

function formatDuration(seconds?: number | null): string {
  if (seconds == null || Number.isNaN(seconds)) return '—';
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes} دقيقة`;
}

const SessionSummaryPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const role = useAppSelector((state) => state.auth.role) ?? (localStorage.getItem('role') as
    | 'doctor'
    | 'parent'
    | 'admin'
    | null);

  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [doctorSummary, setDoctorSummary] = useState<DoctorSessionSummaryResponse | null>(null);
  const [parentSummary, setParentSummary] = useState<ParentSessionSummaryResponse | null>(null);
  const [shared, setShared] = useState<SessionSummaryDto | null>(null);
  const [historyChildId, setHistoryChildId] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<SessionAttemptItem[]>([]);
  const [attemptsError, setAttemptsError] = useState<string | null>(null);

  const loadAttempts = useCallback(async (id: string) => {
    try {
      const response = await getSessionAttemptsApi(id);
      setAttempts(response.attempts ?? []);
      setAttemptsError(null);
    } catch {
      setAttempts([]);
      setAttemptsError('تعذر تحميل تسجيلات المحاولات.');
    }
  }, []);

  const load = useCallback(async () => {
    if (!sessionId) {
      setErrorMessage('معرّف الجلسة غير صالح.');
      setLoadState('error');
      return;
    }

    setLoadState('loading');
    setErrorMessage(null);

    try {
      if (role === 'doctor') {
        try {
          const detailed = await getDoctorSessionSummaryApi(sessionId);
          setDoctorSummary(detailed);
          setParentSummary(null);
          setShared(null);
          setHistoryChildId(detailed.childId);
          await loadAttempts(sessionId);
          setLoadState('ready');
          return;
        } catch (err) {
          const status = (err as { response?: { status?: number } })?.response?.status;
          if (status !== 404) throw err;
        }
      } else {
        try {
          const simple = await getParentSessionSummaryApi(sessionId);
          setParentSummary(simple);
          setDoctorSummary(null);
          setShared(null);
          setHistoryChildId(simple.childId);
          setAttempts([]);
          setAttemptsError(null);
          setLoadState('ready');
          return;
        } catch (err) {
          const status = (err as { response?: { status?: number } })?.response?.status;
          if (status !== 404) throw err;
        }
      }

      const generated = await generateSessionSummaryApi(sessionId);
      setShared(generated);
      setHistoryChildId(generated.childId);

      if (role === 'doctor') {
        const detailed = await getDoctorSessionSummaryApi(sessionId);
        setDoctorSummary(detailed);
        setParentSummary(null);
        await loadAttempts(sessionId);
      } else {
        const simple = await getParentSessionSummaryApi(sessionId);
        setParentSummary(simple);
        setDoctorSummary(null);
        setAttempts([]);
        setAttemptsError(null);
      }
      setLoadState('ready');
    } catch (err) {
      const message =
        (err as { response?: { data?: { description?: string; detail?: string } }; message?: string })
          ?.response?.data?.description ||
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        (err as Error)?.message ||
        'تعذر تحميل ملخص الجلسة.';
      setErrorMessage(message);
      setLoadState('error');
    }
  }, [loadAttempts, role, sessionId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className={styles.page} dir="rtl">
      <header className={styles.header}>
        <button
          className={styles.backBtn}
          type="button"
          aria-label="رجوع"
          onClick={() => {
            if (historyChildId) {
              navigate(`/child/${historyChildId}`);
            } else {
              navigate(-1);
            }
          }}
        >
          <ArrowRight size={20} />
        </button>
        <div className={styles.headerText}>
          <h1 className={styles.title}>نتائج الجلسة</h1>
          <p className={styles.subtitle}>
            {historyChildId ? 'سجل متابعة نتائج الجلسة — يمكنك الرجوع إليه في أي وقت' : 'عرض شامل ومبسط لأداء الطفل في الجلسة'}
          </p>
        </div>
      </header>

      {loadState === 'loading' && (
        <div className={`${styles.card} ${styles.centerState}`}>
          <div className={styles.spinner} aria-hidden="true" />
          <p className={styles.body}>جاري تجهيز ملخص ما حدث في الجلسة...</p>
        </div>
      )}

      {loadState === 'error' && (
        <div className={`${styles.card} ${styles.centerState}`}>
          <TriangleAlert className={styles.danger} size={32} />
          <p className={styles.body}>{errorMessage}</p>
          <button className={styles.primaryBtn} type="button" onClick={() => void load()}>
            <RefreshCw size={18} />
            إعادة المحاولة
          </button>
        </div>
      )}

      {loadState === 'ready' && role === 'doctor' && doctorSummary && (
        <div className={styles.stack}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <Stethoscope size={22} />
                تقرير الجلسة
              </h2>
              <span className={styles.badge}>تحليل متقدم ومفصّل</span>
            </div>

            <h3 className={styles.heading}>{doctorSummary.sessionTitle}</h3>

            <div className={styles.chipRow}>
              <span className={styles.chip}>الطفل: {doctorSummary.childName}</span>
              {doctorSummary.prompt && (
                <span className={styles.chip}>الهدف: {doctorSummary.prompt}</span>
              )}
              {doctorSummary.speechLevel && (
                <span className={styles.chip}>المستوى: {doctorSummary.speechLevel}</span>
              )}
            </div>

            <p className={styles.summaryText}>{doctorSummary.shortSummary}</p>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <ClipboardList size={22} />
                المؤشرات التحليلية
              </h2>
            </div>

            <div className={styles.metricsGrid}>
              <div className={`${styles.metricTile} ${styles.metricTileWide}`}>
                <span className={styles.metricLabel}>النتيجة العامة</span>
                <strong className={`${styles.metricValue} ${styles.metricValueSm}`}>
                  {doctorSummary.outcomeLabel || doctorSummary.outcome}
                </strong>
              </div>
              <div className={styles.metricTile}>
                <span className={styles.metricLabel}>عدد المحاولات</span>
                <strong className={styles.metricValue}>{doctorSummary.metrics.totalAttempts}</strong>
              </div>
              <div className={styles.metricTile}>
                <span className={styles.metricLabel}>مطابقة الهدف</span>
                <strong className={styles.metricValue}>
                  {doctorSummary.metrics.successfulAttempts}
                </strong>
              </div>
              <div className={styles.metricTile}>
                <span className={styles.metricLabel}>متوسط الدرجة</span>
                <strong className={styles.metricValue}>
                  {formatScore(doctorSummary.metrics.averageScore)}
                </strong>
              </div>
              <div className={styles.metricTile}>
                <span className={styles.metricLabel}>أفضل درجة</span>
                <strong className={styles.metricValue}>
                  {formatScore(doctorSummary.metrics.bestScore)}
                </strong>
              </div>
              <div className={styles.metricTile}>
                <span className={styles.metricLabel}>التحسن</span>
                <strong className={styles.metricValue}>
                  {formatScore(doctorSummary.metrics.improvementPercentage)}
                </strong>
              </div>
              <div className={styles.metricTile}>
                <span className={styles.metricLabel}>الاتجاه</span>
                <strong className={styles.metricValue}>
                  {formatTrend(doctorSummary.metrics.scoreTrend)}
                </strong>
              </div>
              <div className={styles.metricTile}>
                <span className={styles.metricLabel}>بدون كلام</span>
                <strong className={styles.metricValue}>
                  {doctorSummary.metrics.noSpeechAttempts}
                </strong>
              </div>
              <div className={styles.metricTile}>
                <span className={styles.metricLabel}>مدة الجلسة</span>
                <strong className={styles.metricValue}>
                  {formatDuration(doctorSummary.metrics.durationSeconds)}
                </strong>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <Sparkles size={22} />
                الاستنتاج التحليلي
              </h2>
            </div>

            <div className={styles.sectionBlock}>
              <h3 className={styles.sectionTitle}>نقاط القوة</h3>
              <ul className={styles.list}>
                {doctorSummary.strengths.map((item) => (
                  <li key={item} className={styles.listItem}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.sectionBlock}>
              <h3 className={styles.sectionTitle}>محاور التمرين المقترحة</h3>
              <ul className={styles.list}>
                {doctorSummary.practiceAreas.map((item) => (
                  <li key={item} className={styles.listItem}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.nextBox}>
              <p className={styles.nextLabel}>اقتراح الجلسة القادمة</p>
              <p className={styles.nextText}>{doctorSummary.nextSessionSuggestion}</p>
            </div>

            {(doctorSummary.doctorReviewRecommended || doctorSummary.requiresDoctorReview) && (
              <div className={styles.reviewBox}>
                <p className={styles.reviewLabel}>ملاحظة للمراجعة الطبية</p>
                <p className={styles.reviewText}>
                  {doctorSummary.doctorReviewNote || 'يُفضّل مراجعة الأخصائي لهذه الجلسة.'}
                </p>
              </div>
            )}
          </section>

          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <Mic size={22} />
                تسجيلات محاولات الطفل
              </h2>
              <span className={styles.badge}>{attempts.length} محاولة</span>
            </div>

            {attemptsError && <p className={styles.attemptAudioError}>{attemptsError}</p>}

            {!attemptsError && attempts.length === 0 && (
              <p className={styles.body}>لا توجد محاولات محفوظة لهذه الجلسة بعد.</p>
            )}

            <div className={styles.attemptsList}>
              {attempts.map((attempt) => (
                <article key={attempt.attemptId} className={styles.attemptCard}>
                  <div className={styles.attemptMeta}>
                    <strong>المحاولة {attempt.attemptNumber}</strong>
                    {attempt.evaluation && (
                      <span className={styles.chip}>
                        الدرجة:{' '}
                        {formatScore(
                          Number(attempt.evaluation.overallScore) > 4
                            ? Number(attempt.evaluation.overallScore)
                            : Number(attempt.evaluation.overallScore) * 25,
                        )}
                      </span>
                    )}
                    {attempt.transcription?.transcribedText && (
                      <span className={styles.chip}>
                        النص: {attempt.transcription.transcribedText}
                      </span>
                    )}
                  </div>
                  {attempt.audioUrl ? (
                    <AttemptAudioPlayer
                      sessionId={sessionId!}
                      attemptId={attempt.attemptId}
                      label={`استماع لتسجيل المحاولة ${attempt.attemptNumber}`}
                    />
                  ) : (
                    <p className={styles.attemptAudioHint}>لا يوجد تسجيل صوتي لهذه المحاولة.</p>
                  )}
                </article>
              ))}
            </div>
          </section>
        </div>
      )}

      {loadState === 'ready' && role !== 'doctor' && parentSummary && (
        <div className={styles.stack}>
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <PartyPopper className={styles.accent} size={22} />
                نتائج الجلسة
              </h2>
              <span className={`${styles.badge} ${styles.badgeSuccess}`}>تطور ومتابعة الطفل</span>
            </div>

            <h3 className={styles.heading}>{parentSummary.friendlyOutcome}</h3>

            <div className={styles.chipRow}>
              <span className={styles.chip}>الطفل: {parentSummary.childName}</span>
              {parentSummary.activityLabel && (
                <span className={styles.chip}>{parentSummary.activityLabel}</span>
              )}
              <span className={styles.chip}>محاولات: {parentSummary.totalAttempts}</span>
              {parentSummary.successfulAttempts > 0 && (
                <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                  ناجحة: {parentSummary.successfulAttempts}
                </span>
              )}
            </div>

            <p className={styles.summaryText}>{parentSummary.shortSummary}</p>
          </section>

          <section className={styles.card}>
            <div className={styles.sectionBlock}>
              <h3 className={styles.sectionTitle}>ما نجح اليوم</h3>
              <ul className={styles.list}>
                {parentSummary.strengths.map((item) => (
                  <li key={item} className={styles.listItem}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.nextBox}>
              <p className={styles.nextLabel}>تمرين بسيط في البيت</p>
              <p className={styles.nextText}>{parentSummary.practiceTip}</p>
            </div>

            <div className={styles.outcomeBanner}>
              <p className={styles.outcomeLabel}>الجلسة الجاية:</p>
              <p className={styles.outcomeValue}>{parentSummary.nextSessionSuggestion}</p>
            </div>

            {parentSummary.suggestDoctorFollowUp && parentSummary.followUpMessage && (
              <div className={styles.reviewBox}>
                <p className={styles.reviewLabel}>متابعة بسيطة</p>
                <p className={styles.reviewText}>{parentSummary.followUpMessage}</p>
              </div>
            )}
          </section>
        </div>
      )}

      {loadState === 'ready' && !doctorSummary && !parentSummary && shared && (
        <div className={styles.card}>
          <p className={styles.summaryText}>{shared.shortSummary}</p>
        </div>
      )}
    </div>
  );
};

export default SessionSummaryPage;
