import { useEffect, useState, useCallback } from 'react';
import { UserCheck, UserX, Trash2, Search, ChevronRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './AdminDoctors.module.css';
import { getAdminDoctorsApi, handleDoctorApprovalApi, deleteDoctorByAdminApi, type GetDoctorsParams } from '../../../api/adminApi';
import DeleteConfirmModal from '../../../components/Modals/DeleteConfirmModal/DeleteConfirmModal';
import DoctorDetailsModal from '../../../components/Modals/DoctorDetailsModal/DoctorDetailsModal';
import UserAvatar from '../../../components/UserAvatar/UserAvatar';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  fetchDoctorDetailsByAdmin,
  clearSelectedDoctor,
  acceptPendingDoctorDocuments,
  rejectPendingDoctorDocuments,
} from '../../../store/slices/adminDoctorsSlice/adminDoctorsSlice';

interface Doctor {
  userId: string;
  fullName: string;
  email: string;
  isApproved: boolean;
  hasPendingDocuments?: boolean;
  doctorSpecificData?: {
    yearsOfExperience: number;
    clinicName: string;
  };
}

const AdminDoctors = () => {
  const dispatch = useAppDispatch();
  const { selectedDoctor, isDetailsLoading, detailsError, isActionLoading: isDocActionLoading } = useAppSelector((state) => state.adminDoctors);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  
  // حالات الـ Pagination والبحث (أضفنا DOCS_PENDING)
  const [filter, setFilter] = useState<'ALL' | 'APPROVED' | 'PENDING' | 'DOCS_PENDING'>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // حالات المودالز
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [doctorToReject, setDoctorToReject] = useState<string | null>(null);
  const [isRejectLoading, setIsRejectLoading] = useState(false);

  // 1. تفعيل الـ Debounce للبحث
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      if (searchTerm) setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const params: GetDoctorsParams = {
        pageNumber: page,
        pageSize: 10,
      };
      
      if (debouncedSearch) {
        params.name = debouncedSearch;
      }

      // الفلترة حسب الاعتماد أومستندات التعديل المعلقة
      if (filter === 'APPROVED') params.isApproved = true;
      if (filter === 'PENDING') params.isApproved = false;
      if (filter === 'DOCS_PENDING') params.hasPendingDocuments = true;

      const response = await getAdminDoctorsApi(params);
      
      if (response?.value?.items && Array.isArray(response.value.items)) {
        setDoctors(response.value.items);
        setTotalPages(response.value.totalPages || 1); 
      } else {
        setDoctors([]);
        setTotalPages(1);
      }

    } catch (error: unknown) {
      console.error("Error fetching doctors:", error);
      setDoctors([]); 
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filter]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleDoctorRowClick = (userId: string) => {
    dispatch(fetchDoctorDetailsByAdmin(userId));
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    dispatch(clearSelectedDoctor());
  };

  const handleAcceptPendingDocs = async (userId: string) => {
    const res = await dispatch(acceptPendingDoctorDocuments(userId));
    if (acceptPendingDoctorDocuments.fulfilled.match(res)) {
      toast.success("تم قبول المستندات الجديدة وتفعيلها بنجاح!");
      fetchDoctors();
    } else {
      toast.error((res.payload as string) || "حدث خطأ أثناء قبول المستندات");
    }
  };

  const handleRejectPendingDocs = async (userId: string) => {
    const res = await dispatch(rejectPendingDoctorDocuments(userId));
    if (rejectPendingDoctorDocuments.fulfilled.match(res)) {
      toast.success("تم رفض المستندات الجديدة وإلغاؤها بنجاح!");
      fetchDoctors();
    } else {
      toast.error((res.payload as string) || "حدث خطأ أثناء رفض المستندات");
    }
  };

  const handleApproveInstant = async (userId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await handleDoctorApprovalApi({ userId, approveStatus: true });
      fetchDoctors();
      
      if (selectedDoctor && selectedDoctor.userId === userId) {
        dispatch(fetchDoctorDetailsByAdmin(userId));
      }

      toast.success("تم قبول الطبيب بنجاح!");
    } catch (error: unknown) {
      console.error("Error approving doctor:", error);
      toast.error("حدث خطأ أثناء قبول الطبيب");
    }
  };

  const openRejectModal = (userId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDoctorToReject(userId);
    setIsRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!doctorToReject) return;
    setIsRejectLoading(true);
    try {
      await handleDoctorApprovalApi({ userId: doctorToReject, approveStatus: false });
      fetchDoctors();
      
      if (selectedDoctor && selectedDoctor.userId === doctorToReject) {
        dispatch(fetchDoctorDetailsByAdmin(doctorToReject));
      }

      setIsRejectModalOpen(false);
      toast.success("تم إلغاء اعتماد الطبيب بنجاح!");
    } catch (error: unknown) {
      console.error("Error rejecting doctor:", error);
      toast.error("حدث خطأ أثناء إلغاء الاعتماد");
    } finally {
      setIsRejectLoading(false);
      setDoctorToReject(null);
    }
  };

  const openDeleteModal = (userId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedDoctorId(userId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedDoctorId) return;
    setIsActionLoading(true);
    try {
      await deleteDoctorByAdminApi({ userId: selectedDoctorId });
      fetchDoctors();
      setIsDeleteModalOpen(false);
      if (isDetailsModalOpen && selectedDoctor?.userId === selectedDoctorId) {
        handleCloseDetailsModal();
      }
      toast.success("تم حذف الطبيب نهائياً!");
    } catch (error: unknown) {
      console.error("Error deleting doctor:", error);
      toast.error("حدث خطأ أثناء الحذف");
    } finally {
      setIsActionLoading(false);
      setSelectedDoctorId(null);
    }
  };

  return (
    <div className={styles.pageContainer} dir="rtl">
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>إدارة الأطباء</h1>
          <p className={styles.subtitle}>مراجعة والتحقق من حسابات الأطباء المسجلين في المنصة (اضغط على أي طبيب لمشاهدة كافة بياناته ومستنداته).</p>
        </div>
      </div>

      <div className={styles.filterSection}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <input 
            type="text" 
            className={styles.searchInput} 
            placeholder="البحث بالاسم أو البريد الإلكتروني..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className={styles.tabsContainer}>
          <button 
            className={`${styles.tabBtn} ${filter === 'ALL' ? styles.tabActive : ''}`}
            onClick={() => { setFilter('ALL'); setPage(1); }}
          >
            الكل
          </button>
          <button 
            className={`${styles.tabBtn} ${filter === 'PENDING' ? styles.tabActive : ''}`}
            onClick={() => { setFilter('PENDING'); setPage(1); }}
          >
            قيد الانتظار
          </button>
          <button 
            className={`${styles.tabBtn} ${filter === 'APPROVED' ? styles.tabActive : ''}`}
            onClick={() => { setFilter('APPROVED'); setPage(1); }}
          >
            المعتمدين
          </button>
          <button 
            className={`${styles.tabBtn} ${filter === 'DOCS_PENDING' ? styles.tabActive : ''}`}
            onClick={() => { setFilter('DOCS_PENDING'); setPage(1); }}
          >
            تعديلات المستندات
          </button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>الاسم</th>
              <th>البريد الإلكتروني</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          
          {loading ? (
             <tbody>
               <tr>
                 <td colSpan={4} className={styles.loadingOrEmpty}>
                   جاري تحميل البيانات...
                 </td>
               </tr>
             </tbody>
          ) : doctors.length === 0 ? (
             <tbody>
               <tr>
                 <td colSpan={4} className={styles.loadingOrEmpty}>
                   لا يوجد أطباء لعرضهم.
                 </td>
               </tr>
             </tbody>
          ) : (
             <tbody>
               {doctors.map((doctor, index) => {
                 return (
                   <tr 
                     key={`${doctor.userId}-${index}`} 
                     className={styles.tableRowClickable}
                     onClick={() => handleDoctorRowClick(doctor.userId)}
                   >
                     <td>
                       <div className={styles.doctorInfo}>
                         <div className={styles.avatar}>
                           <UserAvatar type="doctor" size={28} />
                         </div>
                         <span style={{ fontWeight: 800, color: '#581C87' }}>{doctor.fullName || 'غير محدد'}</span>
                       </div>
                     </td>
                     <td><span dir="ltr">{doctor.email}</span></td>
                     <td>
                       <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                         <span className={`${styles.badge} ${doctor.isApproved ? styles.badgeApproved : styles.badgePending}`}>
                           <span className={styles.dot} style={{ backgroundColor: doctor.isApproved ? '#16A34A' : '#CA8A04' }}></span>
                           {doctor.isApproved ? 'مقبول' : 'قيد الانتظار'}
                         </span>

                         {doctor.hasPendingDocuments && (
                           <span className={styles.badge} style={{ backgroundColor: '#FEF3C7', color: '#B45309', border: '1px solid #FCD34D' }}>
                             مستندات معلقة
                           </span>
                         )}
                       </div>
                     </td>
                     <td>
                       <div className={styles.actions}>
                         {!doctor.isApproved ? (
                           <button 
                             title="قبول" 
                             className={`${styles.actionBtn} ${styles.actionAccept}`}
                             onClick={(e) => handleApproveInstant(doctor.userId, e)}
                           >
                             <UserCheck size={22} />
                           </button>
                         ) : (
                            <button 
                             title="إلغاء الاعتماد" 
                             className={`${styles.actionBtn} ${styles.actionReject}`}
                             onClick={(e) => openRejectModal(doctor.userId, e)}
                           >
                             <UserX size={22} />
                           </button>
                         )}

                         <button 
                           title="حذف نهائي" 
                           className={`${styles.actionBtn} ${styles.actionDelete}`}
                           onClick={(e) => openDeleteModal(doctor.userId, e)}
                         >
                           <Trash2 size={22} />
                         </button>
                       </div>
                     </td>
                   </tr>
                 );
               })}
             </tbody>
          )}
        </table>
        
        {!loading && totalPages > 1 && (
          <div className={styles.pagination}>
            <div className={styles.pageInfo}>
              صفحة <span style={{color: '#211A44', fontWeight: 900}}>{page}</span> من {totalPages}
            </div>
            <div className={styles.pageControls}>
              <button 
                className={styles.pageBtn} 
                disabled={page === 1} 
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronRight size={18} />
                السابق
              </button>
              
              <button 
                className={styles.pageBtn} 
                disabled={page === totalPages} 
                onClick={() => setPage((p) => p + 1)}
              >
                التالي
                <ChevronLeft size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* مودال تفاصيل الطبيب ومستنداته */}
      <DoctorDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        doctor={selectedDoctor}
        isLoading={isDetailsLoading}
        error={detailsError}
        onApprove={(userId) => handleApproveInstant(userId)}
        onReject={(userId) => openRejectModal(userId)}
        onAcceptPendingDocs={handleAcceptPendingDocs}
        onRejectPendingDocs={handleRejectPendingDocs}
        isActionLoading={isDocActionLoading}
      />

      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="حذف حساب الطبيب"
        message="هل أنت متأكد من رغبتك في حذف حساب هذا الطبيب بشكل نهائي؟ سيتم مسح جميع بياناته."
        deleteBtnText={isActionLoading ? "جاري الحذف..." : "نعم، احذف الطبيب"}
      />

      <DeleteConfirmModal 
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={confirmReject}
        title="إلغاء اعتماد الطبيب"
        message="هل أنت متأكد من رغبتك في إلغاء اعتماد هذا الطبيب؟ لن يتمكن من استخدام حسابه كطبيب معتمد حتى توافق عليه مجدداً."
        deleteBtnText={isRejectLoading ? "جاري الإلغاء..." : "نعم، إلغاء الاعتماد"}
      />
    </div>
  );
};

export default AdminDoctors;