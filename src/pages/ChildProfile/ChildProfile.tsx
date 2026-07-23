import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Edit2, Link as LinkIcon, History, Activity, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchChildProfile, clearProfileData, fetchSpeechHistory } from '../../store/slices/childProfileSlice';
import styles from './ChildProfile.module.css';
import { useModal } from '../../context/ModalContext';
import SpeechHistoryModal from '../../components/Modals/SpeechHistoryModal/SpeechHistoryModal';
import UpdateSpeechLevelModal from '../../components/Modals/UpdateSpeechLevelModal/UpdateSpeechLevelModal';
import DeleteConfirmModal from "../../components/Modals/DeleteConfirmModal/DeleteConfirmModal";
import ActivityModal from '../../components/Modals/ActivityModal/ActivityModal';
import { getChildActivitiesApi, deleteActivityApi, type ActivityItem } from '../../api/doctorApi';

const ChildProfile = () => {
  const { openAssignParentModal, openAddChildModal } = useModal();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { profileData, isLoading, error } = useAppSelector((state) => state.childProfile);
  
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isUpdateLevelModalOpen, setIsUpdateLevelModalOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<number | null>(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<ActivityItem | null>(null);

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);

  const handleOpenAddActivity = () => {
    setActivityToEdit(null);
    setIsActivityModalOpen(true);
  };

  const handleOpenEditActivity = (activity: ActivityItem) => {
    setActivityToEdit(activity);
    setIsActivityModalOpen(true);
  };

  // تم استخدام useCallback لمنع إعادة بناء الدالة وتفادي تحذيرات الـ useEffect
  const fetchActivities = useCallback(async () => {
    if (!id) return;
    setIsLoadingActivities(true);
    try {
      const data = await getChildActivitiesApi(Number(id));
      const activitiesList = Array.isArray(data) ? data : (data?.value || []);
      setActivities(activitiesList); 
    } catch (error) {
      console.error("خطأ في جلب الأنشطة:", error);
    } finally {
      setIsLoadingActivities(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      dispatch(fetchChildProfile(Number(id)));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchActivities();
    }
    return () => {
      dispatch(clearProfileData());
    };
  }, [dispatch, id, fetchActivities]);

  const handleOpenHistory = () => {
    if (id) {
      dispatch(fetchSpeechHistory({ childId: Number(id) }));
      setIsHistoryModalOpen(true);
    }
  };

  const getActivityTargetText = (targetValue: number) => {
    switch (targetValue) {
      case 0: return 'حرف';
      case 1: return 'كلمة';
      case 2: return 'جملة';
      default: return 'غير محدد';
    }
  };

  if (isLoading) return <div className="p-8 text-center font-bold text-[#6B21A8]">جاري تحميل بيانات الطفل...</div>;
  if (error) return <div className="p-8 text-center font-bold text-red-500">{error}</div>;
  if (!profileData) return <div className="p-8 text-center">لا توجد بيانات لعرضها.</div>;

  return (
    <div className={styles.profileContainer} dir="rtl">
      <div className={styles.pageHeader}>
        <div className={styles.titleWrapper}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <ChevronRight size={24} />
          </button>
          <h1 className={styles.profileTitle}>الملف الشخصي</h1>
        </div>
      </div>

      <div className={styles.gridContainer}>
        {/* بيانات الطفل */}
        <div className={styles.cardsStack}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>بيانات الطفل</h2>
              <button className={styles.primaryBtn} onClick={() => openAddChildModal({ ...profileData, id: Number(id) })}>
                <Edit2 size={18} /> تعديل
              </button>
            </div>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}><span className={styles.infoLabel}>الاسم بالكامل</span><span className={styles.infoValue}>{profileData.fullName}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>العمر</span><span className={styles.infoValue}>{profileData.age} سنوات</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>تاريخ الميلاد</span><span className={styles.infoValue}>{profileData.dateOfBirth}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>النوع</span><span className={styles.infoValue}>{profileData.gender === 0 ? 'ذكر' : 'أنثى'}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>تاريخ بدء العلاج</span><span className={styles.infoValue}>{profileData.therapyStartDate}</span></div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}><Activity size={24} />مستوى الكلام الحالي</h2>
              <button className={styles.secondaryBtn} onClick={handleOpenHistory}><History size={18} />سجل المستويات</button>
            </div>
            <div className="flex flex-col gap-4 items-start">
              <span className={styles.stageBadge}>{profileData.speechLevel ? profileData.speechLevel.levelName : 'لم يتم تحديد مستوى'}</span>
              <button className={styles.primaryBtn} onClick={() => setIsUpdateLevelModalOpen(true)}><Edit2 size={18} />تحديث المستوى</button>
            </div>
          </div>
        </div>

        {/* بيانات ولي الأمر */}
        <div className={styles.cardsStack}>
          <div className={styles.card}>
            <div className={styles.cardHeader}><h2 className={styles.cardTitle}>بيانات ولي الأمر</h2></div>
            {profileData.parentFullName ? (
              <div className="flex flex-col gap-4">
                <div className={styles.infoItem}><span className={styles.infoLabel}>الاسم</span><span className={styles.infoValue}>{profileData.parentFullName}</span></div>
                <div className={styles.infoItem}><span className={styles.infoLabel}>البريد الإلكتروني</span><span className={styles.infoValue}>{profileData.parentEmail}</span></div>
                <div className={styles.infoItem}><span className={styles.infoLabel}>رقم الهاتف</span><span className={styles.infoValue}>{profileData.parentPhoneNumber || 'غير مسجل'}</span></div>
                <button onClick={() => openAssignParentModal(Number(id))} className={styles.primaryBtn}>تغيير ولي الأمر</button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center gap-4 py-4">
                <div className="text-gray-400"><LinkIcon size={48} /></div>
                <p className="font-bold text-[#1E1B4B]">لم يتم ربط الطفل بولي أمر حتى الآن.</p>
                <button onClick={() => openAssignParentModal(Number(id))} className={styles.primaryBtn} style={{ width: '100%' }}><LinkIcon size={18} />ربط بولي أمر</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* قسم الأنشطة */}
      <div className={`${styles.card} mt-6`}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>الأنشطة الحالية</h2>
          <button onClick={handleOpenAddActivity} className={styles.primaryBtn}>
            إضافة نشاط
          </button>
        </div>

        <div className="flex flex-col gap-3 mt-4">
          {isLoadingActivities ? (
            <div className="text-center py-4 text-[#6C34AF] font-bold">جاري تحميل الأنشطة...</div>
          ) : activities.length > 0 ? (
            activities.map((activity) => (
              <div 
                key={activity.id} 
                className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center p-4 bg-[#F8F7FF] rounded-xl border-2 border-[#1E1B4B] gap-4 transition hover:shadow-[4px_4px_0px_#1E1B4B]"
              >
                
                <div className="flex flex-col gap-3 w-full sm:w-auto">
                  {/* محتوى النشاط */}
                  <span className="font-extrabold text-[#1E1B4B] text-xl">
                    {activity.content}
                  </span>
                  
                  <div className="flex flex-wrap gap-2 sm:gap-3 text-sm font-bold">
                    <span className="bg-[#EBE5F7] text-[#581C87] px-3 py-1 rounded-md whitespace-nowrap">
                      الهدف: {getActivityTargetText(activity.activityTarget)}
                    </span>
                    <span className="bg-[#EBE5F7] text-[#581C87] px-3 py-1 rounded-md whitespace-nowrap">
                      المدة: {activity.estimatedDurationMinutes} دقائق
                    </span>
                  </div>
                </div>

                {/* زراير الأكشن بستايل متناسق مع Brutalism وبسمك أيقونات واضح */}
                <div className="flex gap-2 w-full sm:w-auto justify-end pt-3 sm:pt-0 mt-1 sm:mt-0">
                  <button 
                    onClick={() => handleOpenEditActivity(activity)}
                    className="flex items-center justify-center p-2 rounded-lg bg-[#FACC15] border-2 border-[#1E1B4B] text-[#1E1B4B] hover:translate-y-[-2px] hover:shadow-[2px_2px_0px_#1E1B4B] transition-all"
                    title="تعديل"
                  >
                    <Edit2 size={18} strokeWidth={2.5} />
                  </button>
                  
                  <button 
                    onClick={() => setActivityToDelete(activity.id)}
                    className="flex items-center justify-center p-2 rounded-lg bg-[#EF4444] border-2 border-[#1E1B4B] text-white hover:translate-y-[-2px] hover:shadow-[2px_2px_0px_#1E1B4B] transition-all"
                    title="حذف"
                  >
                    <Trash2 size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-[#581C87] font-bold bg-[#F4F0FF] rounded-xl border-2 border-dashed border-[#581C87]">
              لا توجد أنشطة مضافة لهذا الطفل حالياً.
            </div>
          )}
        </div>
      </div>

      {/* المودالز */}
      <SpeechHistoryModal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} />
      <UpdateSpeechLevelModal isOpen={isUpdateLevelModalOpen} onClose={() => setIsUpdateLevelModalOpen(false)} childId={Number(id)} profileData={profileData} />
      
      <DeleteConfirmModal 
        isOpen={activityToDelete !== null}
        onClose={() => setActivityToDelete(null)}
        onConfirm={async () => {
          if (activityToDelete !== null) {
            await deleteActivityApi(activityToDelete);
            fetchActivities();
          }
        }}
        title="تأكيد الحذف"
        message="هل أنت متأكد من رغبتك في حذف هذا النشاط من السجل؟"
        deleteBtnText="نعم، احذف النشاط"
      />

      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        childId={Number(id)}
        activityToEdit={activityToEdit}
        onSuccess={() => {
          fetchActivities();
        }}
      />

    </div>
  );
};

export default ChildProfile;