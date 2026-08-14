/**
 * إدارة وتأمين مفتاح الـ Idempotency لمنع التكرار في العمليات المالية
 * يتم حفظ المفتاح في sessionStorage بآمان لضمان بقائه في حالة الـ Refresh وعدم نسيانه
 * ويتم إزالته فور إتمام رابط الدفع بنجاح.
 */
export const getOrCreateIdempotencyKey = (planId: number): string => {
  const storageKey = `nomoai_idempotency_plan_${planId}`;
  let key = sessionStorage.getItem(storageKey);
  if (!key) {
    key = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem(storageKey, key);
  }
  return key;
};

export const clearIdempotencyKey = (planId: number): void => {
  sessionStorage.removeItem(`nomoai_idempotency_plan_${planId}`);
};
