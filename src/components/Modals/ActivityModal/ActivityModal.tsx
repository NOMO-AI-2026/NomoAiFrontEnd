import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './ActivityModal.module.css';
import { 
  createActivityApi, 
  updateActivityApi, 
  ActivityItem 
} from '../../../api/doctorApi';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  childId: number;
  activityToEdit: ActivityItem | null; // إذا كان null يعني إضافة، غير ذلك يعني تعديل
  onSuccess: () => void;
}

const ActivityModal: React.FC<ActivityModalProps> = ({ 
  isOpen, 
  onClose, 
  childId, 
  activityToEdit, 
  onSuccess 
}) => {
  const [content, setContent] = useState('');
  const [activityTarget, setActivityTarget] = useState<number | ''>('');
  const [estimatedDurationMinutes, setEstimatedDurationMinutes] = useState<number | ''>('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // التأكد من ملء البيانات عند فتح المودال في وضع التعديل، أو تفريغها في وضع الإضافة
  useEffect(() => {
    if (isOpen) {
      if (activityToEdit) {
        setContent(activityToEdit.content);
        setActivityTarget(activityToEdit.activityTarget);
        setEstimatedDurationMinutes(activityToEdit.estimatedDurationMinutes);
      } else {
        setContent('');
        setActivityTarget('');
        setEstimatedDurationMinutes('');
      }
      setErrorMsg('');
    }
  }, [isOpen, activityToEdit]);

  if (!isOpen) return null;

  const isEditMode = !!activityToEdit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      if (isEditMode && activityToEdit) {
        // نداء مسار التعديل (PUT)
        await updateActivityApi(activityToEdit.id, {
          content,
          activityTarget: Number(activityTarget),
          estimatedDurationMinutes: Number(estimatedDurationMinutes),
        });
      } else {
        // نداء مسار الإضافة (POST)
        await createActivityApi({
          childId,
          content,
          activityTarget: Number(activityTarget),
          estimatedDurationMinutes: Number(estimatedDurationMinutes),
        });
      }
      
      onSuccess(); // لتحديث قائمة الأنشطة في الصفحة الأساسية
      onClose();
    } catch (err: any) {
      console.error("Error saving activity:", err);
      setErrorMsg(err.response?.data?.message || "حدث خطأ أثناء حفظ النشاط. يرجى المحاولة لاحقاً.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay} dir="rtl">
      <div className={styles.modal}>
        
        <div className={styles.header}>
          <div className={styles.headerTitles}>
            <h2 className={styles.title}>
              {isEditMode ? 'تعديل بيانات النشاط' : 'إضافة نشاط جديد'}
            </h2>
            <p className={styles.subtitle}>
              {isEditMode ? 'قم بتحديث محتوى أو هدف النشاط الحالي' : 'حدد تفاصيل النشاط والمدة المقدرة له'}
            </p>
          </div>
          <button onClick={onClose} disabled={isLoading} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}

          <form onSubmit={handleSubmit}>
            
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>محتوى النشاط (الكلمة / الجملة)</label>
              <div className={styles.inputContainer}>
                <textarea 
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={styles.textarea}
                  placeholder='مثال: "أنا ألعب بالكرة" أو "بابا"'
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>الهدف من النشاط (Activity Target ID)</label>
              <div className={styles.inputContainer}>
                <input 
                  type="number" 
                  required min="0"
                  value={activityTarget}
                  onChange={(e) => setActivityTarget(Number(e.target.value))}
                  className={styles.input}
                  placeholder="أدخل رقم الهدف المقترن بالنشاط"
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>المدة التقديرية (بالدقائق)</label>
              <div className={styles.inputContainer}>
                <input 
                  type="number" 
                  required min="1"
                  value={estimatedDurationMinutes}
                  onChange={(e) => setEstimatedDurationMinutes(Number(e.target.value))}
                  className={styles.input}
                  placeholder="مثال: 10"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading || !content || activityTarget === '' || estimatedDurationMinutes === ''}
              className={styles.primaryBtn}
            >
              {isLoading ? 'جاري الحفظ...' : (isEditMode ? 'حفظ التعديلات' : 'إضافة النشاط')}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ActivityModal;