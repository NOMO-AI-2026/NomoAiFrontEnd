import { useEffect } from "react";
import { PlusCircle, Search, Bell, Users, LayoutDashboard, Calendar, Settings, LogOut } from "lucide-react";
import ChildCard from "../../components/ChildCard/ChildCard";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchChildren } from "../../store/slices/childrenSlice";
import styles from "./DoctorChildren.module.css";

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
    <div className={styles.layout} dir="rtl">
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.logoIconWrapper}>
            <Users className={styles.logoIcon} />
          </div>
          <div>
            <h2 className={styles.brandTitle}>نومو</h2>
            <p className={styles.brandSubtitle}>منصة الذكاء الاصطناعي</p>
          </div>
        </div>

        <nav className={styles.navMenu}>
          <a href="#" className={styles.navItem}>
            <LayoutDashboard size={20} />
            لوحة القيادة
          </a>
          <a href="#" className={`${styles.navItem} ${styles.active}`}>
            <Users size={20} />
            سجل المرضى
          </a>
          <a href="#" className={styles.navItem}>
            <Calendar size={20} />
            المواعيد
          </a>
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.newSessionBtn}>
            <PlusCircle size={20} />
            جلسة جديدة
          </button>
          
          <div className={styles.bottomLinks}>
            <button className={styles.footerBtn}>
              <Settings size={20} />
              الإعدادات
            </button>
            <button className={styles.footerBtn}>
              <LogOut size={20} />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Top Header */}
        <header className={styles.topHeader}>
          <div className={styles.headerTabs}>
            <span className={styles.activeTab}>جميع المرضى</span>
            <span className={styles.tab}>الحالات النشطة</span>
            <span className={styles.tab}>أرشيف</span>
          </div>

          <div className={styles.headerActions}>
            <div className={styles.searchBar}>
              <Search className={styles.searchIcon} size={18} />
              <input type="text" placeholder="بحث عن مريض..." className={styles.searchInput} />
            </div>
            <button className={styles.iconBtn}>
              <Bell size={24} />
            </button>
            <img src="https://ui-avatars.com/api/?name=Doctor&background=FACC15&color=1E1B4B" alt="Doctor" className={styles.avatar} />
          </div>
        </header>

        {/* Page Content */}
        <div className={styles.pageContent}>
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>سجل المرضى</h1>
              <p className={styles.pageSubtitle}>إدارة ومتابعة جميع الأطفال المعينين لك.</p>
            </div>
            
           <button 
  className={styles.addBtn}
  onClick={() => window.dispatchEvent(new Event('openAddChildModal'))}
>
  <PlusCircle size={20} strokeWidth={2.5} />
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
              <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-[#EBE5F7] border-dashed">
                <p className="text-lg text-[#6C34AF] font-extrabold">لا يوجد أطفال مسجلين حالياً.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DoctorChildren;