import { useEffect, useState } from 'react';
import { Trash2, Search, ChevronRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './AdminParents.module.css';

import { getAdminParentsApi, deleteParentByAdminApi } from '../../../api/adminApi';
import DeleteConfirmModal from '../../../components/Modals/DeleteConfirmModal/DeleteConfirmModal';
import UserAvatar from '../../../components/UserAvatar/UserAvatar';

interface Parent {
  userId: string;
  fullName?: string;
  fullname?: string; 
  name?: string;     
  email: string;
  phoneNumber?: string; 
}

const AdminParents = () => {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // حالات الـ Pagination والبحث
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

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
    const fetchParents = async () => {
      setLoading(true);
      try {
        const params: { pageNumber: number; pageSize: number; name?: string } = {
          pageNumber: page,
          pageSize: 10, // بنطلب 10 بس
        };

        if (debouncedSearch) {
          params.name = debouncedSearch; // بنبعت الاسم للبحث
        }

        const response = await getAdminParentsApi(params);
        console.log("Parents API Response:", response);
        
        if (response?.value?.items && Array.isArray(response.value.items)) {
          setParents(response.value.items);
          setTotalPages(response.value.totalPages || 1);
        } else if (response?.value && Array.isArray(response.value)) {
          // Fallback لو الباك إند بيرجع Data Array مباشرة
          setParents(response.value);
          setTotalPages(response.value.totalPages || 1);
        } else {
          setParents([]);
          setTotalPages(1);
        }

      } catch (error: unknown) {
        console.error("Error fetching parents:", error);
        const msg = (error as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message || (error as { message?: string }).message || "حدث خطأ أثناء جلب أولياء الأمور";
        toast.error(`خطأ: ${msg}`);
        setParents([]); 
      } finally {
        setLoading(false);
      }
    };

    fetchParents();
  }, [page, debouncedSearch]); // تشتغل تاني كل ما الـ Page أو الـ Debounced Search يتغيروا

  const openDeleteModal = (userId: string) => {
    setSelectedParentId(userId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedParentId) return;
    setIsActionLoading(true);
    try {
      await deleteParentByAdminApi({ userId: selectedParentId });
      setParents((prev) => prev.filter((p) => p.userId !== selectedParentId));
      setIsDeleteModalOpen(false);
      toast.success("تم حذف حساب ولي الأمر نهائياً!");
    } catch (error: unknown) {
      console.error("Error deleting parent:", error);
      toast.error("حدث خطأ أثناء الحذف");
    } finally {
      setIsActionLoading(false);
      setSelectedParentId(null);
    }
  };

  const getParentName = (parent: Parent) => {
    return parent.fullName || parent.fullname || parent.name || 'غير محدد';
  };



  return (
    <div className={styles.pageContainer} dir="rtl">
      
      {/* ================= الهيدر ================= */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>إدارة أولياء الأمور</h1>
          <p className={styles.subtitle}>متابعة حسابات الآباء والأمهات المسجلة في النظام</p>
        </div>
      </div>

      {/* ================= البحث والفلترة ================= */}
      <div className={styles.filterSection}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <input 
            type="text" 
            className={styles.searchInput} 
            placeholder="البحث عن طريق الاسم أو البريد الإلكتروني..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      {/* ================= الجدول ================= */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>الاسم الكامل</th>
              <th>البريد الإلكتروني</th>
              <th>رقم الهاتف</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          
          {loading ? (
             <tbody>
               <tr>
                 <td colSpan={6} className={styles.loadingOrEmpty}>
                   جاري تحميل البيانات...
                 </td>
               </tr>
             </tbody>
          ) : parents.length === 0 ? (
             <tbody>
               <tr>
                 <td colSpan={6} className={styles.loadingOrEmpty}>
                   لا يوجد أولياء أمور لعرضهم.
                 </td>
               </tr>
             </tbody>
          ) : (
             <tbody>
               {parents.map((parent, index) => {
                 const name = getParentName(parent);
                 return (
                   <tr key={`${parent.userId}-${index}`}>
                     <td>
                        <div className={styles.parentInfo}>
                          <div className={styles.avatar}>
                            <UserAvatar type="parent" size={28} />
                          </div>
                          <span style={{ fontWeight: 800 }}>{name}</span>
                        </div>
                     </td>
                     <td><span dir="ltr">{parent.email}</span></td>
                     <td>
                       <span style={{fontWeight: 800, color: '#4B5563'}} dir="ltr">
                         {parent.phoneNumber || 'غير مسجل'}
                       </span>
                     </td>
                     <td>
                       <div className={styles.actions}>
                         <button 
                           title="حذف نهائي" 
                           className={`${styles.actionBtn} ${styles.actionDelete}`}
                           onClick={() => openDeleteModal(parent.userId)}
                         >
                           <Trash2 size={18} />
                         </button>
                       </div>
                     </td>
                   </tr>
                 );
               })}
             </tbody>
          )}
        </table>
        
        {/* ================= الترقيم (Pagination) ================= */}
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

      <DeleteConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="حذف حساب ولي الأمر"
        message="هل أنت متأكد من رغبتك في حذف هذا الحساب نهائياً؟ سيتم مسح جميع بياناته المتعلقة."
        deleteBtnText={isActionLoading ? "جاري الحذف..." : "نعم، احذف الحساب"}
      />
    </div>
  );
};

export default AdminParents;