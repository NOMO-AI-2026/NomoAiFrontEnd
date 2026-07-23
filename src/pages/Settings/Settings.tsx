import { useState } from 'react';
import { Mail, Lock, Trash2, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { deleteAccountApi } from '../../api/profileApi';
import styles from './Settings.module.css';

import ChangeEmailModal from '../../components/Modals/ChangeEmailModal/ChangeEmailModal';
import ChangePasswordModal from '../../components/Modals/ChangePasswordModal/ChangePasswordModal';
import DeleteConfirmModal from '../../components/Modals/DeleteConfirmModal/DeleteConfirmModal';

const Settings = () => {
  const navigate = useNavigate();

  // Modals display states
  const [isChangeEmailOpen, setIsChangeEmailOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Handle Delete Account Execution
  const handleDeleteAccountSubmit = async () => {
    await deleteAccountApi();
    
    // Clear localStorage session
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    navigate("/signup");
  };

  return (
    <div className={styles.settingsContainer} dir="rtl">
      <div className={styles.pageHeader}>
        <div className={styles.titleWrapper}>
          <h1 className={styles.settingsTitle}>إعدادات الحساب</h1>
        </div>
      </div>

      <div className={styles.gridContainer}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>
              <SettingsIcon size={22} style={{ color: '#581C87' }} />
              التحكم في الحساب
            </h3>
          </div>
          
          <div className={styles.actionButtonsRow}>
            <button 
              className={styles.actionBtn} 
              onClick={() => setIsChangeEmailOpen(true)}
            >
              <Mail size={18} />
              تغيير البريد الإلكتروني
            </button>

            <button 
              className={styles.actionBtn} 
              onClick={() => setIsChangePasswordOpen(true)}
            >
              <Lock size={18} />
              تغيير كلمة المرور
            </button>

            <button 
              className={styles.deleteAccountBtn} 
              onClick={() => setIsDeleteConfirmOpen(true)}
            >
              <Trash2 size={18} />
              حذف الحساب
            </button>
          </div>
        </div>
      </div>

      {/* Change Email Modal */}
      <ChangeEmailModal 
        isOpen={isChangeEmailOpen} 
        onClose={() => setIsChangeEmailOpen(false)} 
      />

      {/* Change Password Modal */}
      <ChangePasswordModal 
        isOpen={isChangePasswordOpen} 
        onClose={() => setIsChangePasswordOpen(false)} 
      />

      {/* Delete Account Confirmation Modal */}
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

export default Settings;
