import { useEffect, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchPlansAndRate } from '../../store/slices/plansSlice';
import PlanCard from '../../components/PlanCard/PlanCard';
import PaymentModal from '../../components/Modals/PaymentModal/PaymentModal';
import { type SubscriptionPlan } from '../../types/plan.types';
import styles from './DoctorSubscriptions.module.css';

const DoctorSubscriptions = () => {
  const dispatch = useAppDispatch();
  const { plans, usdToEgpRate, isLoading, error } = useAppSelector((state) => state.plans);

  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<SubscriptionPlan | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchPlansAndRate());
  }, [dispatch]);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlanForPayment(plan);
    setIsPaymentModalOpen(true);
  };

  return (
    <div className={styles.pageContent} dir="rtl">
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            <CreditCard size={28} style={{ color: '#581C87' }} />
            باقات الاشتراكات
          </h1>
          <p className={styles.pageSubtitle}>
            اختر الباقة المناسبة للبدء في تنظيم وإدارة جلسات التخاطب بكل سهولة.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[40vh] w-full bg-[#F8F7FF]">
          <div className="text-xl font-extrabold text-[#6C34AF]">جاري تحميل باقات الاشتراكات...</div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center min-h-[40vh] w-full bg-[#F8F7FF]">
          <div className="text-xl font-bold text-red-500">{error}</div>
        </div>
      ) : (
        <div className={styles.plansGrid}>
          {plans && plans.length > 0 ? (
            plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                usdToEgpRate={usdToEgpRate}
                variant="doctor"
                onSelect={handleSelectPlan}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500 font-bold bg-white rounded-2xl border border-dashed border-gray-300">
              لا يوجد باقات اشتراك متاحة حالياً.
            </div>
          )}
        </div>
      )}

      {/* مودال اختيار طريقة الدفع والدفع المباشر */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedPlanForPayment(null);
        }}
        plan={selectedPlanForPayment}
        usdToEgpRate={usdToEgpRate}
      />
    </div>
  );
};

export default DoctorSubscriptions;
