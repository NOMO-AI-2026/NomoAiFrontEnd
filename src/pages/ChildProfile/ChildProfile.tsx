import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Edit2, Link as LinkIcon, History, Activity, Trash2, UserCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchChildProfile, clearProfileData, fetchSpeechHistory, fetchChildNotes, deleteChildNote } from '../../store/slices/childProfileSlice';
import styles from './ChildProfile.module.css';
import { useModal } from '../../context/ModalContext';
import SpeechHistoryModal from '../../components/Modals/SpeechHistoryModal/SpeechHistoryModal';
import UpdateSpeechLevelModal from '../../components/Modals/UpdateSpeechLevelModal/UpdateSpeechLevelModal';
import DeleteConfirmModal from "../../components/Modals/DeleteConfirmModal/DeleteConfirmModal";
import ActivityModal from '../../components/Modals/ActivityModal/ActivityModal';
import NoteModal from '../../components/Modals/NoteModal/NoteModal'; // تم استيراد مودال الملاحظات
import { getChildActivitiesApi, deleteActivityApi, type ActivityItem } from '../../api/doctorApi';

const ChildProfile = () => {
  const { openAssignParentModal, openAddChildModal } = useModal();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // جلب بيانات الطفل والملاحظات من الريدكس
  const { profileData, isLoading, error, notesData, isNotesLoading } = useAppSelector((state) => state.childProfile);
  
  const rawRole = useAppSelector((state) => state.auth?.role);
  const isDoctor = rawRole === 'doctor';

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isUpdateLevelModalOpen, setIsUpdateLevelModalOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<number | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<ActivityItem | null>(null);
  const [notesPage, setNotesPage] = useState(1);

  // States الخاصة بمودال الملاحظات
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState<any | null>(null);

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);

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

  const handleOpenEditNote = (note: any) => {
    setNoteToEdit(note);
    setIsNoteModalOpen(true);
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

  const fetchNotes = useCallback(() => {
    if (!id) return;
    dispatch(fetchChildNotes({ childId: Number(id), pageNumber: notesPage, pageSize: 5 }));
  }, [dispatch, id, notesPage]);

  useEffect(() => {
    if (id) {
      dispatch(fetchChildProfile(Number(id)));
      fetchActivities();
      fetchNotes();
    }
    return () => {
      dispatch(clearProfileData());
    };
  }, [dispatch, id, fetchActivities, fetchNotes]);

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
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>ولي الأمر</h2>
                <button onClick={() => openAssignParentModal(Number(id))} className={styles.primaryBtn}>
                  <LinkIcon size={16} /> {profileData.parentFullName ? 'تغيير' : 'ربط'}
                </button>
              </div>
              {profileData.parentFullName ? (
                <div className="flex flex-col gap-2">
                  <div className={styles.infoItem}><span className={styles.infoLabel}>الاسم</span><span className={styles.infoValue}>{profileData.parentFullName}</span></div>
                  <div className={styles.infoItem}><span className={styles.infoLabel}>البريد الإلكتروني</span><span className={styles.infoValue}>{profileData.parentEmail}</span></div>
                  <div className={styles.infoItem}><span className={styles.infoLabel}>رقم الهاتف</span><span className={styles.infoValue}>{profileData.parentPhoneNumber || 'غير مسجل'}</span></div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center gap-2 py-2 flex-1 justify-center">
                  <div className="text-gray-400"><LinkIcon size={32} /></div>
                  <p className="font-bold text-[#1E1B4B] text-sm">لم يتم ربط الطفل بولي أمر حتى الآن.</p>
                </div>
              )}
            </div>

            {/* كارت 3: مستوى الكلام الحالي */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}><Activity size={22} />مستوى الكلام</h2>
                <button className={styles.primaryBtn} onClick={() => setIsUpdateLevelModalOpen(true)}>
                  <Edit2 size={16} /> تحديث
                </button>
              </div>
              <div className="flex flex-col gap-3 flex-1 justify-between">
                <span className={styles.stageBadge}>
                  {profileData.speechLevel ? profileData.speechLevel.levelName : 'لم يتم تحديد مستوى'}
                </span>
                <button className={styles.secondaryBtn} onClick={handleOpenHistory} style={{ width: '100%' }}>
                  <History size={16} /> سجل المستويات
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* في حال كان اليوزر ولي أمر: كارت بيانات الطفل + كارت بيانات الطبيب المعالج وكارت مستوى الكلام مع الـ Progress Bar وبدون أزرار */
        <div className={styles.topProfileSection}>
          {/* العمود الأول: بيانات الطفل */}
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

          {/* العمود الثاني: كارت بيانات الطبيب المعالج وكارت مستوى الكلام بالـ Progress Bar */}
          <div className={styles.stackedInfoCol}>
            {/* كارت بيانات الطبيب المعالج (يستفيد من المساحة المتبقية) */}
            <div className={styles.card} style={{ flex: 1.4 }}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}><UserCheck size={22} />الطبيب المعالج</h2>
              </div>
              {(profileData as any)?.doctorFullName ? (
                <div className="flex flex-col gap-3 flex-1 justify-center">
                  <div className={styles.infoItem}><span className={styles.infoLabel}>اسم الطبيب</span><span className={styles.infoValue}>{(profileData as any).doctorFullName}</span></div>
                  <div className={styles.infoItem}><span className={styles.infoLabel}>البريد الإلكتروني</span><span className={styles.infoValue}>{(profileData as any).doctorEmail || 'غير مسجل'}</span></div>
                  <div className={styles.infoItem}><span className={styles.infoLabel}>رقم الهاتف</span><span className={styles.infoValue}>{(profileData as any).doctorPhoneNumber || 'غير مسجل'}</span></div>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center gap-2 py-4 flex-1 justify-center">
                  <div className="text-[#581C87]"><UserCheck size={40} /></div>
                  <p className="font-extrabold text-[#1E1B4B] text-base">د. الطبيب المعالج</p>
                  <span className="text-xs font-bold text-gray-500">سيتم المتابعة والتواصل المباشر مع الطبيب المختص</span>
                </div>
              )}
            </div>

            {/* كارت مستوى الكلام بالـ Progress Bar فقط وبدون أي أزرار أو نصوص للمستوى */}
            <div className={styles.card} style={{ flex: 'none' }}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}><Activity size={22} />مستوى الكلام الحالي</h2>
              </div>
              <div className="flex flex-col gap-2 bg-[#F8F7FF] p-3.5 rounded-xl">
                <div className="flex justify-between items-center text-xs font-bold text-[#581C87]">
                  <span>مستوى التقدم</span>
                  <span className="bg-[#EBE5F7] text-[#1E1B4B] px-2.5 py-0.5 rounded-full font-extrabold">
                    {profileData.speechLevel ? `المستوى ${Math.min(Math.max(profileData.speechLevel.id, 1), 10)} من 10` : 'لم يحدد بعد'}
                  </span>
                </div>
                <div className="w-full h-3.5 bg-[#EBE5F7] rounded-full overflow-hidden mt-1">
                  <div 
                    className="h-full bg-gradient-to-r from-[#FACC15] to-[#F59E0B] rounded-full transition-all duration-500"
                    style={{ width: `${profileData.speechLevel ? (Math.min(Math.max(profileData.speechLevel.id, 1), 10) / 10) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* قسم الأنشطة الحالية */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>الأنشطة الحالية</h2>
          {/* زر إضافة نشاط يظهر للدكتور فقط */}
          {isDoctor && (
            <button onClick={handleOpenAddActivity} className={styles.primaryBtn}>
              إضافة نشاط
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3 mt-4">
          {isLoadingActivities ? (
            <div className="text-center py-4 text-[#6C34AF] font-bold">جاري تحميل الأنشطة...</div>
          ) : activities.length > 0 ? (
            activities.map((activity) => (
              isDoctor ? (
                /* واجهة الدكتور: محتوى النشاط وأسفله الأهداف، وعلى الشمال زراير التعديل والحذف */
                <div 
                  key={activity.id} 
                  className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center p-4 bg-[#F8F7FF] rounded-xl gap-4"
                >
                  <div className="flex flex-col gap-3 w-full sm:w-auto">
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

                  <div className="flex gap-2 w-full sm:w-auto justify-end pt-3 sm:pt-0 mt-1 sm:mt-0">
                    <button 
                      onClick={() => handleOpenEditActivity(activity)}
                      className={styles.itemEditBtn}
                      title="تعديل"
                    >
                      <Edit2 size={18} strokeWidth={2.5} />
                    </button>
                    
                    <button 
                      onClick={() => setActivityToDelete(activity.id)}
                      className={styles.itemDeleteBtn}
                      title="حذف"
                    >
                      <Trash2 size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ) : (
                /* واجهة ولي الأمر: اسم النشاط ع اليمين، والهدف والمدة ع الشمال ف نفس السطر ومكبرين لتوحيد التوازن */
                <div 
                  key={activity.id} 
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-[#F8F7FF] rounded-xl gap-4"
                >
                  <span className="font-extrabold text-[#1E1B4B] text-xl">
                    {activity.content}
                  </span>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm sm:text-base font-extrabold flex-shrink-0">
                    <span className="bg-[#EBE5F7] text-[#581C87] px-3.5 py-1.5 rounded-lg whitespace-nowrap">
                      الهدف: {getActivityTargetText(activity.activityTarget)}
                    </span>
                    <span className="bg-[#EBE5F7] text-[#581C87] px-3.5 py-1.5 rounded-lg whitespace-nowrap">
                      المدة: {activity.estimatedDurationMinutes} دقائق
                    </span>
                  </div>
                </div>
              )
            ))
          ) : (
            <div className="text-center py-8 text-[#581C87] font-bold bg-[#F4F0FF] rounded-xl border-2 border-dashed border-[#581C87]">
              لا توجد أنشطة مضافة لهذا الطفل حالياً.
            </div>
          )}
        </div>
      </div>

      {/* قسم ملاحظات الطبيب */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            ملاحظات الطبيب
          </h2>
          {/* زر إضافة ملاحظة يظهر للدكتور فقط */}
          {isDoctor && (
            <button onClick={handleOpenAddNote} className={styles.primaryBtn}>
              إضافة ملاحظة
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3 mt-4">
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

              {/* عناصر التحكم في الصفحات Pagination */}
              {notesData && (
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
                fetchActivities();
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
              fetchActivities();
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