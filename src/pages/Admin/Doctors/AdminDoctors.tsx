import { useEffect, useState } from 'react';
import { UserCheck, UserX, Trash2, Search, ChevronRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './AdminDoctors.module.css';
import { getAdminDoctorsApi, handleDoctorApprovalApi, deleteDoctorByAdminApi } from '../../../api/adminApi';
import DeleteConfirmModal from '../../../components/Modals/DeleteConfirmModal/DeleteConfirmModal';

interface Doctor {
  userId: string;
  fullName: string;
  email: string;
  isApproved: boolean;
  doctorSpecificData?: {
    yearsOfExperience: number;
    clinicName: string;
  };
}

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  
  // حالات الـ Pagination والبحث
  const [filter, setFilter] = useState<'ALL' | 'APPROVED' | 'PENDING'>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // حالات المودالز
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
      if (searchTerm) setPage(1); // نرجع للصفحة الأولى لو بيبحث
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 2. جلب البيانات من الباك إند
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        // تجهيز الباراميترز اللي هتتبعت للباك إند
        const params: any = {
          pageNumber: page,
          pageSize: 10, // بنطلب 10 بس
        };
        
        // إرسال الاسم للبحث في الباك إند
        if (debouncedSearch) {
          params.name = debouncedSearch;
        }

        // إرسال حالة الاعتماد للفلترة في الباك إند
        if (filter === 'APPROVED') params.isApproved = true;
        if (filter === 'PENDING') params.isApproved = false;

        const response = await getAdminDoctorsApi(params);
        
        if (response?.value?.items && Array.isArray(response.value.items)) {
          setDoctors(response.value.items);
          // تأكدي إن الباك إند بيرجع totalPages، لو اسمه مختلف عدليه هنا
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
    };

    fetchDoctors();
  }, [page, debouncedSearch, filter]); // الدالة دي هتتنفذ مع كل تغيير في الصفحة، البحث، أو الفلتر

  const handleApproveInstant = async (userId: string) => {
    try {
      await handleDoctorApprovalApi({ userId, approveStatus: true });
      setDoctors((prev) => prev.map((doc) => doc.userId === userId ? { ...doc, isApproved: true } : doc));
      toast.success("تم قبول الطبيب بنجاح!");
    } catch (error: unknown) {
      console.error("Error approving doctor:", error);
      toast.error("حدث خطأ أثناء قبول الطبيب");
    }
  };

  const openRejectModal = (userId: string) => {
    setDoctorToReject(userId);
    setIsRejectModalOpen(true);
  };

  const confirmReject = async () => {
    if (!doctorToReject) return;
    setIsRejectLoading(true);
    try {
      await handleDoctorApprovalApi({ userId: doctorToReject, approveStatus: false });
      setDoctors((prev) => prev.map((doc) => doc.userId === doctorToReject ? { ...doc, isApproved: false } : doc));
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

  const openDeleteModal = (userId: string) => {
    setSelectedDoctorId(userId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedDoctorId) return;
    setIsActionLoading(true);
    try {
      await deleteDoctorByAdminApi({ userId: selectedDoctorId });
      setDoctors((prev) => prev.filter((doc) => doc.userId !== selectedDoctorId));
      setIsDeleteModalOpen(false);
      toast.success("تم حذف الطبيب نهائياً!");
    } catch (error: unknown) {
      console.error("Error deleting doctor:", error);
      toast.error("حدث خطأ أثناء الحذف");
    } finally {
      setIsActionLoading(false);
      setSelectedDoctorId(null);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'د';
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return parts[0][0] + '.' + parts[1][0];
    }
    return name.substring(0, 2);
  };

  return (
    <div className={styles.pageContainer} dir="rtl">
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>إدارة الأطباء</h1>
          <p className={styles.subtitle}>مراجعة والتحقق من حسابات الأطباء المسجلين في المنصة.</p>
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
            onChange={(e) => setSearchTerm(e.target.value)} // مبقناش نعمل setPage(1) هنا عشان الـ Debounce بيهندلها
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
                 <td colSpan={5} className={styles.loadingOrEmpty}>
                   جاري تحميل البيانات...
                 </td>
               </tr>
             </tbody>
          ) : doctors.length === 0 ? (
             <tbody>
               <tr>
                 <td colSpan={5} className={styles.loadingOrEmpty}>
                   لا يوجد أطباء لعرضهم.
                 </td>
               </tr>
             </tbody>
          ) : (
             <tbody>
               {doctors.map((doctor, index) => {
                 return (
                   <tr key={`${doctor.userId}-${index}`}>
                     <td>
                       <div className={styles.doctorInfo}>
                         <div className={styles.avatar}>
                           {getInitials(doctor.fullName)}
                         </div>
                         <span style={{ fontWeight: 800 }}>{doctor.fullName || 'غير محدد'}</span>
                       </div>
                     </td>
                     <td><span dir="ltr">{doctor.email}</span></td>
                     <td>
                       <span className={`${styles.badge} ${doctor.isApproved ? styles.badgeApproved : styles.badgePending}`}>
                         <span className={styles.dot} style={{ backgroundColor: doctor.isApproved ? '#16A34A' : '#CA8A04' }}></span>
                         {doctor.isApproved ? 'مقبول' : 'قيد الانتظار'}
                       </span>
                     </td>
                     <td>
                       <div className={styles.actions}>
                         {!doctor.isApproved ? (
                           <button 
                             title="قبول" 
                             className={`${styles.actionBtn} ${styles.actionAccept}`}
                             onClick={() => handleApproveInstant(doctor.userId)}
                           >
                             <UserCheck size={22} />
                           </button>
                         ) : (
                            <button 
                             title="إلغاء الاعتماد" 
                             className={`${styles.actionBtn} ${styles.actionReject}`}
                             onClick={() => openRejectModal(doctor.userId)}
                           >
                             <UserX size={22} />
                           </button>
                         )}

                         <button 
                           title="حذف نهائي" 
                           className={`${styles.actionBtn} ${styles.actionDelete}`}
                           onClick={() => openDeleteModal(doctor.userId)}
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
        
        {!loading && totalPages > 0 && (
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