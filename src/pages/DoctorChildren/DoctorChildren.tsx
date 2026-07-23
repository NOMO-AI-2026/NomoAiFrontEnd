import { useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom"; 
import ChildCard from "../../components/ChildCard/ChildCard";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchChildren } from "../../store/slices/childrenSlice";
import styles from "./DoctorChildren.module.css";
import { useModal } from '../../context/ModalContext'; 
import DeleteConfirmModal from "../../components/Modals/DeleteConfirmModal/DeleteConfirmModal";
import { deleteChildApi } from "../../api/doctorApi";

const DoctorChildren = () => {
  const { openAddChildModal } = useModal();
  const dispatch = useAppDispatch();
  const navigate = useNavigate(); 
  const { children, isLoading, error } = useAppSelector((state) => state.children);

  const [childToDelete, setChildToDelete] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchChildren());

    const handleRefresh = () => {
      dispatch(fetchChildren());
    };

    window.addEventListener('refreshChildrenList', handleRefresh);
    return () => {
      window.removeEventListener('refreshChildrenList', handleRefresh);
    };
  }, [dispatch]);

  const handleDeleteClick = (id: number) => {
    setChildToDelete(id);
  };

  const handleView = (id: number) => {
    navigate(`/child/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] w-full bg-[#F8F7FF]">
        <div className="text-xl font-extrabold text-[#6C34AF]">جاري تحميل بيانات الأطفال...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] w-full bg-[#F8F7FF]">
        <div className="text-xl font-bold text-red-500">{error}</div>
      </div>
    );
  }

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

      <div className={styles.patientsGrid}>
        {children && children.length > 0 ? (
          children.map((child) => (
            <ChildCard
                key={child.id}
                id={child.id}
                name={child.fullName} 
                age={`${child.age} سنوات`} 
                gender={child.gender} 
                onDelete={handleDeleteClick} 
                onView={handleView} 
            />
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500 font-bold">
            لا يوجد أطفال مسجلين حالياً.
          </div>
        )}
      </div>

      <DeleteConfirmModal 
        isOpen={childToDelete !== null}
        onClose={() => setChildToDelete(null)}
        onConfirm={async () => {
          if (childToDelete !== null) {
            await deleteChildApi(childToDelete);
            dispatch(fetchChildren());
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