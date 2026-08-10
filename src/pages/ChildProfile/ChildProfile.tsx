import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Edit2, Link as LinkIcon, History, Activity, Trash2, UserCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
  fetchChildProfile, 
  clearProfileData, 
  fetchSpeechHistory, 
  fetchChildNotes, 
  deleteChildNote,
  fetchChildActivities
} from '../../store/slices/childProfileSlice';
import styles from './ChildProfile.module.css';
import { useModal } from '../../context/ModalContext';
import SpeechHistoryModal from '../../components/Modals/SpeechHistoryModal/SpeechHistoryModal';
import UpdateSpeechLevelModal from '../../components/Modals/UpdateSpeechLevelModal/UpdateSpeechLevelModal';
import DeleteConfirmModal from "../../components/Modals/DeleteConfirmModal/DeleteConfirmModal";
import ActivityModal from '../../components/Modals/ActivityModal/ActivityModal';
import NoteModal from '../../components/Modals/NoteModal/NoteModal'; // تم استيراد مودال الملاحظات
import { deleteActivityApi, type ActivityItem, type DoctorNote } from '../../api/doctorApi';
import {
  getChildSessionHistoryApi,
  type ChildSessionHistoryItem,
} from '../../api/sessionSummaryApi';

const ChildProfile = () => {
  const { openAssignParentModal, openAddChildModal } = useModal();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // جلب بيانات الطفل، الملاحظات، والأنشطة بالكامل من الريدكس
  const { 
    profileData, 
    isLoading, 
    error, 
    notesData, 
    isNotesLoading, 
    activities, 
    isActivitiesLoading 
  } = useAppSelector((state) => state.childProfile);
  
  const rawRole = useAppSelector((state) => state.auth?.role);
  const isDoctor = rawRole === 'doctor';

  const [allLevels, setAllLevels] = useState<{ id: number; levelName: string }[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isUpdateLevelModalOpen, setIsUpdateLevelModalOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<number | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<ActivityItem | null>(null);
  const [notesPage, setNotesPage] = useState(1);

  // States الخاصة بمودال الملاحظات
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<DoctorNote | null>(null);

  const [sessionHistory, setSessionHistory] = useState<ChildSessionHistoryItem[]>([]);
  const [isLoadingSessionHistory, setIsLoadingSessionHistory] = useState(true);

  // دوال فتح مودال الأنشطة
  const handleOpenAddActivity = () => {
    setActivityToEdit(null);
    setIsActivityModalOpen(true);
  };

  const handleOpenEditActivity = (activity: ActivityItem) => {
    setActivityToEdit(activity);
    setIsActivityModalOpen(true);
  };

  // دوال فتح مودال الملاحظات
  const handleOpenAddNote = () => {
    setNoteToEdit(null);
    setIsNoteModalOpen(true);
  };

  const handleOpenEditNote = (note: DoctorNote) => {
    setNoteToEdit(note);
    setIsNoteModalOpen(true);
  };

  const fetchSessionHistory = useCallback(async () => {
    if (!id) return;
    setIsLoadingSessionHistory(true);
    try {
      const rows = await getChildSessionHistoryApi(Number(id));
      setSessionHistory(rows);
    } catch (error) {
      console.error('خطأ في جلب سجل الجلسات:', error);
      setSessionHistory([]);
    } finally {
      setIsLoadingSessionHistory(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      dispatch(fetchChildProfile(Number(id)));
      dispatch(fetchChildActivities(Number(id)));
      fetchSessionHistory();
    }
    return () => {
      dispatch(clearProfileData());
    };
  }, [dispatch, id, fetchSessionHistory]);

  useEffect(() => {
    if (id) {
      dispatch(fetchChildNotes({ childId: Number(id), pageNumber: notesPage, pageSize: 5 }));
    }
  }, [dispatch, id, notesPage]);

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

      {/* قسم كروت المعلومات العلوية (بيانات الطفل بعرض أكبر، وبيانات ولي الأمر ومستوى الكلام تحت بعض في العمود الثاني بنفس الارتفاع الكلي) */}
      {isDoctor ? (
        <div className={styles.topProfileSection}>
          {/* العمود الأول (أعرض): بيانات الطفل */}
          <div className={styles.childInfoCol}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>بيانات الطفل</h2>
                <button className={styles.primaryBtn} onClick={() => openAddChildModal({ ...profileData, id: Number(id) })}>
                  <Edit2 size={16} /> تعديل
                </button>
              </div>
              <div className={styles.childInfoGrid}>
                <div className={styles.infoItem}><span className={styles.infoLabel}>الاسم بالكامل</span><span className={styles.infoValue}>{profileData.fullName}</span></div>
                <div className={styles.infoItem}><span className={styles.infoLabel}>العمر</span><span className={styles.infoValue}>{profileData.age} سنوات</span></div>
                <div className={styles.infoItem}><span className={styles.infoLabel}>تاريخ الميلاد</span><span className={styles.infoValue}>{profileData.dateOfBirth}</span></div>
                <div className={styles.infoItem}><span className={styles.infoLabel}>النوع</span><span className={styles.infoValue}>{profileData.gender === 0 ? 'ذكر' : 'أنثى'}</span></div>
                <div className={styles.infoItem}><span className={styles.infoLabel}>تاريخ بدء العلاج</span><span className={styles.infoValue}>{profileData.therapyStartDate}</span></div>
              </div>
            </div>
          </div>

          {/* العمود الثاني: كارت ولي الأمر وكارت مستوى الكلام تحت بعض بنفس الارتفاع الكلي */}
          <div className={styles.stackedInfoCol}>
            {/* كارت 2: ولي الأمر */}
            <div className={`${styles.card} ${styles.parentCardCustom}`}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>بيانات ولي الأمر</h2>
                <button className={styles.primaryBtn} onClick={() => openAssignParentModal(Number(id))}>
                  <LinkIcon size={16} /> {profileData.parentFullName ? 'تغيير' : 'ربط بولي أمر'}
                </button>
              </div>

              {profileData.parentFullName ? (
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>اسم ولي الأمر</span>
                    <span className={styles.infoValue}>{profileData.parentFullName}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>البريد الإلكتروني</span>
                    <span className={styles.infoValue}>{profileData.parentEmail}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>رقم الهاتف</span>
                    <span className={styles.infoValue}>{profileData.parentPhoneNumber}</span>
                  </div>
                </div>
              ) : (
                <div className={styles.emptyParentState}>
                  <span>لم يتم ربط الطفل بولي أمر حتى الآن</span>
                </div>
              )}
            </div>

            {/* كارت 3: مستوى الكلام الحالي */}
            <div className={`${styles.card} ${styles.speechLevelCardCustom}`}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>مستوى الكلام الحالي</h2>
                <button className={styles.primaryBtn} onClick={() => setIsUpdateLevelModalOpen(true)}>
                  <Edit2 size={16} /> تحديث
                </button>
              </div>

              <div className={styles.speechLevelContent}>
                <div className={styles.levelInfo}>
                  <span className={styles.levelLabel}>المستوى الحالي:</span>
                  <span className={styles.levelValue}>
                    {profileData.speechLevel?.levelName || 'غير محدد'}
                  </span>
                </div>
                <button className={styles.secondaryBtn} onClick={handleOpenHistory}>
                  <History size={16} /> السجل
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* واجهة ولي الأمر */
        <div className={styles.topProfileSection}>
          {/* العمود الأول (أعرض): بيانات الطفل */}
          <div className={styles.childInfoCol}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>بيانات الطفل</h2>
              </div>
              <div className={styles.childInfoGrid}>
                <div className={styles.infoItem}><span className={styles.infoLabel}>الاسم بالكامل</span><span className={styles.infoValue}>{profileData.fullName}</span></div>
                <div className={styles.infoItem}><span className={styles.infoLabel}>العمر</span><span className={styles.infoValue}>{profileData.age} سنوات</span></div>
                <div className={styles.infoItem}><span className={styles.infoLabel}>تاريخ الميلاد</span><span className={styles.infoValue}>{profileData.dateOfBirth}</span></div>
                <div className={styles.infoItem}><span className={styles.infoLabel}>النوع</span><span className={styles.infoValue}>{profileData.gender === 0 ? 'ذكر' : 'أنثى'}</span></div>
                <div className={styles.infoItem}><span className={styles.infoLabel}>تاريخ بدء العلاج</span><span className={styles.infoValue}>{profileData.therapyStartDate}</span></div>
              </div>
            </div>
          </div>

          {/* العمود الثاني: الطبيب المعالج ومستوى الكلام تحت بعض بنفس الارتفاع والترتيب */}
          <div className={styles.stackedInfoCol}>
            <div className={`${styles.card} ${styles.parentCardCustom}`}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <UserCheck size={20} className="inline-block ml-2 text-[#581C87]" />
                  الطبيب المعالج
                </h2>
              </div>
              {profileData.doctorFullName ? (
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}><span className={styles.infoLabel}>اسم الطبيب</span><span className={styles.infoValue}>{profileData.doctorFullName}</span></div>
                  <div className={styles.infoItem}><span className={styles.infoLabel}>البريد الإلكتروني</span><span className={styles.infoValue}>{profileData.doctorEmail || 'غير متوفر'}</span></div>
                  <div className={styles.infoItem}><span className={styles.infoLabel}>رقم الهاتف</span><span className={styles.infoValue}>{profileData.doctorPhoneNumber || 'غير متوفر'}</span></div>
                </div>
              ) : (
                <div className={styles.emptyParentState}>
                  <span>لم يتم تعيين طبيب معالج حتى الآن</span>
                </div>
              )}
            </div>

            {/* كارت مستوى الكلام الحالي لولي الأمر بشريط التقدم (Progress Bar) الحقيقي من الـ API */}
            {(() => {
              const speechLevelObj = profileData.speechLevel;
              const rawLevelNum = (profileData as any).speechLevelNumber || (profileData as any).speechLevelId || speechLevelObj?.id;
              const levelName = (profileData as any).speechLevelName || speechLevelObj?.levelName;
              
              let levelNum = 0;
              const hasLevel = Boolean(rawLevelNum || levelName);

              if (hasLevel) {
                const targetId = Number(rawLevelNum);
                if ((profileData as any).speechLevelNumber && (profileData as any).speechLevelNumber >= 1 && (profileData as any).speechLevelNumber <= 10) {
                  levelNum = Number((profileData as any).speechLevelNumber);
                } 
                else if (allLevels.length > 0 && targetId) {
                  const idx = allLevels.findIndex((l) => l.id === targetId);
                  if (idx !== -1) {
                    levelNum = idx + 1; // الترتيب الحقيقي من 1 إلى 10
                  } else if (targetId >= 1 && targetId <= 10) {
                    levelNum = targetId;
                  }
                } 
                else if (targetId >= 1 && targetId <= 10) {
                  levelNum = targetId;
                }
              }

              const percentage = levelNum > 0 ? Math.min(Math.max((levelNum / 10) * 100, 0), 100) : 0;

              return (
                <div className={`${styles.card} ${styles.speechLevelCardCustom}`}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>مستوى الكلام الحالي</h2>
                  </div>

                  <div className={styles.progressSection}>
                    <div className={styles.progressHeader}>
                      <span className={styles.levelNameText}>
                        {levelName || (levelNum > 0 ? `المستوى ${levelNum}` : 'لم يتم تحديد مستوى')}
                      </span>
                      <span className={styles.progressBadge}>
                        {levelNum > 0 ? `المستوى ${levelNum} من 10` : 'لم يتم تحديد مستوى'}
                      </span>
                    </div>
                    <div className={styles.progressBarTrack}>
                      <div 
                        className={styles.progressBarFill} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* قسم جدول الأنشطة الخاصة بالطفل */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <Activity size={24} style={{ color: '#581C87' }} />
            الأنشطة المطلوبة من الطفل
          </h2>
          {isDoctor && (
            <button onClick={handleOpenAddActivity} className={styles.primaryBtn}>
              إضافة نشاط
            </button>
          )}
        </div>

        {isActivitiesLoading ? (
          <div className="text-center py-8 text-[#6C34AF] font-bold">جاري تحميل الأنشطة...</div>
        ) : activities && activities.length > 0 ? (
          <div className="flex flex-col gap-3 mt-2">
            {activities.map((act) => (
              isDoctor ? (
                /* واجهة الدكتور: محتوى النشاط وأسفله الأهداف، وعلى الشمال زراير التعديل والحذف */
                <div 
                  key={act.id} 
                  className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center p-4 bg-[#F8F7FF] rounded-xl gap-4"
                >
                  <div className="flex flex-col gap-2 w-full sm:w-auto">
                    <span className="font-extrabold text-[#1E1B4B] text-xl">
                      {act.content}
                    </span>
                    <div className="flex flex-wrap gap-2 sm:gap-3 text-sm font-bold">
                      <span className="bg-[#EBE5F7] text-[#581C87] px-3 py-1 rounded-md whitespace-nowrap">
                        الهدف: {getActivityTargetText(act.activityTarget)}
                      </span>
                      <span className="bg-[#EBE5F7] text-[#581C87] px-3 py-1 rounded-md whitespace-nowrap">
                        المدة: {act.estimatedDurationMinutes} دقائق
                      </span>
                      <span
                        className={`px-3 py-1 rounded-md whitespace-nowrap ${
                          act.canMakeSession === true
                            ? 'bg-[#DCFCE7] text-[#166534]'
                            : 'bg-[#FEE2E2] text-[#991B1B]'
                        }`}
                      >
                        {act.canMakeSession === true ? 'متاح لجلسة' : 'غير متاح لجلسة'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto justify-end pt-3 sm:pt-0 mt-1 sm:mt-0">
                    <button 
                      onClick={() => handleOpenEditActivity(act)}
                      className={styles.itemEditBtn}
                      title="تعديل النشاط"
                    >
                      <Edit2 size={18} strokeWidth={2.5} />
                    </button>
                    
                    <button 
                      onClick={() => setActivityToDelete(act.id)}
                      className={styles.itemDeleteBtn}
                      title="حذف النشاط"
                    >
                      <Trash2 size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ) : (
                /* واجهة ولي الأمر: اسم النشاط ع اليمين، والهدف والمدة ع الشمال ف نفس السطر ومكبرين لتوحيد التوازن */
                <div 
                  key={act.id} 
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-[#F8F7FF] rounded-xl gap-4"
                >
                  <span className="font-extrabold text-[#1E1B4B] text-xl">
                    {act.content}
                  </span>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm sm:text-base font-extrabold flex-shrink-0">
                    <span className="bg-[#EBE5F7] text-[#581C87] px-3.5 py-1.5 rounded-lg whitespace-nowrap">
                      الهدف: {getActivityTargetText(act.activityTarget)}
                    </span>
                    <span className="bg-[#EBE5F7] text-[#581C87] px-3.5 py-1.5 rounded-lg whitespace-nowrap">
                      المدة: {act.estimatedDurationMinutes} دقائق
                    </span>
                  </div>
                </div>
              )
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-[#581C87] font-bold bg-[#F4F0FF] rounded-xl border-2 border-dashed border-[#581C87]">
            لا توجد أنشطة مضافة لهذا الطفل حالياً.
          </div>
        )}
      </div>

      {/* سجل الجلسات — ملخصات محفوظة يمكن فتحها في أي وقت */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <History size={22} />
            سجل الجلسات
          </h2>
        </div>
        <div className="flex flex-col gap-3 mt-4">
          {isLoadingSessionHistory ? (
            <div className="text-center py-4 text-[#6C34AF] font-bold">جاري تحميل سجل الجلسات...</div>
          ) : sessionHistory.length > 0 ? (
            sessionHistory.map((session) => (
              <button
                key={session.sessionId}
                type="button"
                onClick={() => navigate(`/session/${session.sessionId}/summary`)}
                className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center p-4 bg-[#F8F7FF] rounded-xl gap-3 text-right hover:bg-[#EFEAFF] transition-colors border-2 border-transparent hover:border-[#C4B5FD]"
              >
                <div className="flex flex-col gap-2 w-full sm:w-auto">
                  <span className="font-extrabold text-[#1E1B4B] text-lg">
                    {session.sessionTitle || session.prompt || `جلسة #${session.sessionId}`}
                  </span>
                  <div className="flex flex-wrap gap-2 text-sm font-bold">
                    {session.prompt && (
                      <span className="bg-[#EBE5F7] text-[#581C87] px-3 py-1 rounded-md">
                        الهدف: {session.prompt}
                      </span>
                    )}
                    {session.endedAt && (
                      <span className="bg-[#EBE5F7] text-[#581C87] px-3 py-1 rounded-md">
                        {new Date(session.endedAt).toLocaleDateString('ar-EG')}
                      </span>
                    )}
                    {session.totalAttempts != null && (
                      <span className="bg-[#EBE5F7] text-[#581C87] px-3 py-1 rounded-md">
                        محاولات: {session.totalAttempts}
                      </span>
                    )}
                    <span
                      className={`px-3 py-1 rounded-md ${
                        session.hasSummary
                          ? 'bg-[#DCFCE7] text-[#166534]'
                          : 'bg-[#FEF3C7] text-[#92400E]'
                      }`}
                    >
                      {session.hasSummary ? 'ملخص محفوظ' : 'بانتظار الملخص'}
                    </span>
                  </div>
                  {session.outcomeLabel && (
                    <p className="text-sm font-semibold text-[#4C1D95] m-0">{session.outcomeLabel}</p>
                  )}
                </div>
                <span className="text-[#581C87] font-extrabold whitespace-nowrap">عرض الملخص ←</span>
              </button>
            ))
          ) : (
            <div className="text-center py-8 text-[#581C87] font-bold bg-[#F4F0FF] rounded-xl border-2 border-dashed border-[#581C87]">
              لا توجد جلسات مكتملة في السجل بعد.
            </div>
          )}
        </div>
      </div>

      {/* قسم ملاحظات الطبيب */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            ملاحظات الدكتور الموجهة للأهل
          </h2>
          {/* زر إضافة ملاحظة يظهر للدكتور فقط */}
          {isDoctor && (
            <button onClick={handleOpenAddNote} className={styles.primaryBtn}>
              إضافة ملاحظة
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3 mt-2">
          {isNotesLoading ? (
            <div className="text-center py-4 text-[#6C34AF] font-bold">جاري تحميل الملاحظات...</div>
          ) : notesData && notesData.items && notesData.items.length > 0 ? (
            <>
              {notesData.items.map((note) => (
                isDoctor ? (
                  /* واجهة الدكتور: العنوان والجريدة وزراير التعديل والحذف */
                  <div 
                    key={note.id} 
                    className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center p-4 bg-[#F8F7FF] rounded-xl gap-4"
                  >
                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-extrabold text-[#1E1B4B] text-xl">
                          {note.title}
                        </span>
                        {note.createdAt && (
                          <span className="text-xs font-bold text-[#581C87] bg-[#EBE5F7] px-2.5 py-1 rounded-md">
                            {note.createdAt.split('T')[0]}
                          </span>
                        )}
                      </div>
                      <p className="text-base font-bold text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {note.description}
                      </p>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto justify-end pt-3 sm:pt-0 mt-1 sm:mt-0">
                      <button 
                        onClick={() => handleOpenEditNote(note)}
                        className={styles.itemEditBtn}
                        title="تعديل الملاحظة"
                      >
                        <Edit2 size={18} strokeWidth={2.5} />
                      </button>
                      <button 
                        onClick={() => setNoteToDelete(note.id)}
                        className={styles.itemDeleteBtn}
                        title="حذف الملاحظة"
                      >
                        <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* واجهة ولي الأمر: العنوان ع اليمين والتاريخ ع الشمال ف نفس السطر ومكبر */
                  <div 
                    key={note.id} 
                    className="flex flex-col gap-3 p-4 bg-[#F8F7FF] rounded-xl"
                  >
                    <div className="flex justify-between items-center gap-4 flex-wrap w-full">
                      <span className="font-extrabold text-[#1E1B4B] text-xl">
                        {note.title}
                      </span>
                      {note.createdAt && (
                        <span className="text-sm sm:text-base font-extrabold text-[#581C87] bg-[#EBE5F7] px-3.5 py-1.5 rounded-lg flex-shrink-0">
                          {note.createdAt.split('T')[0]}
                        </span>
                      )}
                    </div>
                    <p className="text-base font-bold text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {note.description}
                    </p>
                  </div>
                )
              ))}

              {/* عناصر التحكم في الصفحات Pagination - يختفي إذا كان إجمالي الصفحات 1 أو أقل */}
              {notesData && (notesData.totalPages || 1) > 1 && (
                <div className={styles.pagination}>
                  <div className={styles.pageInfo}>
                    صفحة <strong className="text-[#1E1B4B]">{notesData.pageNumber || 1}</strong> من {notesData.totalPages || 1}
                  </div>
                  <div className={styles.pageControls}>
                    <button
                      className={styles.pageBtn}
                      disabled={!notesData.hasPreviousPage}
                      onClick={() => setNotesPage((p) => Math.max(1, p - 1))}
                    >
                      السابق
                      <ChevronRight size={16} />
                    </button>
                    <button
                      className={styles.pageBtn}
                      disabled={!notesData.hasNextPage}
                      onClick={() => setNotesPage((p) => p + 1)}
                    >
                      التالي
                      <ChevronLeft size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-[#581C87] font-bold bg-[#F4F0FF] rounded-xl border-2 border-dashed border-[#581C87]">
              لا توجد ملاحظات مضافة لهذا الطفل حالياً.
            </div>
          )}
        </div>
      </div>

      {/* المودالز - تظهر فقط للدكتور لحماية إضافية للواجهة */}
      {isDoctor && (
        <>
          <SpeechHistoryModal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} />
          <UpdateSpeechLevelModal isOpen={isUpdateLevelModalOpen} onClose={() => setIsUpdateLevelModalOpen(false)} childId={Number(id)} profileData={profileData} />
          
          <DeleteConfirmModal 
            isOpen={activityToDelete !== null}
            onClose={() => setActivityToDelete(null)}
            onConfirm={async () => {
              if (activityToDelete !== null) {
                await deleteActivityApi(activityToDelete);
                dispatch(fetchChildActivities(Number(id)));
              }
            }}
            title="تأكيد الحذف"
            message="هل أنت متأكد من رغبتك في حذف هذا النشاط من السجل؟"
            deleteBtnText="نعم، احذف النشاط"
          />

          <DeleteConfirmModal 
            isOpen={noteToDelete !== null}
            onClose={() => setNoteToDelete(null)}
            onConfirm={async () => {
              if (noteToDelete !== null) {
                await dispatch(deleteChildNote(noteToDelete));
                setNoteToDelete(null);
                const currentItemsCount = notesData?.items?.length || 0;
                if (currentItemsCount <= 1 && notesPage > 1) {
                  setNotesPage((p) => Math.max(1, p - 1));
                } else {
                  dispatch(fetchChildNotes({ childId: Number(id), pageNumber: notesPage, pageSize: 5 }));
                }
              }
            }}
            title="تأكيد حذف الملاحظة"
            message="هل أنت متأكد من رغبتك في حذف هذه الملاحظة؟"
            deleteBtnText="نعم، احذف الملاحظة"
          />

          <ActivityModal
            isOpen={isActivityModalOpen}
            onClose={() => setIsActivityModalOpen(false)}
            childId={Number(id)}
            activityToEdit={activityToEdit}
            onSuccess={() => {
              dispatch(fetchChildActivities(Number(id)));
            }}
          />

          {/* إضافة مودال الملاحظات */}
          <NoteModal
            isOpen={isNoteModalOpen}
            onClose={() => setIsNoteModalOpen(false)}
            childId={Number(id)}
            noteToEdit={noteToEdit}
            onSuccess={() => {
              // إعادة تحميل الملاحظات بعد الإضافة أو التعديل بنجاح
              dispatch(fetchChildNotes({ childId: Number(id), pageNumber: notesPage, pageSize: 5 }));
            }}
          />
        </>
      )}

    </div>
  );
};

export default ChildProfile;