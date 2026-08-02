import { useEffect, useState} from 'react';
import { Trash2, Search, ChevronRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './AdminParents.module.css';

import { getAdminParentsApi, deleteParentByAdminApi } from '../../../api/adminApi';
import DeleteConfirmModal from '../../../components/Modals/DeleteConfirmModal/DeleteConfirmModal';

interface Parent {
  userId: string;
  fullName?: string;
  fullname?: string; 
  name?: string;     
  email: string;
  phoneNumber?: string; 
}

const AdminParents = () => {
  const [allParents, setAllParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);


  useEffect(() => {
    const fetchParents = async () => {
      setLoading(true);
      try {
        const params = {
          pageNumber: 1,
          pageSize: 50, 
        };

        const response = await getAdminParentsApi(params);
        console.log("Parents API Response:", response);
        
        if (response?.value?.items && Array.isArray(response.value.items)) {
          setAllParents(response.value.items);
        } else if (response?.value && Array.isArray(response.value)) {
          setAllParents(response.value);
        } else {
          setAllParents([]);
        }

      } catch (error: unknown) {
        console.error("Error fetching parents:", error);
        const msg = (error as { response?: { data?: { message?: string } }; message?: string }).response?.data?.message || (error as { message?: string }).message || "حدث خطأ أثناء جلب أولياء الأمور";
        toast.error(`خطأ: ${msg}`);
        setAllParents([]); 
      } finally {
        setLoading(false);
      }
    };

    // استدعاء الدالة
    fetchParents();
  }, []);

  // تم مسح الـ useEffect الخاص بالـ searchTerm ونقل الـ setPage(1) إلى الـ onChange في حقل البحث بالأسفل

  const openDeleteModal = (userId: string) => {
    setSelectedParentId(userId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedParentId) return;
    setIsActionLoading(true);
    try {
      await deleteParentByAdminApi({ userId: selectedParentId });
      setAllParents((prev) => prev.filter((p) => p.userId !== selectedParentId));
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

  const getInitials = (name: string) => {
    if (!name || name === 'غير محدد' || name.trim() === '') return 'أ';
    const parts = name.trim().split(/\s+/);
    return parts[0].substring(0, 1); 
  };

  // 1. Filter local records
  const filteredParents = allParents.filter(p => {
    const name = getParentName(p).toLowerCase();
    const email = (p.email || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || email.includes(search);
  });

  // 2. Paginate filtered local records
  const PAGE_SIZE = 10;
  const totalPages = Math.ceil(filteredParents.length / PAGE_SIZE) || 1;
  const startIndex = (page - 1) * PAGE_SIZE;
  const paginatedParents = filteredParents.slice(startIndex, startIndex + PAGE_SIZE);

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
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1); // تم النقل هنا: بمجرد الكتابة في البحث نعود للصفحة الأولى
            }}
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
          ) : filteredParents.length === 0 ? (
             <tbody>
               <tr>
                 <td colSpan={6} className={styles.loadingOrEmpty}>
                   لا يوجد أولياء أمور لعرضهم.
                 </td>
               </tr>
             </tbody>
          ) : (
             <tbody>
               {paginatedParents.map((parent, index) => {
                 const name = getParentName(parent);
                 return (
                   <tr key={`${parent.userId}-${index}`}>
                     <td>
                       <div className={styles.parentInfo}>
                         <div className={styles.avatar}>
                           {getInitials(name)}
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
        {!loading && filteredParents.length > 0 && (
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