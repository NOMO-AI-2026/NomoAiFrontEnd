import { useEffect } from "react";
import { Search, Settings, Menu, User, Sparkles } from "lucide-react";
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

  const rawRole = useAppSelector((state) => state.auth?.role);
  const isDoctor = rawRole === 'doctor';

  useEffect(() => {
    if (!profileData && rawRole) {
      dispatch(getProfile());
    }
  }, [dispatch, profileData, rawRole]);

  const firstName = profileData?.fullName?.trim().split(/\s+/)[0] || '';

  return (
    <header className={styles.topHeader}>
      <div className={styles.headerStart}>
        <button className={styles.menuBtn} onClick={onMenuToggle} aria-label="فتح القائمة">
          <Menu size={22} />
        </button>
        {profileData && (
          <div className={styles.welcomeContainer}>
            <Sparkles className={styles.welcomeIcon} size={28} />
            <span className={styles.welcomeText}>
              أهلاً بك في <span className={styles.brandHighlight}>NomoAI</span>، {isDoctor ? 'د. ' : 'أ. '}{firstName}
            </span>
          </div>
        )}
      </div>

      <div className={styles.headerEnd}>
        <div className={styles.searchBar}>
          <Search className={styles.searchIcon} size={18} />
          <input type="text" placeholder="ابحث عن طفل..." className={styles.searchInput} />
        </div>
        
        <Link to="/settings" className={styles.iconBtn} aria-label="الإعدادات">
          <Settings size={20} />
        </Link>
        
        <Link to="/profile" className={styles.iconBtn} aria-label="الصفحة الشخصية">
          <User size={20} />
        </Link>
      </div>
    </header>
  );
};

export default Navbar;