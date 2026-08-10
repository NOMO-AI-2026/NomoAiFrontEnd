import { useEffect, useState } from 'react';
import { 
  CreditCard, 
  Globe, 
  RefreshCw,
  PlusCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchPlansAndRate, deletePlan } from '../../../store/slices/plansSlice';
import PlanModal from '../../../components/Modals/PlanModal/PlanModal';
import DeleteConfirmModal from '../../../components/Modals/DeleteConfirmModal/DeleteConfirmModal';
import PlanCard from '../../../components/PlanCard/PlanCard';
import { type SubscriptionPlan } from '../../../types/plan.types';
import styles from './AdminSubscriptions.module.css';

const AdminSubscriptions = () => {
  const dispatch = useAppDispatch();
  const { plans, usdToEgpRate, isLoading, error } = useAppSelector((state) => state.plans);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlanToEdit, setSelectedPlanToEdit] = useState<SubscriptionPlan | null>(null);
  const [planToDeleteId, setPlanToDeleteId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchPlansAndRate());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchPlansAndRate());
  };

  const handleOpenAddModal = () => {
    setSelectedPlanToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (plan: SubscriptionPlan) => {
    setSelectedPlanToEdit(plan);
    setIsModalOpen(true);
  };

  return (
    <div className={styles.pageContent} dir="rtl">
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            <CreditCard size={28} style={{ color: '#581C87' }} />
            خطط الاشتراكات والباقات
          </h1>
          <p className={styles.pageSubtitle}>
            إدارة واستعراض باقات الاشتراكات المتاحة في المنصة.
          </p>
        </div>

        <button className={styles.addBtn} onClick={handleOpenAddModal}>
          <PlusCircle size={20} />
          إضافة باقة جديدة
        </button>
      </div>

      {/* بنر سعر الصرف المباشر من الـ API الخارجية */}
      <div className={styles.rateBanner}>
        <div className={styles.rateInfo}>
          <div className={styles.rateIcon}>
            <Globe size={22} />
          </div>
          <div>
            <div className={styles.rateText}>سعر الصرف المباشر</div>
            <span className="text-xs font-bold text-gray-500">يتم التحديث تلقائياً لحساب القيم بالجنيه المصري بدقة</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={styles.rateBadge}>
            <span>1 USD = {usdToEgpRate.toFixed(2)} EGP</span>
          </div>
          <button 
            onClick={handleRefresh} 
            className="p-2.5 bg-white border border-purple-200 rounded-full text-[#581C87] hover:bg-[#F3EFFE] transition-all cursor-pointer"
            title="تحديث سعر الصرف والباقات"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[40vh] w-full bg-[#F8F7FF]">
          <div className="text-xl font-extrabold text-[#6C34AF]">جاري تحميل الباقات وسعر الصرف...</div>
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
                variant="admin"
                onEdit={handleOpenEditModal}
                onDelete={(id) => setPlanToDeleteId(id)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500 font-bold bg-white rounded-2xl border border-dashed border-gray-300">
              لا يوجد باقات اشتراك مضافة حالياً.
            </div>
          )}
        </div>
      )}

      {/* مودال الإضافة والتعديل */}
      <PlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        planToEdit={selectedPlanToEdit}
      />

      {/* مودال تأكيد الحذف المشترك */}
      <DeleteConfirmModal
        isOpen={planToDeleteId !== null}
        onClose={() => setPlanToDeleteId(null)}
        onConfirm={async () => {
          if (planToDeleteId !== null) {
            const result = await dispatch(deletePlan(planToDeleteId));
            if (deletePlan.fulfilled.match(result)) {
              toast.success('تم حذف باقة الاشتراك بنجاح!');
            }
          }
        }}
        title="تأكيد حذف باقة الاشتراك"
        message="هل أنت متأكد من رغبتك في حذف هذه الباقة من السجل نهائياً؟ لا يمكن التراجع عن هذا الإجراء."
        deleteBtnText="نعم، احذف الباقة"
      />
    </div>
  );
};

export default AdminSubscriptions;
