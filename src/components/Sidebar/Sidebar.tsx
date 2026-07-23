import { 
  AudioLines, LayoutDashboard, LineChart, Users, Calendar, BookOpen, 
  HelpCircle, LogOut, PlusCircle, Gamepad2, Activity, Settings, X
} from "lucide-react";
import styles from "./Sidebar.module.css";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  role?: 'doctor' | 'parent';
  activePage?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ role = 'doctor', activePage = 'المرضى', isOpen = false, onClose }: SidebarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };
  
  const doctorLinks = [
    { title: "اللوحة الرئيسية", icon: LayoutDashboard },
    { title: "التحليلات", icon: LineChart },
    { title: "المرضى", icon: Users },
    { title: "الجدول الزمني", icon: Calendar },
    { title: "مكتبة المصادر", icon: BookOpen },
  ];

  const parentLinks = [
    { title: "الرئيسية", icon: LayoutDashboard },
    { title: "تقارير التقدم", icon: Activity },
    { title: "سجل اللعب", icon: Gamepad2 },
    { title: "الإعدادات", icon: Settings },
  ];

  const currentLinks = role === 'doctor' ? doctorLinks : parentLinks;

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
      <div className={styles.brand}>
        <div className={styles.logoIconWrapper}>
          <AudioLines className={styles.logoIcon} />
        </div>
        <div className={styles.brandText}>
          <h2 className={styles.brandTitle}>NomoAI</h2>
          <p className={styles.brandSubtitle}>مساعد التخاطب الذكي</p>
        </div>
        <button className={styles.closeBtn} onClick={onClose} aria-label="إغلاق القائمة">
          <X className={styles.closeIcon} size={20} />
        </button>
      </div>

      {/* Mobile-only perspective switcher (migrated from Navbar) */}
      <div className={styles.mobileTabs}>
        <div className={styles.mobileTabsTitle}>تبديل الحساب</div>
        <div className={styles.mobileTabsList}>
          <span className={`${styles.mobileTab} ${styles.activeMobileTab}`}>الطبيب</span>
          <span className={styles.mobileTab}>ولي الأمر</span>
          <span className={styles.mobileTab}>جلسة الطفل</span>
        </div>
      </div>

      <nav className={styles.navMenu}>
        {currentLinks.map((link) => {
          const Icon = link.icon;
          return (
            <a 
              key={link.title} 
              href="#" 
              className={`${styles.navItem} ${activePage === link.title ? styles.active : ''}`}
            >
              <Icon className={styles.navIcon} size={20} />
              {link.title}
            </a>
          );
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        {role === 'doctor' && (
          <button className={styles.newSessionBtn}>
            <PlusCircle size={20} />
            جلسة جديدة
          </button>
        )}
        
        <div className={styles.bottomLinks}>
          <button className={styles.footerBtn}>
            <HelpCircle className={styles.navIcon} size={20} />
            المساعدة
          </button>
          <button className={styles.footerBtn} onClick={handleLogout}>
            <LogOut className={styles.navIcon} size={20} />
            تسجيل الخروج
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;