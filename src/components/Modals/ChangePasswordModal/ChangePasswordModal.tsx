import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';
import styles from './ChangePasswordModal.module.css';
import { changePasswordApi } from '../../../api/profileApi';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const { currentPassword, newPassword, confirmNewPassword } = form;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setErrorMsg("يرجى ملء جميع الحقول المطلوبة.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMsg("كلمة المرور الجديدة وتأكيدها غير متطابقين.");
      return;
    }

    // Password Complexity Validations
    const isLengthValid = newPassword.length >= 8;
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecialChar = /[\W_]/.test(newPassword);

    if (!isLengthValid || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
      setErrorMsg("يجب أن تتكون كلمة المرور الجديدة من 8 أحرف على الأقل، وتحتوي على حرف كبير (A-Z)، وحرف صغير (a-z)، ورقم (0-9)، ورمز خاص واحد على الأقل (مثل @، #، $، %).");
      return;
    }

    setIsLoading(true);

    try {
      await changePasswordApi({
        currentPassword,
        newPassword,
        confirmNewPassword
      });

      setSuccessMsg("تم تغيير كلمة المرور بنجاح.");
      setForm({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });

      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 1500);

    } catch (err: any) {
      console.error("Error changing password:", err.response?.data);
      let apiErr = "حدث خطأ غير متوقع أثناء تغيير كلمة المرور.";
      if (err.response?.data) {
        const data = err.response.data;
        if (data.error?.description) {
          apiErr = data.error.description;
        } else if (data.description) {
          apiErr = data.description;
        } else if (data.errors) {
          if (Array.isArray(data.errors)) {
            apiErr = data.errors.map((e: any) => e.description || e.message || e).join(' ');
          } else if (typeof data.errors === 'object') {
            apiErr = Object.values(data.errors).flat().join(' ');
          } else {
            apiErr = String(data.errors);
          }
        } else if (data.message) {
          apiErr = data.message;
        }
      }
      setErrorMsg(apiErr);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} dir="rtl">
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <Lock size={22} style={{ color: '#581C87' }} />
            تغيير كلمة المرور
          </h2>
          <button onClick={onClose} disabled={isLoading} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.content}>
          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>كلمة المرور الحالية</label>
            <input 
              type="password" 
              name="currentPassword" 
              value={form.currentPassword}
              onChange={handleInputChange}
              className={styles.inputField} 
              disabled={isLoading}
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>كلمة المرور الجديدة</label>
            <input 
              type="password" 
              name="newPassword" 
              value={form.newPassword}
              onChange={handleInputChange}
              className={styles.inputField} 
              disabled={isLoading}
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>تأكيد كلمة المرور الجديدة</label>
            <input 
              type="password" 
              name="confirmNewPassword" 
              value={form.confirmNewPassword}
              onChange={handleInputChange}
              className={styles.inputField} 
              disabled={isLoading}
              required 
            />
          </div>

          {errorMsg && (
            <div className={styles.errorMsg}>
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className={styles.successMsg}>
              {successMsg}
            </div>
          )}

          <div className={styles.actions}>
            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={isLoading}
            >
              {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
            <button 
              type="button" 
              className={styles.cancelBtn} 
              onClick={onClose}
              disabled={isLoading}
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
