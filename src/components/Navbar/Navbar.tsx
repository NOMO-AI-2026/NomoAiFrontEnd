import { Search, Bell, Settings } from "lucide-react";
import styles from "./Navbar.module.css";

const Navbar = () => {
  return (
    <header className={styles.topHeader}>
      <div className={styles.headerTabs}>
        <span className={styles.activeTab}>الطبيب</span>
        <span className={styles.tab}>ولي الأمر</span>
        <span className={styles.tab}>جلسة الطفل</span>
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