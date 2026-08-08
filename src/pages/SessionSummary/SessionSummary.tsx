import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, PartyPopper, RefreshCw, Stethoscope, TriangleAlert } from 'lucide-react';
import styles from './SessionSummary.module.css';
import {
  generateSessionSummaryApi,
  getDoctorSessionSummaryApi,
  getParentSessionSummaryApi,
  type DoctorSessionSummaryResponse,
  type ParentSessionSummaryResponse,
  type SessionSummaryDto,
} from '../../api/sessionSummaryApi';
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

  const load = useCallback(async () => {
    if (!sessionId) {
      setErrorMessage('معرّف الجلسة غير صالح.');
      setLoadState('error');
      return;
    }

    setLoadState('loading');
    setErrorMessage(null);

    try {
      // Ensure a persisted summary exists (idempotent).
      const generated = await generateSessionSummaryApi(sessionId);
      setShared(generated);

      if (role === 'doctor') {
        const detailed = await getDoctorSessionSummaryApi(sessionId);
        setDoctorSummary(detailed);
        setParentSummary(null);
      } else {
        const simple = await getParentSessionSummaryApi(sessionId);
        setParentSummary(simple);
        setDoctorSummary(null);
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
  }, [role, sessionId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className={styles.page} dir="rtl">
      <header className={styles.header}>
        <button className={styles.backBtn} type="button" onClick={() => navigate(-1)}>
          <ArrowRight size={20} />
          رجوع
        </button>
        <h1 className={styles.title}>ملخص الجلسة</h1>
      </header>

      {loadState === 'loading' && (
        <div className={styles.card}>
          <div className={styles.spinner} aria-hidden="true" />
          <p className={styles.body}>جاري تجهيز ملخص ما حدث في الجلسة...</p>
        </div>
      )}

      {loadState === 'error' && (
        <div className={styles.card}>
          <TriangleAlert className={styles.danger} size={28} />
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
            <div className={styles.eyebrow}>
              <Stethoscope size={18} />
              عرض الأخصائي — تفصيلي
            </div>
            <h2 className={styles.heading}>{doctorSummary.sessionTitle}</h2>
            <p className={styles.meta}>
              {doctorSummary.childName}
              {doctorSummary.prompt ? ` · الهدف: ${doctorSummary.prompt}` : ''}
              {doctorSummary.speechLevel ? ` · المستوى: ${doctorSummary.speechLevel}` : ''}
            </p>
            <p className={styles.body}>{doctorSummary.shortSummary}</p>
          </section>

          <section className={styles.card}>
            <h3 className={styles.subheading}>المؤشرات التحليلية</h3>
            <div className={styles.metricsGrid}>
              <div>
                <span className={styles.metricLabel}>النتيجة العامة</span>
                <strong>{doctorSummary.outcomeLabel || doctorSummary.outcome}</strong>
              </div>
              <div>
                <span className={styles.metricLabel}>عدد المحاولات</span>
                <strong>{doctorSummary.metrics.totalAttempts}</strong>
              </div>
              <div>
                <span className={styles.metricLabel}>مطابقة الهدف</span>
                <strong>{doctorSummary.metrics.successfulAttempts}</strong>
              </div>
              <div>
                <span className={styles.metricLabel}>متوسط الدرجة</span>
                <strong>{formatScore(doctorSummary.metrics.averageScore)}</strong>
              </div>
              <div>
                <span className={styles.metricLabel}>أفضل درجة</span>
                <strong>{formatScore(doctorSummary.metrics.bestScore)}</strong>
              </div>
              <div>
                <span className={styles.metricLabel}>التحسن</span>
                <strong>{formatScore(doctorSummary.metrics.improvementPercentage)}</strong>
              </div>
              <div>
                <span className={styles.metricLabel}>الاتجاه</span>
                <strong>{formatTrend(doctorSummary.metrics.scoreTrend)}</strong>
              </div>
              <div>
                <span className={styles.metricLabel}>بدون كلام</span>
                <strong>{doctorSummary.metrics.noSpeechAttempts}</strong>
              </div>
              <div>
                <span className={styles.metricLabel}>المدة</span>
                <strong>
                  {doctorSummary.metrics.durationSeconds != null
                    ? `${Math.round(doctorSummary.metrics.durationSeconds / 60)} د`
                    : '—'}
                </strong>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <h3 className={styles.subheading}>الاستنتاج التحليلي</h3>
            <ul className={styles.list}>
              {doctorSummary.strengths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <h3 className={styles.subheading}>محاور التمرين المقترحة</h3>
            <ul className={styles.list}>
              {doctorSummary.practiceAreas.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className={styles.body}>
              <strong>اقتراح الجلسة القادمة:</strong> {doctorSummary.nextSessionSuggestion}
            </p>
            {(doctorSummary.doctorReviewRecommended || doctorSummary.requiresDoctorReview) && (
              <div className={styles.reviewBox}>
                <p className={styles.body}>
                  <strong>ملاحظة للمراجعة الطبية:</strong>{' '}
                  {doctorSummary.doctorReviewNote || 'يُفضّل مراجعة الأخصائي لهذه الجلسة.'}
                </p>
              </div>
            )}
          </section>
        </div>
      )}

      {loadState === 'ready' && role !== 'doctor' && parentSummary && (
        <div className={styles.stack}>
          <section className={styles.card}>
            <PartyPopper className={styles.accent} size={28} />
            <h2 className={styles.heading}>{parentSummary.friendlyOutcome}</h2>
            <p className={styles.meta}>
              {parentSummary.childName}
              {parentSummary.activityLabel ? ` · ${parentSummary.activityLabel}` : ''}
            </p>
            <p className={styles.body}>{parentSummary.shortSummary}</p>
          </section>

          <section className={styles.card}>
            <h3 className={styles.subheading}>ما نجح اليوم</h3>
            <ul className={styles.list}>
              {parentSummary.strengths.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <h3 className={styles.subheading}>تمرين بسيط في البيت</h3>
            <p className={styles.body}>{parentSummary.practiceTip}</p>
            <p className={styles.body}>
              <strong>الجلسة الجاية:</strong> {parentSummary.nextSessionSuggestion}
            </p>
            {parentSummary.suggestDoctorFollowUp && parentSummary.followUpMessage && (
              <p className={styles.softNote}>{parentSummary.followUpMessage}</p>
            )}
            <p className={styles.softNote}>
              عدد المحاولات: {parentSummary.totalAttempts}
              {parentSummary.successfulAttempts > 0
                ? ` · محاولات واضحة ناجحة: ${parentSummary.successfulAttempts}`
                : ''}
            </p>
          </section>
        </div>
      )}

      {loadState === 'ready' && !doctorSummary && !parentSummary && shared && (
        <div className={styles.card}>
          <p className={styles.body}>{shared.shortSummary}</p>
        </div>
      )}
    </div>
  );
};

export default SessionSummaryPage;
