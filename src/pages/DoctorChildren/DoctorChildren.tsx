import { useEffect, useState } from "react";
import { PlusCircle, ChevronRight, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom"; 
import ChildCard from "../../components/ChildCard/ChildCard";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchChildren } from "../../store/slices/childrenSlice/childrenSlice";
import styles from "./DoctorChildren.module.css";
import { useModal } from '../../context/ModalContext'; 
import DeleteConfirmModal from "../../components/Modals/DeleteConfirmModal/DeleteConfirmModal";
import { deleteChildApi } from "../../api/doctorApi";

const DoctorChildren = () => {
  const { openAddChildModal } = useModal();
  const dispatch = useAppDispatch();
  const navigate = useNavigate(); 
  
  const { children, isLoading, error, totalPages, searchQuery } = useAppSelector((state) => state.children);

  const [page, setPage] = useState(1);
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery);
  const [childToDelete, setChildToDelete] = useState<number | null>(null);

  // العودة للصفحة الأولى عند تعديل البحث بدون set-state-in-effect
  if (prevSearchQuery !== searchQuery) {
    setPrevSearchQuery(searchQuery);
    setPage(1);
  }

  useEffect(() => {
    dispatch(fetchChildren({ Name: searchQuery || undefined, pageNumber: page, pageSize: 10 }));

    const handleRefresh = () => {
      dispatch(fetchChildren({ Name: searchQuery || undefined, pageNumber: page, pageSize: 10 }));
    };

    window.addEventListener('refreshChildrenList', handleRefresh);
    return () => {
      window.removeEventListener('refreshChildrenList', handleRefresh);
    };
  }, [dispatch, searchQuery, page]);

  const handleDeleteClick = (id: number) => {
    setChildToDelete(id);
  };

  const handleView = (id: number) => {
    navigate(`/child/${id}`);
  };

  return (
    <div className={styles.pageContent} dir="rtl">
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>سجل المرضى</h1>
          <p className={styles.pageSubtitle}>إدارة ومتابعة جميع الأطفال المعينين لك.</p>
        </div>
        <button className={styles.addBtn} onClick={() => openAddChildModal(null)}>
          <PlusCircle size={20} />
          إضافة طفل جديد
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[40vh] w-full bg-[#F8F7FF]">
          <div className="text-xl font-extrabold text-[#6C34AF]">جاري تحميل بيانات الأطفال...</div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center min-h-[40vh] w-full bg-[#F8F7FF]">
          <div className="text-xl font-bold text-red-500">{error}</div>
        </div>
      ) : (
        <>
          <div className={styles.patientsGrid}>
            {children && children.length > 0 ? (
              children.map((child) => (
                <ChildCard
                    key={child.id}
                    id={child.id}
                    name={child.fullName} 
                    age={`${child.age} سنوات`} 
                    gender={child.gender} 
                    speechLevelNumber={child.speechLevelNumber || child.speechLevelId || child.speechLevel?.id}
                    speechLevelName={child.speechLevelName || child.speechLevel?.levelName}
                    onDelete={handleDeleteClick} 
                    onView={handleView} 
                />
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-gray-500 font-bold bg-white rounded-xl border border-dashed border-gray-300">
                لا يوجد أطفال مسجلين أو مطبقين لمعايير البحث حالياً.
              </div>
            )}
          </div>

          {/* عناصر التحكم في الصفحات Pagination - يختفي إذا كان إجمالي الصفحات 1 أو أقل */}
          {children && children.length > 0 && totalPages > 1 && (
            <div className={styles.pagination}>
              <div className={styles.pageInfo}>
                الصفحة {page} من {Math.max(totalPages || 1, 1)}
              </div>
              <div className={styles.pageControls}>
                <button 
                  className={styles.pageBtn} 
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  <ChevronRight size={18} />
                  السابق
                </button>
                <button 
                  className={styles.pageBtn} 
                  disabled={page >= Math.max(totalPages || 1, 1)}
                  onClick={() => setPage(p => p + 1)}
                >
                  التالي
                  <ChevronLeft size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <DeleteConfirmModal 
        isOpen={childToDelete !== null}
        onClose={() => setChildToDelete(null)}
        onConfirm={async () => {
          if (childToDelete !== null) {
            await deleteChildApi(childToDelete);
            dispatch(fetchChildren({ Name: searchQuery || undefined, pageNumber: page, pageSize: 10 }));
          }
        }}
        title="تأكيد الحذف"
        message="هل أنت متأكد من رغبتك في حذف هذا الطفل من السجل؟"
        deleteBtnText="نعم، احذف الطفل"
      />
    </div>
  );
};

export default DoctorChildren;