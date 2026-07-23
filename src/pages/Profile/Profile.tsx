import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks'; 
import { getProfile, clearProfile } from '../../store/slices/profileSlice';
import styles from './Profile.module.css';
import { useNavigate } from 'react-router-dom';
import { deleteAccountApi } from '../../api/profileApi';
import { Lock, Trash2, Edit2, AtSign } from 'lucide-react';

// استيراد المودالز
import ChangePasswordModal from '../../components/Modals/ChangePasswordModal/ChangePasswordModal';
import DeleteConfirmModal from '../../components/Modals/DeleteConfirmModal/DeleteConfirmModal';
import EditProfileModal from '../../components/Modals/EditProfileModal/EditProfileModal';
import ChangeEmailModal from '../../components/Modals/ChangeEmailModal/ChangeEmailModal'; // تأكدي من مسار الاستيراد

const Profile = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data, loading, updateLoading, error } = useAppSelector((state) => state.profile);

  // Modal display states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isChangeEmailOpen, setIsChangeEmailOpen] = useState(false); // ستيت مودال تغيير الإيميل

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
        const isDoc = normalizedRoles.includes("doctor") || normalizedRoles.includes("0");
        const isPar = normalizedRoles.includes("parent") || normalizedRoles.includes("1");
        if (isDoc) return 0;
        if (isPar) return 1;
      }
      return null;
    } catch (error) {
        console.error("Error decoding token:", error);
      return null;
    }
  };

  const tokenRole = getRoleFromToken();
  const isDoctor = tokenRole === 0;

  useEffect(() => {
    dispatch(getProfile());
    return () => {
      dispatch(clearProfile());
    };
  }, [dispatch]);

  // Handle Delete Account Execution
  const handleDeleteAccountSubmit = async () => {
    await deleteAccountApi();
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/signup");
  };

  if (loading) {
    return (
      <div className={styles.profileContainer} dir="rtl">
        <div className={styles.loadingState}>جاري تحميل البيانات...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.profileContainer} dir="rtl">
        <div className={styles.errorState}>{error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.profileContainer} dir="rtl">
        <div className={styles.errorState}>عذراً، لم نتمكن من العثور على بيانات هذا الحساب.</div>
      </div>
    ); 
  }

  return (
    <div className={styles.profileContainer} dir="rtl">
      <div className={styles.pageHeader}>
        <div className={styles.titleWrapper}>
          <h1 className={styles.profileTitle}>الملف الشخصي للمستخدم</h1>
        </div>
      </div>

      <div className={styles.gridContainer}>
        <div className={styles.cardsStack}>
          
          {/* Basic Info Card */}
          <div className={styles.card}>
            <div className={styles.cardHeaderWithAction}>
              <h3 className={styles.cardTitle}>المعلومات الأساسية</h3>
              <button className={styles.editBtn} onClick={() => setIsEditModalOpen(true)}>
                <Edit2 size={16} /> تعديل
              </button>
            </div>
            
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>الاسم بالكامل</span>
                <span className={styles.infoValue}>{data.fullName}</span>
              </div>
              
              {/* العمر تم نقله هنا بدل الإيميل */}
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>العمر</span>
                <span className={styles.infoValue}>{data.age ? `${data.age} سنة` : 'لم يتم التحديد'}</span>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>رقم الهاتف</span>
                <span className={styles.infoValue}>{data.phoneNumber || 'لم يتم التحديد'}</span>
              </div>

              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>النوع</span>
                <span className={styles.infoValue}>{data.gender === 0 ? 'ذكر' : 'أنثى'}</span>
              </div>

              {/* البريد الإلكتروني مع الزر الخاص به */}
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>البريد الإلكتروني</span>
                <span className={styles.infoValue} dir="ltr" style={{ display: 'block', textAlign: 'right', marginBottom: '10px' }}>
                  {data.email}
                </span>
                <button 
                  onClick={() => setIsChangeEmailOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 16px',
                    border: '1.5px solid #581C87',
                    borderRadius: '8px',
                    backgroundColor: 'transparent',
                    color: '#581C87',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F5F3FF'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <AtSign size={16} /> تغيير البريد الإلكتروني
                </button>
              </div>
            </div>
          </div>

          {/* Doctor-Specific Card (Conditional) */}
          {isDoctor && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>البيانات المهنية للطبيب</h3>
              </div>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>سنوات الخبرة</span>
                  <span className={styles.infoValue}>
                    {data.doctorSpecificData?.yearsOfExperience !== null && data.doctorSpecificData?.yearsOfExperience !== undefined
                      ? `${data.doctorSpecificData.yearsOfExperience} سنوات`
                      : 'لم يتم التحديد'}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>اسم العيادة</span>
                  <span className={styles.infoValue}>
                    {data.doctorSpecificData?.clinicName || 'لم يتم التحديد'}
                  </span>
                </div>
                <div className={styles.infoItem} style={{ gridColumn: 'span 2' }}>
                  <span className={styles.infoLabel}>نبذة مهنية</span>
                  <span className={styles.infoValue}>
                    {data.doctorSpecificData?.professionalBio || 'لا توجد نبذة حالياً'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Account Actions Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>إعدادات الحساب</h3>
            </div>
            <div className={styles.actionButtonsRow}>
              <button className={styles.changePasswordBtn} onClick={() => setIsChangePasswordOpen(true)}>
                <Lock size={18} /> تغيير كلمة المرور
              </button>
              <button className={styles.deleteAccountBtn} onClick={() => setIsDeleteConfirmOpen(true)}>
                <Trash2 size={18} /> حذف الحساب
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* المودالز */}
      <EditProfileModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentData={data}
        isDoctor={isDoctor}
        updateLoading={updateLoading}
      />

      <ChangePasswordModal 
        isOpen={isChangePasswordOpen} 
        onClose={() => setIsChangePasswordOpen(false)} 
      />

      {/* مودال تغيير البريد الإلكتروني الجديد */}
      <ChangeEmailModal 
        isOpen={isChangeEmailOpen}
        onClose={() => setIsChangeEmailOpen(false)}
      />

      <DeleteConfirmModal 
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteAccountSubmit}
        title="تأكيد حذف الحساب"
        message={
          <>
            هل أنت متأكد تماماً من رغبتك في حذف حسابك؟ 
            <br />
            <span style={{ color: '#dc2626', fontWeight: 800 }}>تنبيه: هذا الإجراء نهائي ولا يمكن التراجع عنه مطلقاً وسيتم مسح جميع بياناتك وجلسات أطفالك المسجلة.</span>
          </>
        }
        deleteBtnText="نعم، احذف الحساب"
      />

    </div>
  );
};

export default Profile;