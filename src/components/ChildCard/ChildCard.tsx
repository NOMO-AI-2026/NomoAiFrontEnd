import { ChevronLeft, Trash2 } from "lucide-react";
import styles from "./ChildCard.module.css";

// شيلنا الحقول الوهمية وضفنا gender بناءً على الداتابيز
interface ChildCardProps {
  id: number;
  name: string;
  age: string | number;
  gender: number; 
  onDelete: (id: number) => void;
}

const ChildCard = ({ id, name, age, gender, onDelete }: ChildCardProps) => {
  return (
    <div className={styles.patientCard}>
      <div className={styles.cardInfo}>
        <div className={styles.avatarWrapper}>
          <div className={styles.patientAvatar}>{name.charAt(0)}</div>
        </div>
        <div className={styles.patientDetails}>
          <h3 className={styles.patientName}>
            {name}
          </h3>
          <div className="flex gap-3 text-sm text-gray-500 font-bold mt-1">
            <p>العمر: {age}</p>
            <span>•</span>
            <p>النوع: {gender === 0 ? 'ذكر' : 'أنثى'}</p> 
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