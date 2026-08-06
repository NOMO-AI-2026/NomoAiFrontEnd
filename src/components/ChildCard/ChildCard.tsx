import { Trash2 } from "lucide-react";
import styles from "./ChildCard.module.css";
import UserAvatar from "../UserAvatar/UserAvatar";

interface ChildCardProps {
  id: number;
  name: string;
  age: string | number;
  gender: number;
  speechLevelNumber?: number | null; // 1 to 10
  speechLevelName?: string | null;
  onDelete?: (id: number) => void;
  onView: (id: number) => void;
}

const ChildCard = ({
  id,
  name,
  age,
  gender,
  speechLevelNumber,
  speechLevelName,
  onDelete,
  onView,
}: ChildCardProps) => {
  const hasLevel = speechLevelNumber !== undefined && speechLevelNumber !== null && speechLevelNumber > 0;
  const currentLevel = hasLevel ? Math.min(Math.max(speechLevelNumber, 1), 10) : 0;
  const percentage = hasLevel ? (currentLevel / 10) * 100 : 0;

  return (
    <div
      className={styles.patientRowCard}
      onClick={() => onView(id)}
    >
      {/* الجزء الأيمن: الأفاتار بخلفية بيضاء والاسم والسن والنوع */}
      <div className={styles.infoSection}>
        <div className={styles.avatarWrapper}>
          <div className={styles.patientAvatar}>
            <UserAvatar type="child" gender={gender} size={36} />
          </div>
        </div>
        <div className={styles.patientDetails}>
          <h3 className={styles.patientName}>{name}</h3>
          <div className={styles.metaRow}>
            <span className={styles.metaText}>العمر: {age}</span>
            <span className={styles.bullet}>•</span>
            <span className={styles.metaText}>
              النوع: {gender === 0 ? "ذكر" : "أنثى"}
            </span>
          </div>
        </div>
      </div>

      {/* الجزء الأيسر: الـ Progress Bar الحقيقي للطفل والزرار */}
      <div className={styles.leftSideWrapper}>
        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <span className={styles.progressTitle}>مستوى الكلام الحالي</span>
            <span className={styles.progressBadge}>
              {hasLevel
                ? (speechLevelName || `المستوى ${currentLevel} من 10`)
                : 'لم يتم تحديد مستوى'}
            </span>
          </div>
          <div className={styles.progressBarTrack}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {onDelete && (
          <div className={styles.actionsSection}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(id);
              }}
              className={styles.deleteBtn}
              title="حذف الطفل"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildCard;