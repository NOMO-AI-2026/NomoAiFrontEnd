import { useEffect } from "react";
import { PlusCircle } from "lucide-react";
import ChildCard from "../../components/ChildCard/ChildCard";
import styles from "./DoctorChildren.module.css";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchChildren } from "../../store/slices/childrenSlice";

const DoctorChildren = () => {
  const dispatch = useAppDispatch();
  const { children, isLoading, error } = useAppSelector((state) => state.children);

  useEffect(() => {
    dispatch(fetchChildren());
  }, [dispatch]);

  const handleDelete = (id: number) => {
    console.log("سيتم حذف الطفل رقم:", id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-2xl font-extrabold text-[#6B21A8]">جاري تحميل بيانات الأطفال...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
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
        <button className={styles.addBtn}>
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
                onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-gray-500 font-bold">
            لا يوجد أطفال مسجلين حالياً.
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorChildren;