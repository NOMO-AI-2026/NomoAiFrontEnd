import React from 'react';
import { 
  Globe, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  Edit2, 
  Trash2,
  Sparkles
} from 'lucide-react';
import styles from './PlanCard.module.css';
import { type SubscriptionPlan } from '../../types/plan.types';

interface PlanCardProps {
  plan: SubscriptionPlan;
  usdToEgpRate: number;
  variant: 'admin' | 'doctor';
  onEdit?: (plan: SubscriptionPlan) => void;
  onDelete?: (planId: number) => void;
  onSelect?: (plan: SubscriptionPlan) => void;
}

const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  usdToEgpRate,
  variant,
  onEdit,
  onDelete,
  onSelect,
}) => {
  const isDoctor = variant === 'doctor';
  const priceInEgp = (plan.price * usdToEgpRate).toFixed(2);

  // تنسيق الساعات والدقائق
  const formatMinutes = (minutes: number) => {
    const hours = minutes / 60;
    if (hours >= 1) {
      return `${minutes} دقيقة (${hours} ${hours === 1 ? 'ساعة' : hours === 2 ? 'ساعتان' : 'ساعات'})`;
    }
    return `${minutes} دقيقة`;
  };

  return (
    <div className={styles.planCard}>
      <div>
        <div className={styles.cardHeader}>
          <h3 className={styles.planName}>{plan.name}</h3>
          <p className={styles.planDesc}>{plan.description}</p>
        </div>

        {/* قسم الأسعار */}
        <div className={styles.priceSection}>
          {isDoctor ? (
            /* سعر الطبيب: بالجنيه المصري فقط المترجم من الـ API الحالية */
            <div className={styles.doctorPriceRow}>
              <span className={styles.doctorEgpAmount}>{priceInEgp} ج.م</span>
              <span className={styles.doctorEgpLabel}>/ شهرياً</span>
            </div>
          ) : (
            /* سعر الأدمن: بالدولار + الشارة المعادلة بالجنيه */
            <>
              <div className={styles.usdPriceRow}>
                <span className={styles.usdAmount}>${plan.price}</span>
                <span className={styles.usdLabel}>/ شهرياً</span>
              </div>

              <div className={styles.egpPriceRow}>
                <span className={styles.egpLabel}>
                  <Globe size={14} />
                  القيمة المعادلة بالجنيه:
                </span>
                <span className={styles.egpAmount}>
                  ~ {priceInEgp} ج.م
                </span>
              </div>
            </>
          )}
        </div>

        {/* المميزات */}
        <div className={styles.featuresList}>
          <div className={styles.featureItem}>
            <Clock size={18} className={styles.featureIcon} />
            <span>رصيد الجلسات: {formatMinutes(plan.includedMinutes)}</span>
          </div>
          <div className={styles.featureItem}>
            <CheckCircle2 size={18} className={styles.featureIcon} />
            <span>وصول كامل لكافة ألعاب وتحليلات NomoAI</span>
          </div>
          <div className={styles.featureItem}>
            <ShieldCheck size={18} className={styles.featureIcon} />
            <span>متابعة تفاعلية مستمرة من الطبيب المختص</span>
          </div>
        </div>
      </div>

      {/* زراير الإجراءات */}
      {isDoctor ? (
        <button
          className={styles.subscribeBtn}
          onClick={() => {
            if (onSelect) onSelect(plan);
          }}
        >
          <Sparkles size={18} />
          اشترك الآن
        </button>
      ) : (
        <div className={styles.cardActions}>
          <button
            className={styles.actionBtn}
            onClick={() => {
              if (onEdit) onEdit(plan);
            }}
          >
            <Edit2 size={18} />
            تعديل تفاصيل الباقة
          </button>
          <button
            className={styles.deleteActionBtn}
            onClick={() => {
              if (onDelete) onDelete(plan.id);
            }}
            title="حذف الباقة"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PlanCard;
