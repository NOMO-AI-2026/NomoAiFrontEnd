import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Trash2, Search, ChevronRight, ChevronLeft, HelpCircle } from 'lucide-react';
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
  
  const [filter, setFilter] = useState<'ALL' | 'APPROVED' | 'PENDING'>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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
      let isApprovedValue: boolean | undefined = undefined;
      if (filter === 'APPROVED') isApprovedValue = true;
      if (filter === 'PENDING') isApprovedValue = false;

      const params: any = {
        pageNumber: page,
        pageSize: 10,
      };

      if (isApprovedValue !== undefined) {
        params.isApproved = isApprovedValue;
      }

      const response = await getAdminDoctorsApi(params);
      
      if (response?.value?.items && Array.isArray(response.value.items)) {
        setDoctors(response.value.items);
      } else {
        setDoctors([]);
      }

      setTotalPages(response?.value?.totalPages || 1);

    } catch (error) {
      console.error("Error fetching doctors:", error);
      setDoctors([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [filter, page]);

  // دالة القبول (تحديث فوري للواجهة)
  const handleApproveInstant = async (userId: string) => {
    try {
      await handleDoctorApprovalApi({ userId, approveStatus: true });
      
      setDoctors((prev) => 
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
      
      setDoctors((prev) => 
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
      setDoctors((prev) => prev.filter((doc) => doc.userId !== selectedDoctorId));
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
    const parts = name.split(' ');
    if (parts.length > 1) return parts[0][0] + '.' + parts[1][0];
    return name.substring(0, 2);
  };

  const filteredDoctors = doctors.filter(doc => {
    const name = (doc.fullName || '').toLowerCase();
    const email = (doc.email || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || email.includes(search);
  });

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
              <th>العيادة / الخبرة</th>
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
              {filteredDoctors.map((doctor, index) => {
                // منطق ذكي لتحديد الحالة بناءً على التاب النشط أو خاصية الدكتور
                const isApprovedStatus = filter === 'APPROVED' ? true : (filter === 'PENDING' ? false : doctor.isApproved);

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
                      <div style={{display: 'flex', flexDirection: 'column', gap: '0.25rem'}}>
                        <span style={{fontWeight: 800, color: '#211A44'}}>{doctor.doctorSpecificData?.clinicName || 'غير محدد'}</span>
                        <span style={{fontSize: '0.85rem', color: '#6B7280', fontWeight: 600}}>
                          {doctor.doctorSpecificData?.yearsOfExperience ? `${doctor.doctorSpecificData.yearsOfExperience} سنوات خبرة` : ''}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${isApprovedStatus ? styles.badgeApproved : styles.badgePending}`}>
                        <span className={styles.dot} style={{ backgroundColor: isApprovedStatus ? '#16A34A' : '#CA8A04' }}></span>
                        {isApprovedStatus ? 'مقبول' : 'قيد الانتظار'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        {!isApprovedStatus ? (
                          <button 
                            title="قبول" 
                            className={`${styles.actionBtn} ${styles.actionAccept}`}
                            onClick={() => handleApproveInstant(doctor.userId)}
                          >
                            <CheckCircle2 size={22} />
                          </button>
                        ) : (
                           <button 
                            title="إلغاء الاعتماد" 
                            className={`${styles.actionBtn} ${styles.actionReject}`}
                            onClick={() => openRejectModal(doctor.userId)}
                         >
                           <XCircle size={22} />
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

      <button className={styles.helpBtn}>
        <HelpCircle size={24} />
      </button>

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