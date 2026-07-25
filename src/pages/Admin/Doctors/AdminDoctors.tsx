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
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filter, setFilter] = useState<'ALL' | 'APPROVED' | 'PENDING'>('ALL');
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [doctorToReject, setDoctorToReject] = useState<string | null>(null);
  const [isRejectLoading, setIsRejectLoading] = useState(false);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {
        pageNumber: 1,
        pageSize: 1000, // Fetch all records at once to allow complete search across pages
      };

      const response = await getAdminDoctorsApi(params);
      
      if (response?.value?.items && Array.isArray(response.value.items)) {
        setAllDoctors(response.value.items);
      } else {
        setAllDoctors([]);
      }

    } catch (error) {
      console.error("Error fetching doctors:", error);
      setAllDoctors([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Reset to first page when search or tab changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm, filter]);

  // دالة القبول (تحديث فوري للواجهة)
  const handleApproveInstant = async (userId: string) => {
    try {
      await handleDoctorApprovalApi({ userId, approveStatus: true });
      
      setAllDoctors((prev) => 
        prev.map((doc) => doc.userId === userId ? { ...doc, isApproved: true } : doc)
      );

      toast.success("تم قبول الطبيب بنجاح!");
    } catch (error) {
      console.error("Error approving doctor:", error);
      toast.error("حدث خطأ أثناء قبول الطبيب");
    }
  };

  const openRejectModal = (userId: string) => {
    setDoctorToReject(userId);
    setIsRejectModalOpen(true);
  };

  // دالة إلغاء الاعتماد (تحديث فوري للواجهة)
  const confirmReject = async () => {
    if (!doctorToReject) return;
    setIsRejectLoading(true);
    try {
      await handleDoctorApprovalApi({ userId: doctorToReject, approveStatus: false });
      
      setAllDoctors((prev) => 
        prev.map((doc) => doc.userId === doctorToReject ? { ...doc, isApproved: false } : doc)
      );

      setIsRejectModalOpen(false);
      toast.success("تم إلغاء اعتماد الطبيب بنجاح!");
    } catch (error) {
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
      setAllDoctors((prev) => prev.filter((doc) => doc.userId !== selectedDoctorId));
      setIsDeleteModalOpen(false);
      toast.success("تم حذف الطبيب نهائياً!");
    } catch (error) {
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

  // 1. Filter local records
  const filteredDoctors = allDoctors.filter(doc => {
    // A. status filter
    let matchesFilter = true;
    if (filter === 'APPROVED') matchesFilter = doc.isApproved === true;
    if (filter === 'PENDING') matchesFilter = doc.isApproved === false;

    // B. search query filter
    const name = (doc.fullName || '').toLowerCase();
    const email = (doc.email || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    
    return matchesFilter && (name.includes(search) || email.includes(search));
  });

  // 2. Paginate filtered local records
  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(filteredDoctors.length / PAGE_SIZE) || 1;
  const startIndex = (page - 1) * PAGE_SIZE;
  const paginatedDoctors = filteredDoctors.slice(startIndex, startIndex + PAGE_SIZE);

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
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className={styles.tabsContainer}>
          <button 
            className={`${styles.tabBtn} ${filter === 'ALL' ? styles.tabActive : ''}`}
            onClick={() => setFilter('ALL')}
          >
            الكل
          </button>
          <button 
            className={`${styles.tabBtn} ${filter === 'PENDING' ? styles.tabActive : ''}`}
            onClick={() => setFilter('PENDING')}
          >
            قيد الانتظار
          </button>
          <button 
            className={`${styles.tabBtn} ${filter === 'APPROVED' ? styles.tabActive : ''}`}
            onClick={() => setFilter('APPROVED')}
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
          ) : filteredDoctors.length === 0 ? (
             <tbody>
               <tr>
                 <td colSpan={5} className={styles.loadingOrEmpty}>
                   لا يوجد أطباء لعرضهم في هذا التصنيف.
                 </td>
               </tr>
             </tbody>
          ) : (
             <tbody>
               {paginatedDoctors.map((doctor, index) => {
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
        
        {!loading && filteredDoctors.length > 0 && (
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