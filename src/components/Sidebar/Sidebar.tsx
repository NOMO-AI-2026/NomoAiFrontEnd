import { 
  AudioLines, 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  BellRing,
  Gamepad2, 
  HelpCircle, 
  LogOut, 
  X,
  UserCheck,
  BarChart3,
  HeadphonesIcon
} from "lucide-react";
import styles from "./Sidebar.module.css";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  role?: 'doctor' | 'parent' | 'admin';
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
  
  // روابط الطبيب
  const doctorLinks = [
    { title: "اللوحة الرئيسية", icon: LayoutDashboard },
    { title: "المرضى", icon: Users },
    { title: "طلبات الأهالي", icon: MessageSquare },
    { title: "التقارير والتنبيهات", icon: BellRing },
  ];

  // روابط ولي الأمر
  const parentLinks = [
    { title: "الرئيسية", icon: LayoutDashboard },
    { title: "الأطفال", icon: Users },
    { title: "تواصل مع الطبيب", icon: MessageSquare },
  ];

  // روابط الأدمن
  const adminLinks = [
    { title: "اللوحة الرئيسية", icon: LayoutDashboard },
    { title: "إدارة الأطباء", icon: UserCheck },
    { title: "إدارة الأهالي", icon: Users },
    { title: "تقارير النظام", icon: BarChart3 },
    { title: "الدعم الفني", icon: HeadphonesIcon },
  ];

  const currentLinks = 
    role === 'admin' ? adminLinks : 
    role === 'doctor' ? doctorLinks : 
    parentLinks;

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
        {/* زر بدء الجلسة يظهر فقط لولي الأمر */}
        {role === 'parent' && (
          <button className={styles.newSessionBtn}>
            <Gamepad2 size={20} />
            بدء الجلسة
          </button>
        )}
        
        <div className={styles.bottomLinks}>
          {/* زر المساعدة يختفي من عند الأدمن */}
          {role !== 'admin' && (
            <button className={styles.footerBtn}>
              <HelpCircle className={styles.navIcon} size={20} />
              المساعدة
            </button>
          )}
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