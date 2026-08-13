import { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';
import styles from './SessionReviewModal.module.css';

interface SessionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { rating: number; comment: string; repeatSession: boolean }) => Promise<void>;
  initialData?: { rating: number; comment: string; repeatSession?: boolean } | null;
  sessionTitle: string;
}

const SessionReviewModal = ({ isOpen, onClose, onSubmit, initialData, sessionTitle }: SessionReviewModalProps) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [repeatSession, setRepeatSession] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setRating(initialData.rating || 0);
        setComment(initialData.comment || '');
        setRepeatSession(initialData.repeatSession || false);
      } else {
        setRating(0);
        setComment('');
        setRepeatSession(false);
      }
      setError('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('يرجى تحديد التقييم بالنجوم أولاً');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await onSubmit({ rating, comment, repeatSession });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء حفظ التقييم');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>تقييم الجلسة: {sessionTitle}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.errorMsg}>{error}</div>}

          <div className={styles.formGroup}>
            <label className={styles.label}>التقييم</label>
            <div className={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`${styles.starBtn} ${(hoverRating || rating) >= star ? styles.starFilled : ''}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <Star size={32} fill={(hoverRating || rating) >= star ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>التعليق (ملاحظات للطبيب وولي الأمر)</label>
            <textarea
              className={styles.textarea}
              placeholder="اكتب تعليقك هنا..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className={styles.checkboxContainer}>
            <input
              type="checkbox"
              id="repeatSession"
              checked={repeatSession}
              onChange={(e) => setRepeatSession(e.target.checked)}
            />
            <label htmlFor="repeatSession" className={styles.checkboxLabel}>
              أوصي بإعادة هذه الجلسة للطفل
            </label>
          </div>

          <div className={styles.footer}>
            <button type="submit" className={styles.saveBtn} disabled={isSubmitting}>
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ التقييم'}
            </button>
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isSubmitting}>
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionReviewModal;
