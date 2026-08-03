import React, { useEffect, useState } from 'react';
import { X, Mail, User, Shield, Calendar, CheckCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { getTicketDetails, respondToTicket, clearSelectedTicket } from '../../../store/slices/supportTicketsSlice';
import toast from 'react-hot-toast';
import styles from './TicketDetailsModal.module.css';

interface TicketDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: number | null;
  onActionSuccess: () => void;
}

const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({
  isOpen,
  onClose,
  ticketId,
  onActionSuccess,
}) => {
  const dispatch = useAppDispatch();
  const { selectedTicket, detailsLoading, actionLoading } = useAppSelector(
    (state) => state.supportTickets
  );

  const [status, setStatus] = useState<number>(0);
  const [adminNote, setAdminNote] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // دمجنا الشغل كله في useEffect واحد ومفيش أي إيرورز هتطلع
  useEffect(() => {
    if (isOpen && ticketId !== null) {
      dispatch(getTicketDetails(ticketId)).then((action) => {
        // لو الريكويست نجح وجاب الداتا، نحدث الـ Local State فوراً
        if (getTicketDetails.fulfilled.match(action)) {
          const ticket = action.payload; // دي الداتا اللي راجعة من الباك إند
          
          // نمنع حالة الصفر زي ما اتفقنا
          setStatus(ticket.status === 0 ? 1 : ticket.status);
          setAdminNote(ticket.adminNote || '');
          setErrorMsg('');
        }
      });
    }

    // التنظيف لما المودال يتقفل
    return () => {
      dispatch(clearSelectedTicket());
      setStatus(0);
      setAdminNote('');
      setErrorMsg('');
    };
  }, [dispatch, isOpen, ticketId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ticketId === null) return;

    setErrorMsg('');
    try {
      const resultAction = await dispatch(
        respondToTicket({
          id: ticketId,
          status,
          adminNote: adminNote.trim() || undefined,
        })
      );

      if (respondToTicket.fulfilled.match(resultAction)) {
        toast.success('تم تحديث التذكرة بنجاح!');
        onActionSuccess();
        onClose();
      } else {
        const error = resultAction.payload as string;
        setErrorMsg(error || 'حدث خطأ أثناء حفظ التعديلات.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('حدث خطأ غير متوقع أثناء محاولة الإرسال.');
    }
  };

  const getStatusLabel = (statusVal: number) => {
    switch (statusVal) {
      case 0:
        return { label: 'غير مقروءة', color: '#EF4444' };
      case 1:
        return { label: 'قيد المعالجة', color: '#F59E0B' };
      case 2:
        return { label: 'تم الحل', color: '#3B82F6' };
      case 3:
        return { label: 'مغلقة', color: '#10B981' };
      default:
        return { label: 'غير محدد', color: '#6B7280' };
    }
  };

  const statusInfo = selectedTicket ? getStatusLabel(selectedTicket.status) : { label: 'جاري التحميل', color: '#6B7280' };

  return (
    <div className={styles.overlay} dir="rtl">
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            <Shield className="inline-block ml-2 mb-1" size={24} style={{ color: '#581C87' }} />
            تفاصيل تذكرة الدعم الفني #{ticketId}
          </h2>
          <button onClick={onClose} disabled={detailsLoading || actionLoading} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          {detailsLoading ? (
            <div className={styles.loadingSpinner}>
              <div className={styles.spinner}></div>
              <p>جاري تحميل تفاصيل التذكرة...</p>
            </div>
          ) : !selectedTicket ? (
            <div className={styles.errorMsg}>فشل في جلب بيانات التذكرة. الرجاء المحاولة مرة أخرى.</div>
          ) : (
            <div className={styles.ticketBody}>
              {/* بيانات المرسل */}
              <div className={styles.senderSection}>
                <div className={styles.senderItem}>
                  <User size={16} />
                  <span>المرسل: <strong>{selectedTicket.userFullName}</strong></span>
                  <span className={styles.roleBadge}>
                    {selectedTicket.userRole === 'Doctor' ? 'طبيب' : 'ولي أمر'}
                  </span>
                </div>
                <div className={styles.senderItem}>
                  <Mail size={16} />
                  <span>البريد الإلكتروني: <a href={`mailto:${selectedTicket.userEmail}`}>{selectedTicket.userEmail}</a></span>
                </div>
                <div className={styles.senderItem}>
                  <Calendar size={16} />
                  <span>تاريخ الإرسال: {new Date(selectedTicket.createdAt).toLocaleString('ar-EG')}</span>
                </div>
                {selectedTicket.handledAt && (
                  <div className={styles.senderItem} style={{ color: '#10B981' }}>
                    <CheckCircle size={16} />
                    <span>تم الرد في: {new Date(selectedTicket.handledAt).toLocaleString('ar-EG')}</span>
                  </div>
                )}
              </div>

              {/* عنوان وتفاصيل الرسالة */}
              <div className={styles.messageBox}>
                <h4 className={styles.subjectText}>{selectedTicket.subject}</h4>
                <p className={styles.messageText}>{selectedTicket.message}</p>
              </div>

              {/* ملاحظة الأدمن الحالية */}
              {selectedTicket.adminNote && (
                <div className={styles.adminNoteBox}>
                  <h4 className={styles.adminNoteTitle}>ملاحظة المسؤول الحالية:</h4>
                  <p className={styles.adminNoteText}>{selectedTicket.adminNote}</p>
                </div>
              )}

              {/* شريط الحالة الحالي */}
              <div className={styles.statusDisplay}>
                <span>الحالة الحالية: </span>
                <span 
                  className={styles.statusBadge} 
                  style={{ 
                    color: statusInfo.color, 
                    backgroundColor: `${statusInfo.color}15`, 
                    border: `1px solid ${statusInfo.color}40` 
                  }}
                >
                  <span className={styles.statusDot} style={{ backgroundColor: statusInfo.color }}></span>
                  {statusInfo.label}
                </span>
              </div>

              {/* نموذج الرد وتعديل الحالة */}
              <form onSubmit={handleSubmit} className={styles.actionForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="ticket-status" className={styles.formLabel}>تغيير حالة التذكرة</label>
                  <select 
                    id="ticket-status" 
                    value={status} 
                    onChange={(e) => setStatus(Number(e.target.value))}
                    className={styles.formSelect}
                    disabled={selectedTicket.status === 3}
                  >
                    <option value={1}>قيد المعالجة </option>
                    <option value={2}>تم الحل</option>
                    <option value={3}>مغلقة</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="admin-reply" className={styles.formLabel}> ملاحظة المسؤول</label>
                  <textarea 
                    id="admin-reply" 
                    value={adminNote} 
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="اكتب ردك أو ملاحظاتك هنا..."
                    rows={4}
                    className={styles.formTextarea}
                    disabled={selectedTicket.status === 3}
                  />
                </div>

                {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}

                <div className={styles.actions}>
                  {selectedTicket.status !== 3 && (
                    <button 
                      type="submit" 
                      disabled={actionLoading}
                      className={styles.submitBtn}
                    >
                      {actionLoading ? 'جاري الحفظ...' : 'حفظ الإجراء'}
                    </button>
                  )}
                  <button 
                    type="button" 
                    onClick={onClose} 
                    disabled={actionLoading}
                    className={styles.cancelBtn}
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsModal;