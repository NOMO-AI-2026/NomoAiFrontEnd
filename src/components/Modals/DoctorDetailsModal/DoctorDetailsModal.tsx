import { X, User, Briefcase, FileCheck, UserCheck, UserX, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import styles from './DoctorDetailsModal.module.css';
import { type AdminDoctorDetails } from '../../../api/adminApi';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  doctor: AdminDoctorDetails | null;
  isLoading: boolean;
  error: string | null;
  onApprove?: (userId: string) => void;
  onReject?: (userId: string) => void;
  onAcceptPendingDocs?: (userId: string) => void;
  onRejectPendingDocs?: (userId: string) => void;
  isActionLoading?: boolean;
}

const DoctorDetailsModal = ({
  isOpen,
  onClose,
  doctor,
  isLoading,
  error,
  onApprove,
  onReject,
  onAcceptPendingDocs,
  onRejectPendingDocs,
  isActionLoading,
}: Props) => {
  if (!isOpen) return null;

  const hasPending = Boolean(
    doctor?.hasPendingDocuments ||
    doctor?.pendingPracticeLicenseUrl ||
    doctor?.pendingSyndicateCardUrl
  );

  return (
    <div className={styles.overlay} dir="rtl">
      <div className={styles.modal}>
        
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitleWrapper}>
            <h3 className={styles.title}>تفاصيل بيانات الطبيب</h3>
            {doctor && (
              <span className={`${styles.badge} ${doctor.isApproved ? styles.badgeApproved : styles.badgePending}`}>
                <span className={styles.dot} style={{ backgroundColor: doctor.isApproved ? '#16A34A' : '#CA8A04' }}></span>
                {doctor.isApproved ? 'مقبول والمعتمد' : 'قيد الانتظار'}
              </span>
            )}
          </div>
          <button className={styles.closeButton} onClick={onClose} type="button" title="إغلاق">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {isLoading ? (
            <div className={styles.loadingState}>جاري تحميل تفاصيل الطبيب ومستندات التحقق...</div>
          ) : error ? (
            <div className={styles.errorState}>{error}</div>
          ) : doctor ? (
            <>
              {/* التنبيه بوجود مستندات جديدة قيد المراجعة */}
              {hasPending && (
                <div className={styles.pendingAlertBadge}>
                  <AlertCircle size={20} />
                  <span>قام الطبيب برفع مستندات مراجعة جديدة تنتظر موافقة أو رفض الأدمن.</span>
                </div>
              )}

              {/* 1. المعلومات الشخصية والأساسية */}
              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>
                  <User size={18} /> البيانات الشخصية والاتصال
                </h4>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>الاسم بالكامل</span>
                    <span className={styles.infoValue}>{doctor.fullName || 'غير محدد'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>البريد الإلكتروني</span>
                    <span className={styles.infoValue} dir="ltr" style={{ display: 'block', textAlign: 'right' }}>
                      {doctor.email}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>رقم الهاتف</span>
                    <span className={styles.infoValue}>{doctor.phoneNumber || 'غير محدد'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>العمر</span>
                    <span className={styles.infoValue}>{doctor.age ? `${doctor.age} سنة` : 'غير محدد'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>النوع</span>
                    <span className={styles.infoValue}>{doctor.gender === 0 ? 'ذكر' : 'أنثى'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>تاريخ التسجيل</span>
                    <span className={styles.infoValue}>
                      {doctor.createdAt ? new Date(doctor.createdAt).toLocaleDateString('ar-EG') : 'غير محدد'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. البيانات المهنية */}
              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>
                  <Briefcase size={18} /> البيانات المهنية والخبرة
                </h4>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>سنوات الخبرة</span>
                    <span className={styles.infoValue}>
                      {doctor.yearsOfExperience !== null && doctor.yearsOfExperience !== undefined
                        ? `${doctor.yearsOfExperience} سنوات`
                        : 'غير محدد'}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>اسم العيادة / المركز الطبي</span>
                    <span className={styles.infoValue}>{doctor.clinicName || 'غير محدد'}</span>
                  </div>
                  <div className={`${styles.infoItem} ${styles.bioText}`}>
                    <span className={styles.infoLabel}>النبذة المهنية</span>
                    <span className={styles.infoValue}>{doctor.professionalBio || 'لا توجد نبذة حالياً'}</span>
                  </div>
                </div>
              </div>

              {/* 3. المستندات المفعلة حالياً */}
              <div className={styles.section}>
                <h4 className={styles.sectionTitle}>
                  <FileCheck size={18} /> وثائق ومستندات التحقق المفعلة حالياً
                </h4>
                <div className={styles.docsGrid}>
                  
                  {/* ترخيص ممارسة المهنة الحالي */}
                  <div className={styles.docCard}>
                    <span className={styles.docTitle}>ترخيص ممارسة المهنة الحالي</span>
                    <div className={styles.docPreviewContainer}>
                      {doctor.practiceLicenseUrl ? (
                        doctor.practiceLicenseUrl.toLowerCase().includes('.pdf') ? (
                          <iframe
                            src={`${doctor.practiceLicenseUrl}#toolbar=0&navpanes=0`}
                            title="ترخيص ممارسة المهنة الحالي"
                            className={styles.docIframe}
                          />
                        ) : (
                          <img
                            src={doctor.practiceLicenseUrl}
                            alt="ترخيص ممارسة المهنة الحالي"
                            className={styles.docImage}
                          />
                        )
                      ) : (
                        <div className={styles.noDocState}>المستند غير متوفر</div>
                      )}
                    </div>
                  </div>

                  {/* كارنيه النقابة الحالي */}
                  <div className={styles.docCard}>
                    <span className={styles.docTitle}>كارنيه النقابة الحالي</span>
                    <div className={styles.docPreviewContainer}>
                      {doctor.syndicateCardUrl ? (
                        doctor.syndicateCardUrl.toLowerCase().includes('.pdf') ? (
                          <iframe
                            src={`${doctor.syndicateCardUrl}#toolbar=0&navpanes=0`}
                            title="كارنيه النقابة الحالي"
                            className={styles.docIframe}
                          />
                        ) : (
                          <img
                            src={doctor.syndicateCardUrl}
                            alt="كارنيه النقابة الحالي"
                            className={styles.docImage}
                          />
                        )
                      ) : (
                        <div className={styles.noDocState}>المستند غير متوفر</div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* 4. المستندات الجديدة (قيد المراجعة والاعتماد) - إن وجدت */}
              {hasPending && (
                <div className={styles.section}>
                  <h4 className={`${styles.sectionTitle} ${styles.pendingSectionHeader}`}>
                    <AlertCircle size={18} /> المستندات الجديدة المرفوعة (قيد المراجعة)
                  </h4>
                  <div className={styles.docsGrid}>
                    
                    {/* ترخيص ممارسة المهنة الجديد */}
                    <div className={styles.docCard}>
                      <span className={styles.docTitle}>ترخيص ممارسة المهنة الجديد (قيد الانتظار)</span>
                      <div className={`${styles.docPreviewContainer} ${styles.pendingPreviewContainer}`}>
                        {doctor.pendingPracticeLicenseUrl ? (
                          doctor.pendingPracticeLicenseUrl.toLowerCase().includes('.pdf') ? (
                            <iframe
                              src={`${doctor.pendingPracticeLicenseUrl}#toolbar=0&navpanes=0`}
                              title="ترخيص ممارسة المهنة الجديد"
                              className={styles.docIframe}
                            />
                          ) : (
                            <img
                              src={doctor.pendingPracticeLicenseUrl}
                              alt="ترخيص ممارسة المهنة الجديد"
                              className={styles.docImage}
                            />
                          )
                        ) : (
                          <div className={styles.noDocState}>لم يتم رفع تعديل لهذا المستند</div>
                        )}
                      </div>
                    </div>

                    {/* كارنيه النقابة الجديد */}
                    <div className={styles.docCard}>
                      <span className={styles.docTitle}>كارنيه النقابة الجديد (قيد الانتظار)</span>
                      <div className={`${styles.docPreviewContainer} ${styles.pendingPreviewContainer}`}>
                        {doctor.pendingSyndicateCardUrl ? (
                          doctor.pendingSyndicateCardUrl.toLowerCase().includes('.pdf') ? (
                            <iframe
                              src={`${doctor.pendingSyndicateCardUrl}#toolbar=0&navpanes=0`}
                              title="كارنيه النقابة الجديد"
                              className={styles.docIframe}
                            />
                          ) : (
                            <img
                              src={doctor.pendingSyndicateCardUrl}
                              alt="كارنيه النقابة الجديد"
                              className={styles.docImage}
                            />
                          )
                        ) : (
                          <div className={styles.noDocState}>لم يتم رفع تعديل لهذا المستند</div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </>
          ) : (
            <div className={styles.noDocState}>لا تتوفر تفاصيل لهذا الطبيب.</div>
          )}
        </div>

        {/* Actions Footer */}
        <div className={styles.actionsRow}>
          {/* أزرار قبول/رفض التحديثات للمستندات المعلقة */}
          {doctor && hasPending && onAcceptPendingDocs && (
            <button
              type="button"
              className={styles.approveBtn}
              disabled={isActionLoading}
              onClick={() => onAcceptPendingDocs(doctor.userId)}
            >
              <CheckCircle2 size={18} /> قبول المستندات الجديدة
            </button>
          )}

          {doctor && hasPending && onRejectPendingDocs && (
            <button
              type="button"
              className={styles.rejectBtn}
              disabled={isActionLoading}
              onClick={() => onRejectPendingDocs(doctor.userId)}
            >
              <XCircle size={18} /> رفض المستندات الجديدة
            </button>
          )}

          {doctor && !doctor.isApproved && onApprove && (
            <button
              type="button"
              className={styles.approveBtn}
              disabled={isActionLoading}
              onClick={() => {
                onApprove(doctor.userId);
                onClose();
              }}
            >
              <UserCheck size={18} /> موافقة واعتماد الطبيب
            </button>
          )}

          {doctor && doctor.isApproved && !hasPending && onReject && (
            <button
              type="button"
              className={styles.rejectBtn}
              disabled={isActionLoading}
              onClick={() => {
                onReject(doctor.userId);
                onClose();
              }}
            >
              <UserX size={18} /> إلغاء الاعتماد
            </button>
          )}

          <button type="button" className={styles.closeModalBtn} onClick={onClose}>
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};

export default DoctorDetailsModal;
