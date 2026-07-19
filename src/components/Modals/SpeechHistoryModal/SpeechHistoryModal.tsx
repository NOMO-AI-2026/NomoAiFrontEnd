import { X, ArrowLeft } from 'lucide-react';
import { useAppSelector } from '../../../store/hooks';
import styles from './SpeechHistoryModal.module.css';

interface SpeechHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SpeechHistoryModal = ({ isOpen, onClose }: SpeechHistoryModalProps) => {
  const { speechHistory, isHistoryLoading, historyError } = useAppSelector((state) => state.childProfile);

  if (!isOpen) return null;

  // إغلاق المودال عند الضغط على الخلفية الشفافة
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick} dir="rtl">
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>سجل مستويات الكلام</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          {isHistoryLoading && <div className="text-center font-bold text-[#581C87] py-8">جاري التحميل...</div>}
          
          {historyError && <div className="text-center font-bold text-red-500 py-8">{historyError}</div>}
          
          {!isHistoryLoading && speechHistory?.items && speechHistory.items.length === 0 && (
            <div className="text-center font-bold text-gray-500 py-8">لا يوجد سجل لتغيير المستويات حتى الآن.</div>
          )}

          {!isHistoryLoading && speechHistory?.items && speechHistory.items.map((item) => (
            <div key={item.id} className={styles.historyItem}>
              <div className={styles.historyDate}>{formatDate(item.changedAt)}</div>
              
              <div className={styles.levelChange}>
                <span className={styles.oldLevel}>{item.previousSpeechLevelName}</span>
                <ArrowLeft size={18} className="text-[#581C87]" />
                <span className={styles.newLevel}>{item.newSpeechLevelName}</span>
              </div>
              
              {item.changeReasons && (
                <div className={styles.reason}>
                  <strong>السبب:</strong> {item.changeReasons}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpeechHistoryModal;