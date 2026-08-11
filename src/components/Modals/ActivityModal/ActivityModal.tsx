import React, { useState, useEffect } from 'react';
import { X, Activity, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './ActivityModal.module.css';
import { 
  createActivityApi, 
  updateActivityApi, 
  type ActivityItem 
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
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [activityTarget, setActivityTarget] = useState<number | ''>('');
  const [estimatedDurationMinutes, setEstimatedDurationMinutes] = useState<number | ''>('');
  const [canMakeSession, setCanMakeSession] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isCreditError, setIsCreditError] = useState(false);

  // التأكد من ملء البيانات عند فتح المودال في وضع التعديل، أو تفريغها في وضع الإضافة
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isOpen) {
      if (activityToEdit) {
        setContent(activityToEdit.content);
        setActivityTarget(activityToEdit.activityTarget);
        setEstimatedDurationMinutes(activityToEdit.estimatedDurationMinutes);
        setCanMakeSession(activityToEdit.canMakeSession ?? false);
      } else {
        setContent('');
        setActivityTarget('');
        setEstimatedDurationMinutes('');
        setCanMakeSession(false);
      }
      setErrorMsg('');
      setIsCreditError(false);
    }
  }, [isOpen, activityToEdit]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!isOpen) return null;

  const isEditMode = !!activityToEdit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsCreditError(false);

    const durationNum = Number(estimatedDurationMinutes);
    if (!durationNum || durationNum < 1 || durationNum > 60) {
      setErrorMsg('يجب أن تكون المدة التقديرية للنشاط بين 1 و 60 دقيقة.');
      return;
    }

    setIsLoading(true);

    try {
      if (isEditMode && activityToEdit) {
        // نداء مسار التعديل (PUT)
        await updateActivityApi(activityToEdit.id, {
          content,
          activityTarget: Number(activityTarget),
          estimatedDurationMinutes: Number(estimatedDurationMinutes),
          canMakeSession,
        });
      } else {
        // نداء مسار الإضافة (POST)
        await createActivityApi({
          childId,
          content,
          activityTarget: Number(activityTarget),
          estimatedDurationMinutes: Number(estimatedDurationMinutes),
          canMakeSession: Boolean(canMakeSession),
        });
      }
      
      onSuccess(); // لتحديث قائمة الأنشطة في الصفحة الأساسية
      onClose();
    } catch (err: unknown) {
      console.error("Error saving activity:", err);
      const errorResponse = err as { 
        response?: { 
          data?: { 
            message?: string; 
            description?: string;
            code?: string;
            type?: string;
            errors?: Record<string, string[]>;
            error?: { code?: string; description?: string };
          } 
        } 
      };

      const responseData = errorResponse.response?.data;
      const errString = JSON.stringify(responseData || "").toLowerCase();

      const isInsufficientCredit = 
        errString.includes('insufficientcredit') ||
        errString.includes('enough credits') ||
        responseData?.code === 'DoctorDashboard.InsufficientCredit' ||
        responseData?.error?.code === 'DoctorDashboard.InsufficientCredit' ||
        responseData?.type === 'DoctorDashboard.InsufficientCredit';

      const isDurationError =
        errString.includes('estimateddurationminutes') ||
        errString.includes('between 1 and 60') ||
        errString.includes('60 minutes');

      if (isInsufficientCredit) {
        setIsCreditError(true);
        setErrorMsg('رصيد الدقائق المتاح لديك غير كافٍ لإتاحة هذا النشاط لبدء جلسة جديدة. يرجى تجديد الاشتراكات أو شراء باقة دقائق جديدة.');
      } else if (isDurationError) {
        setIsCreditError(false);
        setErrorMsg('يجب أن تكون المدة التقديرية للنشاط بين 1 و 60 دقيقة.');
      } else {
        setIsCreditError(false);
        setErrorMsg(
          responseData?.error?.description ||
            responseData?.description ||
            responseData?.message ||
            'حدث خطأ أثناء حفظ النشاط. يرجى المحاولة لاحقاً.',
        );
      }
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
              <Activity size={22} style={{ color: '#581C87' }} />
              <span>{isEditMode ? 'تعديل بيانات النشاط' : 'إضافة نشاط جديد'}</span>
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
          {errorMsg && (
            <div className={styles.errorMsg}>
              <div>{errorMsg}</div>
              {isCreditError && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/doctor/subscriptions');
                  }}
                  className="mt-3 inline-flex items-center gap-2 bg-[#581C87] text-white text-sm font-extrabold px-4 py-2 rounded-xl hover:bg-[#4C1D95] transition-all shadow-sm cursor-pointer"
                >
                  <CreditCard size={16} />
                  الانتقال للخطط والباقات
                </button>
              )}
            </div>
          )}

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
              <label className={styles.inputLabel}>الهدف من النشاط</label>
              <div className={styles.inputContainer}>
                <select 
                  required
                  value={activityTarget}
                  onChange={(e) => setActivityTarget(Number(e.target.value))}
                  className={styles.input}
                  style={{ border: 'none', outline: 'none', background: 'transparent' }}
                >
                  <option value="" disabled>اختر الهدف...</option>
                  <option value={0}>حرف </option>
                  <option value={1}>كلمة </option>
                  <option value={2}>جملة </option>
                </select>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>المدة التقديرية (بالدقائق)</label>
              <div className={styles.inputContainer}>
                <input 
                  type="number" 
                  required 
                  min="1"
                  max="60"
                  value={estimatedDurationMinutes}
                  onChange={(e) => setEstimatedDurationMinutes(Number(e.target.value))}
                  className={styles.input}
                  placeholder="مثال: 10 (من 1 إلى 60 دقيقة)"
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.toggleRow}>
                <input
                  type="checkbox"
                  checked={canMakeSession}
                  onChange={(e) => setCanMakeSession(e.target.checked)}
                  className={styles.checkbox}
                />
                <span>
                  <strong>متاح لبدء جلسة</strong>
                  <span className={styles.toggleHint}>
                    {canMakeSession
                      ? ' يمكن اختيار هذا النشاط عند بدء جلسة جديدة.'
                      : ' النشاط غير متاح لجلسة جديدة.'}
                  </span>
                </span>
              </label>
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