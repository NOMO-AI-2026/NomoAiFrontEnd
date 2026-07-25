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

  // ================= التعديل هنا ================= //
  // نقرأ الرول من الريدكس مباشرة، عشان يتحدث لحظياً وقت اللوجين
  const rawRole = useAppSelector((state) => state.auth?.role);
  const isDoctor = rawRole === 'doctor' || rawRole === '0' || String(rawRole).toLowerCase() === 'doctor';
  // =============================================== //

  useEffect(() => {
    // يفضل كمان نربط جلب بيانات البروفايل بوجود الرول أو التوكن
    if (!profileData && rawRole) {
      dispatch(getProfile());
    }
  }, [dispatch, profileData, rawRole]); // ضفنا rawRole هنا عشان لو اتغير يجيب الداتا الجديدة

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