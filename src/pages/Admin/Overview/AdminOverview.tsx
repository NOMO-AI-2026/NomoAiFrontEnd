import { useEffect, useState } from 'react';
import { 
  Users, 
  Smile, 
  HelpCircle, 
  TrendingUp, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  MessageSquare,
  Activity,
  Heart
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchAdminAnalyticsOverview } from '../../../store/slices/adminAnalyticsSlice/adminAnalyticsSlice';
import { getProfile } from '../../../store/slices/profileSlice/profileSlice';
import styles from './AdminOverview.module.css';

const AdminOverview = () => {
  const dispatch = useAppDispatch();
  const { overview, isLoading, error } = useAppSelector((state) => state.adminAnalytics);
  const { data: profileData } = useAppSelector((state) => state.profile);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminAnalyticsOverview());
  }, [dispatch]);

  useEffect(() => {
    if (!profileData) {
      dispatch(getProfile());
    }
  }, [dispatch, profileData]);

  useEffect(() => {
    let timer; 

    if (overview) {
      timer = setTimeout(() => setAnimate(true), 100);
    } else {
      timer = setTimeout(() => setAnimate(false), 0);
    }
    return () => clearTimeout(timer);
  }, [overview]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p style={{ fontWeight: 800, color: '#581C87', fontSize: '1.2rem' }}>جاري جلب إحصائيات لوحة التحكم...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle size={48} />
        <p style={{ fontWeight: 800, fontSize: '1.2rem' }}>فشل تحميل البيانات: {error}</p>
        <button className={styles.retryBtn} onClick={() => dispatch(fetchAdminAnalyticsOverview())}>
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (!overview) return null;

  const therapy = overview.therapy;
  const sessionsByStatus = therapy?.sessionsByStatus;
  const scheduledSessions = sessionsByStatus?.scheduled ?? 0;
  const inProgressSessions = sessionsByStatus?.inProgress ?? 0;
  const completedSessions = sessionsByStatus?.completed ?? 0;

  // حساب القيم الكلية والمستهدفة
  const totalUsers = (overview.users?.doctorsTotal || 0) + (overview.users?.parentsTotal || 0);
  const totalChildren = overview.children?.total || 0;
  const grandTotalEntities = totalUsers + totalChildren;

  const docPercentage = grandTotalEntities > 0 ? Math.round((overview.users.doctorsTotal / grandTotalEntities) * 100) : 0;
  const parentPercentage = grandTotalEntities > 0 ? Math.round((overview.users.parentsTotal / grandTotalEntities) * 100) : 0;
  const childPercentage = grandTotalEntities > 0 ? Math.round((totalChildren / grandTotalEntities) * 100) : 0;

  // إيجاد أعلى قيمة للمستويات لاستخدامها كـ Max في المخطط الشريطي
  const maxChildrenPerLevel = Math.max(
    ...(overview.speechLevels.childrenPerLevel || []).map(item => item.childrenCount),
    1
  );

  const formattedDate = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className={styles.pageContainer} dir="rtl">
      
      {/* ================= الترحيب والهيدر ================= */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.welcomeTitle}>
            مرحباً بك مجدداً، {profileData?.fullName || 'المسؤول'} 
          </h1>
          <p className={styles.welcomeSubtitle}>
            إليك نظرة عامة شاملة حول أداء المنصة والمستخدمين اليوم.
          </p>
        </div>
        <div className={styles.dateBadge}>
          <Calendar size={18} />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* ================= كروت الإحصائيات (Overview Stat Cards) ================= */}
      <div className={styles.statsGrid}>
        
        {/* كارت المستخدمين */}
        <div className={`${styles.statCard} ${styles.statCardUsers}`}>
          <div className={styles.cardTop}>
            <span className={styles.cardTitle}>إجمالي الحسابات</span>
            <div className={styles.iconWrapper}>
              <Users size={24} />
            </div>
          </div>
          <h2 className={styles.cardValue}>{totalUsers}</h2>
          <div className={styles.cardBadge}>
            <span style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
              الأهالي: {overview.users.parentsTotal} | الأطباء: {overview.users.doctorsTotal} 
              <br />
              (الأطباء - معتمد: {overview.users.doctorsApproved} | انتظار: {overview.users.doctorsPendingApproval})
            </span>
          </div>
        </div>

        {/* كارت الأطفال */}
        <div className={`${styles.statCard} ${styles.statCardChildren}`}>
          <div className={styles.cardTop}>
            <span className={styles.cardTitle}>إجمالي الأطفال</span>
            <div className={styles.iconWrapper}>
              <Smile size={24} />
            </div>
          </div>
          <h2 className={styles.cardValue}>{totalChildren}</h2>
          <div className={styles.cardBadge}>
            <span style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
              مربوطين بأهاليهم: {overview.children.withParentAssigned} 
              <br />
              غير مربوطين: {overview.children.withoutParentAssigned}
            </span>
          </div>
        </div>

        {/* كارت الدعم الفني */}
        <div className={`${styles.statCard} ${styles.statCardSupport}`}>
          <div className={styles.cardTop}>
            <span className={styles.cardTitle}>إجمالي تذاكر الدعم</span>
            <div className={styles.iconWrapper}>
              <HelpCircle size={24} />
            </div>
          </div>
          <h2 className={styles.cardValue}>{overview.support.ticketsTotal}</h2>
          <div className={styles.cardBadge} style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
            <span>بانتظار رد الأدمن: {overview.support.awaitingAdminAction}</span>
          </div>
        </div>

        {/* كارت مستويات الكلام */}
        <div className={`${styles.statCard} ${styles.statCardLevels}`}>
          <div className={styles.cardTop}>
            <span className={styles.cardTitle}>مستويات الكلام</span>
            <div className={styles.iconWrapper}>
              <TrendingUp size={24} />
            </div>
          </div>
          <h2 className={styles.cardValue}>{overview.speechLevels.catalogCount}</h2>
          <div className={styles.cardBadge} style={{ backgroundColor: '#D1FAE5', color: '#059669' }}>
            <span>عدد المستويات المفعلة بكتالوج المنصة</span>
          </div>
        </div>

      </div>

      {/* ================= المخططات والرسومات البيانية (Visual Charts) ================= */}
      <div className={styles.chartsSection}>
        
        {/* مخطط توزيع الأطفال على مستويات الكلام (الأيسر - الطويل) */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>
              <Activity size={20} style={{ color: '#581C87' }} />
              توزيع أعداد الأطفال على مستويات الكلام
            </h3>
          </div>
          
          <div className={styles.barChartContainer}>
            {overview.speechLevels.childrenPerLevel.map((lvl) => {
              const percentage = Math.round((lvl.childrenCount / maxChildrenPerLevel) * 100);
              return (
                <div key={lvl.speechLevelId} className={styles.barRow}>
                  <div className={styles.barInfo}>
                    <span className={styles.barName}>{lvl.name}</span>
                    <span className={styles.barCount}>{lvl.childrenCount} طفل</span>
                  </div>
                  <div className={styles.barTrack}>
                    <div 
                      className={styles.barFill} 
                      style={{ width: animate ? `${percentage}%` : '0%' }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* كروت التحليلات والدعم المكدسة رأسياً (الأيمن) */}
        <div className={styles.rightChartsStack}>
          
          {/* 1. كارت النسبة التناسبية للحسابات */}
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>
                <Heart size={20} style={{ color: '#581C87' }} />
                نسبة توزيع الحسابات بالمنصة
              </h3>
            </div>

            <div className={styles.pieChartContainer}>
              <div className={styles.ratioBar}>
                <div 
                  className={styles.ratioSegment} 
                  style={{ width: animate ? `${docPercentage}%` : '0%', backgroundColor: '#581C87' }}
                  title={`الأطباء: ${docPercentage}%`}
                ></div>
                <div 
                  className={styles.ratioSegment} 
                  style={{ width: animate ? `${parentPercentage}%` : '0%', backgroundColor: '#FACC15' }}
                  title={`الأهالي: ${parentPercentage}%`}
                ></div>
                <div 
                  className={styles.ratioSegment} 
                  style={{ width: animate ? `${childPercentage}%` : '0%', backgroundColor: '#0D9488' }}
                  title={`الأطفال: ${childPercentage}%`}
                ></div>
              </div>

              <div className={styles.ratioLegend}>
                <div className={styles.legendItem}>
                  <div className={styles.legendLabel}>
                    <span className={styles.legendDot} style={{ backgroundColor: '#581C87' }}></span>
                    الأطباء
                  </div>
                  <span className={styles.legendValue}>{docPercentage}% ({overview.users.doctorsTotal})</span>
                </div>

                <div className={styles.legendItem}>
                  <div className={styles.legendLabel}>
                    <span className={styles.legendDot} style={{ backgroundColor: '#FACC15' }}></span>
                    الأهالي
                  </div>
                  <span className={styles.legendValue}>{parentPercentage}% ({overview.users.parentsTotal})</span>
                </div>

                <div className={styles.legendItem}>
                  <div className={styles.legendLabel}>
                    <span className={styles.legendDot} style={{ backgroundColor: '#0D9488' }}></span>
                    الأطفال
                  </div>
                  <span className={styles.legendValue}>{childPercentage}% ({totalChildren})</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. كارت الدعم الفني وتذاكر الدعم المباشرة (محاذية مع نهاية كارت مستويات الكلام) */}
          <div className={`${styles.chartCard} ${styles.detailCardSupport}`}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle} style={{ color: '#D97706' }}>
                <MessageSquare size={20} />
                حالة تذاكر الدعم الفني
              </h3>
            </div>
            
            <div className={styles.supportList}>
              <div className={styles.supportItem}>
                <span className={styles.supportLabel}>تذاكر غير مقروءة</span>
                <div className={styles.supportProgress}>
                  <div className={styles.supportBar}>
                    <div 
                      className={styles.supportBarFill} 
                      style={{ 
                        width: animate ? `${overview.support.ticketsTotal > 0 ? (overview.support.byStatus.unread / overview.support.ticketsTotal) * 100 : 0}%` : '0%', 
                        backgroundColor: '#3B82F6' 
                      }}
                    ></div>
                  </div>
                  <span className={styles.supportVal}>{overview.support.byStatus.unread}</span>
                </div>
              </div>

              <div className={styles.supportItem}>
                <span className={styles.supportLabel}>قيد المعالجة</span>
                <div className={styles.supportProgress}>
                  <div className={styles.supportBar}>
                    <div 
                      className={styles.supportBarFill} 
                      style={{ 
                        width: animate ? `${overview.support.ticketsTotal > 0 ? (overview.support.byStatus.inProgress / overview.support.ticketsTotal) * 100 : 0}%` : '0%', 
                        backgroundColor: '#F59E0B' 
                      }}
                    ></div>
                  </div>
                  <span className={styles.supportVal}>{overview.support.byStatus.inProgress}</span>
                </div>
              </div>

              <div className={styles.supportItem}>
                <span className={styles.supportLabel}>المحلولة</span>
                <div className={styles.supportProgress}>
                  <div className={styles.supportBar}>
                    <div 
                      className={styles.supportBarFill} 
                      style={{ 
                        width: animate ? `${overview.support.ticketsTotal > 0 ? (overview.support.byStatus.resolved / overview.support.ticketsTotal) * 100 : 0}%` : '0%', 
                        backgroundColor: '#10B981' 
                      }}
                    ></div>
                  </div>
                  <span className={styles.supportVal}>{overview.support.byStatus.resolved}</span>
                </div>
              </div>

              <div className={styles.supportItem}>
                <span className={styles.supportLabel}>المغلقة نهائياً</span>
                <div className={styles.supportProgress}>
                  <div className={styles.supportBar}>
                    <div 
                      className={styles.supportBarFill} 
                      style={{ 
                        width: animate ? `${overview.support.ticketsTotal > 0 ? (overview.support.byStatus.closed / overview.support.ticketsTotal) * 100 : 0}%` : '0%', 
                        backgroundColor: '#6B7280' 
                      }}
                    ></div>
                  </div>
                  <span className={styles.supportVal}>{overview.support.byStatus.closed}</span>
                </div>
              </div>

              <div className={styles.metadataGrid}>
                <div className={styles.metadataItem}>
                  بانتظار رد الأدمن
                  <span className={styles.metadataVal} style={{ color: '#EF4444' }}>
                    {overview.support.awaitingAdminAction}
                  </span>
                </div>
                <div className={styles.metadataItem}>
                  تم حلها بواسطة الأدمن
                  <span className={styles.metadataVal} style={{ color: '#10B981' }}>
                    {overview.support.handledByAdmin}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ================= قسم مخرجات وتفاصيل الجلسات الممتد على كامل عرض الصفحة ================= */}
      <div className={styles.fullWidthSection}>
        <div className={`${styles.detailCard} ${styles.detailCardTherapy}`}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle} style={{ color: '#059669' }}>
              <Activity size={20} />
              تفاصيل ومخرجات جلسات العلاج
            </h3>
          </div>
          
          <div className={styles.sessionGrid}>
            {/* عرض حالات الجلسات المفعلة (المجدولة، قيد التنفيذ، والمكتملة) */}
            <div className={styles.sessionItemContainer}>
              <div className={styles.sessionItem}>
                <div className={styles.sessionInfoLeft}>
                  <div className={styles.sessionIcon} style={{ backgroundColor: '#6B7280' }}>
                    <Clock size={16} />
                  </div>
                  <div className={styles.sessionDetails}>
                    <span className={styles.sessionName}>مجدولة (Scheduled)</span>
                  </div>
                </div>
                <span className={styles.sessionVal}>{scheduledSessions}</span>
              </div>

              <div className={styles.sessionItem}>
                <div className={styles.sessionInfoLeft}>
                  <div className={styles.sessionIcon} style={{ backgroundColor: '#3B82F6' }}>
                    <Clock size={16} />
                  </div>
                  <div className={styles.sessionDetails}>
                    <span className={styles.sessionName}>قيد التنفيذ (In Progress)</span>
                  </div>
                </div>
                <span className={styles.sessionVal}>{inProgressSessions}</span>
              </div>

              <div className={styles.sessionItem}>
                <div className={styles.sessionInfoLeft}>
                  <div className={styles.sessionIcon} style={{ backgroundColor: '#10B981' }}>
                    <CheckCircle size={16} />
                  </div>
                  <div className={styles.sessionDetails}>
                    <span className={styles.sessionName}>مكتملة (Completed)</span>
                  </div>
                </div>
                <span className={styles.sessionVal}>{completedSessions}</span>
              </div>
            </div>

            {/* شبكة البيانات الإحصائية الإضافية للجلسات الممتدة على 5 أعمدة */}
            <div className={styles.metadataGridTherapy}>
              <div className={styles.metadataItem}>
                إجمالي التمارين
                <span className={styles.metadataVal} style={{ color: '#8B5CF6' }}>
                  {therapy?.activitiesTotal ?? 0}
                </span>
              </div>
              <div className={styles.metadataItem}>
                إجمالي الجلسات
                <span className={styles.metadataVal} style={{ color: '#10B981' }}>
                  {therapy?.sessionsTotal ?? 0}
                </span>
              </div>
              <div className={styles.metadataItem}>
                محاولات النطق
                <span className={styles.metadataVal} style={{ color: '#F59E0B' }}>
                  {therapy?.sessionAttemptsTotal ?? 0}
                </span>
              </div>
              <div className={styles.metadataItem}>
                ملخصات الجلسات
                <span className={styles.metadataVal} style={{ color: '#EC4899' }}>
                  {therapy?.sessionSummariesTotal ?? 0}
                </span>
              </div>
              <div className={styles.metadataItem}>
                تفريغات النصوص
                <span className={styles.metadataVal} style={{ color: '#10B981' }}>
                  {therapy?.attemptTranscriptionsTotal ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminOverview;

