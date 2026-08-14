import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Mic, Sparkles } from 'lucide-react';
import styles from './SessionStart.module.css';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchChildren, fetchParentChildren } from '../../store/slices/childrenSlice/childrenSlice';
import { getChildActivitiesApi, type ActivityItem } from '../../api/doctorApi';
import { startSessionApi } from '../../api/sessionsApi';

const ACTIVITY_TARGET_LABELS: Record<number, string> = {
  0: 'حرف',
  1: 'كلمة',
  2: 'جملة',
};

// Word-level activities are the friendliest starting point (e.g. "بابا")،
// so we surface them first and badge them as recommended.
const RECOMMENDED_ACTIVITY_TARGET = 1;

const SessionStart = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const role = useAppSelector((state) => state.auth.role) ?? (localStorage.getItem('role') as
    | 'doctor'
    | 'parent'
    | 'admin'
    | null);
  const isDoctor = role === 'doctor';

  const { children, isLoading: isLoadingChildren, error: childrenError } = useAppSelector(
    (state) => state.children,
  );

  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  useEffect(() => {
    if (isDoctor) {
      dispatch(fetchChildren());
    } else {
      dispatch(fetchParentChildren());
    }
  }, [dispatch, isDoctor]);

  const loadActivities = useCallback(async (childId: number) => {
    setIsLoadingActivities(true);
    setActivitiesError(null);
    setSelectedActivityId(null);
    try {
      const data = await getChildActivitiesApi(childId, { onlyAvailableForSession: true });
      const list = Array.isArray(data) ? data : data?.value ?? [];
      // Client-side safety net: never show activities marked unavailable.
      setActivities(list.filter((a) => a.canMakeSession !== false));
    } catch (err) {
      console.error('خطأ في جلب الأنشطة:', err);
      setActivitiesError('تعذر تحميل الأنشطة الخاصة بهذا الطفل.');
      setActivities([]);
    } finally {
      setIsLoadingActivities(false);
    }
  }, []);

  const handleSelectChild = (childId: number) => {
    setSelectedChildId(childId);
    setStartError(null);
    void loadActivities(childId);
  };

  const sortedActivities = useMemo(() => {
    return [...activities].sort((a, b) => {
      if (a.activityTarget === RECOMMENDED_ACTIVITY_TARGET && b.activityTarget !== RECOMMENDED_ACTIVITY_TARGET) {
        return -1;
      }
      if (b.activityTarget === RECOMMENDED_ACTIVITY_TARGET && a.activityTarget !== RECOMMENDED_ACTIVITY_TARGET) {
        return 1;
      }
      return 0;
    });
  }, [activities]);

  const handleStart = async () => {
    if (!selectedChildId || !selectedActivityId) return;
    setIsStarting(true);
    setStartError(null);
    try {
      // Unlock browser audio during this click so the session screen can autoplay TTS.
      try {
        const unlock = new Audio(
          'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
        );
        unlock.volume = 0.01;
        await unlock.play().catch(() => undefined);
        unlock.pause();
      } catch {
        // Autoplay unlock is best-effort.
      }

      const runtime = await startSessionApi({
        childId: selectedChildId,
        activityId: selectedActivityId,
      });
      navigate(`/session/${runtime.sessionId}`, { state: { runtime } });
    } catch (err) {
      console.error('خطأ في بدء الجلسة:', err);
      const code = (err as { response?: { data?: { code?: string } } })?.response?.data?.code;
      if (code === 'SessionRuntime.ActivitySessionAlreadyCreated') {
        setStartError('هذا النشاط استُخدم بالفعل في جلسة مكتملة. اختر نشاطًا آخر أو أنشئ نشاطًا جديدًا.');
        if (selectedChildId) {
          void loadActivities(selectedChildId);
        }
      } else {
        setStartError('تعذر بدء الجلسة. حاول مرة أخرى.');
      }
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className={styles.pageContent} dir="rtl">
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>بدء جلسة تخاطب</h1>
          <p className={styles.pageSubtitle}>اختر الطفل والنشاط، وسيبدأ المساعد الذكي الجلسة فوراً.</p>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.cardTitle}>1. اختر الطفل</h2>
        {isLoadingChildren ? (
          <div className={styles.centerMessage}>جاري تحميل قائمة الأطفال...</div>
        ) : childrenError ? (
          <div className={styles.errorMessage}>{childrenError}</div>
        ) : children.length === 0 ? (
          <div className={styles.centerMessage}>لا يوجد أطفال مسجلين حالياً.</div>
        ) : (
          <div className={styles.chipGrid}>
            {children.map((child) => (
              <button
                key={child.id}
                type="button"
                className={`${styles.chip} ${selectedChildId === child.id ? styles.chipActive : ''}`}
                onClick={() => handleSelectChild(child.id)}
              >
                {child.fullName}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedChildId && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>2. اختر النشاط</h2>
          {isLoadingActivities ? (
            <div className={styles.centerMessage}>جاري تحميل الأنشطة...</div>
          ) : activitiesError ? (
            <div className={styles.errorMessage}>{activitiesError}</div>
          ) : sortedActivities.length === 0 ? (
            <div className={styles.centerMessage}>
              لا توجد أنشطة متاحة لبدء جلسة جديدة. أنشئ نشاطًا جديدًا أو استخدم نشاطًا لم تُكمل جلسته بعد.
            </div>
          ) : (
            <div className={styles.activityList}>
              {sortedActivities.map((activity) => {
                const isRecommended = activity.activityTarget === RECOMMENDED_ACTIVITY_TARGET;
                const isSelected = selectedActivityId === activity.id;
                return (
                  <button
                    key={activity.id}
                    type="button"
                    className={`${styles.activityCard} ${isSelected ? styles.activityCardActive : ''}`}
                    onClick={() => setSelectedActivityId(activity.id)}
                  >
                    <div className={styles.activityCardHeader}>
                      <span className={styles.activityContent}>{activity.content}</span>
                      {isRecommended && (
                        <span className={styles.recommendedBadge}>
                          <Sparkles size={14} />
                          مقترح
                        </span>
                      )}
                    </div>
                    <div className={styles.activityMeta}>
                      <span>الهدف: {ACTIVITY_TARGET_LABELS[activity.activityTarget] ?? 'غير محدد'}</span>
                      <span>المدة: {activity.estimatedDurationMinutes} دقائق</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {startError && <div className={styles.errorMessage}>{startError}</div>}

      <button
        type="button"
        className={styles.startBtn}
        disabled={!selectedChildId || !selectedActivityId || isStarting}
        onClick={() => void handleStart()}
      >
        {isStarting ? (
          <>
            <Loader2 size={20} className={styles.spinIcon} />
            جاري بدء الجلسة...
          </>
        ) : (
          <>
            <Mic size={20} />
            بدء الجلسة
          </>
        )}
      </button>
    </div>
  );
};

export default SessionStart;
