import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Users, Stethoscope, LogOut, ShieldCheck } from 'lucide-react';
import styles from './AdminLayout.module.css';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // تنظيف البيانات
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    // توجيه لصفحة تسجيل الدخول
    navigate('/login');
  };

  return (
    <div className={styles.adminContainer} dir="rtl">
      
      {/* السايد بار الجانبي */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          {/* تم استخدام درجة الأصفر الأساسية (Primary) من لوحة الألوان */}
          <ShieldCheck size={32} color="#FACC15" />
          <h2>لوحة الإدارة</h2>
        </div>
        
        <nav className={styles.navMenu}>
          {/* رابط صفحة الأطباء */}
          <NavLink 
            to="/admin/doctors" 
            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.activeNavItem}` : styles.navItem}
          >
            <Stethoscope size={22} />
            <span>إدارة الأطباء</span>
          </NavLink>
          
          {/* رابط صفحة أولياء الأمور */}
          <NavLink 
            to="/admin/parents" 
            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.activeNavItem}` : styles.navItem}
          >
            <Users size={22} />
            <span>أولياء الأمور</span>
          </NavLink>
        </nav>

        {/* تسجيل الخروج */}
        <div className={styles.logoutWrapper}>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={20} />
            <span>تسجيل خروج</span>
          </button>
        </div>
      </aside>

      {/* منطقة المحتوى المتغيرة */}
      <main className={styles.mainContent}>
        {/* هنا هيتم حقن صفحات الـ Doctors والـ Parents */}
        <Outlet /> 
      </main>
      
    </div>
  );
};

export default AdminLayout;