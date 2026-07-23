import { useEffect } from "react";
import { Search, Bell, Settings, Menu, User } from "lucide-react";
import { Link } from "react-router-dom"; 
import styles from "./Navbar.module.css";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { getProfile } from "../../store/slices/profileSlice";

interface NavbarProps {
  onMenuToggle?: () => void;
}

const Navbar = ({ onMenuToggle }: NavbarProps) => {
  const dispatch = useAppDispatch();
  const { data: profileData } = useAppSelector((state) => state.profile);

  // Decode JWT payload dynamically to verify role
  const getRoleFromToken = (): number | null => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decoded = JSON.parse(jsonPayload);
      
      let roleClaim: string | string[] | null = null;
      for (const key in decoded) {
        if (key.toLowerCase().includes("role")) {
          roleClaim = decoded[key];
          break;
        }
      }

      if (roleClaim) {
        const roles = Array.isArray(roleClaim) ? roleClaim : [roleClaim];
        const normalizedRoles = roles.map(r => String(r).toLowerCase().trim());
        if (normalizedRoles.includes("doctor") || normalizedRoles.includes("0")) return 0;
        if (normalizedRoles.includes("parent") || normalizedRoles.includes("1")) return 1;
      }
      return null;
    } catch (e) {
      console.error("Error decoding token:", e);
      return null;
    }
  };

  const isDoctor = getRoleFromToken() === 0;

  useEffect(() => {
    if (!profileData) {
      dispatch(getProfile());
    }
  }, [dispatch, profileData]);

  return (
    <header className={styles.topHeader}>
      <div className={styles.headerStart}>
        <button className={styles.menuBtn} onClick={onMenuToggle} aria-label="فتح القائمة">
          <Menu size={24} />
        </button>
        {profileData && (
          <div className={styles.welcomeContainer}>
            <span className={styles.welcomeText}>
              أهلاً بك، {isDoctor ? 'د. ' : ''}{profileData.fullName} 👋
            </span>
          </div>
        )}
      </div>

      <div className={styles.headerEnd}>
        <div className={styles.searchBar}>
          <Search className={styles.searchIcon} size={18} />
          <input type="text" placeholder="ابحث عن المرضى..." className={styles.searchInput} />
        </div>
        
        <button className={styles.iconBtn} aria-label="الإشعارات">
          <Bell size={20} />
        </button>
        <Link to="/settings" className={styles.iconBtn} aria-label="الإعدادات">
          <Settings size={20} />
        </Link>
        
        <Link to="/profile" className={styles.iconBtn} aria-label="الصفحة الشخصية">
          <User size={24} />
        </Link>
      </div>
    </header>
  );
};

export default Navbar;