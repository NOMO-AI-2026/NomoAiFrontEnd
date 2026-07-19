import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Edit2, Link as LinkIcon, History, Activity } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchChildProfile, clearProfileData, fetchSpeechHistory } from '../../store/slices/childProfileSlice';
import styles from './ChildProfile.module.css';
import { useModal } from '../../context/ModalContext';
import SpeechHistoryModal from '../../components/Modals/SpeechHistoryModal/SpeechHistoryModal';
import UpdateSpeechLevelModal from '../../components/Modals/UpdateSpeechLevelModal/UpdateSpeechLevelModal'; 
const ChildProfile = () => {
  const { openAssignParentModal } = useModal();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { profileData, isLoading, error } = useAppSelector((state) => state.childProfile);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isUpdateLevelModalOpen, setIsUpdateLevelModalOpen] = useState(false); 
  useEffect(() => {
    if (id) {
      dispatch(fetchChildProfile(Number(id)));
    }
    return () => {
      dispatch(clearProfileData());
    };
  }, [dispatch, id]);

  const handleOpenHistory = () => {
    if (id) {
      dispatch(fetchSpeechHistory({ childId: Number(id) }));
      setIsHistoryModalOpen(true);
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
        <div className={styles.cardsStack}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>بيانات الطفل</h2>
              <button className={styles.secondaryBtn}>
                <Edit2 size={18} />
                تعديل
              </button>
            </div>
            
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>الاسم بالكامل</span>
                <span className={styles.infoValue}>{profileData.fullName}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>العمر</span>
                <span className={styles.infoValue}>{profileData.age} سنوات</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>تاريخ الميلاد</span>
                <span className={styles.infoValue}>{profileData.dateOfBirth}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>النوع</span>
                <span className={styles.infoValue}>{profileData.gender === 0 ? 'ذكر' : 'أنثى'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>تاريخ بدء العلاج</span>
                <span className={styles.infoValue}>{profileData.therapyStartDate}</span>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>
                <Activity size={24} />
                مستوى الكلام الحالي
              </h2>
              <button className={styles.secondaryBtn} onClick={handleOpenHistory}>
                <History size={18} />
                سجل المستويات
              </button>
            </div>
            <div className="flex flex-col gap-4 items-start">
              <span className={styles.stageBadge}>
                {profileData.speechLevel ? profileData.speechLevel.levelName : 'لم يتم تحديد مستوى'}
              </span>
              <button className={styles.primaryBtn} onClick={() => setIsUpdateLevelModalOpen(true)}>
                <Edit2 size={18} />
                تحديث المستوى
              </button>
            </div>
          </div>
        </div>

        <div className={styles.cardsStack}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>بيانات ولي الأمر</h2>
            </div>
            
            {profileData.parentFullName ? (
              <div className="flex flex-col gap-4">
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>الاسم</span>
                  <span className={styles.infoValue}>{profileData.parentFullName}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>البريد الإلكتروني</span>
                  <span className={styles.infoValue}>{profileData.parentEmail}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>رقم الهاتف</span>
                  <span className={styles.infoValue}>{profileData.parentPhoneNumber || 'غير مسجل'}</span>
                </div>
                <button className={styles.secondaryBtn}>
                  تغيير ولي الأمر
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center gap-4 py-4">
                <div className="text-gray-400">
                  <LinkIcon size={48} />
                </div>
                <p className="font-bold text-[#1E1B4B]">لم يتم ربط الطفل بولي أمر حتى الآن.</p>
                <button 
                  onClick={() => openAssignParentModal(Number(id))} 
                  className={styles.primaryBtn} 
                  style={{ width: '100%' }}
                >
                  <LinkIcon size={18} />
                  ربط بولي أمر
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <SpeechHistoryModal 
        isOpen={isHistoryModalOpen} 
        onClose={() => setIsHistoryModalOpen(false)} 
      />
      <UpdateSpeechLevelModal
        isOpen={isUpdateLevelModalOpen}
        onClose={() => setIsUpdateLevelModalOpen(false)}
        childId={Number(id)}
        profileData={profileData}
      />
    </div>
  );
};

export default ChildProfile;