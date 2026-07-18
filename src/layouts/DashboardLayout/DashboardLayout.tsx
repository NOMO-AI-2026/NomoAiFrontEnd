import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import styles from "./DashboardLayout.module.css";
import { Outlet } from "react-router-dom";
interface DashboardLayoutProps {
  children?: React.ReactNode;
  role?: 'doctor' | 'parent';
  activePage?: string;
}

const DashboardLayout = ({ role = 'doctor', activePage }: DashboardLayoutProps) => {
  return (
    <div className={styles.layout} dir="rtl">
      <Sidebar role={role} activePage={activePage} />
      <div className={styles.mainWrapper}>
        <Navbar />
        <main className={styles.scrollableContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;