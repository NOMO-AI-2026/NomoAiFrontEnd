import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import styles from './DeleteActivityModal.module.css'; // تأكدي إن ملف الـ CSS ده موجود جنبه بنفس الاسم
import { deleteActivityApi } from '../../../api/doctorApi';

interface DeleteActivityModalProps {
  isOpen: boolean;
  activityId: number | null;
  onClose: () => void;
  onSuccess: () => void; 
}

const DeleteActivityModal: React.FC<DeleteActivityModalProps> = ({ isOpen, activityId, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || activityId === null) return null;

  const handleConfirmDelete = async () => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      await deleteActivityApi(activityId);
      onSuccess(); // نحدث الشاشة
      onClose();   // نقفل المودال
    } catch (err: unknown) {
      console.error("خطأ أثناء الحذف:", err);
      setErrorMsg((err as { response?: { data?: { message?: string } } }).response?.data?.message || "حدث خطأ غير متوقع أثناء محاولة الحذف.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} dir="rtl">
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <AlertTriangle className="inline-block ml-2 mb-1" size={24} />
            تأكيد الحذف
          </h2>
          <button onClick={onClose} disabled={isLoading} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <p className={styles.message}>
            هل أنت متأكد من رغبتك في حذف هذا النشاط من السجل؟ <br/>
          </p>

          {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}

          <div className={styles.actions}>
            <button 
              onClick={handleConfirmDelete} 
              disabled={isLoading}
              className={styles.deleteBtn}
            >
              {isLoading ? 'جاري الحذف...' : 'نعم، احذف النشاط'}
            </button>
            <button 
              onClick={onClose} 
              disabled={isLoading}
              className={styles.cancelBtn}
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteActivityModal;