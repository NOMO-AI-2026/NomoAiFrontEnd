import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import styles from './DeleteConfirmModal.module.css';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>; 
  title?: string;
  message: string | React.ReactNode;
  deleteBtnText?: string;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "تأكيد الحذف", 
  message, 
  deleteBtnText = "حذف" 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleConfirmDelete = async () => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      await onConfirm();
      onClose();   
    } catch (err: unknown) {
      console.error("خطأ أثناء الحذف:", err);
      setErrorMsg(
        (err as { response?: { data?: { message?: string; error?: { description?: string } } } }).response?.data?.error?.description ||
        (err as { response?: { data?: { message?: string } } }).response?.data?.message || 
        "حدث خطأ غير متوقع أثناء محاولة الحذف."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} dir="rtl">
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <AlertTriangle className="inline-block ml-2 mb-1" size={24} style={{ color: '#EF4444' }} />
            {title}
          </h2>
          <button onClick={onClose} disabled={isLoading} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.message}>
            {message}
          </div>

          {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}

          <div className={styles.actions}>
            <button 
              onClick={handleConfirmDelete} 
              disabled={isLoading}
              className={styles.deleteBtn}
            >
              {isLoading ? 'جاري الحذف...' : deleteBtnText}
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