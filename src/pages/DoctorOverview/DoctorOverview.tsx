import { useEffect, useState } from 'react';
import { 
  Users, 
  Gamepad2, 
  TrendingUp,
  Calendar,
  AlertCircle,
  Activity
} from 'lucide-react';
import { getDoctorDashboardApi } from '../../api/doctorApi';
import { useAppSelector } from '../../store/hooks';
import styles from './DoctorOverview.module.css';
import toast from 'react-hot-toast';

const DoctorOverview = () => {
  const { data: profileData } = useAppSelector((state) => state.profile);
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [animate, setAnimate] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getDoctorDashboardApi();
      const payload = response.value || response;
      setData(payload);

    } catch (err: any) {
      console.error('Error fetching doctor dashboard:', err);
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

  // Extracting data exactly as per the new API response
  const sessions = data?.sessions || {};
  const completedLast7Days = sessions.completedLast7Days || 0;
  const completedToday = sessions.completedToday || 0;
  const awaitingReview = sessions.awaitingDoctorReview || 0;
  
  const cases = data?.cases || {};
  const totalChildren = cases.totalChildren || 0;
  
  const progressedCount = cases.progressedLast7Days?.length || 0;
  const stableCount = cases.stableLast7Days?.length || 0;
  const regressedCount = cases.regressedLast7Days?.length || 0;

  const maxProgress = Math.max(progressedCount, stableCount, regressedCount, 1);

  return (
    <div className={styles.pageContainer} dir="rtl">
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.welcomeTitle}>
            مرحباً بك د. {profileData?.fullName || ''} 
          </h1>
          <p className={styles.welcomeSubtitle}>
            إليك نظرة عامة على نشاط مرضاك والجلسات الأخيرة.
          </p>
        </div>
        <div className={styles.dateBadge}>
          <Calendar size={18} />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        
        {/* Total Patients Card */}
        <div className={`${styles.statCard} ${styles.statCardPatients}`}>
          <div className={styles.cardTop}>
            <span className={styles.cardTitle}>إجمالي المرضى (الأطفال)</span>
            <div className={styles.iconWrapper}>
              <Users size={24} />
            </div>
          </div>
          <h2 className={styles.cardValue}>{totalChildren}</h2>
          <div className={styles.cardBadge}>
            <span style={{ fontSize: '0.8rem', lineHeight: '1.4', color: '#64748B' }}>
              إجمالي الحالات الموكلة إليك حالياً
            </span>
          </div>
        </div>

        {/* Sessions Card */}
        <div className={`${styles.statCard} ${styles.statCardSessions}`}>
          <div className={styles.cardTop}>
            <span className={styles.cardTitle}>الجلسات (آخر 7 أيام)</span>
            <div className={styles.iconWrapper}>
              <Gamepad2 size={24} />
            </div>
          </div>
          <h2 className={styles.cardValue}>{completedLast7Days}</h2>
          <div className={styles.cardBadge}>
            <span style={{ fontSize: '0.8rem', lineHeight: '1.4', color: '#64748B' }}>
              مكتملة اليوم: <span style={{color: '#10B981', fontWeight: 600}}>{completedToday}</span> | 
              بانتظار المراجعة: <span style={{color: '#F59E0B', fontWeight: 600}}>{awaitingReview}</span>
            </span>
          </div>
        </div>

        {/* Progress Overview Card */}
        <div className={`${styles.statCard} ${styles.statCardProgress}`}>
          <div className={styles.cardTop}>
            <span className={styles.cardTitle}>حالات تحسنت</span>
            <div className={styles.iconWrapper}>
              <TrendingUp size={24} />
            </div>
          </div>
          <h2 className={styles.cardValue}>{progressedCount}</h2>
          <div className={styles.cardBadge}>
            <span style={{ fontSize: '0.8rem', lineHeight: '1.4', color: '#64748B' }}>
              من إجمالي {totalChildren} أطفال في آخر أسبوع
            </span>
          </div>
        </div>

      </div>

      {/* Charts Section */}
      <div className={styles.chartsSection}>
        
        <div className={styles.chartCard} style={{ gridColumn: '1 / -1' }}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>
              <Activity size={20} style={{ color: '#581C87' }} />
              تطور مستويات النطق للحالات (آخر 7 أيام)
            </h3>
          </div>
          
          <div className={styles.barChartContainer}>
            
            {/* Progressed */}
            <div className={styles.barRow}>
              <div className={styles.barInfo}>
                <span className={styles.barName} style={{ color: '#10B981' }}>حالات في تحسن (Progressed)</span>
                <span className={styles.barCount}>{progressedCount} طفل</span>
              </div>
              <div className={styles.barTrack}>
                <div 
                  className={styles.barFill} 
                  style={{ width: animate ? `${Math.round((progressedCount / maxProgress) * 100)}%` : '0%', background: 'linear-gradient(90deg, #10B981, #34D399)' }}
                ></div>
              </div>
            </div>

            {/* Stable */}
            <div className={styles.barRow}>
              <div className={styles.barInfo}>
                <span className={styles.barName} style={{ color: '#F59E0B' }}>حالات مستقرة (Stable)</span>
                <span className={styles.barCount}>{stableCount} طفل</span>
              </div>
              <div className={styles.barTrack}>
                <div 
                  className={styles.barFill} 
                  style={{ width: animate ? `${Math.round((stableCount / maxProgress) * 100)}%` : '0%', background: 'linear-gradient(90deg, #F59E0B, #FBBF24)' }}
                ></div>
              </div>
            </div>

            {/* Regressed */}
            <div className={styles.barRow}>
              <div className={styles.barInfo}>
                <span className={styles.barName} style={{ color: '#EF4444' }}>حالات تراجعت (Regressed)</span>
                <span className={styles.barCount}>{regressedCount} طفل</span>
              </div>
              <div className={styles.barTrack}>
                <div 
                  className={styles.barFill} 
                  style={{ width: animate ? `${Math.round((regressedCount / maxProgress) * 100)}%` : '0%', background: 'linear-gradient(90deg, #EF4444, #F87171)' }}
                ></div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default DoctorOverview;
