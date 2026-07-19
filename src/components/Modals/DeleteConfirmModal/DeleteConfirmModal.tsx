import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import styles from './DeleteConfirmModal.module.css';
import { deleteChildApi } from '../../../api/doctorApi';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  childId: number | null;
  onClose: () => void;
  onSuccess: () => void; 
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ isOpen, childId, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || childId === null) return null;

  const handleConfirmDelete = async () => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      await deleteChildApi(childId);
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
            هل أنت متأكد من رغبتك في حذف هذا الطفل من السجل؟ <br/>
          </p>

          {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}

          <div className={styles.actions}>
            <button 
              onClick={handleConfirmDelete} 
              disabled={isLoading}
              className={styles.deleteBtn}
            >
              {isLoading ? 'جاري الحذف...' : 'نعم، احذف الطفل'}
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

export default DeleteConfirmModal;