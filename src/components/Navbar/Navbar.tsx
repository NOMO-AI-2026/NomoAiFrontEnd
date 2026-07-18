import { Search, Bell, Settings, Menu } from "lucide-react";
import styles from "./Navbar.module.css";

interface NavbarProps {
  onMenuToggle?: () => void;
}

const Navbar = ({ onMenuToggle }: NavbarProps) => {
  return (
    <header className={styles.topHeader}>
      <div className={styles.headerStart}>
        <button className={styles.menuBtn} onClick={onMenuToggle} aria-label="فتح القائمة">
          <Menu size={24} />
        </button>
        <div className={styles.headerTabs}>
          <span className={styles.activeTab}>الطبيب</span>
          <span className={styles.tab}>ولي الأمر</span>
          <span className={styles.tab}>جلسة الطفل</span>
        </div>
      </div>

      <div className={styles.headerActions}>
        <div className={styles.searchBar}>
          <Search className={styles.searchIcon} size={18} />
          <input type="text" placeholder="ابحث عن المرضى..." className={styles.searchInput} />
        </div>
        <button className={styles.iconBtn}>
          <Bell size={20} />
        </button>
        <button className={styles.iconBtn}>
          <Settings size={20} />
        </button>
        <img src="https://i.pravatar.cc/150?img=47" alt="الطبيب" className={styles.avatar} />
      </div>
    </header>
  );
};

export default Navbar;