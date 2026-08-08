import { useEffect, useState } from 'react';
import { 
  Users, 
  Gamepad2, 
  TrendingUp,
  Calendar,
  AlertCircle,
  FileText,
  Activity,
  Target
} from 'lucide-react';
import { getParentDashboardApi } from '../../api/parentApi';
import { useAppSelector } from '../../store/hooks';
import styles from './ParentOverview.module.css';
import toast from 'react-hot-toast';

const ParentOverview = () => {
  const { data: profileData } = useAppSelector((state) => state.profile);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animate, setAnimate] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getParentDashboardApi();
      const payload = response.value || response;
      setData(payload);
    } catch (err: any) {
      console.error('Error fetching parent dashboard:', err);
      setError('فشل في جلب بيانات اللوحة الرئيسية. يرجى المحاولة مرة أخرى.');
      toast.error('حدث خطأ أثناء تحميل الإحصائيات');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (data) {
      timer = setTimeout(() => setAnimate(true), 100);
    } else {
      timer = setTimeout(() => setAnimate(false), 0);
    }
    return () => clearTimeout(timer);
  }, [data]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p style={{ fontWeight: 800, color: '#581C87', fontSize: '1.2rem' }}>جاري جلب الإحصائيات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle size={48} />
        <p style={{ fontWeight: 800, fontSize: '1.2rem' }}>{error}</p>
        <button className={styles.retryBtn} onClick={fetchDashboardData}>
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const formattedDate = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Extracting data safely based on real swagger response
  const childrenList = Array.isArray(data?.children) ? data.children : [];
  
  // Aggregate stats across all children
  let totalSessionsLast7Days = 0;
  let totalPendingExercises = 0;
  let latestNoteObj: any = null;

  childrenList.forEach((child: any) => {
    if (child.activity) {
      totalSessionsLast7Days += child.activity.sessionsCompletedLast7Days || 0;
      totalPendingExercises += child.activity.pendingExercisesCount || 0;
    }
    
    // Find the first valid note (or the most recent if we want to sort, but first is fine for now)
    if (child.latestDoctorNote && !latestNoteObj) {
      latestNoteObj = { ...child.latestDoctorNote, childName: child.fullName };
    } else if (child.latestDoctorNote && latestNoteObj) {
        const currentNoteDate = new Date(child.latestDoctorNote.createdAt).getTime();
        const storedNoteDate = new Date(latestNoteObj.createdAt).getTime();
        if (currentNoteDate > storedNoteDate) {
            latestNoteObj = { ...child.latestDoctorNote, childName: child.fullName };
        }
    }
  });

  return (
    <div className={styles.pageContainer} dir="rtl">
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.welcomeTitle}>
            مرحباً، {profileData?.fullName || 'ولي الأمر'} 
          </h1>
          <p className={styles.welcomeSubtitle}>
            تابع تقدم أطفالك والأنشطة المنجزة.
          </p>
        </div>
        <div className={styles.dateBadge}>
          <Calendar size={18} />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        
        {/* Total Children Card */}
        <div className={`${styles.statCard} ${styles.statCardChildren}`}>
          <div className={styles.cardTop}>
            <span className={styles.cardTitle}>أطفالي</span>
            <div className={styles.iconWrapper}>
              <Users size={24} />
            </div>
          </div>
          <h2 className={styles.cardValue}>{childrenList.length}</h2>
          <div className={styles.cardBadge}>
            <span style={{ fontSize: '0.8rem', lineHeight: '1.4', color: '#64748B' }}>
              مسجلين في المنصة ويتم متابعتهم
            </span>
          </div>
        </div>

        {/* Activity Stats Card */}
        <div className={`${styles.statCard} ${styles.statCardActivities}`}>
          <div className={styles.cardTop}>
            <span className={styles.cardTitle}>إجمالي الجلسات (آخر أسبوع)</span>
            <div className={styles.iconWrapper}>
              <Gamepad2 size={24} />
            </div>
          </div>
          <h2 className={styles.cardValue}>{totalSessionsLast7Days}</h2>
          <div className={styles.cardBadge}>
            <span style={{ fontSize: '0.8rem', lineHeight: '1.4', color: '#64748B' }}>
              جلسات مكتملة لأطفالك | تدريبات معلقة: <span style={{color: '#F59E0B', fontWeight: 600}}>{totalPendingExercises}</span>
            </span>
          </div>
        </div>

        {/* Latest Note Card */}
        <div className={`${styles.statCard} ${styles.statCardNote}`}>
          <div className={styles.cardTop}>
            <span className={styles.cardTitle}>أحدث ملاحظة طبية</span>
            <div className={styles.iconWrapper}>
              <FileText size={24} />
            </div>
          </div>
          {latestNoteObj ? (
            <div className={styles.noteContent}>
              <span className={styles.noteDate}>
                بخصوص: {latestNoteObj.childName} • {new Date(latestNoteObj.createdAt).toLocaleDateString('ar-EG')}
              </span>
              <strong>{latestNoteObj.noteTitle}</strong>: {latestNoteObj.noteContent}
              <div style={{fontSize: '0.8rem', marginTop: '0.3rem', color: '#B45309'}}>
                - من د. {latestNoteObj.doctorFullName}
              </div>
            </div>
          ) : (
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              لا توجد ملاحظات حديثة من الطبيب.
            </p>
          )}
        </div>

      </div>

      {/* Progress Section */}
      <div className={styles.chartsSection}>
        
        <div className={styles.chartCard} style={{ gridColumn: '1 / -1' }}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>
              <Activity size={20} style={{ color: '#0D9488' }} />
              تقدم مستوى النطق والأهداف الحالية
            </h3>
          </div>
          
          <div className={styles.childrenProgressList}>
            {childrenList.length > 0 ? (
              childrenList.map((child: any, index: number) => {
                const progress = child.progress || {};
                const completed = progress.completedSpeechLevels || 0;
                const total = progress.totalSpeechLevels || 10;
                const percentage = Math.round((completed / total) * 100);
                
                return (
                  <div key={index} className={styles.childProgressItem}>
                    <div className={styles.childProgressHeader}>
                      <span className={styles.childName}>{child.fullName}</span>
                      <span className={styles.childLevel}>
                        أنهى {completed} من {total} مستويات
                      </span>
                    </div>

                    {/* Goal Section */}
                    {progress.currentGoal && (
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', color: '#475569', fontSize: '0.9rem'}}>
                            <Target size={16} style={{color: '#0ea5e9'}}/>
                            <span style={{fontWeight: 600}}>الهدف الحالي:</span> 
                            <span>{progress.currentGoal.split('\n')[0]}</span>
                        </div>
                    )}
                    
                    <div className={styles.progressBarTrack}>
                      <div 
                        className={styles.progressBarFill} 
                        style={{ width: animate ? `${percentage}%` : '0%' }}
                      ></div>
                    </div>
                    <div style={{ textAlign: 'left', fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
                      {percentage}%
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={styles.emptyState}>
                <TrendingUp size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p>لا توجد بيانات أطفال مسجلة حتى الآن.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ParentOverview;
