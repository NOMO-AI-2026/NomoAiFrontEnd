import React, { useState, useEffect } from 'react';
import { X, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './PlanModal.module.css';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { createPlan, updatePlan } from '../../../store/slices/plansSlice';
import { type SubscriptionPlan } from '../../../types/plan.types';

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  planToEdit: SubscriptionPlan | null;
}

const PlanModal: React.FC<PlanModalProps> = ({ isOpen, onClose, planToEdit }) => {
  const dispatch = useAppDispatch();
  const { isActionLoading } = useAppSelector((state) => state.plans);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [includedMinutes, setIncludedMinutes] = useState<number | ''>('');
  const [price, setPrice] = useState<number | ''>('');
  const [errorMsg, setErrorMsg] = useState('');

  const isEditMode = !!planToEdit;

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isOpen) {
      if (planToEdit) {
        setName(planToEdit.name || '');
        setDescription(planToEdit.description || '');
        setIncludedMinutes(planToEdit.includedMinutes || '');
        setPrice(planToEdit.price || '');
      } else {
        setName('');
        setDescription('');
        setIncludedMinutes('');
        setPrice('');
      }
      setErrorMsg('');
    }
  }, [isOpen, planToEdit]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMsg('يرجى أدخال اسم الباقة.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('يرجى أدخال وصف الباقة.');
      return;
    }
    if (includedMinutes === '' || Number(includedMinutes) <= 0) {
      setErrorMsg('يرجى أدخال عدد دقائق صحيح وموجب.');
      return;
    }
    if (price === '' || Number(price) <= 0) {
      setErrorMsg('يرجى أدخال سعر الباقة بالدولار بشكل صحيح.');
      return;
    }

    setErrorMsg('');

    const payload = {
      name: name.trim(),
      description: description.trim(),
      includedMinutes: Number(includedMinutes),
      price: Number(price),
      currency: 0,
    };

    try {
      if (isEditMode && planToEdit) {
        const result = await dispatch(updatePlan({ planId: planToEdit.id, payload }));
        if (updatePlan.fulfilled.match(result)) {
          toast.success('تم تعديل باقة الاشتراك بنجاح!');
          onClose();
        } else {
          setErrorMsg((result.payload as string) || 'حدث خطأ أثناء تعديل الباقة.');
        }
      } else {
        const result = await dispatch(createPlan(payload));
        if (createPlan.fulfilled.match(result)) {
          toast.success('تم إضافة باقة الاشتراك بنجاح!');
          onClose();
        } else {
          setErrorMsg((result.payload as string) || 'حدث خطأ أثناء إضافة الباقة.');
        }
      }
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg('حدث خطأ غير متوقع أثناء معالجة الطلب.');
    }
  };

  return (
    <div className={styles.overlay} dir="rtl">
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerTitles}>
            <h2 className={styles.title}>
              <CreditCard size={22} style={{ color: '#581C87' }} />
              {isEditMode ? 'تعديل باقة الاشتراك' : 'إضافة باقة جديدة'}
            </h2>
            <p className={styles.subtitle}>
              {isEditMode ? 'تحديث تفاصيل وسعر وساعات الباقة الحالية' : 'إدخال بيانات باقة اشتراك جديدة للمنصة'}
            </p>
          </div>
          <button className={styles.closeButton} onClick={onClose} disabled={isActionLoading}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}

          <form onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>اسم الباقة</label>
              <div className={styles.inputContainer}>
                <input
                  type="text"
                  placeholder="مثال: الباقة الأساسية / الاحترافية"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.input}
                  disabled={isActionLoading}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>وصف الباقة</label>
              <div className={styles.inputContainer}>
                <textarea
                  placeholder="اكتب وصفاً مختصراً يشرح محتوى الباقة للجلسات..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={styles.textarea}
                  disabled={isActionLoading}
                  rows={3}
                />
              </div>
            </div>

            <div className={styles.inputRow}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>عدد الدقائق (المضمنة)</label>
                <div className={styles.inputContainer}>
                  <input
                    type="number"
                    placeholder="مثال: 180 (3 ساعات)"
                    value={includedMinutes}
                    onChange={(e) => setIncludedMinutes(e.target.value ? Number(e.target.value) : '')}
                    className={styles.input}
                    disabled={isActionLoading}
                    min="1"
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>السعر ($ بالدولار)</label>
                <div className={styles.inputContainer}>
                  <input
                    type="number"
                    placeholder="مثال: 15"
                    value={price}
                    onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                    className={styles.input}
                    disabled={isActionLoading}
                    min="1"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className={styles.primaryBtn} disabled={isActionLoading}>
              {isActionLoading
                ? 'جاري الحفظ...'
                : isEditMode
                ? 'حفظ التعديلات'
                : 'إضافة الباقة'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PlanModal;
