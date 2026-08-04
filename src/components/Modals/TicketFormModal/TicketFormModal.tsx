import React, { useState, useEffect } from 'react';
import { X, Edit, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './TicketFormModal.module.css';

interface TicketFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { subject: string; message: string }) => void;
  initialData?: { subject: string; message: string } | null;
  isSubmitting: boolean;
  isEditMode: boolean;
}

const TicketFormModal: React.FC<TicketFormModalProps> = ({
  isOpen, onClose, onSubmit, initialData, isSubmitting, isEditMode
}) => {
  const [formData, setFormData] = useState({ subject: '', message: '' });

  useEffect(() => {
    if (initialData) setFormData(initialData);
    else setFormData({ subject: '', message: '' });
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.message.trim()) return toast.error('يرجى ملء جميع الحقول');
    if (formData.message.trim().length < 10) return toast.error('يجب أن تكون تفاصيل المشكلة 10 أحرف على الأقل');
    onSubmit(formData);
  };

  return (
    <div className={styles.overlay} dir="rtl">
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isEditMode ? <Edit className="ml-2" size={24} style={{ color: '#581C87' }}/> : <PlusCircle className="ml-2" size={24} style={{ color: '#581C87' }}/>}
            {isEditMode ? 'تعديل التذكرة' : 'إنشاء تذكرة جديدة'}
          </h2>
          <button className={styles.closeButton} onClick={onClose} disabled={isSubmitting}>
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.content}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>موضوع التذكرة</label>
              <input 
                type="text" 
                className={styles.formInput}
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
                placeholder="مثال: مشكلة في تسجيل الدخول"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>تفاصيل المشكلة (10 أحرف على الأقل)</label>
              <textarea 
                rows={5}
                className={styles.formTextarea}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
                placeholder="اكتب تفاصيل مشكلتك هنا بوضوح..."
              ></textarea>
            </div>
            <div className={styles.actions}>
              <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? 'جاري الحفظ...' : 'حفظ وإرسال'}
              </button>
              <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isSubmitting}>
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TicketFormModal;