import { ChevronLeft, Trash2 } from "lucide-react";
import styles from "./ChildCard.module.css";

interface ChildCardProps {
  id: number;
  name: string;
  age: string;
  status: string;
  lastSession: string;
  onDelete: (id: number) => void;
}

const ChildCard = ({ id, name, status, lastSession, onDelete }: ChildCardProps) => {
  return (
    <div className={styles.patientCard}>
      <div className={styles.cardInfo}>
        <div className={styles.avatarWrapper}>
          <div className={styles.patientAvatar}>{name.charAt(0)}</div>
        </div>
        <div className={styles.patientDetails}>
          <h3 className={styles.patientName}>{name}</h3>
          <p className={styles.patientSession}>آخر جلسة: {lastSession}</p>
          <div className={styles.statusWrapper}>
            <span className={status === 'نشط' ? styles.statusDotActive : styles.statusDotDelayed}></span>
            <span className={status === 'نشط' ? styles.statusTextActive : styles.statusTextDelayed}>
              {status === 'نشط' ? 'تحسن مستمر' : 'تأخر في التدريب'}
            </span>
          </div>
        </div>
      </div>
      
      <div className={styles.cardActions}>
        <button className={styles.viewBtn} title="عرض التفاصيل">
          <ChevronLeft size={20} />
        </button>
        <button onClick={() => onDelete(id)} className={styles.deleteBtn} title="حذف الطفل">
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChildCard;