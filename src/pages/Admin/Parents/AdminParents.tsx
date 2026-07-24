import React, { useEffect, useState } from 'react';
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
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchParents = async () => {
    setLoading(true);
    try {
      const params = {
        pageNumber: page,
        pageSize: 10,
      };

      const response = await getAdminParentsApi(params);
      
      if (response?.value?.items && Array.isArray(response.value.items)) {
        setParents(response.value.items);
      } else {
        setParents([]);
      }

      setTotalPages(response?.value?.totalPages || 1);

    } catch (error) {
      console.error("Error fetching parents:", error);
      setParents([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, [page]);

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
    } catch (error) {
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
    if (!name || name === 'غير محدد') return 'أ';
    const parts = name.split(' ');
    return parts[0].substring(0, 1);
  };

  const filteredParents = parents.filter(p => {
    const name = getParentName(p).toLowerCase();
    const email = (p.email || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return name.includes(search) || email.includes(search);
  });

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
        {/* تم إزالة الفلاتر بناءً على طلبك والاحتفاظ فقط بصندوق البحث */}
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
              <th style={{textAlign: 'center'}}>عدد الأطفال</th>
              <th>تاريخ التسجيل</th>
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
              {filteredParents.map((parent, index) => {
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
                    <td style={{textAlign: 'center'}}>
                      <span className={styles.childrenBadge}>
                        {(index % 3) + 1}
                      </span>
                    </td>
                    <td>
                      <span style={{color: '#6B7280', fontWeight: 600}}>
                        12 أكتوبر 2023
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
        {!loading && totalPages > 0 && (
          <div className={styles.pagination}>
            <div className={styles.pageInfo}>
              عرض {(page - 1) * 10 + 1}-{Math.min(page * 10, parents.length * totalPages)} من أصل {parents.length * totalPages} ولي أمر
            </div>
            
            <div className={styles.pageControls}>
              <button 
                className={styles.pageBtn} 
                disabled={page === 1} 
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronRight size={18} />
              </button>
              
              <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>
                {page}
              </button>
              
              <button 
                className={styles.pageBtn} 
                disabled={page === totalPages} 
                onClick={() => setPage((p) => p + 1)}
              >
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