import { useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import styles from "./DashboardLayout.module.css";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Decode JWT payload dynamically to verify role
  const getRoleFromToken = (): 'doctor' | 'parent' | 'admin' => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return 'parent';
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(jsonPayload);
      
      let roleClaim: any = null;
      for (const key in decoded) {
        if (key.toLowerCase().includes("role")) {
          roleClaim = decoded[key];
          break;
        }
      }

      if (roleClaim) {
        const roles = Array.isArray(roleClaim) ? roleClaim : [roleClaim];
        const normalizedRoles = roles.map(r => String(r).toLowerCase().trim());
        if (normalizedRoles.includes("admin")) return 'admin';
        if (normalizedRoles.includes("doctor") || normalizedRoles.includes("0")) return 'doctor';
        if (normalizedRoles.includes("parent") || normalizedRoles.includes("1")) return 'parent';
      }
      return 'parent';
    } catch (e) {
      return 'parent';
    }
  };

  const role = getRoleFromToken();

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