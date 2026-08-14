import React, { useEffect, useState } from 'react';
import { X, CreditCard, ShieldCheck, ExternalLink, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './PaymentModal.module.css';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchPaymentMethods, createQuickLink, resetPaymentState } from '../../../store/slices/paymentSlice';
import { type SubscriptionPlan } from '../../../types/plan.types';
import { getOrCreateIdempotencyKey } from '../../../utils/idempotency/idempotency';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
  usdToEgpRate: number;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  plan,
  usdToEgpRate,
}) => {
  const dispatch = useAppDispatch();
  const { paymentMethods, isLoadingMethods, isCreatingLink, error } = useAppSelector(
    (state) => state.payment
  );

  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [localError, setLocalError] = useState<string>('');

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isOpen) {
      dispatch(resetPaymentState());
      dispatch(fetchPaymentMethods());
      setLocalError('');
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (paymentMethods && paymentMethods.length > 0 && !selectedMethodId) {
      setSelectedMethodId(paymentMethods[0].id);
    }
  }, [paymentMethods, selectedMethodId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!isOpen || !plan) return null;

  const priceInEgp = Math.round(plan.price * usdToEgpRate);

  const handleProceedToPayment = async () => {
    if (!selectedMethodId) {
      setLocalError('يرجى اختيار طريقة دفع للمتابعة.');
      return;
    }

    setLocalError('');

    // الحصول على مفتاح Idempotency آمن ومحفوظ في الكاش المحلي (sessionStorage)
    const idempotencyKey = getOrCreateIdempotencyKey(plan.id);

    const payload = {
      paymentMethodId: selectedMethodId,
      planId: plan.id,
      idempotency: idempotencyKey,
      priceInEGP: priceInEgp,
    };

    try {
      const result = await dispatch(createQuickLink(payload));
      if (createQuickLink.fulfilled.match(result)) {
        const linkData = result.payload;
        const targetUrl = linkData.clientUrl || linkData.shortUrl;

        if (targetUrl) {
          toast.success('تم إعداد رابط الدفع بنجاح، جاري توجيهك...');
          onClose();
          // توجيه المستشار / الطبيب مباشرة لصفحة الدفع الآمنة
          window.location.href = targetUrl;
        } else {
          setLocalError('فشل الحصول على رابط بوابة الدفع.');
        }
      } else {
        setLocalError((result.payload as string) || 'حدث خطأ أثناء الاتصال ببوابة الدفع.');
      }
    } catch (err: unknown) {
      console.error(err);
      setLocalError('حدث خطأ غير متوقع أثناء إعداد طلب الدفع.');
    }
  };

  return (
    <div className={styles.overlay} dir="rtl">
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerTitles}>
            <h2 className={styles.title}>
              <CreditCard size={22} style={{ color: '#581C87' }} />
              اختيار طريقة الدفع
            </h2>
            <p className={styles.subtitle}>
              اختر الوسيلة المناسبة لك لإتمام اشتراك باقة "{plan.name}"
            </p>
          </div>
          <button className={styles.closeButton} onClick={onClose} disabled={isCreatingLink}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          {/* ملخص الباقة والسعر */}
          <div className={styles.planSummaryBox}>
            <div className={styles.planSummaryInfo}>
              <h4>{plan.name}</h4>
              <p>رصيد الجلسات: {plan.includedMinutes} دقيقة</p>
            </div>
            <div className={styles.planPriceBadge}>
              {priceInEgp} ج.م
            </div>
          </div>

          {(localError || error) && (
            <div className={styles.errorMsg}>{localError || error}</div>
          )}

          <h3 className={styles.methodsTitle}>طرق الدفع المتاحة:</h3>

          {isLoadingMethods ? (
            <div className="flex justify-center items-center py-8 gap-3 text-[#581C87] font-bold">
              <Loader2 className="animate-spin" size={24} />
              جاري تحميل طرق الدفع...
            </div>
          ) : (
            <div className={styles.methodsGrid}>
              {paymentMethods && paymentMethods.length > 0 ? (
                paymentMethods.map((method) => {
                  const isSelected = selectedMethodId === method.id;

                  return (
                    <div
                      key={method.id}
                      className={`${styles.methodCard} ${isSelected ? styles.selectedMethod : ''}`}
                      onClick={() => setSelectedMethodId(method.id)}
                    >
                      <div className={styles.methodLeft}>
                        <div className={styles.methodIcon}>
                          <CreditCard size={22} />
                        </div>
                        <span className={styles.methodName}>
                          {method.name === 'Online Card' ? 'البطاقة البنكية (فيزا / ماستركارد)' : method.name}
                        </span>
                      </div>

                      <div className={`${styles.radioCircle} ${isSelected ? styles.selectedRadio : ''}`}>
                        {isSelected && <div className={styles.radioDot} />}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-gray-500 font-bold bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  لا يوجد طرق دفع متاحة حالياً.
                </div>
              )}
            </div>
          )}

          <button
            className={styles.primaryBtn}
            onClick={handleProceedToPayment}
            disabled={isCreatingLink || isLoadingMethods || paymentMethods.length === 0}
          >
            {isCreatingLink ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                جاري إعداد بوابة الدفع...
              </>
            ) : (
              <>
                <ShieldCheck size={20} />
                متابعة عملية الدفع الآمنة
                <ExternalLink size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
