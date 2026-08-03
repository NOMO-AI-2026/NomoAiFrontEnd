import { 
  AudioLines, 
  LayoutDashboard, 
  Users, 
  Gamepad2, 
  HelpCircle, 
  LogOut, 
  X,
  UserCheck,
  BarChart3,
  HeadphonesIcon
} from "lucide-react";
import styles from "./Sidebar.module.css";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAppDispatch } from "../../store/hooks"; 
import { logout } from "../../store/slices/authSlice"; 
import { clearProfile } from "../../store/slices/profileSlice"; 

interface SidebarProps {
  role?: 'doctor' | 'parent' | 'admin';
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ role = 'doctor', isOpen = false, onClose }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout()); 
    dispatch(clearProfile());
    navigate("/login");
  };
  
  // روابط الطبيب (تم إضافة الدعم الفني)
  const doctorLinks = [
    { title: "اللوحة الرئيسية", icon: LayoutDashboard, path: "#" },
    { title: "المرضى", icon: Users, path: "/doctor/children" },
    { title: "الدعم الفني", icon: HeadphonesIcon, path: "/doctor/support" },
  ];

  // روابط ولي الأمر (تم إضافة الدعم الفني)
  const parentLinks = [
    { title: "اللوحة الرئيسية", icon: LayoutDashboard, path: "#" },
    { title: "الأطفال", icon: Users, path: "/parent/children" },
    { title: "الدعم الفني", icon: HeadphonesIcon, path: "/parent/support" },
  ];

  // روابط الأدمن (تم تعديل الاسم ليكون معبر أكثر عن إدارة التذاكر)
  const adminLinks = [
    { title: "اللوحة الرئيسية", icon: LayoutDashboard, path: "/admin" },
    { title: "إدارة الأطباء", icon: UserCheck, path: "/admin/doctors" },
    { title: "إدارة الأهالي", icon: Users, path: "/admin/parents" },
    { title: "تقارير النظام", icon: BarChart3, path: "#" },
    { title: "تذاكر الدعم", icon: HeadphonesIcon, path: "/admin/tickets" },
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
          const isActive = currentPath === link.path || (link.path === '/doctor/children' && currentPath.startsWith('/child/'));
          return (
            <Link 
              key={link.title} 
              to={link.path} 
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <Icon className={styles.navIcon} size={20} />
              {link.title}
            </Link>
          );
        })}
      </nav>

      <div className={styles.sidebarFooter}>
        {/* زر بدء الجلسة يظهر فقط لولي الأمر */}
        {role === 'parent' && (
          <button className={styles.newSessionBtn}
          onClick={() => navigate('/session')}>
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