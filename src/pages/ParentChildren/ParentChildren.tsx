import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { Gamepad2, ChevronRight, ChevronLeft } from "lucide-react";
import ChildCard from "../../components/ChildCard/ChildCard";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchParentChildren } from "../../store/slices/childrenSlice";
import styles from "./ParentChildren.module.css";

const ParentChildren = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate(); 
  
  const { children, isLoading, error, totalPages, searchQuery } = useAppSelector((state) => state.children);

  const [page, setPage] = useState(1);

  // العودة للصفحة الأولى عند تعديل البحث
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  useEffect(() => {
    dispatch(fetchParentChildren({ Name: searchQuery || undefined, pageNumber: page, pageSize: 10 }));
  }, [dispatch, searchQuery, page]);

  const handleView = (id: number) => {
    navigate(`/child/${id}`);
  };

  return (
    <div className={styles.pageContent} dir="rtl">
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>أطفالي</h1>
          <p className={styles.pageSubtitle}>استعراض ومتابعة أطفالك المسجلين في المنصة ومتابعة تقدمهم.</p>
        </div>
        <button className={styles.addBtn} onClick={() => navigate('/session')}>
          <Gamepad2 size={20} />
          بدء الجلسة
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
                  speechLevelNumber={(child as any).speechLevelNumber || (child as any).speechLevelId || (child as any).speechLevel?.id}
                  speechLevelName={(child as any).speechLevelName || (child as any).speechLevel?.levelName}
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
    </div>
  );
};

export default ParentChildren;
