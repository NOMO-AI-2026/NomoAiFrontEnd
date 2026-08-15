import { useState } from 'react';
import { X, UploadCloud, Trash2, FileCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './UpdateDoctorDocumentsModal.module.css';
import { updateDoctorDocumentsApi } from '../../../api/profileApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const UpdateDoctorDocumentsModal = ({ isOpen, onClose, onSuccess }: Props) => {
  const [practiceLicense, setPracticeLicense] = useState<File | null>(null);
  const [syndicateCard, setSyndicateCard] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ practiceLicense?: string; syndicateCard?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validateFile = (file: File | null) => {
    if (!file) return 'هذا الملف مطلوب';
    if (file.size > 5 * 1024 * 1024) return 'حجم الملف يجب ألا يتجاوز 5 ميجابايت';
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const licenseErr = validateFile(practiceLicense);
    const syndicateErr = validateFile(syndicateCard);

    if (licenseErr || syndicateErr) {
      setErrors({ practiceLicense: licenseErr, syndicateCard: syndicateErr });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (practiceLicense) formData.append('practiceLicense', practiceLicense);
      if (syndicateCard) formData.append('syndicateCard', syndicateCard);

      await updateDoctorDocumentsApi(formData);
      toast.success('تم تقديم المستندات الجديدة بنجاح وهي قيد المراجعة حالياً!');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { description?: string }; message?: string } }; message?: string };
      console.error('Error updating doctor documents:', error);
      const msg = error.response?.data?.error?.description || error.response?.data?.message || error.message || 'حدث خطأ أثناء رفع المستندات';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.overlay} dir="rtl">
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>تحديث مستندات التحقق للطبيب</h3>
          <button className={styles.closeButton} onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <p className={styles.subtitle}>
            يرجى رفع النسخ الجديدة من ترخيص ممارسة المهنة وكارنيه النقابة (PDF أو صورة بحجم أقصى 5 ميجابايت لكل ملف). ستظل مستنداتك المفعلة الحالية قائمة حتى يوافق الأدمن على التحديثات.
          </p>

          {/* ترخيص ممارسة المهنة */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>ترخيص ممارسة المهنة الجديد *</label>
            {practiceLicense ? (
              <div className={styles.fileBadge}>
                <span className="flex items-center gap-1.5 truncate">
                  <FileCheck size={16} /> {practiceLicense.name} ({(practiceLicense.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
                <button type="button" className={styles.removeFileBtn} onClick={() => setPracticeLicense(null)}>
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <label className={styles.fileDropzone}>
                <UploadCloud size={24} className="text-[#581C87]" />
                <span className={styles.dropzoneText}>اضغط لرفع ترخيص ممارسة المهنة الجديد</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  className={styles.hiddenInput}
                  onChange={(e) => {
                    if (e.target.files?.[0]) setPracticeLicense(e.target.files[0]);
                  }}
                />
              </label>
            )}
            {errors.practiceLicense && <span className={styles.errorText}>{errors.practiceLicense}</span>}
          </div>

          {/* كارنيه النقابة */}
          <div className={styles.fieldGroup}>
            <label className={styles.label}>كارنيه النقابة الجديد *</label>
            {syndicateCard ? (
              <div className={styles.fileBadge}>
                <span className="flex items-center gap-1.5 truncate">
                  <FileCheck size={16} /> {syndicateCard.name} ({(syndicateCard.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
                <button type="button" className={styles.removeFileBtn} onClick={() => setSyndicateCard(null)}>
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <label className={styles.fileDropzone}>
                <UploadCloud size={24} className="text-[#581C87]" />
                <span className={styles.dropzoneText}>اضغط لرفع كارنيه النقابة الجديد</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  className={styles.hiddenInput}
                  onChange={(e) => {
                    if (e.target.files?.[0]) setSyndicateCard(e.target.files[0]);
                  }}
                />
              </label>
            )}
            {errors.syndicateCard && <span className={styles.errorText}>{errors.syndicateCard}</span>}
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? 'جاري الرفع والتقديم...' : 'إرسال المستندات للمراجعة'}
            </button>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateDoctorDocumentsModal;
