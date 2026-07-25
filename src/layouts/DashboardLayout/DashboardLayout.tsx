import { useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import styles from "./DashboardLayout.module.css";
import { Outlet } from "react-router-dom";
import { useAppSelector } from "../../store/hooks"; // تأكدي من مسار الـ hooks

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // قراءة الرول من الريدكس مباشرة (سريع، نظيف، ويدعم التحديث الفوري)
  const role = useAppSelector((state) => state.auth.role) || 'parent';

  return (
    <div className={styles.layout} dir="rtl">
      <Sidebar role={role} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {isSidebarOpen && (
        <div 
          className={styles.sidebarOverlay} 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={styles.mainWrapper}>
        <Navbar onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className={styles.scrollableContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;