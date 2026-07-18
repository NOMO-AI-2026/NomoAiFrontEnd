import { 
  AudioLines, LayoutDashboard, LineChart, Users, Calendar, BookOpen, 
  HelpCircle, LogOut, PlusCircle, Gamepad2, Activity, Settings 
} from "lucide-react";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  role?: 'doctor' | 'parent';
  activePage?: string;
}

const Sidebar = ({ role = 'doctor', activePage = 'المرضى' }: SidebarProps) => {
  
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
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.logoIconWrapper}>
          <AudioLines className={styles.logoIcon} />
        </div>
        <div>
          <h2 className={styles.brandTitle}>NomoAI</h2>
          <p className={styles.brandSubtitle}>مساعد التخاطب الذكي</p>
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
          <button className={styles.footerBtn}>
            <LogOut className={styles.navIcon} size={20} />
            تسجيل الخروج
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;